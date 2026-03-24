<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OfficialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding officials...');
        
        $residents = DB::table('residents')->get();
        $positions = DB::table('positions')->get()->keyBy('code');
        
        $officials = [
            ['resident_name' => 'Juan Dela Cruz', 'position_code' => 'POS-CAP', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
            ['resident_name' => 'Maria Santos', 'position_code' => 'POS-SEC', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
            ['resident_name' => 'Teresita Garcia', 'position_code' => 'POS-TREAS', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
            ['resident_name' => 'Pedro Fernandez', 'position_code' => 'POS-KAG1', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
            ['resident_name' => 'Ana Reyes', 'position_code' => 'POS-KAG2', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
            ['resident_name' => 'Carlos Mendoza', 'position_code' => 'POS-KAG3', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
            ['resident_name' => 'Andres Bonifacio', 'position_code' => 'POS-SK', 'term_start' => '2023-01-01', 'term_end' => '2025-12-31'],
        ];
        
        $createdCount = 0;
        
        foreach ($officials as $official) {
            // Find resident by full name
            $resident = null;
            foreach ($residents as $r) {
                $fullName = $r->first_name . ' ' . $r->last_name;
                if ($fullName === $official['resident_name']) {
                    $resident = $r;
                    break;
                }
            }
            
            $position = $positions[$official['position_code']] ?? null;
            
            if ($resident && $position) {
                // Check if already exists
                $exists = DB::table('officials')
                    ->where('resident_id', $resident->id)
                    ->where('position_id', $position->id)
                    ->exists();
                
                if (!$exists) {
                    DB::table('officials')->insert([
                        'resident_id' => $resident->id,
                        'position_id' => $position->id,
                        'term_start' => $official['term_start'],
                        'term_end' => $official['term_end'],
                        'status' => 'active',
                        'order' => $position->order,
                        'is_regular' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $createdCount++;
                }
            }
        }
        
        $this->command->info('✅ Seeded ' . $createdCount . ' officials');
    }
}