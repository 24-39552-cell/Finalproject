<?php
/**
 * sections.php — Section and class management (admin only for create/delete).
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$m    = $_SERVER['REQUEST_METHOD'];
$id   = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$is_admin = $user['role'] === 'Administrator';
$uid = (int)$user['id'];
$ulabel = $user['full_name'];

if ($m === 'GET') {
    $rows = [];
    $res = $db->query("SELECT s.*, 
        (SELECT COUNT(*) FROM students st WHERE st.section_id = s.id AND st.is_active=1) AS active_students,
        (SELECT GROUP_CONCAT(u.full_name ORDER BY u.full_name) FROM teacher_sections ts JOIN users u ON u.id=ts.user_id WHERE ts.section_id=s.id) AS teachers,
        sch.start_time, sch.late_after
        FROM sections s 
        LEFT JOIN attendance_schedules sch ON sch.section_id = s.id
        ORDER BY s.name");
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    json_out($rows);
}

if ($m === 'POST') {
    if (!$is_admin) api_error('Access denied.', 403);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $name  = trim($b['name']         ?? '');
    $grade = trim($b['grade_level']  ?? '');
    $sy    = trim($b['school_year']  ?? '');
    if (!$name) api_error('Section name required.');
    $stmt = $db->prepare("INSERT INTO sections (name, grade_level, school_year) VALUES (?,?,?)");
    $stmt->bind_param('sss', $name, $grade, $sy);
    if (!$stmt->execute()) {
        if ($db->errno === 1062) api_error('That section name already exists.');
        api_error('Database error.');
    }
    $new_id = $db->insert_id;
    $stmt->close();
    log_action($db, $uid, $ulabel, 'SECTION_CREATED', $name);
    json_out(['ok' => true, 'id' => $new_id], 201);
}

if ($m === 'PUT' && $id) {
    if (!$is_admin) api_error('Access denied.', 403);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $name  = trim($b['name']        ?? '');
    $grade = trim($b['grade_level'] ?? '');
    $sy    = trim($b['school_year'] ?? '');
    if (!$name) api_error('Section name required.');
    $stmt = $db->prepare("UPDATE sections SET name=?, grade_level=?, school_year=? WHERE id=?");
    $stmt->bind_param('sssi', $name, $grade, $sy, $id);
    $stmt->execute();
    $stmt->close();
    log_action($db, $uid, $ulabel, 'SECTION_UPDATED', $name);
    json_out(['ok' => true]);
}

if ($m === 'DELETE' && $id) {
    if (!$is_admin) api_error('Access denied.', 403);
    $db->query("DELETE FROM sections WHERE id=$id");
    log_action($db, $uid, $ulabel, 'SECTION_DELETED', "Section ID $id");
    json_out(['ok' => true]);
}

api_error('Method not allowed.', 405);
