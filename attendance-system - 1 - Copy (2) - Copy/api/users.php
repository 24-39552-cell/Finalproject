<?php
/**
 * users.php — Manage Administrator and Teacher accounts.
 * Admin-only account management.
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$m    = $_SERVER['REQUEST_METHOD'];
$id   = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$act  = $_GET['action'] ?? '';
$is_admin = $user['role'] === 'Administrator';
$uid  = (int)$user['id'];
$ulabel = $user['full_name'];

if ($m === 'GET' && !$id) {
    if (!$is_admin) api_error('Access denied.', 403);
    $role_filter = $_GET['role'] ?? '';
    $q = $_GET['q'] ?? '';
    $where = ['1=1'];
    $types = '';
    $params = [];
    if ($role_filter) {
        $where[] = 'u.role = ?';
        $types  .= 's';
        $params[] = $role_filter;
    }
    if ($q) {
        $qlike = "%$q%";
        $where[] = '(u.full_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
        $types  .= 'sss';
        $params[] = $qlike; $params[] = $qlike; $params[] = $qlike;
    }
    $sql = "SELECT u.id, u.username, u.email, u.full_name, u.role, u.is_active, u.created_at,
                   MIN(ts.section_id) AS section_id,
                   GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') AS sections
            FROM users u
            LEFT JOIN teacher_sections ts ON ts.user_id = u.id
            LEFT JOIN sections s ON s.id = ts.section_id
            WHERE " . implode(' AND ', $where) . "
            GROUP BY u.id ORDER BY u.full_name";
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
    if (!$is_admin) api_error('Access denied.', 403);
    $stmt = $db->prepare("SELECT u.id, u.username, u.email, u.full_name, u.role, u.is_active,
                                 MIN(ts.section_id) AS section_id
                          FROM users u
                          LEFT JOIN teacher_sections ts ON ts.user_id = u.id
                          WHERE u.id = ?
                          GROUP BY u.id");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$row) api_error('User not found.', 404);
    json_out($row);
}

if ($m === 'POST') {
    if (!$is_admin) api_error('Access denied.', 403);
    $b    = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim($b['full_name']  ?? '');
    $email= trim($b['email']      ?? '');
    $uname= trim($b['username']   ?? '');
    $role = $b['role']            ?? 'Teacher';
    $pass = $b['password']        ?? '';
    $secs = $b['section_ids'] ?? (
        !empty($b['section_id']) ? [$b['section_id']] : []
    );
    if (!is_array($secs)) api_error('Invalid section assignment.');

    if (!$name)  api_error('Full name required.');
    if (!$email) api_error('Email required.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) api_error('Invalid email.');
    if (!in_array($role, ['Administrator','Teacher'])) api_error('Invalid role.');
    if (strlen($pass) < 8) api_error('Password must be at least 8 characters.');

    if (!$uname) $uname = strtolower(str_replace(' ', '.', $name)) . rand(10,99);
    $hash = password_hash($pass, PASSWORD_BCRYPT);

    $stmt = $db->prepare("INSERT INTO users (username,email,password_hash,role,full_name) VALUES (?,?,?,?,?)");
    $stmt->bind_param('sssss', $uname, $email, $hash, $role, $name);
    if (!$stmt->execute()) {
        if ($db->errno === 1062) api_error('That email or username is already registered.');
        api_error('Database error.');
    }
    $new_id = $db->insert_id;
    $stmt->close();

    if ($role === 'Teacher' && !empty($secs)) {
        $st = $db->prepare("INSERT IGNORE INTO teacher_sections (user_id, section_id) VALUES (?,?)");
        foreach ($secs as $sid) {
            $sid = (int)$sid;
            $st->bind_param('ii', $new_id, $sid);
            $st->execute();
        }
        $st->close();
    }

    log_action($db, $uid, $ulabel, 'ACCOUNT_CREATED', "$name ($role)");
    json_out(['ok' => true, 'id' => $new_id], 201);
}

if ($m === 'PUT' && $id) {
    if (!$is_admin) api_error('Access denied.', 403);
    $b    = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim($b['full_name'] ?? '');
    $email= trim($b['email']     ?? '');
    $role = $b['role']           ?? '';
    $secs = $b['section_ids'] ?? (
        array_key_exists('section_id', $b)
            ? (!empty($b['section_id']) ? [$b['section_id']] : [])
            : null
    );
    if ($secs !== null && !is_array($secs)) api_error('Invalid section assignment.');

    if (!$name)  api_error('Full name required.');
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) api_error('Invalid email.');

    $stmt = $db->prepare("SELECT full_name, role FROM users WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $old = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$old) api_error('User not found.', 404);

    $fields = 'full_name = ?';
    $types  = 's';
    $params = [$name];
    if ($email) { $fields .= ', email = ?'; $types .= 's'; $params[] = $email; }
    if ($role && in_array($role, ['Administrator','Teacher'])) { $fields .= ', role = ?'; $types .= 's'; $params[] = $role; }
    $types  .= 'i';
    $params[] = $id;

    $stmt2 = $db->prepare("UPDATE users SET $fields WHERE id = ?");
    $stmt2->bind_param($types, ...$params);
    if (!$stmt2->execute()) api_error('Database error.');
    $stmt2->close();

    if ($secs !== null) {
        $db->query("DELETE FROM teacher_sections WHERE user_id = $id");
        if (!empty($secs)) {
            $st = $db->prepare("INSERT IGNORE INTO teacher_sections (user_id, section_id) VALUES (?,?)");
            foreach ($secs as $sid) {
                $sid = (int)$sid;
                $st->bind_param('ii', $id, $sid);
                $st->execute();
            }
            $st->close();
        }
    }

    log_action($db, $uid, $ulabel, 'ACCOUNT_UPDATED', "{$old['full_name']} → $name");
    json_out(['ok' => true]);
}

if ($m === 'PATCH' && $id) {
    if (!$is_admin) api_error('Access denied.', 403);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];

    $stmt = $db->prepare("SELECT full_name, is_active FROM users WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $u2 = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$u2) api_error('User not found.', 404);

    if ($act === 'toggle_status') {
        $new = $u2['is_active'] ? 0 : 1;
        $db->query("UPDATE users SET is_active=$new WHERE id=$id");
        $label = $new ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED';
        log_action($db, $uid, $ulabel, $label, $u2['full_name']);
        json_out(['ok' => true, 'is_active' => $new]);
    }

    if ($act === 'reset_password') {
        $new_pass = $b['password'] ?? '';
        if (strlen($new_pass) < 8) api_error('New password must be at least 8 characters.');
        $hash = password_hash($new_pass, PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE users SET password_hash=? WHERE id=?");
        $stmt->bind_param('si', $hash, $id);
        $stmt->execute();
        $stmt->close();
        log_action($db, $uid, $ulabel, 'PASSWORD_RESET', "Reset password for {$u2['full_name']}");
        json_out(['ok' => true]);
    }

    api_error('Unknown action.');
}

api_error('Method not allowed.', 405);
