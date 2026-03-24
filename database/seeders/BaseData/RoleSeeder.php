<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding roles...');
        
        $roles = [
            ['name' => 'Administrator', 'description' => 'Full system access', 'is_system_role' => 1],
            ['name' => 'Barangay Captain', 'description' => 'Barangay leader', 'is_system_role' => 1],
            ['name' => 'Barangay Secretary', 'description' => 'Handles documents and records', 'is_system_role' => 1],
            ['name' => 'Barangay Treasurer', 'description' => 'Manages finances', 'is_system_role' => 1],
            ['name' => 'Barangay Kagawad', 'description' => 'Barangay council member', 'is_system_role' => 1],
            ['name' => 'SK Chairman', 'description' => 'Sangguniang Kabataan chairman', 'is_system_role' => 1],
            ['name' => 'SK Kagawad', 'description' => 'Sangguniang Kabataan member', 'is_system_role' => 1],
            ['name' => 'Resident', 'description' => 'Barangay resident', 'is_system_role' => 0],
            ['name' => 'Staff', 'description' => 'General staff', 'is_system_role' => 0],
            ['name' => 'Treasury Officer', 'description' => 'Handles treasury operations', 'is_system_role' => 0],
            ['name' => 'Records Clerk', 'description' => 'Manages records and documents', 'is_system_role' => 0],
            ['name' => 'Clearance Officer', 'description' => 'Processes clearance requests', 'is_system_role' => 0],
            ['name' => 'Viewer', 'description' => 'Read-only access', 'is_system_role' => 0],
        ];

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($roles as $role) {
            $existing = DB::table('roles')->where('name', $role['name'])->first();
            if ($existing) {
                DB::table('roles')->where('id', $existing->id)->update($role);
                $updatedCount++;
            } else {
                DB::table('roles')->insert($role);
                $createdCount++;
            }
        }
        
        $this->command->info('✅ Seeded ' . count($roles) . ' roles (' . $createdCount . ' new, ' . $updatedCount . ' updated)');
    }
}