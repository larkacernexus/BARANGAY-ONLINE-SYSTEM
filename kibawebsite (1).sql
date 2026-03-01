-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 17, 2026 at 02:22 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kibawebsite`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_logs`
--

CREATE TABLE `access_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `method` varchar(10) NOT NULL,
  `url` text NOT NULL,
  `route_name` varchar(255) DEFAULT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `status_code` int(11) NOT NULL,
  `response_time` int(11) DEFAULT NULL COMMENT 'Response time in milliseconds',
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'For sensitive operations' CHECK (json_valid(`response_data`)),
  `action_type` varchar(255) DEFAULT NULL COMMENT 'create, read, update, delete, login, logout, export',
  `resource_type` varchar(255) DEFAULT NULL COMMENT 'User, Payment, Resident, etc.',
  `resource_id` bigint(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_sensitive` tinyint(1) NOT NULL DEFAULT 0,
  `accessed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `batch_uuid` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(1, 'user', 'User created', 'App\\Models\\User', 'created', 1, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"admin@barangay.gov.ph\",\"username\":\"admin\",\"contact_number\":\"09171234567\",\"position\":null,\"role_id\":1,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(2, 'user', 'User created', 'App\\Models\\User', 'created', 2, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"captain@barangay.gov.ph\",\"username\":\"captain\",\"contact_number\":\"09171234568\",\"position\":null,\"role_id\":2,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(3, 'user', 'User created', 'App\\Models\\User', 'created', 3, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"secretary@barangay.gov.ph\",\"username\":\"secretary\",\"contact_number\":\"09171234569\",\"position\":null,\"role_id\":3,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(4, 'user', 'User created', 'App\\Models\\User', 'created', 4, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"treasurer@barangay.gov.ph\",\"username\":\"treasurer\",\"contact_number\":\"09171234570\",\"position\":null,\"role_id\":4,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(5, 'user', 'User created', 'App\\Models\\User', 'created', 5, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"treasury.officer@barangay.gov.ph\",\"username\":\"treasury_officer\",\"contact_number\":\"09171234571\",\"position\":null,\"role_id\":8,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(6, 'user', 'User created', 'App\\Models\\User', 'created', 6, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"records.clerk@barangay.gov.ph\",\"username\":\"records_clerk\",\"contact_number\":\"09171234572\",\"position\":null,\"role_id\":9,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(7, 'user', 'User created', 'App\\Models\\User', 'created', 7, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"clearance.officer@barangay.gov.ph\",\"username\":\"clearance_officer\",\"contact_number\":\"09171234573\",\"position\":null,\"role_id\":10,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(8, 'user', 'User created', 'App\\Models\\User', 'created', 8, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"staff1@barangay.gov.ph\",\"username\":\"staff1\",\"contact_number\":\"09171234574\",\"position\":null,\"role_id\":12,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(9, 'user', 'User created', 'App\\Models\\User', 'created', 9, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"staff2@barangay.gov.ph\",\"username\":\"staff2\",\"contact_number\":\"09171234575\",\"position\":null,\"role_id\":12,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(10, 'user', 'User created', 'App\\Models\\User', 'created', 10, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"viewer@barangay.gov.ph\",\"username\":\"viewer\",\"contact_number\":\"09171234576\",\"position\":null,\"role_id\":11,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(11, 'user', 'User created', 'App\\Models\\User', 'created', 11, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"kagawad1@barangay.gov.ph\",\"username\":\"kagawad1\",\"contact_number\":\"09171234577\",\"position\":null,\"role_id\":5,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(12, 'user', 'User created', 'App\\Models\\User', 'created', 12, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"kagawad2@barangay.gov.ph\",\"username\":\"kagawad2\",\"contact_number\":\"09171234578\",\"position\":null,\"role_id\":5,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(13, 'user', 'User created', 'App\\Models\\User', 'created', 13, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"kagawad3@barangay.gov.ph\",\"username\":\"kagawad3\",\"contact_number\":\"09171234579\",\"position\":null,\"role_id\":5,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(14, 'user', 'User created', 'App\\Models\\User', 'created', 14, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"sk.chairman@barangay.gov.ph\",\"username\":\"sk_chairman\",\"contact_number\":\"09171234580\",\"position\":null,\"role_id\":6,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(15, 'user', 'User created', 'App\\Models\\User', 'created', 15, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"sk.kagawad1@barangay.gov.ph\",\"username\":\"sk_kagawad1\",\"contact_number\":\"09171234581\",\"position\":null,\"role_id\":7,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(16, 'user', 'User created', 'App\\Models\\User', 'created', 16, NULL, NULL, '{\"attributes\":{\"first_name\":null,\"last_name\":null,\"email\":\"sk.kagawad2@barangay.gov.ph\",\"username\":\"sk_kagawad2\",\"contact_number\":\"09171234582\",\"position\":null,\"role_id\":7,\"status\":\"active\",\"household_id\":null,\"current_resident_id\":null}}', NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07'),
(17, 'households', 'Created new household: HH-001 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 1, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-001\",\"contact_number\":\"09123456789\",\"email\":\"dela.cruz.family@example.com\",\"address\":\"123 Mabini Street\",\"purok_id\":1,\"member_count\":1,\"income_range\":\"15000-25000\",\"housing_type\":\"Concrete\",\"ownership_status\":\"Owned\",\"water_source\":\"Municipal\",\"electricity\":true,\"internet\":true,\"vehicle\":true,\"remarks\":\"Registered voter family\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-001\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 22:54:40', '2026-02-15 22:54:40'),
(18, 'residents', 'Created new resident: Juan Santos Dela Cruz Jr. (ID: RES-2026-02-28191)', 'App\\Models\\Resident', 'created', 1, NULL, NULL, '{\"attributes\":{\"first_name\":\"Juan\",\"last_name\":\"Dela Cruz\",\"middle_name\":\"Santos\",\"suffix\":\"Jr.\",\"birth_date\":\"1985-06-15T00:00:00.000000Z\",\"age\":40,\"gender\":\"male\",\"civil_status\":\"Married\",\"contact_number\":\"09171234567\",\"email\":\"juan.delacruz@example.com\",\"address\":\"123 Main Street\",\"purok_id\":1,\"household_id\":1,\"occupation\":\"Farmer\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":\"Kibawe, Bukidnon\",\"remarks\":\"Active community member\",\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2026-02-28191\",\"full_name\":\"Juan Santos Dela Cruz Jr.\"}', NULL, '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(19, 'residents', 'Created new resident: Maria Lopez Santos (ID: RES-2026-02-58854)', 'App\\Models\\Resident', 'created', 2, NULL, NULL, '{\"attributes\":{\"first_name\":\"Maria\",\"last_name\":\"Santos\",\"middle_name\":\"Lopez\",\"suffix\":null,\"birth_date\":\"1990-03-22T00:00:00.000000Z\",\"age\":35,\"gender\":\"female\",\"civil_status\":\"Single\",\"contact_number\":\"09172345678\",\"email\":\"maria.santos@example.com\",\"address\":\"456 Oak Street\",\"purok_id\":2,\"household_id\":null,\"occupation\":\"Teacher\",\"education\":\"College Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":\"Cagayan de Oro City\",\"remarks\":\"Local school teacher\",\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2026-02-58854\",\"full_name\":\"Maria Lopez Santos\"}', NULL, '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(20, 'residents', 'Created new resident: Pedro Gonzales Reyes (ID: RES-2026-02-39874)', 'App\\Models\\Resident', 'created', 3, NULL, NULL, '{\"attributes\":{\"first_name\":\"Pedro\",\"last_name\":\"Reyes\",\"middle_name\":\"Gonzales\",\"suffix\":null,\"birth_date\":\"1950-12-10T00:00:00.000000Z\",\"age\":75,\"gender\":\"male\",\"civil_status\":\"Widowed\",\"contact_number\":\"09173456789\",\"email\":\"pedro.reyes@example.com\",\"address\":\"789 Pine Street\",\"purok_id\":3,\"household_id\":null,\"occupation\":\"Retired\",\"education\":\"Elementary Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":true,\"is_solo_parent\":false,\"is_indigent\":true,\"place_of_birth\":\"Kibawe, Bukidnon\",\"remarks\":\"Senior citizen, needs assistance\",\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2026-02-39874\",\"full_name\":\"Pedro Gonzales Reyes\"}', NULL, '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(21, 'residents', 'Created new resident: Ana Villanueva Fernandez (ID: RES-2026-02-86192)', 'App\\Models\\Resident', 'created', 4, NULL, NULL, '{\"attributes\":{\"first_name\":\"Ana\",\"last_name\":\"Fernandez\",\"middle_name\":\"Villanueva\",\"suffix\":null,\"birth_date\":\"1988-07-19T00:00:00.000000Z\",\"age\":37,\"gender\":\"female\",\"civil_status\":\"Single\",\"contact_number\":\"09174567890\",\"email\":\"ana.fernandez@example.com\",\"address\":\"321 Acacia Street\",\"purok_id\":4,\"household_id\":null,\"occupation\":\"Self-employed\",\"education\":\"College Level\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":true,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":\"Bukidnon\",\"remarks\":\"PWD member\",\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2026-02-86192\",\"full_name\":\"Ana Villanueva Fernandez\"}', NULL, '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(22, 'residents', 'Created new resident: Luz Mercado Villanueva (ID: RES-2026-02-19011)', 'App\\Models\\Resident', 'created', 5, NULL, NULL, '{\"attributes\":{\"first_name\":\"Luz\",\"last_name\":\"Villanueva\",\"middle_name\":\"Mercado\",\"suffix\":null,\"birth_date\":\"1982-09-14T00:00:00.000000Z\",\"age\":43,\"gender\":\"female\",\"civil_status\":\"Single Parent\",\"contact_number\":\"09175678901\",\"email\":\"luz.villanueva@example.com\",\"address\":\"654 Bamboo Street\",\"purok_id\":5,\"household_id\":null,\"occupation\":\"Market Vendor\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":true,\"is_indigent\":true,\"place_of_birth\":\"Kibawe, Bukidnon\",\"remarks\":\"Solo parent with 2 children\",\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2026-02-19011\",\"full_name\":\"Luz Mercado Villanueva\"}', NULL, '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(23, 'residents', 'Created new resident: Juan Dela Cruz (ID: RES-2529)', 'App\\Models\\Resident', 'created', 6, NULL, NULL, '{\"attributes\":{\"first_name\":\"Juan\",\"last_name\":\"Dela Cruz\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1980-05-15T00:00:00.000000Z\",\"age\":45,\"gender\":\"male\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"123 Mabini Street\",\"purok_id\":1,\"household_id\":1,\"occupation\":\"Government Employee\",\"education\":\"College Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2529\",\"full_name\":\"Juan Dela Cruz\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(24, 'residents', 'Created new resident: Maria Dela Cruz (ID: RES-9233)', 'App\\Models\\Resident', 'created', 7, NULL, NULL, '{\"attributes\":{\"first_name\":\"Maria\",\"last_name\":\"Dela Cruz\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1982-08-22T00:00:00.000000Z\",\"age\":43,\"gender\":\"female\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"123 Mabini Street\",\"purok_id\":1,\"household_id\":1,\"occupation\":\"Teacher\",\"education\":\"College Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-9233\",\"full_name\":\"Maria Dela Cruz\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(25, 'residents', 'Created new resident: Jose Dela Cruz (ID: RES-2602)', 'App\\Models\\Resident', 'created', 8, NULL, NULL, '{\"attributes\":{\"first_name\":\"Jose\",\"last_name\":\"Dela Cruz\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2008-03-10T00:00:00.000000Z\",\"age\":17,\"gender\":\"male\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"123 Mabini Street\",\"purok_id\":1,\"household_id\":1,\"occupation\":\"Student\",\"education\":\"High School\",\"religion\":\"Roman Catholic\",\"is_voter\":false,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2602\",\"full_name\":\"Jose Dela Cruz\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(26, 'residents', 'Created new resident: Ana Dela Cruz (ID: RES-8069)', 'App\\Models\\Resident', 'created', 9, NULL, NULL, '{\"attributes\":{\"first_name\":\"Ana\",\"last_name\":\"Dela Cruz\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2010-11-18T00:00:00.000000Z\",\"age\":15,\"gender\":\"female\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"123 Mabini Street\",\"purok_id\":1,\"household_id\":1,\"occupation\":\"Student\",\"education\":\"Elementary\",\"religion\":\"Roman Catholic\",\"is_voter\":false,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-8069\",\"full_name\":\"Ana Dela Cruz\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(27, 'households', 'Updated household: HH-001 (Head: Juan Dela Cruz)', 'App\\Models\\Household', 'updated', 1, NULL, NULL, '{\"attributes\":{\"member_count\":4},\"old\":{\"member_count\":1},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-001\",\"head_of_household\":\"Juan Dela Cruz\",\"member_count\":4,\"changes\":{\"member_count\":4,\"updated_at\":\"2026-02-16 07:59:21\"},\"old_values\":{\"member_count\":1,\"updated_at\":\"2026-02-16T06:54:40.000000Z\"}}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(28, 'households', 'Created new household: HH-002 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 4, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-002\",\"contact_number\":\"09234567890\",\"email\":\"santos.family@example.com\",\"address\":\"456 Rizal Avenue\",\"purok_id\":2,\"member_count\":1,\"income_range\":\"25000-35000\",\"housing_type\":\"Concrete\",\"ownership_status\":\"Mortgage\",\"water_source\":\"Municipal\",\"electricity\":true,\"internet\":true,\"vehicle\":true,\"remarks\":\"Small business owners\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-002\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(29, 'residents', 'Created new resident: Pedro Santos (ID: RES-5913)', 'App\\Models\\Resident', 'created', 10, NULL, NULL, '{\"attributes\":{\"first_name\":\"Pedro\",\"last_name\":\"Santos\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1975-02-20T00:00:00.000000Z\",\"age\":50,\"gender\":\"male\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"456 Rizal Avenue\",\"purok_id\":2,\"household_id\":4,\"occupation\":\"Business Owner\",\"education\":\"College Graduate\",\"religion\":\"Iglesia Ni Cristo\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-5913\",\"full_name\":\"Pedro Santos\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(30, 'residents', 'Created new resident: Elena Santos (ID: RES-1742)', 'App\\Models\\Resident', 'created', 11, NULL, NULL, '{\"attributes\":{\"first_name\":\"Elena\",\"last_name\":\"Santos\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1978-07-12T00:00:00.000000Z\",\"age\":47,\"gender\":\"female\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"456 Rizal Avenue\",\"purok_id\":2,\"household_id\":4,\"occupation\":\"Business Owner\",\"education\":\"College Graduate\",\"religion\":\"Iglesia Ni Cristo\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-1742\",\"full_name\":\"Elena Santos\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(31, 'residents', 'Created new resident: Carlos Santos (ID: RES-2083)', 'App\\Models\\Resident', 'created', 12, NULL, NULL, '{\"attributes\":{\"first_name\":\"Carlos\",\"last_name\":\"Santos\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2005-09-30T00:00:00.000000Z\",\"age\":20,\"gender\":\"male\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"456 Rizal Avenue\",\"purok_id\":2,\"household_id\":4,\"occupation\":\"Student\",\"education\":\"Senior High\",\"religion\":\"Iglesia Ni Cristo\",\"is_voter\":false,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2083\",\"full_name\":\"Carlos Santos\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(32, 'households', 'Updated household: HH-002 (Head: Pedro Santos)', 'App\\Models\\Household', 'updated', 4, NULL, NULL, '{\"attributes\":{\"member_count\":3},\"old\":{\"member_count\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-002\",\"head_of_household\":\"Pedro Santos\",\"member_count\":3,\"changes\":{\"member_count\":3},\"old_values\":[]}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(33, 'households', 'Created new household: HH-003 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 5, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-003\",\"contact_number\":\"09345678901\",\"email\":\"reyes.family@example.com\",\"address\":\"789 Bonifacio Street\",\"purok_id\":3,\"member_count\":1,\"income_range\":\"5000-15000\",\"housing_type\":\"Semi-Concrete\",\"ownership_status\":\"Rented\",\"water_source\":\"Deep Well\",\"electricity\":true,\"internet\":false,\"vehicle\":false,\"remarks\":\"Extended family living together\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-003\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(34, 'residents', 'Created new resident: Miguel Reyes (ID: RES-7880)', 'App\\Models\\Resident', 'created', 13, NULL, NULL, '{\"attributes\":{\"first_name\":\"Miguel\",\"last_name\":\"Reyes\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1988-12-05T00:00:00.000000Z\",\"age\":37,\"gender\":\"male\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"789 Bonifacio Street\",\"purok_id\":3,\"household_id\":5,\"occupation\":\"Construction Worker\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-7880\",\"full_name\":\"Miguel Reyes\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(35, 'residents', 'Created new resident: Teresa Reyes (ID: RES-8945)', 'App\\Models\\Resident', 'created', 14, NULL, NULL, '{\"attributes\":{\"first_name\":\"Teresa\",\"last_name\":\"Reyes\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1990-04-18T00:00:00.000000Z\",\"age\":35,\"gender\":\"female\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"789 Bonifacio Street\",\"purok_id\":3,\"household_id\":5,\"occupation\":\"Housewife\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-8945\",\"full_name\":\"Teresa Reyes\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(36, 'residents', 'Created new resident: Rosa Reyes (ID: RES-2495)', 'App\\Models\\Resident', 'created', 15, NULL, NULL, '{\"attributes\":{\"first_name\":\"Rosa\",\"last_name\":\"Reyes\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2012-06-25T00:00:00.000000Z\",\"age\":13,\"gender\":\"female\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"789 Bonifacio Street\",\"purok_id\":3,\"household_id\":5,\"occupation\":\"Student\",\"education\":\"Elementary\",\"religion\":\"Roman Catholic\",\"is_voter\":false,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-2495\",\"full_name\":\"Rosa Reyes\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(37, 'residents', 'Created new resident: Lito Reyes (ID: RES-7401)', 'App\\Models\\Resident', 'created', 16, NULL, NULL, '{\"attributes\":{\"first_name\":\"Lito\",\"last_name\":\"Reyes\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1955-03-08T00:00:00.000000Z\",\"age\":70,\"gender\":\"male\",\"civil_status\":\"Widowed\",\"contact_number\":null,\"email\":null,\"address\":\"789 Bonifacio Street\",\"purok_id\":3,\"household_id\":5,\"occupation\":\"Retired\",\"education\":\"Elementary Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":true,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-7401\",\"full_name\":\"Lito Reyes\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(38, 'households', 'Updated household: HH-003 (Head: Miguel Reyes)', 'App\\Models\\Household', 'updated', 5, NULL, NULL, '{\"attributes\":{\"member_count\":4},\"old\":{\"member_count\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-003\",\"head_of_household\":\"Miguel Reyes\",\"member_count\":4,\"changes\":{\"member_count\":4},\"old_values\":[]}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(39, 'households', 'Created new household: HH-004 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 6, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-004\",\"contact_number\":\"09456789012\",\"email\":\"garcia.family@example.com\",\"address\":\"1010 Luna Street\",\"purok_id\":4,\"member_count\":1,\"income_range\":\"Below 5000\",\"housing_type\":\"Light Materials\",\"ownership_status\":\"Owned\",\"water_source\":\"Deep Well\",\"electricity\":true,\"internet\":false,\"vehicle\":false,\"remarks\":\"Senior citizens living alone\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-004\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(40, 'residents', 'Created new resident: Anita Garcia (ID: RES-1126)', 'App\\Models\\Resident', 'created', 17, NULL, NULL, '{\"attributes\":{\"first_name\":\"Anita\",\"last_name\":\"Garcia\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1950-01-15T00:00:00.000000Z\",\"age\":76,\"gender\":\"female\",\"civil_status\":\"Widowed\",\"contact_number\":null,\"email\":null,\"address\":\"1010 Luna Street\",\"purok_id\":4,\"household_id\":6,\"occupation\":\"Retired\",\"education\":\"Elementary Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":true,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-1126\",\"full_name\":\"Anita Garcia\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(41, 'households', 'Updated household: HH-004 (Head: Anita Garcia)', 'App\\Models\\Household', 'updated', 6, NULL, NULL, '{\"attributes\":{\"member_count\":1},\"old\":{\"member_count\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-004\",\"head_of_household\":\"Anita Garcia\",\"member_count\":1,\"changes\":{\"member_count\":1},\"old_values\":[]}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(42, 'households', 'Created new household: HH-005 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 7, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-005\",\"contact_number\":\"09567890123\",\"email\":\"fernandez.family@example.com\",\"address\":\"1111 Mabuhay Street\",\"purok_id\":5,\"member_count\":1,\"income_range\":\"15000-25000\",\"housing_type\":\"Concrete\",\"ownership_status\":\"Owned\",\"water_source\":\"Municipal\",\"electricity\":true,\"internet\":true,\"vehicle\":true,\"remarks\":\"Large extended family\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-005\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(43, 'residents', 'Created new resident: Ramon Fernandez (ID: RES-4172)', 'App\\Models\\Resident', 'created', 18, NULL, NULL, '{\"attributes\":{\"first_name\":\"Ramon\",\"last_name\":\"Fernandez\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1972-09-10T00:00:00.000000Z\",\"age\":53,\"gender\":\"male\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"1111 Mabuhay Street\",\"purok_id\":5,\"household_id\":7,\"occupation\":\"Driver\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-4172\",\"full_name\":\"Ramon Fernandez\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(44, 'residents', 'Created new resident: Luz Fernandez (ID: RES-9275)', 'App\\Models\\Resident', 'created', 19, NULL, NULL, '{\"attributes\":{\"first_name\":\"Luz\",\"last_name\":\"Fernandez\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1975-11-22T00:00:00.000000Z\",\"age\":50,\"gender\":\"female\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"1111 Mabuhay Street\",\"purok_id\":5,\"household_id\":7,\"occupation\":\"Vendor\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-9275\",\"full_name\":\"Luz Fernandez\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(45, 'residents', 'Created new resident: Mark Fernandez (ID: RES-1492)', 'App\\Models\\Resident', 'created', 20, NULL, NULL, '{\"attributes\":{\"first_name\":\"Mark\",\"last_name\":\"Fernandez\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1998-07-14T00:00:00.000000Z\",\"age\":27,\"gender\":\"male\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"1111 Mabuhay Street\",\"purok_id\":5,\"household_id\":7,\"occupation\":\"Call Center Agent\",\"education\":\"College Level\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-1492\",\"full_name\":\"Mark Fernandez\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(46, 'residents', 'Created new resident: Joy Fernandez (ID: RES-0358)', 'App\\Models\\Resident', 'created', 21, NULL, NULL, '{\"attributes\":{\"first_name\":\"Joy\",\"last_name\":\"Fernandez\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2000-03-28T00:00:00.000000Z\",\"age\":25,\"gender\":\"female\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"1111 Mabuhay Street\",\"purok_id\":5,\"household_id\":7,\"occupation\":\"Student\",\"education\":\"College\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-0358\",\"full_name\":\"Joy Fernandez\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(47, 'residents', 'Created new resident: Ben Fernandez (ID: RES-4917)', 'App\\Models\\Resident', 'created', 22, NULL, NULL, '{\"attributes\":{\"first_name\":\"Ben\",\"last_name\":\"Fernandez\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2003-12-05T00:00:00.000000Z\",\"age\":22,\"gender\":\"male\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"1111 Mabuhay Street\",\"purok_id\":5,\"household_id\":7,\"occupation\":\"Student\",\"education\":\"Senior High\",\"religion\":\"Roman Catholic\",\"is_voter\":false,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-4917\",\"full_name\":\"Ben Fernandez\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(48, 'households', 'Updated household: HH-005 (Head: Ramon Fernandez)', 'App\\Models\\Household', 'updated', 7, NULL, NULL, '{\"attributes\":{\"member_count\":5},\"old\":{\"member_count\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-005\",\"head_of_household\":\"Ramon Fernandez\",\"member_count\":5,\"changes\":{\"member_count\":5},\"old_values\":[]}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(49, 'households', 'Created new household: HH-006 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 8, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-006\",\"contact_number\":\"09678901234\",\"email\":\"villanueva.family@example.com\",\"address\":\"1212 Rizal Extension\",\"purok_id\":6,\"member_count\":1,\"income_range\":\"5000-15000\",\"housing_type\":\"Semi-Concrete\",\"ownership_status\":\"Rented\",\"water_source\":\"Deep Well\",\"electricity\":true,\"internet\":false,\"vehicle\":false,\"remarks\":\"Solo parent household\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-006\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(50, 'residents', 'Created new resident: Marites Villanueva (ID: RES-5203)', 'App\\Models\\Resident', 'created', 23, NULL, NULL, '{\"attributes\":{\"first_name\":\"Marites\",\"last_name\":\"Villanueva\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1985-06-19T00:00:00.000000Z\",\"age\":40,\"gender\":\"female\",\"civil_status\":\"Single Parent\",\"contact_number\":null,\"email\":null,\"address\":\"1212 Rizal Extension\",\"purok_id\":6,\"household_id\":8,\"occupation\":\"Laundry Worker\",\"education\":\"High School Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-5203\",\"full_name\":\"Marites Villanueva\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(51, 'residents', 'Created new resident: Kristine Villanueva (ID: RES-3191)', 'App\\Models\\Resident', 'created', 24, NULL, NULL, '{\"attributes\":{\"first_name\":\"Kristine\",\"last_name\":\"Villanueva\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2015-02-08T00:00:00.000000Z\",\"age\":11,\"gender\":\"female\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"1212 Rizal Extension\",\"purok_id\":6,\"household_id\":8,\"occupation\":\"Student\",\"education\":\"Elementary\",\"religion\":\"Roman Catholic\",\"is_voter\":false,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-3191\",\"full_name\":\"Kristine Villanueva\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(52, 'households', 'Updated household: HH-006 (Head: Marites Villanueva)', 'App\\Models\\Household', 'updated', 8, NULL, NULL, '{\"attributes\":{\"member_count\":2},\"old\":{\"member_count\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-006\",\"head_of_household\":\"Marites Villanueva\",\"member_count\":2,\"changes\":{\"member_count\":2},\"old_values\":[]}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(53, 'households', 'Created new household: HH-007 (Head: No Head Assigned)', 'App\\Models\\Household', 'created', 9, NULL, NULL, '{\"attributes\":{\"household_number\":\"HH-007\",\"contact_number\":\"09789012345\",\"email\":\"torres.family@example.com\",\"address\":\"1313 Bonifacio Street\",\"purok_id\":7,\"member_count\":1,\"income_range\":\"15000-25000\",\"housing_type\":\"Concrete\",\"ownership_status\":\"Owned\",\"water_source\":\"Municipal\",\"electricity\":true,\"internet\":true,\"vehicle\":true,\"remarks\":\"Household with PWD member\",\"status\":\"active\",\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-007\",\"head_of_household\":\"No Head Assigned\",\"member_count\":null}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(54, 'residents', 'Created new resident: Manuel Torres (ID: RES-6904)', 'App\\Models\\Resident', 'created', 25, NULL, NULL, '{\"attributes\":{\"first_name\":\"Manuel\",\"last_name\":\"Torres\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1970-10-30T00:00:00.000000Z\",\"age\":55,\"gender\":\"male\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"1313 Bonifacio Street\",\"purok_id\":7,\"household_id\":9,\"occupation\":\"Government Employee\",\"education\":\"College Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-6904\",\"full_name\":\"Manuel Torres\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(55, 'residents', 'Created new resident: Gloria Torres (ID: RES-0792)', 'App\\Models\\Resident', 'created', 26, NULL, NULL, '{\"attributes\":{\"first_name\":\"Gloria\",\"last_name\":\"Torres\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"1973-12-12T00:00:00.000000Z\",\"age\":52,\"gender\":\"female\",\"civil_status\":\"Married\",\"contact_number\":null,\"email\":null,\"address\":\"1313 Bonifacio Street\",\"purok_id\":7,\"household_id\":9,\"occupation\":\"Teacher\",\"education\":\"College Graduate\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":false,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-0792\",\"full_name\":\"Gloria Torres\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(56, 'residents', 'Created new resident: Kevin Torres (ID: RES-0493)', 'App\\Models\\Resident', 'created', 27, NULL, NULL, '{\"attributes\":{\"first_name\":\"Kevin\",\"last_name\":\"Torres\",\"middle_name\":null,\"suffix\":null,\"birth_date\":\"2001-04-25T00:00:00.000000Z\",\"age\":24,\"gender\":\"male\",\"civil_status\":\"Single\",\"contact_number\":null,\"email\":null,\"address\":\"1313 Bonifacio Street\",\"purok_id\":7,\"household_id\":9,\"occupation\":\"Student\",\"education\":\"College\",\"religion\":\"Roman Catholic\",\"is_voter\":true,\"is_pwd\":true,\"is_senior\":false,\"is_solo_parent\":false,\"is_indigent\":false,\"place_of_birth\":null,\"remarks\":null,\"status\":\"active\",\"photo_path\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"resident_id\":\"RES-0493\",\"full_name\":\"Kevin Torres\"}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(57, 'households', 'Updated household: HH-007 (Head: Manuel Torres)', 'App\\Models\\Household', 'updated', 9, NULL, NULL, '{\"attributes\":{\"member_count\":3},\"old\":{\"member_count\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-007\",\"head_of_household\":\"Manuel Torres\",\"member_count\":3,\"changes\":{\"member_count\":3},\"old_values\":[]}', NULL, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(58, 'user', 'User created', 'App\\Models\\User', 'created', 17, NULL, NULL, '{\"attributes\":{\"first_name\":\"Juan\",\"last_name\":\"Dela Cruz\",\"email\":\"juandelacruz@household.local\",\"username\":\"juandelacruz\",\"contact_number\":\"09123456789\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":1,\"current_resident_id\":6}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(59, 'households', 'Updated household: HH-001 (Head: Juan Dela Cruz)', 'App\\Models\\Household', 'updated', 1, NULL, NULL, '{\"attributes\":{\"user_id\":17},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-001\",\"head_of_household\":\"Juan Dela Cruz\",\"member_count\":4,\"changes\":{\"user_id\":17,\"updated_at\":\"2026-02-16 11:13:13\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(60, 'user', 'User created', 'App\\Models\\User', 'created', 18, NULL, NULL, '{\"attributes\":{\"first_name\":\"Pedro\",\"last_name\":\"Santos\",\"email\":\"pedrosantos@household.local\",\"username\":\"pedrosantos\",\"contact_number\":\"09234567890\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":4,\"current_resident_id\":10}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(61, 'households', 'Updated household: HH-002 (Head: Pedro Santos)', 'App\\Models\\Household', 'updated', 4, NULL, NULL, '{\"attributes\":{\"user_id\":18},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-002\",\"head_of_household\":\"Pedro Santos\",\"member_count\":3,\"changes\":{\"user_id\":18,\"updated_at\":\"2026-02-16 11:13:13\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(62, 'user', 'User created', 'App\\Models\\User', 'created', 19, NULL, NULL, '{\"attributes\":{\"first_name\":\"Miguel\",\"last_name\":\"Reyes\",\"email\":\"miguelreyes@household.local\",\"username\":\"miguelreyes\",\"contact_number\":\"09345678901\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":5,\"current_resident_id\":13}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(63, 'households', 'Updated household: HH-003 (Head: Miguel Reyes)', 'App\\Models\\Household', 'updated', 5, NULL, NULL, '{\"attributes\":{\"user_id\":19},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-003\",\"head_of_household\":\"Miguel Reyes\",\"member_count\":4,\"changes\":{\"user_id\":19,\"updated_at\":\"2026-02-16 11:13:13\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(64, 'user', 'User created', 'App\\Models\\User', 'created', 20, NULL, NULL, '{\"attributes\":{\"first_name\":\"Anita\",\"last_name\":\"Garcia\",\"email\":\"anitagarcia@household.local\",\"username\":\"anitagarcia\",\"contact_number\":\"09456789012\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":6,\"current_resident_id\":17}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(65, 'households', 'Updated household: HH-004 (Head: Anita Garcia)', 'App\\Models\\Household', 'updated', 6, NULL, NULL, '{\"attributes\":{\"user_id\":20},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-004\",\"head_of_household\":\"Anita Garcia\",\"member_count\":1,\"changes\":{\"user_id\":20,\"updated_at\":\"2026-02-16 11:13:13\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(66, 'user', 'User created', 'App\\Models\\User', 'created', 21, NULL, NULL, '{\"attributes\":{\"first_name\":\"Ramon\",\"last_name\":\"Fernandez\",\"email\":\"ramonfernandez@household.local\",\"username\":\"ramonfernandez\",\"contact_number\":\"09567890123\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":7,\"current_resident_id\":18}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(67, 'households', 'Updated household: HH-005 (Head: Ramon Fernandez)', 'App\\Models\\Household', 'updated', 7, NULL, NULL, '{\"attributes\":{\"user_id\":21},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-005\",\"head_of_household\":\"Ramon Fernandez\",\"member_count\":5,\"changes\":{\"user_id\":21,\"updated_at\":\"2026-02-16 11:13:13\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13'),
(68, 'user', 'User created', 'App\\Models\\User', 'created', 22, NULL, NULL, '{\"attributes\":{\"first_name\":\"Marites\",\"last_name\":\"Villanueva\",\"email\":\"maritesvillanueva@household.local\",\"username\":\"maritesvillanueva\",\"contact_number\":\"09678901234\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":8,\"current_resident_id\":23}}', NULL, '2026-02-16 03:13:14', '2026-02-16 03:13:14'),
(69, 'households', 'Updated household: HH-006 (Head: Marites Villanueva)', 'App\\Models\\Household', 'updated', 8, NULL, NULL, '{\"attributes\":{\"user_id\":22},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-006\",\"head_of_household\":\"Marites Villanueva\",\"member_count\":2,\"changes\":{\"user_id\":22,\"updated_at\":\"2026-02-16 11:13:14\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:14', '2026-02-16 03:13:14'),
(70, 'user', 'User created', 'App\\Models\\User', 'created', 23, NULL, NULL, '{\"attributes\":{\"first_name\":\"Manuel\",\"last_name\":\"Torres\",\"email\":\"manueltorres@household.local\",\"username\":\"manueltorres\",\"contact_number\":\"09789012345\",\"position\":null,\"role_id\":13,\"status\":\"active\",\"household_id\":9,\"current_resident_id\":25}}', NULL, '2026-02-16 03:13:14', '2026-02-16 03:13:14'),
(71, 'households', 'Updated household: HH-007 (Head: Manuel Torres)', 'App\\Models\\Household', 'updated', 9, NULL, NULL, '{\"attributes\":{\"user_id\":23},\"old\":{\"user_id\":null},\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Symfony\",\"household_number\":\"HH-007\",\"head_of_household\":\"Manuel Torres\",\"member_count\":3,\"changes\":{\"user_id\":23,\"updated_at\":\"2026-02-16 11:13:14\"},\"old_values\":{\"user_id\":null,\"updated_at\":\"2026-02-16T07:59:21.000000Z\"}}', NULL, '2026-02-16 03:13:14', '2026-02-16 03:13:14'),
(72, 'payments', 'Payment created - OR#BAR-20260216-168', 'App\\Models\\Payment', 'created', 1, 'App\\Models\\User', 1, '{\"attributes\":{\"or_number\":\"BAR-20260216-168\",\"payer_name\":\"Joy Fernandez\",\"total_amount\":\"50.00\",\"discount\":\"10.00\",\"amount_paid\":\"40.00\",\"payment_method\":\"cash\",\"status\":\"completed\",\"recorded_by\":1,\"clearance_type\":null,\"is_cleared\":false,\"remarks\":null}}', NULL, '2026-02-16 04:57:49', '2026-02-16 04:57:49');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('general','important','event','maintenance','other') NOT NULL DEFAULT 'general',
  `priority` int(11) NOT NULL DEFAULT 0 COMMENT 'Higher number = higher priority',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_position` varchar(255) DEFAULT NULL,
  `event_type` varchar(255) NOT NULL,
  `event_category` varchar(255) NOT NULL,
  `event` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject_name` varchar(255) DEFAULT NULL,
  `barangay_id` varchar(255) DEFAULT NULL,
  `office` varchar(255) DEFAULT NULL,
  `document_number` varchar(255) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'info',
  `status` enum('success','failed','pending') NOT NULL DEFAULT 'success',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `platform` varchar(255) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `transaction_type` varchar(255) DEFAULT NULL,
  `logged_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `backups`
