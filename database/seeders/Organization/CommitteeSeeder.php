<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommitteeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding committees...');
        
        $committees = [
            ['code' => 'COM-PEACE', 'name' => 'Peace and Order Committee', 'description' => 'Maintains peace and order in the barangay', 'order' => 1],
            ['code' => 'COM-EDU', 'name' => 'Education Committee', 'description' => 'Oversees educational programs', 'order' => 2],
            ['code' => 'COM-HEALTH', 'name' => 'Health Committee', 'description' => 'Manages health programs and services', 'order' => 3],
            ['code' => 'COM-INFRA', 'name' => 'Infrastructure Committee', 'description' => 'Handles infrastructure projects', 'order' => 4],
            ['code' => 'COM-AGRIC', 'name' => 'Agriculture Committee', 'description' => 'Supports agricultural activities', 'order' => 5],
            ['code' => 'COM-YOUTH', 'name' => 'Youth and Sports Committee', 'description' => 'Organizes youth and sports activities', 'order' => 6],
            ['code' => 'COM-WOMEN', 'name' => 'Women and Family Committee', 'description' => 'Supports women and family welfare', 'order' => 7],
        ];
        
        foreach ($committees as $committee) {
            DB::table('committees')->updateOrInsert(
                ['code' => $committee['code']],
                array_merge($committee, [
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($committees) . ' committees');
    }
}