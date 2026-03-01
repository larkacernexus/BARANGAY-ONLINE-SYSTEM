<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get role IDs
        $roles = [
            'Administrator' => Role::where('name', 'Administrator')->first()->id,
            'Barangay Captain' => Role::where('name', 'Barangay Captain')->first()->id,
            'Barangay Secretary' => Role::where('name', 'Barangay Secretary')->first()->id,
            'Barangay Treasurer' => Role::where('name', 'Barangay Treasurer')->first()->id,
            'Barangay Kagawad' => Role::where('name', 'Barangay Kagawad')->first()->id,
            'SK Chairman' => Role::where('name', 'SK Chairman')->first()->id,
            'SK Kagawad' => Role::where('name', 'SK Kagawad')->first()->id,
            'Treasury Officer' => Role::where('name', 'Treasury Officer')->first()->id,
            'Records Clerk' => Role::where('name', 'Records Clerk')->first()->id,
            'Clearance Officer' => Role::where('name', 'Clearance Officer')->first()->id,
            'Viewer' => Role::where('name', 'Viewer')->first()->id,
            'Staff' => Role::where('name', 'Staff')->first()->id,
            'Household Head' => Role::where('name', 'Household Head')->first()->id,
        ];

        $users = [
            // Administrator
            [
                'username' => 'admin',
                'email' => 'admin@barangay.gov.ph',
                'contact_number' => '09171234567',
                'role_id' => $roles['Administrator'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Barangay Captain
            [
                'username' => 'captain',
                'email' => 'captain@barangay.gov.ph',
                'contact_number' => '09171234568',
                'role_id' => $roles['Barangay Captain'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Barangay Secretary
            [
                'username' => 'secretary',
                'email' => 'secretary@barangay.gov.ph',
                'contact_number' => '09171234569',
                'role_id' => $roles['Barangay Secretary'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Barangay Treasurer
            [
                'username' => 'treasurer',
                'email' => 'treasurer@barangay.gov.ph',
                'contact_number' => '09171234570',
                'role_id' => $roles['Barangay Treasurer'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Treasury Officer
            [
                'username' => 'treasury_officer',
                'email' => 'treasury.officer@barangay.gov.ph',
                'contact_number' => '09171234571',
                'role_id' => $roles['Treasury Officer'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Records Clerk
            [
                'username' => 'records_clerk',
                'email' => 'records.clerk@barangay.gov.ph',
                'contact_number' => '09171234572',
                'role_id' => $roles['Records Clerk'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Clearance Officer
            [
                'username' => 'clearance_officer',
                'email' => 'clearance.officer@barangay.gov.ph',
                'contact_number' => '09171234573',
                'role_id' => $roles['Clearance Officer'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Staff (multiple staff users)
            [
                'username' => 'staff1',
                'email' => 'staff1@barangay.gov.ph',
                'contact_number' => '09171234574',
                'role_id' => $roles['Staff'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'staff2',
                'email' => 'staff2@barangay.gov.ph',
                'contact_number' => '09171234575',
                'role_id' => $roles['Staff'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Viewer (read-only access)
            [
                'username' => 'viewer',
                'email' => 'viewer@barangay.gov.ph',
                'contact_number' => '09171234576',
                'role_id' => $roles['Viewer'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Barangay Kagawad (multiple)
            [
                'username' => 'kagawad1',
                'email' => 'kagawad1@barangay.gov.ph',
                'contact_number' => '09171234577',
                'role_id' => $roles['Barangay Kagawad'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'kagawad2',
                'email' => 'kagawad2@barangay.gov.ph',
                'contact_number' => '09171234578',
                'role_id' => $roles['Barangay Kagawad'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'kagawad3',
                'email' => 'kagawad3@barangay.gov.ph',
                'contact_number' => '09171234579',
                'role_id' => $roles['Barangay Kagawad'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SK Chairman
            [
                'username' => 'sk_chairman',
                'email' => 'sk.chairman@barangay.gov.ph',
                'contact_number' => '09171234580',
                'role_id' => $roles['SK Chairman'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SK Kagawad (multiple)
            [
                'username' => 'sk_kagawad1',
                'email' => 'sk.kagawad1@barangay.gov.ph',
                'contact_number' => '09171234581',
                'role_id' => $roles['SK Kagawad'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'sk_kagawad2',
                'email' => 'sk.kagawad2@barangay.gov.ph',
                'contact_number' => '09171234582',
                'role_id' => $roles['SK Kagawad'],
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'require_password_change' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Household Heads (multiple - these would typically be linked to actual households)
            // Note: These should be run after residents and households are seeded
        ];

        // Create users
        $created = 0;
        $updated = 0;

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
            
            if ($user->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        $this->command->info("✅ Users seeded successfully!");
        $this->command->info("   - Created: {$created} new users");
        $this->command->info("   - Updated: {$updated} existing users");
        $this->command->info("   - Total: " . User::count() . " users in database");

        // Display table of users
        $usersTable = User::with('role')
            ->get(['id', 'username', 'email', 'contact_number', 'role_id', 'status'])
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'contact' => $user->contact_number,
                    'role' => $user->role->name ?? 'Unknown',
                    'status' => $user->status,
                ];
            })->toArray();

        $this->command->table(
            ['ID', 'Username', 'Email', 'Contact', 'Role', 'Status'],
            $usersTable
        );
    }
}