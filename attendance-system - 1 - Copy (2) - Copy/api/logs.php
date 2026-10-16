<?php
/**
 * logs.php — Activity log listing (admin: all, teacher: own).
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$db   = get_db();
$user = require_auth($db);
$is_admin = $user['role'] === 'Administrator';
$uid  = (int)$user['id'];

$q      = $_GET['q']      ?? '';
$limit  = min((int)($_GET['limit'] ?? 200), 500);
$offset = (int)($_GET['offset'] ?? 0);

$where  = ['1=1'];
$params = [];
$types  = '';

if (!$is_admin) {
    $where[] = 'l.user_id = ?';
    $types  .= 'i';
    $params[] = $uid;
}

if ($q) {
    $qlike = "%$q%";
    $where[] = '(l.action LIKE ? OR l.details LIKE ? OR l.user_label LIKE ?)';
    $types  .= 'sss';
    $params[] = $qlike; $params[] = $qlike; $params[] = $qlike;
}

$sql = "SELECT l.id, l.user_label, l.action, l.details, l.result, l.ip_address, l.created_at
        FROM activity_logs l
        WHERE " . implode(' AND ', $where) . "
        ORDER BY l.created_at DESC
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

$count_sql = "SELECT COUNT(*) AS c FROM activity_logs l WHERE " . implode(' AND ', $where);
if ($types) {
    $stmt2 = $db->prepare($count_sql);
    $stmt2->bind_param($types, ...$params);
    $stmt2->execute();
    $total = (int)$stmt2->get_result()->fetch_assoc()['c'];
    $stmt2->close();
} else {
    $total = (int)$db->query($count_sql)->fetch_assoc()['c'];
}

json_out(['total' => $total, 'rows' => $rows]);
