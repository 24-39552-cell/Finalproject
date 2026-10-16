<?php
/**
 * schedule.php — Read schedules and let teachers update their assigned classes.
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$m   = $_SERVER['REQUEST_METHOD'];
$uid = (int)$user['id'];
$ulabel = $user['full_name'];
$is_admin = $user['role'] === 'Administrator';

if ($m === 'GET') {
    $rows = [];
    if ($is_admin) {
        $res = $db->query("SELECT sch.*, s.name AS section_name FROM attendance_schedules sch LEFT JOIN sections s ON s.id = sch.section_id ORDER BY ISNULL(sch.section_id) DESC, s.name");
    } else {
        $stmt = $db->prepare("SELECT s.id AS section_id, s.name AS section_name,
                                     COALESCE(sch.start_time, (SELECT g.start_time FROM attendance_schedules g WHERE g.section_id IS NULL ORDER BY g.id LIMIT 1), '07:30:00') AS start_time,
                                     COALESCE(sch.late_after, (SELECT g.late_after FROM attendance_schedules g WHERE g.section_id IS NULL ORDER BY g.id LIMIT 1), '07:45:00') AS late_after
                              FROM teacher_sections ts
                              JOIN sections s ON s.id = ts.section_id
                              LEFT JOIN attendance_schedules sch ON sch.section_id = s.id
                              WHERE ts.user_id = ?
                              ORDER BY s.name");
        $stmt->bind_param('i', $uid);
        $stmt->execute();
        $res = $stmt->get_result();
    }
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    if (!$is_admin) $stmt->close();
    json_out($rows);
}

if ($m === 'PUT') {
    if ($user['role'] !== 'Teacher') api_error('Only teachers can change class schedules.', 403);

    $b      = json_decode(file_get_contents('php://input'), true) ?? [];
    $sec_id = isset($b['section_id']) ? (int)$b['section_id'] : 0;
    $start  = trim($b['start_time'] ?? '');
    $late   = trim($b['late_after'] ?? '');
    if (!$sec_id) api_error('section_id required.');
    if (!$start || !$late) api_error('start_time and late_after required.');
    $time_pattern = '/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/';
    if (!preg_match($time_pattern, $start) || !preg_match($time_pattern, $late)) {
        api_error('Times must be valid 24-hour values.');
    }
    if (substr($late, 0, 5) <= substr($start, 0, 5)) api_error('late_after must be after start_time.');

    $stmt = $db->prepare("SELECT 1 FROM teacher_sections WHERE user_id = ? AND section_id = ? LIMIT 1");
    $stmt->bind_param('ii', $uid, $sec_id);
    $stmt->execute();
    $assigned = $stmt->get_result()->fetch_row();
    $stmt->close();
    if (!$assigned) api_error('You can only change the schedule for your assigned class.', 403);

    if (strlen($start) === 5) $start .= ':00';
    if (strlen($late) === 5) $late .= ':00';

    $stmt = $db->prepare("INSERT INTO attendance_schedules (section_id, start_time, late_after) VALUES (?,?,?) ON DUPLICATE KEY UPDATE start_time=VALUES(start_time), late_after=VALUES(late_after)");
    $stmt->bind_param('iss', $sec_id, $start, $late);
    $stmt->execute();
    $stmt->close();
    log_action($db, $uid, $ulabel, 'SETTINGS_UPDATED', "Schedule: start=$start, late=$late (section $sec_id)");
    json_out(['ok' => true]);
}

api_error('Method not allowed.', 405);