--

CREATE TABLE `backups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `type` enum('full','database','files','residents','officials','financial','documents','custom') NOT NULL,
  `size` bigint(20) NOT NULL DEFAULT 0,
  `path` varchar(255) NOT NULL,
  `status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
  `compressed` tinyint(1) NOT NULL DEFAULT 1,
  `tables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tables`)),
  `storage_location` enum('local','s3','ftp') NOT NULL DEFAULT 'local',
  `contains_files` tinyint(1) NOT NULL DEFAULT 0,
  `contains_database` tinyint(1) NOT NULL DEFAULT 0,
  `file_count` int(11) NOT NULL DEFAULT 0,
  `checksum` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `restored_by` bigint(20) UNSIGNED DEFAULT NULL,
  `last_restored_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `backup_activities`
--

CREATE TABLE `backup_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `backup_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` enum('create','restore','download','delete','schedule','cleanup') NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `status` enum('success','failed','processing') NOT NULL DEFAULT 'processing',
  `duration` int(11) DEFAULT NULL COMMENT 'Duration in seconds',
  `file_size` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blotter_details`
--

CREATE TABLE `blotter_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `incident_id` bigint(20) UNSIGNED NOT NULL,
  `respondent_name` varchar(255) NOT NULL,
  `hearing_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-login:127.0.0.1|admin@barangaykibawe.ph', 'i:1;', 1771242788),
('laravel-cache-login:127.0.0.1|admin@barangaykibawe.ph:timer', 'i:1771242788;', 1771242788);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clearance_requests`
--

CREATE TABLE `clearance_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `clearance_type_id` bigint(20) UNSIGNED NOT NULL,
  `reference_number` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `specific_purpose` varchar(255) DEFAULT NULL,
  `urgency` enum('normal','rush','express') NOT NULL DEFAULT 'normal',
  `needed_date` date NOT NULL,
  `additional_requirements` text DEFAULT NULL,
  `fee_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','pending_payment','processing','approved','issued','rejected','cancelled','expired','paid') NOT NULL DEFAULT 'pending',
  `clearance_number` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `requirements_met` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements_met`)),
  `remarks` text DEFAULT NULL,
  `issuing_officer_name` varchar(255) DEFAULT NULL,
  `processed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `requested_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `issuing_officer_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clearance_request_documents`
--

CREATE TABLE `clearance_request_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `clearance_request_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clearance_types`
--

