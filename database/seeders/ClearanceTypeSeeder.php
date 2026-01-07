<?php

namespace Database\Seeders;

use App\Models\ClearanceType;
use Illuminate\Database\Seeder;

class ClearanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach (ClearanceType::COMMON_TYPES as $typeData) {
            // Add default requirements based on type
            switch ($typeData['code']) {
                case 'BRGY_CLEARANCE':
                    $requirements = [
                        'Valid ID (Any Government Issued)',
                        'Proof of Residency (Barangay ID, Utility Bill)',
                        '2x2 ID Picture (White Background)',
                        'Fully accomplished application form',
                    ];
                    $eligibility = [
                        ['field' => 'age', 'operator' => 'greater_than_or_equal', 'value' => 18],
                        ['field' => 'years_of_residency', 'operator' => 'greater_than_or_equal', 'value' => 6],
                    ];
                    $purposeOptions = 'Employment, Business, Travel, School, Government Transaction, Loan, Other';
                    break;

                case 'BUSINESS_CLEARANCE':
                    $requirements = [
                        'DTI/SEC Registration',
                        'Business Permit from Mayor\'s Office',
                        'Valid ID of Business Owner',
                        'Proof of Business Address',
                        'Barangay Business Permit Application Form',
                        '2x2 ID Picture of Owner',
                    ];
                    $eligibility = [
                        ['field' => 'business_permit_status', 'operator' => 'equals', 'value' => 'active'],
                    ];
                    $purposeOptions = 'Business Registration, Permit Renewal, Business Expansion, Other';
                    break;

                case 'INDIGENCY_CERT':
                    $requirements = [
                        'Valid ID',
                        'Proof of Income (if employed)',
                        'Certificate of No Income (if unemployed)',
                        'Family Picture (for verification)',
                        'Interview with Social Worker',
                    ];
                    $eligibility = [
                        ['field' => 'monthly_income', 'operator' => 'less_than', 'value' => 15000],
                        ['field' => 'has_pending_cases', 'operator' => 'equals', 'value' => false],
                    ];
                    $purposeOptions = 'Scholarship, Medical Assistance, Burial Assistance, Educational Assistance, Other';
                    break;

                case 'RESIDENCY_CERT':
                    $requirements = [
                        'Valid ID',
                        'Proof of Residency (at least 6 months)',
                        'Utility Bills (Electricity, Water)',
                        'Lease Contract (if renting)',
                        '2x2 ID Picture',
                    ];
                    $eligibility = [
                        ['field' => 'months_of_residency', 'operator' => 'greater_than_or_equal', 'value' => 6],
                    ];
                    $purposeOptions = 'School, Employment, Government ID Application, Banking, Other';
                    break;

                default:
                    $requirements = [
                        'Valid ID (Any Government Issued)',
                        'Proof of Residency',
                        'Recent 2x2 ID Picture',
                        'Fully accomplished application form',
                    ];
                    $eligibility = [];
                    $purposeOptions = 'Employment, Travel, School, Government Transaction, Other';
            }

            ClearanceType::create(array_merge($typeData, [
                'requirements' => $requirements,
                'eligibility_criteria' => $eligibility,
                'purpose_options' => $purposeOptions,
                'requires_approval' => true,
                'is_online_only' => false,
            ]));
        }

        // Create a free online-only clearance for testing
        ClearanceType::create([
            'name' => 'Online Resident Verification',
            'code' => 'ONLINE_VERIFICATION',
            'description' => 'Online verification of residency for digital purposes',
            'fee' => 0.00,
            'processing_days' => 1,
            'validity_days' => 7,
            'is_active' => true,
            'requires_payment' => false,
            'requires_approval' => false,
            'is_online_only' => true,
            'requirements' => ['Valid Email Address', 'Mobile Number for OTP'],
            'eligibility_criteria' => [],
            'purpose_options' => 'Online Registration, Digital Verification, Account Creation',
        ]);
    }
}