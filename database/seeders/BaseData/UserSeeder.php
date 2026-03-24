<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding users...');
        
        $roles = DB::table('roles')->get()->keyBy('name');
        
        $users = [
            [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'username' => 'admin',
                'email' => 'admin@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09171234567',
                'role_id' => $roles['Administrator']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'username' => 'captain',
                'email' => 'captain@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09172345678',
                'role_id' => $roles['Barangay Captain']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Jose',
                'last_name' => 'Reyes',
                'username' => 'secretary',
                'email' => 'secretary@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09173456789',
                'role_id' => $roles['Barangay Secretary']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Teresita',
                'last_name' => 'Garcia',
                'username' => 'treasurer',
                'email' => 'treasurer@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09174567890',
                'role_id' => $roles['Barangay Treasurer']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Pedro',
                'last_name' => 'Fernandez',
                'username' => 'resident1',
                'email' => 'pedro.fernandez@email.com',
                'password' => Hash::make('password123'),
                'contact_number' => '09175678901',
                'role_id' => $roles['Resident']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Ana',
                'last_name' => 'Reyes',
                'username' => 'resident2',
                'email' => 'ana.reyes@email.com',
                'password' => Hash::make('password123'),
                'contact_number' => '09176789012',
                'role_id' => $roles['Resident']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Carlos',
                'last_name' => 'Mendoza',
                'username' => 'business',
                'email' => 'carlos.mendoza@business.com',
                'password' => Hash::make('password123'),
                'contact_number' => '09177890123',
                'role_id' => $roles['Resident']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Luz',
                'last_name' => 'Villanueva',
                'username' => 'viewer',
                'email' => 'luz.villanueva@email.com',
                'password' => Hash::make('password123'),
                'contact_number' => '09178901234',
                'role_id' => $roles['Viewer']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Ramon',
                'last_name' => 'Aquino',
                'username' => 'staff',
                'email' => 'ramon.aquino@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09179012345',
                'role_id' => $roles['Staff']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Josefa',
                'last_name' => 'Llanes',
                'username' => 'kagawad',
                'email' => 'josefa.llanes@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09170123456',
                'role_id' => $roles['Barangay Kagawad']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Andres',
                'last_name' => 'Bonifacio',
                'username' => 'skchairman',
                'email' => 'andres.bonifacio@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09171234568',
                'role_id' => $roles['SK Chairman']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Gabriela',
                'last_name' => 'Silang',
                'username' => 'treasuryofficer',
                'email' => 'gabriela.silang@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09172345679',
                'role_id' => $roles['Treasury Officer']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Melchora',
                'last_name' => 'Aquino',
                'username' => 'recordclerk',
                'email' => 'melchora.aquino@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09173456780',
                'role_id' => $roles['Records Clerk']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Emilio',
                'last_name' => 'Aguinaldo',
                'username' => 'clearanceofficer',
                'email' => 'emilio.aguinaldo@barangay.gov.ph',
                'password' => Hash::make('password123'),
                'contact_number' => '09174567891',
                'role_id' => $roles['Clearance Officer']->id ?? null,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
        ];

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($users as $user) {
            $existing = DB::table('users')->where('username', $user['username'])->first();
            $userData = array_merge($user, [
                'login_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            if ($existing) {
                unset($userData['password']); // Don't update password if exists
                DB::table('users')->where('id', $existing->id)->update($userData);
                $updatedCount++;
            } else {
                DB::table('users')->insert($userData);
                $createdCount++;
            }
        }
        
        $this->command->info('✅ Seeded ' . count($users) . ' users (' . $createdCount . ' new, ' . $updatedCount . ' updated)');
    }
}