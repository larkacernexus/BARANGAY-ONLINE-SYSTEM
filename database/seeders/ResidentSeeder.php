<?php

namespace Database\Seeders;

use App\Models\Resident;
use App\Models\User;
use App\Models\Purok;
use App\Models\Household;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class ResidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get puroks for reference
        $puroks = Purok::all();
        
        if ($puroks->isEmpty()) {
            $this->command->warn('⚠️  No puroks found. Please run PurokSeeder first.');
            return;
        }

        // First, create residents
        $this->createResidents($puroks);
        
        // Then link residents to users (if applicable)
        $this->linkResidentsToUsers();
    }
    
    private function createResidents($puroks): void
    {
        // Check if residents table exists
        if (!Schema::hasTable('residents')) {
            $this->command->info('Residents table does not exist. Skipping resident creation.');
            return;
        }

        $households = Household::all();
        
        $residents = [
            [
                'resident_id' => $this->generateResidentId(),
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'middle_name' => 'Santos',
                'suffix' => 'Jr.',
                'birth_date' => '1985-06-15',
                'gender' => 'male',
                'civil_status' => 'Married',
                'contact_number' => '09171234567',
                'email' => 'juan.delacruz@example.com',
                'address' => '123 Main Street',
                'purok_id' => $puroks->first()?->id,
                'household_id' => $households->first()?->id,
                'occupation' => 'Farmer',
                'education' => 'High School Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => false,
                'is_senior' => false,
                'is_solo_parent' => false,
                'is_indigent' => false,
                'place_of_birth' => 'Kibawe, Bukidnon',
                'remarks' => 'Active community member',
                'status' => 'active',
                'senior_id_number' => null,
                'pwd_id_number' => null,
                'solo_parent_id_number' => null,
                'indigent_id_number' => null,
                'discount_eligibilities' => json_encode([]),
                'photo_path' => null,
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
                'gender' => 'female',
                'civil_status' => 'Single',
                'contact_number' => '09172345678',
                'email' => 'maria.santos@example.com',
                'address' => '456 Oak Street',
                'purok_id' => $puroks->skip(1)->first()?->id,
                'household_id' => $households->skip(1)->first()?->id,
                'occupation' => 'Teacher',
                'education' => 'College Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => false,
                'is_senior' => false,
                'is_solo_parent' => false,
                'is_indigent' => false,
                'place_of_birth' => 'Cagayan de Oro City',
                'remarks' => 'Local school teacher',
                'status' => 'active',
                'senior_id_number' => null,
                'pwd_id_number' => null,
                'solo_parent_id_number' => null,
                'indigent_id_number' => null,
                'discount_eligibilities' => json_encode([]),
                'photo_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Senior Citizen
            [
                'resident_id' => $this->generateResidentId(),
                'first_name' => 'Pedro',
                'last_name' => 'Reyes',
                'middle_name' => 'Gonzales',
                'suffix' => null,
                'birth_date' => '1950-12-10',
                'gender' => 'male',
                'civil_status' => 'Widowed',
                'contact_number' => '09173456789',
                'email' => 'pedro.reyes@example.com',
                'address' => '789 Pine Street',
                'purok_id' => $puroks->skip(2)->first()?->id,
                'household_id' => $households->skip(2)->first()?->id,
                'occupation' => 'Retired',
                'education' => 'Elementary Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => false,
                'is_senior' => true,
                'is_solo_parent' => false,
                'is_indigent' => true,
                'place_of_birth' => 'Kibawe, Bukidnon',
                'remarks' => 'Senior citizen, needs assistance',
                'status' => 'active',
                'senior_id_number' => 'OSCA-' . rand(10000, 99999),
                'pwd_id_number' => null,
                'solo_parent_id_number' => null,
                'indigent_id_number' => 'IND-' . rand(10000, 99999),
                'discount_eligibilities' => json_encode(['senior', 'indigent']),
                'photo_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // PWD
            [
                'resident_id' => $this->generateResidentId(),
                'first_name' => 'Ana',
                'last_name' => 'Fernandez',
                'middle_name' => 'Villanueva',
                'suffix' => null,
                'birth_date' => '1988-07-19',
                'gender' => 'female',
                'civil_status' => 'Single',
                'contact_number' => '09174567890',
                'email' => 'ana.fernandez@example.com',
                'address' => '321 Acacia Street',
                'purok_id' => $puroks->skip(3)->first()?->id,
                'household_id' => $households->skip(3)->first()?->id,
                'occupation' => 'Self-employed',
                'education' => 'College Level',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => true,
                'is_senior' => false,
                'is_solo_parent' => false,
                'is_indigent' => false,
                'place_of_birth' => 'Bukidnon',
                'remarks' => 'PWD member',
                'status' => 'active',
                'senior_id_number' => null,
                'pwd_id_number' => 'PWD-' . rand(10000, 99999),
                'solo_parent_id_number' => null,
                'indigent_id_number' => null,
                'discount_eligibilities' => json_encode(['pwd']),
                'photo_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Solo Parent
            [
                'resident_id' => $this->generateResidentId(),
                'first_name' => 'Luz',
                'last_name' => 'Villanueva',
                'middle_name' => 'Mercado',
                'suffix' => null,
                'birth_date' => '1982-09-14',
                'gender' => 'female',
                'civil_status' => 'Single Parent',
                'contact_number' => '09175678901',
                'email' => 'luz.villanueva@example.com',
                'address' => '654 Bamboo Street',
                'purok_id' => $puroks->skip(4)->first()?->id,
                'household_id' => $households->skip(4)->first()?->id,
                'occupation' => 'Market Vendor',
                'education' => 'High School Graduate',
                'religion' => 'Roman Catholic',
                'is_voter' => true,
                'is_pwd' => false,
                'is_senior' => false,
                'is_solo_parent' => true,
                'is_indigent' => true,
                'place_of_birth' => 'Kibawe, Bukidnon',
                'remarks' => 'Solo parent with 2 children',
                'status' => 'active',
                'senior_id_number' => null,
                'pwd_id_number' => null,
                'solo_parent_id_number' => 'SP-' . rand(10000, 99999),
                'indigent_id_number' => 'IND-' . rand(10000, 99999),
                'discount_eligibilities' => json_encode(['solo_parent', 'indigent']),
                'photo_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $createdCount = 0;
        $updatedCount = 0;

        // Check if residents already exist
        foreach ($residents as $residentData) {
            // Calculate age from birth_date
            $birthDate = Carbon::parse($residentData['birth_date']);
            $residentData['age'] = $birthDate->age;

            $existingResident = Resident::where('email', $residentData['email'])->first();
            
            if ($existingResident) {
                $existingResident->update($residentData);
                $updatedCount++;
                $this->command->info("Updated resident: {$residentData['email']}");
            } else {
                try {
                    Resident::create($residentData);
                    $createdCount++;
                    $this->command->info("Created resident: {$residentData['email']}");
                } catch (\Exception $e) {
                    $this->command->error("Failed to create resident {$residentData['email']}: " . $e->getMessage());
                }
            }
        }

        $this->command->info("✅ Residents seeded: {$createdCount} created, {$updatedCount} updated");
    }
    
    private function linkResidentsToUsers(): void
    {
        // Check if resident_profiles table exists
        if (!Schema::hasTable('resident_profiles')) {
            $this->command->info('Resident_profiles table does not exist. Skipping profile linking.');
            return;
        }

        // Check if users table has the required columns
        if (!Schema::hasColumns('users', ['first_name', 'last_name', 'email'])) {
            $this->command->info('Users table missing required columns. Skipping user linking.');
            return;
        }

        // Get all users with email addresses
        $users = User::whereNotNull('email')->get();
        
        $linkedCount = 0;

        foreach ($users as $user) {
            // Try to find matching resident by email
            $resident = Resident::where('email', $user->email)->first();
            
            // If not found by email, try by name
            if (!$resident && $user->first_name && $user->last_name) {
                $resident = Resident::where('first_name', $user->first_name)
                    ->where('last_name', $user->last_name)
                    ->first();
            }

            if ($resident) {
                try {
                    // Update user with resident_id
                    $user->update(['resident_id' => $resident->id]);
                    
                    // Create resident profile link
                    DB::table('resident_profiles')->updateOrInsert(
                        [
                            'user_id' => $user->id,
                            'resident_id' => $resident->id,
                        ],
                        [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                    
                    $linkedCount++;
                    $this->command->info("✅ Linked user {$user->email} to resident {$resident->full_name}");
                } catch (\Exception $e) {
                    $this->command->error("Failed to link user {$user->email}: " . $e->getMessage());
                }
            }
        }

        $this->command->info("✅ Linked {$linkedCount} users to residents");
    }
    
    private function generateResidentId(): string
    {
        $year = date('Y');
        $month = date('m');
        $sequence = str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
        
        return "RES-{$year}-{$month}-{$sequence}";
    }
}