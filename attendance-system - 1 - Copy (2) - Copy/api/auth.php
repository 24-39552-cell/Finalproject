<?php
/**
 * auth.php — Login, logout, session check, forgot password.
 * POST /api/auth.php?action=login
 * POST /api/auth.php?action=logout
 * GET  /api/auth.php?action=me
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db     = get_db();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'login' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $ident = trim($body['username'] ?? '');
    $pass  = $body['password'] ?? '';

    if (!$ident || !$pass) api_error('Enter your email/username and password.');

    $stmt = $db->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1 LIMIT 1");
    $stmt->bind_param('ss', $ident, $ident);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        log_action($db, null, $ident, 'LOGIN', "Failed login attempt for: $ident", 'Failed');
        api_error('Email, username, or password is incorrect.', 401);
    }

    // Create session (8-hour TTL)
    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + 28800);
    $stmt = $db->prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)");
    $stmt->bind_param('sis', $token, $user['id'], $expires);
    $stmt->execute();
    $stmt->close();

    // Clean old sessions for this user
    $uid = $user['id'];
    $db->query("DELETE FROM sessions WHERE user_id = $uid AND expires_at < NOW()");

    // Get teacher's assigned section if Teacher
    $section_name = null;
    $section_id   = null;
    if ($user['role'] === 'Teacher') {
        $stmt = $db->prepare("SELECT s.id, s.name FROM teacher_sections ts JOIN sections s ON s.id = ts.section_id WHERE ts.user_id = ? LIMIT 1");
        $stmt->bind_param('i', $uid);
        $stmt->execute();
        $sec = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        $section_name = $sec['name'] ?? null;
        $section_id   = $sec['id']   ?? null;
    }

    log_action($db, $user['id'], $user['full_name'], 'LOGIN', $user['full_name'] . ' signed in');

    setcookie('att_token', $token, [
        'expires'  => time() + 28800,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);

    json_out([
        'ok'           => true,
        'role'         => $user['role'],
        'full_name'    => $user['full_name'],
        'user_id'      => $user['id'],
        'token'        => $token,
        'section_name' => $section_name,
        'section_id'   => $section_id,
    ]);
}

if ($action === 'logout' && $method === 'POST') {
    $token = $_COOKIE['att_token'] ?? ($_SERVER['HTTP_X_SESSION_TOKEN'] ?? '');
    if ($token) {
        $stmt = $db->prepare("SELECT user_id FROM sessions WHERE token = ?");
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($row) {
            $uid = $row['user_id'];
            $stmt2 = $db->prepare("SELECT full_name FROM users WHERE id = ?");
            $stmt2->bind_param('i', $uid);
            $stmt2->execute();
            $u = $stmt2->get_result()->fetch_assoc();
            $stmt2->close();
            log_action($db, $uid, $u['full_name'] ?? 'Unknown', 'LOGOUT', 'User signed out');
        }
        $stmt3 = $db->prepare("DELETE FROM sessions WHERE token = ?");
        $stmt3->bind_param('s', $token);
        $stmt3->execute();
        $stmt3->close();
    }
    setcookie('att_token', '', time() - 3600, '/');
    json_out(['ok' => true]);
}

if ($action === 'me' && $method === 'GET') {
    $user = require_auth($db);
    $section_name = null;
    $section_id   = null;
    if ($user['role'] === 'Teacher') {
        $uid = $user['id'];
        $stmt = $db->prepare("SELECT s.id, s.name FROM teacher_sections ts JOIN sections s ON s.id = ts.section_id WHERE ts.user_id = ? LIMIT 1");
        $stmt->bind_param('i', $uid);
        $stmt->execute();
        $sec = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        $section_name = $sec['name'] ?? null;
        $section_id   = $sec['id']   ?? null;
    }
    json_out([
        'ok'           => true,
        'role'         => $user['role'],
        'full_name'    => $user['full_name'],
        'user_id'      => $user['id'],
        'section_name' => $section_name,
        'section_id'   => $section_id,
    ]);
}

api_error('Unknown action.', 404);
