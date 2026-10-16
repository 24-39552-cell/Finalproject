<?php
/**
 * db.php — Central database connection and auto-initialization.
 */

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'student attendance');

function get_db(): mysqli {
    static $db = null;
    if ($db !== null) return $db;

    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($db->connect_error) {
        $tmp = new mysqli(DB_HOST, DB_USER, DB_PASS);
        if ($tmp->connect_error) {
            http_response_code(503);
            die(json_encode(['error' => 'Database server unavailable.']));
        }
        $tmp->query("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $tmp->close();
        $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($db->connect_error) {
            http_response_code(503);
            die(json_encode(['error' => 'Could not connect to database.']));
        }
    }
    $db->set_charset('utf8mb4');
    init_schema($db);
    return $db;
}

function init_schema(mysqli $db): void {
    $db->query("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(80) NOT NULL UNIQUE,
        `email` VARCHAR(180) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `role` ENUM('Administrator','Teacher') NOT NULL,
        `full_name` VARCHAR(180) NOT NULL,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_role` (`role`),
        INDEX `idx_active` (`is_active`)
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `sessions` (
        `token` VARCHAR(128) NOT NULL PRIMARY KEY,
        `user_id` INT UNSIGNED NOT NULL,
        `expires_at` DATETIME NOT NULL,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        INDEX `idx_user` (`user_id`),
        INDEX `idx_expires` (`expires_at`)
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `sections` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL UNIQUE,
        `grade_level` VARCHAR(50) NOT NULL DEFAULT '',
        `school_year` VARCHAR(20) NOT NULL DEFAULT '',
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_grade` (`grade_level`)
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `teacher_sections` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT UNSIGNED NOT NULL,
        `section_id` INT UNSIGNED NOT NULL,
        UNIQUE KEY `uq_teacher_section` (`user_id`, `section_id`),
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `students` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `student_id` VARCHAR(30) NOT NULL UNIQUE,
        `full_name` VARCHAR(180) NOT NULL,
        `section_id` INT UNSIGNED DEFAULT NULL,
        `school_year` VARCHAR(20) NOT NULL DEFAULT '',
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `face_registered` TINYINT(1) NOT NULL DEFAULT 0,
        `fingerprint_registered` TINYINT(1) NOT NULL DEFAULT 0,
        `fingerprint_template_id` VARCHAR(20) DEFAULT NULL,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL,
        INDEX `idx_section` (`section_id`),
        INDEX `idx_active` (`is_active`)
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `devices` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `device_key` VARCHAR(64) NOT NULL UNIQUE,
        `device_code` VARCHAR(20) NOT NULL UNIQUE,
        `name` VARCHAR(100) NOT NULL,
        `location` VARCHAR(180) NOT NULL DEFAULT '',
        `status` ENUM('Online','Offline','Error','Maintenance') NOT NULL DEFAULT 'Offline',
        `last_seen` DATETIME DEFAULT NULL,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_status` (`status`)
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `attendance_schedules` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `section_id` INT UNSIGNED DEFAULT NULL,
        `start_time` TIME NOT NULL DEFAULT '07:30:00',
        `late_after` TIME NOT NULL DEFAULT '07:45:00',
        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY `uq_section` (`section_id`),
        FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `attendance` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `student_id` INT UNSIGNED NOT NULL,
        `date` DATE NOT NULL,
        `time_in` TIME DEFAULT NULL,
        `status` ENUM('Present','Late','Absent','Excused') NOT NULL,
        `method` ENUM('Facial Recognition','Fingerprint','Manual') NOT NULL DEFAULT 'Manual',
        `device_id` INT UNSIGNED DEFAULT NULL,
        `corrected_by` INT UNSIGNED DEFAULT NULL,
        `corrected_at` DATETIME DEFAULT NULL,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `uq_student_date` (`student_id`, `date`),
        FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL,
        FOREIGN KEY (`corrected_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
        INDEX `idx_date` (`date`),
        INDEX `idx_status` (`status`)
    ) ENGINE=InnoDB");

    $db->query("CREATE TABLE IF NOT EXISTS `activity_logs` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT UNSIGNED DEFAULT NULL,
        `user_label` VARCHAR(180) NOT NULL DEFAULT 'System',
        `action` VARCHAR(100) NOT NULL,
        `details` TEXT NOT NULL DEFAULT '',
        `result` ENUM('Success','Failed') NOT NULL DEFAULT 'Success',
        `ip_address` VARCHAR(45) DEFAULT NULL,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
        INDEX `idx_action` (`action`),
        INDEX `idx_created` (`created_at`),
        INDEX `idx_user` (`user_id`)
    ) ENGINE=InnoDB");

    $default_schedule = $db->query("SELECT 1 FROM `attendance_schedules` WHERE `section_id` IS NULL LIMIT 1");
    if (!$default_schedule->fetch_row()) {
        $db->query("INSERT INTO `attendance_schedules` (`section_id`,`start_time`,`late_after`) VALUES (NULL,'07:30:00','07:45:00')");
    }

    $row = $db->query("SELECT COUNT(*) AS c FROM `users`")->fetch_assoc();
    if ((int)$row['c'] === 0) {
        $hash = password_hash('Admin@1234', PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO `users` (`username`,`email`,`password_hash`,`role`,`full_name`) VALUES (?,?,?,?,?)");
        $u = 'admin'; $e = 'admin@school.edu.ph'; $r = 'Administrator'; $n = 'System Administrator';
        $stmt->bind_param('sssss', $u, $e, $hash, $r, $n);
        $stmt->execute();
        $stmt->close();
    }
}

function json_out(mixed $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function api_error(string $msg, int $code = 400): never {
    json_out(['error' => $msg], $code);
}

function require_auth(mysqli $db): array {
    $token = $_COOKIE['att_token'] ?? ($_SERVER['HTTP_X_SESSION_TOKEN'] ?? '');
    if (!$token) api_error('Not authenticated.', 401);
    $stmt = $db->prepare("SELECT u.*, s.token FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$user) api_error('Session expired or invalid. Please log in again.', 401);
    return $user;
}

function require_role(array $user, string $role): void {
    if ($user['role'] !== $role) api_error('Access denied.', 403);
}

function log_action(mysqli $db, ?int $user_id, string $user_label, string $action, string $details, string $result = 'Success'): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $stmt = $db->prepare("INSERT INTO activity_logs (user_id,user_label,action,details,result,ip_address) VALUES (?,?,?,?,?,?)");
    $stmt->bind_param('isssss', $user_id, $user_label, $action, $details, $result, $ip);
    $stmt->execute();
    $stmt->close();
}

function get_schedule(mysqli $db, ?int $section_id): array {
    if ($section_id) {
        $stmt = $db->prepare("SELECT start_time, late_after FROM attendance_schedules WHERE section_id = ?");
        $stmt->bind_param('i', $section_id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($row) return $row;
    }
    $row = $db->query("SELECT start_time, late_after FROM attendance_schedules WHERE section_id IS NULL LIMIT 1")->fetch_assoc();
    return $row ?: ['start_time' => '07:30:00', 'late_after' => '07:45:00'];
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
