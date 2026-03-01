<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FeeTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // Get existing document categories
        $categories = $this->getExistingDocumentCategories();
        
        $feeTypes = [
            // =========== TAXATION & FEES (ID: 9) ===========
            [
                'code' => 'TAX-RP-001',
                'document_category_id' => $categories['Taxation & Fees'], // ID: 9
                'name' => 'Real Property Tax',
                'short_name' => 'RPT',
                'base_amount' => 500.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_property',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 2.00,
                'surcharge_fixed' => 50.00,
                'has_penalty' => true,
                'penalty_percentage' => 2.00,
                'penalty_fixed' => 25.00,
                'frequency' => 'annual',
                'validity_days' => 365,
                'applicable_to' => 'property_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Tax Declaration", "Latest Receipt"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 31,
                'sort_order' => 1,
                'description' => 'Annual tax on real properties within the barangay',
                'notes' => 'Due every January 31st',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'TAX-BUS-002',
                'document_category_id' => $categories['Taxation & Fees'], // ID: 9
                'name' => 'Business Permit Fee',
                'short_name' => 'BP Fee',
                'base_amount' => 1000.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_business',
                'is_discountable' => false,
                'has_surcharge' => true,
                'surcharge_percentage' => 3.00,
                'surcharge_fixed' => 100.00,
                'has_penalty' => true,
                'penalty_percentage' => 5.00,
                'penalty_fixed' => 200.00,
                'frequency' => 'annual',
                'validity_days' => 365,
                'applicable_to' => 'business_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["DTI/SEC Registration", "Mayor's Permit"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 20,
                'sort_order' => 2,
                'description' => 'Annual business permit fee',
                'notes' => 'Renewable every year',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'TAX-MK-003',
                'document_category_id' => $categories['Taxation & Fees'], // ID: 9
                'name' => 'Market Stall Fee',
                'short_name' => 'Market Fee',
                'base_amount' => 300.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_month',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 2.00,
                'surcharge_fixed' => 20.00,
                'has_penalty' => true,
                'penalty_percentage' => 3.00,
                'penalty_fixed' => 30.00,
                'frequency' => 'monthly',
                'validity_days' => 30,
                'applicable_to' => 'business_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Market Stall Contract"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 5,
                'sort_order' => 3,
                'description' => 'Monthly rental fee for market stall occupants',
                'notes' => 'Due every 5th of the month',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== LICENSES & PERMITS (ID: 10) ===========
            [
                'code' => 'LP-CN-004',
                'document_category_id' => $categories['Licenses & Permits'], // ID: 10
                'name' => 'Construction Permit Fee',
                'short_name' => 'Building Permit',
                'base_amount' => 1500.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_application',
                'is_discountable' => false,
                'has_surcharge' => true,
                'surcharge_percentage' => 5.00,
                'surcharge_fixed' => 200.00,
                'has_penalty' => true,
                'penalty_percentage' => 10.00,
                'penalty_fixed' => 500.00,
                'frequency' => 'one_time',
                'validity_days' => 180,
                'applicable_to' => 'property_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Building Plans", "Barangay Clearance"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 4,
                'description' => 'Fee for construction and renovation permits',
                'notes' => 'Valid for 6 months from issuance',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'LP-SG-005',
                'document_category_id' => $categories['Licenses & Permits'], // ID: 10
                'name' => 'Sidewalk/Special Event Permit',
                'short_name' => 'Event Permit',
                'base_amount' => 500.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_event',
                'is_discountable' => false,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 7,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Event Details", "Barangay Clearance"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 5,
                'description' => 'Fee for special events and sidewalk usage',
                'notes' => 'Apply at least 3 days before event',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== BUSINESS (ID: 6) ===========
            [
                'code' => 'BUS-CL-006',
                'document_category_id' => $categories['Business'], // ID: 6
                'name' => 'Barangay Clearance for Business',
                'short_name' => 'Business Clearance',
                'base_amount' => 200.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_application',
                'is_discountable' => true,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 365,
                'applicable_to' => 'business_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Valid ID", "Business Plan"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 6,
                'description' => 'Clearance for new business registration',
                'notes' => 'Required for Mayor\'s Permit application',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'BUS-RN-007',
                'document_category_id' => $categories['Business'], // ID: 6
                'name' => 'Business Permit Renewal',
                'short_name' => 'Business Renewal',
                'base_amount' => 150.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_renewal',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 2.00,
                'surcharge_fixed' => 50.00,
                'has_penalty' => true,
                'penalty_percentage' => 5.00,
                'penalty_fixed' => 100.00,
                'frequency' => 'annual',
                'validity_days' => 365,
                'applicable_to' => 'business_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Previous Permit", "Updated Business Info"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 20,
                'sort_order' => 7,
                'description' => 'Fee for annual business permit renewal',
                'notes' => 'Due every January 20th',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== CERTIFICATES (ID: 7) ===========
            [
                'code' => 'CC-RS-008',
                'document_category_id' => $categories['Certificates'], // ID: 7
                'name' => 'Community Tax Certificate (Cedula)',
                'short_name' => 'Cedula',
                'base_amount' => 50.00,
                'amount_type' => 'per_unit',
                'computation_formula' => null,
                'unit' => 'per_person',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 2.00,
                'surcharge_fixed' => 10.00,
                'has_penalty' => true,
                'penalty_percentage' => 5.00,
                'penalty_fixed' => 20.00,
                'frequency' => 'annual',
                'validity_days' => 365,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Valid ID", "Proof of Residence"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => false,
                'due_day' => 31,
                'sort_order' => 8,
                'description' => 'Community Tax Certificate for residents',
                'notes' => 'Free for seniors, PWDs, and indigents (applies via discount rules)',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== IDENTIFICATION (ID: 1) ===========
            [
                'code' => 'ID-BC-010',
                'document_category_id' => $categories['Identification'], // ID: 1
                'name' => 'Barangay ID Card',
                'short_name' => 'Barangay ID',
                'base_amount' => 100.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_id',
                'is_discountable' => true,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 1095,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["2x2 Photo", "Proof of Residence"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 10,
                'description' => 'Barangay Identification Card',
                'notes' => 'Valid for 3 years',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== HEALTH (ID: 4) ===========
            [
                'code' => 'HL-HC-011',
                'document_category_id' => $categories['Health'], // ID: 4
                'name' => 'Health Certificate',
                'short_name' => 'Health Cert',
                'base_amount' => 100.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_certificate',
                'is_discountable' => true,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 180,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Medical Exam", "Lab Results"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 11,
                'description' => 'Medical certificate for employment/food handling',
                'notes' => 'Valid for 6 months',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== PROPERTY & REAL ESTATE (ID: 12) ===========
            [
                'code' => 'PR-CL-012',
                'document_category_id' => $categories['Property & Real Estate'], // ID: 12
                'name' => 'Property Transfer Clearance',
                'short_name' => 'Property Transfer',
                'base_amount' => 300.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_transfer',
                'is_discountable' => true,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 30,
                'applicable_to' => 'property_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Deed of Sale", "Tax Declaration"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 12,
                'description' => 'Clearance for property ownership transfer',
                'notes' => 'Required for Registry of Deeds',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== TRANSPORTATION & TRAFFIC (ID: 13) ===========
            [
                'code' => 'TT-TR-013',
                'document_category_id' => $categories['Transportation & Traffic'], // ID: 13
                'name' => 'Tricycle Franchise Fee',
                'short_name' => 'Tricycle Fee',
                'base_amount' => 1200.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_year',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 3.00,
                'surcharge_fixed' => 100.00,
                'has_penalty' => true,
                'penalty_percentage' => 5.00,
                'penalty_fixed' => 200.00,
                'frequency' => 'annual',
                'validity_days' => 365,
                'applicable_to' => 'business_owners',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Driver's License", "OR/CR"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 15,
                'sort_order' => 13,
                'description' => 'Annual franchise fee for tricycle operators',
                'notes' => 'Due every January 15th',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== COMMUNITY SERVICES (ID: 14) ===========
            [
                'code' => 'CS-BC-014',
                'document_category_id' => $categories['Community Services'], // ID: 14
                'name' => 'Barangay Clearance',
                'short_name' => 'Clearance',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_clearance',
                'is_discountable' => true,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 30,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Valid ID", "Purpose Letter"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 14,
                'description' => 'General barangay clearance for various purposes',
                'notes' => 'For employment, travel, etc.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== ENVIRONMENTAL SERVICES (ID: 15) ===========
            [
                'code' => 'ENV-GC-015',
                'document_category_id' => $categories['Environmental Services'], // ID: 15
                'name' => 'Garbage Collection Fee',
                'short_name' => 'Garbage Fee',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_month',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 5.00,
                'surcharge_fixed' => 20.00,
                'has_penalty' => true,
                'penalty_percentage' => 10.00,
                'penalty_fixed' => 50.00,
                'frequency' => 'monthly',
                'validity_days' => 30,
                'applicable_to' => 'households',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode([]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 10,
                'sort_order' => 15,
                'description' => 'Monthly garbage collection and disposal fee',
                'notes' => 'Due every 10th of the month',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== UTILITIES (ID: 16) ===========
            [
                'code' => 'UTIL-SL-016',
                'document_category_id' => $categories['Utilities'], // ID: 16
                'name' => 'Street Lighting Fee',
                'short_name' => 'Lighting Fee',
                'base_amount' => 20.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_month',
                'is_discountable' => true,
                'has_surcharge' => true,
                'surcharge_percentage' => 5.00,
                'surcharge_fixed' => 10.00,
                'has_penalty' => true,
                'penalty_percentage' => 10.00,
                'penalty_fixed' => 20.00,
                'frequency' => 'monthly',
                'validity_days' => 30,
                'applicable_to' => 'households',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode([]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => true,
                'auto_generate' => true,
                'due_day' => 10,
                'sort_order' => 16,
                'description' => 'Monthly contribution for street lighting maintenance',
                'notes' => 'Part of barangay utilities',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // =========== OTHER SERVICES (ID: 17) ===========
            [
                'code' => 'SP-URG-017',
                'document_category_id' => $categories['Other Services'], // ID: 17
                'name' => 'Urgent Processing Fee',
                'short_name' => 'Urgent Fee',
                'base_amount' => 100.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_application',
                'is_discountable' => false,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => null,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode([]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 17,
                'description' => 'Additional fee for urgent processing of documents',
                'notes' => 'Same-day release',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'SP-CERT-018',
                'document_category_id' => $categories['Other Services'], // ID: 17
                'name' => 'Certification Fee (Extra Copy)',
                'short_name' => 'Extra Copy',
                'base_amount' => 25.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_copy',
                'is_discountable' => false,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => null,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode([]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 18,
                'description' => 'Fee for additional certified copies of documents',
                'notes' => 'Per copy charge',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'SP-AUTH-019',
                'document_category_id' => $categories['Other Services'], // ID: 17
                'name' => 'Document Authentication Fee',
                'short_name' => 'Auth Fee',
                'base_amount' => 30.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_document',
                'is_discountable' => false,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => null,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Original Document"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 19,
                'description' => 'Fee for document authentication and notarization',
                'notes' => 'Includes notary fee',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            
            // Additional Certificates (ID: 7)
            [
                'code' => 'CC-IND-020',
                'document_category_id' => $categories['Certificates'], // ID: 7
                'name' => 'Certificate of Indigency',
                'short_name' => 'Indigency Cert',
                'base_amount' => 20.00,
                'amount_type' => 'fixed',
                'computation_formula' => null,
                'unit' => 'per_certificate',
                'is_discountable' => true,
                'has_surcharge' => false,
                'surcharge_percentage' => null,
                'surcharge_fixed' => null,
                'has_penalty' => false,
                'penalty_percentage' => null,
                'penalty_fixed' => null,
                'frequency' => 'one_time',
                'validity_days' => 90,
                'applicable_to' => 'all_residents',
                'applicable_puroks' => json_encode([]),
                'requirements' => json_encode(["Proof of Income", "Household Survey"]),
                'effective_date' => '2026-01-01',
                'expiry_date' => null,
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'due_day' => null,
                'sort_order' => 20,
                'description' => 'Certificate for indigent individuals',
                'notes' => 'Free for qualified individuals (via discount rules)',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        
        // Insert fee types
        try {
            // Optional: Uncomment if you want to clear existing records
            // DB::table('fee_types')->truncate();
            
            DB::table('fee_types')->insert($feeTypes);
            $this->command->info('Fee types seeded successfully!');
            
            // Show summary
            $this->command->info('Total fee types seeded: ' . count($feeTypes));
            
            // Group by category for summary
            $summary = [];
            foreach ($feeTypes as $fee) {
                $categoryName = array_search($fee['document_category_id'], $categories);
                if ($categoryName) {
                    if (!isset($summary[$categoryName])) {
                        $summary[$categoryName] = 0;
                    }
                    $summary[$categoryName]++;
                }
            }
            
            $this->command->info('Summary by category:');
            foreach ($summary as $category => $count) {
                $this->command->info("  - {$category}: {$count} fee types");
            }
            
        } catch (\Exception $e) {
            $this->command->error('Error seeding fee types: ' . $e->getMessage());
        }
    }
    
    /**
     * Get existing document categories from the database
     */
    private function getExistingDocumentCategories(): array
    {
        $categories = [];
        
        // Fetch all existing categories
        $existingCategories = DB::table('document_categories')
            ->select('id', 'name')
            ->get();
        
        foreach ($existingCategories as $category) {
            $categories[$category->name] = $category->id;
        }
        
        // Log missing categories (if any)
        $requiredCategories = [
            'Taxation & Fees',
            'Licenses & Permits', 
            'Business',
            'Certificates',
            'Identification',
            'Health',
            'Property & Real Estate',
            'Transportation & Traffic',
            'Community Services',
            'Environmental Services',
            'Utilities',
            'Other Services'
        ];
        
        $missingCategories = [];
        foreach ($requiredCategories as $required) {
            if (!isset($categories[$required])) {
                $missingCategories[] = $required;
            }
        }
        
        if (!empty($missingCategories)) {
            $this->command->warn('Missing document categories: ' . implode(', ', $missingCategories));
            $this->command->warn('Please ensure all required categories exist before running this seeder.');
        }
        
        return $categories;
    }
}