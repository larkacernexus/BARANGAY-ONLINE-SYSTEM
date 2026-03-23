-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2026 at 03:03 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('general','important','event','maintenance','other') NOT NULL DEFAULT 'general',
  `priority` int(11) NOT NULL DEFAULT 0 COMMENT '0=Normal,1=Low,2=Medium,3=High,4=Urgent',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `audience_type` enum('all','roles','puroks','households','household_members','businesses','specific_users') NOT NULL DEFAULT 'all',
  `target_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of role IDs' CHECK (json_valid(`target_roles`)),
  `target_puroks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of purok IDs' CHECK (json_valid(`target_puroks`)),
  `target_households` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of household IDs' CHECK (json_valid(`target_households`)),
  `target_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of user IDs' CHECK (json_valid(`target_users`)),
  `target_businesses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of business IDs' CHECK (json_valid(`target_businesses`)),
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_attachments`
--

CREATE TABLE `announcement_attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_views`
--

CREATE TABLE `announcement_views` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `view_date` date NOT NULL,
  `view_count` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_view_logs`
--

CREATE TABLE `announcement_view_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attachment_downloads`
--

CREATE TABLE `attachment_downloads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attachment_id` bigint(20) UNSIGNED NOT NULL,
  `announcement_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `downloaded_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
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
-- Table structure for table `blotters`
--

CREATE TABLE `blotters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `blotter_number` varchar(255) NOT NULL,
  `incident_type` varchar(255) NOT NULL,
  `incident_description` text NOT NULL,
  `incident_datetime` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `reporter_name` varchar(255) NOT NULL,
  `reporter_contact` varchar(255) DEFAULT NULL,
  `reporter_address` varchar(255) DEFAULT NULL,
  `respondent_name` varchar(255) DEFAULT NULL,
  `respondent_address` varchar(255) DEFAULT NULL,
  `witnesses` text DEFAULT NULL,
  `evidence` text DEFAULT NULL,
  `status` enum('pending','investigating','resolved','archived') DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `action_taken` text DEFAULT NULL,
  `investigator` varchar(255) DEFAULT NULL,
  `resolved_datetime` datetime DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `involved_residents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`involved_residents`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_type` varchar(255) NOT NULL,
  `owner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `owner_name` varchar(255) NOT NULL,
  `dti_sec_number` varchar(255) DEFAULT NULL,
  `tin_number` varchar(255) DEFAULT NULL,
  `mayors_permit_number` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `purok_id` bigint(20) UNSIGNED NOT NULL,
  `capital_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `monthly_gross` decimal(15,2) NOT NULL DEFAULT 0.00,
  `employee_count` int(11) NOT NULL DEFAULT 0,
  `permit_expiry_date` date DEFAULT NULL,
  `status` enum('active','closed','pending') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `payer_type` varchar(255) DEFAULT NULL,
  `payer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `household_id` bigint(20) UNSIGNED DEFAULT NULL,
  `clearance_type_id` bigint(20) UNSIGNED NOT NULL,
  `reference_number` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `specific_purpose` varchar(255) DEFAULT NULL,
  `urgency` enum('normal','rush','express') NOT NULL DEFAULT 'normal',
  `needed_date` date NOT NULL,
  `additional_requirements` text DEFAULT NULL,
  `fee_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','pending_payment','processing','approved','issued','rejected','cancelled','expired','paid') NOT NULL DEFAULT 'pending',
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_status` enum('unpaid','partially_paid','paid') DEFAULT 'unpaid',
  `amount_paid` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) DEFAULT 0.00,
  `payment_date` datetime DEFAULT NULL,
  `or_number` varchar(100) DEFAULT NULL,
  `clearance_number` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `requirements_met` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements_met`)),
  `remarks` text DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `contact_address` text DEFAULT NULL,
  `contact_purok_id` bigint(20) UNSIGNED DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
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
  `status` varchar(50) NOT NULL DEFAULT 'pending',
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
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'General',
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `views` int(11) NOT NULL DEFAULT 0,
  `helpful_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `google_maps_url` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `purok_id` bigint(20) DEFAULT NULL,
  `head_of_family` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `position_id` bigint(20) UNSIGNED NOT NULL,
  `committee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `term_start` date NOT NULL,
  `term_end` date NOT NULL,
  `status` enum('active','inactive','former') DEFAULT 'active',
  `order` int(11) DEFAULT 0,
  `responsibilities` text DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `photo_path` varchar(2048) DEFAULT NULL,
  `is_regular` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
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
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_type` varchar(255) DEFAULT NULL,
  `discount_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`discount_breakdown`)),
  `category` varchar(255) NOT NULL,
  `period_covered` varchar(255) DEFAULT NULL,
  `months_late` int(11) DEFAULT NULL,
  `fee_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Original fee data at time of payment' CHECK (json_valid(`fee_metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `clearance_request_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `privileges`
