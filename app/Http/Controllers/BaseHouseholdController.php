<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\Resident;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

abstract class BaseHouseholdController extends Controller
{
    /**
     * Create user account for HOUSEHOLD HEAD (resident-based)
     */
    protected function createUserForHouseholdHead(Household $household, Resident $headResident, Request $request)
    {
        try {
            // Check if there's already a user account for this household head
            $existingUser = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            
            if ($existingUser) {
                // Update user details
                $existingUser->update([
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email ?? $headResident->email,
                    'status' => 'active',
                ]);
                
                Log::info('Household head already has user account', [
                    'household_id' => $household->id,
                    'resident_id' => $headResident->id,
                    'user_id' => $existingUser->id,
                ]);
                
                return [
                    'username' => $existingUser->username,
                    'password' => 'Already exists',
                    'name' => $existingUser->first_name . ' ' . $existingUser->last_name,
                    'email' => $existingUser->email,
                    'user_id' => $existingUser->id,
                ];
            }
            
            // Check if this resident already has a user account for another household
            $existingUserForResident = User::where('resident_id', $headResident->id)->first();
            if ($existingUserForResident) {
                // Update existing user to link to this household
                $existingUserForResident->update([
                    'household_id' => $household->id,
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email ?? $headResident->email,
                ]);
                
                Log::info('Updated existing user account for household head', [
                    'household_id' => $household->id,
                    'resident_id' => $headResident->id,
                    'user_id' => $existingUserForResident->id,
                ]);
                
                return [
                    'username' => $existingUserForResident->username,
                    'password' => 'Use existing password',
                    'name' => $existingUserForResident->first_name . ' ' . $existingUserForResident->last_name,
                    'email' => $existingUserForResident->email,
                    'user_id' => $existingUserForResident->id,
                ];
            }
            
            // Generate username based on household number and head's name
            $baseUsername = strtolower(str_replace(['-', ' ', 'HH'], ['', '', 'hh'], $household->household_number));
            $username = $baseUsername;
            $counter = 1;
            
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }
            
            // Generate initial password - FULL contact number
            $initialPassword = $request->contact_number;
            
            if (!$initialPassword) {
                $initialPassword = \Illuminate\Support\Str::password(12);
            }
            
            // Get household head role
            $householdRole = Role::where('name', 'Household Head')->first();
            
            if (!$householdRole) {
                $householdRole = Role::create([
                    'name' => 'Household Head',
                    'guard_name' => 'web',
                    'description' => 'Head of household with limited access'
                ]);
            }
            
            // Create user account for HOUSEHOLD HEAD
            $user = User::create([
                'first_name' => $headResident->first_name,
                'last_name' => $headResident->last_name,
                'username' => $username,
                'contact_number' => $request->contact_number,
                'email' => $request->email ?? ($headResident->first_name . '.' . $headResident->last_name . '@example.com'),
                'password' => Hash::make($initialPassword),
                'position' => 'Household Head',
                'role_id' => $householdRole->id,
                'resident_id' => $headResident->id,
                'household_id' => $household->id,
                'status' => 'active',
                'require_password_change' => true,
                'password_changed_at' => null,
                'email_verified_at' => now(),
            ]);
            
            $credentials = [
                'username' => $username,
                'password' => $initialPassword,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'user_id' => $user->id,
                'household_number' => $household->household_number,
                'resident_id' => $headResident->id,
            ];
            
            Log::info('User account created for household head', [
                'household_id' => $household->id,
                'resident_id' => $headResident->id,
                'user_id' => $user->id,
            ]);
            
            return $credentials;
            
        } catch (\Exception $e) {
            Log::error('Error creating user account for household head', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'household_id' => $household->id,
                'resident_id' => $headResident->id,
            ]);
            
            return null;
        }
    }

    /**
     * Generate household number
     */
    protected function generateHouseholdNumber($customNumber = null)
    {
        if ($customNumber) {
            return $customNumber;
        }
        
        $year = date('Y');
        $lastHousehold = Household::where('household_number', 'like', "HH-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastHousehold) {
            $lastNumber = (int) substr($lastHousehold->household_number, -5);
            $newNumber = str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '00001';
        }
        
        return "HH-{$year}-{$newNumber}";
    }

    /**
     * Get resident base data without privileges
     */
    protected function getResidentBaseData(Resident $resident): array
    {
        return [
            'id' => $resident->id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'full_name' => $resident->full_name,
            'age' => (int) $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'occupation' => $resident->occupation,
            'education' => $resident->education,
            'religion' => $resident->religion,
            'is_voter' => (bool) $resident->is_voter,
            'place_of_birth' => $resident->place_of_birth,
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'photo_path' => $resident->photo_path,
            'photo_url' => $resident->photo_url,
            'has_photo' => $resident->has_photo,
        ];
    }

    /**
     * Format privilege data
     */
    protected function formatPrivilegeData($residentPrivilege): array
    {
        $privilege = $residentPrivilege->privilege;
        return [
            'id' => $residentPrivilege->id,
            'privilege_id' => $privilege->id,
            'code' => $privilege->code,
            'name' => $privilege->name,
            'description' => $privilege->description,
            'id_number' => $residentPrivilege->id_number,
            'discount_percentage' => $residentPrivilege->discount_percentage ?? $privilege->default_discount_percentage,
            'verified_at' => $residentPrivilege->verified_at?->toISOString(),
            'expires_at' => $residentPrivilege->expires_at?->toISOString(),
            'is_active' => true,
        ];
    }

    /**
     * Process resident privileges
     */
    protected function processResidentPrivileges(Resident $resident, \Illuminate\Support\Collection $activePrivileges): array
    {
        $activePrivilegesData = $resident->residentPrivileges
            ->filter(fn($rp) => $rp->isActive())
            ->map(fn($rp) => $this->formatPrivilegeData($rp))
            ->values()
            ->toArray();

        $privilegeFlags = [];
        $privilegeIdNumbers = [];
        
        foreach ($activePrivilegesData as $priv) {
            $code = strtolower($priv['code']);
            $privilegeFlags["is_{$code}"] = true;
            $privilegeFlags["has_{$code}"] = true;
            
            if (!empty($priv['id_number'])) {
                $privilegeIdNumbers["{$code}_id_number"] = $priv['id_number'];
            }
        }

        // Ensure all active privileges have false flags by default
        foreach ($activePrivileges as $privilege) {
            $code = strtolower($privilege->code);
            if (!isset($privilegeFlags["is_{$code}"])) {
                $privilegeFlags["is_{$code}"] = false;
                $privilegeFlags["has_{$code}"] = false;
            }
        }

        return [
            'data' => $activePrivilegesData,
            'flags' => $privilegeFlags,
            'idNumbers' => $privilegeIdNumbers,
        ];
    }
}