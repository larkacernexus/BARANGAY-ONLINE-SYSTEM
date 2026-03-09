<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\ClearanceType;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClearanceCreateController extends Controller
{
    public function __invoke()
    {
        // Fetch residents
        $residents = Resident::with('purok')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'suffix', 'address', 'contact_number', 'purok_id', 'household_id', 'email'])
            ->orderBy('last_name')
            ->get()
            ->map(fn($resident) => $this->formatResident($resident));
        
        // Fetch households
        $households = Household::with(['purok', 'householdMembers.resident'])
            ->select(['id', 'household_number', 'address', 'purok_id', 'contact_number', 'email', 'member_count', 'status'])
            ->where('status', 'active')
            ->orderBy('household_number')
            ->get()
            ->map(fn($household) => $this->formatHousehold($household));
        
        // Fetch businesses
        $businesses = Business::with(['purok', 'owner'])
            ->select(['id', 'business_name', 'owner_id', 'owner_name', 'address', 'contact_number', 'purok_id', 'business_type', 'status'])
            ->where('status', 'active')
            ->orderBy('business_name')
            ->get()
            ->map(fn($business) => $this->formatBusiness($business));
        
        // Get clearance types
        $clearanceTypes = $this->getClearanceTypes();
        
        // Combine all payers
        $allPayers = collect()
            ->merge($residents)
            ->merge($households)
            ->merge($businesses)
            ->sortBy('name')
            ->values()
            ->all();
        
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
            'purposeOptions' => $this->getPurposeOptions(),
        ]);
    }

    protected function formatResident($resident)
    {
        return [
            'id' => $resident->id,
            'name' => $resident->full_name,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'address' => $resident->address,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'type' => 'resident',
            'type_label' => 'Resident',
            'icon' => 'User',
            'household_id' => $resident->household_id,
        ];
    }

    protected function formatHousehold($household)
    {
        $headMember = $household->householdMembers()
            ->where('is_head', true)
            ->with('resident')
            ->first();
        
        $headName = $headMember && $headMember->resident 
            ? $headMember->resident->full_name 
            : 'No Head Assigned';
        
        $contactNumber = $headMember && $headMember->resident 
            ? ($headMember->resident->contact_number ?? $household->contact_number)
            : $household->contact_number;
        
        $email = $headMember && $headMember->resident 
            ? ($headMember->resident->email ?? $household->email)
            : $household->email;
        
        return [
            'id' => $household->id,
            'name' => $headName . ' (Household)',
            'household_number' => $household->household_number,
            'head_name' => $headName,
            'head_id' => $headMember?->resident_id,
            'address' => $household->address,
            'contact_number' => $contactNumber,
            'email' => $email,
            'purok' => $household->purok?->name,
            'purok_id' => $household->purok_id,
            'type' => 'household',
            'type_label' => 'Household',
            'icon' => 'Home',
            'member_count' => $household->member_count,
        ];
    }

    protected function formatBusiness($business)
    {
        $email = $business->owner_id && $business->owner ? $business->owner->email : null;
        
        return [
            'id' => $business->id,
            'name' => $business->business_name . ' (Business)',
            'business_name' => $business->business_name,
            'owner_name' => $business->owner_display,
            'owner_id' => $business->owner_id,
            'owner_email' => $email,
            'address' => $business->address,
            'contact_number' => $business->contact_number,
            'email' => $email,
            'purok' => $business->purok_name,
            'purok_id' => $business->purok_id,
            'type' => 'business',
            'type_label' => 'Business',
            'icon' => 'Building',
            'status' => $business->status,
        ];
    }

    protected function getClearanceTypes()
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
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
                    'is_discountable' => (bool) $type->is_discountable,
                    'purpose_options' => $this->parsePurposeOptions($type->purpose_options),
                ];
            });
    }

    protected function parsePurposeOptions($options)
    {
        if (!$options) {
            return $this->getPurposeOptions();
        }
        
        return is_array($options) ? $options : array_map('trim', explode(',', $options));
    }

    protected function getPurposeOptions()
    {
        return [
            'Employment',
            'Business Registration',
            'Travel',
            'School Requirement',
            'Government Transaction',
            'Loan Application',
            'Other',
        ];
    }
}