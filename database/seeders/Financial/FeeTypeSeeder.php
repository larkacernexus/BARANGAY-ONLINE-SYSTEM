<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding fee types...');
        
        $feeTypes = [
            [
                'code' => 'FEE-CLEAR',
                'name' => 'Barangay Clearance Fee',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'all',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 1,
                'senior_discount_percentage' => 20.00,
                'has_pwd_discount' => 1,
                'pwd_discount_percentage' => 20.00,
                'frequency' => 'one_time',
            ],
            [
                'code' => 'FEE-CERT',
                'name' => 'Certificate Fee',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'all',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 1,
                'senior_discount_percentage' => 20.00,
                'has_pwd_discount' => 1,
                'pwd_discount_percentage' => 20.00,
                'frequency' => 'one_time',
            ],
            [
                'code' => 'FEE-BIZ',
                'name' => 'Business Clearance Fee',
                'base_amount' => 200.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'businesses',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 1,
                'senior_discount_percentage' => 20.00,
                'has_pwd_discount' => 1,
                'pwd_discount_percentage' => 20.00,
                'frequency' => 'one_time',
            ],
            [
                'code' => 'FEE-STALL',
                'name' => 'Market Stall Rental',
                'base_amount' => 500.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'businesses',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 0,
                'senior_discount_percentage' => 0.00,
                'has_pwd_discount' => 0,
                'pwd_discount_percentage' => 0.00,
                'frequency' => 'monthly',
            ],
        ];
        
        foreach ($feeTypes as $feeType) {
            DB::table('fee_types')->updateOrInsert(
                ['code' => $feeType['code']],
                array_merge($feeType, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($feeTypes) . ' fee types');
    }
}