CREATE TABLE `clearance_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `processing_days` int(11) NOT NULL DEFAULT 3 COMMENT 'Estimated processing time in days',
  `validity_days` int(11) DEFAULT NULL COMMENT 'Number of days the clearance is valid',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `requires_payment` tinyint(1) NOT NULL DEFAULT 1,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 1,
  `is_online_only` tinyint(1) NOT NULL DEFAULT 0,
  `is_discountable` tinyint(1) NOT NULL DEFAULT 0,
  `eligibility_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON array of eligibility criteria' CHECK (json_valid(`eligibility_criteria`)),
  `purpose_options` text DEFAULT NULL COMMENT 'Common purposes for this clearance',
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clearance_types`
--

INSERT INTO `clearance_types` (`id`, `name`, `code`, `description`, `fee`, `processing_days`, `validity_days`, `is_active`, `requires_payment`, `requires_approval`, `is_online_only`, `is_discountable`, `eligibility_criteria`, `purpose_options`, `requirements`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Barangay Clearance', 'BRGY_CLEARANCE', 'General barangay clearance for various purposes such as employment, travel, school requirements, and government transactions', 100.00, 1, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"Employment\",\"Travel\",\"School Requirement\",\"Government Transaction\",\"Loan Application\",\"Business Requirement\",\"Other\"]', '[\"Valid Government ID\",\"Proof of Residency (Barangay Certificate)\",\"1x1 or 2x2 ID Picture\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(2, 'Barangay Clearance (Senior Citizen)', 'BRGY_CLEARANCE_SENIOR', 'Barangay clearance for senior citizens with special provisions', 50.00, 1, 30, 1, 1, 0, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_senior\",\"operator\":\"equals\",\"value\":true}]', '[\"Employment\",\"Travel\",\"Government Transaction\",\"Loan Application\",\"Other\"]', '[\"Senior Citizen ID\",\"Proof of Residency\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(3, 'Barangay Clearance (Student)', 'BRGY_CLEARANCE_STUDENT', 'Barangay clearance for students requiring school requirements', 50.00, 1, 30, 1, 1, 0, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_student\",\"operator\":\"equals\",\"value\":true}]', '[\"Enrollment\",\"Scholarship Application\",\"School Requirement\",\"Other\"]', '[\"School ID\",\"Proof of Enrollment\",\"Proof of Residency\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(4, 'Business Clearance', 'BUSINESS_CLEARANCE', 'Clearance for business registration and permit applications', 300.00, 3, 365, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"New Business Registration\",\"Business Renewal\",\"Change of Business Name\",\"Change of Ownership\",\"Additional Branch\"]', '[\"DTI\\/SEC Registration\",\"Barangay Clearance\",\"Community Tax Certificate\",\"Valid ID of Owner\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(5, 'Business Clearance (Micro Business)', 'BUSINESS_CLEARANCE_MICRO', 'Clearance for micro and small businesses with reduced fees', 150.00, 2, 365, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"business_type\",\"operator\":\"equals\",\"value\":\"micro\"}]', '[\"New Business Registration\",\"Business Renewal\",\"Sari-sari Store\",\"Food Cart\",\"Home-based Business\"]', '[\"DTI Registration\",\"Barangay Clearance\",\"Valid ID of Owner\",\"Proof of Business Address\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(6, 'Police Clearance Endorsement', 'POLICE_CLEARANCE', 'Barangay endorsement required for police clearance application', 50.00, 2, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"Employment\",\"Travel Abroad\",\"Local Employment\",\"Government Requirement\",\"Other\"]', '[\"Valid ID\",\"Proof of Residency\",\"2x2 ID Picture\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(7, 'NBI Clearance Endorsement', 'NBI_CLEARANCE', 'Barangay endorsement required for NBI clearance application', 50.00, 2, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"Employment\",\"Travel Abroad\",\"Local Employment\",\"Government Requirement\",\"Other\"]', '[\"Valid ID\",\"Proof of Residency\",\"2x2 ID Picture\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(8, 'Certificate of Indigency', 'INDIGENCY_CERT', 'Certificate proving indigent status for government assistance, medical assistance, and other social services', 0.00, 3, 90, 1, 0, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_indigent\",\"operator\":\"equals\",\"value\":true},{\"field\":\"monthly_income\",\"operator\":\"less_than\",\"value\":9000}]', '[\"Medical Assistance\",\"Financial Aid\",\"Scholarship\",\"Government Program\",\"Legal Assistance\",\"Other\"]', '[\"Proof of Income (if any)\",\"Barangay ID\",\"Certificate of Residency\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(9, 'Certificate of Residency', 'RESIDENCY_CERT', 'Official proof of residency within the barangay', 50.00, 1, 90, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"residency_years\",\"operator\":\"greater_than\",\"value\":0}]', '[\"Employment\",\"School Enrollment\",\"Government Transaction\",\"Bank Account Opening\",\"Voter Registration\",\"Other\"]', '[\"Valid ID\",\"Proof of Billing (if available)\",\"Voter\'s Certification (optional)\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(10, 'Certificate of Good Moral Character', 'GOOD_MORAL_CERT', 'Certificate attesting to the good moral character of a resident', 100.00, 3, 30, 1, 1, 1, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":16},{\"field\":\"has_criminal_record\",\"operator\":\"equals\",\"value\":false}]', '[\"Employment\",\"School Admission\",\"Scholarship\",\"Immigration\",\"Professional License\",\"Other\"]', '[\"Valid ID\",\"Barangay Clearance\",\"Character References (2 persons)\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(11, 'Certificate of No Income', 'NO_INCOME_CERT', 'Certificate stating that the resident has no source of income', 30.00, 2, 90, 1, 1, 1, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"has_income\",\"operator\":\"equals\",\"value\":false},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"Government Assistance\",\"Scholarship\",\"Medical Assistance\",\"Legal Aid\",\"Other\"]', '[\"Valid ID\",\"Affidavit of No Income\",\"Certificate of Residency\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(12, 'Certificate of First Time Job Seeker', 'FTJ_CERT', 'Certificate under RA 11261 for first-time job seekers exempting from government fees', 0.00, 2, 365, 1, 0, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18},{\"field\":\"is_first_time_job_seeker\",\"operator\":\"equals\",\"value\":true}]', '[\"Government Employment\",\"Private Employment\",\"Local Employment\",\"Overseas Employment\",\"Other\"]', '[\"Valid ID\",\"Barangay Clearance\",\"Proof of Residency\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(13, 'Travel Clearance for Minors', 'TRAVEL_CLEARANCE_MINOR', 'Travel clearance for minors traveling without parents', 150.00, 2, 60, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"less_than\",\"value\":18}]', '[\"Domestic Travel\",\"International Travel\",\"School Field Trip\",\"Vacation with Relative\",\"Other\"]', '[\"Birth Certificate (PSA)\",\"Parent\'s Consent\",\"Valid ID of Parent\\/Guardian\",\"School ID (if applicable)\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(14, 'Travel Clearance for OFW', 'TRAVEL_CLEARANCE_OFW', 'Travel clearance for Overseas Filipino Workers', 100.00, 2, 60, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_ofw\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"First Time OFW\",\"Returning OFW\",\"Balik Manggagawa\",\"Other\"]', '[\"Valid Passport\",\"POEA Clearance\",\"OEC\\/OWWA Certificate\",\"Employment Contract\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(15, 'Employment Clearance', 'EMPLOYMENT_CLEARANCE', 'Clearance for employment purposes', 100.00, 2, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"Local Employment\",\"Government Employment\",\"Private Company\",\"BPO Industry\",\"Other\"]', '[\"Valid ID\",\"Barangay Clearance\",\"Resume\\/Application Form\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(16, 'Employment Clearance for Domestic Helper', 'EMPLOYMENT_CLEARANCE_DH', 'Clearance for domestic helpers and household workers', 50.00, 2, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18},{\"field\":\"occupation\",\"operator\":\"contains\",\"value\":\"domestic\"}]', '[\"Local Employment\",\"Household Work\",\"Caregiver\",\"Other\"]', '[\"Valid ID\",\"Barangay Clearance\",\"Employment Contract\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(17, 'Scholarship Clearance', 'SCHOLARSHIP_CLEARANCE', 'Clearance for scholarship applications', 50.00, 2, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_student\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"less_than\",\"value\":25}]', '[\"Academic Scholarship\",\"Athletic Scholarship\",\"Government Scholarship\",\"Private Scholarship\",\"Other\"]', '[\"School ID\",\"Grades\\/Report Card\",\"Barangay Clearance\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(18, 'Scholarship Clearance for College', 'SCHOLARSHIP_CLEARANCE_COLLEGE', 'Clearance for college scholarship applications', 50.00, 2, 30, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_college_student\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"less_than\",\"value\":30}]', '[\"CHED Scholarship\",\"DOST Scholarship\",\"Private College Scholarship\",\"Local Government Scholarship\",\"Other\"]', '[\"School ID\",\"Certificate of Enrollment\",\"Grades from Last Semester\",\"Barangay Clearance\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(19, 'Zoning Clearance', 'ZONING_CLEARANCE', 'Clearance for land use and building construction', 200.00, 5, 180, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_property_owner\",\"operator\":\"equals\",\"value\":true}]', '[\"Residential Construction\",\"Commercial Construction\",\"Renovation\",\"Land Development\",\"Other\"]', '[\"Land Title\",\"Tax Declaration\",\"Building Plans\",\"Location Map\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(20, 'Fencing Clearance', 'FENCING_CLEARANCE', 'Clearance for property fencing and boundary walls', 150.00, 3, 90, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_property_owner\",\"operator\":\"equals\",\"value\":true}]', '[\"Perimeter Fence\",\"Property Boundary\",\"Security Fence\",\"Other\"]', '[\"Land Title\",\"Tax Declaration\",\"Fencing Plan\",\"Neighbor\'s Consent\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(21, 'Cattle/Carabao Clearance', 'CATTLE_CLEARANCE', 'Clearance for livestock transport and trading', 100.00, 2, 30, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"has_livestock\",\"operator\":\"equals\",\"value\":true}]', '[\"Transport\",\"Trading\",\"Slaughter\",\"Veterinary Treatment\",\"Other\"]', '[\"Veterinary Health Certificate\",\"Proof of Ownership\",\"Barangay Clearance\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(22, 'Solo Parent Clearance', 'SOLO_PARENT_CLEARANCE', 'Special clearance for solo parents', 30.00, 1, 30, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_solo_parent\",\"operator\":\"equals\",\"value\":true}]', '[\"Government Assistance\",\"Employment\",\"School Requirement\",\"Medical Assistance\",\"Other\"]', '[\"Solo Parent ID\",\"Birth Certificates of Children\",\"Barangay Clearance\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(23, 'PWD Clearance', 'PWD_CLEARANCE', 'Special clearance for Persons with Disability', 30.00, 1, 30, 1, 1, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_pwd\",\"operator\":\"equals\",\"value\":true}]', '[\"Government Assistance\",\"Employment\",\"Medical Assistance\",\"Educational Assistance\",\"Other\"]', '[\"PWD ID\",\"Medical Certificate\",\"Barangay Clearance\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(24, 'Community Tax Certificate (Cedula)', 'CEDULA', 'Community Tax Certificate for residents', 50.00, 1, 365, 1, 1, 0, 0, 1, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"age\",\"operator\":\"greater_than_or_equal\",\"value\":18}]', '[\"Government Transaction\",\"Employment\",\"Business Registration\",\"Voter Registration\",\"Other\"]', '[\"Valid ID\",\"Proof of Income (if applicable)\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL),
(25, 'Community Tax Certificate (Cedula) - Senior/PWD', 'CEDULA_EXEMPT', 'Community Tax Certificate exempted for Senior Citizens and PWDs', 0.00, 1, 365, 1, 0, 1, 0, 0, '[{\"field\":\"is_resident\",\"operator\":\"equals\",\"value\":true},{\"field\":\"is_senior\",\"operator\":\"equals\",\"value\":true}]', '[\"Government Transaction\",\"Employment\",\"Other\"]', '[\"Senior Citizen ID or PWD ID\",\"Valid ID\"]', '2026-02-16 06:00:19', '2026-02-16 06:00:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `committees`
--

CREATE TABLE `committees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_reports`
--

CREATE TABLE `community_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `report_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `report_number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `detailed_description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_time` time DEFAULT NULL,
  `urgency_level` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `recurring_issue` tinyint(1) NOT NULL DEFAULT 0,
  `affected_people` enum('individual','family','community') NOT NULL DEFAULT 'individual',
  `estimated_affected_count` int(11) DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `reporter_name` varchar(255) DEFAULT NULL,
  `reporter_contact` varchar(255) DEFAULT NULL,
  `reporter_address` text DEFAULT NULL,
  `perpetrator_details` text DEFAULT NULL,
  `preferred_resolution` text DEFAULT NULL,
  `has_previous_report` tinyint(1) NOT NULL DEFAULT 0,
  `previous_report_id` bigint(20) UNSIGNED DEFAULT NULL,
  `impact_level` enum('low','moderate','high','severe') NOT NULL DEFAULT 'moderate',
  `safety_concern` tinyint(1) NOT NULL DEFAULT 0,
  `environmental_impact` tinyint(1) NOT NULL DEFAULT 0,
  `noise_level` varchar(50) DEFAULT NULL,
  `duration_hours` int(11) DEFAULT NULL,
  `status` enum('pending','under_review','investigating','resolved','dismissed','referred') NOT NULL DEFAULT 'pending',
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `assigned_to` bigint(20) UNSIGNED DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Office of the Barangay Captain', 'Executive department headed by the Barangay Captain, responsible for overall governance and implementation of programs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(2, 'Office of the Barangay Secretary', 'Handles documentation, records management, and administrative support for the barangay council.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(3, 'Office of the Barangay Treasurer', 'Manages barangay finances, collections, disbursements, and financial reporting.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(4, 'Human Resources and Administration', 'Manages personnel records, payroll, benefits, and administrative services.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(5, 'Records Management Office', 'Responsible for maintaining and archiving all barangay records and documents.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(6, 'Community Affairs Office', 'Handles community relations, events, and public assistance programs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(7, 'Social Welfare and Development', 'Implements social welfare programs, assists indigent families, and coordinates with DSWD.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(8, 'Health Services Office', 'Manages health center operations, medical missions, and health programs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(9, 'Peace and Order Office', 'Coordinates with tanods, police, and maintains peace and order in the barangay.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(10, 'Disaster Risk Reduction Office', 'Manages disaster preparedness, response, and recovery programs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(11, 'Livelihood and Economic Development', 'Promotes livelihood programs, skills training, and economic opportunities.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(12, 'Agriculture and Fisheries Office', 'Supports farmers and fisherfolk with programs and assistance.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(13, 'Engineering and Infrastructure Office', 'Oversees infrastructure projects, road maintenance, and construction.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(14, 'Environmental Management Office', 'Handles solid waste management, clean-up drives, and environmental programs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(15, 'Sangguniang Kabataan Office', 'Handles youth programs, activities, and Sangguniang Kabataan affairs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(16, 'Education and Scholarship Office', 'Manages scholarship programs and educational assistance.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(17, 'Barangay Justice System', 'Handles barangay conciliation and mediation (Lupong Tagapamayapa).', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(18, 'Gender and Development Office', 'Promotes gender equality and handles women\'s affairs programs.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(19, 'Senior Citizens Affairs Office', 'Handles programs and services for senior citizens.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL),
(20, 'Persons with Disability Affairs Office', 'Handles programs and services for persons with disabilities.', 1, '2026-02-16 03:33:32', '2026-02-16 03:33:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `discount_fee_types`
--

CREATE TABLE `discount_fee_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fee_type_id` bigint(20) UNSIGNED NOT NULL,
  `discount_type_id` bigint(20) UNSIGNED NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_rules`
--

CREATE TABLE `discount_rules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` varchar(50) NOT NULL COMMENT 'SENIOR, PWD, SOLO_PARENT, INDIGENT, VETERAN, STUDENT',
  `value_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `maximum_discount_amount` decimal(12,2) DEFAULT NULL,
  `minimum_purchase_amount` decimal(12,2) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `requires_verification` tinyint(1) NOT NULL DEFAULT 1,
  `verification_document` varchar(255) DEFAULT NULL,
  `applicable_to` varchar(50) NOT NULL DEFAULT 'resident',
  `applicable_puroks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_puroks`)),
  `stackable` tinyint(1) NOT NULL DEFAULT 0,
  `exclusive_with` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`exclusive_with`)),
  `effective_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discount_rules`
--

INSERT INTO `discount_rules` (`id`, `code`, `name`, `description`, `discount_type`, `value_type`, `discount_value`, `maximum_discount_amount`, `minimum_purchase_amount`, `priority`, `requires_verification`, `verification_document`, `applicable_to`, `applicable_puroks`, `stackable`, `exclusive_with`, `effective_date`, `expiry_date`, `is_active`, `sort_order`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'SENIOR-20', 'Senior Citizen Discount', NULL, 'SENIOR', 'percentage', 20.00, NULL, NULL, 1, 1, 'Senior Citizen ID', 'resident', NULL, 0, NULL, NULL, NULL, 1, 0, NULL, '2026-02-16 05:18:48', '2026-02-16 05:18:48', NULL),
(2, 'PWD-20', 'PWD Discount', NULL, 'PWD', 'percentage', 20.00, NULL, NULL, 1, 1, 'PWD ID', 'resident', NULL, 0, NULL, NULL, NULL, 1, 0, NULL, '2026-02-16 05:18:48', '2026-02-16 05:18:48', NULL),
(3, 'SOLO-PARENT-10', 'Solo Parent Discount', NULL, 'SOLO_PARENT', 'percentage', 10.00, NULL, NULL, 2, 1, 'Solo Parent ID', 'resident', NULL, 0, NULL, NULL, NULL, 1, 0, NULL, '2026-02-16 05:18:48', '2026-02-16 05:18:48', NULL),
(4, 'INDIGENT-50', 'Indigent Discount', NULL, 'INDIGENT', 'percentage', 50.00, NULL, NULL, 3, 1, 'Certificate of Indigency', 'resident', NULL, 0, NULL, NULL, NULL, 1, 0, NULL, '2026-02-16 05:18:48', '2026-02-16 05:18:48', NULL),
(5, 'VETERAN-20', 'Veteran Discount', NULL, 'VETERAN', 'percentage', 20.00, NULL, NULL, 1, 1, 'Veteran ID', 'resident', NULL, 0, NULL, NULL, NULL, 1, 0, NULL, '2026-02-16 05:18:48', '2026-02-16 05:18:48', NULL),
(6, 'STUDENT-10', 'Student Discount', NULL, 'STUDENT', 'fixed', 50.00, NULL, NULL, 4, 1, 'Student ID', 'resident', NULL, 0, NULL, NULL, NULL, 1, 0, NULL, '2026-02-16 05:18:48', '2026-02-16 05:18:48', NULL),
(7, 'SENIOR_20', 'Senior Citizen Discount - 20%', 'Standard 20% discount for senior citizens (60 years old and above) on purchased goods and services', 'percentage', 'percentage', 20.00, NULL, NULL, 100, 1, 'Senior Citizen ID, OSCA ID', 'resident', '[\"All Puroks\"]', 0, '[\"pwd_discount\",\"solo_parent\"]', '2026-01-17', NULL, 1, 1, 'Based on Expanded Senior Citizens Act of 2010 (RA 9994)', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(8, 'SENIOR_5_POINTS', 'Senior Citizen Points Program', 'Accumulate points for every purchase that can be redeemed for barangay services', 'fixed', 'fixed', 0.00, 500.00, 100.00, 90, 1, 'Senior Citizen ID', 'resident', '[\"All Puroks\"]', 1, NULL, '2026-02-01', NULL, 1, 2, 'Loyalty points program for senior citizens', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(9, 'PWD_20', 'PWD Discount - 20%', '20% discount for Persons with Disability (PWD) on basic necessities and services', 'percentage', 'percentage', 20.00, NULL, NULL, 95, 1, 'PWD ID', 'resident', '[\"All Puroks\"]', 0, '[\"senior_discount\",\"solo_parent\"]', '2026-01-17', NULL, 1, 3, 'Based on Magna Carta for Persons with Disability (RA 10754)', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(10, 'SOLO_PARENT_10', 'Solo Parent Discount', '10% discount on purchases of basic necessities for solo parents', 'percentage', 'percentage', 10.00, 500.00, 100.00, 85, 1, 'Solo Parent ID', 'resident', '[\"All Puroks\"]', 0, '[\"senior_discount\",\"pwd_discount\"]', '2026-01-27', NULL, 1, 4, 'Based on Solo Parents Welfare Act (RA 8972)', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(11, 'STUDENT_10', 'Student Discount', '10% discount for students on school supplies and related items', 'percentage', 'percentage', 10.00, 300.00, 50.00, 80, 1, 'School ID, Registration Form', 'student', '[\"All Puroks\"]', 0, NULL, '2026-01-02', '2026-08-16', 1, 5, 'Back-to-school promo for students', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(12, 'PUROK_A_5', 'Purok A Residents Discount', 'Special 5% discount for Purok A residents during fiesta celebration', 'percentage', 'percentage', 5.00, 200.00, 50.00, 60, 1, 'Barangay Clearance, Valid ID', 'resident', '[\"Purok A\"]', 0, NULL, '2026-02-16', '2026-03-18', 1, 6, 'Fiesta celebration promo for Purok A', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(13, 'BULK_PURCHASE_15', 'Bulk Purchase Discount', '15% discount on bulk purchases (minimum of 5 items)', 'percentage', 'percentage', 15.00, 1000.00, 1000.00, 70, 0, NULL, 'all', '[\"All Puroks\"]', 1, NULL, '2026-02-16', NULL, 1, 7, 'Bulk purchase incentive for all customers', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(14, 'EARLY_BIRD_10', 'Early Bird Special', '10% discount for purchases made before 8:00 AM', 'percentage', 'percentage', 10.00, 100.00, 100.00, 75, 0, NULL, 'all', '[\"All Puroks\"]', 1, NULL, '2026-02-16', NULL, 1, 8, 'Early morning shopping incentive', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(15, 'BHW_10', 'Barangay Health Worker Discount', '10% discount for active Barangay Health Workers', 'percentage', 'percentage', 10.00, 300.00, 100.00, 88, 1, 'BHW ID, Certificate of Appointment', 'employee', '[\"All Puroks\"]', 0, '[\"senior_discount\",\"pwd_discount\"]', '2026-02-06', NULL, 1, 9, 'Appreciation discount for BHW volunteers', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(16, 'TANOD_10', 'Barangay Tanod Discount', '10% discount for active Barangay Tanod members', 'percentage', 'percentage', 10.00, 300.00, 100.00, 88, 1, 'Tanod ID', 'employee', '[\"All Puroks\"]', 0, '[\"senior_discount\",\"pwd_discount\"]', '2026-02-11', NULL, 1, 10, 'Appreciation discount for Barangay Tanod', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(17, 'CHRISTMAS_15', 'Christmas Season Discount', '15% discount on all purchases during Christmas season', 'percentage', 'percentage', 15.00, 500.00, 200.00, 65, 0, NULL, 'all', '[\"All Puroks\"]', 0, NULL, '2026-12-01', '2026-12-31', 1, 11, 'Christmas season promo', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(18, 'FIESTA_20', 'Barangay Fiesta Discount', 'Special 20% discount during barangay fiesta celebration', 'percentage', 'percentage', 20.00, 1000.00, 100.00, 95, 1, 'Barangay Clearance', 'resident', '[\"All Puroks\"]', 0, '[\"senior_discount\",\"pwd_discount\"]', '2026-05-15', '2026-05-15', 1, 12, 'Barangay fiesta special discount', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(19, 'FIRST_TIME_10', 'First Time Customer Discount', '10% discount for first-time customers', 'percentage', 'percentage', 10.00, 200.00, 100.00, 50, 1, 'Valid ID, Barangay Clearance', 'non-resident', '[\"All Puroks\"]', 0, NULL, '2026-02-16', NULL, 1, 13, 'Welcome discount for new customers', '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `discount_types`
--

CREATE TABLE `discount_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `default_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `legal_basis` varchar(255) DEFAULT NULL,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discount_types`
--

INSERT INTO `discount_types` (`id`, `code`, `name`, `description`, `default_percentage`, `legal_basis`, `requirements`, `is_active`, `is_mandatory`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'SENIOR', 'Senior Citizen', 'Discount for senior citizens aged 60 and above', 20.00, 'Republic Act 9994 (Expanded Senior Citizens Act)', '[\"Senior Citizen ID\",\"Birth Certificate\"]', 1, 1, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(2, 'PWD', 'Person with Disability', 'Discount for persons with disabilities', 20.00, 'Republic Act 10754', '[\"PWD ID\",\"Medical Certificate\"]', 1, 1, 2, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(3, 'SOLO_PARENT', 'Solo Parent', 'Discount for solo parents', 10.00, 'Republic Act 8972', '[\"Solo Parent ID\",\"Birth Certificate of Children\"]', 1, 0, 3, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(4, 'INDIGENT', 'Indigent', 'Discount for indigent families as certified by LGU', 50.00, 'Local Ordinance', '[\"Certificate of Indigency\",\"Barangay Certification\"]', 1, 0, 4, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(5, 'VETERAN', 'Veteran', 'Discount for military veterans', 20.00, 'Republic Act 6948', '[\"Veteran ID\",\"Service Records\"]', 1, 0, 5, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) NOT NULL DEFAULT 'gray',
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_categories`
--

INSERT INTO `document_categories` (`id`, `name`, `description`, `slug`, `icon`, `color`, `order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Identification', NULL, 'identification', 'User', 'purple', 1, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(2, 'Personal', NULL, 'personal', 'Heart', 'pink', 2, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(3, 'Financial', NULL, 'financial', 'FileText', 'green', 3, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(4, 'Health', NULL, 'health', 'Heart', 'red', 4, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(5, 'Education', NULL, 'education', 'GraduationCap', 'amber', 5, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(6, 'Business', NULL, 'business', 'Briefcase', 'indigo', 6, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(7, 'Certificates', NULL, 'certificates', 'Award', 'blue', 7, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(8, 'Permits', NULL, 'permits', 'Shield', 'orange', 8, 1, '2026-02-15 22:24:08', '2026-02-15 22:24:08'),
(9, 'Taxation & Fees', 'Taxes and government fees', 'taxation-fees', 'fa-solid fa-coins', 'primary', 1, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(10, 'Licenses & Permits', 'Business and construction permits', 'licenses-permits', 'fa-solid fa-file-signature', 'success', 2, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(11, 'Community Certificates', 'Certificates for community members', 'community-certificates', 'fa-solid fa-certificate', 'warning', 4, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(12, 'Property & Real Estate', 'Property-related documents', 'property-real-estate', 'fa-solid fa-building', 'indigo', 7, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(13, 'Transportation & Traffic', 'Transportation permits and fees', 'transportation-traffic', 'fa-solid fa-truck', 'cyan', 8, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(14, 'Community Services', 'General community services', 'community-services', 'fa-solid fa-hand-holding-heart', 'teal', 9, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(15, 'Environmental Services', 'Environmental and sanitation fees', 'environmental-services', 'fa-solid fa-leaf', 'green', 10, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(16, 'Utilities', 'Utility fees and charges', 'utilities', 'fa-solid fa-bolt', 'yellow', 11, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(17, 'Other Services', 'Miscellaneous services', 'other-services', 'fa-solid fa-ellipsis', 'gray', 12, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43');

-- --------------------------------------------------------

--
-- Table structure for table `document_requirements`
--

CREATE TABLE `document_requirements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `clearance_type_id` bigint(20) UNSIGNED NOT NULL,
  `document_type_id` bigint(20) UNSIGNED NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_shares`
--

CREATE TABLE `document_shares` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `access_type` varchar(255) NOT NULL DEFAULT 'view',
  `requires_password` tinyint(1) NOT NULL DEFAULT 0,
  `password` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `max_views` int(11) DEFAULT NULL,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `document_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `accepted_formats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`accepted_formats`)),
  `max_file_size` int(11) DEFAULT 5120,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_types`
--

INSERT INTO `document_types` (`id`, `name`, `code`, `description`, `document_category_id`, `is_required`, `sort_order`, `accepted_formats`, `max_file_size`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Valid ID (Government Issued)', 'valid_id_gov', 'Any valid government-issued identification card (Passport, Driver\'s License, PRC ID, SSS ID, PhilHealth ID, Postal ID, Voter\'s ID)', 1, 1, 1, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(2, 'Barangay ID', 'barangay_id', 'Barangay Identification Card', 1, 0, 2, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(3, 'Philippine Passport', 'passport', 'Valid Philippine Passport (Bio page)', 1, 0, 3, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(4, 'Driver\'s License', 'drivers_license', 'Valid Driver\'s License (LTO)', 1, 0, 4, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(5, 'Voter\'s ID', 'voters_id', 'COMELEC Voter\'s Identification Card', 1, 0, 5, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(6, 'Senior Citizen ID', 'senior_citizen_id', 'Office of Senior Citizen Affairs (OSCA) ID', 1, 0, 6, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(7, 'PWD ID', 'pwd_id', 'Persons with Disability Identification Card', 1, 0, 7, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(8, 'Birth Certificate', 'birth_certificate', 'PSA-authenticated Birth Certificate', 2, 1, 8, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(9, 'Marriage Certificate', 'marriage_certificate', 'PSA-authenticated Marriage Certificate', 2, 0, 9, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(10, 'CENOMAR', 'cenomar', 'Certificate of No Marriage (CENOMAR)', 2, 0, 10, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(11, 'Proof of Residency', 'proof_of_residency', 'Utility bills (electricity, water, internet, landline), Credit card statement, Bank statement (must show name and address)', 2, 1, 11, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\",\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(12, 'Lease/Rental Contract', 'lease_contract', 'Notarized lease or rental agreement', 2, 0, 12, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(13, 'Barangay Certificate of Residency', 'barangay_residency_cert', 'Certificate issued by the barangay confirming residency', 2, 0, 13, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(14, 'Tax Declaration', 'tax_declaration', 'Real Property Tax Declaration', 2, 0, 14, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(15, 'Proof of Income', 'proof_of_income', 'Certificate of Employment with Compensation, Latest payslip, ITR, Business registration documents', 3, 1, 15, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(16, 'Certificate of Indigency', 'certificate_indigency', 'Certificate declaring low-income status', 3, 0, 16, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(17, 'ITR (Income Tax Return)', 'itr', 'Latest Income Tax Return', 3, 0, 17, '\"[\\\"pdf\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(18, 'Bank Statement', 'bank_statement', 'Latest 3 months bank statement', 3, 0, 18, '\"[\\\"pdf\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(19, 'Medical Certificate', 'medical_certificate', 'Medical certificate from licensed physician', 4, 0, 19, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(20, 'Laboratory Results', 'lab_results', 'Medical laboratory test results', 4, 0, 20, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(21, 'School ID', 'school_id', 'Valid School Identification Card', 5, 0, 21, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(22, 'Transcript of Records', 'transcript_records', 'Official Transcript of Records', 5, 0, 22, '\"[\\\"pdf\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(23, 'Diploma', 'diploma', 'Graduation Diploma', 5, 0, 23, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(24, 'Business Permit', 'business_permit', 'Mayor\'s Permit/Business Permit', 6, 0, 24, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(25, 'DTI/SEC Registration', 'dti_sec_registration', 'DTI Business Name Registration or SEC Certificate', 6, 0, 25, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(26, 'Business Plan', 'business_plan', 'Detailed business plan', 6, 0, 26, '\"[\\\"pdf\\\",\\\"doc\\\",\\\"docx\\\"]\"', 10240, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(27, 'Barangay Clearance', 'barangay_clearance', 'Barangay Clearance Certificate', 7, 1, 27, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(28, 'Police Clearance', 'police_clearance', 'NBI or Police Clearance', 7, 0, 28, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(29, 'Court Clearance', 'court_clearance', 'Court Clearance Certificate', 8, 0, 29, '\"[\\\"pdf\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(30, 'Certificate of Employment', 'certificate_employment', 'Certificate from current employer', 2, 0, 30, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(31, 'Pay Slip', 'payslip', 'Latest 3 months payslip', 2, 0, 31, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 5120, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(32, '2x2 ID Picture', 'photo_2x2', 'Recent 2x2 colored ID picture with white background', 2, 0, 32, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\"]\"', 1024, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(33, '1x1 ID Picture', 'photo_1x1', 'Recent 1x1 colored ID picture with white background', 2, 0, 33, '\"[\\\"jpg\\\",\\\"jpeg\\\",\\\"png\\\"]\"', 1024, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(34, 'Authorization Letter', 'authorization_letter', 'Notarized authorization letter if processing for someone else', 2, 0, 34, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL),
(35, 'Affidavit', 'affidavit', 'Notarized affidavit for various purposes', 2, 0, 35, '\"[\\\"pdf\\\",\\\"jpg\\\",\\\"jpeg\\\"]\"', 2048, 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fees`
--

CREATE TABLE `fees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fee_type_id` bigint(20) UNSIGNED NOT NULL,
  `payer_type` varchar(255) DEFAULT NULL,
  `payer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payer_model` varchar(255) DEFAULT NULL,
  `payer_name` varchar(255) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `purok` varchar(255) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `billing_period` varchar(255) DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `base_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `surcharge_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `penalty_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_type` varchar(255) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `purpose` varchar(255) DEFAULT NULL,
  `property_description` text DEFAULT NULL,
  `business_type` varchar(255) DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `requirements_submitted` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements_submitted`)),
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `fee_code` varchar(255) DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `certificate_number` varchar(255) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `issued_by` bigint(20) UNSIGNED DEFAULT NULL,
  `collected_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `waiver_reason` varchar(255) DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `batch_reference` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fees`
--

INSERT INTO `fees` (`id`, `fee_type_id`, `payer_type`, `payer_id`, `payer_model`, `payer_name`, `business_name`, `contact_number`, `address`, `purok`, `zone`, `billing_period`, `period_start`, `period_end`, `issue_date`, `due_date`, `base_amount`, `surcharge_amount`, `penalty_amount`, `discount_amount`, `discount_type`, `total_amount`, `amount_paid`, `balance`, `purpose`, `property_description`, `business_type`, `area`, `remarks`, `requirements_submitted`, `status`, `fee_code`, `or_number`, `certificate_number`, `valid_from`, `valid_until`, `issued_by`, `collected_by`, `cancelled_by`, `created_by`, `updated_by`, `waiver_reason`, `cancelled_at`, `batch_reference`, `created_at`, `updated_at`) VALUES
(1, 9, 'App\\Models\\Resident', 5, NULL, 'Luz Mercado Villanueva', NULL, '09175678901', NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:53:46', '2026-02-16 03:53:46'),
(2, 9, 'App\\Models\\Resident', 18, NULL, 'Ramon Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:53:46', '2026-02-16 03:53:46'),
(3, 9, 'App\\Models\\Resident', 19, NULL, 'Luz Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:53:46', '2026-02-16 03:53:46'),
(4, 9, 'App\\Models\\Resident', 20, NULL, 'Mark Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:53:46', '2026-02-16 03:53:46'),
(5, 9, 'App\\Models\\Resident', 21, NULL, 'Joy Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:53:46', '2026-02-16 03:53:46'),
(6, 9, 'App\\Models\\Resident', 22, NULL, 'Ben Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:53:46', '2026-02-16 03:53:46'),
(7, 9, 'App\\Models\\Resident', 5, NULL, 'Luz Mercado Villanueva', NULL, '09175678901', NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:54:00', '2026-02-16 03:54:00'),
(8, 9, 'App\\Models\\Resident', 18, NULL, 'Ramon Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:54:00', '2026-02-16 03:54:00'),
(9, 9, 'App\\Models\\Resident', 19, NULL, 'Luz Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:54:00', '2026-02-16 03:54:00'),
(10, 9, 'App\\Models\\Resident', 20, NULL, 'Mark Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:54:00', '2026-02-16 03:54:00'),
(11, 9, 'App\\Models\\Resident', 21, NULL, 'Joy Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:54:00', '2026-02-16 03:54:00'),
(12, 9, 'App\\Models\\Resident', 22, NULL, 'Ben Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:54:00', '2026-02-16 03:54:00'),
(13, 9, 'App\\Models\\Resident', 5, NULL, 'Luz Mercado Villanueva', NULL, '09175678901', NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:57:37', '2026-02-16 03:57:37'),
(14, 9, 'App\\Models\\Resident', 18, NULL, 'Ramon Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:57:37', '2026-02-16 03:57:37'),
(15, 9, 'App\\Models\\Resident', 19, NULL, 'Luz Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:57:37', '2026-02-16 03:57:37'),
(16, 9, 'App\\Models\\Resident', 20, NULL, 'Mark Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:57:37', '2026-02-16 03:57:37'),
(17, 9, 'App\\Models\\Resident', 21, NULL, 'Joy Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:57:37', '2026-02-16 03:57:37'),
(18, 9, 'App\\Models\\Resident', 22, NULL, 'Ben Fernandez', NULL, NULL, NULL, 'Purok 5', NULL, NULL, NULL, NULL, '2026-02-12', '2026-03-01', 50.00, 0.00, 0.00, 0.00, NULL, 50.00, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, '\"[]\"', 'issued', 'GARBAGE_FEE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2026-02-16 03:57:37', '2026-02-16 03:57:37');

-- --------------------------------------------------------

--
-- Table structure for table `fee_discounts`
--

CREATE TABLE `fee_discounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fee_id` bigint(20) UNSIGNED NOT NULL,
  `discount_type_id` bigint(20) UNSIGNED NOT NULL,
  `special_discount_id` bigint(20) UNSIGNED DEFAULT NULL,
  `special_discount_application_id` bigint(20) UNSIGNED DEFAULT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `base_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `applied_by` bigint(20) UNSIGNED DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_types`
--

CREATE TABLE `fee_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `document_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_discountable` tinyint(1) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `base_amount` decimal(10,2) NOT NULL,
  `amount_type` enum('fixed','per_unit','computed') NOT NULL,
  `computation_formula` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`computation_formula`)),
  `unit` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `has_senior_discount` tinyint(1) NOT NULL DEFAULT 0,
  `senior_discount_percentage` decimal(5,2) DEFAULT NULL,
  `has_pwd_discount` tinyint(1) NOT NULL DEFAULT 0,
  `pwd_discount_percentage` decimal(5,2) DEFAULT NULL,
  `has_solo_parent_discount` tinyint(1) NOT NULL DEFAULT 0,
  `solo_parent_discount_percentage` decimal(5,2) DEFAULT NULL,
  `has_indigent_discount` tinyint(1) NOT NULL DEFAULT 0,
  `indigent_discount_percentage` decimal(5,2) DEFAULT NULL,
  `has_surcharge` tinyint(1) NOT NULL DEFAULT 0,
  `surcharge_percentage` decimal(5,2) DEFAULT NULL,
  `surcharge_fixed` decimal(10,2) DEFAULT NULL,
  `has_penalty` tinyint(1) NOT NULL DEFAULT 0,
  `penalty_percentage` decimal(5,2) DEFAULT NULL,
  `penalty_fixed` decimal(10,2) DEFAULT NULL,
  `frequency` enum('one_time','monthly','quarterly','semi_annual','annual','as_needed') NOT NULL,
  `validity_days` int(11) DEFAULT NULL,
  `applicable_to` varchar(111) NOT NULL,
  `applicable_puroks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applicable_puroks`)),
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `auto_generate` tinyint(1) NOT NULL DEFAULT 0,
  `due_day` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fee_types`
--

INSERT INTO `fee_types` (`id`, `code`, `document_category_id`, `is_discountable`, `name`, `short_name`, `base_amount`, `amount_type`, `computation_formula`, `unit`, `description`, `has_senior_discount`, `senior_discount_percentage`, `has_pwd_discount`, `pwd_discount_percentage`, `has_solo_parent_discount`, `solo_parent_discount_percentage`, `has_indigent_discount`, `indigent_discount_percentage`, `has_surcharge`, `surcharge_percentage`, `surcharge_fixed`, `has_penalty`, `penalty_percentage`, `penalty_fixed`, `frequency`, `validity_days`, `applicable_to`, `applicable_puroks`, `requirements`, `effective_date`, `expiry_date`, `is_active`, `is_mandatory`, `auto_generate`, `due_day`, `sort_order`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'BRGY_CLEARANCE', NULL, 1, 'Barangay Clearance', 'Brgy Clearance', 50.00, 'fixed', NULL, NULL, 'Standard barangay clearance for residents', 1, NULL, 1, NULL, 1, NULL, 1, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 1, 0, NULL, 1, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(2, 'INDIGENCY_CERT', NULL, 1, 'Certificate of Indigency', 'Indigency', 30.00, 'fixed', NULL, NULL, 'Certificate of Indigency for financial assistance', 0, NULL, 0, NULL, 0, NULL, 1, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 0, 0, NULL, 2, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(3, 'RESIDENCY_CERT', NULL, 1, 'Certificate of Residency', 'Residency', 30.00, 'fixed', NULL, NULL, 'Certificate of Residency', 1, NULL, 1, NULL, 1, NULL, 1, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 1, 0, NULL, 3, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(4, 'BUSINESS_PERMIT', NULL, 0, 'Business Permit', 'Business', 500.00, 'fixed', NULL, NULL, 'Business permit clearance', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, 1, NULL, NULL, 'annual', NULL, 'business_owners', NULL, NULL, '2026-02-16', NULL, 1, 1, 1, NULL, 4, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(5, 'BURIAL_ASSIST', NULL, 1, 'Burial Assistance', 'Burial', 0.00, 'fixed', NULL, NULL, 'Assistance for burial expenses', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 0, 0, NULL, 5, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(6, 'MEDICAL_ASSIST', NULL, 1, 'Medical Assistance', 'Medical', 0.00, 'fixed', NULL, NULL, 'Assistance for medical expenses', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 0, 0, NULL, 6, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(7, 'TRICYCLE_PERMIT', NULL, 0, 'Tricycle Permit', 'Tricycle', 300.00, 'fixed', NULL, NULL, 'Tricycle operator permit', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 1, NULL, NULL, 1, NULL, NULL, 'annual', NULL, 'business_owners', NULL, NULL, '2026-02-16', NULL, 1, 1, 1, NULL, 7, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(8, 'MARKET_RENTAL', NULL, 0, 'Market Stall Rental', 'Market', 1000.00, 'fixed', NULL, NULL, 'Monthly market stall rental fee', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 1, NULL, NULL, 1, NULL, NULL, 'monthly', NULL, 'business_owners', NULL, NULL, '2026-02-16', NULL, 1, 1, 1, NULL, 8, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(9, 'GARBAGE_FEE', NULL, 0, 'Garbage Collection Fee', 'Garbage', 50.00, 'fixed', NULL, NULL, 'Monthly garbage collection fee', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 1, NULL, NULL, 1, NULL, NULL, 'monthly', NULL, 'households', NULL, NULL, '2026-02-16', NULL, 1, 1, 1, NULL, 9, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(10, 'WATER_FEE', NULL, 0, 'Water System Fee', 'Water', 100.00, 'fixed', NULL, NULL, 'Monthly water system maintenance fee', 0, NULL, 0, NULL, 0, NULL, 0, NULL, 1, NULL, NULL, 1, NULL, NULL, 'monthly', NULL, 'households', NULL, NULL, '2026-02-16', NULL, 1, 1, 1, NULL, 10, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(11, 'CLEARANCE_FEE', NULL, 1, 'Clearance Fee', 'Clearance', 50.00, 'fixed', NULL, NULL, 'General clearance fee', 1, NULL, 1, NULL, 1, NULL, 1, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 1, 0, NULL, 11, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL),
(12, 'CERTIFICATE_FEE', NULL, 1, 'Certificate Fee', 'Certificate', 30.00, 'fixed', NULL, NULL, 'General certificate fee', 1, NULL, 1, NULL, 1, NULL, 1, NULL, 0, NULL, NULL, 0, NULL, NULL, 'one_time', NULL, 'all_residents', NULL, NULL, '2026-02-16', NULL, 1, 1, 0, NULL, 12, NULL, '2026-02-16 05:24:38', '2026-02-16 05:24:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `financial_audit_trails`
--

CREATE TABLE `financial_audit_trails` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `audit_log_id` bigint(20) UNSIGNED NOT NULL,
  `fund_source` varchar(255) DEFAULT NULL,
  `account_code` varchar(255) DEFAULT NULL,
  `particulars` varchar(255) DEFAULT NULL,
  `payee` varchar(255) DEFAULT NULL,
  `voucher_number` varchar(255) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `debit` decimal(12,2) DEFAULT NULL,
  `credit` decimal(12,2) DEFAULT NULL,
  `balance` decimal(12,2) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `received_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

CREATE TABLE `forms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(255) NOT NULL DEFAULT 'pdf',
  `mime_type` varchar(255) DEFAULT NULL,
  `issuing_agency` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `requires_login` tinyint(1) NOT NULL DEFAULT 0,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `version` varchar(50) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `pages` int(11) DEFAULT NULL,
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `last_viewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `last_downloaded_at` timestamp NULL DEFAULT NULL,
  `last_downloaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `download_count` int(11) NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `view_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `households`
--

CREATE TABLE `households` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `household_number` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `member_count` int(11) NOT NULL DEFAULT 1,
  `income_range` varchar(255) DEFAULT NULL,
  `housing_type` varchar(255) DEFAULT NULL,
  `ownership_status` varchar(255) DEFAULT NULL,
  `water_source` varchar(255) DEFAULT NULL,
  `electricity` tinyint(1) NOT NULL DEFAULT 0,
  `internet` tinyint(1) NOT NULL DEFAULT 0,
  `vehicle` tinyint(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `purok_id` bigint(20) DEFAULT NULL,
  `head_of_family` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `households`
--

INSERT INTO `households` (`id`, `user_id`, `household_number`, `contact_number`, `email`, `address`, `member_count`, `income_range`, `housing_type`, `ownership_status`, `water_source`, `electricity`, `internet`, `vehicle`, `remarks`, `status`, `created_at`, `updated_at`, `purok_id`, `head_of_family`) VALUES
(1, 17, 'HH-001', '09123456789', 'dela.cruz.family@example.com', '123 Mabini Street', 4, '15000-25000', 'Concrete', 'Owned', 'Municipal', 1, 1, 1, 'Registered voter family', 'active', '2026-02-15 22:54:40', '2026-02-16 03:13:13', 1, NULL),
(4, 18, 'HH-002', '09234567890', 'santos.family@example.com', '456 Rizal Avenue', 3, '25000-35000', 'Concrete', 'Mortgage', 'Municipal', 1, 1, 1, 'Small business owners', 'active', '2026-02-15 23:59:21', '2026-02-16 03:13:13', 2, NULL),
(5, 19, 'HH-003', '09345678901', 'reyes.family@example.com', '789 Bonifacio Street', 4, '5000-15000', 'Semi-Concrete', 'Rented', 'Deep Well', 1, 0, 0, 'Extended family living together', 'active', '2026-02-15 23:59:21', '2026-02-16 03:13:13', 3, NULL),
(6, 20, 'HH-004', '09456789012', 'garcia.family@example.com', '1010 Luna Street', 1, 'Below 5000', 'Light Materials', 'Owned', 'Deep Well', 1, 0, 0, 'Senior citizens living alone', 'active', '2026-02-15 23:59:21', '2026-02-16 03:13:13', 4, NULL),
(7, 21, 'HH-005', '09567890123', 'fernandez.family@example.com', '1111 Mabuhay Street', 5, '15000-25000', 'Concrete', 'Owned', 'Municipal', 1, 1, 1, 'Large extended family', 'active', '2026-02-15 23:59:21', '2026-02-16 03:13:13', 5, NULL),
(8, 22, 'HH-006', '09678901234', 'villanueva.family@example.com', '1212 Rizal Extension', 2, '5000-15000', 'Semi-Concrete', 'Rented', 'Deep Well', 1, 0, 0, 'Solo parent household', 'active', '2026-02-15 23:59:21', '2026-02-16 03:13:14', 6, NULL),
(9, 23, 'HH-007', '09789012345', 'torres.family@example.com', '1313 Bonifacio Street', 3, '15000-25000', 'Concrete', 'Owned', 'Municipal', 1, 1, 1, 'Household with PWD member', 'active', '2026-02-15 23:59:21', '2026-02-16 03:13:14', 7, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `household_members`
--

CREATE TABLE `household_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `household_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `relationship_to_head` varchar(50) NOT NULL,
  `is_head` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `household_members`
--

INSERT INTO `household_members` (`id`, `household_id`, `resident_id`, `relationship_to_head`, `is_head`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(2, 1, 7, 'Spouse', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(3, 1, 8, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(4, 1, 9, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(5, 4, 10, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(6, 4, 11, 'Spouse', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(7, 4, 12, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(8, 5, 13, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(9, 5, 14, 'Spouse', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(10, 5, 15, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(11, 5, 16, 'Parent', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(12, 6, 17, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(13, 7, 18, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(14, 7, 19, 'Spouse', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(15, 7, 20, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(16, 7, 21, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(17, 7, 22, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(18, 8, 23, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(19, 8, 24, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(20, 9, 25, 'Self', 1, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(21, 9, 26, 'Spouse', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(22, 9, 27, 'Child', 0, '2026-02-15 23:59:21', '2026-02-15 23:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `incidents`
--

CREATE TABLE `incidents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `household_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('complaint','blotter') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('pending','under_investigation','resolved','dismissed') NOT NULL DEFAULT 'pending',
  `reported_as_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident_evidences`
--

CREATE TABLE `incident_evidences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `incident_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `officials`
--

CREATE TABLE `officials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `position` varchar(255) NOT NULL,
  `committee` varchar(255) DEFAULT NULL,
  `term_start` date NOT NULL,
  `term_end` date NOT NULL,
  `status` enum('active','inactive','former') NOT NULL DEFAULT 'active',
  `order` int(11) NOT NULL DEFAULT 0,
  `responsibilities` text DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `is_regular` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `or_number` varchar(255) NOT NULL COMMENT 'Official Receipt Number',
  `payer_type` enum('resident','household','business','other') NOT NULL,
  `payer_id` bigint(20) UNSIGNED NOT NULL,
  `payer_name` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `household_number` varchar(255) DEFAULT NULL,
  `purok` varchar(255) DEFAULT NULL,
  `payment_date` datetime NOT NULL,
  `period_covered` varchar(255) DEFAULT NULL,
  `payment_method` enum('cash','gcash','maya','bank','check','online') NOT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `surcharge` decimal(12,2) NOT NULL DEFAULT 0.00,
  `penalty` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_code` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `purpose` text NOT NULL,
  `remarks` text DEFAULT NULL,
  `is_cleared` tinyint(1) NOT NULL DEFAULT 0,
  `clearance_code` varchar(255) DEFAULT NULL,
  `certificate_type` varchar(255) DEFAULT NULL,
  `validity_date` date DEFAULT NULL,
  `collection_type` enum('manual','system') NOT NULL DEFAULT 'manual',
  `status` varchar(255) NOT NULL DEFAULT 'completed' COMMENT 'pending, completed, cancelled, refunded',
  `method_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Stores payment method specific details' CHECK (json_valid(`method_details`)),
  `recorded_by` bigint(20) UNSIGNED NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `or_number`, `payer_type`, `payer_id`, `payer_name`, `contact_number`, `address`, `household_number`, `purok`, `payment_date`, `period_covered`, `payment_method`, `reference_number`, `subtotal`, `surcharge`, `penalty`, `discount`, `discount_code`, `discount_type`, `total_amount`, `amount_paid`, `purpose`, `remarks`, `is_cleared`, `clearance_code`, `certificate_type`, `validity_date`, `collection_type`, `status`, `method_details`, `recorded_by`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'BAR-20260216-168', 'resident', 21, 'Joy Fernandez', NULL, '1111 Mabuhay Street', 'HH-005', 'Purok 5', '2026-02-16 00:00:00', NULL, 'cash', NULL, 50.00, 0.00, 0.00, 10.00, 'PWD-20', 'PWD', 50.00, 40.00, 'Garbage Collection Fee', NULL, 0, NULL, NULL, NULL, 'manual', 'completed', NULL, 1, NULL, '2026-02-16 04:57:49', '2026-02-16 04:57:49');

-- --------------------------------------------------------

--
-- Table structure for table `payment_discounts`
--

CREATE TABLE `payment_discounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `discount_rule_id` bigint(20) UNSIGNED NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `id_presented` tinyint(1) NOT NULL DEFAULT 0,
  `id_number` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_discounts`
--

INSERT INTO `payment_discounts` (`id`, `payment_id`, `discount_rule_id`, `discount_amount`, `verified_by`, `verified_at`, `id_presented`, `id_number`, `remarks`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 2, 10.00, 1, '2026-02-16 04:57:49', 1, '265411114151651', NULL, '2026-02-16 04:57:49', '2026-02-16 04:57:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payment_items`
--

CREATE TABLE `payment_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `fee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `discount_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `original_fee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `fee_name` varchar(255) NOT NULL,
  `fee_code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `base_amount` decimal(12,2) NOT NULL,
  `surcharge` decimal(12,2) NOT NULL DEFAULT 0.00,
  `penalty` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `category` varchar(255) NOT NULL,
  `period_covered` varchar(255) DEFAULT NULL,
  `months_late` int(11) DEFAULT NULL,
  `fee_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Original fee data at time of payment' CHECK (json_valid(`fee_metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `clearance_request_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_items`
--

INSERT INTO `payment_items` (`id`, `payment_id`, `fee_id`, `discount_type_id`, `original_fee_id`, `fee_name`, `fee_code`, `description`, `base_amount`, `surcharge`, `penalty`, `total_amount`, `category`, `period_covered`, `months_late`, `fee_metadata`, `created_at`, `updated_at`, `clearance_request_id`) VALUES
(1, 1, NULL, NULL, NULL, 'Garbage Collection Fee', 'GARBAGE_FEE', 'Payment for Garbage Collection Fee', 50.00, 0.00, 0.00, 40.00, 'other', NULL, 0, '{\"is_outstanding_fee\":true,\"is_clearance_fee\":false,\"original_fee_id\":5,\"payer_type\":\"resident\",\"payer_id\":21,\"original_fee_data\":{\"base_amount\":50,\"surcharge_amount\":0,\"penalty_amount\":0,\"discount_amount\":0,\"amount_paid\":0,\"balance\":50,\"total_amount\":50},\"appliedDiscount\":{\"code\":\"PWD-20\",\"amount\":10}}', '2026-02-16 04:57:49', '2026-02-16 04:57:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `module` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL DEFAULT 'web',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `display_name`, `description`, `module`, `guard_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'view-dashboard', 'View Dashboard', 'Access main dashboard', 'Dashboard', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(2, 'view-admin-dashboard', 'View Admin Dashboard', 'Access admin dashboard', 'Dashboard', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(3, 'manage-users', 'Manage Users', 'Full user management access', 'Users', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(4, 'manage-roles', 'Manage Roles', 'Create, edit, and delete roles', 'Roles', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(5, 'manage-permissions', 'Manage Permissions', 'Manage system permissions', 'Permissions', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(6, 'manage-residents', 'Manage Residents', 'Full resident management', 'Residents', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(7, 'manage-officials', 'Manage Officials', 'Manage barangay officials', 'Officials', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(8, 'manage-committees', 'Manage Committees', 'Manage barangay committees', 'Committees', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(9, 'manage-positions', 'Manage Positions', 'Manage official positions', 'Positions', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(10, 'manage-households', 'Manage Households', 'Manage household records', 'Households', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(11, 'manage-payments', 'Manage Payments', 'Full payment management', 'Payments', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(12, 'view-payments', 'View Payments', 'View payment records only', 'Payments', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(13, 'manage-fees', 'Manage Fees', 'Manage fee structure', 'Fees', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(14, 'view-fees', 'View Fees', 'View fee records only', 'Fees', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(15, 'manage-fee-types', 'Manage Fee Types', 'Manage fee categories', 'Fees', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(16, 'view-fee-types', 'View Fee Types', 'View fee types only', 'Fees', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(17, 'manage-reports', 'Manage Community Reports', 'Full community report management', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(18, 'view-reports', 'View Community Reports', 'View community reports only', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(19, 'create-reports', 'Create Community Reports', 'Create new community reports', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(20, 'edit-reports', 'Edit Community Reports', 'Edit existing community reports', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(21, 'delete-reports', 'Delete Community Reports', 'Delete community reports', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(22, 'assign-reports', 'Assign Community Reports', 'Assign reports to staff', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(23, 'resolve-reports', 'Resolve Community Reports', 'Mark reports as resolved', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(24, 'review-reports', 'Review Community Reports', 'Review and acknowledge reports', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(25, 'manage-blotters', 'Manage Blotters', 'Full blotter report management', 'Blotters', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(26, 'view-blotters', 'View Blotters', 'View blotter reports only', 'Blotters', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(27, 'manage-report-types', 'Manage Report Types', 'Manage community report categories', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(28, 'view-report-types', 'View Report Types', 'View report types only', 'Community Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(29, 'manage-forms', 'Manage Forms', 'Manage downloadable forms', 'Forms', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(30, 'manage-announcements', 'Manage Announcements', 'Manage public announcements', 'Announcements', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(31, 'view-announcements', 'View Announcements', 'View announcements only', 'Announcements', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(32, 'manage-clearances', 'Manage Clearances', 'Full clearance management', 'Clearances', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(33, 'view-clearances', 'View Clearances', 'View clearances only', 'Clearances', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(34, 'issue-clearances', 'Issue Clearances', 'Issue/approve clearances', 'Clearances', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(35, 'manage-clearance-types', 'Manage Clearance Types', 'Manage clearance categories', 'Clearances', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(36, 'view-clearance-types', 'View Clearance Types', 'View clearance types only', 'Clearances', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(37, 'manage-puroks', 'Manage Puroks', 'Manage purok/zones', 'Puroks', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(38, 'manage-backups', 'Manage Backups', 'Create, download, and restore system backups', 'System', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(39, 'view-statistics', 'View Statistics', 'Access statistics and analytics', 'Reports', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(40, 'view-security-logs', 'View Security Logs', 'Access security and audit logs', 'Security', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(41, 'manage-document-types', 'Manage Document Types', 'Manage document categories and requirements', 'Documents', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(42, 'view-document-types', 'View Document Types', 'View document types only', 'Documents', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(43, 'manage-calendar', 'Manage Calendar', 'Manage events and schedules', 'Calendar', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43'),
(44, 'view-calendar', 'View Calendar', 'View calendar events only', 'Calendar', 'web', 1, '2026-02-15 22:26:43', '2026-02-15 22:26:43');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `requires_account` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `committee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `additional_committees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of additional committee IDs' CHECK (json_valid(`additional_committees`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `puroks`
--

CREATE TABLE `puroks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `leader_name` varchar(255) DEFAULT NULL,
  `leader_contact` varchar(255) DEFAULT NULL,
  `total_households` int(11) NOT NULL DEFAULT 0,
  `total_residents` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `google_maps_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `puroks`
--

INSERT INTO `puroks` (`id`, `name`, `slug`, `description`, `leader_name`, `leader_contact`, `total_households`, `total_residents`, `status`, `google_maps_url`, `created_at`, `updated_at`) VALUES
(1, 'Purok 1', 'purok-1', 'Northwest area near the barangay hall and church. Mostly residential with some small businesses.', 'Juan Dela Cruz', '09123456789', 85, 357, 'active', 'https://goo.gl/maps/example1', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(2, 'Purok 2', 'purok-2', 'Central area surrounding the public market. Commercial and residential mixed.', 'Maria Santos', '09187654321', 92, 412, 'active', 'https://goo.gl/maps/example2', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(3, 'Purok 3', 'purok-3', 'Eastern hillside area with agricultural lands and scattered residences.', 'Pedro Reyes', '09234567890', 68, 289, 'active', 'https://goo.gl/maps/example3', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(4, 'Purok 4', 'purok-4', 'Southern riverbank area, prone to flooding but densely populated.', 'Ana Lopez', '09345678901', 110, 523, 'active', 'https://goo.gl/maps/example4', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(5, 'Purok 5', 'purok-5', 'Western industrial zone with warehouses and workers\' housing.', 'Jose Mercado', '09456789012', 74, 336, 'active', 'https://goo.gl/maps/example5', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(6, 'Purok 6', 'purok-6', 'Northern residential subdivision with mostly middle-class families.', 'Elena Villanueva', '09567890123', 120, 480, 'active', 'https://goo.gl/maps/example6', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(7, 'Purok 7', 'purok-7', 'Northeastern area with newly developed housing projects.', 'Ricardo Gomez', '09678901234', 95, 398, 'active', 'https://goo.gl/maps/example7', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(8, 'Purok 8', 'purok-8', 'Southeastern agricultural area with farming families.', 'Luzviminda Fernandez', '09789012345', 82, 345, 'active', 'https://goo.gl/maps/example8', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(9, 'Purok 9', 'purok-9', 'Southwestern coastal area with fishing community.', 'Roberto Aquino', '09890123456', 78, 367, 'active', 'https://goo.gl/maps/example9', '2026-02-15 22:33:12', '2026-02-15 22:33:12'),
(10, 'Purok 10', 'purok-10', 'Central business district with most commercial establishments.', 'Cecilia Ramos', '09901234567', 105, 445, 'active', 'https://goo.gl/maps/example10', '2026-02-15 22:33:12', '2026-02-15 22:33:12');

-- --------------------------------------------------------

--
-- Table structure for table `report_evidences`
--

CREATE TABLE `report_evidences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `report_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_types`
--

CREATE TABLE `report_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT '#6B7280',
  `priority_level` int(11) NOT NULL DEFAULT 3,
  `resolution_days` int(11) NOT NULL DEFAULT 7,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `requires_immediate_action` tinyint(1) NOT NULL DEFAULT 0,
  `requires_evidence` tinyint(1) NOT NULL DEFAULT 0,
  `allows_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `required_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`required_fields`)),
  `resolution_steps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resolution_steps`)),
  `assigned_to_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`assigned_to_roles`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `resident_id` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `suffix` varchar(255) DEFAULT NULL,
  `birth_date` date NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `civil_status` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `purok_id` bigint(20) UNSIGNED DEFAULT NULL,
  `household_id` bigint(20) UNSIGNED DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `is_voter` tinyint(1) NOT NULL DEFAULT 0,
  `is_pwd` tinyint(1) NOT NULL DEFAULT 0,
  `is_senior` tinyint(1) NOT NULL DEFAULT 0,
  `is_solo_parent` tinyint(1) NOT NULL DEFAULT 0,
  `is_indigent` tinyint(1) NOT NULL DEFAULT 0,
  `senior_id_number` varchar(255) DEFAULT NULL,
  `pwd_id_number` varchar(255) DEFAULT NULL,
  `solo_parent_id_number` varchar(255) DEFAULT NULL,
  `indigent_id_number` varchar(255) DEFAULT NULL,
  `discount_eligibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`id`, `user_id`, `photo_path`, `resident_id`, `first_name`, `last_name`, `middle_name`, `suffix`, `birth_date`, `age`, `gender`, `civil_status`, `contact_number`, `email`, `address`, `purok_id`, `household_id`, `occupation`, `education`, `religion`, `is_voter`, `is_pwd`, `is_senior`, `is_solo_parent`, `is_indigent`, `senior_id_number`, `pwd_id_number`, `solo_parent_id_number`, `indigent_id_number`, `discount_eligibilities`, `place_of_birth`, `remarks`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'RES-2026-02-28191', 'Juan', 'Dela Cruz', 'Santos', 'Jr.', '1985-06-15', 40, 'male', 'Married', '09171234567', 'juan.delacruz@example.com', '123 Main Street', 1, 1, 'Farmer', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, '\"[]\"', 'Kibawe, Bukidnon', 'Active community member', 'active', '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(2, NULL, NULL, 'RES-2026-02-58854', 'Maria', 'Santos', 'Lopez', NULL, '1990-03-22', 35, 'female', 'Single', '09172345678', 'maria.santos@example.com', '456 Oak Street', 2, NULL, 'Teacher', 'College Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, '\"[]\"', 'Cagayan de Oro City', 'Local school teacher', 'active', '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(3, NULL, NULL, 'RES-2026-02-39874', 'Pedro', 'Reyes', 'Gonzales', NULL, '1950-12-10', 75, 'male', 'Widowed', '09173456789', 'pedro.reyes@example.com', '789 Pine Street', 3, NULL, 'Retired', 'Elementary Graduate', 'Roman Catholic', 1, 0, 1, 0, 1, 'OSCA-38496', NULL, NULL, 'IND-21519', '\"[\\\"senior\\\",\\\"indigent\\\"]\"', 'Kibawe, Bukidnon', 'Senior citizen, needs assistance', 'active', '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(4, NULL, NULL, 'RES-2026-02-86192', 'Ana', 'Fernandez', 'Villanueva', NULL, '1988-07-19', 37, 'female', 'Single', '09174567890', 'ana.fernandez@example.com', '321 Acacia Street', 4, NULL, 'Self-employed', 'College Level', 'Roman Catholic', 1, 1, 0, 0, 0, NULL, 'PWD-60016', NULL, NULL, '\"[\\\"pwd\\\"]\"', 'Bukidnon', 'PWD member', 'active', '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(5, NULL, NULL, 'RES-2026-02-19011', 'Luz', 'Villanueva', 'Mercado', NULL, '1982-09-14', 43, 'female', 'Single Parent', '09175678901', 'luz.villanueva@example.com', '654 Bamboo Street', 5, NULL, 'Market Vendor', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 1, 1, NULL, NULL, 'SP-28214', 'IND-18588', '\"[\\\"solo_parent\\\",\\\"indigent\\\"]\"', 'Kibawe, Bukidnon', 'Solo parent with 2 children', 'active', '2026-02-15 23:59:15', '2026-02-15 23:59:15'),
(6, NULL, NULL, 'RES-2529', 'Juan', 'Dela Cruz', NULL, NULL, '1980-05-15', 45, 'male', 'Married', NULL, NULL, '123 Mabini Street', 1, 1, 'Government Employee', 'College Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(7, NULL, NULL, 'RES-9233', 'Maria', 'Dela Cruz', NULL, NULL, '1982-08-22', 43, 'female', 'Married', NULL, NULL, '123 Mabini Street', 1, 1, 'Teacher', 'College Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(8, NULL, NULL, 'RES-2602', 'Jose', 'Dela Cruz', NULL, NULL, '2008-03-10', 17, 'male', 'Single', NULL, NULL, '123 Mabini Street', 1, 1, 'Student', 'High School', 'Roman Catholic', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(9, NULL, NULL, 'RES-8069', 'Ana', 'Dela Cruz', NULL, NULL, '2010-11-18', 15, 'female', 'Single', NULL, NULL, '123 Mabini Street', 1, 1, 'Student', 'Elementary', 'Roman Catholic', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(10, NULL, NULL, 'RES-5913', 'Pedro', 'Santos', NULL, NULL, '1975-02-20', 50, 'male', 'Married', NULL, NULL, '456 Rizal Avenue', 2, 4, 'Business Owner', 'College Graduate', 'Iglesia Ni Cristo', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(11, NULL, NULL, 'RES-1742', 'Elena', 'Santos', NULL, NULL, '1978-07-12', 47, 'female', 'Married', NULL, NULL, '456 Rizal Avenue', 2, 4, 'Business Owner', 'College Graduate', 'Iglesia Ni Cristo', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(12, NULL, NULL, 'RES-2083', 'Carlos', 'Santos', NULL, NULL, '2005-09-30', 20, 'male', 'Single', NULL, NULL, '456 Rizal Avenue', 2, 4, 'Student', 'Senior High', 'Iglesia Ni Cristo', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(13, NULL, NULL, 'RES-7880', 'Miguel', 'Reyes', NULL, NULL, '1988-12-05', 37, 'male', 'Married', NULL, NULL, '789 Bonifacio Street', 3, 5, 'Construction Worker', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(14, NULL, NULL, 'RES-8945', 'Teresa', 'Reyes', NULL, NULL, '1990-04-18', 35, 'female', 'Married', NULL, NULL, '789 Bonifacio Street', 3, 5, 'Housewife', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(15, NULL, NULL, 'RES-2495', 'Rosa', 'Reyes', NULL, NULL, '2012-06-25', 13, 'female', 'Single', NULL, NULL, '789 Bonifacio Street', 3, 5, 'Student', 'Elementary', 'Roman Catholic', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(16, NULL, NULL, 'RES-7401', 'Lito', 'Reyes', NULL, NULL, '1955-03-08', 70, 'male', 'Widowed', NULL, NULL, '789 Bonifacio Street', 3, 5, 'Retired', 'Elementary Graduate', 'Roman Catholic', 1, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(17, NULL, NULL, 'RES-1126', 'Anita', 'Garcia', NULL, NULL, '1950-01-15', 76, 'female', 'Widowed', NULL, NULL, '1010 Luna Street', 4, 6, 'Retired', 'Elementary Graduate', 'Roman Catholic', 1, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(18, NULL, NULL, 'RES-4172', 'Ramon', 'Fernandez', NULL, NULL, '1972-09-10', 53, 'male', 'Married', NULL, NULL, '1111 Mabuhay Street', 5, 7, 'Driver', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(19, NULL, NULL, 'RES-9275', 'Luz', 'Fernandez', NULL, NULL, '1975-11-22', 50, 'female', 'Married', NULL, NULL, '1111 Mabuhay Street', 5, 7, 'Vendor', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(20, NULL, NULL, 'RES-1492', 'Mark', 'Fernandez', NULL, NULL, '1998-07-14', 27, 'male', 'Single', NULL, NULL, '1111 Mabuhay Street', 5, 7, 'Call Center Agent', 'College Level', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(21, NULL, NULL, 'RES-0358', 'Joy', 'Fernandez', NULL, NULL, '2000-03-28', 25, 'female', 'Single', NULL, NULL, '1111 Mabuhay Street', 5, 7, 'Student', 'College', 'Roman Catholic', 1, 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(22, NULL, NULL, 'RES-4917', 'Ben', 'Fernandez', NULL, NULL, '2003-12-05', 22, 'male', 'Single', NULL, NULL, '1111 Mabuhay Street', 5, 7, 'Student', 'Senior High', 'Roman Catholic', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(23, NULL, NULL, 'RES-5203', 'Marites', 'Villanueva', NULL, NULL, '1985-06-19', 40, 'female', 'Single Parent', NULL, NULL, '1212 Rizal Extension', 6, 8, 'Laundry Worker', 'High School Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(24, NULL, NULL, 'RES-3191', 'Kristine', 'Villanueva', NULL, NULL, '2015-02-08', 11, 'female', 'Single', NULL, NULL, '1212 Rizal Extension', 6, 8, 'Student', 'Elementary', 'Roman Catholic', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(25, NULL, NULL, 'RES-6904', 'Manuel', 'Torres', NULL, NULL, '1970-10-30', 55, 'male', 'Married', NULL, NULL, '1313 Bonifacio Street', 7, 9, 'Government Employee', 'College Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(26, NULL, NULL, 'RES-0792', 'Gloria', 'Torres', NULL, NULL, '1973-12-12', 52, 'female', 'Married', NULL, NULL, '1313 Bonifacio Street', 7, 9, 'Teacher', 'College Graduate', 'Roman Catholic', 1, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21'),
(27, NULL, NULL, 'RES-0493', 'Kevin', 'Torres', NULL, NULL, '2001-04-25', 24, 'male', 'Single', NULL, NULL, '1313 Bonifacio Street', 7, 9, 'Student', 'College', 'Roman Catholic', 1, 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2026-02-15 23:59:21', '2026-02-15 23:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `resident_documents`
--

CREATE TABLE `resident_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `document_category_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_extension` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_size_human` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `requires_password` tinyint(1) NOT NULL DEFAULT 0,
  `password` varchar(255) DEFAULT NULL,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `download_count` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','expired','revoked','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `document_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `security_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`security_options`)),
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resident_profiles`
--

CREATE TABLE `resident_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system_role` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `is_system_role`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'Full system access and management', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(2, 'Barangay Captain', 'Barangay captain with oversight access', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(3, 'Barangay Secretary', 'Handles documentation, records, and administrative tasks', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(4, 'Barangay Treasurer', 'Manages barangay funds, collections, and disbursements', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(5, 'Barangay Kagawad', 'Barangay council member with committee oversight', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(6, 'SK Chairman', 'Sangguniang Kabataan chairman representing youth', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(7, 'SK Kagawad', 'Sangguniang Kabataan council member', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(8, 'Treasury Officer', 'Payment and financial management', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(9, 'Records Clerk', 'Resident and household management', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(10, 'Clearance Officer', 'Clearance and certificate issuance', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(11, 'Viewer', 'Read-only access', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(12, 'Staff', 'General staff with basic operational access', 1, '2026-02-15 22:45:44', '2026-02-15 22:45:44'),
(13, 'Household Head', 'Head of household with access to manage household members and requests', 0, '2026-02-15 22:45:44', '2026-02-15 22:45:44');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `granted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `granted_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `granted_by`, `granted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(2, 1, 2, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(3, 1, 3, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(4, 1, 4, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(5, 1, 5, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(6, 1, 6, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(7, 1, 7, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(8, 1, 8, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(9, 1, 9, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(10, 1, 10, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(11, 1, 11, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(12, 1, 12, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(13, 1, 13, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(14, 1, 14, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(15, 1, 15, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(16, 1, 16, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(17, 1, 17, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(18, 1, 18, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(19, 1, 19, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(20, 1, 20, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(21, 1, 21, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(22, 1, 22, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(23, 1, 23, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(24, 1, 24, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(25, 1, 25, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(26, 1, 26, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(27, 1, 27, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(28, 1, 28, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(29, 1, 29, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(30, 1, 30, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(31, 1, 31, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(32, 1, 32, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(33, 1, 33, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(34, 1, 34, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(35, 1, 35, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(36, 1, 36, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(37, 1, 37, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(38, 1, 38, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(39, 1, 39, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(40, 1, 40, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(41, 1, 41, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(42, 1, 42, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(43, 1, 43, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(44, 1, 44, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(45, 2, 1, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(46, 2, 2, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(47, 2, 6, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(48, 2, 7, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(49, 2, 8, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(50, 2, 9, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(51, 2, 10, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(52, 2, 11, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(53, 2, 12, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(54, 2, 13, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(55, 2, 14, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(56, 2, 15, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(57, 2, 16, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(58, 2, 17, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(59, 2, 18, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(60, 2, 19, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(61, 2, 20, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(62, 2, 21, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(63, 2, 22, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(64, 2, 23, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(65, 2, 24, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(66, 2, 25, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(67, 2, 26, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(68, 2, 27, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(69, 2, 28, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(70, 2, 29, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(71, 2, 30, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(72, 2, 31, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(73, 2, 32, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(74, 2, 33, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(75, 2, 34, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(76, 2, 35, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(77, 2, 36, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(78, 2, 37, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(79, 2, 39, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(80, 2, 40, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(81, 2, 41, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(82, 2, 42, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(83, 2, 43, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(84, 2, 44, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(85, 3, 1, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(86, 3, 2, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(87, 3, 6, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(88, 3, 7, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(89, 3, 8, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(90, 3, 9, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(91, 3, 10, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(92, 3, 12, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(93, 3, 14, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(94, 3, 16, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(95, 3, 17, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(96, 3, 18, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(97, 3, 19, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(98, 3, 20, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(99, 3, 21, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(100, 3, 22, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(101, 3, 23, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(102, 3, 24, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(103, 3, 25, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(104, 3, 26, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(105, 3, 27, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(106, 3, 28, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(107, 3, 29, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(108, 3, 30, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(109, 3, 31, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(110, 3, 32, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(111, 3, 33, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(112, 3, 34, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(113, 3, 35, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(114, 3, 36, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(115, 3, 37, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(116, 3, 39, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(117, 3, 40, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(118, 3, 41, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(119, 3, 42, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(120, 3, 43, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(121, 3, 44, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(122, 4, 1, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(123, 4, 2, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(124, 4, 6, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(125, 4, 10, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(126, 4, 11, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(127, 4, 13, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(128, 4, 14, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(129, 4, 15, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(130, 4, 16, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(131, 4, 18, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(132, 4, 26, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(133, 4, 31, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(134, 4, 33, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(135, 4, 36, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(136, 4, 37, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(137, 4, 39, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(138, 4, 40, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(139, 4, 42, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(140, 4, 44, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(141, 8, 1, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(142, 8, 2, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(143, 8, 6, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(144, 8, 10, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(145, 8, 11, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(146, 8, 13, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(147, 8, 14, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(148, 8, 15, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(149, 8, 16, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(150, 8, 18, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(151, 8, 31, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(152, 8, 33, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(153, 8, 36, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(154, 8, 37, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(155, 8, 39, NULL, NULL, '2026-02-15 23:54:39', '2026-02-15 23:54:39'),
(156, 8, 40, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(157, 8, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(158, 8, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(159, 9, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(160, 9, 2, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(161, 9, 6, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(162, 9, 10, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(163, 9, 29, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(164, 9, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(165, 9, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(166, 9, 36, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(167, 9, 37, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(168, 9, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(169, 9, 41, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(170, 9, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(171, 9, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(172, 10, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(173, 10, 2, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(174, 10, 6, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(175, 10, 10, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(176, 10, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(177, 10, 32, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(178, 10, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(179, 10, 34, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(180, 10, 35, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(181, 10, 36, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(182, 10, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(183, 10, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(184, 10, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(185, 5, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(186, 5, 2, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(187, 5, 6, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(188, 5, 10, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(189, 5, 12, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(190, 5, 14, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(191, 5, 16, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(192, 5, 18, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(193, 5, 26, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(194, 5, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(195, 5, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(196, 5, 36, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(197, 5, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(198, 5, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(199, 5, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(200, 6, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(201, 6, 2, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(202, 6, 6, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(203, 6, 10, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(204, 6, 18, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(205, 6, 26, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(206, 6, 30, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(207, 6, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(208, 6, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(209, 6, 36, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(210, 6, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(211, 6, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(212, 6, 43, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(213, 6, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(214, 7, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(215, 7, 2, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(216, 7, 18, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(217, 7, 26, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(218, 7, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(219, 7, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(220, 7, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(221, 7, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(222, 7, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(223, 12, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(224, 12, 2, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(225, 12, 6, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(226, 12, 10, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(227, 12, 18, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(228, 12, 20, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(229, 12, 23, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(230, 12, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(231, 12, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(232, 12, 42, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(233, 12, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(234, 11, 1, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(235, 11, 18, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(236, 11, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(237, 11, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(238, 11, 39, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(239, 11, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(240, 13, 6, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(241, 13, 10, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(242, 13, 18, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(243, 13, 19, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(244, 13, 31, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(245, 13, 33, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40'),
(246, 13, 44, NULL, NULL, '2026-02-15 23:54:40', '2026-02-15 23:54:40');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('26DCsGmPZxa1RPv7ibZk1WDkqpQmF16UHMqBpjZl', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiRFl5MEpmT3ZxVndMa1VVTmMxSk9VREUxRUFIRWU4alN5OXY2OVlQdiI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozMjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BheW1lbnRzLzEiO3M6NToicm91dGUiO3M6MTM6InBheW1lbnRzLnNob3ciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1771249606),
('adgLMZ6XoDsRmM6Jd0qjSZ5Yy7XHS06HPi8v3SNa', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiTFE4TGJyUVNEUHpnRnA5TEZQekI2QU9Cc2g4aFdoaUo0anhBdThmWSI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo1MDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2NsZWFyYW5jZXMvY2xlYXJhbmNlcy9jcmVhdGUiO3M6NToicm91dGUiO3M6MTc6ImNsZWFyYW5jZXMuY3JlYXRlIjt9fQ==', 1771249818),
('dqdHcwoSUXjzedhgk2K2r9URxN3Pbaqk2NuRgJPv', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiM2lBU3BFUlZ5YWJSZGJDSGluTnY3eWVQdTQ3dzFvR3VOWTRGSmZ0dCI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo3MDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwLy53ZWxsLWtub3duL2FwcHNwZWNpZmljL2NvbS5jaHJvbWUuZGV2dG9vbHMuanNvbiI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1771250499),
('ECOHcvj3eNNNplOD4qpIhXbn09y2ixCp76Vpv5H3', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiSTNWem55QlRXT1d3QzRqdkVQeTk0TVVMZDhEZVRpSUFsTENPUUt5WSI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozMjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BheW1lbnRzLzEiO3M6NToicm91dGUiO3M6MTM6InBheW1lbnRzLnNob3ciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1771248563),
('elSVlE1ofkn0iES8SElU4sPJ9SlUCOVIF4bm6SI6', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiN3c2VWFnNG8xOEpwSERZYmZ4S2cwMzZ4bG1KWExBd0lQb2pLZWhmUiI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo1NToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3VzZXJzP3NvcnRfYnk9bmFtZSZzb3J0X29yZGVyPWFzYyI7czo1OiJyb3V0ZSI7czoxMToidXNlcnMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1771240425),
('gLzJXBEiMGig3rS4o5feKFR21pDfn1nOxQ9KE8do', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiY3FuMlVqcnhVMDVrRWdKbTdwWVpWZ2p1YVVTOVJSRzdCTVZXdWJPNSI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozMjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BheW1lbnRzLzEiO3M6NToicm91dGUiO3M6MTM6InBheW1lbnRzLnNob3ciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1771248301),
('oyKGnOhDO4NpqY2nn1nqpxHe5zleA3MjngAXpRWj', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiSW5RbFlERGQxSU96eTBVMWJvVFp3RUVySHFuNExzT0p1NkltaDBHdyI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozMjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BheW1lbnRzLzEiO3M6NToicm91dGUiO3M6MTM6InBheW1lbnRzLnNob3ciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1771247375),
('UYYL2JpnzBLRTMqL6vI3vFg5sD1EUT0FSWroeQU4', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiOGtweVgyOG1FUEdiZkR4eGF5dmhrYnptMTZjSU03YmxUY25hNVZ5TSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9wYXltZW50cy9wYXltZW50cy9jcmVhdGUiO3M6NToicm91dGUiO3M6MTU6InBheW1lbnRzLmNyZWF0ZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7czo0OiJ1c2VyIjthOjQ6e3M6NDoicm9sZSI7czoxMzoiQWRtaW5pc3RyYXRvciI7czoxMToicGVybWlzc2lvbnMiO2E6NDQ6e2k6MDtzOjE0OiJ2aWV3LWRhc2hib2FyZCI7aToxO3M6MjA6InZpZXctYWRtaW4tZGFzaGJvYXJkIjtpOjI7czoxMjoibWFuYWdlLXVzZXJzIjtpOjM7czoxMjoibWFuYWdlLXJvbGVzIjtpOjQ7czoxODoibWFuYWdlLXBlcm1pc3Npb25zIjtpOjU7czoxNjoibWFuYWdlLXJlc2lkZW50cyI7aTo2O3M6MTY6Im1hbmFnZS1vZmZpY2lhbHMiO2k6NztzOjE3OiJtYW5hZ2UtY29tbWl0dGVlcyI7aTo4O3M6MTY6Im1hbmFnZS1wb3NpdGlvbnMiO2k6OTtzOjE3OiJtYW5hZ2UtaG91c2Vob2xkcyI7aToxMDtzOjE1OiJtYW5hZ2UtcGF5bWVudHMiO2k6MTE7czoxMzoidmlldy1wYXltZW50cyI7aToxMjtzOjExOiJtYW5hZ2UtZmVlcyI7aToxMztzOjk6InZpZXctZmVlcyI7aToxNDtzOjE2OiJtYW5hZ2UtZmVlLXR5cGVzIjtpOjE1O3M6MTQ6InZpZXctZmVlLXR5cGVzIjtpOjE2O3M6MTQ6Im1hbmFnZS1yZXBvcnRzIjtpOjE3O3M6MTI6InZpZXctcmVwb3J0cyI7aToxODtzOjE0OiJjcmVhdGUtcmVwb3J0cyI7aToxOTtzOjEyOiJlZGl0LXJlcG9ydHMiO2k6MjA7czoxNDoiZGVsZXRlLXJlcG9ydHMiO2k6MjE7czoxNDoiYXNzaWduLXJlcG9ydHMiO2k6MjI7czoxNToicmVzb2x2ZS1yZXBvcnRzIjtpOjIzO3M6MTQ6InJldmlldy1yZXBvcnRzIjtpOjI0O3M6MTU6Im1hbmFnZS1ibG90dGVycyI7aToyNTtzOjEzOiJ2aWV3LWJsb3R0ZXJzIjtpOjI2O3M6MTk6Im1hbmFnZS1yZXBvcnQtdHlwZXMiO2k6Mjc7czoxNzoidmlldy1yZXBvcnQtdHlwZXMiO2k6Mjg7czoxMjoibWFuYWdlLWZvcm1zIjtpOjI5O3M6MjA6Im1hbmFnZS1hbm5vdW5jZW1lbnRzIjtpOjMwO3M6MTg6InZpZXctYW5ub3VuY2VtZW50cyI7aTozMTtzOjE3OiJtYW5hZ2UtY2xlYXJhbmNlcyI7aTozMjtzOjE1OiJ2aWV3LWNsZWFyYW5jZXMiO2k6MzM7czoxNjoiaXNzdWUtY2xlYXJhbmNlcyI7aTozNDtzOjIyOiJtYW5hZ2UtY2xlYXJhbmNlLXR5cGVzIjtpOjM1O3M6MjA6InZpZXctY2xlYXJhbmNlLXR5cGVzIjtpOjM2O3M6MTM6Im1hbmFnZS1wdXJva3MiO2k6Mzc7czoxNDoibWFuYWdlLWJhY2t1cHMiO2k6Mzg7czoxNToidmlldy1zdGF0aXN0aWNzIjtpOjM5O3M6MTg6InZpZXctc2VjdXJpdHktbG9ncyI7aTo0MDtzOjIxOiJtYW5hZ2UtZG9jdW1lbnQtdHlwZXMiO2k6NDE7czoxOToidmlldy1kb2N1bWVudC10eXBlcyI7aTo0MjtzOjE1OiJtYW5hZ2UtY2FsZW5kYXIiO2k6NDM7czoxMzoidmlldy1jYWxlbmRhciI7fXM6OToiZnVsbF9uYW1lIjtzOjE6IiAiO3M6MjY6InNob3dfcGFzc3dvcmRfY2hhbmdlX21vZGFsIjtiOjE7fX0=', 1771246669);

-- --------------------------------------------------------

--
-- Table structure for table `special_discounts`
--

CREATE TABLE `special_discounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `special_discount_applications`
--

CREATE TABLE `special_discount_applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fee_id` bigint(20) UNSIGNED NOT NULL,
  `requested_by` bigint(20) UNSIGNED NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `position` bigint(20) UNSIGNED DEFAULT NULL,
  `require_password_change` tinyint(1) NOT NULL DEFAULT 0,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `role_id` tinyint(20) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_used_recovery_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`two_factor_used_recovery_codes`)),
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `two_factor_enabled_at` timestamp NULL DEFAULT NULL,
  `two_factor_last_used_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `login_count` int(11) NOT NULL DEFAULT 0,
  `current_login_ip` varchar(45) DEFAULT NULL,
  `last_logout_at` timestamp NULL DEFAULT NULL,
  `last_login_device` varchar(255) DEFAULT NULL,
  `last_login_browser` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) NOT NULL DEFAULT 0,
  `last_failed_login_at` timestamp NULL DEFAULT NULL,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `resident_id` bigint(20) UNSIGNED DEFAULT NULL,
  `household_id` bigint(20) UNSIGNED DEFAULT NULL,
  `current_resident_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `contact_number`, `position`, `require_password_change`, `password_changed_at`, `email`, `role_id`, `status`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_used_recovery_codes`, `two_factor_confirmed_at`, `two_factor_enabled_at`, `two_factor_last_used_at`, `remember_token`, `last_login_at`, `last_login_ip`, `login_count`, `current_login_ip`, `last_logout_at`, `last_login_device`, `last_login_browser`, `created_at`, `updated_at`, `failed_login_attempts`, `last_failed_login_at`, `account_locked_until`, `resident_id`, `household_id`, `current_resident_id`) VALUES
(1, NULL, NULL, 'admin', '09171234567', NULL, 0, NULL, 'admin@barangay.gov.ph', 1, 'active', '2026-02-15 22:51:04', '$2y$12$B.OQVXSm/kPzR/c4s5ll.O/VRnABjTXPhUwvBl6qmGUm190mzdesm', NULL, NULL, NULL, NULL, NULL, NULL, 'KTaOMGXTu847DAs4ci8QARTV6GmM16iCLt5pZhZKb1Td8rNzrr0DB5aA230R', '2026-02-16 03:52:32', '127.0.0.1', 2, NULL, NULL, NULL, NULL, '2026-02-15 22:51:04', '2026-02-16 03:52:32', 0, NULL, NULL, NULL, NULL, NULL),
(2, NULL, NULL, 'captain', '09171234568', NULL, 0, NULL, 'captain@barangay.gov.ph', 2, 'active', '2026-02-15 22:51:04', '$2y$12$s7aG0NfYzsiC1Z/tOA1LL.De62.ZlRLmE/R4S08YsdJejtzFPQQ5O', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:04', '2026-02-15 22:51:04', 0, NULL, NULL, NULL, NULL, NULL),
(3, NULL, NULL, 'secretary', '09171234569', NULL, 0, NULL, 'secretary@barangay.gov.ph', 3, 'active', '2026-02-15 22:51:04', '$2y$12$M3W/tCImyYuC9ixUYV880O17tzVqQnw4OEBaZi44edKtuRs3a2fy6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:04', '2026-02-15 22:51:04', 0, NULL, NULL, NULL, NULL, NULL),
(4, NULL, NULL, 'treasurer', '09171234570', NULL, 0, NULL, 'treasurer@barangay.gov.ph', 4, 'active', '2026-02-15 22:51:05', '$2y$12$ZRJTg8Po5iVGHqFv6kZMzugLTkrW4ltIN7/94bl4nk9dW7057grFG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:05', '2026-02-15 22:51:05', 0, NULL, NULL, NULL, NULL, NULL),
(5, NULL, NULL, 'treasury_officer', '09171234571', NULL, 0, NULL, 'treasury.officer@barangay.gov.ph', 8, 'active', '2026-02-15 22:51:05', '$2y$12$wa0OL/rRIZCu2HQp1DEZGuTSP1qytRnwzpcis/li2KFO.PK5I64LG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:05', '2026-02-15 22:51:05', 0, NULL, NULL, NULL, NULL, NULL),
(6, NULL, NULL, 'records_clerk', '09171234572', NULL, 0, NULL, 'records.clerk@barangay.gov.ph', 9, 'active', '2026-02-15 22:51:05', '$2y$12$Vy5bLlpiwD6k1HNEXWj8v.KMMvdqICoWPBLiMiBHieHT6Wc.1u3Zi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:05', '2026-02-15 22:51:05', 0, NULL, NULL, NULL, NULL, NULL),
(7, NULL, NULL, 'clearance_officer', '09171234573', NULL, 0, NULL, 'clearance.officer@barangay.gov.ph', 10, 'active', '2026-02-15 22:51:05', '$2y$12$q4kNYk6drwu0Ubhftf8mquAKuLdGoDjaQSFWcqpX6iLPd89LN1ZDG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:05', '2026-02-15 22:51:05', 0, NULL, NULL, NULL, NULL, NULL),
(8, NULL, NULL, 'staff1', '09171234574', NULL, 0, NULL, 'staff1@barangay.gov.ph', 12, 'active', '2026-02-15 22:51:05', '$2y$12$6EVKnKkFFpLF.mJ1Rr/.FuCwG44OA8CZpl01IR9ggPFKeSdkqFrUK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:05', '2026-02-15 22:51:05', 0, NULL, NULL, NULL, NULL, NULL),
(9, NULL, NULL, 'staff2', '09171234575', NULL, 0, NULL, 'staff2@barangay.gov.ph', 12, 'active', '2026-02-15 22:51:05', '$2y$12$8o/DxtZ8Eyvbh1eQQcHD.uu3AliI3QhgD73Reqx8bOva7a/rcYFAa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:05', '2026-02-15 22:51:05', 0, NULL, NULL, NULL, NULL, NULL),
(10, NULL, NULL, 'viewer', '09171234576', NULL, 0, NULL, 'viewer@barangay.gov.ph', 11, 'active', '2026-02-15 22:51:06', '$2y$12$ogGh1iKKitPBfu/I4NQdru5olVQA4JasGgjYPYSqzfQNJDs0LievO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:06', '2026-02-15 22:51:06', 0, NULL, NULL, NULL, NULL, NULL),
(11, NULL, NULL, 'kagawad1', '09171234577', NULL, 0, NULL, 'kagawad1@barangay.gov.ph', 5, 'active', '2026-02-15 22:51:06', '$2y$12$5JBUP84Xz/fdXQNQExIXxu3hIyUFjTD5gXZps.8w/lULPZrnBKr.W', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:06', '2026-02-15 22:51:06', 0, NULL, NULL, NULL, NULL, NULL),
(12, NULL, NULL, 'kagawad2', '09171234578', NULL, 0, NULL, 'kagawad2@barangay.gov.ph', 5, 'active', '2026-02-15 22:51:06', '$2y$12$uYy.WuaTKYDCsWjSV7ewkuazM7cxqErwvC8rT9./8jtoeBFMztJ/a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:06', '2026-02-15 22:51:06', 0, NULL, NULL, NULL, NULL, NULL),
(13, NULL, NULL, 'kagawad3', '09171234579', NULL, 0, NULL, 'kagawad3@barangay.gov.ph', 5, 'active', '2026-02-15 22:51:06', '$2y$12$cMs/Mncw68LcC./5rqX6B.p/TWOV7KinRyZQuV6ClO.2WLpu/3SVq', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:06', '2026-02-15 22:51:06', 0, NULL, NULL, NULL, NULL, NULL),
(14, NULL, NULL, 'sk_chairman', '09171234580', NULL, 0, NULL, 'sk.chairman@barangay.gov.ph', 6, 'active', '2026-02-15 22:51:06', '$2y$12$B5eKd5rJzdUWOAND94jkEO4/KKc7uThIyAgx8ECDpC.1ElBMq/KBS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:06', '2026-02-15 22:51:06', 0, NULL, NULL, NULL, NULL, NULL),
(15, NULL, NULL, 'sk_kagawad1', '09171234581', NULL, 0, NULL, 'sk.kagawad1@barangay.gov.ph', 7, 'active', '2026-02-15 22:51:07', '$2y$12$kRPLHCIbl7.ifDHshF9ZQOH1GKszauRNYuzdkhPniIDn/0g9uEsYK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07', 0, NULL, NULL, NULL, NULL, NULL),
(16, NULL, NULL, 'sk_kagawad2', '09171234582', NULL, 0, NULL, 'sk.kagawad2@barangay.gov.ph', 7, 'active', '2026-02-15 22:51:07', '$2y$12$5pvolnjkFi3AWaJJnTU.6eEh6RFAXBvkrwduxxRg5ZA9qy6cFSJsS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-15 22:51:07', '2026-02-15 22:51:07', 0, NULL, NULL, NULL, NULL, NULL),
(17, 'Juan', 'Dela Cruz', 'juandelacruz', '09123456789', NULL, 1, NULL, 'juandelacruz@household.local', 13, 'active', '2026-02-16 03:13:13', '$2y$12$VYioIBb9j.Ira3wyC48viepJTHzeQnCNaGDhVZfi/CMRiWFLjC6n.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13', 0, NULL, NULL, 6, 1, 6),
(18, 'Pedro', 'Santos', 'pedrosantos', '09234567890', NULL, 1, NULL, 'pedrosantos@household.local', 13, 'active', '2026-02-16 03:13:13', '$2y$12$ueEokJ7mZYaduoO2ovkHJu2F42zneqTzn7wmHN7MUQSAu9Fdt8XY.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13', 0, NULL, NULL, 10, 4, 10),
(19, 'Miguel', 'Reyes', 'miguelreyes', '09345678901', NULL, 1, NULL, 'miguelreyes@household.local', 13, 'active', '2026-02-16 03:13:13', '$2y$12$D7rTJ67oN./6GOC1nrltZunt3LjB632GGn5bpRX1uLmh3qxLbiPmG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13', 0, NULL, NULL, 13, 5, 13),
(20, 'Anita', 'Garcia', 'anitagarcia', '09456789012', NULL, 1, NULL, 'anitagarcia@household.local', 13, 'active', '2026-02-16 03:13:13', '$2y$12$6bLdR/vqtwAknSGmj375kOrcPU.en5/TAy4ICniJLKBv1Hn3Iq/B2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13', 0, NULL, NULL, 17, 6, 17),
(21, 'Ramon', 'Fernandez', 'ramonfernandez', '09567890123', NULL, 1, NULL, 'ramonfernandez@household.local', 13, 'active', '2026-02-16 03:13:13', '$2y$12$Q.ZCOLMuAe.vjLbUiwSJtuP9Sk93T5QTzSU2JfTBLNM0lnILF1ZNm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:13', '2026-02-16 03:13:13', 0, NULL, NULL, 18, 7, 18),
(22, 'Marites', 'Villanueva', 'maritesvillanueva', '09678901234', NULL, 1, NULL, 'maritesvillanueva@household.local', 13, 'active', '2026-02-16 03:13:14', '$2y$12$5Tbzvl/uw3j9E3BWvQe9P.gHXJx5RUyx60Z4E.KWcI.zPHjPeE0Hq', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:14', '2026-02-16 03:13:14', 0, NULL, NULL, 23, 8, 23),
(23, 'Manuel', 'Torres', 'manueltorres', '09789012345', NULL, 1, NULL, 'manueltorres@household.local', 13, 'active', '2026-02-16 03:13:14', '$2y$12$jsEWdKOtzI2mF3pEG8Igee2VoXpkF7wLPXqLK7lrfOd5pAqJpxKKS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-16 03:13:14', '2026-02-16 03:13:14', 0, NULL, NULL, 25, 9, 25);

-- --------------------------------------------------------

--
-- Table structure for table `user_login_logs`
--

CREATE TABLE `user_login_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `platform` varchar(100) DEFAULT NULL,
  `login_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `logout_at` timestamp NULL DEFAULT NULL,
  `is_successful` tinyint(1) NOT NULL DEFAULT 1,
  `failure_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_login_logs`
--

INSERT INTO `user_login_logs` (`id`, `user_id`, `ip_address`, `user_agent`, `session_id`, `device_type`, `browser`, `platform`, `login_at`, `logout_at`, `is_successful`, `failure_reason`, `created_at`, `updated_at`) VALUES
(1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 'Desktop', 'Chrome', 'Windows', '2026-02-15 21:27:59', NULL, 0, 'User not found', '2026-02-15 21:27:59', '2026-02-15 21:27:59'),
(2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 'Desktop', 'Chrome', 'Windows', '2026-02-15 23:50:40', NULL, 0, 'User not found', '2026-02-15 23:50:40', '2026-02-15 23:50:40'),
(3, 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'toBhg2Y6BHSiYA9W7jF3Y1sX71DoCVSJ8m6oh3mO', 'Desktop', 'Chrome', 'Windows', '2026-02-15 23:51:37', NULL, 1, NULL, '2026-02-15 23:51:37', '2026-02-15 23:51:37'),
(4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 'Desktop', 'Chrome', 'Windows', '2026-02-16 03:52:08', NULL, 0, 'User not found', '2026-02-16 03:52:08', '2026-02-16 03:52:08'),
(5, 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'UYYL2JpnzBLRTMqL6vI3vFg5sD1EUT0FSWroeQU4', 'Desktop', 'Chrome', 'Windows', '2026-02-16 03:52:32', NULL, 1, NULL, '2026-02-16 03:52:32', '2026-02-16 03:52:32');

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `is_granted` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_logs`
--
ALTER TABLE `access_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `access_logs_user_id_accessed_at_index` (`user_id`,`accessed_at`),
  ADD KEY `access_logs_action_type_accessed_at_index` (`action_type`,`accessed_at`),
  ADD KEY `access_logs_resource_type_resource_id_index` (`resource_type`,`resource_id`),
  ADD KEY `access_logs_is_sensitive_accessed_at_index` (`is_sensitive`,`accessed_at`),
  ADD KEY `access_logs_session_id_index` (`session_id`),
  ADD KEY `access_logs_ip_address_index` (`ip_address`);

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_logged_at_index` (`user_id`,`logged_at`),
  ADD KEY `audit_logs_event_category_logged_at_index` (`event_category`,`logged_at`),
  ADD KEY `audit_logs_event_type_logged_at_index` (`event_type`,`logged_at`),
  ADD KEY `audit_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  ADD KEY `audit_logs_severity_logged_at_index` (`severity`,`logged_at`),
  ADD KEY `audit_logs_document_number_index` (`document_number`),
  ADD KEY `audit_logs_or_number_index` (`or_number`),
  ADD KEY `audit_logs_office_index` (`office`),
  ADD KEY `audit_logs_barangay_id_logged_at_index` (`barangay_id`,`logged_at`);
ALTER TABLE `audit_logs` ADD FULLTEXT KEY `audit_logs_description_event_subject_name_fulltext` (`description`,`event`,`subject_name`);

--
-- Indexes for table `backups`
--
ALTER TABLE `backups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `backups_restored_by_foreign` (`restored_by`),
  ADD KEY `backups_type_status_index` (`type`,`status`),
  ADD KEY `backups_expires_at_index` (`expires_at`),
  ADD KEY `backups_created_by_index` (`created_by`),
  ADD KEY `backups_contains_files_contains_database_index` (`contains_files`,`contains_database`);

--
-- Indexes for table `backup_activities`
--
ALTER TABLE `backup_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `backup_activities_backup_id_foreign` (`backup_id`),
  ADD KEY `backup_activities_action_status_index` (`action`,`status`),
  ADD KEY `backup_activities_created_at_index` (`created_at`),
  ADD KEY `backup_activities_user_id_index` (`user_id`);

--
-- Indexes for table `blotter_details`
--
ALTER TABLE `blotter_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blotter_details_incident_id_foreign` (`incident_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clearance_requests_reference_number_unique` (`reference_number`),
  ADD UNIQUE KEY `clearance_requests_clearance_number_unique` (`clearance_number`),
  ADD KEY `clearance_requests_resident_id_foreign` (`resident_id`),
  ADD KEY `clearance_requests_clearance_type_id_foreign` (`clearance_type_id`),
  ADD KEY `clearance_requests_processed_by_foreign` (`processed_by`),
  ADD KEY `clearance_requests_requested_by_user_id_foreign` (`requested_by_user_id`),
  ADD KEY `clearance_requests_issuing_officer_id_foreign` (`issuing_officer_id`);

--
-- Indexes for table `clearance_request_documents`
--
ALTER TABLE `clearance_request_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clearance_request_documents_clearance_request_id_foreign` (`clearance_request_id`);

--
-- Indexes for table `clearance_types`
--
ALTER TABLE `clearance_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clearance_types_code_unique` (`code`),
  ADD KEY `clearance_types_is_active_index` (`is_active`),
  ADD KEY `clearance_types_code_index` (`code`);

--
-- Indexes for table `committees`
--
ALTER TABLE `committees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `committees_code_unique` (`code`);

--
-- Indexes for table `community_reports`
--
ALTER TABLE `community_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `community_reports_report_number_unique` (`report_number`),
  ADD KEY `community_reports_report_type_id_foreign` (`report_type_id`),
  ADD KEY `community_reports_previous_report_id_foreign` (`previous_report_id`),
  ADD KEY `community_reports_assigned_to_foreign` (`assigned_to`),
  ADD KEY `community_reports_user_id_foreign` (`user_id`),
  ADD KEY `community_reports_status_index` (`status`),
  ADD KEY `community_reports_priority_index` (`priority`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `departments_is_active_index` (`is_active`);

--
-- Indexes for table `discount_fee_types`
--
ALTER TABLE `discount_fee_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discount_fee_types_fee_type_id_discount_type_id_unique` (`fee_type_id`,`discount_type_id`),
  ADD KEY `discount_fee_types_fee_type_id_index` (`fee_type_id`),
  ADD KEY `discount_fee_types_discount_type_id_index` (`discount_type_id`);

--
-- Indexes for table `discount_rules`
--
ALTER TABLE `discount_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discount_rules_code_unique` (`code`),
  ADD KEY `discount_rules_discount_type_index` (`discount_type`),
  ADD KEY `discount_rules_is_active_index` (`is_active`);

--
-- Indexes for table `discount_types`
--
ALTER TABLE `discount_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discount_types_code_unique` (`code`);

--
-- Indexes for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_categories_slug_unique` (`slug`);

--
-- Indexes for table `document_requirements`
--
ALTER TABLE `document_requirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_requirements_clearance_type_id_foreign` (`clearance_type_id`),
  ADD KEY `document_requirements_type_document_type_id_foreign` (`document_type_id`);

--
-- Indexes for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_shares_token_unique` (`token`),
  ADD KEY `document_shares_document_id_foreign` (`document_id`);

--
-- Indexes for table `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_types_code_unique` (`code`),
  ADD KEY `idx_document_types_document_category_id` (`document_category_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fees`
--
ALTER TABLE `fees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fees_fee_type_id_foreign` (`fee_type_id`),
  ADD KEY `fees_payer_id_payer_model_index` (`payer_id`,`payer_model`),
  ADD KEY `fees_payer_type_index` (`payer_type`),
  ADD KEY `fees_batch_reference_index` (`batch_reference`),
  ADD KEY `fees_status_index` (`status`);

--
-- Indexes for table `fee_discounts`
--
ALTER TABLE `fee_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fee_discounts_fee_id_foreign` (`fee_id`),
  ADD KEY `fee_discounts_discount_type_id_foreign` (`discount_type_id`),
  ADD KEY `fee_discounts_special_discount_id_foreign` (`special_discount_id`),
  ADD KEY `fee_discounts_application_id_foreign` (`special_discount_application_id`),
  ADD KEY `fee_discounts_applied_by_foreign` (`applied_by`);

--
-- Indexes for table `fee_types`
--
ALTER TABLE `fee_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fee_types_code_unique` (`code`),
  ADD KEY `fee_types_document_category_id_foreign` (`document_category_id`);

--
-- Indexes for table `financial_audit_trails`
--
ALTER TABLE `financial_audit_trails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `financial_audit_trails_audit_log_id_foreign` (`audit_log_id`),
  ADD KEY `financial_audit_trails_transaction_date_account_code_index` (`transaction_date`,`account_code`),
  ADD KEY `financial_audit_trails_voucher_number_index` (`voucher_number`);

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `forms_slug_unique` (`slug`),
  ADD KEY `forms_created_by_foreign` (`created_by`),
  ADD KEY `forms_category_index` (`category`),
  ADD KEY `forms_issuing_agency_index` (`issuing_agency`),
  ADD KEY `forms_is_active_index` (`is_active`),
  ADD KEY `forms_last_viewed_by_foreign` (`last_viewed_by`),
  ADD KEY `forms_last_downloaded_by_foreign` (`last_downloaded_by`),
  ADD KEY `forms_is_featured_index` (`is_featured`),
  ADD KEY `forms_is_public_index` (`is_public`),
  ADD KEY `forms_requires_login_index` (`requires_login`),
  ADD KEY `forms_last_viewed_at_index` (`last_viewed_at`),
  ADD KEY `forms_last_downloaded_at_index` (`last_downloaded_at`);

--
-- Indexes for table `households`
--
ALTER TABLE `households`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `households_household_number_unique` (`household_number`),
  ADD KEY `households_user_id_foreign` (`user_id`);

--
-- Indexes for table `household_members`
--
ALTER TABLE `household_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `household_members_household_id_resident_id_unique` (`household_id`,`resident_id`),
  ADD KEY `household_members_resident_id_foreign` (`resident_id`);

--
-- Indexes for table `incidents`
--
ALTER TABLE `incidents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `incidents_household_id_foreign` (`household_id`),
  ADD KEY `incidents_resident_id_foreign` (`resident_id`),
  ADD KEY `incidents_user_id_foreign` (`user_id`),
  ADD KEY `incidents_type_index` (`type`),
  ADD KEY `incidents_status_index` (`status`);

--
-- Indexes for table `incident_evidences`
--
ALTER TABLE `incident_evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `incident_evidences_incident_id_index` (`incident_id`),
  ADD KEY `incident_evidences_uploaded_by_index` (`uploaded_by`),
  ADD KEY `incident_evidences_file_type_index` (`file_type`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `notification_preferences_user_id_type_channel_unique` (`user_id`,`type`,`channel`);

--
-- Indexes for table `officials`
--
ALTER TABLE `officials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `officials_resident_id_position_term_start_unique` (`resident_id`,`position`,`term_start`),
  ADD KEY `officials_status_position_index` (`status`,`position`),
  ADD KEY `fk_officials_user` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_or_number_unique` (`or_number`),
  ADD KEY `payments_recorded_by_foreign` (`recorded_by`),
  ADD KEY `payments_payer_type_payer_id_index` (`payer_type`,`payer_id`),
  ADD KEY `payments_payment_date_index` (`payment_date`),
  ADD KEY `payments_or_number_index` (`or_number`),
  ADD KEY `payments_status_index` (`status`),
  ADD KEY `payments_payment_method_index` (`payment_method`),
  ADD KEY `payments_discount_code_index` (`discount_code`),
  ADD KEY `payments_clearance_code_index` (`clearance_code`),
  ADD KEY `payments_certificate_type_index` (`certificate_type`),
  ADD KEY `payments_amount_paid_index` (`amount_paid`);

--
-- Indexes for table `payment_discounts`
--
ALTER TABLE `payment_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_discounts_payment_id_foreign` (`payment_id`),
  ADD KEY `payment_discounts_discount_rule_id_foreign` (`discount_rule_id`),
  ADD KEY `payment_discounts_verified_by_foreign` (`verified_by`);

--
-- Indexes for table `payment_items`
--
ALTER TABLE `payment_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_items_payment_id_foreign` (`payment_id`),
  ADD KEY `payment_items_fee_id_index` (`fee_id`),
  ADD KEY `payment_items_category_index` (`category`),
  ADD KEY `payment_items_clearance_request_id_foreign` (`clearance_request_id`),
  ADD KEY `payment_items_discount_type_id_foreign` (`discount_type_id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_methods_resident_id_is_active_index` (`resident_id`,`is_active`),
  ADD KEY `payment_methods_resident_id_is_default_index` (`resident_id`,`is_default`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `positions_code_unique` (`code`),
  ADD KEY `positions_role_id_foreign` (`role_id`),
  ADD KEY `fk_positions_committee_id` (`committee_id`);

--
-- Indexes for table `puroks`
--
ALTER TABLE `puroks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `puroks_name_unique` (`name`),
  ADD UNIQUE KEY `puroks_slug_unique` (`slug`);

--
-- Indexes for table `report_evidences`
--
ALTER TABLE `report_evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_evidences_report_id_foreign` (`report_id`),
  ADD KEY `report_evidences_uploaded_by_foreign` (`uploaded_by`),
  ADD KEY `report_evidences_verified_by_foreign` (`verified_by`);

--
-- Indexes for table `report_types`
--
ALTER TABLE `report_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_types_code_unique` (`code`),
  ADD KEY `report_types_is_active_priority_level_index` (`is_active`,`priority_level`),
  ADD KEY `report_types_code_index` (`code`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `residents_resident_id_unique` (`resident_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `residents_household_id_foreign` (`household_id`),
  ADD KEY `residents_is_solo_parent_index` (`is_solo_parent`),
  ADD KEY `residents_is_indigent_index` (`is_indigent`);

--
-- Indexes for table `resident_documents`
--
ALTER TABLE `resident_documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `resident_documents_reference_number_unique` (`reference_number`),
  ADD KEY `resident_documents_document_category_id_foreign` (`document_category_id`),
  ADD KEY `resident_documents_resident_id_document_category_id_index` (`resident_id`,`document_category_id`),
  ADD KEY `resident_documents_status_index` (`status`),
  ADD KEY `resident_documents_issue_date_index` (`issue_date`),
  ADD KEY `resident_documents_expiry_date_index` (`expiry_date`),
  ADD KEY `resident_documents_document_type_id_foreign` (`document_type_id`),
  ADD KEY `resident_documents_uploaded_by_foreign` (`uploaded_by`);

--
-- Indexes for table `resident_profiles`
--
ALTER TABLE `resident_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `resident_profiles_user_id_resident_id_unique` (`user_id`,`resident_id`),
  ADD KEY `resident_profiles_resident_id_foreign` (`resident_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_permissions_role_id_foreign` (`role_id`),
  ADD KEY `role_permissions_permission_id_foreign` (`permission_id`),
  ADD KEY `role_permissions_granted_by_foreign` (`granted_by`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `special_discounts`
--
ALTER TABLE `special_discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `special_discounts_code_unique` (`code`),
  ADD KEY `special_discounts_is_active_index` (`is_active`);

--
-- Indexes for table `special_discount_applications`
--
ALTER TABLE `special_discount_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `special_discount_applications_fee_id_foreign` (`fee_id`),
  ADD KEY `special_discount_applications_requested_by_foreign` (`requested_by`),
  ADD KEY `special_discount_applications_approved_by_foreign` (`approved_by`),
  ADD KEY `special_discount_applications_status_index` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `fk_users_resident` (`resident_id`),
  ADD KEY `fk_users_household` (`household_id`),
  ADD KEY `fk_users_current_resident` (`current_resident_id`);

--
-- Indexes for table `user_login_logs`
--
ALTER TABLE `user_login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_login` (`user_id`,`login_at`),
  ADD KEY `idx_login_at` (`login_at`),
  ADD KEY `user_login_logs_session_id_index` (`session_id`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_permissions_user_id_foreign` (`user_id`),
  ADD KEY `user_permissions_permission_id_foreign` (`permission_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_logs`
--
ALTER TABLE `access_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `backups`
--
ALTER TABLE `backups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `backup_activities`
--
ALTER TABLE `backup_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blotter_details`
--
ALTER TABLE `blotter_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clearance_request_documents`
--
ALTER TABLE `clearance_request_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clearance_types`
--
ALTER TABLE `clearance_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `committees`
--
ALTER TABLE `committees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `community_reports`
--
ALTER TABLE `community_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `discount_fee_types`
--
ALTER TABLE `discount_fee_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_rules`
--
ALTER TABLE `discount_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `discount_types`
--
ALTER TABLE `discount_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `document_categories`
--
ALTER TABLE `document_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `document_requirements`
--
ALTER TABLE `document_requirements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_shares`
--
ALTER TABLE `document_shares`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_types`
--
ALTER TABLE `document_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fees`
--
ALTER TABLE `fees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `fee_discounts`
--
ALTER TABLE `fee_discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_types`
--
ALTER TABLE `fee_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `financial_audit_trails`
--
ALTER TABLE `financial_audit_trails`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `households`
--
ALTER TABLE `households`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `household_members`
--
ALTER TABLE `household_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `incidents`
--
ALTER TABLE `incidents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `incident_evidences`
--
ALTER TABLE `incident_evidences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `officials`
--
ALTER TABLE `officials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment_discounts`
--
ALTER TABLE `payment_discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment_items`
--
ALTER TABLE `payment_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `puroks`
--
ALTER TABLE `puroks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `report_evidences`
--
ALTER TABLE `report_evidences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_types`
--
ALTER TABLE `report_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `resident_documents`
--
ALTER TABLE `resident_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resident_profiles`
--
ALTER TABLE `resident_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT for table `special_discounts`
--
ALTER TABLE `special_discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `special_discount_applications`
--
ALTER TABLE `special_discount_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `user_login_logs`
--
ALTER TABLE `user_login_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_logs`
--
ALTER TABLE `access_logs`
  ADD CONSTRAINT `access_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `backups`
--
ALTER TABLE `backups`
  ADD CONSTRAINT `backups_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `backups_restored_by_foreign` FOREIGN KEY (`restored_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `backup_activities`
--
ALTER TABLE `backup_activities`
  ADD CONSTRAINT `backup_activities_backup_id_foreign` FOREIGN KEY (`backup_id`) REFERENCES `backups` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `backup_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blotter_details`
--
ALTER TABLE `blotter_details`
  ADD CONSTRAINT `blotter_details_incident_id_foreign` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  ADD CONSTRAINT `clearance_requests_clearance_type_id_foreign` FOREIGN KEY (`clearance_type_id`) REFERENCES `clearance_types` (`id`),
  ADD CONSTRAINT `clearance_requests_issuing_officer_id_foreign` FOREIGN KEY (`issuing_officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `clearance_requests_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `clearance_requests_requested_by_user_id_foreign` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `clearance_requests_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`);

--
-- Constraints for table `clearance_request_documents`
--
ALTER TABLE `clearance_request_documents`
  ADD CONSTRAINT `clearance_request_documents_clearance_request_id_foreign` FOREIGN KEY (`clearance_request_id`) REFERENCES `clearance_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_reports`
--
ALTER TABLE `community_reports`
  ADD CONSTRAINT `community_reports_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `community_reports_previous_report_id_foreign` FOREIGN KEY (`previous_report_id`) REFERENCES `community_reports` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `community_reports_report_type_id_foreign` FOREIGN KEY (`report_type_id`) REFERENCES `report_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `community_reports_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discount_fee_types`
--
ALTER TABLE `discount_fee_types`
  ADD CONSTRAINT `discount_fee_types_discount_type_id_foreign` FOREIGN KEY (`discount_type_id`) REFERENCES `discount_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discount_fee_types_fee_type_id_foreign` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_requirements`
--
ALTER TABLE `document_requirements`
  ADD CONSTRAINT `document_requirementse_clearance_type_id_foreign` FOREIGN KEY (`clearance_type_id`) REFERENCES `clearance_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_requirementst_type_document_type_id_foreign` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD CONSTRAINT `document_shares_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `resident_documents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_types`
--
ALTER TABLE `document_types`
  ADD CONSTRAINT `fk_document_types_document_category_id` FOREIGN KEY (`document_category_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `fees`
--
ALTER TABLE `fees`
  ADD CONSTRAINT `fees_fee_type_id_foreign` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fee_discounts`
--
ALTER TABLE `fee_discounts`
  ADD CONSTRAINT `fee_discounts_discount_type_id_foreign` FOREIGN KEY (`discount_type_id`) REFERENCES `discount_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_discounts_fee_id_foreign` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fee_types`
--
ALTER TABLE `fee_types`
  ADD CONSTRAINT `fee_types_document_category_id_foreign` FOREIGN KEY (`document_category_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `financial_audit_trails`
--
ALTER TABLE `financial_audit_trails`
  ADD CONSTRAINT `financial_audit_trails_audit_log_id_foreign` FOREIGN KEY (`audit_log_id`) REFERENCES `audit_logs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `forms_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `forms_last_downloaded_by_foreign` FOREIGN KEY (`last_downloaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `forms_last_viewed_by_foreign` FOREIGN KEY (`last_viewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `households`
--
ALTER TABLE `households`
  ADD CONSTRAINT `households_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `household_members`
--
ALTER TABLE `household_members`
  ADD CONSTRAINT `household_members_household_id_foreign` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `household_members_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `incidents`
--
ALTER TABLE `incidents`
  ADD CONSTRAINT `incidents_household_id_foreign` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incidents_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incidents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `incident_evidences`
--
ALTER TABLE `incident_evidences`
  ADD CONSTRAINT `incident_evidences_incident_id_foreign` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incident_evidences_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `notification_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `officials`
--
ALTER TABLE `officials`
  ADD CONSTRAINT `fk_officials_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `officials_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payment_discounts`
--
ALTER TABLE `payment_discounts`
  ADD CONSTRAINT `payment_discounts_discount_rule_id_foreign` FOREIGN KEY (`discount_rule_id`) REFERENCES `discount_rules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_discounts_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_discounts_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_items`
--
ALTER TABLE `payment_items`
  ADD CONSTRAINT `payment_items_clearance_request_id_foreign` FOREIGN KEY (`clearance_request_id`) REFERENCES `clearance_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_items_fee_id_foreign` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`),
  ADD CONSTRAINT `payment_items_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD CONSTRAINT `payment_methods_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `fk_positions_committee_id` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `positions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report_evidences`
--
ALTER TABLE `report_evidences`
  ADD CONSTRAINT `report_evidences_report_id_foreign` FOREIGN KEY (`report_id`) REFERENCES `community_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `report_evidences_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `report_evidences_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `residents`
--
ALTER TABLE `residents`
  ADD CONSTRAINT `residents_household_id_foreign` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `resident_documents`
--
ALTER TABLE `resident_documents`
  ADD CONSTRAINT `resident_documents_document_category_id_foreign` FOREIGN KEY (`document_category_id`) REFERENCES `document_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resident_documents_document_type_id_foreign` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `resident_documents_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resident_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `resident_profiles`
--
ALTER TABLE `resident_profiles`
  ADD CONSTRAINT `resident_profiles_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resident_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_granted_by_foreign` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `role_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `special_discount_applications`
--
ALTER TABLE `special_discount_applications`
  ADD CONSTRAINT `special_discount_applications_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `special_discount_applications_fee_id_foreign` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `special_discount_applications_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_current_resident` FOREIGN KEY (`current_resident_id`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_household` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_login_logs`
--
ALTER TABLE `user_login_logs`
  ADD CONSTRAINT `fk_user_login_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
