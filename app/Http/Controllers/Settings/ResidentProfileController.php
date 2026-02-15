<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ResidentProfileController extends Controller
{
    /**
     * Show the user's profile page (read-only).
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        
        // Load basic user relationships
        $user->load([
            'role',
            'currentResident',  // Changed from 'resident' to 'currentResident'
            'household'
        ]);

        $resident = $user->currentResident;  // Changed from $user->resident
        
        // If resident exists, load their relationships
        if ($resident) {
            $resident->load([
                'purok',
            ]);
            
            // Load household with members if household exists
            if ($user->household) {
                $user->household->load([
                    'purok',
                    'householdMembers.resident',
                ]);
                
                // Get head of household info
                $headOfHousehold = $user->household->head_of_household;
                
                // Get all household members
                $householdMembers = $user->household->householdMembers->map(function ($member) {
                    return [
                        'id' => $member->resident->id,
                        'full_name' => $member->resident->full_name,
                        'first_name' => $member->resident->first_name,
                        'last_name' => $member->resident->last_name,
                        'middle_name' => $member->resident->middle_name,
                        'relationship_to_head' => $member->relationship_to_head,
                        'is_head' => $member->is_head,
                    ];
                })->values();
            }
        }

        return Inertia::render('residentsettings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'username' => $user->username,
                'contact_number' => $user->contact_number,
                'position' => $user->position,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'full_name' => $user->full_name,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
                'resident' => $resident ? [
                    'id' => $resident->id,
                    'resident_id' => $resident->resident_id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                    'civil_status' => $resident->civil_status,
                    'contact_number' => $resident->contact_number,
                    'email' => $resident->email,
                    'address' => $resident->address,
                    'occupation' => $resident->occupation,
                    'education' => $resident->education,
                    'religion' => $resident->religion,
                    'is_voter' => (bool) $resident->is_voter,
                    'is_pwd' => (bool) $resident->is_pwd,
                    'is_senior' => (bool) $resident->is_senior,
                    'place_of_birth' => $resident->place_of_birth,
                    'remarks' => $resident->remarks,
                    'photo_path' => $resident->photo_path,
                    'status' => $resident->status,
                    'is_head_of_household' => $this->isHeadOfHousehold($user, $resident),
                    'purok' => $resident->purok ? [
                        'id' => $resident->purok->id,
                        'name' => $resident->purok->name,
                        'leader_name' => $resident->purok->leader_name ?? null,
                        'leader_contact' => $resident->purok->leader_contact ?? null,
                        'google_maps_url' => $resident->purok->google_maps_url ?? null,
                    ] : null,
                    'household' => $user->household ? [
                        'id' => $user->household->id,
                        'household_number' => $user->household->household_number,
                        'address' => $user->household->address,
                        'full_address' => $user->household->full_address,
                        'contact_number' => $user->household->contact_number,
                        'email' => $user->household->email,
                        'member_count' => $user->household->member_count,
                        'income_range' => $user->household->income_range,
                        'housing_type' => $user->household->housing_type,
                        'ownership_status' => $user->household->ownership_status,
                        'water_source' => $user->household->water_source,
                        'electricity' => (bool) $user->household->electricity,
                        'has_electricity' => (bool) ($user->household->has_electricity ?? $user->household->electricity),
                        'internet' => (bool) $user->household->internet,
                        'has_internet' => (bool) ($user->household->has_internet ?? $user->household->internet),
                        'vehicle' => (bool) $user->household->vehicle,
                        'has_vehicle' => (bool) ($user->household->has_vehicle ?? $user->household->vehicle),
                        'remarks' => $user->household->remarks,
                        'purok' => $user->household->purok ? [
                            'id' => $user->household->purok->id,
                            'name' => $user->household->purok->name,
                        ] : null,
                        'head_of_household' => $headOfHousehold ? [
                            'id' => $headOfHousehold->id,
                            'full_name' => $headOfHousehold->full_name,
                            'first_name' => $headOfHousehold->first_name,
                            'last_name' => $headOfHousehold->last_name,
                        ] : null,
                        'members' => $householdMembers ?? [],
                    ] : null,
                ] : null,
            ],
        ]);
    }

    /**
     * Check if user is head of household
     */
    private function isHeadOfHousehold($user, $resident): bool
    {
        if (!$user->household || !$resident) {
            return false;
        }

        $user->household->load('householdMembers');
        
        $member = $user->household->householdMembers->firstWhere('resident_id', $resident->id);
        
        return $member ? $member->is_head : false;
    }

    /**
     * Show the edit form for resident profile.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        // Load basic user relationships
        $user->load([
            'role',
            'currentResident',  // Changed from 'resident' to 'currentResident'
            'household'
        ]);

        $resident = $user->currentResident;  // Changed from $user->resident
        
        // If resident exists, load their relationships
        if ($resident) {
            $resident->load([
                'purok',
            ]);
        }

        return Inertia::render('residentsettings/profile-edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'username' => $user->username,
                'contact_number' => $user->contact_number,
                'position' => $user->position,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'full_name' => $user->full_name,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
                'resident' => $resident ? [
                    'id' => $resident->id,
                    'resident_id' => $resident->resident_id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                    'civil_status' => $resident->civil_status,
                    'contact_number' => $resident->contact_number,
                    'email' => $resident->email,
                    'address' => $resident->address,
                    'occupation' => $resident->occupation,
                    'education' => $resident->education,
                    'religion' => $resident->religion,
                    'is_voter' => (bool) $resident->is_voter,
                    'is_pwd' => (bool) $resident->is_pwd,
                    'is_senior' => (bool) $resident->is_senior,
                    'place_of_birth' => $resident->place_of_birth,
                    'remarks' => $resident->remarks,
                    'photo_path' => $resident->photo_path,
                    'status' => $resident->status,
                    'is_head_of_household' => $this->isHeadOfHousehold($user, $resident),
                    'purok' => $resident->purok ? [
                        'id' => $resident->purok->id,
                        'name' => $resident->purok->name,
                    ] : null,
                    'household' => $user->household ? [
                        'id' => $user->household->id,
                        'household_number' => $user->household->household_number,
                        'address' => $user->household->address,
                        'full_address' => $user->household->full_address,
                        'contact_number' => $user->household->contact_number,
                        'email' => $user->household->email,
                    ] : null,
                ] : null,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'contact_number' => ['nullable', 'string', 'max:20'],
        ]);

        if ($user->email !== $validated['email']) {
            $user->forceFill(['email_verified_at' => null]);
        }

        $user->forceFill([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
        ])->save();

        // Also update the resident record if it exists
        $resident = $user->currentResident;  // Changed from $user->resident
        if ($resident) {
            // Validate resident-specific fields if provided
            $residentValidated = $request->validate([
                'resident.first_name' => ['nullable', 'string', 'max:255'],
                'resident.last_name' => ['nullable', 'string', 'max:255'],
                'resident.middle_name' => ['nullable', 'string', 'max:255'],
                'resident.suffix' => ['nullable', 'string', 'max:10'],
                'resident.contact_number' => ['nullable', 'string', 'max:20'],
                'resident.email' => ['nullable', 'string', 'email', 'max:255'],
                'resident.address' => ['nullable', 'string', 'max:500'],
                'resident.occupation' => ['nullable', 'string', 'max:255'],
                'resident.education' => ['nullable', 'string', 'max:255'],
                'resident.religion' => ['nullable', 'string', 'max:255'],
                'resident.place_of_birth' => ['nullable', 'string', 'max:255'],
                'resident.remarks' => ['nullable', 'string', 'max:1000'],
            ]);

            if (!empty($residentValidated['resident'])) {
                $resident->update($residentValidated['resident']);
            }
        }

        return redirect()->route('resident.profile.show')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // If user has a resident record, we might want to handle it
        // For now, just delete the user and let cascade handle it if set up
        $user->delete();

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Send email verification notification.
     * This is the only action allowed for residents on their profile.
     */
    public function sendVerificationEmail(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('resident.profile.show')
                ->with('status', 'already-verified');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}