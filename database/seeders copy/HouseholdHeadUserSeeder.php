<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HouseholdHeadUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the Household Head role ID
        $householdHeadRole = Role::where('name', 'Household Head')->first();
        
        if (!$householdHeadRole) {
            $this->command->warn('⚠️  Household Head role not found. Please run RoleSeeder first.');
            return;
        }

        // Get all households that don't have a user account yet
        $households = Household::whereNull('user_id')->get();
        
        $this->command->info('📋 Found ' . $households->count() . ' households without user accounts');

        $createdCount = 0;
        $skippedCount = 0;

        foreach ($households as $household) {
            // Find the head of household resident
            $headResident = Resident::whereHas('householdMemberships', function ($query) use ($household) {
                $query->where('household_id', $household->id)
                      ->where('is_head', true);
            })->first();

            if (!$headResident) {
                // If no designated head, use the first adult member
                $headResident = Resident::where('household_id', $household->id)
                    ->where('age', '>=', 18)
                    ->orderBy('age', 'desc')
                    ->first();
            }

            if (!$headResident) {
                $this->command->warn("⚠️  No suitable head found for household {$household->household_number}, skipping...");
                $skippedCount++;
                continue;
            }

            // Check if user already exists for this resident
            $existingUser = User::where('email', $headResident->email)
                ->orWhere('username', $this->generateUsername($headResident))
                ->first();

            if ($existingUser) {
                $this->command->warn("⚠️  User already exists for {$headResident->full_name}, skipping...");
                $skippedCount++;
                continue;
            }

            // Generate username
            $username = $this->generateUsername($headResident);
            
            // Generate email if resident doesn't have one
            $email = $headResident->email ?? $username . '@household.local';

            try {
                // Create user account (without position field)
                $user = User::create([
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'username' => $username,
                    'email' => $email,
                    'contact_number' => $headResident->contact_number ?? $household->contact_number,
                    // 'position' => null, // Don't include position at all
                    'role_id' => $householdHeadRole->id,
                    'status' => 'active',
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                    'require_password_change' => true,
                    'household_id' => $household->id,
                    'current_resident_id' => $headResident->id,
                    'resident_id' => $headResident->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Update household with user_id
                $household->update(['user_id' => $user->id]);

                $this->command->info("✅ Created user account for {$headResident->full_name} (Household: {$household->household_number})");
                $createdCount++;

            } catch (\Exception $e) {
                $this->command->error("❌ Failed to create user for {$headResident->full_name}: " . $e->getMessage());
                $skippedCount++;
            }
        }

        // Summary
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('📊 HOUSEHOLD HEAD USER CREATION SUMMARY');
        $this->command->info('========================================');
        $this->command->info("✅ Created: {$createdCount} user accounts");
        $this->command->info("⚠️  Skipped: {$skippedCount} households");
        $this->command->info('========================================');
    }

    /**
     * Generate a unique username from resident name
     */
    private function generateUsername(Resident $resident): string
    {
        $base = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $resident->first_name . '.' . $resident->last_name));
        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }
}