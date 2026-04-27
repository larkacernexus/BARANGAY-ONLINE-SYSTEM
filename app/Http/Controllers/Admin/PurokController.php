<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purok;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PurokController extends Controller
{
    /**
     * Display a listing of puroks.
     */
    public function index(Request $request)
    {
        $query = Purok::query()
            ->with(['leader'])
            ->withCount(['households', 'residents'])
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('leader', function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"]);
                  })
                  ->orWhere('google_maps_url', 'like', "%{$search}%");
            });
        }

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
                    'leader_id' => $purok->leader_id,
                    'leader_name' => $purok->leader_name,
                    'leader_contact' => $purok->leader_contact,
                    'google_maps_url' => $purok->google_maps_url,
                    'total_households' => $purok->households_count ?? 0,
                    'total_residents' => $purok->residents_count ?? 0,
                    'status' => $purok->status,
                    'created_at' => $purok->created_at,
                ];
            });

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
     * Search residents via AJAX for purok leader selection
     */
    public function searchResidents(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Resident::with('purok')
            ->select([
                'id',
                'first_name',
                'last_name',
                'middle_name',
                'suffix',
                'contact_number',
                'email',
                'address',
                'photo_path',
                'purok_id',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($resident) {
            return [
                'id' => $resident->id,
                'name' => $resident->full_name,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'suffix' => $resident->suffix,
                'contact_number' => $resident->contact_number,
                'email' => $resident->email,
                'address' => $resident->address,
                'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                'purok' => $resident->purok?->name,
                'purok_id' => $resident->purok_id,
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
     * Store a newly created purok.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:puroks',
            'description' => 'nullable|string',
            'leader_id' => 'nullable|exists:residents,id',
            'status' => 'required|in:active,inactive',
            'google_maps_url' => 'nullable|url|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $request->except(['leader_name', 'leader_contact']);
        
        if (empty($data['google_maps_url'])) {
            $data['google_maps_url'] = null;
        }
        
        if ($data['google_maps_url']) {
            $coordinates = $this->extractCoordinatesFromUrl($data['google_maps_url']);
            if ($coordinates) {
                $data['latitude'] = $coordinates['lat'];
                $data['longitude'] = $coordinates['lng'];
            }
        }

        Purok::create($data);

        return redirect()->route('admin.puroks.index')
            ->with('success', 'Purok created successfully!');
    }

    /**
     * Display the specified purok.
     */
    public function show(Purok $purok, Request $request)
    {
        $purok->load(['leader']);
        $purok->loadCount(['households', 'residents']);
        
        $householdsCount = $purok->households_count;
        $residentsCount = $purok->residents_count;

        $householdsQuery = $purok->households()
            ->withCount(['householdMembers'])
            ->with(['householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident');
            }])
            ->orderBy('household_number');
        
        $households = $householdsQuery->paginate(20, ['*'], 'household_page')
            ->withQueryString();

        $residentsQuery = $purok->residents()
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        $residents = $residentsQuery->paginate(20, ['*'], 'resident_page')
            ->withQueryString();

        $stats = [
            ['label' => 'Total Households', 'value' => $householdsCount, 'icon' => 'home', 'color' => 'blue'],
            ['label' => 'Total Residents', 'value' => $residentsCount, 'icon' => 'users', 'color' => 'green'],
            ['label' => 'Avg. Household Size', 'value' => $householdsCount > 0 
                ? round($residentsCount / $householdsCount, 1) 
                : 0, 'icon' => 'bar-chart-3', 'color' => 'purple'],
            ['label' => 'Status', 'value' => ucfirst($purok->status), 'icon' => 'activity', 'color' => $purok->status === 'active' ? 'green' : 'gray'],
            ['label' => 'Map Location', 'value' => $purok->google_maps_url ? 'Available' : 'Not Set', 'icon' => 'globe', 'color' => $purok->google_maps_url ? 'orange' : 'gray'],
        ];

        $recentHouseholds = $purok->households()
            ->with(['householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident');
            }])
            ->latest()
            ->take(5)
            ->get();
        
        $recentResidents = $purok->residents()
            ->latest()
            ->take(5)
            ->get();

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

        $householdsData = $households->through(function ($household) {
            $headMember = $household->householdMembers->firstWhere('is_head', true);
            $headOfFamily = 'No head assigned';
            
            if ($headMember && $headMember->resident) {
                $headOfFamily = $headMember->resident->first_name . ' ' . $headMember->resident->last_name;
            }
            
            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'head_of_family' => $headOfFamily,
                'member_count' => $household->household_members_count ?? $household->householdMembers()->count(),
                'address' => $household->address,
                'contact_number' => $household->contact_number,
                'created_at' => $household->created_at,
                'latitude' => $household->latitude,
                'longitude' => $household->longitude,
                'head_of_household' => $headMember && $headMember->resident ? [
                    'full_name' => $headMember->resident->full_name,
                ] : null,
            ];
        });

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
                'leader_id' => $purok->leader_id,
                'leader_name' => $purok->leader_name,
                'leader_contact' => $purok->leader_contact,
                'leader' => $purok->leader ? [
                    'id' => $purok->leader->id,
                    'full_name' => $purok->leader->full_name,
                    'contact_number' => $purok->leader->contact_number,
                ] : null,
                'google_maps_url' => $purok->google_maps_url,
                'latitude' => $purok->latitude,
                'longitude' => $purok->longitude,
                'total_households' => $householdsCount,
                'total_residents' => $residentsCount,
                'status' => $purok->status,
                'created_at' => $purok->created_at,
                'updated_at' => $purok->updated_at,
            ],
            'stats' => $stats,
            'recentHouseholds' => $recentHouseholds->map(function ($household) {
                $headMember = $household->householdMembers->firstWhere('is_head', true);
                $headOfFamily = 'No head assigned';
                if ($headMember && $headMember->resident) {
                    $headOfFamily = $headMember->resident->first_name . ' ' . $headMember->resident->last_name;
                }
                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headOfFamily,
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
                'total' => $householdsCount,
            ],
            'residents' => [
                'data' => $residentsData->items(),
                'current_page' => $residents->currentPage(),
                'last_page' => $residents->lastPage(),
                'total' => $residentsCount,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified purok.
     */
    public function edit(Purok $purok)
    {
        $purok->load(['leader']);
        $purok->loadCount(['households', 'residents']);
        
        return Inertia::render('admin/Puroks/Edit', [
            'purok' => [
                'id' => $purok->id,
                'name' => $purok->name,
                'description' => $purok->description,
                'leader_id' => $purok->leader_id,
                'leader_name' => $purok->leader_name,
                'leader_contact' => $purok->leader_contact,
                'status' => $purok->status,
                'google_maps_url' => $purok->google_maps_url,
                'latitude' => $purok->latitude,
                'longitude' => $purok->longitude,
                'created_at' => $purok->created_at,
                'updated_at' => $purok->updated_at,
                'households_count' => $purok->households_count,
                'residents_count' => $purok->residents_count,
            ],
        ]);
    }

    /**
     * Update the specified purok.
     */
    public function update(Request $request, Purok $purok)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:puroks,name,' . $purok->id,
            'description' => 'nullable|string',
            'leader_id' => 'nullable|exists:residents,id',
            'status' => 'required|in:active,inactive',
            'google_maps_url' => 'nullable|url|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $request->except(['leader_name', 'leader_contact']);
        
        if (empty($data['google_maps_url'])) {
            $data['google_maps_url'] = null;
        }
        
        if ($data['google_maps_url'] && $data['google_maps_url'] !== $purok->google_maps_url) {
            $coordinates = $this->extractCoordinatesFromUrl($data['google_maps_url']);
            if ($coordinates) {
                $data['latitude'] = $coordinates['lat'];
                $data['longitude'] = $coordinates['lng'];
            } else {
                $data['latitude'] = null;
                $data['longitude'] = null;
            }
        }

        $purok->update($data);

        return redirect()->route('admin.puroks.show', $purok)
            ->with('success', 'Purok updated successfully!');
    }

    /**
     * Remove the specified purok.
     */
    public function destroy(Purok $purok)
    {
        if ($purok->households()->count() > 0 || $purok->residents()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete purok that has households or residents. Update them first.');
        }

        $purok->delete();

        return redirect()->route('admin.puroks.index')
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

        return redirect()->route('admin.puroks.index')
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

    /**
     * Extract latitude and longitude from Google Maps URL
     */
    private function extractCoordinatesFromUrl($url)
    {
        if (!$url) {
            return null;
        }

        try {
            if (strpos($url, 'maps.app.goo.gl') !== false) {
                return $this->extractFromShortUrl($url);
            }
            
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $matches)) {
                return [
                    'lat' => (float) $matches[1],
                    'lng' => (float) $matches[2]
                ];
            }
            
            if (preg_match('/[?&]q=([^&]+)/', $url, $matches)) {
                $query = urldecode($matches[1]);
                if (preg_match('/(-?\d+\.\d+),(-?\d+\.\d+)/', $query, $coordMatches)) {
                    return [
                        'lat' => (float) $coordMatches[1],
                        'lng' => (float) $coordMatches[2]
                    ];
                }
            }
            
            return null;
            
        } catch (\Exception $e) {
            \Log::error('Error extracting coordinates', [
                'url' => $url,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Extract coordinates from Google Maps short URL using cURL
     */
    private function extractFromShortUrl($shortUrl)
    {
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $shortUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_NOBODY, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            
            $response = curl_exec($ch);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            curl_close($ch);
            
            if (!$finalUrl) {
                return null;
            }
            
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                return [
                    'lat' => (float) $matches[1],
                    'lng' => (float) $matches[2]
                ];
            }
            
            if (preg_match('/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                return [
                    'lat' => (float) $matches[1],
                    'lng' => (float) $matches[2]
                ];
            }
            
            if (preg_match('/(\d+\.\d+),(\d+\.\d+)/', $finalUrl, $matches)) {
                return [
                    'lat' => (float) $matches[1],
                    'lng' => (float) $matches[2]
                ];
            }
            
            return null;
            
        } catch (\Exception $e) {
            \Log::error('cURL failed to resolve short URL', [
                'url' => $shortUrl,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}