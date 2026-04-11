<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Official;
use App\Models\Resident;
use App\Models\User;
use App\Models\Role;
use App\Models\Position;
use App\Models\Committee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Official::with([
            'resident' => function ($q) {
                $q->select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'age', 'gender', 'contact_number', 'photo_path');
            },
            'positionData',
            'committeeData',
            'user'
        ]);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->search($search);
        }

        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'current') {
                $query->current();
            } else {
                $query->where('status', $request->status);
            }
        }

        // Apply position filter
        if ($request->filled('position') && $request->position !== 'all') {
            $position = Position::where('code', $request->position)->first();
            if ($position) {
                $query->where('position_id', $position->id);
            }
        }

        // Apply committee filter
        if ($request->filled('committee') && $request->committee !== 'all') {
            $committee = Committee::where('code', $request->committee)->first();
            if ($committee) {
                $query->where('committee_id', $committee->id);
            }
        }

        // Apply type filter
        if ($request->filled('type') && $request->type !== 'all') {
            if ($request->type === 'regular') {
                $query->where('is_regular', true);
            } else if ($request->type === 'ex_officio') {
                $query->where('is_regular', false);
            }
        }

        // Apply sorting - Handle all sort options from dropdown
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        
        switch ($sortBy) {
            case 'position':
                $query->join('positions', 'officials.position_id', '=', 'positions.id')
                      ->orderBy('positions.order', $sortOrder)
                      ->orderBy('positions.name', $sortOrder)
                      ->select('officials.*');
                break;
                
            case 'name':
                $query->join('residents', 'officials.resident_id', '=', 'residents.id')
                      ->orderBy('residents.last_name', $sortOrder)
                      ->orderBy('residents.first_name', $sortOrder)
                      ->orderBy('residents.middle_name', $sortOrder)
                      ->select('officials.*');
                break;
                
            case 'committee':
                $query->leftJoin('committees', 'officials.committee_id', '=', 'committees.id')
                      ->orderBy('committees.name', $sortOrder)
                      ->select('officials.*');
                break;
                
            case 'status':
                $query->orderBy('status', $sortOrder);
                break;
                
            case 'type':
                $query->orderBy('is_regular', $sortOrder === 'asc' ? 'desc' : 'asc');
                break;
                
            case 'start_date':
                $query->orderBy('term_start', $sortOrder);
                break;
                
            case 'order':
                $query->orderBy('order', $sortOrder);
                break;
                
            default:
                $query->orderBy($sortBy, $sortOrder);
                break;
        }

        // Get paginated results
        $officials = $query->paginate($request->get('per_page', 15))->withQueryString();

        // Get positions for filter dropdown
        $positions = Position::active()
            ->ordered()
            ->get()
            ->mapWithKeys(function ($position) {
                return [$position->code => ['name' => $position->name, 'order' => $position->order]];
            });

        // Get committees for filter dropdown
        $committees = Committee::active()
            ->ordered()
            ->get()
            ->mapWithKeys(function ($committee) {
                return [$committee->code => $committee->name];
            });

        // Get stats
        $stats = [
            'total' => Official::count(),
            'active' => Official::where('status', 'active')->count(),
            'inactive' => Official::where('status', 'inactive')->count(),
            'current' => Official::current()->count(),
            'former' => Official::where('status', 'former')->count(),
            'regular' => Official::where('is_regular', true)->count(),
            'ex_officio' => Official::where('is_regular', false)->count(),
            'by_position' => Position::active()->get()->mapWithKeys(function ($position) {
                return [$position->code => Official::where('position_id', $position->id)->count()];
            })->toArray(),
        ];

        return Inertia::render('admin/Officials/Index', [
            'officials' => $officials,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'position', 'committee', 'type', 'sort_by', 'sort_order']),
            'positions' => $positions->toArray(),
            'committees' => $committees->toArray(),
            'statusOptions' => [
                ['value' => 'all', 'label' => 'All Status'],
                ['value' => 'current', 'label' => 'Current Only'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
                ['value' => 'former', 'label' => 'Former'],
            ],
            'typeOptions' => [
                ['value' => 'all', 'label' => 'All Types'],
                ['value' => 'regular', 'label' => 'Regular Officials'],
                ['value' => 'ex_officio', 'label' => 'Ex-Officio Officials'],
            ],
        ]);
    }

    /**
     * End an official's term (make former)
     */
    public function endTerm(Request $request, Official $official)
    {
        Log::info('Ending term for official', [
            'official_id' => $official->id,
            'current_status' => $official->status,
            'current_term_end' => $official->term_end
        ]);

        try {
            // Validate that the official exists and is active
            if ($official->status !== 'active') {
                return redirect()->back()->with('error', 'Only active officials can have their term ended.');
            }

            // Get today's date
            $today = now()->format('Y-m-d');
            
            // Allow ending term on the same day it starts (>= instead of >)
            if ($official->term_start > $today) {
                return redirect()->back()->with('error', 'Cannot end term before it starts.');
            }

            // Start transaction
            DB::beginTransaction();
            
            // Update the official
            $official->update([
                'term_end' => $today,
                'status' => 'former'
            ]);

            // Handle user account if needed
            if ($official->user_id) {
                $this->handleReplacedOfficial($official->resident, $official);
            }

            DB::commit();

            Log::info('Term ended successfully', [
                'official_id' => $official->id,
                'new_status' => $official->status,
                'new_term_end' => $official->term_end
            ]);

            return redirect()->back()->with('success', 'Term ended successfully. Official marked as former.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to end term', [
                'official_id' => $official->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to end term: ' . $e->getMessage());
        }
    }

    /**
     * Reactivate a former official
     */
    public function reactivate(Request $request, Official $official)
    {
        Log::info('Reactivating official', [
            'official_id' => $official->id,
            'current_status' => $official->status
        ]);

        try {
            // Validate that the official is former
            if ($official->status !== 'former') {
                return redirect()->back()->with('error', 'Only former officials can be reactivated.');
            }

            // Set new term end date (3 years from now)
            $newTermEnd = now()->addYears(3)->format('Y-m-d');

            DB::beginTransaction();

            // Update the official
            $official->update([
                'term_end' => $newTermEnd,
                'status' => 'active'
            ]);

            DB::commit();

            Log::info('Official reactivated successfully', [
                'official_id' => $official->id,
                'new_status' => $official->status,
                'new_term_end' => $official->term_end
            ]);

            return redirect()->back()->with('success', 'Official reactivated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to reactivate official', [
                'official_id' => $official->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Failed to reactivate: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get residents who are not currently officials
        $availableResidents = Resident::whereDoesntHave('officials', function ($query) {
            $query->whereIn('status', ['active', 'inactive']);
        })
        ->where('status', 'active')
        ->select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'age', 'gender', 
                 'birth_date', 'civil_status', 'contact_number', 'email', 
                 'address', 'photo_path', 'purok_id')
        ->with(['purok:id,name', 'household:id,household_number,address'])
        ->orderBy('last_name')
        ->get();

        // GET POSITION ACCOUNTS - Users that belong to positions
        $positionUsers = User::with(['resident' => function($q) {
                $q->select('id', 'first_name', 'last_name', 'middle_name', 'suffix');
            }, 'role:id,name'])
            ->where('status', 'active')
            ->whereIn('role_id', Position::active()->pluck('role_id')->unique())
            ->select('id', 'username', 'email', 'role_id', 'resident_id', 'status', 'position')
            ->orderBy('username')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'resident_id' => $user->resident_id,
                    'status' => $user->status,
                    'position' => $user->position,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                    ] : null,
                    'resident' => $user->resident ? [
                        'id' => $user->resident->id,
                        'first_name' => $user->resident->first_name,
                        'last_name' => $user->resident->last_name,
                        'middle_name' => $user->resident->middle_name,
                        'suffix' => $user->resident->suffix,
                        'full_name' => trim($user->resident->first_name . ' ' . 
                                            ($user->resident->middle_name ? $user->resident->middle_name . ' ' : '') . 
                                            $user->resident->last_name . ' ' . 
                                            $user->resident->suffix),
                    ] : null,
                ];
            });

        // Get positions for dropdown
        $positions = Position::active()
            ->ordered()
            ->get()
            ->map(function ($position) {
                return [
                    'id' => $position->id,
                    'code' => $position->code,
                    'name' => $position->name,
                    'order' => $position->order,
                    'role_id' => $position->role_id,
                    'requires_account' => (bool) $position->requires_account,
                ];
            })
            ->toArray();

        // Get committees for dropdown
        $committees = Committee::active()
            ->ordered()
            ->get()
            ->map(function ($committee) {
                return [
                    'id' => $committee->id,
                    'code' => $committee->code,
                    'name' => $committee->name,
                ];
            })
            ->toArray();

        // Get all roles
        $roles = Role::where('is_system_role', true)
            ->orWhere('name', 'like', '%official%')
            ->orWhere('name', 'like', '%household%')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/Officials/Create', [
            'positions' => $positions,
            'committees' => $committees,
            'availableResidents' => $availableResidents,
            'availableUsers' => $positionUsers,
            'defaultTermStart' => now()->format('Y-m-d'),
            'defaultTermEnd' => now()->addYears(3)->format('Y-m-d'),
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'position_id' => 'required|exists:positions,id',
            'committee_id' => 'nullable|exists:committees,id',
            'term_start' => 'required|date',
            'term_end' => 'required|date|after:term_start',
            'status' => 'required|in:active,inactive,former',
            'order' => 'nullable|integer|min:0',
            'responsibilities' => 'nullable|string|max:1000',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'achievements' => 'nullable|string|max:2000',
            'photo' => 'nullable|image|max:2048|mimes:jpg,jpeg,png',
            'is_regular' => 'boolean',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Check if resident already holds an active position
        $existingOfficial = Official::where('resident_id', $validated['resident_id'])
            ->whereIn('status', ['active', 'inactive'])
            ->first();

        if ($existingOfficial) {
            return redirect()->back()->withErrors([
                'resident_id' => 'This resident already holds an official position.'
            ]);
        }

        // Get position details
        $position = Position::findOrFail($validated['position_id']);
        
        // AUTO-ASSIGN USER ID BASED ON POSITION ROLE
        if (empty($validated['user_id'])) {
            $positionAccount = $this->findPositionAccountByRole($position->role_id);
            if ($positionAccount) {
                $validated['user_id'] = $positionAccount->id;
            } else {
                Log::warning("No position account found for role_id: {$position->role_id}");
            }
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('official-photos', 'public');
            $validated['photo_path'] = $path;
        }

        // Set order if not provided
        if (!isset($validated['order'])) {
            $validated['order'] = $position->order;
        }

        // Start transaction
        DB::beginTransaction();
        try {
            // Create the official record
            $official = Official::create($validated);

            // If a user was assigned, update the user's information
            if (!empty($validated['user_id'])) {
                $this->updateAssignedUser($validated['user_id'], $official);
            }

            DB::commit();
            
            return redirect()->route('admin.officials.show', $official)->with('success', 'Official created successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create official: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Official $official)
    {
        $official->load([
            'resident' => function ($query) {
                $query->with(['household', 'purok']);
            },
            'positionData',
            'committeeData',
            'user'
        ]);

        // Get all positions for edit dropdown
        $positions = Position::active()
            ->ordered()
            ->get()
            ->map(function ($position) {
                return [
                    'value' => $position->id,
                    'label' => $position->name,
                ];
            });

        // Get all committees for display
        $committees = Committee::active()
            ->ordered()
            ->get()
            ->mapWithKeys(function ($committee) {
                return [$committee->id => $committee->name];
            })->toArray();

        return Inertia::render('admin/Officials/Show', [
            'official' => [
                'id' => $official->id,
                'resident_id' => $official->resident_id,
                'position_id' => $official->position_id,
                'position_name' => $official->position_name,
                'position_code' => $official->position_code,
                'committee_id' => $official->committee_id,
                'committee_name' => $official->committee_name,
                'committee_code' => $official->committee_code,
                'term_start' => $official->term_start?->format('Y-m-d'),
                'term_end' => $official->term_end?->format('Y-m-d'),
                'term_duration' => $official->term_duration,
                'status' => $official->status,
                'order' => $official->order,
                'responsibilities' => $official->responsibilities,
                'contact_number' => $official->contact_number,
                'email' => $official->email,
                'achievements' => $official->achievements,
                'photo_path' => $official->photo_path,
                'photo_url' => $official->photo_url,
                'is_regular' => $official->is_regular,
                'user_id' => $official->user_id,
                'is_current' => $official->is_current,
                'full_position' => $official->full_position,
                'created_at' => $official->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $official->updated_at?->format('Y-m-d H:i:s'),
                'resident' => $official->resident ? [
                    'id' => $official->resident->id,
                    'full_name' => $official->resident->full_name,
                    'first_name' => $official->resident->first_name,
                    'last_name' => $official->resident->last_name,
                    'middle_name' => $official->resident->middle_name,
                    'suffix' => $official->resident->suffix,
                    'age' => $official->resident->age,
                    'gender' => $official->resident->gender,
                    'birth_date' => $official->resident->birth_date?->format('Y-m-d'),
                    'civil_status' => $official->resident->civil_status,
                    'contact_number' => $official->resident->contact_number,
                    'email' => $official->resident->email,
                    'address' => $official->resident->address,
                    'photo_path' => $official->resident->photo_path,
                    'photo_url' => $official->resident->photo_url,
                    'is_head_of_household' => $official->resident->isHeadOfHousehold(),
                    'purok' => $official->resident->purok ? [
                        'id' => $official->resident->purok->id,
                        'name' => $official->resident->purok->name,
                    ] : null,
                    'household' => $official->resident->household ? [
                        'id' => $official->resident->household->id,
                        'household_number' => $official->resident->household->household_number,
                        'address' => $official->resident->household->address,
                    ] : null,
                ] : null,
                'user' => $official->user ? [
                    'id' => $official->user->id,
                    'username' => $official->user->username,
                    'email' => $official->user->email,
                    'role' => $official->user->role ? $official->user->role->name : null,
                    'status' => $official->user->status,
                ] : null,
            ],
            'positions' => $positions,
            'committees' => $committees,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Official $official)
    {
        $official->load([
            'resident', 
            'positionData',
            'committeeData',
            'user'
        ]);

        // Get all residents for selection
        $availableResidents = Resident::where('status', 'active')
            ->select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'age', 'gender', 
                     'contact_number', 'email', 'address', 'photo_path')
            ->orderBy('last_name')
            ->get();

        // GET POSITION ACCOUNTS - Users that belong to positions
        $positionUsers = User::with(['resident' => function($q) {
                $q->select('id', 'first_name', 'last_name', 'middle_name', 'suffix');
            }, 'role:id,name'])
            ->where('status', 'active')
            ->whereIn('role_id', Position::active()->pluck('role_id')->unique())
            ->select('id', 'username', 'email', 'role_id', 'resident_id', 'status', 'position')
            ->orderBy('username')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'resident_id' => $user->resident_id,
                    'status' => $user->status,
                    'position' => $user->position,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                    ] : null,
                    'resident' => $user->resident ? [
                        'id' => $user->resident->id,
                        'first_name' => $user->resident->first_name,
                        'last_name' => $user->resident->last_name,
                        'middle_name' => $user->resident->middle_name,
                        'suffix' => $user->resident->suffix,
                        'full_name' => trim($user->resident->first_name . ' ' . 
                                            ($user->resident->middle_name ? $user->resident->middle_name . ' ' : '') . 
                                            $user->resident->last_name . ' ' . 
                                            $user->resident->suffix),
                    ] : null,
                ];
            });

        // Get positions
        $positions = Position::active()
            ->ordered()
            ->get()
            ->map(function ($position) {
                return [
                    'id' => $position->id,
                    'code' => $position->code,
                    'name' => $position->name,
                    'order' => $position->order,
                    'role_id' => $position->role_id,
                    'requires_account' => (bool) $position->requires_account,
                ];
            });

        // Get committees
        $committees = Committee::active()
            ->ordered()
            ->get()
            ->map(function ($committee) {
                return [
                    'id' => $committee->id,
                    'code' => $committee->code,
                    'name' => $committee->name,
                ];
            });

        // Get all roles
        $roles = Role::all(['id', 'name']);

        return Inertia::render('admin/Officials/Edit', [
            'official' => [
                'id' => $official->id,
                'resident_id' => $official->resident_id,
                'position_id' => $official->position_id,
                'committee_id' => $official->committee_id,
                'term_start' => $official->term_start->format('Y-m-d'),
                'term_end' => $official->term_end->format('Y-m-d'),
                'status' => $official->status,
                'order' => $official->order,
                'responsibilities' => $official->responsibilities,
                'contact_number' => $official->contact_number,
                'email' => $official->email,
                'achievements' => $official->achievements,
                'photo_path' => $official->photo_path,
                'photo_url' => $official->photo_url,
                'is_regular' => $official->is_regular,
                'user_id' => $official->user_id,
                'user' => $official->user ? [
                    'id' => $official->user->id,
                    'username' => $official->user->username,
                    'email' => $official->user->email,
                    'role_id' => $official->user->role_id,
                    'status' => $official->user->status,
                    'position' => $official->user->position,
                ] : null,
                'resident' => $official->resident ? [
                    'id' => $official->resident->id,
                    'first_name' => $official->resident->first_name,
                    'last_name' => $official->resident->last_name,
                    'middle_name' => $official->resident->middle_name,
                    'suffix' => $official->resident->suffix,
                    'age' => $official->resident->age,
                    'gender' => $official->resident->gender,
                    'contact_number' => $official->resident->contact_number,
                    'email' => $official->resident->email,
                    'address' => $official->resident->address,
                    'photo_path' => $official->resident->photo_path,
                    'photo_url' => $official->resident->photo_url,
                    'purok' => $official->resident->purok,
                ] : null,
            ],
            'positions' => $positions,
            'committees' => $committees,
            'availableResidents' => $availableResidents,
            'availableUsers' => $positionUsers,
            'roles' => $roles,
            'statusOptions' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
                ['value' => 'former', 'label' => 'Former'],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Official $official)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'position_id' => 'required|exists:positions,id',
            'committee_id' => 'nullable|exists:committees,id',
            'term_start' => 'required|date',
            'term_end' => 'required|date|after:term_start',
            'status' => 'required|in:active,inactive,former',
            'order' => 'nullable|integer|min:0',
            'responsibilities' => 'nullable|string|max:1000',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'achievements' => 'nullable|string|max:2000',
            'photo' => 'nullable|image|max:2048|mimes:jpg,jpeg,png',
            'use_resident_photo' => 'boolean',
            'is_regular' => 'boolean',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Check if resident already holds an active position (excluding current official)
        if ($validated['resident_id'] != $official->resident_id) {
            $existingOfficial = Official::where('resident_id', $validated['resident_id'])
                ->where('id', '!=', $official->id)
                ->whereIn('status', ['active', 'inactive'])
                ->first();

            if ($existingOfficial) {
                return redirect()->back()->withErrors([
                    'resident_id' => 'This resident already holds an official position.'
                ]);
            }
        }

        // Get position details
        $position = Position::findOrFail($validated['position_id']);

        // Start transaction
        DB::beginTransaction();
        try {
            // Handle photo upload/removal
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($official->photo_path) {
                    Storage::disk('public')->delete($official->photo_path);
                }
                
                $path = $request->file('photo')->store('official-photos', 'public');
                $validated['photo_path'] = $path;
            } elseif ($request->boolean('use_resident_photo')) {
                // Using resident's photo, so clear official's photo path
                $validated['photo_path'] = null;
            } else {
                // Keep existing photo
                $validated['photo_path'] = $official->photo_path;
            }

            // Set order if not provided
            if (!isset($validated['order']) || empty($validated['order'])) {
                $validated['order'] = $position->order;
            }

            // Check if position or resident changed
            $positionChanged = ($official->position_id != $validated['position_id']);
            $residentChanged = ($official->resident_id != $validated['resident_id']);
            
            if ($positionChanged || $residentChanged) {
                // Handle the replaced official's account
                $this->handleReplacedOfficial($official->resident, $official);
            }

            // Update official record
            $official->update($validated);

            // Handle user assignment changes
            if (isset($validated['user_id'])) {
                if ($validated['user_id'] != $official->user_id) {
                    // User assignment changed
                    if ($validated['user_id']) {
                        // New user assigned
                        $this->updateAssignedUser($validated['user_id'], $official);
                    }
                    
                    if ($official->user_id) {
                        // Old user unassigned
                        $this->handleUserAccountRemoval(User::find($official->user_id), $official);
                    }
                }
            } elseif (empty($validated['user_id']) && $official->user_id) {
                // If user_id is being removed, handle removal
                $this->handleUserAccountRemoval(User::find($official->user_id), $official);
            }

            DB::commit();
            
            return redirect()->route('admin.officials.show', $official)->with('success', 'Official updated successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to update official: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Official $official)
    {
        $resident = $official->resident;
        
        DB::beginTransaction();
        try {
            // Handle the deleted official's account
            $this->handleReplacedOfficial($resident, $official);
            
            // Delete photo if exists
            if ($official->photo_path) {
                Storage::disk('public')->delete($official->photo_path);
            }

            $official->delete();
            
            DB::commit();
            
            return redirect()->route('admin.officials.index')->with('success', 'Official deleted successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to delete official: ' . $e->getMessage()]);
        }
    }

    // ========== HELPER METHODS ==========

    /**
     * Find position account by role ID
     */
    private function findPositionAccountByRole($roleId)
    {
        return User::where('role_id', $roleId)
            ->where(function($query) {
                $query->whereNotNull('position')
                      ->orWhere('username', 'like', '%.bgy');
            })
            ->where('status', 'active')
            ->first();
    }

    /**
     * Update assigned user with official information
     */
    private function updateAssignedUser($userId, $official)
    {
        $user = User::find($userId);
        if (!$user) return;

        $position = $official->positionData;
        if (!$position) return;

        // Update user with official position information
        $user->update([
            'position' => $position->name,
            'current_resident_id' => $official->resident_id,
            'status' => 'active',
        ]);

        // Update household if needed
        if ($official->resident && $official->resident->household) {
            $household = $official->resident->household;
            if (!$household->user_id) {
                $household->update(['user_id' => $user->id]);
            }
        }

        // Log the assignment
        activity()
            ->performedOn($official)
            ->causedBy(auth()->user())
            ->withProperties([
                'user_id' => $user->id,
                'username' => $user->username,
                'resident' => $official->resident->full_name,
                'position' => $position->name,
            ])
            ->log('assigned_position_account');
    }

    /**
     * Handle user account removal
     */
    private function handleUserAccountRemoval($user, $official)
    {
        if (!$user) return;
        
        // Check if user is linked to any other official
        $otherOfficials = Official::where('user_id', $user->id)
            ->where('id', '!=', $official->id)
            ->exists();
        
        if (!$otherOfficials) {
            // Get the position name for the "Former" title
            $positionName = $official->positionData->name ?? 'Official';
            
            // Update user to reflect they're no longer an active official
            $user->update([
                'status' => 'inactive',
                'position' => 'Former ' . $positionName,
                'current_resident_id' => null,
            ]);
        }
    }

    /**
     * Handle replaced official's account
     */
    private function handleReplacedOfficial($resident, $oldOfficial)
    {
        if (!$resident || !$resident->household) return;
        
        $household = $resident->household;
        
        // Check if household has a user account
        if (!$household->user_id) return;
        
        $user = User::find($household->user_id);
        if (!$user) return;
        
        // Check if the user account is currently linked to this resident
        if ($user->current_resident_id !== $resident->id) {
            return;
        }
        
        // Check if resident is a household head
        $isHouseholdHead = $resident->isHeadOfHousehold();

        // Get position using the relationship
        $oldOfficial->load('positionData');
        $position = $oldOfficial->positionData;
        
        if (!$position) return;

        // Handle based on position
        if ($position->isKagawad()) {
            if ($isHouseholdHead) {
                // If household head → CHANGE ROLE to regular household role
                $householdRole = Role::where('name', 'like', '%household%')
                    ->orWhere('name', 'like', '%resident%')
                    ->first();
                
                if ($householdRole) {
                    $user->update([
                        'role_id' => $householdRole->id,
                        'position' => 'Household Head',
                    ]);
                }
            } else {
                // If NOT household head → MAKE ACCOUNT INACTIVE
                $user->update(['status' => 'inactive']);
            }
        }
        elseif ($position->code === 'CAPTAIN') {
            if ($user->position === 'Barangay Captain') {
                $user->update(['position' => 'Former Barangay Captain']);
            }
        }
        elseif (in_array($position->code, ['SECRETARY', 'TREASURER', 'SK-CHAIRMAN'])) {
            if ($user->position === $position->name) {
                $user->update(['position' => 'Former ' . $position->name]);
            }
        }
    }

    /**
     * Generate a username from resident name (kept for backward compatibility)
     */
    private function generateUsername($resident)
    {
        $firstName = strtolower(preg_replace('/[^a-zA-Z]/', '', $resident->first_name));
        $lastName = strtolower(preg_replace('/[^a-zA-Z]/', '', $resident->last_name));
        $randomNum = rand(100, 999);

        $username = $firstName . '.' . $lastName . $randomNum;
        
        // Check if username exists
        $count = 1;
        while (User::where('username', $username)->exists()) {
            $username = $firstName . '.' . $lastName . $randomNum . $count;
            $count++;
        }

        return $username;
    }

    // ========== API ENDPOINTS ==========

    /**
     * Get current officials for display
     */
    public function currentOfficials()
    {
        $officials = Official::with([
            'resident' => function ($query) {
                $query->select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'photo_path');
            },
            'positionData',
            'committeeData'
        ])
        ->current()
        ->orderBy('order')
        ->get();

        return response()->json($officials);
    }

    /**
     * Get officials by committee
     */
    public function byCommittee($committeeId)
    {
        $committee = Committee::find($committeeId);
        
        if (!$committee) {
            return response()->json(['error' => 'Committee not found'], 404);
        }

        $officials = Official::with([
            'resident', 
            'positionData'
        ])
        ->where('committee_id', $committeeId)
        ->where('status', 'active')
        ->orderBy('order')
        ->get();

        return response()->json([
            'committee' => $committee->name,
            'description' => $committee->description,
            'officials' => $officials
        ]);
    }

    /**
     * Update official order (for display sorting)
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'officials' => 'required|array',
            'officials.*.id' => 'required|exists:officials,id',
            'officials.*.order' => 'required|integer',
        ]);

        foreach ($request->officials as $officialData) {
            Official::where('id', $officialData['id'])->update(['order' => $officialData['order']]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    /**
     * Bulk actions
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:officials,id',
        ]);

        DB::beginTransaction();
        try {
            $officials = Official::with(['resident', 'positionData'])->whereIn('id', $request->ids)->get();

            foreach ($officials as $official) {
                // Handle account for each deleted official
                $resident = $official->resident;
                if ($resident) {
                    $this->handleReplacedOfficial($resident, $official);
                }
                
                if ($official->photo_path) {
                    Storage::disk('public')->delete($official->photo_path);
                }
                $official->delete();
            }

            DB::commit();
            
            return response()->json(['message' => 'Officials deleted successfully']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete officials: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Bulk update status - ONE METHOD FOR ALL BULK STATUS CHANGES
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:officials,id',
            'status' => 'required|in:active,inactive,former,current',
        ]);

        $status = $request->status;
        
        if ($status === 'current') {
            Official::whereIn('id', $request->ids)->update([
                'is_current' => true,
                'status' => 'active'
            ]);
        } else {
            Official::whereIn('id', $request->ids)->update(['status' => $status]);
        }

        return redirect()->back()->with('success', 'Status updated successfully');
    }

    /**
     * Export officials
     */
    public function export(Request $request)
    {
        $query = Official::with([
            'resident', 
            'positionData',
            'committeeData'
        ]);

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'current') {
                $query->current();
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('position') && $request->position !== 'all') {
            $position = Position::where('code', $request->position)->first();
            if ($position) {
                $query->where('position_id', $position->id);
            }
        }

        $officials = $query->get();

        // Generate CSV
        $csv = "ID,Resident Name,Position,Committee,Term Start,Term End,Status,Contact,Email,Type\n";
        
        foreach ($officials as $official) {
            $csv .= implode(',', [
                $official->id,
                '"' . ($official->resident->full_name ?? 'N/A') . '"',
                $official->positionData ? $official->positionData->name : 'N/A',
                $official->committeeData ? $official->committeeData->name : 'N/A',
                $official->term_start?->format('Y-m-d') ?? 'N/A',
                $official->term_end?->format('Y-m-d') ?? 'N/A',
                ucfirst($official->status),
                $official->contact_number ?? 'N/A',
                $official->email ?? 'N/A',
                $official->is_regular ? 'Regular' : 'Ex-Officio'
            ]) . "\n";
        }

        $filename = 'officials-export-' . date('Y-m-d') . '.csv';

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}