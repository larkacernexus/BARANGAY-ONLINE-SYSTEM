<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Resident;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $isHouseholdHead = false;
        $residentData = null;
        $unitNumber = null;
        $purok = null;
        $residentId = null;
        
        if ($user) {
            // Get resident directly using resident_id from users table
            $resident = Resident::with(['household', 'purok'])
                ->where('id', $user->resident_id)
                ->first();
            
            if ($resident) {
                $residentId = $resident->id;
                
                $residentData = [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'middle_name' => $resident->middle_name,
                    'last_name' => $resident->last_name,
                    'suffix' => $resident->suffix,
                    'avatar' => $resident->avatar,
                    'birth_date' => $resident->birth_date?->format('Y-m-d'),
                    'gender' => $resident->gender,
                    'marital_status' => $resident->marital_status,
                    'phone_number' => $resident->phone_number,
                    'email' => $resident->email,
                ];
                
                // Check if resident is household head
                // Since user has household_id, we can check directly
                if ($user->household_id) {
                    $isHouseholdHead = HouseholdMember::where('resident_id', $resident->id)
                        ->where('household_id', $user->household_id)
                        ->where('is_head', true)
                        ->exists();
                    
                    // Get unit number from household
                    $household = Household::find($user->household_id);
                    if ($household) {
                        $unitNumber = $household->unit_number;
                    }
                }
                
                // Get purok
                if ($resident->purok) {
                    $purok = $resident->purok->name;
                }
            }
        }
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'role_id' => $user->role_id,
                    'is_admin' => $user->isAdministrator(),
                    'permissions' => $user->getPermissionNames(),
                    // Resident information
                    'resident' => $residentData,
                    'is_household_head' => $isHouseholdHead,
                    'resident_id' => $user->resident_id, // Now this comes directly from user table
                    'household_id' => $user->household_id, // Add household_id to auth data
                    'unit_number' => $unitNumber,
                    'purok' => $purok,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ]);
    }
}