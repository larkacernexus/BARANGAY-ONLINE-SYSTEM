<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purok;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class PurokController extends Controller
{
    /**
     * Display a listing of puroks.
     */
public function index(Request $request)
{
    $query = Purok::query()
        ->withCount(['households', 'residents'])
        ->orderBy('name');

    // Apply search filter
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('leader_name', 'like', "%{$search}%")
              ->orWhere('leader_contact', 'like', "%{$search}%")
              ->orWhere('google_maps_url', 'like', "%{$search}%"); // Added search for Google Maps URL
        });
    }

    // Apply status filter
    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }

    $puroks = $query->paginate(20)
        ->through(function ($purok) {
            return [
                'id' => $purok->id,
                'name' => $purok->name,
                'slug' => $purok->slug ?? str($purok->name)->slug(),
                'description' => $purok->description,
                'leader_name' => $purok->leader_name,
                'leader_contact' => $purok->leader_contact,
                'google_maps_url' => $purok->google_maps_url, // Added this
                'total_households' => $purok->households_count ?? 0,
                'total_residents' => $purok->residents_count ?? 0,
                'status' => $purok->status,
                'created_at' => $purok->created_at,
            ];
        });

    // Calculate stats
    $stats = [
        ['label' => 'Total Puroks', 'value' => Purok::count()],
        ['label' => 'Active Puroks', 'value' => Purok::where('status', 'active')->count()],
        ['label' => 'Total Households', 'value' => Household::count()],
        ['label' => 'Total Residents', 'value' => Resident::count()],
    ];

    return Inertia::render('admin/Puroks/Index', [
        'puroks' => $puroks,
        'stats' => $stats,
        'filters' => $request->only(['search', 'status']),
    ]);
}

    /**
     * Show the form for creating a new purok.
     */
    public function create()
    {
        return Inertia::render('admin/Puroks/Create');
    }

    /**
     * Store a newly created purok.
     */
  public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:100|unique:puroks',
        'description' => 'nullable|string',
        'leader_name' => 'nullable|string|max:200',
        'leader_contact' => 'nullable|string|max:20',
        'status' => 'required|in:active,inactive',
        'google_maps_url' => 'nullable|url|max:500', // Added validation for Google Maps URL
    ]);

    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator)
            ->withInput();
    }

    Purok::create([
        'name' => $request->name,
        'description' => $request->description,
        'leader_name' => $request->leader_name,
        'leader_contact' => $request->leader_contact,
        'status' => $request->status,
        'google_maps_url' => $request->google_maps_url, // Store the Google Maps URL
    ]);

    return redirect()->route('puroks.index')
        ->with('success', 'Purok created successfully!');
}
    /**
     * Display the specified purok.
     */
