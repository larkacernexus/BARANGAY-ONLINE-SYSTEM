<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HouseholdMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding household members...');
        
        $households = DB::table('households')->get()->keyBy('household_number');
        $residents = DB::table('residents')->get();
        
        $members = [
            ['household_number' => 'HH-2024-001', 'resident_name' => 'Juan Dela Cruz', 'relationship' => 'Head', 'is_head' => 1],
            ['household_number' => 'HH-2024-001', 'resident_name' => 'Maria Dela Cruz', 'relationship' => 'Spouse', 'is_head' => 0],
            ['household_number' => 'HH-2024-002', 'resident_name' => 'Maria Santos', 'relationship' => 'Head', 'is_head' => 1],
            ['household_number' => 'HH-2024-002', 'resident_name' => 'Jose Santos', 'relationship' => 'Spouse', 'is_head' => 0],
            ['household_number' => 'HH-2024-003', 'resident_name' => 'Pedro Fernandez', 'relationship' => 'Head', 'is_head' => 1],
            ['household_number' => 'HH-2024-003', 'resident_name' => 'Juana Fernandez', 'relationship' => 'Spouse', 'is_head' => 0],
            ['household_number' => 'HH-2024-004', 'resident_name' => 'Ana Reyes', 'relationship' => 'Head', 'is_head' => 1],
            ['household_number' => 'HH-2024-005', 'resident_name' => 'Carlos Mendoza', 'relationship' => 'Head', 'is_head' => 1],
            ['household_number' => 'HH-2024-006', 'resident_name' => 'Luz Villanueva', 'relationship' => 'Head', 'is_head' => 1],
            ['household_number' => 'HH-2024-007', 'resident_name' => 'Ramon Aquino', 'relationship' => 'Head', 'is_head' => 1],
        ];
        
        $createdCount = 0;
        
        foreach ($members as $member) {
            $household = $households[$member['household_number']] ?? null;
            
            // Find resident by full name
            $resident = null;
            foreach ($residents as $r) {
                $fullName = $r->first_name . ' ' . $r->last_name;
                if ($fullName === $member['resident_name']) {
                    $resident = $r;
                    break;
                }
            }
            
            if ($household && $resident) {
                // Check if already exists
                $exists = DB::table('household_members')
                    ->where('household_id', $household->id)
                    ->where('resident_id', $resident->id)
                    ->exists();
                
                if (!$exists) {
                    DB::table('household_members')->insert([
                        'household_id' => $household->id,
                        'resident_id' => $resident->id,
                        'relationship_to_head' => $member['relationship'],
                        'is_head' => $member['is_head'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $createdCount++;
                }
            }
        }
        
        $this->command->info('✅ Seeded ' . $createdCount . ' household members');
    }
}