--

CREATE TABLE `privileges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `discount_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `default_discount_percentage` decimal(5,2) DEFAULT NULL,
  `requires_id_number` tinyint(1) DEFAULT 1,
  `requires_verification` tinyint(1) DEFAULT 1,
  `validity_years` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `receipt_number` varchar(255) NOT NULL,
  `receiptable_id` bigint(20) UNSIGNED DEFAULT NULL,
  `receiptable_type` varchar(255) DEFAULT NULL,
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `receipt_type` varchar(255) DEFAULT 'official',
  `payer_name` varchar(255) NOT NULL,
  `payer_address` varchar(255) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `surcharge` decimal(10,2) DEFAULT 0.00,
  `penalty` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `change_due` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `issued_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `issued_by` bigint(20) UNSIGNED DEFAULT NULL,
  `fee_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fee_breakdown`)),
  `discount_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`discount_breakdown`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_voided` tinyint(1) DEFAULT 0,
  `void_reason` text DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `printed_count` int(11) DEFAULT 0,
  `last_printed_at` timestamp NULL DEFAULT NULL,
  `email_sent` tinyint(1) DEFAULT 0,
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `sms_sent` tinyint(1) DEFAULT 0,
  `sms_sent_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_types`
--

CREATE TABLE `report_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
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
  `employment_status` varchar(50) DEFAULT NULL,
  `educational_attainment` varchar(100) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `is_voter` tinyint(1) NOT NULL DEFAULT 0,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `resident_privileges`
--

CREATE TABLE `resident_privileges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `privilege_id` bigint(20) UNSIGNED NOT NULL,
  `id_number` varchar(100) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `discount_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
-- Table structure for table `support_categories`
--

CREATE TABLE `support_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `resident_id` bigint(20) UNSIGNED NOT NULL,
  `ticket_number` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `message` text NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `resolved_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_replies`
--

CREATE TABLE `ticket_replies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `is_staff` tinyint(1) NOT NULL DEFAULT 0,
  `staff_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `login_qr_code` varchar(255) DEFAULT NULL,
  `login_qr_code_generated_at` timestamp NULL DEFAULT NULL,
  `login_qr_code_expires_at` timestamp NULL DEFAULT NULL,
  `login_qr_code_used_count` int(11) DEFAULT 0,
  `role_id` tinyint(20) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `qr_code_url` varchar(255) DEFAULT NULL,
  `qr_code_generated_at` timestamp NULL DEFAULT NULL,
  `qr_code_download_count` int(11) DEFAULT 0,
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
  `current_resident_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notification_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_preferences`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcements_type_index` (`type`),
  ADD KEY `announcements_priority_index` (`priority`),
  ADD KEY `announcements_is_active_index` (`is_active`),
  ADD KEY `announcements_audience_type_index` (`audience_type`),
  ADD KEY `announcements_start_date_index` (`start_date`),
  ADD KEY `announcements_end_date_index` (`end_date`),
  ADD KEY `announcements_start_end_date_index` (`start_date`,`end_date`),
  ADD KEY `announcements_created_at_index` (`created_at`),
  ADD KEY `announcements_created_by_foreign` (`created_by`),
  ADD KEY `announcements_updated_by_foreign` (`updated_by`);

--
-- Indexes for table `announcement_attachments`
--
ALTER TABLE `announcement_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_announcement_id` (`announcement_id`),
  ADD KEY `idx_mime_type` (`mime_type`),
  ADD KEY `fk_announcement_attachments_user` (`created_by`);

--
-- Indexes for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `announcement_reads_unique` (`announcement_id`,`user_id`),
  ADD KEY `announcement_reads_announcement_id_foreign` (`announcement_id`),
  ADD KEY `announcement_reads_user_id_foreign` (`user_id`);