public function show(Purok $purok, Request $request)
{
    // Load counts for the purok
    $purok->loadCount(['households', 'residents']);
    
    // Get accurate counts
    $householdsCount = $purok->households_count;
    $residentsCount = $purok->residents_count;

    // Load households with pagination
    $householdsQuery = $purok->households()
        ->withCount(['members', 'householdMembers'])
        ->orderBy('household_number');
    
    $households = $householdsQuery->paginate(10, ['*'], 'household_page')
        ->withQueryString();

    // Load residents with pagination
    $residentsQuery = $purok->residents()
        ->orderBy('last_name')
        ->orderBy('first_name');
    
    $residents = $residentsQuery->paginate(15, ['*'], 'resident_page')
        ->withQueryString();

    // Get statistics for this purok - FIXED: Use accurate counts
    $stats = [
        ['label' => 'Total Households', 'value' => $householdsCount, 'icon' => 'home', 'color' => 'blue'],
        ['label' => 'Total Residents', 'value' => $residentsCount, 'icon' => 'users', 'color' => 'green'],
        ['label' => 'Avg. Household Size', 'value' => $householdsCount > 0 
            ? round($residentsCount / $householdsCount, 1) 
            : 0, 'icon' => 'bar-chart-3', 'color' => 'purple'],
        ['label' => 'Status', 'value' => ucfirst($purok->status), 'icon' => 'activity', 'color' => $purok->status === 'active' ? 'green' : 'gray'],
        ['label' => 'Map Location', 'value' => $purok->google_maps_url ? 'Available' : 'Not Set', 'icon' => 'globe', 'color' => $purok->google_maps_url ? 'orange' : 'gray'],
    ];

    // Get recent activities
    $recentHouseholds = $purok->households()
        ->latest()
        ->take(5)
        ->get();
    
    $recentResidents = $purok->residents()
        ->latest()
        ->take(5)
        ->get();

    // Get demographic data
    $demographics = [
        'gender' => [
            'male' => $purok->residents()->where('gender', 'male')->count(),
            'female' => $purok->residents()->where('gender', 'female')->count(),
            'other' => $purok->residents()->where('gender', 'other')->count(),
        ],
        'age_groups' => [
            'children' => $purok->residents()->where('age', '<', 18)->count(),
            'adults' => $purok->residents()->whereBetween('age', [18, 59])->count(),
            'seniors' => $purok->residents()->where('age', '>=', 60)->count(),
        ]
    ];

    // Transform households for the view
    $householdsData = $households->through(function ($household) {
        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'head_of_family' => $household->head_of_family,
            'member_count' => $household->members_count ?? $household->householdMembers()->count(),
            'address' => $household->address,
            'contact_number' => $household->contact_number,
            'created_at' => $household->created_at,
        ];
    });

    // Transform residents for the view
    $residentsData = $residents->through(function ($resident) {
        return [
            'id' => $resident->id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'contact_number' => $resident->contact_number,
            'address' => $resident->address,
            'created_at' => $resident->created_at,
        ];
    });

    return Inertia::render('admin/Puroks/Show', [
        'purok' => [
            'id' => $purok->id,
            'name' => $purok->name,
            'slug' => $purok->slug,
            'description' => $purok->description,
            'leader_name' => $purok->leader_name,
            'leader_contact' => $purok->leader_contact,
            'google_maps_url' => $purok->google_maps_url,
            'latitude' => $purok->latitude,
            'longitude' => $purok->longitude,
            'total_households' => $householdsCount, // Use the accurate count
            'total_residents' => $residentsCount,   // Use the accurate count
            'status' => $purok->status,
            'created_at' => $purok->created_at,
            'updated_at' => $purok->updated_at,
        ],
        'stats' => $stats,
        'recentHouseholds' => $recentHouseholds->map(function ($household) {
            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'head_of_family' => $household->head_of_family,
                'member_count' => $household->householdMembers()->count(),
                'address' => $household->address,
                'contact_number' => $household->contact_number,
                'created_at' => $household->created_at,
            ];
        }),
        'recentResidents' => $recentResidents->map(function ($resident) {
            return [
                'id' => $resident->id,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'age' => $resident->age,
                'gender' => $resident->gender,
                'contact_number' => $resident->contact_number,
                'address' => $resident->address,
                'created_at' => $resident->created_at,
            ];
        }),
        'demographics' => $demographics,
        'households' => [
            'data' => $householdsData->items(),
            'current_page' => $households->currentPage(),
            'last_page' => $households->lastPage(),
            'total' => $householdsCount, // Use the accurate total count
        ],
        'residents' => [
            'data' => $residentsData->items(),
            'current_page' => $residents->currentPage(),
            'last_page' => $residents->lastPage(),
            'total' => $residentsCount, // Use the accurate total count
        ],
    ]);
}
    /**
     * Show the form for editing the specified purok.
     */
   public function edit(Purok $purok)
{
    // Load statistics for the purok
    $purok->loadCount(['households', 'residents']);
    
    return Inertia::render('admin/Puroks/Edit', [
        'purok' => [
            'id' => $purok->id,
            'name' => $purok->name,
            'description' => $purok->description,
            'leader_name' => $purok->leader_name,
            'leader_contact' => $purok->leader_contact,
            'status' => $purok->status,
            'google_maps_url' => $purok->google_maps_url, // Changed from boundaries
            'created_at' => $purok->created_at,
            'updated_at' => $purok->updated_at,
            'households_count' => $purok->households_count,
            'residents_count' => $purok->residents_count,
        ],
    ]);
}

/**
 * Update the specified purok in storage.
 */
public function update(Request $request, Purok $purok)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:100|unique:puroks,name,' . $purok->id,
        'description' => 'nullable|string',
        'leader_name' => 'nullable|string|max:200',
        'leader_contact' => 'nullable|string|max:20',
        'status' => 'required|in:active,inactive',
        'google_maps_url' => 'nullable|url|max:500', // Added validation for Google Maps URL
    ]);

    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator)
            ->withInput();
    }

    // If changing status to inactive and purok has active records, show warning
    if ($request->status === 'inactive' && $purok->status === 'active') {
        $activeHouseholds = $purok->households()->where('status', 'active')->count();
        $activeResidents = $purok->residents()->where('status', 'active')->count();
        
        if ($activeHouseholds > 0 || $activeResidents > 0) {
            return redirect()->back()
                ->with('warning', "This purok has $activeHouseholds active households and $activeResidents active residents. Changing status to inactive may affect these records.")
                ->withInput();
        }
    }

    // Handle google_maps_url data (allow empty string)
    $data = $request->all();
    if (empty($data['google_maps_url'])) {
        $data['google_maps_url'] = null;
    }

    $purok->update($data);

    return redirect()->route('puroks.show', $purok)
        ->with('success', 'Purok updated successfully!');
}
    /**
     * Remove the specified purok.
     */
    public function destroy(Purok $purok)
    {
        // Check if purok has households or residents
        if ($purok->households()->count() > 0 || $purok->residents()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete purok that has households or residents. Update them first.');
        }

        $purok->delete();

        return redirect()->route('puroks.index')
            ->with('success', 'Purok deleted successfully!');
    }

    /**
     * Update statistics for all puroks.
     */
    public function updateStatistics()
    {
        $puroks = Purok::all();
        
        foreach ($puroks as $purok) {
            $purok->updateStatistics();
        }

        return redirect()->route('puroks.index')
            ->with('success', 'Purok statistics updated successfully!');
    }

    /**
     * Get all puroks for dropdown/select.
     */
    public function getAll()
    {
        $puroks = Purok::active()
            ->orderBy('name')
            ->select(['id', 'name'])
            ->get();

        return response()->json($puroks);
    }
}