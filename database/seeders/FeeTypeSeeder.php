<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FeeTypeSeeder extends Seeder
{
    public function run()
    {
        DB::table('fee_types')->insert([
            [
                'code' => 'BRGY_CLEARANCE',
                'name' => 'Barangay Clearance',
                'short_name' => 'Clearance',
                'category' => 'clearance',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'description' => 'Issued for employment, police, or legal purposes',

                'has_senior_discount' => true,
                'senior_discount_percentage' => 20,
                'has_pwd_discount' => true,
                'pwd_discount_percentage' => 20,
                'has_solo_parent_discount' => true,
                'solo_parent_discount_percentage' => 10,
                'has_indigent_discount' => true,
                'indigent_discount_percentage' => 100,

                'has_surcharge' => false,
                'has_penalty' => false,

                'frequency' => 'as_needed',
                'validity_days' => 180,

                'applicable_to' => 'all_residents',
                'requirements' => json_encode(['Valid ID', 'Cedula']),

                'effective_date' => Carbon::now(),
                'is_active' => true,
                'is_mandatory' => false,
                'auto_generate' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'code' => 'BRGY_CERT_INDIGENT',
                'name' => 'Certificate of Indigency',
                'short_name' => 'Indigency',
                'category' => 'certificate',
                'base_amount' => 0.00,
                'amount_type' => 'fixed',
                'description' => 'Issued to residents classified as indigent',

                'has_indigent_discount' => true,
                'indigent_discount_percentage' => 100,

                'frequency' => 'as_needed',
                'validity_days' => 90,

                'applicable_to' => 'all_residents',
                'requirements' => json_encode(['Barangay Interview', 'Proof of Residency']),

                'effective_date' => Carbon::now(),
                'is_active' => true,
                'is_mandatory' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'code' => 'BRGY_ID',
                'name' => 'Barangay Identification Card',
                'short_name' => 'Barangay ID',
                'category' => 'service',
                'base_amount' => 100.00,
                'amount_type' => 'fixed',
                'description' => 'Official barangay-issued identification card',

                'has_senior_discount' => true,
                'senior_discount_percentage' => 20,
                'has_pwd_discount' => true,
                'pwd_discount_percentage' => 20,

                'frequency' => 'annual',
                'validity_days' => 365,

                'applicable_to' => 'all_residents',
                'requirements' => json_encode(['2x2 Photo', 'Valid ID']),

                'effective_date' => Carbon::now(),
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'code' => 'BRGY_HALL_RENTAL',
                'name' => 'Barangay Hall Rental',
                'short_name' => 'Hall Rental',
                'category' => 'rental',
                'base_amount' => 1000.00,
                'amount_type' => 'per_unit',
                'unit' => 'day',
                'description' => 'Rental fee for barangay hall usage',

                'has_senior_discount' => false,
                'has_pwd_discount' => false,

                'has_surcharge' => true,
                'surcharge_percentage' => 10,

                'frequency' => 'as_needed',
                'validity_days' => 1,

                'applicable_to' => 'all_residents',
                'requirements' => json_encode(['Reservation Form', 'Valid ID']),

                'effective_date' => Carbon::now(),
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'code' => 'CEDULA',
                'name' => 'Community Tax Certificate (Cedula)',
                'short_name' => 'Cedula',
                'category' => 'tax',
                'base_amount' => 5.00,
                'amount_type' => 'computed',
                'description' => 'Basic community tax certificate',

                'computation_formula' => json_encode([
                    'base' => 5,
                    'additional' => 'based_on_income'
                ]),

                'frequency' => 'annual',
                'validity_days' => 365,

                'applicable_to' => 'all_residents',
                'requirements' => json_encode(['Valid ID']),

                'effective_date' => Carbon::now(),
                'is_active' => true,
                'is_mandatory' => true,
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
