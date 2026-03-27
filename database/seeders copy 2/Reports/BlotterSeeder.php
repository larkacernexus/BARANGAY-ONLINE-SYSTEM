<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BlotterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding blotters...');
        
        $blotters = [
            [
                'blotter_number' => 'BL-2024-001',
                'incident_type' => 'Verbal Altercation',
                'incident_description' => 'Neighbor dispute over property boundary',
                'incident_datetime' => '2024-03-15 14:30:00',
                'location' => 'Purok 2',
                'barangay' => 'Barangay Sample',
                'reporter_name' => 'Pedro Fernandez',
                'reporter_contact' => '09175678901',
                'respondent_name' => 'Jose Santos',
                'status' => 'investigating',
                'priority' => 'medium',
            ],
            [
                'blotter_number' => 'BL-2024-002',
                'incident_type' => 'Theft',
                'incident_description' => 'Cellphone stolen from house',
                'incident_datetime' => '2024-03-18 09:15:00',
                'location' => 'Purok 3',
                'barangay' => 'Barangay Sample',
                'reporter_name' => 'Ana Reyes',
                'reporter_contact' => '09176789012',
                'respondent_name' => 'Unknown',
                'status' => 'pending',
                'priority' => 'high',
            ],
            [
                'blotter_number' => 'BL-2024-003',
                'incident_type' => 'Animal Nuisance',
                'incident_description' => 'Stray dogs causing disturbance',
                'incident_datetime' => '2024-03-20 19:00:00',
                'location' => 'Purok 1',
                'barangay' => 'Barangay Sample',
                'reporter_name' => 'Maria Santos',
                'reporter_contact' => '09172345678',
                'respondent_name' => 'Unknown',
                'status' => 'resolved',
                'priority' => 'low',
                'action_taken' => 'Stray dogs impounded',
                'resolved_datetime' => '2024-03-22 10:00:00',
            ],
        ];
        
        foreach ($blotters as $blotter) {
            DB::table('blotters')->updateOrInsert(
                ['blotter_number' => $blotter['blotter_number']],
                array_merge($blotter, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($blotters) . ' blotters');
    }
}