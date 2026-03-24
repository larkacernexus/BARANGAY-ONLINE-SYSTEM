<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HouseholdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding households...');
        
        $users = DB::table('users')->get()->keyBy('username');
        $puroks = DB::table('puroks')->get()->keyBy('slug');
        
        $households = [
            [
                'household_number' => 'HH-2024-001',
                'address' => 'Purok 1, Barangay Sample',
                'purok_id' => $puroks['purok-1']->id ?? null,
                'contact_number' => '09171234567',
                'email' => 'delacruz.family@email.com',
                'member_count' => 4,
                'head_of_family' => 'Juan Dela Cruz',
                'income_range' => '20,000 - 30,000',
                'housing_type' => 'Owned',
                'ownership_status' => 'Owner',
                'water_source' => 'Barangay Water System',
                'electricity' => 1,
                'internet' => 1,
                'vehicle' => 1,
                'status' => 'active',
                'user_id' => $users['admin']->id ?? null,
            ],
            [
                'household_number' => 'HH-2024-002',
                'address' => 'Purok 1, Barangay Sample',
                'purok_id' => $puroks['purok-1']->id ?? null,
                'contact_number' => '09172345678',
                'email' => 'santos.family@email.com',
                'member_count' => 3,
                'head_of_family' => 'Maria Santos',
                'income_range' => '30,000 - 40,000',
                'housing_type' => 'Owned',
                'ownership_status' => 'Owner',
                'water_source' => 'Barangay Water System',
                'electricity' => 1,
                'internet' => 1,
                'vehicle' => 0,
                'status' => 'active',
                'user_id' => $users['captain']->id ?? null,
            ],
            [
                'household_number' => 'HH-2024-003',
                'address' => 'Purok 2, Barangay Sample',
                'purok_id' => $puroks['purok-2']->id ?? null,
                'contact_number' => '09175678901',
                'email' => 'fernandez.family@email.com',
                'member_count' => 5,
                'head_of_family' => 'Pedro Fernandez',
                'income_range' => '40,000 - 50,000',
                'housing_type' => 'Rented',
                'ownership_status' => 'Tenant',
                'water_source' => 'Deep Well',
                'electricity' => 1,
                'internet' => 1,
                'vehicle' => 1,
                'status' => 'active',
                'user_id' => $users['resident1']->id ?? null,
            ],
            [
                'household_number' => 'HH-2024-004',
                'address' => 'Purok 3, Barangay Sample',
                'purok_id' => $puroks['purok-3']->id ?? null,
                'contact_number' => '09176789012',
                'email' => 'reyes.family@email.com',
                'member_count' => 4,
                'head_of_family' => 'Ana Reyes',
                'income_range' => '50,000 - 60,000',
                'housing_type' => 'Owned',
                'ownership_status' => 'Owner',
                'water_source' => 'Barangay Water System',
                'electricity' => 1,
                'internet' => 1,
                'vehicle' => 1,
                'status' => 'active',
                'user_id' => $users['resident2']->id ?? null,
            ],
            [
                'household_number' => 'HH-2024-005',
                'address' => 'Purok 3, Barangay Sample',
                'purok_id' => $puroks['purok-3']->id ?? null,
                'contact_number' => '09177890123',
                'email' => 'mendoza.family@email.com',
                'member_count' => 3,
                'head_of_family' => 'Carlos Mendoza',
                'income_range' => '20,000 - 30,000',
                'housing_type' => 'Rented',
                'ownership_status' => 'Tenant',
                'water_source' => 'Barangay Water System',
                'electricity' => 1,
                'internet' => 0,
                'vehicle' => 0,
                'status' => 'active',
                'user_id' => $users['business']->id ?? null,
            ],
            [
                'household_number' => 'HH-2024-006',
                'address' => 'Purok 2, Barangay Sample',
                'purok_id' => $puroks['purok-2']->id ?? null,
                'contact_number' => '09178901234',
                'email' => null,
                'member_count' => 2,
                'head_of_family' => 'Luz Villanueva',
                'income_range' => 'Below 10,000',
                'housing_type' => 'Owned',
                'ownership_status' => 'Owner',
                'water_source' => 'Deep Well',
                'electricity' => 1,
                'internet' => 0,
                'vehicle' => 0,
                'status' => 'active',
                'user_id' => $users['viewer']->id ?? null,
            ],
            [
                'household_number' => 'HH-2024-007',
                'address' => 'Purok 1, Barangay Sample',
                'purok_id' => $puroks['purok-1']->id ?? null,
                'contact_number' => '09179012345',
                'email' => 'aquino.family@email.com',
                'member_count' => 3,
                'head_of_family' => 'Ramon Aquino',
                'income_range' => '25,000 - 35,000',
                'housing_type' => 'Rented',
                'ownership_status' => 'Tenant',
                'water_source' => 'Barangay Water System',
                'electricity' => 1,
                'internet' => 1,
                'vehicle' => 0,
                'status' => 'active',
                'user_id' => $users['staff']->id ?? null,
            ],
        ];

        foreach ($households as $household) {
            DB::table('households')->updateOrInsert(
                ['household_number' => $household['household_number']],
                array_merge($household, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($households) . ' households');
    }
}