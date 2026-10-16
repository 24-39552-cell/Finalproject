<?php
/**
 * attendance.php — Record, list, correct attendance.
 * GET    list with filters
 * POST   create new record (device / manual)
 * PATCH  ?id=N  correct status
 * IoT endpoint: POST ?action=device_scan (device_key auth)
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db  = get_db();
$m   = $_SERVER['REQUEST_METHOD'];
$id  = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$act = $_GET['action'] ?? '';

// --- IoT device scan (no cookie session, uses device_key) ---
if ($m === 'POST' && $act === 'device_scan') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $dkey  = $b['device_key']  ?? '';
    $s_ext = $b['student_id']  ?? ''; // student_id field (the external string ID)
    $method= $b['method']      ?? 'Facial Recognition';
    $ts    = $b['timestamp']   ?? date('Y-m-d H:i:s');

    if (!in_array($method, ['Facial Recognition','Fingerprint'])) $method = 'Facial Recognition';

    // Auth device
    $stmt = $db->prepare("SELECT id, device_code FROM devices WHERE device_key = ? LIMIT 1");
    $stmt->bind_param('s', $dkey);
    $stmt->execute();
    $dev = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$dev) api_error('Device not authorized.', 403);

    // Update device heartbeat
    $did = $dev['id'];
    $db->query("UPDATE devices SET status='Online', last_seen=NOW() WHERE id=$did");

    // Resolve student
    $stmt2 = $db->prepare("SELECT id, full_name, section_id, is_active FROM students WHERE student_id = ? LIMIT 1");
    $stmt2->bind_param('s', $s_ext);
    $stmt2->execute();
    $stu = $stmt2->get_result()->fetch_assoc();
    $stmt2->close();
    if (!$stu) api_error('Student not found.', 404);
    if (!$stu['is_active']) api_error('Student is inactive.', 422);

    $date_str = substr($ts, 0, 10);
    $time_str = substr($ts, 11, 8) ?: date('H:i:s');

    // Duplicate check
    $stmt3 = $db->prepare("SELECT id FROM attendance WHERE student_id = ? AND date = ?");
    $stmt3->bind_param('is', $stu['id'], $date_str);
    $stmt3->execute();
    if ($stmt3->get_result()->fetch_assoc()) {
        $stmt3->close();
        api_error('Attendance already recorded for this student today.', 409);
    }
    $stmt3->close();

    // Determine Present/Late
    $sched = get_schedule($db, $stu['section_id']);
    $status = $time_str <= $sched['late_after'] ? 'Present' : 'Late';

    $stmt4 = $db->prepare("INSERT INTO attendance (student_id,date,time_in,status,method,device_id) VALUES (?,?,?,?,?,?)");
    $stmt4->bind_param('issssi', $stu['id'], $date_str, $time_str, $status, $method, $did);
    $stmt4->execute();
    $att_id = $db->insert_id;
    $stmt4->close();

    log_action($db, null, "Device:{$dev['device_code']}", 'ATTENDANCE_RECORDED', "{$stu['full_name']} via $method — $status");
    json_out(['ok' => true, 'attendance_id' => $att_id, 'status' => $status, 'student' => $stu['full_name']], 201);
}

// --- Device heartbeat ---
if ($m === 'POST' && $act === 'heartbeat') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $dkey = $b['device_key'] ?? '';
    if (!$dkey) api_error('device_key required.');
    $stmt = $db->prepare("UPDATE devices SET status='Online', last_seen=NOW() WHERE device_key=?");
    $stmt->bind_param('s', $dkey);
    $stmt->execute();
    $stmt->close();
    json_out(['ok' => true]);
}

// --- Web authenticated endpoints ---
$user   = require_auth($db);
$is_admin = $user['role'] === 'Administrator';
$uid    = (int)$user['id'];
$ulabel = $user['full_name'];

function teacher_section_students(mysqli $db, int $uid): array {
    $stmt = $db->prepare("SELECT st.id FROM students st JOIN teacher_sections ts ON ts.section_id = st.section_id WHERE ts.user_id = ?");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $res = $stmt->get_result();
    $ids = [];
    while ($r = $res->fetch_assoc()) $ids[] = (int)$r['id'];
    $stmt->close();
    return $ids;
}

if ($m === 'GET') {
    $date_f   = $_GET['date']      ?? '';
    $sec_f    = $_GET['section_id']?? '';
    $status_f = $_GET['status']    ?? '';
    $method_f = $_GET['method']    ?? '';
    $q        = $_GET['q']         ?? '';
    $limit    = min((int)($_GET['limit'] ?? 200), 500);
    $offset   = (int)($_GET['offset'] ?? 0);

    $where = ['1=1'];
    $params= [];
    $types = '';

    if (!$is_admin) {
        $ids = teacher_section_students($db, $uid);
        if (empty($ids)) json_out([]);
        $ph = implode(',', array_fill(0, count($ids), '?'));
        $where[] = "a.student_id IN ($ph)";
        $types  .= str_repeat('i', count($ids));
        $params  = array_merge($params, $ids);
    } elseif ($sec_f) {
        $where[] = 'st.section_id = ?';
        $types  .= 'i';
        $params[] = (int)$sec_f;
    }

    if ($date_f) { $where[] = 'a.date = ?'; $types .= 's'; $params[] = $date_f; }
    if ($status_f) { $where[] = 'a.status = ?'; $types .= 's'; $params[] = $status_f; }
    if ($method_f) { $where[] = 'a.method = ?'; $types .= 's'; $params[] = $method_f; }
    if ($q) {
        $qlike = "%$q%";
        $where[] = '(st.full_name LIKE ? OR st.student_id LIKE ?)';
        $types  .= 'ss';
        $params[] = $qlike; $params[] = $qlike;
    }

    $sql = "SELECT a.id, a.date, a.time_in, a.status, a.method, a.created_at,
                   st.student_id AS student_ext_id, st.full_name AS student_name,
                   s.name AS section_name, d.device_code,
                   u2.full_name AS corrected_by_name, a.corrected_at
            FROM attendance a
            JOIN students st ON st.id = a.student_id
            LEFT JOIN sections s ON s.id = st.section_id
            LEFT JOIN devices d ON d.id = a.device_id
            LEFT JOIN users u2 ON u2.id = a.corrected_by
            WHERE " . implode(' AND ', $where) . "
            ORDER BY a.date DESC, a.time_in DESC
            LIMIT $limit OFFSET $offset";

    if ($types) {
        $stmt = $db->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();
    } else {
        $res = $db->query($sql);
    }
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    json_out($rows);
}

if ($m === 'POST') {
    // Manual attendance entry by web user
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $stu_id  = (int)($b['student_id'] ?? 0);
    $date    = $b['date']   ?? date('Y-m-d');
    $time_in = $b['time_in'] ?? null;
    $status  = $b['status'] ?? 'Absent';
    $method  = 'Manual';

    if (!$stu_id) api_error('student_id required.');
    if (!in_array($status, ['Present','Late','Absent','Excused'])) api_error('Invalid status.');

    // Auth check for teacher
    if (!$is_admin) {
        $ids = teacher_section_students($db, $uid);
        if (!in_array($stu_id, $ids)) api_error('Access denied.', 403);
        if (!in_array($status, ['Absent','Excused'])) api_error('Teachers may only manually set Absent or Excused.', 403);
    }

    // Duplicate check
    $stmt = $db->prepare("SELECT id FROM attendance WHERE student_id=? AND date=?");
    $stmt->bind_param('is', $stu_id, $date);
    $stmt->execute();
    if ($stmt->get_result()->fetch_assoc()) {
        $stmt->close();
        api_error('Attendance record already exists for this student on this date.', 409);
    }
    $stmt->close();

    $stmt2 = $db->prepare("INSERT INTO attendance (student_id,date,time_in,status,method) VALUES (?,?,?,?,?)");
    $stmt2->bind_param('issss', $stu_id, $date, $time_in, $status, $method);
    $stmt2->execute();
    $att_id = $db->insert_id;
    $stmt2->close();

    $stmt3 = $db->prepare("SELECT full_name FROM students WHERE id=?");
    $stmt3->bind_param('i', $stu_id);
    $stmt3->execute();
    $sn = $stmt3->get_result()->fetch_assoc()['full_name'] ?? "Student $stu_id";
    $stmt3->close();

    log_action($db, $uid, $ulabel, 'ATTENDANCE_MARKED', "$sn on $date: $status (Manual)");
    json_out(['ok' => true, 'id' => $att_id], 201);
}

if ($m === 'PATCH' && $id) {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $new_status = $b['status'] ?? '';
    if (!in_array($new_status, ['Present','Late','Absent','Excused'])) api_error('Invalid status.');

    $stmt = $db->prepare("SELECT a.*, st.full_name, st.section_id FROM attendance a JOIN students st ON st.id=a.student_id WHERE a.id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $att = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$att) api_error('Attendance record not found.', 404);

    if (!$is_admin) {
        $ids = teacher_section_students($db, $uid);
        if (!in_array((int)$att['student_id'], $ids)) api_error('Access denied.', 403);
        if (!in_array($new_status, ['Absent','Excused'])) api_error('Teachers may only change to Absent or Excused.', 403);
    }

    $old = $att['status'];
    $now = date('Y-m-d H:i:s');
    $stmt2 = $db->prepare("UPDATE attendance SET status=?, corrected_by=?, corrected_at=? WHERE id=?");
    $stmt2->bind_param('sisi', $new_status, $uid, $now, $id);
    $stmt2->execute();
    $stmt2->close();

    log_action($db, $uid, $ulabel, 'ATTENDANCE_CORRECTED', "{$att['full_name']} on {$att['date']}: $old → $new_status");
    json_out(['ok' => true]);
}

api_error('Method not allowed.', 405);
