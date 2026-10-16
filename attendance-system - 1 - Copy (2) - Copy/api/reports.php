<?php
/**
 * reports.php — Generate attendance reports and export as Excel (CSV).
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$is_admin = $user['role'] === 'Administrator';
$uid  = (int)$user['id'];
$ulabel = $user['full_name'];
$m    = $_SERVER['REQUEST_METHOD'];

$today = date('Y-m-d');
$type     = $_GET['type']       ?? 'Daily';   // Daily|Weekly|Monthly|Student|Class
$date_ref = $_GET['date']       ?? $today;
$sec_f    = $_GET['section_id'] ?? '';
$stu_f    = $_GET['student_id'] ?? '';
$export   = ($_GET['export']    ?? '') === 'excel';

// Compute date range
if ($type === 'Daily') {
    $date_a = $date_b = $date_ref;
} elseif ($type === 'Weekly') {
    $d = new DateTime($date_ref);
    $d->modify('-6 days');
    $date_a = $d->format('Y-m-d');
    $date_b = $date_ref;
} elseif ($type === 'Monthly') {
    $date_a = substr($date_ref,0,8) . '01';
    $last   = (new DateTime($date_a))->format('t');
    $date_b = substr($date_ref,0,8) . $last;
} else {
    $date_a = $date_b = $date_ref;
}

// Build student pool
$where_stu = ['st.is_active = 1'];
$params_stu = [];
$types_stu  = '';

if (!$is_admin) {
    $stmt = $db->prepare("SELECT section_id FROM teacher_sections WHERE user_id=? LIMIT 1");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $t_sec = $r ? (int)$r['section_id'] : null;
    if (!$t_sec) json_out([]);
    $where_stu[] = 'st.section_id = ?';
    $types_stu  .= 'i';
    $params_stu[] = $t_sec;
} elseif ($sec_f) {
    $where_stu[] = 'st.section_id = ?';
    $types_stu  .= 'i';
    $params_stu[] = (int)$sec_f;
}

if ($stu_f) {
    $where_stu[] = 'st.id = ?';
    $types_stu  .= 'i';
    $params_stu[] = (int)$stu_f;
}

$stu_sql = "SELECT st.id, st.student_id, st.full_name, s.name AS section_name FROM students st LEFT JOIN sections s ON s.id=st.section_id WHERE " . implode(' AND ', $where_stu) . " ORDER BY st.full_name";

if ($types_stu) {
    $stmt = $db->prepare($stu_sql);
    $stmt->bind_param($types_stu, ...$params_stu);
    $stmt->execute();
    $res = $stmt->get_result();
} else {
    $res = $db->query($stu_sql);
}
$students = [];
while ($r = $res->fetch_assoc()) $students[] = $r;

// For each student, gather attendance counts in range
$rows = [];
foreach ($students as $stu) {
    $sid = (int)$stu['id'];
    $stmt = $db->prepare("SELECT status, COUNT(*) AS cnt FROM attendance WHERE student_id=? AND date BETWEEN ? AND ? GROUP BY status");
    $stmt->bind_param('iss', $sid, $date_a, $date_b);
    $stmt->execute();
    $res2 = $stmt->get_result();
    $stmt->close();
    $c = ['Present'=>0,'Late'=>0,'Absent'=>0,'Excused'=>0];
    while ($r = $res2->fetch_assoc()) $c[$r['status']] = (int)$r['cnt'];
    $total = array_sum($c);
    $rate  = $total ? round((($c['Present']+$c['Late'])/$total)*100) . '%' : '—';
    $rows[] = [
        'student_id'   => $stu['student_id'],
        'full_name'    => $stu['full_name'],
        'section_name' => $stu['section_name'],
        'present'      => $c['Present'],
        'late'         => $c['Late'],
        'absent'       => $c['Absent'],
        'excused'      => $c['Excused'],
        'rate'         => $rate,
    ];
}

if ($export) {
    // Disable json header and send CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="attendance_report_' . date('Ymd') . '.csv"');
    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM
    fputcsv($out, ['Attendance Report', ucfirst($type), "$date_a to $date_b"]);
    fputcsv($out, ['Student ID','Full Name','Section','Present','Late','Absent','Excused','Attendance Rate']);
    foreach ($rows as $row) {
        fputcsv($out, [$row['student_id'], $row['full_name'], $row['section_name'],
                       $row['present'], $row['late'], $row['absent'], $row['excused'], $row['rate']]);
    }
    fclose($out);
    log_action($db, $uid, $ulabel, 'REPORT_EXPORTED', "$type report $date_a–$date_b");
    exit;
}

log_action($db, $uid, $ulabel, 'REPORT_GENERATED', "$type report $date_a–$date_b (" . count($rows) . " students)");
json_out([
    'type'      => $type,
    'date_from' => $date_a,
    'date_to'   => $date_b,
    'rows'      => $rows,
]);
