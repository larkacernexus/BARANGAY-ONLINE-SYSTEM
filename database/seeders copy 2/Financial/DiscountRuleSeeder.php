<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiscountRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding discount rules...');
        
        $discountRules = [
            ['code' => 'SR-001', 'name' => 'Senior Citizen Discount Rule', 'discount_type' => 'SENIOR', 'value_type' => 'percentage', 'discount_value' => 20.00, 'priority' => 1, 'requires_verification' => 1],
            ['code' => 'PWD-001', 'name' => 'PWD Discount Rule', 'discount_type' => 'PWD', 'value_type' => 'percentage', 'discount_value' => 20.00, 'priority' => 1, 'requires_verification' => 1],
            ['code' => 'SOLO-001', 'name' => 'Solo Parent Discount Rule', 'discount_type' => 'SOLO_PARENT', 'value_type' => 'percentage', 'discount_value' => 10.00, 'priority' => 2, 'requires_verification' => 1],
        ];
        
        foreach ($discountRules as $rule) {
            DB::table('discount_rules')->updateOrInsert(
                ['code' => $rule['code']],
                array_merge($rule, [
                    'applicable_to' => 'resident',
                    'stackable' => 0,
                    'is_active' => 1,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($discountRules) . ' discount rules');
    }
}