<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Privilege;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;

class ResidentProfileController extends Controller
{
    /**
     * Get all active privileges - DYNAMIC FROM DATABASE
     */
    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges', 3600, function () {
            return Privilege::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description'])
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'code' => $p->code,
                    'description' => $p->description,
                ])
                ->toArray();
        });
    }

    /**
     * Get resident's active privileges - DYNAMIC
     */
    private function getResidentPrivileges(Resident $resident): array
    {
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege');
        }

        return $resident->residentPrivileges
            ->filter(fn($rp) => $rp->isActive())
            ->map(fn($rp) => [
                'id' => $rp->id,
                'privilege_id' => $rp->privilege->id,
                'code' => $rp->privilege->code,
                'name' => $rp->privilege->name,
                'id_number' => $rp->id_number,
                'verified_at' => $rp->verified_at?->toISOString(),
                'expires_at' => $rp->expires_at?->toISOString(),
            ])
            ->values()
            ->toArray();
    }

    /**
     * Show the user's profile page (read-only).
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $allPrivileges = $this->getAllPrivileges();
        
        Log::info('Resident profile viewed', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip()
        ]);
        
        $user->load(['role', 'currentResident', 'household']);

        $resident = $user->currentResident;
        
        Log::debug('Resident data loaded', [
            'user_id' => $user->id,
            'has_resident' => !is_null($resident),
            'has_household' => !is_null($user->household)
        ]);
        
        if ($resident) {
            $resident->load(['purok', 'residentPrivileges.privilege']);
            
            if ($user->household) {
                $user->household->load([
                    'purok',
                    'householdMembers.resident.residentPrivileges.privilege',
                ]);
                
                $headOfHousehold = $user->household->head_of_household;
                
                $householdMembers = $user->household->householdMembers
                    ->map(function ($member) use ($allPrivileges) {
                        $resident = $member->resident;
                        if (!$resident) return null;
                        
                        $resident->loadMissing(['purok', 'residentPrivileges.privilege']);
                        $memberPrivileges = $this->getResidentPrivileges($resident);
                        
                        $memberData = [
                            'id' => $resident->id,
                            'resident_id' => $resident->resident_id,
                            'full_name' => $resident->full_name,
                            'first_name' => $resident->first_name,
                            'last_name' => $resident->last_name,
                            'middle_name' => $resident->middle_name,
                            'suffix' => $resident->suffix,
                            'birth_date' => $resident->birth_date?->format('Y-m-d'),
                            'age' => $resident->age,
                            'gender' => $resident->gender,
                            'civil_status' => $resident->civil_status,
                            'place_of_birth' => $resident->place_of_birth,
                            'religion' => $resident->religion,
                            'contact_number' => $resident->contact_number,
                            'email' => $resident->email,
                            'address' => $resident->address,
                            'occupation' => $resident->occupation,
                            'education' => $resident->education,
                            'is_voter' => (bool) $resident->is_voter,
                            'status' => $resident->status,
                            'remarks' => $resident->remarks,
                            'photo_path' => $resident->photo_path,
                            'photo_url' => $resident->photo_url,
                            'purok' => $resident->purok ? [
                                'id' => $resident->purok->id,
                                'name' => $resident->purok->name,
                            ] : null,
                            'relationship_to_head' => $member->relationship_to_head,
                            'is_head' => (bool) $member->is_head,
                            'joined_at' => $member->created_at?->format('Y-m-d'),
                            'membership' => [
                                'id' => $member->id,
                                'household_id' => $member->household_id,
                                'resident_id' => $member->resident_id,
                                'relationship_to_head' => $member->relationship_to_head,
                                'is_head' => (bool) $member->is_head,
                                'joined_at' => $member->created_at?->format('Y-m-d'),
                            ],
                            
                            // DYNAMIC privilege data
                            'privileges' => $memberPrivileges,
                            'privileges_count' => count($memberPrivileges),
                            'has_privileges' => count($memberPrivileges) > 0,
                            'discount_eligibilities' => $memberPrivileges,
                        ];

                        // DYNAMIC flags for each privilege
                        foreach ($memberPrivileges as $priv) {
                            $code = strtolower($priv['code']);
                            $memberData["is_{$code}"] = true;
                            $memberData["has_{$code}"] = true;
                            $memberData["{$code}_id_number"] = $priv['id_number'];
                        }

                        return $memberData;
                    })
                    ->filter()
                    ->values();
                
                Log::debug('Household data loaded', [
                    'user_id' => $user->id,
                    'household_id' => $user->household->id,
                    'member_count' => $householdMembers->count()
                ]);
            }
        }

        // QR code handling (unchanged)
        $qrCodeUrl = $this->getQrCodeUrl($user);

        return Inertia::render('residentsettings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'allPrivileges' => $allPrivileges,
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
                
                'qr_login_token' => $user->login_qr_code,
                'qr_code_url' => $qrCodeUrl,
                
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
                
                'resident' => $resident ? $this->formatResidentData($resident, $user, $allPrivileges, $householdMembers ?? collect([])) : null,
            ],
        ]);
    }

    /**
     * Format resident data with dynamic privileges
     */
    private function formatResidentData($resident, $user, array $allPrivileges, $householdMembers): array
    {
        $activePrivileges = $this->getResidentPrivileges($resident);
        
        $data = [
            'id' => $resident->id,
            'resident_id' => $resident->resident_id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'birth_date' => $resident->birth_date?->format('Y-m-d'),
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
            'place_of_birth' => $resident->place_of_birth,
            'remarks' => $resident->remarks,
            'photo_path' => $resident->photo_path,
            'photo_url' => $resident->photo_url,
            'status' => $resident->status,
            
            // DYNAMIC privilege data
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
            'discount_eligibilities' => $activePrivileges,
            
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
                'head_of_household' => $user->household->head_of_household ? [
                    'id' => $user->household->head_of_household->id,
                    'full_name' => $user->household->head_of_household->full_name,
                    'first_name' => $user->household->head_of_household->first_name,
                    'last_name' => $user->household->head_of_household->last_name,
                ] : null,
                'members' => $householdMembers,
            ] : null,
        ];

        // DYNAMIC flags for each privilege
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $data["is_{$code}"] = true;
            $data["has_{$code}"] = true;
            $data["{$code}_id_number"] = $priv['id_number'];
        }

        return $data;
    }

    /**
     * Get QR code URL
     */
    private function getQrCodeUrl($user): ?string
    {
        if (!$user->qr_code_url) {
            Log::info('No QR code found for user', [
                'user_id' => $user->id,
                'qr_code_url_field' => $user->qr_code_url,
                'login_qr_code_field' => $user->login_qr_code ? 'exists' : 'null'
            ]);
            return null;
        }

        // If it's already a full URL, extract filename
        if (filter_var($user->qr_code_url, FILTER_VALIDATE_URL)) {
            $path = parse_url($user->qr_code_url, PHP_URL_PATH);
            $filename = basename($path);
            $qrCodeUrl = '/storage/qr-codes/' . $filename;
        } 
        // If it's a path with storage/ prefix, clean it
        elseif (str_contains($user->qr_code_url, 'storage/')) {
            $filename = basename($user->qr_code_url);
            $qrCodeUrl = '/storage/qr-codes/' . $filename;
        }
        // If it's already the correct relative path
        elseif (str_starts_with($user->qr_code_url, 'qr-codes/')) {
            $qrCodeUrl = '/storage/' . $user->qr_code_url;
        }
        // Fallback
        else {
            $qrCodeUrl = '/storage/' . $user->qr_code_url;
        }

        Log::info('QR code data fetched for user', [
            'user_id' => $user->id,
            'qr_code_exists' => true,
            'qr_code_url' => $qrCodeUrl,
            'original_path' => $user->qr_code_url,
            'qr_login_token_exists' => !is_null($user->login_qr_code),
            'qr_login_expires_at' => $user->login_qr_code_expires_at,
        ]);

        return $qrCodeUrl;
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
        $allPrivileges = $this->getAllPrivileges();
        
        Log::info('Resident profile edit form viewed', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);
        
        $user->load(['role', 'currentResident', 'household']);
        $resident = $user->currentResident;
        
        if ($resident) {
            $resident->load(['purok', 'residentPrivileges.privilege']);
        }

        $qrCodeUrl = $this->getQrCodeUrl($user);

        return Inertia::render('residentsettings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'allPrivileges' => $allPrivileges,
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
                
                'qr_login_token' => $user->login_qr_code,
                'qr_code_url' => $qrCodeUrl,
                
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
                    'birth_date' => $resident->birth_date?->format('Y-m-d'),
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
                    'place_of_birth' => $resident->place_of_birth,
                    'remarks' => $resident->remarks,
                    'photo_path' => $resident->photo_path,
                    'status' => $resident->status,
                    
                    // DYNAMIC privilege data
                    'privileges' => $this->getResidentPrivileges($resident),
                    'privileges_count' => $resident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count(),
                    'has_privileges' => $resident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count() > 0,
                    
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

        Log::info('Profile update initiated', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'contact_number' => ['nullable', 'string', 'max:20'],
        ]);

        if ($user->email !== $validated['email']) {
            Log::info('Email changed, resetting verification', [
                'user_id' => $user->id,
                'old_email' => $user->email,
                'new_email' => $validated['email']
            ]);
            $user->forceFill(['email_verified_at' => null]);
        }

        $user->forceFill([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
        ])->save();

        // Also update the resident record if it exists
        $resident = $user->currentResident;
        if ($resident) {
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
                Log::info('Resident record updated', [
                    'user_id' => $user->id,
                    'resident_id' => $resident->id
                ]);
            }
        }

        Log::info('Profile updated successfully', ['user_id' => $user->id]);

        return redirect()->route('portal.profile.show')->with('status', 'profile-updated');
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

        Log::warning('Account deletion initiated', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip()
        ]);

        if ($user->qr_code_url) {
            Log::info('Deleting QR code image during account deletion', [
                'user_id' => $user->id,
                'qr_code_path' => $user->qr_code_url
            ]);
            Storage::disk('public')->delete($user->qr_code_url);
        }

        $user->delete();

        Log::info('Account deleted successfully', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Send email verification notification.
     */
    public function sendVerificationEmail(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            Log::info('Email already verified', ['user_id' => $user->id]);
            return redirect()->route('portal.profile.show')
                ->with('status', 'already-verified');
        }

        $user->sendEmailVerificationNotification();
        
        Log::info('Verification email sent', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return back()->with('status', 'verification-link-sent');
    }
}