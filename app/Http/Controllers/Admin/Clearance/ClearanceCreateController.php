<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\ClearanceType;
use Inertia\Inertia;

class ClearanceCreateController extends Controller
{
    public function create()
    {
        $residents = $this->getResidents();
        $households = $this->getHouseholds();
        $businesses = $this->getBusinesses();
        $clearanceTypes = $this->getClearanceTypes();
        
        $allPayers = collect()
            ->merge($residents)
            ->merge($households)
            ->merge($businesses)
            ->sortBy('name')
            ->values()
            ->all();

        $defaultPurposeOptions = [
            'Employment',
            'Business Registration',
            'Travel',
            'School Requirement',
            'Government Transaction',
            'Loan Application',
            'Other',
        ];

        return Inertia::render('admin/Clearances/Create', [
            'residents' => $residents,
            'households' => $households,
            'businesses' => $businesses,
            'payers' => $allPayers,
            'payer_counts' => [
                'residents' => $residents->count(),
                'households' => $households->count(),
                'businesses' => $businesses->count(),
                'total' => count($allPayers),
            ],
            'clearanceTypes' => $clearanceTypes,
            'activeClearanceTypes' => $clearanceTypes,
            'purposeOptions' => $defaultPurposeOptions,
        ]);
    }

    private function getResidents()
    {
        return Resident::with('purok')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'suffix', 'address', 'contact_number', 'purok_id', 'household_id', 'email'])
            ->orderBy('last_name')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->full_name,
                'first_name' => $r->first_name,
                'last_name' => $r->last_name,
                'address' => $r->address,
                'contact_number' => $r->contact_number,
                'email' => $r->email,
                'purok' => $r->purok?->name,
                'purok_id' => $r->purok_id,
                'type' => 'resident',
                'type_label' => 'Resident',
                'icon' => 'User',
                'household_id' => $r->household_id,
            ]);
    }

    private function getHouseholds()
    {
        return Household::with(['purok'])
            ->select(['id', 'household_number', 'address', 'purok_id', 'contact_number', 'email'])
            ->where('status', 'active')
            ->orderBy('household_number')
            ->get()
            ->map(function ($h) {
                $headMember = $h->householdMembers()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();
                
                $headName = $headMember && $headMember->resident 
                    ? $headMember->resident->full_name 
                    : 'No Head Assigned';
                
                return [
                    'id' => $h->id,
                    'name' => $headName . ' (Household)',
                    'household_number' => $h->household_number,
                    'head_name' => $headName,
                    'address' => $h->address,
                    'contact_number' => $h->contact_number,
                    'email' => $h->email,
                    'purok' => $h->purok?->name,
                    'purok_id' => $h->purok_id,
                    'type' => 'household',
                    'type_label' => 'Household',
                    'icon' => 'Home',
                ];
            });
    }

    private function getBusinesses()
    {
        return Business::with(['purok', 'owner'])
            ->select(['id', 'business_name', 'owner_id', 'owner_name', 'address', 'contact_number', 'purok_id'])
            ->where('status', 'active')
            ->orderBy('business_name')
            ->get()
            ->map(function ($b) {
                $email = $b->owner_id && $b->owner ? $b->owner->email : null;
                
                return [
                    'id' => $b->id,
                    'name' => $b->business_name . ' (Business)',
                    'business_name' => $b->business_name,
                    'owner_name' => $b->owner_display,
                    'owner_id' => $b->owner_id,
                    'address' => $b->address,
                    'contact_number' => $b->contact_number,
                    'email' => $email,
                    'purok' => $b->purok_name,
                    'purok_id' => $b->purok_id,
                    'type' => 'business',
                    'type_label' => 'Business',
                    'icon' => 'Building',
                ];
            });
    }

    private function getClearanceTypes()
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($type) => [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'description' => $type->description,
                'fee' => (float) $type->fee,
                'formatted_fee' => $type->formatted_fee,
                'processing_days' => (int) $type->processing_days,
                'validity_days' => (int) $type->validity_days,
                'requires_payment' => (bool) $type->requires_payment,
                'requires_approval' => (bool) $type->requires_approval,
                'is_online_only' => (bool) $type->is_online_only,
                'is_discountable' => (bool) $type->is_discountable,
                'requirements' => $type->requirements ?? [],
                'purpose_options' => $type->purpose_options ?: 
                    ['Employment', 'Business Registration', 'Travel', 'School Requirement', 'Government Transaction', 'Loan Application', 'Other'],
            ]);
    }
}