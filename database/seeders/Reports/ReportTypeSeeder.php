<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding report types...');
        
        $reportTypes = [
            ['name' => 'Noise Complaint', 'code' => 'REP-NOISE', 'category' => 'Complaint', 'subcategory' => 'Noise', 'priority_level' => 3, 'resolution_days' => 3, 'requires_immediate_action' => 0],
            ['name' => 'Waste Management Issue', 'code' => 'REP-WASTE', 'category' => 'Environmental', 'subcategory' => 'Waste', 'priority_level' => 4, 'resolution_days' => 2, 'requires_immediate_action' => 1],
            ['name' => 'Street Light Outage', 'code' => 'REP-LIGHT', 'category' => 'Infrastructure', 'subcategory' => 'Utilities', 'priority_level' => 2, 'resolution_days' => 5, 'requires_immediate_action' => 0],
            ['name' => 'Road Damage', 'code' => 'REP-ROAD', 'category' => 'Infrastructure', 'subcategory' => 'Roads', 'priority_level' => 3, 'resolution_days' => 7, 'requires_immediate_action' => 0],
            ['name' => 'Security Concern', 'code' => 'REP-SECURITY', 'category' => 'Security', 'subcategory' => 'Peace and Order', 'priority_level' => 5, 'resolution_days' => 1, 'requires_immediate_action' => 1],
        ];
        
        foreach ($reportTypes as $type) {
            DB::table('report_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'description' => $type['name'] . ' reporting form',
                    'is_active' => 1,
                    'requires_evidence' => 1,
                    'allows_anonymous' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($reportTypes) . ' report types');
    }
}