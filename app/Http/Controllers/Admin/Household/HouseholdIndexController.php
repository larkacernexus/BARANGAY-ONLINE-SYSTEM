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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class HouseholdIndexController extends Controller
{
    public function index(Request $request)
    {
        // Get paginated and filtered households from server
        $households = $this->getPaginatedHouseholds($request);
        
        // Calculate statistics with caching
        $stats = $this->calculateStats();
        
        // Get puroks for filter dropdown (cached)
        $puroks = $this->getPuroksForFilter();
        
        // Get all households count for client awareness
        $totalCount = Cache::remember('households.total_count', 300, function () {
            return Household::count();
        });

        Log::info('Households index response (Server-Side)', [
            'total_households' => $totalCount,
            'current_page' => $households->currentPage(),
            'filters_applied' => $request->only(['search', 'status', 'purok_id']),
        ]);

        return Inertia::render('admin/Households/Index', [
            'households' => $households,
            'stats' => $stats,
            'puroks' => $puroks,
            'totalCount' => $totalCount,
            'filters' => $request->only([
                'search', 'status', 'purok_id', 'min_members', 'max_members',
                'from_date', 'to_date', 'sort_by', 'sort_order'
            ]),
        ]);
    }

    private function getPaginatedHouseholds(Request $request)
    {
        $query = Household::withCount('householdMembers')
            ->with(['purok', 'householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident');
            }]);
        
        // Apply all filters
        $this->applyFilters($query, $request);
        
        // Apply sorting
        $this->applySorting($query, $request);
        
        $perPage = $request->input('per_page', 15);
        
        return $query->paginate($perPage)
            ->withQueryString()
            ->through(fn($household) => $this->formatHousehold($household));
    }

    private function applyFilters($query, Request $request)
    {
        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
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
                  })
                  ->orWhereHas('purok', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }
        
        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        // Purok filter
        if ($request->filled('purok_id') && $request->input('purok_id') !== 'all') {
            $query->where('purok_id', $request->input('purok_id'));
        }
        
        // Member count filters
        if ($request->filled('min_members')) {
            $query->having('household_members_count', '>=', $request->input('min_members'));
        }
        
        if ($request->filled('max_members')) {
            $query->having('household_members_count', '<=', $request->input('max_members'));
        }
        
        // Date range filters
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }
        
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }
    }

    private function applySorting($query, Request $request)
    {
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSorts = [
            'household_number', 
            'head_name', 
            'member_count', 
            'purok', 
            'status', 
            'created_at'
        ];
        
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'head_name') {
                $query->leftJoin('household_members', function ($join) {
                    $join->on('households.id', '=', 'household_members.household_id')
                         ->where('household_members.is_head', '=', true);
                })
                ->leftJoin('residents', 'household_members.resident_id', '=', 'residents.id')
                ->orderBy('residents.last_name', $sortOrder)
                ->orderBy('residents.first_name', $sortOrder)
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
            $query->latest();
        }
    }

    private function formatHousehold($household): array
    {
        $headMember = $household->householdMembers->first();
        $headName = $headMember && $headMember->resident 
            ? $headMember->resident->full_name 
            : 'No Head Assigned';
        
        $headDetails = null;
        if ($headMember && $headMember->resident) {
            $headDetails = [
                'id' => $headMember->resident->id,
                'first_name' => $headMember->resident->first_name,
                'last_name' => $headMember->resident->last_name,
                'middle_name' => $headMember->resident->middle_name,
                'full_name' => $headMember->resident->full_name,
                'age' => $headMember->resident->age,
                'gender' => $headMember->resident->gender,
                'civil_status' => $headMember->resident->civil_status,
                'contact_number' => $headMember->resident->contact_number,
            ];
        }
        
        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'head_of_family' => $headName,
            'head_details' => $headDetails,
            'member_count' => $household->household_members_count,
            'contact_number' => $household->contact_number,
            'contact_person' => $household->contact_person,
            'address' => $household->address,
            'purok' => $household->purok ? [
                'id' => $household->purok->id,
                'name' => $household->purok->name,
            ] : null,
            'purok_id' => $household->purok_id,
            'latitude' => $household->latitude,
            'longitude' => $household->longitude,
            'created_at' => $household->created_at?->toISOString(),
            'updated_at' => $household->updated_at?->toISOString(),
            'status' => $household->status,
            'has_coordinates' => !is_null($household->latitude) && !is_null($household->longitude),
        ];
    }

    private function calculateStats(): array
    {
        // Cache statistics for 5 minutes
        return Cache::remember('households.statistics', 300, function () {
            $totalHouseholds = Household::count();
            $totalMembers = Resident::count();
            $averageMembers = $totalHouseholds > 0 ? round($totalMembers / $totalHouseholds, 1) : 0;
            
            $householdsWithAccounts = Household::whereHas('user')->count();
            
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
        });
    }

    private function getPuroksForFilter(): array
    {
        return Cache::remember('puroks.active', 3600, function () {
            return Purok::where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray();
        });
    }
    
    // Clear cache when data changes (call this from create/update/delete methods)
    public function clearCache()
    {
        Cache::forget('households.statistics');
        Cache::forget('households.total_count');
        Cache::forget('puroks.active');
        
        return response()->json(['message' => 'Household cache cleared successfully']);
    }
}