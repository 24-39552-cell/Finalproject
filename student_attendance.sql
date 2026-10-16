-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 16, 2026 at 04:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student attendance`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_label` varchar(180) NOT NULL DEFAULT 'System',
  `action` varchar(100) NOT NULL,
  `details` text NOT NULL DEFAULT '',
  `result` enum('Success','Failed') NOT NULL DEFAULT 'Success',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `user_label`, `action`, `details`, `result`, `ip_address`, `created_at`) VALUES
(1, NULL, 'System Administrator', 'LOGIN', 'System Administrator signed in', 'Success', '::1', '2026-10-16 20:45:52'),
(2, NULL, 'System Administrator', 'LOGIN', 'System Administrator signed in', 'Success', '::1', '2026-10-16 21:26:19'),
(3, NULL, 'System Administrator', 'LOGIN', 'System Administrator signed in', 'Success', '::1', '2026-10-16 21:30:47'),
(4, NULL, 'System Administrator', 'SECTION_CREATED', 'MATH', 'Success', '::1', '2026-10-16 21:31:42'),
(5, NULL, 'System Administrator', 'STUDENT_CREATED', 'Steven Mercado (24-39552)', 'Success', '::1', '2026-10-16 21:32:00'),
(6, NULL, 'System Administrator', 'ACCOUNT_CREATED', 'Mico Lazo (Teacher)', 'Success', '::1', '2026-10-16 21:33:48'),
(7, NULL, 'System Administrator', 'ACCOUNT_DEACTIVATED', 'Mico Lazo', 'Success', '::1', '2026-10-16 21:33:56'),
(8, NULL, 'System Administrator', 'ACCOUNT_ACTIVATED', 'Mico Lazo', 'Success', '::1', '2026-10-16 21:33:58'),
(9, NULL, 'System Administrator', 'ACCOUNT_DEACTIVATED', 'Mico Lazo', 'Success', '::1', '2026-10-16 21:34:28'),
(10, NULL, 'admin', 'LOGIN', 'Failed login attempt for: admin', 'Failed', '::1', '2026-10-16 21:34:47'),
(11, NULL, 'admin', 'LOGIN', 'Failed login attempt for: admin', 'Failed', '::1', '2026-10-16 21:35:01'),
(12, NULL, 'admin@gmail.com', 'LOGIN', 'Failed login attempt for: admin@gmail.com', 'Failed', '::1', '2026-10-16 21:37:04'),
(13, NULL, 'venn', 'LOGIN', 'Failed login attempt for: venn', 'Failed', '::1', '2026-10-16 21:37:14'),
(14, NULL, 'System', 'ACCOUNT_CREATED', 'Created administrator account Admin (admin2).', 'Success', NULL, '2026-10-16 21:41:35'),
(15, 4, 'Admin', 'LOGIN', 'Admin signed in', 'Success', '::1', '2026-10-16 21:42:35'),
(16, 4, 'Admin', 'ACCOUNT_CREATED', 'Mico Lazo (Teacher)', 'Success', '::1', '2026-10-16 21:43:34'),
(17, 4, 'Admin', 'ACCOUNT_DEACTIVATED', 'Mico Lazo', 'Success', '::1', '2026-10-16 21:44:00'),
(18, 4, 'Admin', 'ACCOUNT_ACTIVATED', 'Mico Lazo', 'Success', '::1', '2026-10-16 21:44:06'),
(19, 4, 'Admin', 'LOGOUT', 'User signed out', 'Success', '::1', '2026-10-16 21:44:15'),
(20, 5, 'Mico Lazo', 'LOGIN', 'Mico Lazo signed in', 'Success', '::1', '2026-10-16 21:44:44'),
(21, 5, 'Mico Lazo', 'LOGIN', 'Mico Lazo signed in', 'Success', '::1', '2026-10-16 21:58:07'),
(22, NULL, 'admin', 'LOGIN', 'Failed login attempt for: admin', 'Failed', '::1', '2026-10-16 21:59:30'),
(23, NULL, 'admin', 'LOGIN', 'Failed login attempt for: admin', 'Failed', '::1', '2026-10-16 21:59:33'),
(24, 4, 'Admin', 'LOGIN', 'Admin signed in', 'Success', '::1', '2026-10-16 22:00:40'),
(25, 4, 'Admin', 'ATTENDANCE_MARKED', 'Steven Mercado on 2026-10-16: Present (Manual)', 'Success', '::1', '2026-10-16 22:01:20'),
(26, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (1 students)', 'Success', '::1', '2026-10-16 22:03:02'),
(27, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (1 students)', 'Success', '::1', '2026-10-16 22:03:04'),
(28, 4, 'Admin', 'REPORT_EXPORTED', 'Daily report 2026-10-16', 'Success', '::1', '2026-10-16 22:03:06'),
(29, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (1 students)', 'Success', '::1', '2026-10-16 22:03:20'),
(30, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (1 students)', 'Success', '::1', '2026-10-16 22:08:26'),
(31, 4, 'Admin', 'LOGIN', 'Admin signed in', 'Success', '::1', '2026-10-16 22:23:23'),
(32, 4, 'Admin', 'STUDENT_DEACTIVATED', 'Steven Mercado', 'Success', '::1', '2026-10-16 22:23:29'),
(33, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (0 students)', 'Success', '::1', '2026-10-16 22:24:03'),
(34, 4, 'Admin', 'LOGOUT', 'User signed out', 'Success', '::1', '2026-10-16 22:24:06'),
(35, NULL, 'micolazo@gmail.com', 'LOGIN', 'Failed login attempt for: micolazo@gmail.com', 'Failed', '::1', '2026-10-16 22:24:29'),
(36, 5, 'Mico Lazo', 'LOGIN', 'Mico Lazo signed in', 'Success', '::1', '2026-10-16 22:24:43'),
(37, NULL, 'admin', 'LOGIN', 'Failed login attempt for: admin', 'Failed', '::1', '2026-10-16 22:26:18'),
(38, 4, 'Admin', 'LOGIN', 'Admin signed in', 'Success', '::1', '2026-10-16 22:26:42'),
(39, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (0 students)', 'Success', '::1', '2026-10-16 22:26:48'),
(40, 4, 'Admin', 'REPORT_GENERATED', 'Daily report 2026-10-16 (0 students)', 'Success', '::1', '2026-10-16 22:26:49'),
(41, 4, 'Admin', 'SECTION_CREATED', 'SCIENCE', 'Success', '::1', '2026-10-16 22:27:06'),
(42, 4, 'Admin', 'LOGOUT', 'User signed out', 'Success', '::1', '2026-10-16 22:27:08'),
(43, 5, 'Mico Lazo', 'LOGIN', 'Mico Lazo signed in', 'Success', '::1', '2026-10-16 22:27:22'),
(44, 3, 'System Administrator', 'LOGIN', 'System Administrator signed in', 'Success', '::1', '2026-10-16 22:28:19'),
(45, 3, 'System Administrator', 'REPORT_GENERATED', 'Daily report 2026-10-16 (0 students)', 'Success', '::1', '2026-10-16 22:28:23'),
(46, 3, 'System Administrator', 'REPORT_GENERATED', 'Daily report 2026-10-16 (0 students)', 'Success', '::1', '2026-10-16 22:28:36'),
(47, 3, 'System Administrator', 'LOGOUT', 'User signed out', 'Success', '::1', '2026-10-16 22:28:54'),
(48, 5, 'Mico Lazo', 'LOGIN', 'Mico Lazo signed in', 'Success', '::1', '2026-10-16 22:33:12');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `status` enum('Present','Late','Absent','Excused') NOT NULL,
  `method` enum('Facial Recognition','Fingerprint','Manual') NOT NULL DEFAULT 'Manual',
  `device_id` int(10) UNSIGNED DEFAULT NULL,
  `corrected_by` int(10) UNSIGNED DEFAULT NULL,
  `corrected_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `date`, `time_in`, `status`, `method`, `device_id`, `corrected_by`, `corrected_at`, `created_at`) VALUES
(1, 1, '2026-10-16', '22:01:00', 'Present', 'Manual', NULL, NULL, NULL, '2026-10-16 22:01:20');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_schedules`
--

CREATE TABLE `attendance_schedules` (
  `id` int(10) UNSIGNED NOT NULL,
  `section_id` int(10) UNSIGNED DEFAULT NULL,
  `start_time` time NOT NULL DEFAULT '07:30:00',
  `late_after` time NOT NULL DEFAULT '07:45:00',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance_schedules`
--

INSERT INTO `attendance_schedules` (`id`, `section_id`, `start_time`, `late_after`, `updated_at`) VALUES
(1, NULL, '07:30:00', '07:45:00', '2026-10-16 20:44:58'),
(2, NULL, '07:30:00', '07:45:00', '2026-10-16 20:45:36'),
(3, NULL, '07:30:00', '07:45:00', '2026-10-16 20:45:52'),
(4, NULL, '07:30:00', '07:45:00', '2026-10-16 21:22:45'),
(5, NULL, '07:30:00', '07:45:00', '2026-10-16 21:23:51'),
(6, NULL, '07:30:00', '07:45:00', '2026-10-16 21:24:02'),
(7, NULL, '07:30:00', '07:45:00', '2026-10-16 21:24:23'),
(8, NULL, '07:30:00', '07:45:00', '2026-10-16 21:25:28'),
(9, NULL, '07:30:00', '07:45:00', '2026-10-16 21:25:28'),
(10, NULL, '07:30:00', '07:45:00', '2026-10-16 21:26:19'),
(11, NULL, '07:30:00', '07:45:00', '2026-10-16 21:26:19'),
(12, NULL, '07:30:00', '07:45:00', '2026-10-16 21:26:19'),
(13, NULL, '07:30:00', '07:45:00', '2026-10-16 21:26:22'),
(14, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:47'),
(15, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:48'),
(16, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:48'),
(17, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:53'),
(18, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:55'),
(19, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:55'),
(20, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:58'),
(21, NULL, '07:30:00', '07:45:00', '2026-10-16 21:30:58'),
(22, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:01'),
(23, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:05'),
(24, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:05'),
(25, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:06'),
(26, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:07'),
(27, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:30'),
(28, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:31'),
(29, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:31'),
(30, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:31'),
(31, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:42'),
(32, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:42'),
(33, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:42'),
(34, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:42'),
(35, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:45'),
(36, NULL, '07:30:00', '07:45:00', '2026-10-16 21:31:46'),
(37, NULL, '07:30:00', '07:45:00', '2026-10-16 21:32:00'),
(38, NULL, '07:30:00', '07:45:00', '2026-10-16 21:32:00'),
(39, NULL, '07:30:00', '07:45:00', '2026-10-16 21:32:26'),
(40, NULL, '07:30:00', '07:45:00', '2026-10-16 21:32:31'),
(41, NULL, '07:30:00', '07:45:00', '2026-10-16 21:32:32'),
(42, NULL, '07:30:00', '07:45:00', '2026-10-16 21:32:58'),
(43, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:11'),
(44, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:35'),
(45, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:48'),
(46, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:48'),
(47, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:53'),
(48, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:53'),
(49, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:54'),
(50, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:54'),
(51, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:55'),
(52, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:55'),
(53, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:55'),
(54, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:55'),
(55, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:56'),
(56, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:56'),
(57, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:58'),
(58, NULL, '07:30:00', '07:45:00', '2026-10-16 21:33:58'),
(59, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:00'),
(60, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:00'),
(61, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:00'),
(62, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:00'),
(63, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:02'),
(64, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:02'),
(65, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:02'),
(66, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:08'),
(67, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:09'),
(68, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:12'),
(69, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:12'),
(70, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:16'),
(71, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:17'),
(72, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:17'),
(73, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:17'),
(74, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:17'),
(75, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:17'),
(76, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(77, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(78, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(79, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(80, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(81, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(82, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(83, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(84, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:18'),
(85, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:22'),
(86, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:27'),
(87, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:27'),
(88, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:28'),
(89, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:28'),
(90, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:43'),
(91, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:43'),
(92, NULL, '07:30:00', '07:45:00', '2026-10-16 21:34:47'),
(93, NULL, '07:30:00', '07:45:00', '2026-10-16 21:35:01'),
(94, NULL, '07:30:00', '07:45:00', '2026-10-16 21:37:04'),
(95, NULL, '07:30:00', '07:45:00', '2026-10-16 21:37:14'),
(96, NULL, '07:30:00', '07:45:00', '2026-10-16 21:40:03'),
(97, NULL, '07:30:00', '07:45:00', '2026-10-16 21:40:14'),
(98, NULL, '07:30:00', '07:45:00', '2026-10-16 21:40:58'),
(99, NULL, '07:30:00', '07:45:00', '2026-10-16 21:41:03'),
(100, NULL, '07:30:00', '07:45:00', '2026-10-16 21:41:11'),
(101, NULL, '07:30:00', '07:45:00', '2026-10-16 21:41:35'),
(102, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:35'),
(103, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:35'),
(104, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:35'),
(105, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:38'),
(106, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:40'),
(107, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:43'),
(108, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:43'),
(109, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:48'),
(110, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:49'),
(111, NULL, '07:30:00', '07:45:00', '2026-10-16 21:42:58'),
(112, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:04'),
(113, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:11'),
(114, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:34'),
(115, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:34'),
(116, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:49'),
(117, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:49'),
(118, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:50'),
(119, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:54'),
(120, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:54'),
(121, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:55'),
(122, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:55'),
(123, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:55'),
(124, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:55'),
(125, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(126, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(127, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(128, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(129, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(130, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(131, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(132, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:56'),
(133, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:57'),
(134, NULL, '07:30:00', '07:45:00', '2026-10-16 21:43:57'),
(135, NULL, '07:30:00', '07:45:00', '2026-10-16 21:44:00'),
(136, NULL, '07:30:00', '07:45:00', '2026-10-16 21:44:00'),
(137, NULL, '07:30:00', '07:45:00', '2026-10-16 21:44:06'),
(138, NULL, '07:30:00', '07:45:00', '2026-10-16 21:44:06'),
(139, NULL, '07:30:00', '07:45:00', '2026-10-16 21:44:15'),
(140, NULL, '07:30:00', '07:45:00', '2026-10-16 21:44:44'),
(141, NULL, '07:30:00', '07:45:00', '2026-10-16 21:58:07'),
(142, NULL, '07:30:00', '07:45:00', '2026-10-16 21:59:30'),
(143, NULL, '07:30:00', '07:45:00', '2026-10-16 21:59:33'),
(144, NULL, '07:30:00', '07:45:00', '2026-10-16 22:00:40'),
(145, NULL, '07:30:00', '07:45:00', '2026-10-16 22:00:41'),
(146, NULL, '07:30:00', '07:45:00', '2026-10-16 22:00:41'),
(147, NULL, '07:30:00', '07:45:00', '2026-10-16 22:00:42'),
(148, NULL, '07:30:00', '07:45:00', '2026-10-16 22:00:47'),
(149, NULL, '07:30:00', '07:45:00', '2026-10-16 22:00:54'),
(150, NULL, '07:30:00', '07:45:00', '2026-10-16 22:01:13'),
(151, NULL, '07:30:00', '07:45:00', '2026-10-16 22:01:16'),
(152, NULL, '07:30:00', '07:45:00', '2026-10-16 22:01:16'),
(153, NULL, '07:30:00', '07:45:00', '2026-10-16 22:01:20'),
(154, NULL, '07:30:00', '07:45:00', '2026-10-16 22:01:20'),
(155, NULL, '07:30:00', '07:45:00', '2026-10-16 22:02:27'),
(156, NULL, '07:30:00', '07:45:00', '2026-10-16 22:02:45'),
(157, NULL, '07:30:00', '07:45:00', '2026-10-16 22:02:51'),
(158, NULL, '07:30:00', '07:45:00', '2026-10-16 22:02:51'),
(159, NULL, '07:30:00', '07:45:00', '2026-10-16 22:02:51'),
(160, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:02'),
(161, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:04'),
(162, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:04'),
(163, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:04'),
(164, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:04'),
(165, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:06'),
(166, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:19'),
(167, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:20'),
(168, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:23'),
(169, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:23'),
(170, NULL, '07:30:00', '07:45:00', '2026-10-16 22:03:23'),
(171, NULL, '07:30:00', '07:45:00', '2026-10-16 22:07:52'),
(172, NULL, '07:30:00', '07:45:00', '2026-10-16 22:07:52'),
(173, NULL, '07:30:00', '07:45:00', '2026-10-16 22:07:55'),
(174, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:08'),
(175, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:11'),
(176, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:14'),
(177, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:21'),
(178, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:23'),
(179, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:23'),
(180, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:23'),
(181, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:26'),
(182, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:26'),
(183, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:26'),
(184, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:26'),
(185, NULL, '07:30:00', '07:45:00', '2026-10-16 22:08:26'),
(186, NULL, '07:30:00', '07:45:00', '2026-10-16 22:09:20'),
(187, NULL, '07:30:00', '07:45:00', '2026-10-16 22:09:30'),
(188, NULL, '07:30:00', '07:45:00', '2026-10-16 22:15:06'),
(189, NULL, '07:30:00', '07:45:00', '2026-10-16 22:15:07'),
(190, NULL, '07:30:00', '07:45:00', '2026-10-16 22:15:07'),
(191, NULL, '07:30:00', '07:45:00', '2026-10-16 22:15:07'),
(192, NULL, '07:30:00', '07:45:00', '2026-10-16 22:19:48'),
(193, NULL, '07:30:00', '07:45:00', '2026-10-16 22:22:14'),
(194, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:23'),
(195, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:26'),
(196, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:29'),
(197, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:29'),
(198, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:51'),
(199, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:54'),
(200, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:54'),
(201, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:55'),
(202, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:56'),
(203, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:58'),
(204, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:58'),
(205, NULL, '07:30:00', '07:45:00', '2026-10-16 22:23:58'),
(206, NULL, '07:30:00', '07:45:00', '2026-10-16 22:24:03'),
(207, NULL, '07:30:00', '07:45:00', '2026-10-16 22:24:04'),
(208, NULL, '07:30:00', '07:45:00', '2026-10-16 22:24:06'),
(209, NULL, '07:30:00', '07:45:00', '2026-10-16 22:24:29'),
(210, NULL, '07:30:00', '07:45:00', '2026-10-16 22:24:43'),
(211, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:18'),
(212, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:42'),
(213, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:42'),
(214, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:43'),
(215, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:43'),
(216, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:44'),
(217, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:44'),
(218, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:48'),
(219, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:49'),
(220, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:49'),
(221, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:49'),
(222, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:50'),
(223, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:51'),
(224, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:51'),
(225, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:52'),
(226, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:52'),
(227, NULL, '07:30:00', '07:45:00', '2026-10-16 22:26:52'),
(228, NULL, '07:30:00', '07:45:00', '2026-10-16 22:27:06'),
(229, NULL, '07:30:00', '07:45:00', '2026-10-16 22:27:06'),
(230, NULL, '07:30:00', '07:45:00', '2026-10-16 22:27:06'),
(231, NULL, '07:30:00', '07:45:00', '2026-10-16 22:27:08'),
(232, NULL, '07:30:00', '07:45:00', '2026-10-16 22:27:21'),
(233, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:19'),
(234, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:20'),
(235, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:20'),
(236, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:21'),
(237, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:22'),
(238, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:22'),
(239, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:23'),
(240, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:24'),
(241, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:24'),
(242, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:25'),
(243, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:25'),
(244, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:26'),
(245, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:30'),
(246, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:31'),
(247, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:34'),
(248, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:36'),
(249, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:36'),
(250, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:36'),
(251, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:36'),
(252, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:39'),
(253, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:40'),
(254, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:50'),
(255, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:53'),
(256, NULL, '07:30:00', '07:45:00', '2026-10-16 22:28:54'),
(257, NULL, '07:30:00', '07:45:00', '2026-10-16 22:33:12'),
(258, NULL, '07:30:00', '07:45:00', '2026-10-16 22:34:05'),
(259, NULL, '07:30:00', '07:45:00', '2026-10-16 22:34:18');

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int(10) UNSIGNED NOT NULL,
  `device_key` varchar(64) NOT NULL,
  `device_code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(180) NOT NULL DEFAULT '',
  `status` enum('Online','Offline','Error','Maintenance') NOT NULL DEFAULT 'Offline',
  `last_seen` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade_level` varchar(50) NOT NULL DEFAULT '',
  `school_year` varchar(20) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `name`, `grade_level`, `school_year`, `created_at`) VALUES
(1, 'MATH', 'Grade 10', '2026-2027', '2026-10-16 21:31:42'),
(2, 'SCIENCE', 'Grade 9', '2026-2027', '2026-10-16 22:27:06');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `token` varchar(128) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`token`, `user_id`, `expires_at`, `created_at`) VALUES
('2e75eb75ac94c998bd5b8b85910f93f850301f89a7f86ae45d0934c90fad4089', 5, '2026-10-17 00:27:21', '2026-10-16 22:27:21'),
('624a86e080181335196a43b9adcad12242206134a0e8462a9dbf6fefd334de59', 5, '2026-10-17 00:24:43', '2026-10-16 22:24:43'),
('b7316e52515770d49f4bacb594669514bdf139371e9320eb49db465fabc83ebd', 5, '2026-10-16 23:44:44', '2026-10-16 21:44:44'),
('cb63052cf8e1c9b7f88b390793669da48d609aeef1bc6481a158e5b8513e485d', 4, '2026-10-17 00:23:23', '2026-10-16 22:23:23'),
('d77b011e770110eee44938a6fe310bee94f5ff3a87600b7b20d109c2305d35ce', 5, '2026-10-17 00:33:12', '2026-10-16 22:33:12'),
('f6fcb630d6042f807b294276996d7947e4655ab1b25d45b0b322c61e5cdce94b', 5, '2026-10-16 23:58:07', '2026-10-16 21:58:07');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` varchar(30) NOT NULL,
  `full_name` varchar(180) NOT NULL,
  `section_id` int(10) UNSIGNED DEFAULT NULL,
  `school_year` varchar(20) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `face_registered` tinyint(1) NOT NULL DEFAULT 0,
  `fingerprint_registered` tinyint(1) NOT NULL DEFAULT 0,
  `fingerprint_template_id` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `full_name`, `section_id`, `school_year`, `is_active`, `face_registered`, `fingerprint_registered`, `fingerprint_template_id`, `created_at`, `updated_at`) VALUES
(1, '24-39552', 'Steven Mercado', 1, '2026-2027', 0, 0, 0, NULL, '2026-10-16 21:32:00', '2026-10-16 22:23:29');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_sections`
--

CREATE TABLE `teacher_sections` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `section_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(80) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Administrator','Teacher') NOT NULL,
  `full_name` varchar(180) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `full_name`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'admin', 'admin@school.edu.ph', '$2y$10$4gd8TeiF1haO5PitGrkhIu3J78I6RKuBPEEy.j4A/HMcJzeCvgjEa', 'Administrator', 'System Administrator', 1, '2026-10-16 21:40:58', '2026-10-16 21:40:58'),
(4, 'admin2', 'admin@gmail.com', '$2y$10$WYNj9CSmdZ92SV01eecCleSatTVDplHeeo9wy.yW7af1oqS/iyfQG', 'Administrator', 'Admin', 1, '2026-10-16 21:41:35', '2026-10-16 21:41:35'),
(5, 'mico', 'micolazo@gmail.com', '$2y$10$VgyMAxg6rVcUcvLhihBHWub/H3MMuYG75lOvLslSGT2iFdVx8oEbC', 'Teacher', 'Mico Lazo', 1, '2026-10-16 21:43:34', '2026-10-16 21:44:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_date` (`student_id`,`date`),
  ADD KEY `device_id` (`device_id`),
  ADD KEY `corrected_by` (`corrected_by`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `attendance_schedules`
--
ALTER TABLE `attendance_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_section` (`section_id`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_key` (`device_key`),
  ADD UNIQUE KEY `device_code` (`device_code`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_grade` (`grade_level`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`token`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `idx_section` (`section_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `teacher_sections`
--
ALTER TABLE `teacher_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_teacher_section` (`user_id`,`section_id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_active` (`is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance_schedules`
--
ALTER TABLE `attendance_schedules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=261;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teacher_sections`
--
ALTER TABLE `teacher_sections`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`corrected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance_schedules`
--
ALTER TABLE `attendance_schedules`
  ADD CONSTRAINT `attendance_schedules_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `teacher_sections`
--
ALTER TABLE `teacher_sections`
  ADD CONSTRAINT `teacher_sections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_sections_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
