<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class HouseholdCreateController extends Controller
{
    public function create(Request $request)
    {
        // Get the pre-selected head resident if provided
        $preselectedHead = null;
        if ($request->has('head_of_household_id') || $request->has('head_resident_id')) {
            // Support both parameter names for flexibility
            $headId = $request->head_of_household_id ?? $request->head_resident_id;
            
            // Check if this resident is eligible to be a head (not already a head of another household)
            $isEligible = !Resident::where('id', $headId)
                ->whereHas('householdMemberships', function($q) {
                    $q->where('is_head', true);
                })
                ->exists();
            
            if ($isEligible) {
                $preselectedHead = Resident::with(['householdMemberships' => function($q) {
                    $q->with('household')->where('is_head', false);
                }])->find($headId);
                
                if ($preselectedHead) {
                    $currentMembership = $preselectedHead->householdMemberships->first();
                    
                    $preselectedHead = [
                        'id' => $preselectedHead->id,
                        'first_name' => $preselectedHead->first_name,
                        'last_name' => $preselectedHead->last_name,
                        'middle_name' => $preselectedHead->middle_name,
                        'age' => $preselectedHead->age,
                        'address' => $preselectedHead->address,
                        'photo_url' => $preselectedHead->photo_path ? Storage::url($preselectedHead->photo_path) : null,
                        'household_status' => $currentMembership ? 'member' : 'none',
                        'current_household' => $currentMembership ? [
                            'id' => $currentMembership->household->id,
                            'number' => $currentMembership->household->household_number,
                            'relationship' => $currentMembership->relationship_to_head,
                        ] : null,
                    ];
                }
            }
        }

        $heads = $this->getAvailableHeads();
        $availableResidents = $this->getAvailableResidents();
        $puroks = $this->getPuroks();
        $roles = $this->getRoles();
        
        // Also pass the return_to parameter if you want to redirect back to the resident
        $fromResident = $request->from_resident ?? $request->resident_id;
        
        return Inertia::render('admin/Households/Create', [
            'heads' => $heads,
            'available_residents' => $availableResidents,
            'puroks' => $puroks,
            'roles' => $roles,
            'preselectedHead' => $preselectedHead,
            'fromResident' => $fromResident,
        ]);
    }

    /**
     * Get residents eligible to be household heads
     * A resident is eligible if they are NOT already a head of any household
     * This includes:
     * - Residents not in any household
     * - Residents who are MEMBERS of other households (they can be transferred)
     */
    private function getAvailableHeads()
    {
        return Resident::whereDoesntHave('householdMemberships', function($q) {
                $q->where('is_head', true); // Exclude anyone who is already a head
            })
            ->with(['householdMemberships' => function($q) {
                $q->with('household')->where('is_head', false); // Only get non-head memberships
            }])
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function($resident) {
                // Get the member info if they are currently in another household (as a member)
                $currentMembership = $resident->householdMemberships->first();
                
                // Determine household status
                $householdStatus = 'none';
                $currentHousehold = null;
                $statusLabel = 'Not in any household';
                $statusColor = 'gray';
                
                if ($currentMembership) {
                    $householdStatus = 'member';
                    $statusLabel = 'Member of Another Household';
                    $statusColor = 'purple';
                    $currentHousehold = [
                        'id' => $currentMembership->household->id,
                        'number' => $currentMembership->household->household_number,
                        'relationship' => $currentMembership->relationship_to_head,
                    ];
                }
                
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'full_name' => trim($resident->first_name . ' ' . $resident->middle_name . ' ' . $resident->last_name),
                    'age' => $resident->age,
                    'address' => $resident->address,
                    'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                    'household_status' => $householdStatus, // 'member' or 'none'
                    'status_label' => $statusLabel,
                    'status_color' => $statusColor,
                    'current_household' => $currentHousehold, // null or household details
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get all residents with their household membership status
     * This includes residents who are already in households for display purposes
     */
    private function getAvailableResidents()
    {
        return Resident::with(['householdMemberships' => function($q) {
                $q->with('household');
            }])
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function($r) {
                $membership = $r->householdMemberships->first();
                $isInHousehold = $membership !== null;
                $isHead = $isInHousehold ? $membership->is_head : false;
                
                // Determine household status
                if (!$isInHousehold) {
                    $householdStatus = 'none';
                    $statusLabel = 'Not in any household';
                    $statusColor = 'gray';
                    $canBeAdded = true;
                    $restrictionReason = null;
                    $currentHousehold = null;
                } else if ($isHead) {
                    $householdStatus = 'head';
                    $statusLabel = 'Head of Household';
                    $statusColor = 'blue';
                    $canBeAdded = false; // Cannot add a head as member
                    $restrictionReason = 'This person is already a HEAD of another household and cannot be added as a member';
                    $currentHousehold = [
                        'id' => $membership->household->id,
                        'number' => $membership->household->household_number,
                        'is_head' => true,
                        'relationship' => 'Head',
                    ];
                } else {
                    $householdStatus = 'member';
                    $statusLabel = 'Member of Another Household';
                    $statusColor = 'purple';
                    $canBeAdded = true; // CAN be added - will be transferred
                    $restrictionReason = 'Will be transferred from their current household';
                    $currentHousehold = [
                        'id' => $membership->household->id,
                        'number' => $membership->household->household_number,
                        'is_head' => false,
                        'relationship' => $membership->relationship_to_head,
                    ];
                }
                
                return [
                    'id' => $r->id,
                    'first_name' => $r->first_name,
                    'last_name' => $r->last_name,
                    'middle_name' => $r->middle_name,
                    'full_name' => trim($r->first_name . ' ' . $r->middle_name . ' ' . $r->last_name),
                    'age' => $r->age,
                    'address' => $r->address,
                    'photo_url' => $r->photo_path ? Storage::url($r->photo_path) : null,
                    'household_status' => $householdStatus,
                    'status_label' => $statusLabel,
                    'status_color' => $statusColor,
                    'can_be_added' => $canBeAdded,
                    'restriction_reason' => $restrictionReason,
                    'current_household' => $currentHousehold,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get all active puroks
     */
    private function getPuroks()
    {
        return Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    /**
     * Get roles related to households/residents
     */
    private function getRoles()
    {
        return Role::where('name', 'like', '%household%')
            ->orWhere('name', 'like', '%resident%')
            ->orWhere('name', 'like', '%head%')
            ->select(['id', 'name', 'description'])
            ->orderBy('name')
            ->get()
            ->toArray();
    }
}