--
-- Indexes for table `announcement_views`
--
ALTER TABLE `announcement_views`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `announcement_views_unique` (`announcement_id`,`user_id`,`view_date`),
  ADD KEY `announcement_views_announcement_id_foreign` (`announcement_id`),
  ADD KEY `announcement_views_user_id_foreign` (`user_id`);

--
-- Indexes for table `announcement_view_logs`
--
ALTER TABLE `announcement_view_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcement_view_logs_announcement_id_foreign` (`announcement_id`),
  ADD KEY `announcement_view_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `attachment_downloads`
--
ALTER TABLE `attachment_downloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attachment_downloads_attachment_id_foreign` (`attachment_id`),
  ADD KEY `attachment_downloads_announcement_id_foreign` (`announcement_id`),
  ADD KEY `attachment_downloads_user_id_foreign` (`user_id`);

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
-- Indexes for table `blotters`
--
ALTER TABLE `blotters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blotter_number` (`blotter_number`),
  ADD KEY `idx_blotter_number` (`blotter_number`),
  ADD KEY `idx_incident_type` (`incident_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_incident_datetime` (`incident_datetime`),
  ADD KEY `idx_barangay` (`barangay`),
  ADD KEY `idx_reporter_name` (`reporter_name`),
  ADD KEY `idx_respondent_name` (`respondent_name`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `blotter_details`
--
ALTER TABLE `blotter_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blotter_details_incident_id_foreign` (`incident_id`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businesses_business_name_index` (`business_name`),
  ADD KEY `businesses_owner_id_index` (`owner_id`),
  ADD KEY `businesses_purok_id_index` (`purok_id`),
  ADD KEY `businesses_status_index` (`status`),
  ADD KEY `businesses_permit_expiry_date_index` (`permit_expiry_date`),
  ADD KEY `businesses_business_type_index` (`business_type`);
ALTER TABLE `businesses` ADD FULLTEXT KEY `businesses_business_name_fulltext` (`business_name`);

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
  ADD KEY `clearance_requests_issuing_officer_id_foreign` (`issuing_officer_id`),
  ADD KEY `clearance_requests_contact_purok_id_foreign` (`contact_purok_id`),
  ADD KEY `clearance_requests_payer_type_payer_id_index` (`payer_type`,`payer_id`),
  ADD KEY `idx_clearance_requests_payment_id` (`payment_id`),
  ADD KEY `idx_clearance_requests_payment_status` (`payment_status`),
  ADD KEY `clearance_requests_household_id_index` (`household_id`);

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
  ADD KEY `community_reports_priority_index` (`priority`),
  ADD KEY `idx_status` (`status`);

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
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

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
  ADD UNIQUE KEY `officials_resident_unique` (`resident_id`),
  ADD UNIQUE KEY `officials_user_unique` (`user_id`),
  ADD KEY `officials_position_id_foreign` (`position_id`),
  ADD KEY `officials_committee_id_foreign` (`committee_id`);

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
-- Indexes for table `privileges`
--
ALTER TABLE `privileges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_discount_type_id` (`discount_type_id`);

