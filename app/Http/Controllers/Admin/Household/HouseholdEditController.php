<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Household;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class HouseholdEditController extends Controller
{
    public function edit(Household $household)
    {
        Log::info('Editing household', ['household_id' => $household->id]);
        
        $currentMemberIds = $household->householdMembers()->pluck('resident_id')->toArray();
        
        $heads = $this->getAvailableHeads($household);
        $availableResidents = $this->getAvailableResidents($household);
        $puroks = $this->getPuroks();
        $currentMembers = $this->getCurrentMembers($household);
        $roles = $this->getRoles();
        
        $householdPurok = $household->purok_id ? Purok::find($household->purok_id) : null;
        
        return Inertia::render('admin/Households/Edit', [
            'household' => [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'contact_number' => $household->contact_number,
                'email' => $household->email,
                'address' => $household->address,
                'purok_id' => $household->purok_id,
                'purok_name' => $householdPurok?->name,
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
                'created_at' => $household->created_at->toISOString(),
                'updated_at' => $household->updated_at->toISOString(),
            ],
            'heads' => $heads,
            'available_residents' => $availableResidents,
            'puroks' => $puroks,
            'current_members' => $currentMembers,
            'roles' => $roles,
        ]);
    }

    private function getAvailableHeads(Household $household)
    {
        return Resident::with('purok')
            ->where(fn($q) => $q->whereDoesntHave('householdMemberships')
                ->orWhereHas('householdMemberships', fn($q) => $q->where('household_id', $household->id)))
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'purok_id', 'photo_path'])
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'first_name' => $r->first_name,
                'last_name' => $r->last_name,
                'middle_name' => $r->middle_name,
                'age' => $r->age,
                'address' => $r->address,
                'purok_id' => $r->purok_id,
                'purok_name' => $r->purok?->name,
                'photo_url' => $r->photo_path ? Storage::url($r->photo_path) : null,
            ])
            ->values();
    }

    private function getAvailableResidents(Household $household)
    {
        return Resident::with('purok')
            ->where(fn($q) => $q->whereDoesntHave('householdMemberships')
                ->orWhereHas('householdMemberships', fn($q) => $q->where('household_id', $household->id)))
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'purok_id', 'photo_path'])
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'first_name' => $r->first_name,
                'last_name' => $r->last_name,
                'middle_name' => $r->middle_name,
                'age' => $r->age,
                'address' => $r->address,
                'purok_id' => $r->purok_id,
                'purok_name' => $r->purok?->name,
                'photo_url' => $r->photo_path ? Storage::url($r->photo_path) : null,
            ])
            ->values();
    }

    private function getCurrentMembers(Household $household)
    {
        return $household->householdMembers()->with('resident.purok')->get()
            ->map(fn($m) => [
                'id' => $m->resident_id,
                'name' => trim($m->resident->first_name . ' ' . $m->resident->last_name),
                'relationship' => $m->relationship_to_head,
                'age' => $m->resident->age,
                'resident_id' => $m->resident->id,
                'household_member_id' => $m->id,
                'is_head' => (bool) $m->is_head,
                'purok_id' => $m->resident->purok_id,
                'purok_name' => $m->resident->purok?->name,
                'photo_url' => $m->resident->photo_path ? Storage::url($m->resident->photo_path) : null,
            ])
            ->values()
            ->toArray();
    }

    private function getPuroks()
    {
        return Purok::active()->orderBy('name')->get(['id', 'name'])->toArray();
    }

    private function getRoles()
    {
        return Role::where('name', 'like', '%household%')
            ->orWhere('name', 'like', '%resident%')
            ->select(['id', 'name', 'description'])
            ->get();
    }
}