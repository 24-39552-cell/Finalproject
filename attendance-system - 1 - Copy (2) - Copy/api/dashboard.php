<?php
/**
 * dashboard.php — Real stats for dashboard cards and charts.
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$is_admin = $user['role'] === 'Administrator';
$uid  = (int)$user['id'];

$today = date('Y-m-d');

// Teacher: limit to assigned section
$sec_id = null;
$student_ids = [];
$student_id_ph = '';
$student_id_types = '';

if (!$is_admin) {
    $stmt = $db->prepare("SELECT section_id FROM teacher_sections WHERE user_id=? LIMIT 1");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $sec_id = $r ? (int)$r['section_id'] : null;

    if ($sec_id) {
        $res = $db->query("SELECT id FROM students WHERE section_id=$sec_id AND is_active=1");
        while ($rr = $res->fetch_assoc()) $student_ids[] = (int)$rr['id'];
    }
    if (empty($student_ids)) {
        json_out([
            'total_students' => 0, 'total_teachers' => 0,
            'present_today' => 0, 'late_today' => 0, 'absent_today' => 0, 'excused_today' => 0,
            'not_scanned_today' => 0,
            'face_registered' => 0, 'fp_registered' => 0,
            'recent_attendance' => [], 'recent_logs' => [],
            'attendance_chart' => [], 'devices' => [],
            'schedule' => ['start_time'=>'07:30:00','late_after'=>'07:45:00'],
        ]);
    }
    $student_id_ph    = implode(',', array_fill(0, count($student_ids), '?'));
    $student_id_types = str_repeat('i', count($student_ids));
}

// Total students (active)
if ($is_admin) {
    $total_stu = (int)$db->query("SELECT COUNT(*) AS c FROM students WHERE is_active=1")->fetch_assoc()['c'];
} else {
    $total_stu = count($student_ids);
}

// Total teachers (admin only)
$total_tea = $is_admin
    ? (int)$db->query("SELECT COUNT(*) AS c FROM users WHERE role='Teacher' AND is_active=1")->fetch_assoc()['c']
    : 0;

// Today's attendance counts
function today_count(mysqli $db, string $status, string $today, bool $is_admin, array $ids, string $ph, string $types): int {
    if ($is_admin) {
        return (int)$db->query("SELECT COUNT(*) AS c FROM attendance WHERE date='$today' AND status='$status'")->fetch_assoc()['c'];
    }
    if (empty($ids)) return 0;
    $stmt = $db->prepare("SELECT COUNT(*) AS c FROM attendance WHERE date=? AND status=? AND student_id IN ($ph)");
    $tmp = array_merge([$today, $status], $ids);
    $stmt->bind_param('ss'.$types, ...$tmp);
    $stmt->execute();
    $c = (int)$stmt->get_result()->fetch_assoc()['c'];
    $stmt->close();
    return $c;
}

$present = today_count($db, 'Present', $today, $is_admin, $student_ids, $student_id_ph, $student_id_types);
$late    = today_count($db, 'Late',    $today, $is_admin, $student_ids, $student_id_ph, $student_id_types);
$absent  = today_count($db, 'Absent',  $today, $is_admin, $student_ids, $student_id_ph, $student_id_types);
$excused = today_count($db, 'Excused', $today, $is_admin, $student_ids, $student_id_ph, $student_id_types);

$not_scanned = max(0, $total_stu - $present - $late - $absent - $excused);

// Biometric stats
if ($is_admin) {
    $bio = $db->query("SELECT SUM(face_registered) AS face, SUM(fingerprint_registered) AS fp FROM students WHERE is_active=1")->fetch_assoc();
} else {
    if (empty($student_ids)) {
        $bio = ['face'=>0,'fp'=>0];
    } else {
        $stmt = $db->prepare("SELECT SUM(face_registered) AS face, SUM(fingerprint_registered) AS fp FROM students WHERE id IN ($student_id_ph)");
        $stmt->bind_param($student_id_types, ...$student_ids);
        $stmt->execute();
        $bio = $stmt->get_result()->fetch_assoc();
        $stmt->close();
    }
}

// Recent attendance (today, biometric only)
$recent_sql = "SELECT a.time_in, a.status, a.method, d.device_code, st.full_name AS student_name
               FROM attendance a
               JOIN students st ON st.id=a.student_id
               LEFT JOIN devices d ON d.id=a.device_id
               WHERE a.date='" . $today . "' AND a.method != 'Manual'";
if (!$is_admin && !empty($student_ids)) {
    $recent_sql .= " AND a.student_id IN ($student_id_ph)";
}
$recent_sql .= " ORDER BY a.time_in DESC LIMIT 10";

if (!$is_admin && !empty($student_ids)) {
    $stmt = $db->prepare($recent_sql);
    $stmt->bind_param($student_id_types, ...$student_ids);
    $stmt->execute();
    $res = $stmt->get_result();
} else {
    $res = $db->query($recent_sql);
}
$recent_att = [];
while ($r = $res->fetch_assoc()) $recent_att[] = $r;

// Attendance chart - last 7 school days
$chart_data = [];
$day_offset = 0;
$days_collected = 0;
while ($days_collected < 7 && $day_offset < 30) {
    $d = date('Y-m-d', strtotime("-$day_offset days"));
    $dow = (int)date('N', strtotime($d)); // 1=Mon,7=Sun
    if ($dow < 6) { // Mon-Fri
        if ($is_admin) {
            $row = $db->query("SELECT SUM(status='Present') AS p, SUM(status='Late') AS l, COUNT(*) AS total
                               FROM attendance WHERE date='$d'")->fetch_assoc();
        } else {
            if (!empty($student_ids)) {
                $stmt = $db->prepare("SELECT SUM(status='Present') AS p, SUM(status='Late') AS l, COUNT(*) AS total FROM attendance WHERE date=? AND student_id IN ($student_id_ph)");
                $tmp = array_merge([$d], $student_ids);
                $stmt->bind_param('s'.$student_id_types, ...$tmp);
                $stmt->execute();
                $row = $stmt->get_result()->fetch_assoc();
                $stmt->close();
            } else {
                $row = ['p'=>0,'l'=>0,'total'=>0];
            }
        }
        $chart_data[] = [
            'date' => $d,
            'present' => (int)$row['p'],
            'late'    => (int)$row['l'],
            'total'   => $total_stu,
        ];
        $days_collected++;
    }
    $day_offset++;
}
$chart_data = array_reverse($chart_data);

// Devices (admin only)
$devices = [];
if ($is_admin) {
    $res = $db->query("SELECT id, device_code, name, location, status, last_seen FROM devices ORDER BY name");
    while ($r = $res->fetch_assoc()) {
        // Auto-offline devices not seen in 5 minutes
        if ($r['status'] === 'Online' && $r['last_seen'] && strtotime($r['last_seen']) < time() - 300) {
            $did = $r['id'];
            $db->query("UPDATE devices SET status='Offline' WHERE id=$did");
            $r['status'] = 'Offline';
        }
        $devices[] = $r;
    }
}

// Recent logs (admin only, or teacher's own actions)
$logs = [];
if ($is_admin) {
    $res = $db->query("SELECT user_label, action, details, result, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 10");
    while ($r = $res->fetch_assoc()) $logs[] = $r;
} else {
    $stmt = $db->prepare("SELECT user_label, action, details, result, created_at FROM activity_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 10");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($r = $res->fetch_assoc()) $logs[] = $r;
    $stmt->close();
}

// Schedule
$sched = get_schedule($db, $sec_id);

// Student roll (all active students + their today status)
$roll = [];
if ($is_admin) {
    $res = $db->query("SELECT st.id, st.full_name, a.status FROM students st LEFT JOIN attendance a ON a.student_id=st.id AND a.date='$today' WHERE st.is_active=1 ORDER BY st.full_name");
} else {
    if (!empty($student_ids)) {
        $stmt = $db->prepare("SELECT st.id, st.full_name, a.status FROM students st LEFT JOIN attendance a ON a.student_id=st.id AND a.date=? WHERE st.id IN ($student_id_ph) AND st.is_active=1 ORDER BY st.full_name");
        $tmp = array_merge([$today], $student_ids);
        $stmt->bind_param('s'.$student_id_types, ...$tmp);
        $stmt->execute();
        $res = $stmt->get_result();
    }
}
if (isset($res)) while ($r = $res->fetch_assoc()) $roll[] = $r;

json_out([
    'total_students'    => $total_stu,
    'total_teachers'    => $total_tea,
    'present_today'     => $present,
    'late_today'        => $late,
    'absent_today'      => $absent,
    'excused_today'     => $excused,
    'not_scanned_today' => $not_scanned,
    'face_registered'   => (int)($bio['face'] ?? 0),
    'fp_registered'     => (int)($bio['fp']   ?? 0),
    'recent_attendance' => $recent_att,
    'recent_logs'       => $logs,
    'attendance_chart'  => $chart_data,
    'devices'           => $devices,
    'schedule'          => $sched,
    'roll'              => $roll,
]);
