<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Household;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HouseholdIndexController extends Controller
{
    public function index(Request $request)
    {
        $allHouseholds = $this->getAllHouseholds();
        $households = $this->getPaginatedHouseholds($request);
        $stats = $this->calculateStats();
        $puroks = Purok::active()->orderBy('name')->get()->toArray();
        
        return Inertia::render('admin/Households/Index', [
            'households' => $households,
            'allHouseholds' => $allHouseholds,
            'stats' => $stats,
            'puroks' => $puroks,
            'filters' => $request->only(['search', 'status', 'purok_id']),
        ]);
    }

    private function getAllHouseholds()
    {
        return Household::withCount('householdMembers')
            ->with(['purok', 'householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident');
            }])
            ->latest()
            ->get()
            ->map(function ($household) {
                $headMember = $household->householdMembers->first();
                $headName = $headMember && $headMember->resident 
                    ? $headMember->resident->full_name 
                    : 'No Head Assigned';
                
                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headName,
                    'member_count' => $household->household_members_count,
                    'contact_number' => $household->contact_number,
                    'contact_person' => $household->contact_person,
                    'address' => $household->address,
                    'purok' => $household->purok,
                    'latitude' => $household->latitude,  // Add this
                    'longitude' => $household->longitude, // Add this
                    'created_at' => $household->created_at->toISOString(),
                    'updated_at' => $household->updated_at->toISOString(),
                    'status' => $household->status,
                ];
            })
            ->toArray();
    }

    private function getPaginatedHouseholds(Request $request)
    {
        $query = Household::withCount('householdMembers')
            ->with(['purok', 'householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident');
            }])
            ->latest();
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhereHas('householdMembers', function ($q) use ($search) {
                      $q->where('is_head', true)
                        ->whereHas('resident', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%")
                              ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$search}%");
                        });
                  });
            });
        }
        
        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Apply purok filter
        if ($request->filled('purok_id') && $request->purok_id !== 'all') {
            $query->where('purok_id', $request->purok_id);
        }
        
        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['household_number', 'head_of_family', 'member_count', 'purok', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'head_of_family') {
                $query->leftJoin('household_members', function ($join) {
                    $join->on('households.id', '=', 'household_members.household_id')
                         ->where('household_members.is_head', '=', true);
                })
                ->leftJoin('residents', 'household_members.resident_id', '=', 'residents.id')
                ->orderBy('residents.first_name', $sortOrder)
                ->orderBy('residents.last_name', $sortOrder)
                ->select('households.*');
            } elseif ($sortBy === 'member_count') {
                $query->orderBy('household_members_count', $sortOrder);
            } elseif ($sortBy === 'purok') {
                $query->leftJoin('puroks', 'households.purok_id', '=', 'puroks.id')
                    ->orderBy('puroks.name', $sortOrder)
                    ->select('households.*');
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }
        
        $perPage = $request->get('per_page', 15);
        
        return $query->paginate($perPage)->withQueryString()->through(function ($household) {
            $headMember = $household->householdMembers->first();
            $headName = $headMember && $headMember->resident 
                ? $headMember->resident->full_name 
                : 'No Head Assigned';
            
            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'head_of_family' => $headName,
                'member_count' => $household->household_members_count,
                'contact_number' => $household->contact_number,
                'contact_person' => $household->contact_person,
                'address' => $household->address,
                'purok' => $household->purok ? [
                    'id' => $household->purok->id,
                    'name' => $household->purok->name,
                ] : null,
                'purok_id' => $household->purok_id,
                'latitude' => $household->latitude,  // Add this
                'longitude' => $household->longitude, // Add this
                'created_at' => $household->created_at->toISOString(),
                'updated_at' => $household->updated_at->toISOString(),
                'status' => $household->status,
            ];
        });
    }

    private function calculateStats()
    {
        $totalHouseholds = Household::count();
        $totalMembers = Resident::count();
        $averageMembers = $totalHouseholds > 0 ? round($totalMembers / $totalHouseholds, 1) : 0;
        
        // Simple query for households with user accounts
        $householdsWithAccounts = Household::whereHas('user')->count();
        
        // Get households with coordinates for map view stats
        $householdsWithCoordinates = Household::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->count();
        
        return [
            [
                'label' => 'Total Households',
                'value' => $totalHouseholds,
                'icon' => 'Home',
                'color' => 'blue'
            ],
            [
                'label' => 'Active Households',
                'value' => Household::where('status', 'active')->count(),
                'icon' => 'CheckCircle',
                'color' => 'green'
            ],
            [
                'label' => 'Inactive Households',
                'value' => Household::where('status', 'inactive')->count(),
                'icon' => 'XCircle',
                'color' => 'red'
            ],
            [
                'label' => 'Total Members',
                'value' => $totalMembers,
                'icon' => 'Users',
                'color' => 'purple'
            ],
            [
                'label' => 'Average Members',
                'value' => number_format($averageMembers, 1),
                'icon' => 'PieChart',
                'color' => 'orange'
            ],
            [
                'label' => 'With User Accounts',
                'value' => $householdsWithAccounts,
                'icon' => 'User',
                'color' => 'teal'
            ],
            [
                'label' => 'Mapped Households',
                'value' => $householdsWithCoordinates,
                'icon' => 'MapPin',
                'color' => 'indigo'
            ]
        ];
    }
}