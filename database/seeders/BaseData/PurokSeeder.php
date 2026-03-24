<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurokSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding puroks...');
        
        $puroks = [
            ['name' => 'Purok 1', 'slug' => 'purok-1', 'description' => 'Residential area near the barangay hall', 'leader_name' => 'Juan Dela Cruz', 'leader_contact' => '09171234567', 'status' => 'active'],
            ['name' => 'Purok 2', 'slug' => 'purok-2', 'description' => 'Agricultural zone with rice fields', 'leader_name' => 'Maria Santos', 'leader_contact' => '09172345678', 'status' => 'active'],
            ['name' => 'Purok 3', 'slug' => 'purok-3', 'description' => 'Commercial area with small businesses', 'leader_name' => 'Jose Rizal', 'leader_contact' => '09173456789', 'status' => 'active'],
            ['name' => 'Purok 4', 'slug' => 'purok-4', 'description' => 'New subdivision development', 'leader_name' => 'Emilio Aguinaldo', 'leader_contact' => '09174567890', 'status' => 'active'],
            ['name' => 'Purok 5', 'slug' => 'purok-5', 'description' => 'Riverside community', 'leader_name' => 'Andres Bonifacio', 'leader_contact' => '09175678901', 'status' => 'active'],
            ['name' => 'Purok 6', 'slug' => 'purok-6', 'description' => 'Upland area', 'leader_name' => 'Gabriela Silang', 'leader_contact' => '09176789012', 'status' => 'active'],
            ['name' => 'Purok 7', 'slug' => 'purok-7', 'description' => 'Mixed residential and commercial', 'leader_name' => 'Josefa Llanes Escoda', 'leader_contact' => '09177890123', 'status' => 'active'],
            ['name' => 'Purok 8', 'slug' => 'purok-8', 'description' => 'Coastal barangay area', 'leader_name' => 'Melchora Aquino', 'leader_contact' => '09178901234', 'status' => 'active'],
        ];

        foreach ($puroks as $purok) {
            DB::table('puroks')->updateOrInsert(
                ['slug' => $purok['slug']],
                array_merge($purok, [
                    'total_households' => 0,
                    'total_residents' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($puroks) . ' puroks');
    }
}