<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting database seeding...');
        
        // Disable foreign key checks for clean seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Seed in order of dependencies
        $this->seedPuroks();
        $this->seedRoles();
        $this->seedUsers();
        $this->seedResidents();
        $this->seedHouseholds();
        $this->seedHouseholdMembers();
        $this->seedCommittees();
        $this->seedPositions();
        $this->seedOfficials();
        $this->seedDocumentCategories();
        $this->seedDocumentTypes();
        $this->seedClearanceTypes();
        $this->seedBusinesses();
        $this->seedFeeTypes();
        $this->seedDiscountTypes();
        $this->seedDiscountRules();
        $this->seedAnnouncements();
        $this->seedReportTypes();
        $this->seedCommunityReports();
        $this->seedBlotters();
        $this->seedSupportCategories();
        $this->seedSupportTickets();
        $this->seedForms();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        $this->command->info('✅ Database seeding completed successfully!');
    }

    /**
     * Seed Puroks (Barangay subdivisions)
     */
    private function seedPuroks(): void
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

    /**
     * Seed Roles - Updated to match RolePermissionSeeder
     */
    private function seedRoles(): void
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

    /**
     * Seed Users - Updated with new role names
     */
    private function seedUsers(): void
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

    /**
     * Seed Residents - Updated to include all users
     */
    private function seedResidents(): void
    {
        $this->command->info('Seeding residents...');
        
        $users = DB::table('users')->get()->keyBy('username');
        $puroks = DB::table('puroks')->get()->keyBy('slug');
        
        $residents = [
            [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'middle_name' => 'Santos',
                'birth_date' => '1985-03-15',
                'age' => 39,
                'gender' => 'male',
                'civil_status' => 'Married',
                'contact_number' => '09171234567',
                'email' => 'juan.delacruz@email.com',
                'address' => 'Purok 1, Barangay Sample',
                'purok_id' => $puroks['purok-1']->id ?? null,
                'occupation' => 'Farmer',
                'employment_status' => 'Self-employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Manila',
                'status' => 'active',
                'resident_id' => 'RES-2024-001',
                'user_id' => $users['admin']->id ?? null,
            ],
            [
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'middle_name' => 'Cruz',
                'birth_date' => '1990-07-22',
                'age' => 34,
                'gender' => 'female',
                'civil_status' => 'Married',
                'contact_number' => '09172345678',
                'email' => 'maria.santos@email.com',
                'address' => 'Purok 1, Barangay Sample',
                'purok_id' => $puroks['purok-1']->id ?? null,
                'occupation' => 'Teacher',
                'employment_status' => 'Employed',
                'educational_attainment' => 'Master\'s Degree',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Quezon City',
                'status' => 'active',
                'resident_id' => 'RES-2024-002',
                'user_id' => $users['captain']->id ?? null,
            ],
            [
                'first_name' => 'Jose',
                'last_name' => 'Reyes',
                'middle_name' => 'Gonzales',
                'birth_date' => '1988-05-10',
                'age' => 36,
                'gender' => 'male',
                'civil_status' => 'Married',
                'contact_number' => '09173456789',
                'email' => 'jose.reyes@barangay.gov.ph',
                'address' => 'Purok 2, Barangay Sample',
                'purok_id' => $puroks['purok-2']->id ?? null,
                'occupation' => 'Government Employee',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Bulacan',
                'status' => 'active',
                'resident_id' => 'RES-2024-003',
                'user_id' => $users['secretary']->id ?? null,
            ],
            [
                'first_name' => 'Teresita',
                'last_name' => 'Garcia',
                'middle_name' => 'Lopez',
                'birth_date' => '1975-12-15',
                'age' => 49,
                'gender' => 'female',
                'civil_status' => 'Married',
                'contact_number' => '09174567890',
                'email' => 'teresita.garcia@barangay.gov.ph',
                'address' => 'Purok 3, Barangay Sample',
                'purok_id' => $puroks['purok-3']->id ?? null,
                'occupation' => 'Accountant',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Manila',
                'status' => 'active',
                'resident_id' => 'RES-2024-004',
                'user_id' => $users['treasurer']->id ?? null,
            ],
            [
                'first_name' => 'Pedro',
                'last_name' => 'Fernandez',
                'middle_name' => 'Gonzales',
                'birth_date' => '1995-11-05',
                'age' => 29,
                'gender' => 'male',
                'civil_status' => 'Single',
                'contact_number' => '09175678901',
                'email' => 'pedro.fernandez@email.com',
                'address' => 'Purok 2, Barangay Sample',
                'purok_id' => $puroks['purok-2']->id ?? null,
                'occupation' => 'Software Developer',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Iglesia Ni Cristo',
                'is_voter' => 1,
                'place_of_birth' => 'Cebu City',
                'status' => 'active',
                'resident_id' => 'RES-2024-005',
                'user_id' => $users['resident1']->id ?? null,
            ],
            [
                'first_name' => 'Ana',
                'last_name' => 'Reyes',
                'middle_name' => 'Lopez',
                'birth_date' => '1988-02-18',
                'age' => 36,
                'gender' => 'female',
                'civil_status' => 'Married',
                'contact_number' => '09176789012',
                'email' => 'ana.reyes@email.com',
                'address' => 'Purok 3, Barangay Sample',
                'purok_id' => $puroks['purok-3']->id ?? null,
                'occupation' => 'Business Owner',
                'employment_status' => 'Self-employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Davao City',
                'status' => 'active',
                'resident_id' => 'RES-2024-006',
                'user_id' => $users['resident2']->id ?? null,
            ],
            [
                'first_name' => 'Carlos',
                'last_name' => 'Mendoza',
                'middle_name' => 'Villanueva',
                'birth_date' => '1982-09-30',
                'age' => 42,
                'gender' => 'male',
                'civil_status' => 'Married',
                'contact_number' => '09177890123',
                'email' => 'carlos.mendoza@business.com',
                'address' => 'Purok 3, Barangay Sample',
                'purok_id' => $puroks['purok-3']->id ?? null,
                'occupation' => 'Store Owner',
                'employment_status' => 'Self-employed',
                'educational_attainment' => 'High School Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Bulacan',
                'status' => 'active',
                'resident_id' => 'RES-2024-007',
                'user_id' => $users['business']->id ?? null,
            ],
            [
                'first_name' => 'Luz',
                'last_name' => 'Villanueva',
                'middle_name' => 'Ramirez',
                'birth_date' => '1960-05-12',
                'age' => 64,
                'gender' => 'female',
                'civil_status' => 'Widowed',
                'contact_number' => '09178901234',
                'email' => 'luz.villanueva@email.com',
                'address' => 'Purok 2, Barangay Sample',
                'purok_id' => $puroks['purok-2']->id ?? null,
                'occupation' => 'Retired',
                'employment_status' => 'Retired',
                'educational_attainment' => 'Elementary Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Pampanga',
                'status' => 'active',
                'resident_id' => 'RES-2024-008',
                'user_id' => $users['viewer']->id ?? null,
            ],
            [
                'first_name' => 'Ramon',
                'last_name' => 'Aquino',
                'middle_name' => 'Dela Cruz',
                'birth_date' => '1992-08-25',
                'age' => 32,
                'gender' => 'male',
                'civil_status' => 'Single',
                'contact_number' => '09179012345',
                'email' => 'ramon.aquino@barangay.gov.ph',
                'address' => 'Purok 1, Barangay Sample',
                'purok_id' => $puroks['purok-1']->id ?? null,
                'occupation' => 'Staff',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Manila',
                'status' => 'active',
                'resident_id' => 'RES-2024-009',
                'user_id' => $users['staff']->id ?? null,
            ],
            [
                'first_name' => 'Josefa',
                'last_name' => 'Llanes',
                'middle_name' => 'Escoda',
                'birth_date' => '1985-09-20',
                'age' => 39,
                'gender' => 'female',
                'civil_status' => 'Married',
                'contact_number' => '09170123456',
                'email' => 'josefa.llanes@barangay.gov.ph',
                'address' => 'Purok 4, Barangay Sample',
                'purok_id' => $puroks['purok-4']->id ?? null,
                'occupation' => 'Councilor',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Manila',
                'status' => 'active',
                'resident_id' => 'RES-2024-010',
                'user_id' => $users['kagawad']->id ?? null,
            ],
            [
                'first_name' => 'Andres',
                'last_name' => 'Bonifacio',
                'middle_name' => 'Castro',
                'birth_date' => '1998-11-30',
                'age' => 26,
                'gender' => 'male',
                'civil_status' => 'Single',
                'contact_number' => '09171234568',
                'email' => 'andres.bonifacio@barangay.gov.ph',
                'address' => 'Purok 5, Barangay Sample',
                'purok_id' => $puroks['purok-5']->id ?? null,
                'occupation' => 'Student',
                'employment_status' => 'Student',
                'educational_attainment' => 'College Level',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Tondo',
                'status' => 'active',
                'resident_id' => 'RES-2024-011',
                'user_id' => $users['skchairman']->id ?? null,
            ],
            [
                'first_name' => 'Gabriela',
                'last_name' => 'Silang',
                'middle_name' => 'Carino',
                'birth_date' => '1980-03-19',
                'age' => 44,
                'gender' => 'female',
                'civil_status' => 'Married',
                'contact_number' => '09172345679',
                'email' => 'gabriela.silang@barangay.gov.ph',
                'address' => 'Purok 6, Barangay Sample',
                'purok_id' => $puroks['purok-6']->id ?? null,
                'occupation' => 'Finance Officer',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Ilocos',
                'status' => 'active',
                'resident_id' => 'RES-2024-012',
                'user_id' => $users['treasuryofficer']->id ?? null,
            ],
            [
                'first_name' => 'Melchora',
                'last_name' => 'Aquino',
                'middle_name' => 'De Jesus',
                'birth_date' => '1987-01-06',
                'age' => 37,
                'gender' => 'female',
                'civil_status' => 'Married',
                'contact_number' => '09173456780',
                'email' => 'melchora.aquino@barangay.gov.ph',
                'address' => 'Purok 7, Barangay Sample',
                'purok_id' => $puroks['purok-7']->id ?? null,
                'occupation' => 'Records Manager',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Quezon City',
                'status' => 'active',
                'resident_id' => 'RES-2024-013',
                'user_id' => $users['recordclerk']->id ?? null,
            ],
            [
                'first_name' => 'Emilio',
                'last_name' => 'Aguinaldo',
                'middle_name' => 'Famy',
                'birth_date' => '1983-03-22',
                'age' => 41,
                'gender' => 'male',
                'civil_status' => 'Married',
                'contact_number' => '09174567891',
                'email' => 'emilio.aguinaldo@barangay.gov.ph',
                'address' => 'Purok 8, Barangay Sample',
                'purok_id' => $puroks['purok-8']->id ?? null,
                'occupation' => 'Clearance Officer',
                'employment_status' => 'Employed',
                'educational_attainment' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => 1,
                'place_of_birth' => 'Cavite',
                'status' => 'active',
                'resident_id' => 'RES-2024-014',
                'user_id' => $users['clearanceofficer']->id ?? null,
            ],
        ];

        foreach ($residents as $resident) {
            DB::table('residents')->updateOrInsert(
                ['resident_id' => $resident['resident_id']],
                array_merge($resident, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($residents) . ' residents');
    }

    /**
     * Seed Households
     */
    private function seedHouseholds(): void
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

    /**
     * Seed Household Members
     */
    private function seedHouseholdMembers(): void
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

    /**
     * Seed Committees
     */
    private function seedCommittees(): void
    {
        $this->command->info('Seeding committees...');
        
        $committees = [
            ['code' => 'COM-PEACE', 'name' => 'Peace and Order Committee', 'description' => 'Maintains peace and order in the barangay', 'order' => 1],
            ['code' => 'COM-EDU', 'name' => 'Education Committee', 'description' => 'Oversees educational programs', 'order' => 2],
            ['code' => 'COM-HEALTH', 'name' => 'Health Committee', 'description' => 'Manages health programs and services', 'order' => 3],
            ['code' => 'COM-INFRA', 'name' => 'Infrastructure Committee', 'description' => 'Handles infrastructure projects', 'order' => 4],
            ['code' => 'COM-AGRIC', 'name' => 'Agriculture Committee', 'description' => 'Supports agricultural activities', 'order' => 5],
            ['code' => 'COM-YOUTH', 'name' => 'Youth and Sports Committee', 'description' => 'Organizes youth and sports activities', 'order' => 6],
            ['code' => 'COM-WOMEN', 'name' => 'Women and Family Committee', 'description' => 'Supports women and family welfare', 'order' => 7],
        ];
        
        foreach ($committees as $committee) {
            DB::table('committees')->updateOrInsert(
                ['code' => $committee['code']],
                array_merge($committee, [
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($committees) . ' committees');
    }

    /**
     * Seed Positions
     */
    private function seedPositions(): void
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

    /**
     * Seed Officials
     */
    private function seedOfficials(): void
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

    /**
     * Seed Document Categories
     */
    private function seedDocumentCategories(): void
    {
        $this->command->info('Seeding document categories...');
        
        $categories = [
            ['name' => 'Government IDs', 'description' => 'Government-issued identification documents', 'slug' => 'government-ids', 'icon' => 'id-card', 'color' => 'blue'],
            ['name' => 'Barangay Clearances', 'description' => 'Barangay clearance documents', 'slug' => 'barangay-clearances', 'icon' => 'file-alt', 'color' => 'green'],
            ['name' => 'Certificates', 'description' => 'Various certificates', 'slug' => 'certificates', 'icon' => 'certificate', 'color' => 'purple'],
            ['name' => 'Business Permits', 'description' => 'Business-related documents', 'slug' => 'business-permits', 'icon' => 'store', 'color' => 'orange'],
            ['name' => 'Land Titles', 'description' => 'Property and land documents', 'slug' => 'land-titles', 'icon' => 'landmark', 'color' => 'red'],
        ];
        
        foreach ($categories as $category) {
            DB::table('document_categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, [
                    'order' => 0,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($categories) . ' document categories');
    }

    /**
     * Seed Document Types
     */
    private function seedDocumentTypes(): void
    {
        $this->command->info('Seeding document types...');
        
        $categories = DB::table('document_categories')->get()->keyBy('slug');
        
        $docTypes = [
            ['name' => 'UMID ID', 'code' => 'DOC-UMID', 'description' => 'Unified Multi-Purpose ID', 'category_slug' => 'government-ids', 'is_required' => 1],
            ['name' => 'Driver\'s License', 'code' => 'DOC-DL', 'description' => 'Driver\'s license', 'category_slug' => 'government-ids', 'is_required' => 0],
            ['name' => 'Passport', 'code' => 'DOC-PASS', 'description' => 'Philippine Passport', 'category_slug' => 'government-ids', 'is_required' => 0],
            ['name' => 'Barangay Clearance', 'code' => 'DOC-BC', 'description' => 'Barangay Clearance', 'category_slug' => 'barangay-clearances', 'is_required' => 1],
            ['name' => 'Certificate of Residency', 'code' => 'DOC-COR', 'description' => 'Certificate of Residency', 'category_slug' => 'certificates', 'is_required' => 1],
            ['name' => 'Business Permit', 'code' => 'DOC-BP', 'description' => 'Mayor\'s Permit', 'category_slug' => 'business-permits', 'is_required' => 1],
        ];
        
        foreach ($docTypes as $docType) {
            $category = $categories[$docType['category_slug']] ?? null;
            
            if ($category) {
                DB::table('document_types')->updateOrInsert(
                    ['code' => $docType['code']],
                    [
                        'name' => $docType['name'],
                        'code' => $docType['code'],
                        'description' => $docType['description'],
                        'document_category_id' => $category->id,
                        'is_required' => $docType['is_required'],
                        'sort_order' => 0,
                        'accepted_formats' => json_encode(['pdf', 'jpg', 'png']),
                        'max_file_size' => 5120,
                        'is_active' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
        
        $this->command->info('✅ Seeded ' . count($docTypes) . ' document types');
    }

    /**
     * Seed Clearance Types
     */
    private function seedClearanceTypes(): void
    {
        $this->command->info('Seeding clearance types...');
        
        $clearanceTypes = [
            ['name' => 'Barangay Clearance', 'code' => 'BC-001', 'description' => 'Standard barangay clearance for various purposes', 'fee' => 50.00, 'processing_days' => 1, 'validity_days' => 365, 'requires_payment' => 1, 'requires_approval' => 1],
            ['name' => 'Certificate of Residency', 'code' => 'COR-001', 'description' => 'Proof of residency in the barangay', 'fee' => 50.00, 'processing_days' => 1, 'validity_days' => 180, 'requires_payment' => 1, 'requires_approval' => 0],
            ['name' => 'Certificate of Indigency', 'code' => 'COI-001', 'description' => 'For indigent residents seeking assistance', 'fee' => 0.00, 'processing_days' => 1, 'validity_days' => 90, 'requires_payment' => 0, 'requires_approval' => 1],
            ['name' => 'Business Clearance', 'code' => 'BIZ-001', 'description' => 'Clearance for business operations', 'fee' => 200.00, 'processing_days' => 3, 'validity_days' => 365, 'requires_payment' => 1, 'requires_approval' => 1],
        ];
        
        foreach ($clearanceTypes as $type) {
            DB::table('clearance_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'is_active' => 1,
                    'is_online_only' => 0,
                    'is_discountable' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($clearanceTypes) . ' clearance types');
    }

    /**
     * Seed Businesses
     */
    private function seedBusinesses(): void
    {
        $this->command->info('Seeding businesses...');
        
        $residents = DB::table('residents')->get();
        $puroks = DB::table('puroks')->get()->keyBy('slug');
        
        $businesses = [
            ['business_name' => 'Dela Cruz Sari-sari Store', 'business_type' => 'Retail', 'owner_name' => 'Juan Dela Cruz', 'address' => 'Purok 1', 'purok_slug' => 'purok-1', 'capital_amount' => 50000, 'monthly_gross' => 30000, 'employee_count' => 1, 'status' => 'active'],
            ['business_name' => 'Santos Bakery', 'business_type' => 'Food', 'owner_name' => 'Maria Santos', 'address' => 'Purok 1', 'purok_slug' => 'purok-1', 'capital_amount' => 100000, 'monthly_gross' => 80000, 'employee_count' => 3, 'status' => 'active'],
            ['business_name' => 'Fernandez Hardware', 'business_type' => 'Hardware', 'owner_name' => 'Pedro Fernandez', 'address' => 'Purok 2', 'purok_slug' => 'purok-2', 'capital_amount' => 200000, 'monthly_gross' => 150000, 'employee_count' => 4, 'status' => 'active'],
            ['business_name' => 'Reyes General Merchandise', 'business_type' => 'Retail', 'owner_name' => 'Ana Reyes', 'address' => 'Purok 3', 'purok_slug' => 'purok-3', 'capital_amount' => 150000, 'monthly_gross' => 100000, 'employee_count' => 2, 'status' => 'active'],
            ['business_name' => 'Mendoza Carinderia', 'business_type' => 'Food', 'owner_name' => 'Carlos Mendoza', 'address' => 'Purok 3', 'purok_slug' => 'purok-3', 'capital_amount' => 30000, 'monthly_gross' => 25000, 'employee_count' => 1, 'status' => 'active'],
        ];
        
        foreach ($businesses as $business) {
            // Find owner by full name
            $owner = null;
            foreach ($residents as $r) {
                $fullName = $r->first_name . ' ' . $r->last_name;
                if ($fullName === $business['owner_name']) {
                    $owner = $r;
                    break;
                }
            }
            
            $purok = $puroks[$business['purok_slug']] ?? null;
            
            DB::table('businesses')->insert([
                'business_name' => $business['business_name'],
                'business_type' => $business['business_type'],
                'owner_id' => $owner->id ?? null,
                'owner_name' => $business['owner_name'],
                'address' => $business['address'],
                'purok_id' => $purok->id ?? null,
                'capital_amount' => $business['capital_amount'],
                'monthly_gross' => $business['monthly_gross'],
                'employee_count' => $business['employee_count'],
                'status' => $business['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        $this->command->info('✅ Seeded ' . count($businesses) . ' businesses');
    }

    /**
     * Seed Fee Types
     */
    private function seedFeeTypes(): void
    {
        $this->command->info('Seeding fee types...');
        
        $feeTypes = [
            [
                'code' => 'FEE-CLEAR',
                'name' => 'Barangay Clearance Fee',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'all',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 1,
                'senior_discount_percentage' => 20.00,
                'has_pwd_discount' => 1,
                'pwd_discount_percentage' => 20.00,
                'frequency' => 'one_time',
            ],
            [
                'code' => 'FEE-CERT',
                'name' => 'Certificate Fee',
                'base_amount' => 50.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'all',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 1,
                'senior_discount_percentage' => 20.00,
                'has_pwd_discount' => 1,
                'pwd_discount_percentage' => 20.00,
                'frequency' => 'one_time',
            ],
            [
                'code' => 'FEE-BIZ',
                'name' => 'Business Clearance Fee',
                'base_amount' => 200.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'businesses',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 1,
                'senior_discount_percentage' => 20.00,
                'has_pwd_discount' => 1,
                'pwd_discount_percentage' => 20.00,
                'frequency' => 'one_time',
            ],
            [
                'code' => 'FEE-STALL',
                'name' => 'Market Stall Rental',
                'base_amount' => 500.00,
                'amount_type' => 'fixed',
                'applicable_to' => 'businesses',
                'effective_date' => '2024-01-01',
                'is_active' => 1,
                'is_mandatory' => 1,
                'has_senior_discount' => 0,
                'senior_discount_percentage' => 0.00,
                'has_pwd_discount' => 0,
                'pwd_discount_percentage' => 0.00,
                'frequency' => 'monthly',
            ],
        ];
        
        foreach ($feeTypes as $feeType) {
            DB::table('fee_types')->updateOrInsert(
                ['code' => $feeType['code']],
                array_merge($feeType, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($feeTypes) . ' fee types');
    }

    /**
     * Seed Discount Types
     */
    private function seedDiscountTypes(): void
    {
        $this->command->info('Seeding discount types...');
        
        $discountTypes = [
            ['code' => 'DISC-SENIOR', 'name' => 'Senior Citizen Discount', 'description' => '20% discount for senior citizens', 'default_percentage' => 20.00, 'legal_basis' => 'RA 9994', 'is_mandatory' => 1],
            ['code' => 'DISC-PWD', 'name' => 'PWD Discount', 'description' => '20% discount for persons with disability', 'default_percentage' => 20.00, 'legal_basis' => 'RA 10754', 'is_mandatory' => 1],
            ['code' => 'DISC-SOLO', 'name' => 'Solo Parent Discount', 'description' => '10% discount for solo parents', 'default_percentage' => 10.00, 'legal_basis' => 'RA 8972', 'is_mandatory' => 0],
            ['code' => 'DISC-INDIGENT', 'name' => 'Indigent Discount', 'description' => 'Full discount for indigent residents', 'default_percentage' => 100.00, 'legal_basis' => 'Barangay Ordinance', 'is_mandatory' => 0],
        ];
        
        foreach ($discountTypes as $type) {
            DB::table('discount_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'is_active' => 1,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($discountTypes) . ' discount types');
    }

    /**
     * Seed Discount Rules
     */
    private function seedDiscountRules(): void
    {
        $this->command->info('Seeding discount rules...');
        
        $discountRules = [
            ['code' => 'SR-001', 'name' => 'Senior Citizen Discount Rule', 'discount_type' => 'SENIOR', 'value_type' => 'percentage', 'discount_value' => 20.00, 'priority' => 1, 'requires_verification' => 1],
            ['code' => 'PWD-001', 'name' => 'PWD Discount Rule', 'discount_type' => 'PWD', 'value_type' => 'percentage', 'discount_value' => 20.00, 'priority' => 1, 'requires_verification' => 1],
            ['code' => 'SOLO-001', 'name' => 'Solo Parent Discount Rule', 'discount_type' => 'SOLO_PARENT', 'value_type' => 'percentage', 'discount_value' => 10.00, 'priority' => 2, 'requires_verification' => 1],
        ];
        
        foreach ($discountRules as $rule) {
            DB::table('discount_rules')->updateOrInsert(
                ['code' => $rule['code']],
                array_merge($rule, [
                    'applicable_to' => 'resident',
                    'stackable' => 0,
                    'is_active' => 1,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($discountRules) . ' discount rules');
    }

    /**
     * Seed Announcements
     */
    private function seedAnnouncements(): void
    {
        $this->command->info('Seeding announcements...');
        
        $users = DB::table('users')->get()->keyBy('username');
        $admin = $users['admin'] ?? null;
        $roles = DB::table('roles')->get()->keyBy('name');
        
        $announcements = [
            [
                'title' => 'Barangay Assembly 2024',
                'content' => 'The Barangay Assembly will be held on March 30, 2024 at 8:00 AM at the Barangay Hall. All residents are invited to attend.',
                'type' => 'event',
                'priority' => 3,
                'start_date' => '2024-03-30',
                'start_time' => '08:00:00',
                'end_date' => '2024-03-30',
                'end_time' => '12:00:00',
                'audience_type' => 'all',
                'created_by' => $admin->id ?? null,
            ],
            [
                'title' => 'Free Medical Mission',
                'content' => 'Free medical check-up and dental services on April 15, 2024 from 7:00 AM to 4:00 PM at the Barangay Health Center.',
                'type' => 'event',
                'priority' => 2,
                'start_date' => '2024-04-15',
                'start_time' => '07:00:00',
                'end_date' => '2024-04-15',
                'end_time' => '16:00:00',
                'audience_type' => 'all',
                'created_by' => $admin->id ?? null,
            ],
            [
                'title' => 'Water Interruption Advisory',
                'content' => 'There will be a water interruption on March 25, 2024 from 8:00 AM to 5:00 PM due to pipeline repair.',
                'type' => 'maintenance',
                'priority' => 4,
                'start_date' => '2024-03-25',
                'start_time' => '08:00:00',
                'end_date' => '2024-03-25',
                'end_time' => '17:00:00',
                'audience_type' => 'all',
                'created_by' => $admin->id ?? null,
            ],
            [
                'title' => 'Registration for Senior Citizens',
                'content' => 'Senior citizens are requested to update their records at the Barangay Hall from March 1-15, 2024.',
                'type' => 'important',
                'priority' => 3,
                'start_date' => '2024-03-01',
                'start_time' => '08:00:00',
                'end_date' => '2024-03-15',
                'end_time' => '17:00:00',
                'audience_type' => 'roles',
                'target_roles' => $roles['Resident'] ? json_encode([$roles['Resident']->id]) : null,
                'created_by' => $admin->id ?? null,
            ],
        ];
        
        foreach ($announcements as $announcement) {
            DB::table('announcements')->insert(array_merge($announcement, [
                'is_active' => 1,
                'updated_by' => $announcement['created_by'],
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
        
        $this->command->info('✅ Seeded ' . count($announcements) . ' announcements');
    }

    /**
     * Seed Report Types
     */
    private function seedReportTypes(): void
    {
        $this->command->info('Seeding report types...');
        
        $reportTypes = [
            ['name' => 'Noise Complaint', 'code' => 'REP-NOISE', 'category' => 'Complaint', 'subcategory' => 'Noise', 'priority_level' => 3, 'resolution_days' => 3, 'requires_immediate_action' => 0],
            ['name' => 'Waste Management Issue', 'code' => 'REP-WASTE', 'category' => 'Environmental', 'subcategory' => 'Waste', 'priority_level' => 4, 'resolution_days' => 2, 'requires_immediate_action' => 1],
            ['name' => 'Street Light Outage', 'code' => 'REP-LIGHT', 'category' => 'Infrastructure', 'subcategory' => 'Utilities', 'priority_level' => 2, 'resolution_days' => 5, 'requires_immediate_action' => 0],
            ['name' => 'Road Damage', 'code' => 'REP-ROAD', 'category' => 'Infrastructure', 'subcategory' => 'Roads', 'priority_level' => 3, 'resolution_days' => 7, 'requires_immediate_action' => 0],
            ['name' => 'Security Concern', 'code' => 'REP-SECURITY', 'category' => 'Security', 'subcategory' => 'Peace and Order', 'priority_level' => 5, 'resolution_days' => 1, 'requires_immediate_action' => 1],
        ];
        
        foreach ($reportTypes as $type) {
            DB::table('report_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'description' => $type['name'] . ' reporting form',
                    'is_active' => 1,
                    'requires_evidence' => 1,
                    'allows_anonymous' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($reportTypes) . ' report types');
    }

    /**
     * Seed Community Reports
     */
    private function seedCommunityReports(): void
    {
        $this->command->info('Seeding community reports...');
        
        $reportTypes = DB::table('report_types')->get()->keyBy('code');
        $users = DB::table('users')->get()->keyBy('username');
        $residents = DB::table('residents')->get();
        
        $reports = [
            [
                'title' => 'Excessive Noise from Karaoke',
                'description' => 'Loud karaoke past midnight disturbing the neighborhood',
                'report_type_code' => 'REP-NOISE',
                'location' => 'Purok 1',
                'incident_date' => '2024-03-20',
                'urgency_level' => 'medium',
                'affected_people' => 'community',
                'status' => 'pending',
                'reporter_username' => 'resident1',
            ],
            [
                'title' => 'Uncollected Garbage',
                'description' => 'Garbage not collected for 3 days, causing foul odor',
                'report_type_code' => 'REP-WASTE',
                'location' => 'Purok 2',
                'incident_date' => '2024-03-21',
                'urgency_level' => 'high',
                'affected_people' => 'community',
                'status' => 'in_progress',
                'reporter_username' => 'resident1',
            ],
            [
                'title' => 'Street Light Not Working',
                'description' => 'Street light at corner of Purok 3 has been out for a week',
                'report_type_code' => 'REP-LIGHT',
                'location' => 'Purok 3',
                'incident_date' => '2024-03-18',
                'urgency_level' => 'low',
                'affected_people' => 'community',
                'status' => 'resolved',
                'reporter_username' => 'resident2',
            ],
        ];
        
        foreach ($reports as $report) {
            $reportType = $reportTypes[$report['report_type_code']] ?? null;
            $user = $users[$report['reporter_username']] ?? null;
            $resident = $user ? $residents->where('user_id', $user->id)->first() : null;
            
            if ($reportType && $user && $resident) {
                DB::table('community_reports')->insert([
                    'report_type_id' => $reportType->id,
                    'report_number' => 'REP-' . strtoupper(Str::random(8)),
                    'title' => $report['title'],
                    'description' => $report['description'],
                    'location' => $report['location'],
                    'incident_date' => $report['incident_date'],
                    'urgency_level' => $report['urgency_level'],
                    'affected_people' => $report['affected_people'],
                    'status' => $report['status'],
                    'user_id' => $user->id,
                    'reporter_name' => $resident->first_name . ' ' . $resident->last_name,
                    'reporter_contact' => $resident->contact_number,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        
        $this->command->info('✅ Seeded ' . count($reports) . ' community reports');
    }

    /**
     * Seed Blotters
     */
    private function seedBlotters(): void
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

    /**
     * Seed Support Categories
     */
    private function seedSupportCategories(): void
    {
        $this->command->info('Seeding support categories...');
        
        $categories = [
            ['name' => 'Account Issues', 'slug' => 'account-issues', 'description' => 'Problems with user account or login'],
            ['name' => 'Document Request', 'slug' => 'document-request', 'description' => 'Request for barangay documents'],
            ['name' => 'Payment Issues', 'slug' => 'payment-issues', 'description' => 'Problems with payments and receipts'],
            ['name' => 'Technical Support', 'slug' => 'technical-support', 'description' => 'Technical problems with the website'],
            ['name' => 'General Inquiry', 'slug' => 'general-inquiry', 'description' => 'General questions and concerns'],
        ];
        
        foreach ($categories as $category) {
            DB::table('support_categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, [
                    'order' => 0,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($categories) . ' support categories');
    }

    /**
     * Seed Support Tickets
     */
    private function seedSupportTickets(): void
    {
        $this->command->info('Seeding support tickets...');
        
        $residents = DB::table('residents')->get();
        $categories = DB::table('support_categories')->get()->keyBy('slug');
        $user = DB::table('users')->where('username', 'resident1')->first();
        $resident = $residents->where('user_id', $user->id ?? null)->first();
        
        $tickets = [
            [
                'subject' => 'Cannot login to account',
                'category_slug' => 'account-issues',
                'message' => 'I forgot my password and cannot reset it.',
                'priority' => 'high',
            ],
            [
                'subject' => 'Request for Barangay Clearance',
                'category_slug' => 'document-request',
                'message' => 'I need a barangay clearance for employment purposes.',
                'priority' => 'medium',
            ],
            [
                'subject' => 'Payment receipt not received',
                'category_slug' => 'payment-issues',
                'message' => 'I paid my clearance fee but haven\'t received the receipt.',
                'priority' => 'medium',
            ],
        ];
        
        if ($resident) {
            foreach ($tickets as $ticket) {
                $category = $categories[$ticket['category_slug']] ?? null;
                
                if ($category) {
                    DB::table('support_tickets')->insert([
                        'resident_id' => $resident->id,
                        'ticket_number' => 'TKT-' . strtoupper(Str::random(10)),
                        'subject' => $ticket['subject'],
                        'category' => $category->name,
                        'priority' => $ticket['priority'],
                        'message' => $ticket['message'],
                        'status' => 'open',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
        
        $this->command->info('✅ Seeded ' . count($tickets) . ' support tickets');
    }

    /**
     * Seed Forms
     */
    private function seedForms(): void
    {
        $this->command->info('Seeding forms...');
        
        $users = DB::table('users')->get()->keyBy('username');
        $admin = $users['admin'] ?? null;
        
        $forms = [
            [
                'title' => 'Barangay Clearance Application Form',
                'slug' => 'barangay-clearance-application',
                'description' => 'Application form for barangay clearance',
                'file_name' => 'barangay-clearance-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Clearance',
                'is_featured' => 1,
            ],
            [
                'title' => 'Certificate of Residency Form',
                'slug' => 'certificate-of-residency',
                'description' => 'Form for requesting certificate of residency',
                'file_name' => 'certificate-residency-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Certificate',
                'is_featured' => 1,
            ],
            [
                'title' => 'Business Permit Application',
                'slug' => 'business-permit-application',
                'description' => 'Application form for business permit',
                'file_name' => 'business-permit-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Business',
                'is_featured' => 0,
            ],
            [
                'title' => 'Blotter Report Form',
                'slug' => 'blotter-report-form',
                'description' => 'Form for reporting incidents',
                'file_name' => 'blotter-report-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Blotter',
                'is_featured' => 0,
            ],
        ];
        
        foreach ($forms as $form) {
            DB::table('forms')->updateOrInsert(
                ['slug' => $form['slug']],
                array_merge($form, [
                    'file_path' => '/forms/' . $form['file_name'],
                    'is_active' => 1,
                    'is_public' => 1,
                    'download_count' => 0,
                    'created_by' => $admin->id ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($forms) . ' forms');
    }
}