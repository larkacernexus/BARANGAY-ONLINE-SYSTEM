<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Privilege;
use App\Models\HouseholdMember;
use App\Models\ResidentPrivilege;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResidentIndexController extends BaseResidentController
{
    public function index(Request $request)
    {
        // Get paginated and filtered residents from server
        $residents = $this->getPaginatedResidents($request);
        
        // Calculate statistics
        $stats = $this->calculateStatistics();
        
        // Get filter data (dropdowns, etc.)
        $puroks = $this->getPuroksForFilter();
        $privileges = $this->getPrivilegesForFilter();
        $civilStatusOptions = $this->getCivilStatusOptions();
        $ageRanges = $this->getAgeRanges();

        Log::info('Residents index response (Server-Side)', [
            'total_residents' => $residents->total(),
            'current_page' => $residents->currentPage(),
            'filters_applied' => $request->only(['search', 'status', 'purok_id', 'gender']),
        ]);

        return Inertia::render('admin/Residents/Index', [
            'residents' => $residents,
            'filters' => $request->only([
                'search', 'status', 'purok_id', 'gender', 'min_age', 'max_age',
                'civil_status', 'is_voter', 'is_head', 'privilege_id', 'privilege', 
                'sort_by', 'sort_order'
            ]),
            'stats' => $stats,
            'puroks' => $puroks,
            'privileges' => $privileges,
            'civilStatusOptions' => $civilStatusOptions,
            'ageRanges' => $ageRanges,
        ]);
    }

    private function getPaginatedResidents(Request $request)
    {
        $query = Resident::with([
                'householdMemberships.household', 
                'purok', 
                'residentPrivileges.privilege'
            ]);

        // Apply all filters
        $this->applyFilters($query, $request);
        
        // Apply sorting
        $this->applySorting($query, $request);

        // Paginate and format each resident
        return $query->paginate(15)
            ->withQueryString()
            ->through(fn($resident) => $this->formatResident($resident));
    }

    private function applyFilters($query, Request $request)
    {
        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('resident_id', 'like', "%{$search}%")
                  ->orWhereHas('purok', fn($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('householdMemberships.household', fn($q) => $q->where('household_number', 'like', "%{$search}%"))
                  ->orWhereHas('residentPrivileges.privilege', fn($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('residentPrivileges', fn($q) => $q->where('id_number', 'like', "%{$search}%"));
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Purok filter
        if ($request->has('purok_id') && $request->purok_id !== 'all') {
            $query->where('purok_id', $request->purok_id);
        }

        // Gender filter
        if ($request->has('gender') && $request->gender !== 'all') {
            $query->where('gender', $request->gender);
        }

        // Age range filter
        if ($request->has('min_age') && $request->min_age) {
            $query->where('age', '>=', $request->min_age);
        }
        if ($request->has('max_age') && $request->max_age) {
            $query->where('age', '<=', $request->max_age);
        }

        // Civil status filter
        if ($request->has('civil_status') && $request->civil_status !== 'all') {
            $query->where('civil_status', $request->civil_status);
        }

        // Voter filter
        if ($request->has('is_voter') && $request->is_voter !== 'all') {
            $isVoter = $request->is_voter === 'yes' || $request->is_voter === '1';
            $query->where('is_voter', $isVoter);
        }

        // Household head filter
        if ($request->has('is_head') && $request->is_head !== 'all') {
            $isHead = $request->is_head === 'yes' || $request->is_head === '1';
            $method = $isHead ? 'whereHas' : 'whereDoesntHave';
            $query->$method('householdMemberships', fn($q) => $q->where('is_head', true));
        }

        // Privilege filter
        if ($request->has('privilege_id') && $request->privilege_id !== 'all') {
            $query->whereHas('residentPrivileges', fn($q) => $q->where('privilege_id', $request->privilege_id));
        }

        if ($request->has('privilege') && $request->privilege !== 'all') {
            $query->whereHas('residentPrivileges.privilege', fn($q) => $q->where('code', $request->privilege));
        }
    }

    private function applySorting($query, Request $request)
    {
        $sortBy = $request->input('sort_by', 'last_name');
        $sortOrder = $request->input('sort_order', 'asc');
        
        // Validate sort field to prevent SQL injection
        $allowedSortFields = [
            'first_name', 'last_name', 'age', 'gender', 
            'civil_status', 'created_at', 'status', 'resident_id'
        ];
        
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('last_name', 'asc')->orderBy('first_name', 'asc');
        }
    }

    private function formatResident($resident): array
    {
        $privileges = $resident->residentPrivileges->map(fn($rp) => $this->formatPrivilege($rp))->toArray();

        return [
            'id' => $resident->id,
            'resident_id' => $resident->resident_id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'full_name' => $resident->full_name,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'address' => $resident->address,
            'purok_id' => $resident->purok_id,
            'purok' => $resident->purok ? [
                'id' => $resident->purok->id,
                'name' => $resident->purok->name,
            ] : null,
            'occupation' => $resident->occupation,
            'education' => $resident->education,
            'religion' => $resident->religion,
            'is_voter' => (bool) $resident->is_voter,
            'birth_date' => $resident->birth_date?->toISOString(),
            'place_of_birth' => $resident->place_of_birth,
            'remarks' => $resident->remarks,
            'status' => $resident->status,
            'photo_url' => $resident->photo_url,
            'has_photo' => $resident->has_photo,
            'created_at' => $resident->created_at->toISOString(),
            'updated_at' => $resident->updated_at->toISOString(),
            'privileges' => $privileges,
            'privileges_count' => count($privileges),
            'active_privileges_count' => count(array_filter($privileges, fn($p) => $p['is_active'])),
            'household_memberships' => $resident->householdMemberships->map(fn($m) => [
                'id' => $m->id,
                'household_id' => $m->household_id,
                'relationship_to_head' => $m->relationship_to_head,
                'is_head' => (bool) $m->is_head,
                'household' => $m->household ? [
                    'id' => $m->household->id,
                    'household_number' => $m->household->household_number,
                    'head_of_family' => $m->household->head_of_family,
                ] : null,
            ])->toArray(),
        ];
    }

    private function calculateStatistics(): array
    {
        // Cache statistics for 5 minutes to reduce database load
        return cache()->remember('residents.statistics', 300, function () {
            $allPrivileges = Privilege::where('is_active', true)->get();
            
            $stats = [
                'total' => Resident::count(),
                'active' => Resident::where('status', 'active')->count(),
                'newThisMonth' => Resident::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'totalHouseholds' => Household::count(),
                'avgAge' => round(Resident::avg('age') ?? 0, 1),
                'maleCount' => Resident::where('gender', 'male')->count(),
                'femaleCount' => Resident::where('gender', 'female')->count(),
                'otherCount' => Resident::where('gender', 'other')->count(),
                'voterCount' => Resident::where('is_voter', true)->count(),
                'headCount' => HouseholdMember::where('is_head', true)->count(),
            ];

            foreach ($allPrivileges as $privilege) {
                $key = strtolower($privilege->code) . 'Count';
                $stats[$key] = ResidentPrivilege::where('privilege_id', $privilege->id)->count();
                $stats['active' . ucfirst($key)] = ResidentPrivilege::where('privilege_id', $privilege->id)
                    ->active()
                    ->count();
            }

            return $stats;
        });
    }

    private function getPuroksForFilter(): array
    {
        return cache()->remember('puroks.active', 3600, function () {
            return Purok::where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn($p) => ['id' => $p->id, 'name' => $p->name])
                ->values()
                ->toArray();
        });
    }

    private function getPrivilegesForFilter(): array
    {
        return cache()->remember('privileges.active', 3600, function () {
            return Privilege::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'code' => $p->code,
                    'description' => $p->description,
                    'discount_percentage' => $p->default_discount_percentage,
                    'requires_id_number' => $p->requires_id_number,
                    'requires_verification' => $p->requires_verification,
                    'validity_years' => $p->validity_years,
                    'category' => $this->getPrivilegeCategory($p),
                ])
                ->values()
                ->toArray();
        });
    }

    private function getAgeRanges(): array
    {
        return [
            ['value' => '0-12', 'label' => 'Children (0-12)', 'min' => 0, 'max' => 12],
            ['value' => '13-19', 'label' => 'Teens (13-19)', 'min' => 13, 'max' => 19],
            ['value' => '20-35', 'label' => 'Young Adults (20-35)', 'min' => 20, 'max' => 35],
            ['value' => '36-59', 'label' => 'Adults (36-59)', 'min' => 36, 'max' => 59],
            ['value' => '60-150', 'label' => 'Seniors (60+)', 'min' => 60, 'max' => 150],
        ];
    }
    
    // Add this method if you need to clear cache when data changes
    public function clearCache()
    {
        cache()->forget('residents.statistics');
        cache()->forget('puroks.active');
        cache()->forget('privileges.active');
        
        return response()->json(['message' => 'Cache cleared successfully']);
    }
}