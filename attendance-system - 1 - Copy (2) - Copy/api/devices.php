<?php
/**
 * devices.php — IoT device management.
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
require_role($user, 'Administrator');
$m   = $_SERVER['REQUEST_METHOD'];
$id  = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$uid = (int)$user['id'];
$ulabel = $user['full_name'];

if ($m === 'GET') {
    $rows = [];
    $res = $db->query("SELECT id, device_code, name, location, status, last_seen, created_at FROM devices ORDER BY name");
    while ($r = $res->fetch_assoc()) {
        // Auto-offline if not seen in 5+ minutes
        if ($r['status'] === 'Online' && $r['last_seen'] && strtotime($r['last_seen']) < time() - 300) {
            $did = $r['id'];
            $db->query("UPDATE devices SET status='Offline' WHERE id=$did");
            $r['status'] = 'Offline';
        }
        $rows[] = $r;
    }
    json_out($rows);
}

if ($m === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $code = trim($b['device_code'] ?? '');
    $name = trim($b['name']        ?? '');
    $loc  = trim($b['location']    ?? '');
    if (!$code) api_error('Device code required.');
    if (!$name) api_error('Device name required.');
    $key = bin2hex(random_bytes(24)); // generate device_key
    $stmt = $db->prepare("INSERT INTO devices (device_key, device_code, name, location) VALUES (?,?,?,?)");
    $stmt->bind_param('ssss', $key, $code, $name, $loc);
    if (!$stmt->execute()) {
        if ($db->errno === 1062) api_error('Device code already exists.');
        api_error('Database error.');
    }
    $new_id = $db->insert_id;
    $stmt->close();
    log_action($db, $uid, $ulabel, 'DEVICE_REGISTERED', "$name ($code)");
    json_out(['ok' => true, 'id' => $new_id, 'device_key' => $key], 201);
}

if ($m === 'PUT' && $id) {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim($b['name']     ?? '');
    $loc  = trim($b['location'] ?? '');
    $status = $b['status']      ?? '';
    if ($status && !in_array($status, ['Online','Offline','Error','Maintenance'])) api_error('Invalid status.');
    $fields = []; $types = ''; $params = [];
    if ($name)   { $fields[] = 'name=?';     $types .= 's'; $params[] = $name; }
    if ($loc)    { $fields[] = 'location=?'; $types .= 's'; $params[] = $loc; }
    if ($status) { $fields[] = 'status=?';   $types .= 's'; $params[] = $status; }
    if (!$fields) api_error('Nothing to update.');
    $types .= 'i'; $params[] = $id;
    $stmt = $db->prepare("UPDATE devices SET " . implode(',', $fields) . " WHERE id=?");
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();
    log_action($db, $uid, $ulabel, 'DEVICE_UPDATED', "Device ID $id");
    json_out(['ok' => true]);
}

if ($m === 'DELETE' && $id) {
    $db->query("DELETE FROM devices WHERE id=$id");
    log_action($db, $uid, $ulabel, 'DEVICE_REMOVED', "Device ID $id");
    json_out(['ok' => true]);
}

api_error('Method not allowed.', 405);
