<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiscountTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding discount types...');
        
        $discountTypes = [
            ['code' => 'DISC-SENIOR', 'name' => 'Senior Citizen Discount', 'description' => '20% discount for senior citizens', 'default_percentage' => 20.00, 'legal_basis' => 'RA 9994', 'is_mandatory' => 1],
            ['code' => 'DISC-PWD', 'name' => 'PWD Discount', 'description' => '20% discount for persons with disability', 'default_percentage' => 20.00, 'legal_basis' => 'RA 10754', 'is_mandatory' => 1],
            ['code' => 'DISC-SOLO', 'name' => 'Solo Parent Discount', 'description' => '10% discount for solo parents', 'default_percentage' => 10.00, 'legal_basis' => 'RA 8972', 'is_mandatory' => 0],
            ['code' => 'DISC-INDIGENT', 'name' => 'Indigent Discount', 'description' => 'Full discount for indigent residents', 'default_percentage' => 100.00, 'legal_basis' => 'Barangay Ordinance', 'is_mandatory' => 0],
        ];
        
        foreach ($discountTypes as $type) {
            DB::table('discount_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'is_active' => 1,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($discountTypes) . ' discount types');
    }
}