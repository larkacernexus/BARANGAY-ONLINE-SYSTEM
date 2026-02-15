<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ClearanceTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $clearanceTypes = [
            // =========== BARANGAY CLEARANCES ===========
            [
                'name' => 'Barangay Clearance',
                'code' => 'BRGY_CLEARANCE',
                'description' => 'General barangay clearance for various purposes such as employment, travel, school requirements, and government transactions',
                'fee' => 100.00,
                'is_discountable' => true,
                'processing_days' => 1,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid Government ID',
                    'Proof of Residency (Barangay Certificate)',
                    '1x1 or 2x2 ID Picture'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Employment',
                    'Travel',
                    'School Requirement',
                    'Government Transaction',
                    'Loan Application',
                    'Business Requirement',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Barangay Clearance (Senior Citizen)',
                'code' => 'BRGY_CLEARANCE_SENIOR',
                'description' => 'Barangay clearance for senior citizens with special provisions',
                'fee' => 50.00,
                'is_discountable' => false, // Already discounted
                'processing_days' => 1,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Senior Citizen ID',
                    'Proof of Residency'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_senior', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Employment',
                    'Travel',
                    'Government Transaction',
                    'Loan Application',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Barangay Clearance (Student)',
                'code' => 'BRGY_CLEARANCE_STUDENT',
                'description' => 'Barangay clearance for students requiring school requirements',
                'fee' => 50.00,
                'is_discountable' => false,
                'processing_days' => 1,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'School ID',
                    'Proof of Enrollment',
                    'Proof of Residency'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_student', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Enrollment',
                    'Scholarship Application',
                    'School Requirement',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== BUSINESS CLEARANCES ===========
            [
                'name' => 'Business Clearance',
                'code' => 'BUSINESS_CLEARANCE',
                'description' => 'Clearance for business registration and permit applications',
                'fee' => 300.00,
                'is_discountable' => false,
                'processing_days' => 3,
                'validity_days' => 365,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'DTI/SEC Registration',
                    'Barangay Clearance',
                    'Community Tax Certificate',
                    'Valid ID of Owner'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'New Business Registration',
                    'Business Renewal',
                    'Change of Business Name',
                    'Change of Ownership',
                    'Additional Branch'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Business Clearance (Micro Business)',
                'code' => 'BUSINESS_CLEARANCE_MICRO',
                'description' => 'Clearance for micro and small businesses with reduced fees',
                'fee' => 150.00,
                'is_discountable' => false,
                'processing_days' => 2,
                'validity_days' => 365,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'DTI Registration',
                    'Barangay Clearance',
                    'Valid ID of Owner',
                    'Proof of Business Address'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'business_type', 'operator' => 'equals', 'value' => 'micro']
                ]),
                'purpose_options' => json_encode([
                    'New Business Registration',
                    'Business Renewal',
                    'Sari-sari Store',
                    'Food Cart',
                    'Home-based Business'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== POLICE & NBI ENDORSEMENTS ===========
            [
                'name' => 'Police Clearance Endorsement',
                'code' => 'POLICE_CLEARANCE',
                'description' => 'Barangay endorsement required for police clearance application',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Proof of Residency',
                    '2x2 ID Picture'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Employment',
                    'Travel Abroad',
                    'Local Employment',
                    'Government Requirement',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'NBI Clearance Endorsement',
                'code' => 'NBI_CLEARANCE',
                'description' => 'Barangay endorsement required for NBI clearance application',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Proof of Residency',
                    '2x2 ID Picture'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Employment',
                    'Travel Abroad',
                    'Local Employment',
                    'Government Requirement',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== CERTIFICATES ===========
            [
                'name' => 'Certificate of Indigency',
                'code' => 'INDIGENCY_CERT',
                'description' => 'Certificate proving indigent status for government assistance, medical assistance, and other social services',
                'fee' => 0.00,
                'is_discountable' => false,
                'processing_days' => 3,
                'validity_days' => 90,
                'is_active' => true,
                'requires_payment' => false,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Proof of Income (if any)',
                    'Barangay ID',
                    'Certificate of Residency'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_indigent', 'operator' => 'equals', 'value' => true],
                    ['field' => 'monthly_income', 'operator' => 'less_than', 'value' => 9000]
                ]),
                'purpose_options' => json_encode([
                    'Medical Assistance',
                    'Financial Aid',
                    'Scholarship',
                    'Government Program',
                    'Legal Assistance',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Certificate of Residency',
                'code' => 'RESIDENCY_CERT',
                'description' => 'Official proof of residency within the barangay',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 1,
                'validity_days' => 90,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Proof of Billing (if available)',
                    'Voter\'s Certification (optional)'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'residency_years', 'operator' => 'greater_than', 'value' => 0]
                ]),
                'purpose_options' => json_encode([
                    'Employment',
                    'School Enrollment',
                    'Government Transaction',
                    'Bank Account Opening',
                    'Voter Registration',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Certificate of Good Moral Character',
                'code' => 'GOOD_MORAL_CERT',
                'description' => 'Certificate attesting to the good moral character of a resident',
                'fee' => 100.00,
                'is_discountable' => true,
                'processing_days' => 3,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Barangay Clearance',
                    'Character References (2 persons)'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 16],
                    ['field' => 'has_criminal_record', 'operator' => 'equals', 'value' => false]
                ]),
                'purpose_options' => json_encode([
                    'Employment',
                    'School Admission',
                    'Scholarship',
                    'Immigration',
                    'Professional License',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Certificate of No Income',
                'code' => 'NO_INCOME_CERT',
                'description' => 'Certificate stating that the resident has no source of income',
                'fee' => 30.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 90,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Affidavit of No Income',
                    'Certificate of Residency'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'has_income', 'operator' => 'equals', 'value' => false],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Government Assistance',
                    'Scholarship',
                    'Medical Assistance',
                    'Legal Aid',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Certificate of First Time Job Seeker',
                'code' => 'FTJ_CERT',
                'description' => 'Certificate under RA 11261 for first-time job seekers exempting from government fees',
                'fee' => 0.00,
                'is_discountable' => false,
                'processing_days' => 2,
                'validity_days' => 365,
                'is_active' => true,
                'requires_payment' => false,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Barangay Clearance',
                    'Proof of Residency'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18],
                    ['field' => 'is_first_time_job_seeker', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Government Employment',
                    'Private Employment',
                    'Local Employment',
                    'Overseas Employment',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== TRAVEL CLEARANCES ===========
            [
                'name' => 'Travel Clearance for Minors',
                'code' => 'TRAVEL_CLEARANCE_MINOR',
                'description' => 'Travel clearance for minors traveling without parents',
                'fee' => 150.00,
                'is_discountable' => false,
                'processing_days' => 2,
                'validity_days' => 60,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Birth Certificate (PSA)',
                    'Parent\'s Consent',
                    'Valid ID of Parent/Guardian',
                    'School ID (if applicable)'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'less_than', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Domestic Travel',
                    'International Travel',
                    'School Field Trip',
                    'Vacation with Relative',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Travel Clearance for OFW',
                'code' => 'TRAVEL_CLEARANCE_OFW',
                'description' => 'Travel clearance for Overseas Filipino Workers',
                'fee' => 100.00,
                'is_discountable' => false,
                'processing_days' => 2,
                'validity_days' => 60,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid Passport',
                    'POEA Clearance',
                    'OEC/OWWA Certificate',
                    'Employment Contract'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_ofw', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'First Time OFW',
                    'Returning OFW',
                    'Balik Manggagawa',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== EMPLOYMENT CLEARANCES ===========
            [
                'name' => 'Employment Clearance',
                'code' => 'EMPLOYMENT_CLEARANCE',
                'description' => 'Clearance for employment purposes',
                'fee' => 100.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Barangay Clearance',
                    'Resume/Application Form'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Local Employment',
                    'Government Employment',
                    'Private Company',
                    'BPO Industry',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Employment Clearance for Domestic Helper',
                'code' => 'EMPLOYMENT_CLEARANCE_DH',
                'description' => 'Clearance for domestic helpers and household workers',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Barangay Clearance',
                    'Employment Contract'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18],
                    ['field' => 'occupation', 'operator' => 'contains', 'value' => 'domestic']
                ]),
                'purpose_options' => json_encode([
                    'Local Employment',
                    'Household Work',
                    'Caregiver',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== SCHOLARSHIP CLEARANCES ===========
            [
                'name' => 'Scholarship Clearance',
                'code' => 'SCHOLARSHIP_CLEARANCE',
                'description' => 'Clearance for scholarship applications',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'School ID',
                    'Grades/Report Card',
                    'Barangay Clearance'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_student', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'less_than', 'value' => 25]
                ]),
                'purpose_options' => json_encode([
                    'Academic Scholarship',
                    'Athletic Scholarship',
                    'Government Scholarship',
                    'Private Scholarship',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Scholarship Clearance for College',
                'code' => 'SCHOLARSHIP_CLEARANCE_COLLEGE',
                'description' => 'Clearance for college scholarship applications',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'School ID',
                    'Certificate of Enrollment',
                    'Grades from Last Semester',
                    'Barangay Clearance'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_college_student', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'less_than', 'value' => 30]
                ]),
                'purpose_options' => json_encode([
                    'CHED Scholarship',
                    'DOST Scholarship',
                    'Private College Scholarship',
                    'Local Government Scholarship',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== SPECIAL CLEARANCES ===========
            [
                'name' => 'Zoning Clearance',
                'code' => 'ZONING_CLEARANCE',
                'description' => 'Clearance for land use and building construction',
                'fee' => 200.00,
                'is_discountable' => false,
                'processing_days' => 5,
                'validity_days' => 180,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Land Title',
                    'Tax Declaration',
                    'Building Plans',
                    'Location Map'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_property_owner', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Residential Construction',
                    'Commercial Construction',
                    'Renovation',
                    'Land Development',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Fencing Clearance',
                'code' => 'FENCING_CLEARANCE',
                'description' => 'Clearance for property fencing and boundary walls',
                'fee' => 150.00,
                'is_discountable' => false,
                'processing_days' => 3,
                'validity_days' => 90,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Land Title',
                    'Tax Declaration',
                    'Fencing Plan',
                    'Neighbor\'s Consent'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_property_owner', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Perimeter Fence',
                    'Property Boundary',
                    'Security Fence',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Cattle/Carabao Clearance',
                'code' => 'CATTLE_CLEARANCE',
                'description' => 'Clearance for livestock transport and trading',
                'fee' => 100.00,
                'is_discountable' => false,
                'processing_days' => 2,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Veterinary Health Certificate',
                    'Proof of Ownership',
                    'Barangay Clearance'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'has_livestock', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Transport',
                    'Trading',
                    'Slaughter',
                    'Veterinary Treatment',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Solo Parent Clearance',
                'code' => 'SOLO_PARENT_CLEARANCE',
                'description' => 'Special clearance for solo parents',
                'fee' => 30.00,
                'is_discountable' => false, // Already discounted
                'processing_days' => 1,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Solo Parent ID',
                    'Birth Certificates of Children',
                    'Barangay Clearance'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_solo_parent', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Government Assistance',
                    'Employment',
                    'School Requirement',
                    'Medical Assistance',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'PWD Clearance',
                'code' => 'PWD_CLEARANCE',
                'description' => 'Special clearance for Persons with Disability',
                'fee' => 30.00,
                'is_discountable' => false, // Already discounted
                'processing_days' => 1,
                'validity_days' => 30,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'PWD ID',
                    'Medical Certificate',
                    'Barangay Clearance'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_pwd', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Government Assistance',
                    'Employment',
                    'Medical Assistance',
                    'Educational Assistance',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // =========== CEDULA ===========
            [
                'name' => 'Community Tax Certificate (Cedula)',
                'code' => 'CEDULA',
                'description' => 'Community Tax Certificate for residents',
                'fee' => 50.00,
                'is_discountable' => true,
                'processing_days' => 1,
                'validity_days' => 365,
                'is_active' => true,
                'requires_payment' => true,
                'requires_approval' => false,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Valid ID',
                    'Proof of Income (if applicable)'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18]
                ]),
                'purpose_options' => json_encode([
                    'Government Transaction',
                    'Employment',
                    'Business Registration',
                    'Voter Registration',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Community Tax Certificate (Cedula) - Senior/PWD',
                'code' => 'CEDULA_EXEMPT',
                'description' => 'Community Tax Certificate exempted for Senior Citizens and PWDs',
                'fee' => 0.00,
                'is_discountable' => false,
                'processing_days' => 1,
                'validity_days' => 365,
                'is_active' => true,
                'requires_payment' => false,
                'requires_approval' => true,
                'is_online_only' => false,
                'requirements' => json_encode([
                    'Senior Citizen ID or PWD ID',
                    'Valid ID'
                ]),
                'eligibility_criteria' => json_encode([
                    ['field' => 'is_resident', 'operator' => 'equals', 'value' => true],
                    ['field' => 'is_senior', 'operator' => 'equals', 'value' => true]
                ]),
                'purpose_options' => json_encode([
                    'Government Transaction',
                    'Employment',
                    'Other'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        // Insert clearance types
        try {
            // Clear existing records if needed (be careful!)
            // DB::table('clearance_types')->truncate();

            DB::table('clearance_types')->insert($clearanceTypes);
            $this->command->info('Clearance types seeded successfully!');
        } catch (\Exception $e) {
            $this->command->error('Error seeding clearance types: ' . $e->getMessage());
        }
    }
}