--
-- Indexes for table `puroks`
--
ALTER TABLE `puroks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `puroks_name_unique` (`name`),
  ADD UNIQUE KEY `puroks_slug_unique` (`slug`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `idx_receipt_number` (`receipt_number`),
  ADD KEY `idx_or_number` (`or_number`),
  ADD KEY `idx_payer_name` (`payer_name`),
  ADD KEY `idx_issued_date` (`issued_date`),
  ADD KEY `idx_is_voided` (`is_voided`),
  ADD KEY `idx_payment_method` (`payment_method`),
  ADD KEY `idx_receipt_type` (`receipt_type`),
  ADD KEY `idx_receiptable` (`receiptable_type`,`receiptable_id`),
  ADD KEY `fk_receipts_payment` (`payment_id`),
  ADD KEY `fk_receipts_issued_by` (`issued_by`),
  ADD KEY `fk_receipts_voided_by` (`voided_by`);

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
  ADD KEY `residents_household_id_foreign` (`household_id`);

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
-- Indexes for table `resident_privileges`
--
ALTER TABLE `resident_privileges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resident_privileges_resident` (`resident_id`),
  ADD KEY `fk_resident_privileges_privilege` (`privilege_id`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_verified_at` (`verified_at`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_discount_type_id` (`discount_type_id`);

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
-- Indexes for table `support_categories`
--
ALTER TABLE `support_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `support_tickets_ticket_number_unique` (`ticket_number`),
  ADD KEY `support_tickets_resident_id_foreign` (`resident_id`);

--
-- Indexes for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_replies_ticket_id_foreign` (`ticket_id`),
  ADD KEY `ticket_replies_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `login_qr_code` (`login_qr_code`),
  ADD KEY `fk_users_resident` (`resident_id`),
  ADD KEY `fk_users_household` (`household_id`),
  ADD KEY `fk_users_current_resident` (`current_resident_id`),
  ADD KEY `idx_login_qr_code` (`login_qr_code`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcement_attachments`
--
ALTER TABLE `announcement_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcement_views`
--
ALTER TABLE `announcement_views`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcement_view_logs`
--
ALTER TABLE `announcement_view_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attachment_downloads`
--
ALTER TABLE `attachment_downloads`
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
-- AUTO_INCREMENT for table `blotters`
--
ALTER TABLE `blotters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blotter_details`
--
ALTER TABLE `blotter_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_fee_types`
--
ALTER TABLE `discount_fee_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_rules`
--
ALTER TABLE `discount_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_types`
--
ALTER TABLE `discount_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_categories`
--
ALTER TABLE `document_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fees`
--
ALTER TABLE `fees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_discounts`
--
ALTER TABLE `fee_discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_types`
--
ALTER TABLE `fee_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `household_members`
--
ALTER TABLE `household_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_discounts`
--
ALTER TABLE `payment_discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_items`
--
ALTER TABLE `payment_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `privileges`
--
ALTER TABLE `privileges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `puroks`
--
ALTER TABLE `puroks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resident_documents`
--
ALTER TABLE `resident_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resident_privileges`
--
ALTER TABLE `resident_privileges`
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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `support_categories`
--
ALTER TABLE `support_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_login_logs`
--
ALTER TABLE `user_login_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `announcements_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `announcement_attachments`
--
ALTER TABLE `announcement_attachments`
  ADD CONSTRAINT `fk_announcement_attachments_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_announcement_attachments_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD CONSTRAINT `announcement_reads_announcement_id_foreign` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_reads_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcement_views`
--
ALTER TABLE `announcement_views`
  ADD CONSTRAINT `announcement_views_announcement_id_foreign` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcement_view_logs`
--
ALTER TABLE `announcement_view_logs`
  ADD CONSTRAINT `announcement_view_logs_announcement_id_foreign` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_view_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attachment_downloads`
--
ALTER TABLE `attachment_downloads`
  ADD CONSTRAINT `attachment_downloads_announcement_id_foreign` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attachment_downloads_attachment_id_foreign` FOREIGN KEY (`attachment_id`) REFERENCES `announcement_attachments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attachment_downloads_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `businesses_purok_id_foreign` FOREIGN KEY (`purok_id`) REFERENCES `puroks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  ADD CONSTRAINT `clearance_requests_clearance_type_id_foreign` FOREIGN KEY (`clearance_type_id`) REFERENCES `clearance_types` (`id`),
  ADD CONSTRAINT `clearance_requests_contact_purok_id_foreign` FOREIGN KEY (`contact_purok_id`) REFERENCES `puroks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `clearance_requests_household_id_foreign` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `clearance_requests_issuing_officer_id_foreign` FOREIGN KEY (`issuing_officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `clearance_requests_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `clearance_requests_requested_by_user_id_foreign` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `clearance_requests_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`),
  ADD CONSTRAINT `fk_clearance_requests_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `officials_committee_id_foreign` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `officials_position_id_foreign` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`),
  ADD CONSTRAINT `officials_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `officials_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `privileges`
--
ALTER TABLE `privileges`
  ADD CONSTRAINT `fk_privileges_discount_type` FOREIGN KEY (`discount_type_id`) REFERENCES `discount_types` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `fk_receipts_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_receipts_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_receipts_voided_by` FOREIGN KEY (`voided_by`) REFERENCES `users` (`id`);

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
-- Constraints for table `resident_privileges`
--
ALTER TABLE `resident_privileges`
  ADD CONSTRAINT `fk_resident_privileges_discount_type` FOREIGN KEY (`discount_type_id`) REFERENCES `discount_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_resident_privileges_privilege` FOREIGN KEY (`privilege_id`) REFERENCES `privileges` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_resident_privileges_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_resident_id_foreign` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  ADD CONSTRAINT `ticket_replies_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
