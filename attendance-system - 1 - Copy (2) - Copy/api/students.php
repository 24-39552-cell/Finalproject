<?php
/**
 * students.php — CRUD for students.
 * GET    list, GET ?id=N single
 * POST   create
 * PUT    ?id=N update
 * PATCH  ?id=N&action=toggle_status | register_face | register_fingerprint | update_bio
 * DELETE ?id=N  (admin only, sets inactive)
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$m    = $_SERVER['REQUEST_METHOD'];
$id   = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$act  = $_GET['action'] ?? '';

$is_admin   = $user['role'] === 'Administrator';
$uid        = (int)$user['id'];
$ulabel     = $user['full_name'];

// Teacher: resolve section restriction
function teacher_section_id(mysqli $db, int $uid): ?int {
    $stmt = $db->prepare("SELECT section_id FROM teacher_sections WHERE user_id = ? LIMIT 1");
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $r ? (int)$r['section_id'] : null;
}

function build_where(mysqli $db, array $user, array $f): array {
    $where = ['1=1'];
    $params = [];
    $types = '';

    if ($user['role'] === 'Teacher') {
        $sec = teacher_section_id($db, (int)$user['id']);
        if (!$sec) { return [['1=0'], [], '']; }
        $where[] = 'st.section_id = ?';
        $types  .= 'i';
        $params[] = $sec;
    } elseif (!empty($f['section_id'])) {
        $where[] = 'st.section_id = ?';
        $types  .= 'i';
        $params[] = (int)$f['section_id'];
    }

    if (!empty($f['status'])) {
        $active = $f['status'] === 'Active' ? 1 : 0;
        $where[] = 'st.is_active = ?';
        $types  .= 'i';
        $params[] = $active;
    }

    if (!empty($f['q'])) {
        $q = '%' . $f['q'] . '%';
        $where[] = '(st.full_name LIKE ? OR st.student_id LIKE ?)';
        $types  .= 'ss';
        $params[] = $q;
        $params[] = $q;
    }

    return [$where, $params, $types];
}

if ($m === 'GET' && !$id) {
    $f = [
        'section_id' => $_GET['section_id'] ?? '',
        'status'     => $_GET['status'] ?? '',
        'q'          => $_GET['q'] ?? '',
    ];
    [$where, $params, $types] = build_where($db, $user, $f);
    $sql = "SELECT st.*, s.name AS section_name FROM students st LEFT JOIN sections s ON s.id = st.section_id WHERE " . implode(' AND ', $where) . " ORDER BY st.full_name";
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

if ($m === 'GET' && $id) {
    $stmt = $db->prepare("SELECT st.*, s.name AS section_name FROM students st LEFT JOIN sections s ON s.id = st.section_id WHERE st.id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$row) api_error('Student not found.', 404);
    if (!$is_admin) {
        $sec = teacher_section_id($db, $uid);
        if ((int)$row['section_id'] !== $sec) api_error('Access denied.', 403);
    }
    json_out($row);
}

if ($m === 'POST') {
    if (!$is_admin) api_error('Access denied.', 403);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $sid  = trim($b['student_id'] ?? '');
    $name = trim($b['full_name']  ?? '');
    $sec  = isset($b['section_id']) ? (int)$b['section_id'] : null;
    $sy   = trim($b['school_year'] ?? '');

    if (!$sid)  api_error('Student ID is required.');
    if (!$name) api_error('Full name is required.');

    $stmt = $db->prepare("INSERT INTO students (student_id, full_name, section_id, school_year) VALUES (?,?,?,?)");
    $stmt->bind_param('ssis', $sid, $name, $sec, $sy);
    if (!$stmt->execute()) {
        if ($db->errno === 1062) api_error('That Student ID is already registered.');
        api_error('Database error: ' . $db->error);
    }
    $new_id = $db->insert_id;
    $stmt->close();
    log_action($db, $uid, $ulabel, 'STUDENT_CREATED', "$name ($sid)");
    $stmt2 = $db->prepare("SELECT st.*, s.name AS section_name FROM students st LEFT JOIN sections s ON s.id = st.section_id WHERE st.id = ?");
    $stmt2->bind_param('i', $new_id);
    $stmt2->execute();
    json_out($stmt2->get_result()->fetch_assoc(), 201);
}

if ($m === 'PUT' && $id) {
    if (!$is_admin) api_error('Access denied.', 403);
    $b    = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim($b['full_name']  ?? '');
    $sec  = isset($b['section_id']) ? (int)$b['section_id'] : null;
    $sy   = trim($b['school_year'] ?? '');
    $sid  = trim($b['student_id'] ?? '');

    if (!$name) api_error('Full name is required.');

    $stmt = $db->prepare("SELECT full_name, student_id FROM students WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $old = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$old) api_error('Student not found.', 404);

    $stmt2 = $db->prepare("UPDATE students SET full_name=?, section_id=?, school_year=?, student_id=? WHERE id=?");
    $stmt2->bind_param('ssisi', $name, $sec, $sy, $sid, $id);
    if (!$stmt2->execute()) {
        if ($db->errno === 1062) api_error('That Student ID is already used.');
        api_error('Database error.');
    }
    $stmt2->close();
    log_action($db, $uid, $ulabel, 'STUDENT_UPDATED', "{$old['full_name']} → $name");
    json_out(['ok' => true]);
}

if ($m === 'PATCH' && $id) {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];

    $stmt = $db->prepare("SELECT st.*, s.name AS section_name FROM students st LEFT JOIN sections s ON s.id = st.section_id WHERE st.id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stu = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$stu) api_error('Student not found.', 404);

    if (!$is_admin) {
        $sec = teacher_section_id($db, $uid);
        if ((int)$stu['section_id'] !== $sec) api_error('Access denied.', 403);
    }

    if ($act === 'toggle_status') {
        if (!$is_admin) api_error('Access denied.', 403);
        $new = $stu['is_active'] ? 0 : 1;
        $db->query("UPDATE students SET is_active=$new WHERE id=$id");
        $label = $new ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED';
        log_action($db, $uid, $ulabel, $label, $stu['full_name']);
        json_out(['ok' => true, 'is_active' => $new]);
    }

    if ($act === 'register_face') {
        $db->query("UPDATE students SET face_registered=1 WHERE id=$id");
        $action_label = $stu['face_registered'] ? 'UPDATE_FACIAL' : 'REGISTER_FACIAL';
        log_action($db, $uid, $ulabel, $action_label, $stu['full_name']);
        json_out(['ok' => true]);
    }

    if ($act === 'register_fingerprint') {
        $tpl = trim($b['template_id'] ?? '');
        $db->query("UPDATE students SET fingerprint_registered=1" . ($tpl ? ", fingerprint_template_id='".addslashes($tpl)."'" : "") . " WHERE id=$id");
        $action_label = $stu['fingerprint_registered'] ? 'UPDATE_FINGERPRINT' : 'REGISTER_FINGERPRINT';
        log_action($db, $uid, $ulabel, $action_label, $stu['full_name']);
        json_out(['ok' => true]);
    }

    api_error('Unknown action.');
}

api_error('Method not allowed.', 405);
