<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Purok;
use App\Models\Privilege;
use App\Models\DiscountType;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ResidentEditController extends BaseResidentController
{
    public function edit(Resident $resident)
    {
        $resident->load([
            'purok',
            'residentPrivileges.privilege.discountType', // Load discount type through privilege
            'householdMemberships.household',
        ]);

        $currentMembership = $resident->householdMemberships()->first();
        $householdRelation = $currentMembership ? $currentMembership->household : null;

        // Get all active privileges with their discount types loaded
        $allPrivileges = Privilege::with('discountType')
            ->active()
            ->orderBy('name')
            ->get([
                'id', 
                'name', 
                'code', 
                'description', 
                'discount_type_id'
            ]);

        $residentData = $this->formatResidentData($resident, $householdRelation);

        return Inertia::render('admin/Residents/Edit', [
            'resident' => $residentData,
            'puroks' => Purok::orderBy('name')->get()->map(fn($p) => ['id' => $p->id, 'name' => $p->name]),
            'all_privileges' => $allPrivileges,
            'civilStatusOptions' => $this->getCivilStatusOptions(),
            'genderOptions' => $this->getGenderOptions(),
            'educationOptions' => $this->getEducationOptions(),
        ]);
    }

    private function formatResidentData($resident, $householdRelation): array
    {
        return [
            'id' => $resident->id,
            'resident_id' => $resident->resident_id,
            'first_name' => $resident->first_name ?? '',
            'last_name' => $resident->last_name ?? '',
            'middle_name' => $resident->middle_name ?? '',
            'suffix' => $resident->suffix ?? '',
            'birth_date' => $resident->birth_date ? Carbon::parse($resident->birth_date)->format('Y-m-d') : '',
            'age' => $resident->age ?? 0,
            'gender' => $resident->gender ?? 'male',
            'civil_status' => $resident->civil_status ?? 'single',
            'contact_number' => $resident->contact_number ?? '',
            'email' => $resident->email ?? '',
            'address' => $resident->address ?? '',
            'purok_id' => $resident->purok_id,
            'household_id' => $resident->household_id,
            'occupation' => $resident->occupation ?? '',
            'education' => $resident->education ?? '',
            'religion' => $resident->religion ?? '',
            'is_voter' => (bool) $resident->is_voter,
            'place_of_birth' => $resident->place_of_birth ?? '',
            'remarks' => $resident->remarks ?? '',
            'status' => $resident->status ?? 'active',
            'photo_path' => $resident->photo_path,
            'photo_url' => $resident->photo_url,
            'privileges' => $resident->residentPrivileges->map(fn($rp) => [
                'privilege_id' => $rp->privilege_id,
                'privilege' => $rp->privilege ? [
                    'id' => $rp->privilege->id,
                    'name' => $rp->privilege->name,
                    'code' => $rp->privilege->code,
                    'discount_percentage' => $rp->privilege->discount_percentage,
                    'requires_verification' => $rp->privilege->requires_verification,
                    'requires_id_number' => $rp->privilege->requires_id_number,
                    'validity_days' => $rp->privilege->validity_days,
                ] : null,
                'id_number' => $rp->id_number,
                'verified_at' => $rp->verified_at?->format('Y-m-d'),
                'expires_at' => $rp->expires_at?->format('Y-m-d'),
                'remarks' => $rp->remarks,
                'discount_percentage' => $rp->discount_percentage ?? $rp->privilege?->discount_percentage,
            ]),
            'created_at' => $resident->created_at->toISOString(),
            'updated_at' => $resident->updated_at->toISOString(),
            'purok' => $resident->purok ? [
                'id' => $resident->purok->id,
                'name' => $resident->purok->name,
            ] : null,
            'household_relation' => $householdRelation ? [
                'id' => $householdRelation->id,
                'household_number' => $householdRelation->household_number,
            ] : null,
        ];
    }
}