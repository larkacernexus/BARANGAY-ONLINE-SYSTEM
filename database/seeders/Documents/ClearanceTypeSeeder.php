<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClearanceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding clearance types...');
        
        $clearanceTypes = [
            ['name' => 'Barangay Clearance', 'code' => 'BC-001', 'description' => 'Standard barangay clearance for various purposes', 'fee' => 50.00, 'processing_days' => 1, 'validity_days' => 365, 'requires_payment' => 1, 'requires_approval' => 1],
            ['name' => 'Certificate of Residency', 'code' => 'COR-001', 'description' => 'Proof of residency in the barangay', 'fee' => 50.00, 'processing_days' => 1, 'validity_days' => 180, 'requires_payment' => 1, 'requires_approval' => 0],
            ['name' => 'Certificate of Indigency', 'code' => 'COI-001', 'description' => 'For indigent residents seeking assistance', 'fee' => 0.00, 'processing_days' => 1, 'validity_days' => 90, 'requires_payment' => 0, 'requires_approval' => 1],
            ['name' => 'Business Clearance', 'code' => 'BIZ-001', 'description' => 'Clearance for business operations', 'fee' => 200.00, 'processing_days' => 3, 'validity_days' => 365, 'requires_payment' => 1, 'requires_approval' => 1],
        ];
        
        foreach ($clearanceTypes as $type) {
            DB::table('clearance_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'is_active' => 1,
                    'is_online_only' => 0,
                    'is_discountable' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($clearanceTypes) . ' clearance types');
    }
}