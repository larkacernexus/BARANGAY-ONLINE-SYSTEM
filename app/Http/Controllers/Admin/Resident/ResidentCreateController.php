<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Household;
use App\Models\Privilege;
use Inertia\Inertia;

class ResidentCreateController extends BaseResidentController
{
    public function create()
    {
        $households = $this->getHouseholds();
        $privileges = $this->getPrivileges();

        return Inertia::render('admin/Residents/Create', [
            'households' => $households,
            'puroks' => $this->getPuroksForSelect(),
            'privileges' => $privileges,
            'civilStatusOptions' => $this->getCivilStatusOptions(),
            'genderOptions' => $this->getGenderOptions(),
            'educationOptions' => $this->getEducationOptions(),
            'relationshipOptions' => $this->getRelationshipOptions(),
            'householdCreationOptions' => [
                ['value' => 'none', 'label' => 'No Household'],
                ['value' => 'new', 'label' => 'Create New Household'],
                ['value' => 'existing', 'label' => 'Select Existing Household'],
            ],
        ]);
    }

    private function getHouseholds()
    {
        return Household::with(['householdMembers.resident'])
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
                ];
            })
            ->prepend([
                'id' => 'new',
                'household_number' => 'NEW_HOUSEHOLD',
                'head_of_family' => 'Create New Household',
                'has_head' => false,
                'head_name' => 'New Household',
                'member_count' => 0,
            ])
            ->prepend([
                'id' => 'none',
                'household_number' => 'NO_HOUSEHOLD',
                'head_of_family' => 'No Household',
                'has_head' => false,
                'head_name' => 'No Household',
                'member_count' => 0,
            ]);
    }

    private function getPrivileges()
    {
        return Privilege::where('is_active', true)
            ->with('discountType')
            ->orderBy('name')
            ->get()
            ->map(function($privilege) {
                // Determine the discount percentage to use
                $discountPercentage = $privilege->default_discount_percentage;
                
                // If there's a discount type with a default percentage, use that instead
                if ($privilege->discountType && $privilege->discountType->default_percentage) {
                    $discountPercentage = $privilege->discountType->default_percentage;
                }

                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'description' => $privilege->description,
                    'discount_percentage' => $discountPercentage, // Map to what the component expects
                    'requires_id_number' => (bool) $privilege->requires_id_number,
                    'requires_verification' => (bool) $privilege->requires_verification,
                    'validity_years' => $privilege->validity_years,
                    'is_active' => (bool) $privilege->is_active,
                    // Keep these if needed elsewhere, but component doesn't use them
                    'default_discount_percentage' => $privilege->default_discount_percentage,
                    'discount_type_id' => $privilege->discount_type_id,
                    'discount_type' => $privilege->discountType ? [
                        'id' => $privilege->discountType->id,
                        'name' => $privilege->discountType->name,
                        'code' => $privilege->discountType->code,
                        'default_percentage' => $privilege->discountType->default_percentage,
                    ] : null,
                ];
            });
    }
}