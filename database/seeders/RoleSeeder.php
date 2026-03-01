<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            // System Roles (with is_system_role = true)
            [
                'name' => 'Administrator',
                'description' => 'Full system access and management',
                'is_system_role' => true,
            ],
            [
                'name' => 'Barangay Captain',
                'description' => 'Barangay captain with oversight access',
                'is_system_role' => true,
            ],
            [
                'name' => 'Barangay Secretary',
                'description' => 'Handles documentation, records, and administrative tasks',
                'is_system_role' => true,
            ],
            [
                'name' => 'Barangay Treasurer',
                'description' => 'Manages barangay funds, collections, and disbursements',
                'is_system_role' => true,
            ],
            [
                'name' => 'Barangay Kagawad',
                'description' => 'Barangay council member with committee oversight',
                'is_system_role' => true,
            ],
            [
                'name' => 'SK Chairman',
                'description' => 'Sangguniang Kabataan chairman representing youth',
                'is_system_role' => true,
            ],
            [
                'name' => 'SK Kagawad',
                'description' => 'Sangguniang Kabataan council member',
                'is_system_role' => true,
            ],
            [
                'name' => 'Treasury Officer',
                'description' => 'Payment and financial management',
                'is_system_role' => true,
            ],
            [
                'name' => 'Records Clerk',
                'description' => 'Resident and household management',
                'is_system_role' => true,
            ],
            [
                'name' => 'Clearance Officer',
                'description' => 'Clearance and certificate issuance',
                'is_system_role' => true,
            ],
            [
                'name' => 'Viewer',
                'description' => 'Read-only access',
                'is_system_role' => true,
            ],
            [
                'name' => 'Staff',
                'description' => 'General staff with basic operational access',
                'is_system_role' => true,
            ],

            // Non-System Roles (with is_system_role = false)
            [
                'name' => 'Household Head',
                'description' => 'Head of household with access to manage household members and requests',
                'is_system_role' => false,
            ],
        ];

        $created = 0;
        $updated = 0;

        foreach ($roles as $role) {
            $existingRole = Role::where('name', $role['name'])->first();
            
            if ($existingRole) {
                $existingRole->update([
                    'description' => $role['description'],
                    'is_system_role' => $role['is_system_role'],
                ]);
                $updated++;
            } else {
                Role::create($role);
                $created++;
            }
        }

        // Display summary
        $this->command->info("✅ Roles seeded successfully!");
        $this->command->info("   - Created: {$created} new roles");
        $this->command->info("   - Updated: {$updated} existing roles");
        $this->command->info("   - Total: " . Role::count() . " roles in database");
        
        // Display table of roles
        $roles = Role::all(['id', 'name', 'description', 'is_system_role'])->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'type' => $role->is_system_role ? 'System' : 'Custom',
            ];
        })->toArray();
        
        $this->command->table(
            ['ID', 'Name', 'Description', 'Type'],
            $roles
        );
    }
}