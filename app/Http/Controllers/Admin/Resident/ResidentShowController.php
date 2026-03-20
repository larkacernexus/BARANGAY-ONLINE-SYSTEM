<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Privilege; // Add this import
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResidentShowController extends BaseResidentController
{
    public function show(Resident $resident)
    {
        Log::info('Viewing resident details', [
            'resident_id' => $resident->id,
            'resident_name' => $resident->first_name . ' ' . $resident->last_name,
            'user_id' => auth()->id(),
        ]);
        
        // Load resident with relationships
        $resident->load([
            'purok',
            'residentPrivileges.privilege.discountType',
            'householdMemberships.household.purok',
            'householdMemberships.household.householdMembers.resident.purok',
            'householdMemberships.household.householdMembers.resident.residentPrivileges',
        ]);
        
        $residentData = $this->formatResidentData($resident);
        $householdData = $this->getHouseholdData($resident);
        $householdMembership = $this->getHouseholdMembership($resident);
        $relatedHouseholdMembers = $this->getRelatedHouseholdMembers($resident);
        
        // Get all households for the dropdown (excluding current household if any)
        $households = $this->getAllHouseholds($resident);
        
        // Get all puroks for new household creation
        $puroks = Purok::orderBy('name')->get(['id', 'name']);

        // Get available privileges for this resident (not yet assigned)
        $assignedPrivilegeIds = $resident->residentPrivileges->pluck('privilege_id')->toArray();
        $availablePrivileges = Privilege::with('discountType')
            ->where('is_active', true)
            ->when(!empty($assignedPrivilegeIds), function($query) use ($assignedPrivilegeIds) {
                return $query->whereNotIn('id', $assignedPrivilegeIds);
            })
            ->orderBy('name')
            ->get()
            ->map(function($privilege) {
                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'description' => $privilege->description,
                    'is_active' => $privilege->is_active,
                    'default_discount_percentage' => $privilege->default_discount_percentage,
                    'requires_id_number' => $privilege->requires_id_number,
                    'requires_verification' => $privilege->requires_verification,
                    'validity_years' => $privilege->validity_years,
                    'discount_type' => $privilege->discount_type ? [
                        'id' => $privilege->discount_type->id,
                        'name' => $privilege->discount_type->name,
                        'code' => $privilege->discount_type->code,
                    ] : null,
                ];
            });

        return Inertia::render('admin/Residents/Show', [
            'resident' => $residentData,
            'household' => $householdData,
            'household_membership' => $householdMembership,
            'related_household_members' => $relatedHouseholdMembers,
            'households' => $households,
            'puroks' => $puroks,
            'available_privileges' => $availablePrivileges, // Add this line
        ]);
    }

    private function formatResidentData($resident): array
    {
        return [
            'id' => $resident->id,
            'resident_id' => $resident->resident_id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'full_name' => $resident->full_name,
            'birth_date' => $resident->birth_date?->toISOString(),
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'address' => $resident->address,
            'purok_id' => $resident->purok_id,
            'purok_name' => $resident->purok?->name,
            'household_id' => $resident->household_id,
            'occupation' => $resident->occupation,
            'education' => $resident->education,
            'religion' => $resident->religion,
            'is_voter' => (bool) $resident->is_voter,
            'place_of_birth' => $resident->place_of_birth,
            'remarks' => $resident->remarks,
            'status' => $resident->status,
            'photo_url' => $resident->photo_url,
            'privileges' => $resident->residentPrivileges
                ->map(fn($rp) => $this->formatPrivilegeForFrontend($rp))
                ->values()
                ->toArray(),
            'privileges_count' => $resident->residentPrivileges->count(),
            'active_privileges_count' => $resident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count(),
            'created_at' => $resident->created_at->toISOString(),
            'updated_at' => $resident->updated_at->toISOString(),
        ];
    }

    /**
     * Format privilege data specifically for the frontend Show page
     */
    private function formatPrivilegeForFrontend($residentPrivilege): array
    {
        // Use the base formatter first
        $baseData = $this->formatPrivilege($residentPrivilege);
        $privilege = $residentPrivilege->privilege;
        
        // Transform to match frontend expectations
        return [
            'id' => $baseData['id'],
            'resident_id' => $residentPrivilege->resident_id,
            'privilege_id' => $baseData['privilege_id'],
            'id_number' => $baseData['id_number'],
            // Use created_at as issued_date since there's no issued_date field
            'issued_date' => $residentPrivilege->created_at?->toISOString(),
            'expiry_date' => $residentPrivilege->expires_at?->toISOString(),
            'verified_at' => $baseData['verified_at'],
            'verified_by' => $residentPrivilege->verified_by,
            'status' => $baseData['status'],
            'remarks' => $baseData['remarks'],
            'created_at' => $residentPrivilege->created_at->toISOString(),
            'updated_at' => $residentPrivilege->updated_at->toISOString(),
            
            // Nested privilege object as expected by frontend
            'privilege' => [
                'id' => $privilege->id,
                'name' => $privilege->name,
                'code' => $privilege->code,
                'description' => $privilege->description,
                'is_active' => (bool) $privilege->is_active,
                'discount_type_id' => $privilege->discount_type_id,
                'default_discount_percentage' => $privilege->default_discount_percentage,
                'requires_id_number' => (bool) $privilege->requires_id_number,
                'requires_verification' => (bool) $privilege->requires_verification,
                'validity_years' => $privilege->validity_years,
                'discount_type' => $privilege->discount_type ? [
                    'id' => $privilege->discount_type->id,
                    'name' => $privilege->discount_type->name,
                    'code' => $privilege->discount_type->code,
                ] : null,
            ],
            
            // Computed fields for easy access
            'discount_percentage' => $baseData['discount_percentage'],
            'discount_type_name' => $privilege->discount_type?->name ?? 'Discount',
            'discount_code' => $privilege->discount_type?->code ?? $privilege->code,
            'privilege_name' => $privilege->name,
            'privilege_code' => $privilege->code,
            'privilege_description' => $privilege->description,
        ];
    }

    private function getHouseholdData($resident)
    {
        if (!$resident->householdMemberships()->exists()) {
            return null;
        }

        $membership = $resident->householdMemberships()->first();
        $household = $membership->household;

        if (!$household) {
            return null;
        }

        $headMember = $household->householdMembers()->where('is_head', true)->first();
        $headResident = $headMember ? $headMember->resident : null;

        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'address' => $household->address,
            'purok' => $household->purok?->name,
            'purok_id' => $household->purok_id,
            'member_count' => $household->member_count,
            'income_range' => $household->income_range,
            'housing_type' => $household->housing_type,
            'ownership_status' => $household->ownership_status,
            'water_source' => $household->water_source,
            'electricity' => (bool) $household->electricity,
            'internet' => (bool) $household->internet,
            'vehicle' => (bool) $household->vehicle,
            'remarks' => $household->remarks,
            'status' => $household->status,
            'head_resident' => $headResident ? $this->formatHeadResident($headResident) : null,
        ];
    }

    private function formatHeadResident($resident): array
    {
        return [
            'id' => $resident->id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'age' => (int) $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'photo_url' => $resident->photo_url,
        ];
    }

    private function getHouseholdMembership($resident)
    {
        $membership = $resident->householdMemberships()->first();
        
        if (!$membership) {
            return null;
        }

        return [
            'id' => $membership->id,
            'household_id' => $membership->household_id,
            'relationship_to_head' => $membership->relationship_to_head,
            'is_head' => (bool) $membership->is_head,
        ];
    }

    private function getRelatedHouseholdMembers($resident)
    {
        $membership = $resident->householdMemberships()->first();
        
        if (!$membership || !$membership->household) {
            return [];
        }

        return $membership->household->householdMembers
            ->filter(fn($m) => $m->resident_id !== $resident->id)
            ->map(function($member) {
                return [
                    'id' => $member->id,
                    'resident_id' => $member->resident_id,
                    'relationship_to_head' => $member->relationship_to_head,
                    'is_head' => (bool) $member->is_head,
                    'resident' => [
                        'id' => $member->resident->id,
                        'first_name' => $member->resident->first_name,
                        'last_name' => $member->resident->last_name,
                        'middle_name' => $member->resident->middle_name,
                        'age' => (int) $member->resident->age,
                        'gender' => $member->resident->gender,
                        'civil_status' => $member->resident->civil_status,
                        'contact_number' => $member->resident->contact_number,
                        'purok' => $member->resident->purok?->name,
                        'purok_id' => $member->resident->purok_id,
                        'photo_url' => $member->resident->photo_url,
                    ]
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get all households for the dropdown, excluding the current household if any
     */
    private function getAllHouseholds($resident)
    {
        $currentHouseholdId = $resident->household_id;
        
        return Household::with(['householdMembers.resident'])
            ->when($currentHouseholdId, function($query) use ($currentHouseholdId) {
                return $query->where('id', '!=', $currentHouseholdId);
            })
            ->orderBy('household_number')
            ->get()
            ->map(function($household) {
                $headMember = $household->householdMembers->where('is_head', true)->first();
                $headName = $headMember && $headMember->resident 
                    ? $headMember->resident->full_name 
                    : 'No Head';

                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headName,
                    'head_resident_id' => $headMember ? $headMember->resident_id : null,
                    'has_head' => !is_null($headMember),
                    'head_name' => $headName,
                    'member_count' => $household->member_count,
                    'address' => $household->address,
                    'purok' => $household->purok?->name,
                ];
            });
    }
}