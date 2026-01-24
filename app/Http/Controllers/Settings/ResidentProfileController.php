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
            'department',
            'role'
        ]);

        // Find the resident record for this user
        $resident = Resident::where('user_id', $user->id)->first();
        
        // If resident exists, load their relationships
        if ($resident) {
            $resident->load([
                'household',
                'household.purok',
                'household.householdMembers.resident',
                'purok',
            ]);
            
            // Get head of household info
            $headOfHousehold = $resident->household ? $resident->household->head_of_household : null;
            
            // Get all household members
            $householdMembers = $resident->household ? $resident->household->householdMembers->map(function ($member) {
                return [
                    'id' => $member->resident->id,
                    'full_name' => $member->resident->full_name,
                    'first_name' => $member->resident->first_name,
                    'last_name' => $member->resident->last_name,
                    'middle_name' => $member->resident->middle_name,
                    'relationship_to_head' => $member->relationship_to_head,
                    'is_head' => $member->is_head,
                ];
            }) : collect();
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
                'department' => $user->department ? [
                    'id' => $user->department->id,
                    'name' => $user->department->name,
                ] : null,
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
                    'is_head_of_household' => $resident->isHeadOfHousehold(),
                    'purok' => $resident->purok ? [
                        'id' => $resident->purok->id,
                        'name' => $resident->purok->name,
                        'leader_name' => $resident->purok->leader_name ?? null,
                        'leader_contact' => $resident->purok->leader_contact ?? null,
                        'google_maps_url' => $resident->purok->google_maps_url ?? null,
                    ] : null,
                    'household' => $resident->household ? [
                        'id' => $resident->household->id,
                        'household_number' => $resident->household->household_number,
                        'address' => $resident->household->address,
                        'full_address' => $resident->household->full_address,
                        'contact_number' => $resident->household->contact_number,
                        'email' => $resident->household->email,
                        'member_count' => $resident->household->member_count,
                        'income_range' => $resident->household->income_range,
                        'housing_type' => $resident->household->housing_type,
                        'ownership_status' => $resident->household->ownership_status,
                        'water_source' => $resident->household->water_source,
                        'electricity' => (bool) $resident->household->electricity,
                        'has_electricity' => (bool) ($resident->household->has_electricity ?? $resident->household->electricity),
                        'internet' => (bool) $resident->household->internet,
                        'has_internet' => (bool) ($resident->household->has_internet ?? $resident->household->internet),
                        'vehicle' => (bool) $resident->household->vehicle,
                        'has_vehicle' => (bool) ($resident->household->has_vehicle ?? $resident->household->vehicle),
                        'remarks' => $resident->household->remarks,
                        'purok' => $resident->household->purok ? [
                            'id' => $resident->household->purok->id,
                            'name' => $resident->household->purok->name,
                        ] : null,
                        'head_of_household' => $headOfHousehold ? [
                            'id' => $headOfHousehold->id,
                            'full_name' => $headOfHousehold->full_name,
                            'first_name' => $headOfHousehold->first_name,
                            'last_name' => $headOfHousehold->last_name,
                        ] : null,
                        'members' => $householdMembers->toArray(),
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

        Auth::logout();

        $user->delete();

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