-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2026 at 02:43 PM
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
-- Database: `barangayonlinesystem`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_logs`
--

CREATE TABLE `access_logs` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `route_name` varchar(255) DEFAULT NULL,
  `parameters` text DEFAULT NULL,
  `status_code` int(11) DEFAULT NULL,
  `response_time` int(11) DEFAULT NULL,
  `response_data` text DEFAULT NULL,
  `action_type` varchar(255) DEFAULT NULL,
  `resource_type` varchar(255) DEFAULT NULL,
  `resource_id` bigint(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_sensitive` int(11) DEFAULT NULL,
  `accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) DEFAULT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) DEFAULT NULL,
  `properties` text DEFAULT NULL,
  `batch_uuid` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `priority` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `audience_type` varchar(255) NOT NULL,
  `target_roles` text DEFAULT NULL,
  `target_puroks` text DEFAULT NULL,
  `target_households` text DEFAULT NULL,
  `target_users` text DEFAULT NULL,
  `target_businesses` text DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_attachments`
--

CREATE TABLE `announcement_attachments` (
  `id` bigint(20) DEFAULT NULL,
  `announcement_id` bigint(20) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `id` bigint(20) DEFAULT NULL,
  `announcement_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_views`
--

CREATE TABLE `announcement_views` (
  `id` bigint(20) DEFAULT NULL,
  `announcement_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `view_date` date DEFAULT NULL,
  `view_count` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_view_logs`
--

CREATE TABLE `announcement_view_logs` (
  `id` bigint(20) DEFAULT NULL,
  `announcement_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attachment_downloads`
--

CREATE TABLE `attachment_downloads` (
  `id` bigint(20) DEFAULT NULL,
  `attachment_id` bigint(20) DEFAULT NULL,
  `announcement_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `downloaded_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_position` varchar(255) DEFAULT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `event_category` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) DEFAULT NULL,
  `subject_name` varchar(255) DEFAULT NULL,
  `barangay_id` varchar(255) DEFAULT NULL,
  `office` varchar(255) DEFAULT NULL,
  `document_number` varchar(255) DEFAULT NULL,
  `old_values` text DEFAULT NULL,
  `new_values` text DEFAULT NULL,
  `properties` text DEFAULT NULL,
  `severity` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `platform` varchar(255) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` varchar(255) DEFAULT NULL,
  `logged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `backups`
--

CREATE TABLE `backups` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `size` bigint(20) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `compressed` int(11) DEFAULT NULL,
  `tables` text DEFAULT NULL,
  `storage_location` varchar(255) NOT NULL,
  `contains_files` int(11) DEFAULT NULL,
  `contains_database` int(11) DEFAULT NULL,
  `file_count` int(11) DEFAULT NULL,
  `checksum` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `restored_by` bigint(20) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `backup_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blotters`
--

CREATE TABLE `blotters` (
  `id` bigint(20) DEFAULT NULL,
  `blotter_number` varchar(255) DEFAULT NULL,
  `incident_type` varchar(255) DEFAULT NULL,
  `incident_description` text DEFAULT NULL,
  `incident_datetime` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `reporter_name` varchar(255) DEFAULT NULL,
  `reporter_contact` varchar(255) DEFAULT NULL,
  `reporter_address` varchar(255) DEFAULT NULL,
  `respondent_name` varchar(255) DEFAULT NULL,
  `respondent_address` varchar(255) DEFAULT NULL,
  `witnesses` text DEFAULT NULL,
  `evidence` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `priority` varchar(255) NOT NULL,
  `action_taken` text DEFAULT NULL,
  `investigator` varchar(255) DEFAULT NULL,
  `resolved_datetime` datetime DEFAULT NULL,
  `attachments` text DEFAULT NULL,
  `involved_residents` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blotter_details`
--

CREATE TABLE `blotter_details` (
  `id` bigint(20) DEFAULT NULL,
  `incident_id` bigint(20) DEFAULT NULL,
  `respondent_name` varchar(255) DEFAULT NULL,
  `hearing_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` bigint(20) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `business_type` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `dti_sec_number` varchar(255) DEFAULT NULL,
  `tin_number` varchar(255) DEFAULT NULL,
  `mayors_permit_number` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `purok_id` bigint(20) DEFAULT NULL,
  `capital_amount` decimal(10,2) NOT NULL,
  `monthly_gross` decimal(10,2) NOT NULL,
  `employee_count` int(11) DEFAULT NULL,
  `permit_expiry_date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL
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
  `id` bigint(20) DEFAULT NULL,
  `payer_type` varchar(255) DEFAULT NULL,
  `payer_id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `household_id` bigint(20) DEFAULT NULL,
  `clearance_type_id` bigint(20) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `specific_purpose` varchar(255) DEFAULT NULL,
  `urgency` varchar(255) NOT NULL,
  `needed_date` date DEFAULT NULL,
  `additional_requirements` text DEFAULT NULL,
  `fee_amount` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL,
  `payment_id` bigint(20) DEFAULT NULL,
  `payment_status` varchar(255) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `payment_date` datetime DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `clearance_number` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `requirements_met` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `contact_address` text DEFAULT NULL,
  `contact_purok_id` bigint(20) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `issuing_officer_name` varchar(255) DEFAULT NULL,
  `processed_by` bigint(20) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `requested_by_user_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `issuing_officer_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clearance_request_documents`
--

CREATE TABLE `clearance_request_documents` (
  `id` bigint(20) DEFAULT NULL,
  `document_type_id` bigint(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_verified` int(11) NOT NULL,
  `clearance_request_id` bigint(20) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clearance_types`
--

CREATE TABLE `clearance_types` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `fee` decimal(10,2) NOT NULL,
  `processing_days` int(11) DEFAULT NULL,
  `validity_days` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `requires_payment` int(11) DEFAULT NULL,
  `requires_approval` int(11) DEFAULT NULL,
  `is_online_only` int(11) DEFAULT NULL,
  `is_discountable` int(11) DEFAULT NULL,
  `eligibility_criteria` text DEFAULT NULL,
  `purpose_options` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `committees`
--

CREATE TABLE `committees` (
  `id` bigint(20) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_reports`
--

CREATE TABLE `community_reports` (
  `id` bigint(20) DEFAULT NULL,
  `report_type_id` bigint(20) DEFAULT NULL,
  `report_number` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `detailed_description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_time` time DEFAULT NULL,
  `urgency_level` varchar(255) NOT NULL,
  `recurring_issue` int(11) DEFAULT NULL,
  `affected_people` varchar(255) NOT NULL,
  `estimated_affected_count` int(11) DEFAULT NULL,
  `is_anonymous` int(11) DEFAULT NULL,
  `reporter_name` varchar(255) DEFAULT NULL,
  `reporter_contact` varchar(255) DEFAULT NULL,
  `reporter_address` text DEFAULT NULL,
  `perpetrator_details` text DEFAULT NULL,
  `preferred_resolution` text DEFAULT NULL,
  `has_previous_report` int(11) DEFAULT NULL,
  `previous_report_id` bigint(20) DEFAULT NULL,
  `impact_level` varchar(255) DEFAULT NULL,
  `safety_concern` int(11) DEFAULT NULL,
  `environmental_impact` int(11) DEFAULT NULL,
  `noise_level` varchar(255) DEFAULT NULL,
  `duration_hours` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `assigned_to` bigint(20) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_fee_types`
--

CREATE TABLE `discount_fee_types` (
  `id` bigint(20) DEFAULT NULL,
  `fee_type_id` bigint(20) DEFAULT NULL,
  `discount_type_id` bigint(20) DEFAULT NULL,
  `percentage` decimal(10,2) NOT NULL,
  `is_active` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_rules`
--

CREATE TABLE `discount_rules` (
  `id` bigint(20) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `value_type` varchar(255) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL,
  `minimum_purchase_amount` decimal(10,2) DEFAULT NULL,
  `priority` int(11) DEFAULT NULL,
  `requires_verification` int(11) DEFAULT NULL,
  `verification_document` varchar(255) DEFAULT NULL,
  `applicable_to` varchar(255) DEFAULT NULL,
  `applicable_puroks` text DEFAULT NULL,
  `stackable` int(11) DEFAULT NULL,
  `exclusive_with` text DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `default_percentage` decimal(10,2) NOT NULL,
  `legal_basis` varchar(255) DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `is_mandatory` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_requirements`
--

CREATE TABLE `document_requirements` (
  `id` bigint(20) DEFAULT NULL,
  `clearance_type_id` bigint(20) DEFAULT NULL,
  `document_type_id` bigint(20) DEFAULT NULL,
  `is_required` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_shares`
--

CREATE TABLE `document_shares` (
  `id` bigint(20) DEFAULT NULL,
  `document_id` bigint(20) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `access_type` varchar(255) DEFAULT NULL,
  `requires_password` int(11) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `max_views` int(11) DEFAULT NULL,
  `view_count` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `document_category_id` bigint(20) DEFAULT NULL,
  `is_required` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `accepted_formats` text DEFAULT NULL,
  `max_file_size` int(11) NOT NULL,
  `is_active` int(11) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `answer` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `views` int(11) DEFAULT NULL,
  `helpful_count` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fees`
--

CREATE TABLE `fees` (
  `id` bigint(20) DEFAULT NULL,
  `fee_type_id` bigint(20) DEFAULT NULL,
  `payer_type` varchar(255) DEFAULT NULL,
  `payer_id` bigint(20) DEFAULT NULL,
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
  `base_amount` decimal(10,2) NOT NULL,
  `surcharge_amount` decimal(10,2) NOT NULL,
  `penalty_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `property_description` text DEFAULT NULL,
  `business_type` varchar(255) DEFAULT NULL,
  `area` decimal(10,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `requirements_submitted` text DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `fee_code` varchar(255) DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `certificate_number` varchar(255) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `issued_by` bigint(20) DEFAULT NULL,
  `collected_by` bigint(20) DEFAULT NULL,
  `cancelled_by` bigint(20) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `fee_id` bigint(20) DEFAULT NULL,
  `discount_type_id` bigint(20) DEFAULT NULL,
  `special_discount_id` bigint(20) DEFAULT NULL,
  `special_discount_application_id` bigint(20) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `discount_percentage` decimal(10,2) NOT NULL,
  `base_amount` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `applied_by` bigint(20) DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_types`
--

CREATE TABLE `fee_types` (
  `id` bigint(20) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `document_category_id` bigint(20) DEFAULT NULL,
  `is_discountable` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `base_amount` decimal(10,2) NOT NULL,
  `amount_type` varchar(255) NOT NULL,
  `computation_formula` text DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `has_senior_discount` int(11) DEFAULT NULL,
  `senior_discount_percentage` decimal(10,2) NOT NULL,
  `has_pwd_discount` int(11) DEFAULT NULL,
  `pwd_discount_percentage` decimal(10,2) NOT NULL,
  `has_solo_parent_discount` int(11) DEFAULT NULL,
  `solo_parent_discount_percentage` decimal(10,2) DEFAULT NULL,
  `has_indigent_discount` int(11) DEFAULT NULL,
  `indigent_discount_percentage` decimal(10,2) DEFAULT NULL,
  `has_surcharge` int(11) DEFAULT NULL,
  `surcharge_percentage` decimal(10,2) DEFAULT NULL,
  `surcharge_fixed` decimal(10,2) DEFAULT NULL,
  `has_penalty` int(11) DEFAULT NULL,
  `penalty_percentage` decimal(10,2) DEFAULT NULL,
  `penalty_fixed` decimal(10,2) DEFAULT NULL,
  `frequency` time NOT NULL,
  `validity_days` int(11) DEFAULT NULL,
  `applicable_to` varchar(255) DEFAULT NULL,
  `applicable_puroks` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `is_mandatory` int(11) DEFAULT NULL,
  `auto_generate` int(11) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `audit_log_id` bigint(20) DEFAULT NULL,
  `fund_source` varchar(255) DEFAULT NULL,
  `account_code` varchar(255) DEFAULT NULL,
  `particulars` varchar(255) DEFAULT NULL,
  `payee` varchar(255) DEFAULT NULL,
  `voucher_number` varchar(255) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `debit` decimal(10,2) NOT NULL,
  `credit` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `issuing_agency` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `is_featured` int(11) DEFAULT NULL,
  `is_public` int(11) DEFAULT NULL,
  `requires_login` int(11) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `language` varchar(255) DEFAULT NULL,
  `pages` int(11) DEFAULT NULL,
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `last_viewed_by` bigint(20) DEFAULT NULL,
  `last_downloaded_at` timestamp NULL DEFAULT NULL,
  `last_downloaded_by` bigint(20) DEFAULT NULL,
  `download_count` int(11) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `view_count` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `households`
--

CREATE TABLE `households` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `household_number` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `member_count` int(11) DEFAULT NULL,
  `income_range` varchar(255) DEFAULT NULL,
  `housing_type` varchar(255) DEFAULT NULL,
  `ownership_status` varchar(255) DEFAULT NULL,
  `water_source` varchar(255) DEFAULT NULL,
  `electricity` int(11) DEFAULT NULL,
  `internet` int(11) DEFAULT NULL,
  `vehicle` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `google_maps_url` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,2) DEFAULT NULL,
  `longitude` decimal(10,2) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `household_id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `relationship_to_head` varchar(255) DEFAULT NULL,
  `is_head` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incidents`
--

CREATE TABLE `incidents` (
  `id` bigint(20) DEFAULT NULL,
  `household_id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_anonymous` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `reported_as_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident_evidences`
--

CREATE TABLE `incident_evidences` (
  `id` bigint(20) DEFAULT NULL,
  `incident_id` bigint(20) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `uploaded_by` bigint(20) DEFAULT NULL,
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
  `id` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `notifiable_type` varchar(255) DEFAULT NULL,
  `notifiable_id` bigint(20) DEFAULT NULL,
  `data` text DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `channel` varchar(255) DEFAULT NULL,
  `enabled` int(11) DEFAULT NULL,
  `settings` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `officials`
--

CREATE TABLE `officials` (
  `id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `position_id` bigint(20) DEFAULT NULL,
  `committee_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `term_start` date DEFAULT NULL,
  `term_end` date DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `order` int(11) NOT NULL,
  `responsibilities` text DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `is_regular` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `payer_type` varchar(255) NOT NULL,
  `payer_id` bigint(20) DEFAULT NULL,
  `payer_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `household_number` varchar(255) DEFAULT NULL,
  `purok` varchar(255) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `period_covered` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `surcharge` decimal(10,2) NOT NULL,
  `penalty` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL,
  `discount_code` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `purpose` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_cleared` int(11) DEFAULT NULL,
  `clearance_code` varchar(255) DEFAULT NULL,
  `certificate_type` varchar(255) DEFAULT NULL,
  `validity_date` date DEFAULT NULL,
  `collection_type` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `method_details` text DEFAULT NULL,
  `recorded_by` bigint(20) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_discounts`
--

CREATE TABLE `payment_discounts` (
  `id` bigint(20) DEFAULT NULL,
  `payment_id` bigint(20) DEFAULT NULL,
  `discount_rule_id` bigint(20) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `verified_by` bigint(20) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `id_presented` int(11) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `payment_id` bigint(20) DEFAULT NULL,
  `fee_id` bigint(20) DEFAULT NULL,
  `discount_type_id` bigint(20) DEFAULT NULL,
  `original_fee_id` bigint(20) DEFAULT NULL,
  `fee_name` varchar(255) DEFAULT NULL,
  `fee_code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `base_amount` decimal(10,2) NOT NULL,
  `surcharge` decimal(10,2) NOT NULL,
  `penalty` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `discount_breakdown` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `period_covered` varchar(255) DEFAULT NULL,
  `months_late` int(11) DEFAULT NULL,
  `fee_metadata` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `clearance_request_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_default` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL,
  `guard_name` varchar(255) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` bigint(20) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `role_id` bigint(20) DEFAULT NULL,
  `requires_account` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `committee_id` bigint(20) DEFAULT NULL,
  `additional_committees` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `privileges`
--

CREATE TABLE `privileges` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` int(11) NOT NULL,
  `discount_type_id` bigint(20) DEFAULT NULL,
  `default_discount_percentage` decimal(10,2) NOT NULL,
  `requires_id_number` int(11) NOT NULL,
  `requires_verification` int(11) NOT NULL,
  `validity_years` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `puroks`
--

CREATE TABLE `puroks` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `leader_name` varchar(255) DEFAULT NULL,
  `leader_contact` varchar(255) DEFAULT NULL,
  `total_households` int(11) DEFAULT NULL,
  `total_residents` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `google_maps_url` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,2) DEFAULT NULL,
  `longitude` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` bigint(20) DEFAULT NULL,
  `receipt_number` varchar(255) DEFAULT NULL,
  `receiptable_id` bigint(20) DEFAULT NULL,
  `receiptable_type` varchar(255) DEFAULT NULL,
  `payment_id` bigint(20) DEFAULT NULL,
  `or_number` varchar(255) DEFAULT NULL,
  `receipt_type` varchar(255) NOT NULL,
  `payer_name` varchar(255) DEFAULT NULL,
  `payer_address` varchar(255) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `surcharge` decimal(10,2) NOT NULL,
  `penalty` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `change_due` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `issued_date` timestamp NULL DEFAULT NULL,
  `issued_by` bigint(20) DEFAULT NULL,
  `fee_breakdown` text DEFAULT NULL,
  `discount_breakdown` text DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `is_voided` int(11) NOT NULL,
  `void_reason` text DEFAULT NULL,
  `voided_by` bigint(20) DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `printed_count` int(11) NOT NULL,
  `last_printed_at` timestamp NULL DEFAULT NULL,
  `email_sent` int(11) NOT NULL,
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `sms_sent` int(11) NOT NULL,
  `sms_sent_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_evidences`
--

CREATE TABLE `report_evidences` (
  `id` bigint(20) DEFAULT NULL,
  `report_id` bigint(20) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `uploaded_by` bigint(20) DEFAULT NULL,
  `is_verified` int(11) DEFAULT NULL,
  `verified_by` bigint(20) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `priority_level` int(11) DEFAULT NULL,
  `resolution_days` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `requires_immediate_action` int(11) DEFAULT NULL,
  `requires_evidence` int(11) DEFAULT NULL,
  `allows_anonymous` int(11) DEFAULT NULL,
  `required_fields` text DEFAULT NULL,
  `resolution_steps` text DEFAULT NULL,
  `assigned_to_roles` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `resident_id` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `suffix` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(255) NOT NULL,
  `civil_status` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `purok_id` bigint(20) DEFAULT NULL,
  `household_id` bigint(20) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `employment_status` varchar(255) DEFAULT NULL,
  `educational_attainment` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `is_voter` int(11) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resident_documents`
--

CREATE TABLE `resident_documents` (
  `id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `document_category_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `file_size_human` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `is_public` int(11) DEFAULT NULL,
  `requires_password` int(11) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `view_count` int(11) DEFAULT NULL,
  `download_count` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `document_type_id` bigint(20) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `security_options` text DEFAULT NULL,
  `uploaded_by` bigint(20) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resident_privileges`
--

CREATE TABLE `resident_privileges` (
  `id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `privilege_id` bigint(20) DEFAULT NULL,
  `id_number` varchar(255) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `discount_percentage` decimal(10,2) NOT NULL,
  `discount_type_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resident_profiles`
--

CREATE TABLE `resident_profiles` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system_role` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` bigint(20) DEFAULT NULL,
  `role_id` bigint(20) DEFAULT NULL,
  `permission_id` bigint(20) DEFAULT NULL,
  `granted_by` bigint(20) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `percentage` decimal(10,2) NOT NULL,
  `is_active` int(11) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `fee_id` bigint(20) DEFAULT NULL,
  `requested_by` bigint(20) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `approved_by` bigint(20) DEFAULT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `ticket_number` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `priority` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
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
  `id` bigint(20) DEFAULT NULL,
  `ticket_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `is_staff` int(11) DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `position` bigint(20) DEFAULT NULL,
  `require_password_change` int(11) DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `login_qr_code` varchar(255) DEFAULT NULL,
  `login_qr_code_generated_at` timestamp NULL DEFAULT NULL,
  `login_qr_code_expires_at` timestamp NULL DEFAULT NULL,
  `login_qr_code_used_count` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `qr_code_url` varchar(255) DEFAULT NULL,
  `qr_code_generated_at` timestamp NULL DEFAULT NULL,
  `qr_code_download_count` int(11) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_used_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `two_factor_enabled_at` timestamp NULL DEFAULT NULL,
  `two_factor_last_used_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(255) DEFAULT NULL,
  `login_count` int(11) DEFAULT NULL,
  `current_login_ip` varchar(255) DEFAULT NULL,
  `last_logout_at` timestamp NULL DEFAULT NULL,
  `last_login_device` varchar(255) DEFAULT NULL,
  `last_login_browser` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT NULL,
  `last_failed_login_at` timestamp NULL DEFAULT NULL,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `household_id` bigint(20) DEFAULT NULL,
  `current_resident_id` bigint(20) DEFAULT NULL,
  `notification_preferences` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_login_logs`
--

CREATE TABLE `user_login_logs` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `platform` varchar(255) DEFAULT NULL,
  `login_at` timestamp NULL DEFAULT NULL,
  `logout_at` timestamp NULL DEFAULT NULL,
  `is_successful` int(11) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `permission_id` bigint(20) DEFAULT NULL,
  `is_granted` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

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
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

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
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
