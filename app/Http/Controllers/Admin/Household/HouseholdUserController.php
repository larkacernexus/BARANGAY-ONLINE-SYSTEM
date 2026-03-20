<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class HouseholdUserController extends BaseHouseholdController
{
    public function changeHead(Request $request, Household $household)
    {
        $request->validate(['new_head_resident_id' => 'required|exists:residents,id']);
        
        DB::beginTransaction();
        
        try {
            $currentHead = $household->householdMembers()->where('is_head', true)->first();
            $newHeadResident = Resident::find($request->new_head_resident_id);
            $newHeadMember = $household->householdMembers()
                ->where('resident_id', $request->new_head_resident_id)
                ->first();
            
            if (!$newHeadMember) {
                throw new \Exception('Selected resident is not a member of this household.');
            }
            
            if ($currentHead) {
                $currentHead->update(['is_head' => false]);
                
                User::where('resident_id', $currentHead->resident_id)
                    ->where('household_id', $household->id)
                    ->update(['status' => 'inactive', 'household_id' => null]);
            }
            
            $newHeadMember->update(['is_head' => true, 'relationship_to_head' => 'Head']);
            
            $credentials = $this->createUserForHouseholdHead(
                $household, $newHeadResident, 
                new Request(['contact_number' => $household->contact_number, 'email' => $household->email])
            );
            
            if ($credentials) {
                session()->flash('user_credentials', $credentials);
            }
            
            DB::commit();
            
            return redirect()->back()->with('success', 'Household head changed successfully!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Change head failed: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Error changing head: ' . $e->getMessage());
        }
    }
    
    public function createUserAccount(Household $household)
    {
        DB::beginTransaction();
        
        try {
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            
            if (!$headMember) {
                return redirect()->back()->with('error', 'Household does not have a head member.');
            }
            
            $headResident = $headMember->resident;
            
            $existing = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            
            if ($existing) {
                return redirect()->back()->with('info', 'Household head already has a user account.');
            }
            
            $credentials = $this->createUserForHouseholdHead(
                $household, $headResident,
                new Request(['contact_number' => $household->contact_number, 'email' => $household->email])
            );
            
            if ($credentials) {
                DB::commit();
                session()->flash('user_credentials', $credentials);
                
                return redirect()->back()->with('success', 'User account created successfully!');
            }
            
            throw new \Exception('Failed to create user account.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create user failed: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Error creating user account: ' . $e->getMessage());
        }
    }
    
    public function resetUserPassword(Household $household)
    {
        DB::beginTransaction();
        
        try {
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            
            if (!$headMember) {
                return redirect()->back()->with('error', 'Household does not have a head member.');
            }
            
            $user = User::where('resident_id', $headMember->resident_id)
                ->where('household_id', $household->id)
                ->first();
            
            if (!$user) {
                return redirect()->back()->with('error', 'Household head does not have a user account.');
            }
            
            $newPassword = $household->contact_number ?: \Illuminate\Support\Str::password(12);
            
            $user->update([
                'password' => Hash::make($newPassword),
                'require_password_change' => true,
                'password_changed_at' => null,
            ]);
            
            DB::commit();
            
            session()->flash('user_credentials', [
                'username' => $user->username,
                'password' => $newPassword,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
            ]);
            
            return redirect()->back()->with('success', 'Password reset successfully!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reset password failed: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Error resetting password: ' . $e->getMessage());
        }
    }
}