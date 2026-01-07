<?php

namespace Database\Seeders;

use App\Models\Resident;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class ResidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, let's make sure the users table has resident users
        $this->createResidentUsers();
        
        // Then create resident records
        $this->createResidents();
        
        // Finally, link users to residents (if resident_profiles table exists)
        $this->linkUsersToResidents();
    }
    
    private function createResidentUsers(): void
    {
        $users = [
            [
                'name' => 'Juan Dela Cruz',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'username' => 'juandelacruz',
                'contact_number' => '09171234567',
                'position' => 'Resident',
                'department_id' => null,
                'require_password_change' => false,
                'email' => 'juan.delacruz@example.com',
                'role_id' => 0, // Resident role
                'status' => 'active',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maria Santos',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'username' => 'mariasantos',
                'contact_number' => '09172345678',
                'position' => 'Resident',
                'department_id' => null,
                'require_password_change' => false,
                'email' => 'maria.santos@example.com',
                'role_id' => 0, // Resident role
                'status' => 'active',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        
        // Check if users already exist
        foreach ($users as $userData) {
            if (!User::where('email', $userData['email'])->exists()) {
                User::create($userData);
                $this->command->info("Created user: {$userData['email']}");
            }
        }
    }
    
    private function createResidents(): void
    {
        // First, check if residents table exists
        if (!Schema::hasTable('residents')) {
            $this->command->info('Residents table does not exist. Skipping resident creation.');
            return;
        }
        
        $residents = [
            [
                'resident_id' => $this->generateResidentId(),
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'middle_name' => 'Santos',
                'suffix' => 'Jr.',
                'birth_date' => '1985-06-15',
                'age' => 39,
                'gender' => 'Male',
                'civil_status' => 'Married',
                'contact_number' => '09171234567',
                'email' => 'juan.delacruz@example.com',
                'address' => '123 Main Street, Kibawe',
                'purok' => 'Purok 1',
                'household_id' => null,
                'occupation' => 'Farmer',
                'education' => 'High School',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => false,
                'is_senior' => false,
                'place_of_birth' => 'Kibawe, Bukidnon',
                'remarks' => 'Active community member',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'resident_id' => $this->generateResidentId(),
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'middle_name' => 'Lopez',
                'suffix' => null,
                'birth_date' => '1990-03-22',
                'age' => 34,
                'gender' => 'Female',
                'civil_status' => 'Single',
                'contact_number' => '09172345678',
                'email' => 'maria.santos@example.com',
                'address' => '456 Oak Street, Kibawe',
                'purok' => 'Purok 2',
                'household_id' => null,
                'occupation' => 'Teacher',
                'education' => 'College',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => false,
                'is_senior' => false,
                'place_of_birth' => 'Cagayan de Oro',
                'remarks' => 'Local school teacher',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        
        // Check if residents already exist
        foreach ($residents as $residentData) {
            if (!Resident::where('email', $residentData['email'])->exists()) {
                try {
                    Resident::create($residentData);
                    $this->command->info("Created resident: {$residentData['email']}");
                } catch (\Exception $e) {
                    $this->command->error("Failed to create resident {$residentData['email']}: " . $e->getMessage());
                }
            } else {
                $this->command->info("Resident already exists: {$residentData['email']}");
            }
        }
    }
    
    private function linkUsersToResidents(): void
    {
        // Check if resident_profiles table exists
        if (!Schema::hasTable('resident_profiles')) {
            $this->command->info('Resident_profiles table does not exist. Skipping profile linking.');
            return;
        }
        
        // Link Juan Dela Cruz
        $juanUser = User::where('email', 'juan.delacruz@example.com')->first();
        $juanResident = Resident::where('email', 'juan.delacruz@example.com')->first();
        
        if ($juanUser && $juanResident) {
            try {
                DB::table('resident_profiles')->updateOrInsert(
                    ['user_id' => $juanUser->id],
                    [
                        'resident_id' => $juanResident->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
                $this->command->info("Linked Juan Dela Cruz user to resident profile");
            } catch (\Exception $e) {
                $this->command->error("Failed to link Juan Dela Cruz: " . $e->getMessage());
            }
        }
        
        // Link Maria Santos
        $mariaUser = User::where('email', 'maria.santos@example.com')->first();
        $mariaResident = Resident::where('email', 'maria.santos@example.com')->first();
        
        if ($mariaUser && $mariaResident) {
            try {
                DB::table('resident_profiles')->updateOrInsert(
                    ['user_id' => $mariaUser->id],
                    [
                        'resident_id' => $mariaResident->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
                $this->command->info("Linked Maria Santos user to resident profile");
            } catch (\Exception $e) {
                $this->command->error("Failed to link Maria Santos: " . $e->getMessage());
            }
        }
    }
    
    private function generateResidentId(): string
    {
        $year = date('Y');
        $month = date('m');
        $sequence = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        return "BRGY-{$year}-{$month}-{$sequence}";
    }
}