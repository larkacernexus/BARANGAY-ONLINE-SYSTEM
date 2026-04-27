<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\Role;
use App\Models\HouseholdMember;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class HouseholdCreateController extends Controller
{
    public function create(Request $request)
    {
        $preselectedHead = null;
        if ($request->has('head_of_household_id') || $request->has('head_resident_id')) {
            $headId = $request->head_of_household_id ?? $request->head_resident_id;
            
            $isEligible = !HouseholdMember::where('resident_id', $headId)
                ->where('is_head', true)
                ->exists();
            
            if ($isEligible) {
                $preselectedHead = Resident::with(['householdMemberships' => function($q) {
                    $q->with('household');
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

        $puroks = $this->getPuroks();
        $roles = $this->getRoles();
        $fromResident = $request->from_resident ?? $request->resident_id;
        
        return Inertia::render('admin/Households/Create', [
            'puroks' => $puroks,
            'roles' => $roles,
            'preselectedHead' => $preselectedHead,
            'fromResident' => $fromResident,
        ]);
    }

    /**
     * Search available heads via AJAX
     * 
     * A resident is eligible to be a household head if:
     * 1. They have NO household_members record with is_head = true
     * 2. OR they have no household_members record at all
     */
    public function searchHeads(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        // Get ALL resident IDs that are current heads
        $existingHeadIds = HouseholdMember::where('is_head', true)
            ->pluck('resident_id')
            ->unique()
            ->toArray();
        
        // Query residents who are NOT heads
        $query = Resident::whereNotIn('id', $existingHeadIds)
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        if ($paginator->isEmpty()) {
            return response()->json([
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'has_more' => false,
                ],
            ]);
        }
        
        // Get memberships for all paginated residents
        $residentIds = $paginator->pluck('id')->toArray();
        $memberships = HouseholdMember::whereIn('resident_id', $residentIds)
            ->with('household')
            ->get()
            ->groupBy('resident_id');
        
        $data = $paginator->map(function($resident) use ($memberships) {
            $residentMemberships = $memberships->get($resident->id, collect());
            $currentMembership = $residentMemberships->first();
            
            $householdStatus = 'none';
            $statusLabel = 'Not in any household';
            $statusColor = 'gray';
            $currentHousehold = null;
            
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
                'household_status' => $householdStatus,
                'status_label' => $statusLabel,
                'status_color' => $statusColor,
                'current_household' => $currentHousehold,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }
    
    /**
     * Search available residents for member selection via AJAX
     */
    public function searchResidents(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Resident::select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        if ($paginator->isEmpty()) {
            return response()->json([
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'has_more' => false,
                ],
            ]);
        }
        
        $residentIds = $paginator->pluck('id')->toArray();
        $memberships = HouseholdMember::whereIn('resident_id', $residentIds)
            ->with('household')
            ->get()
            ->groupBy('resident_id');
        
        $data = $paginator->map(function($r) use ($memberships) {
            $residentMemberships = $memberships->get($r->id, collect());
            $membership = $residentMemberships->first();
            $isInHousehold = $membership !== null;
            $isHead = $isInHousehold ? $membership->is_head : false;
            
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
                $canBeAdded = false;
                $restrictionReason = 'Already a head of another household';
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
                $canBeAdded = true;
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
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    private function getPuroks()
    {
        return Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

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