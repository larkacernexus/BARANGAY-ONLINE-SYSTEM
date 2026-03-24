<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding positions...');
        
        $roles = DB::table('roles')->get()->keyBy('name');
        $committees = DB::table('committees')->get()->keyBy('code');
        
        $positions = [
            ['code' => 'POS-CAP', 'name' => 'Barangay Captain', 'description' => 'Chief executive of the barangay', 'order' => 1, 'role_name' => 'Barangay Captain', 'committee_code' => null],
            ['code' => 'POS-SEC', 'name' => 'Barangay Secretary', 'description' => 'Secretary of the barangay', 'order' => 2, 'role_name' => 'Barangay Secretary', 'committee_code' => null],
            ['code' => 'POS-TREAS', 'name' => 'Barangay Treasurer', 'description' => 'Treasurer of the barangay', 'order' => 3, 'role_name' => 'Barangay Treasurer', 'committee_code' => null],
            ['code' => 'POS-KAG1', 'name' => 'Kagawad - Peace and Order', 'description' => 'Council member for peace and order', 'order' => 4, 'role_name' => 'Barangay Kagawad', 'committee_code' => 'COM-PEACE'],
            ['code' => 'POS-KAG2', 'name' => 'Kagawad - Education', 'description' => 'Council member for education', 'order' => 5, 'role_name' => 'Barangay Kagawad', 'committee_code' => 'COM-EDU'],
            ['code' => 'POS-KAG3', 'name' => 'Kagawad - Health', 'description' => 'Council member for health', 'order' => 6, 'role_name' => 'Barangay Kagawad', 'committee_code' => 'COM-HEALTH'],
            ['code' => 'POS-SK', 'name' => 'SK Chairman', 'description' => 'Sangguniang Kabataan Chairman', 'order' => 7, 'role_name' => 'SK Chairman', 'committee_code' => 'COM-YOUTH'],
        ];
        
        foreach ($positions as $position) {
            $role = $roles[$position['role_name']] ?? null;
            $committee = $position['committee_code'] ? ($committees[$position['committee_code']] ?? null) : null;
            
            DB::table('positions')->updateOrInsert(
                ['code' => $position['code']],
                [
                    'code' => $position['code'],
                    'name' => $position['name'],
                    'description' => $position['description'],
                    'order' => $position['order'],
                    'role_id' => $role->id ?? null,
                    'committee_id' => $committee->id ?? null,
                    'requires_account' => 1,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
        
        $this->command->info('✅ Seeded ' . count($positions) . ' positions');
    }
}