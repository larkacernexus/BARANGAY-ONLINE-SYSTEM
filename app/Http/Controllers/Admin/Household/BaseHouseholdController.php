<?php

namespace App\Http\Controllers\Admin\Household;

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
    protected function createUserForHouseholdHead(Household $household, Resident $headResident, Request $request)
    {
        try {
            // Check existing user
            $existingUser = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            
            if ($existingUser) {
                $existingUser->update([
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email ?? $headResident->email,
                    'status' => 'active',
                ]);
                
                return [
                    'username' => $existingUser->username,
                    'password' => 'Already exists',
                    'name' => $existingUser->first_name . ' ' . $existingUser->last_name,
                    'email' => $existingUser->email,
                    'user_id' => $existingUser->id,
                ];
            }
            
            // Check resident's existing account
            $existingUserForResident = User::where('resident_id', $headResident->id)->first();
            if ($existingUserForResident) {
                $existingUserForResident->update([
                    'household_id' => $household->id,
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email ?? $headResident->email,
                ]);
                
                return [
                    'username' => $existingUserForResident->username,
                    'password' => 'Use existing password',
                    'name' => $existingUserForResident->first_name . ' ' . $existingUserForResident->last_name,
                    'email' => $existingUserForResident->email,
                    'user_id' => $existingUserForResident->id,
                ];
            }
            
            // Create new user
            $baseUsername = strtolower(str_replace(['-', ' ', 'HH'], ['', '', 'hh'], $household->household_number));
            $username = $baseUsername;
            $counter = 1;
            
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }
            
            $initialPassword = $request->contact_number ?: \Illuminate\Support\Str::password(12);
            
            $householdRole = Role::firstOrCreate(
                ['name' => 'Household Head'],
                ['guard_name' => 'web', 'description' => 'Head of household with limited access']
            );
            
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
            
            return [
                'username' => $username,
                'password' => $initialPassword,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'user_id' => $user->id,
                'household_number' => $household->household_number,
                'resident_id' => $headResident->id,
            ];
            
        } catch (\Exception $e) {
            Log::error('Error creating user account: ' . $e->getMessage());
            return null;
        }
    }

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
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'photo_url' => $resident->photo_url,
        ];
    }
}