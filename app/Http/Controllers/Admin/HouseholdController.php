<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Household;
use App\Models\Resident;
use App\Models\Purok; 
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class HouseholdController extends Controller
{
    // Display listing of households
    public function index(Request $request)
    {
        // Get all households (without pagination for client-side filtering)
        $allHouseholds = Household::query()
            ->withCount('members')
            ->latest()
            ->get()
            ->map(function ($household) {
                // Get head member from household members
                $headMember = $household->householdMembers()->where('is_head', true)->first();
                $headName = $headMember ? $headMember->resident->full_name : 'No Head Assigned';
                
                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headName, // Computed from head member
                    'member_count' => $household->members_count,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'purok' => $household->purok,
                    'created_at' => $household->created_at->toISOString(),
                    'status' => $household->status,
                ];
            })
            ->toArray();

        // Get paginated households for initial load structure
        $query = Household::query()
            ->withCount('members')
            ->latest();
        
        // Apply initial filters if any
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                  ->orWhereHas('householdMembers', function ($q) use ($search) {
                      $q->where('is_head', true)
                        ->whereHas('resident', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%");
                        });
                  })
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        if ($request->has('purok_id') && $request->purok_id !== 'all') {
            $query->where('purok_id', $request->input('purok_id'));
        }
        
        $households = $query->paginate(15)->withQueryString();
        
        $stats = [
            ['label' => 'Total Households', 'value' => Household::count()],
            ['label' => 'Active Households', 'value' => Household::where('status', 'active')->count()],
            ['label' => 'Total Members', 'value' => Resident::count()],
            ['label' => 'Average Members', 'value' => number_format(Household::avg('member_count') ?? 0, 1)],
        ];
        
        // Fetch puroks from database as objects
        $puroks = Purok::active()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'leader_name', 'leader_contact', 
                   'total_households', 'total_residents', 'status', 'google_maps_url', 
                   'created_at', 'updated_at'])
            ->toArray();
        
        return Inertia::render('admin/Households/Index', [
            'households' => $households,
            'allHouseholds' => $allHouseholds,
            'stats' => $stats,
            'puroks' => $puroks,
            'filters' => $request->only(['search', 'status', 'purok_id', 'sort_by', 'sort_order']),
        ]);
    }
    
    /**
     * Show the form for creating a new household.
     */
    public function create()
    {
        // Get residents without households or those who can be heads
        $heads = Resident::whereNull('household_id')
            ->orWhere('household_id', '')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'age' => $resident->age,
                    'address' => $resident->address,
                ];
            });
        
        // Get all available residents for adding as members
        $availableResidents = Resident::whereNull('household_id')
            ->orWhere('household_id', '')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'age' => $resident->age,
                    'address' => $resident->address,
                ];
            });
        
        // Fetch puroks with id and name
        $puroks = Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($purok) {
                return [
                    'id' => $purok->id,
                    'name' => $purok->name,
                ];
            })
            ->toArray();
        
        // Get available roles for user creation
        $roles = Role::where('name', 'like', '%household%')
            ->orWhere('name', 'like', '%resident%')
            ->orWhere('name', 'like', '%citizen%')
            ->select(['id', 'name', 'description'])
            ->get();
        
        return Inertia::render('admin/Households/Create', [
            'heads' => $heads,
            'available_residents' => $availableResidents,
            'puroks' => $puroks,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created household in storage.
     */
    public function store(Request $request)
    {
        Log::info('Household creation started', [
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->email ?? 'unknown',
            'request_data' => $request->except(['members', 'password', '_token']),
            'members_received' => $request->members,
        ]);
        
        // REMOVED head_of_family and head_resident_id validation - they don't exist in DB
        $validator = Validator::make($request->all(), [
            'household_number' => 'nullable|string|max:50|unique:households',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'purok_id' => 'required|exists:puroks,id',
            'total_members' => 'required|integer|min:1',
            'income_range' => 'nullable|string|max:50',
            'housing_type' => 'nullable|string|max:100',
            'ownership_status' => 'nullable|string|max:50',
            'water_source' => 'nullable|string|max:100',
            'electricity' => 'boolean',
            'internet' => 'boolean',
            'vehicle' => 'boolean',
            'remarks' => 'nullable|string',
            'members' => 'required|array|min:1',
            'members.*.name' => 'required|string|max:200',
            'members.*.relationship' => 'required|string|max:50',
            'members.*.age' => 'nullable|integer|min:0|max:120',
            'members.*.resident_id' => 'nullable|exists:residents,id',
            'create_user_account' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            Log::warning('Household creation validation failed', [
                'errors' => $validator->errors()->toArray(),
                'user_id' => auth()->id(),
                'members_data' => $request->members,
            ]);
            
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Validate that there's exactly one head (based on relationship field)
        $headMembers = collect($request->members)->filter(function($m) {
            return isset($m['relationship']) && $m['relationship'] === 'Head';
        })->count();
        
        if ($headMembers !== 1) {
            Log::warning('Household must have exactly one head member', [
                'head_count' => $headMembers,
                'user_id' => auth()->id(),
                'all_relationships' => collect($request->members)->pluck('relationship')->toArray(),
            ]);
            
            return redirect()->back()
                ->withErrors(['members' => 'Household must have exactly one member with "Head" relationship. Found: ' . $headMembers])
                ->withInput();
        }
        
        // Get purok from database
        $purok = Purok::find($request->purok_id);
        if (!$purok) {
            Log::warning('Invalid purok selected', [
                'purok_id' => $request->purok_id,
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->back()
                ->with('error', 'Invalid purok selected.')
                ->withInput();
        }
        
        // Generate household number if not provided
        $householdNumber = $request->household_number;
        if (!$householdNumber) {
            $year = date('Y');
            $lastHousehold = Household::where('household_number', 'like', "HH-{$year}-%")
                ->orderBy('id', 'desc')
                ->first();
            
            if ($lastHousehold) {
                $lastNumber = (int) substr($lastHousehold->household_number, -5);
                $newNumber = str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '00001';
            }
            
            $householdNumber = "HH-{$year}-{$newNumber}";
        }
        
        DB::beginTransaction();
        
        try {
            Log::info('Creating household record', [
                'household_number' => $householdNumber,
                'purok_id' => $request->purok_id,
            ]);
            
            // REMOVED head_of_family and head_resident_id from household creation
            $household = Household::create([
                'household_number' => $householdNumber,
                'contact_number' => $request->contact_number,
                'email' => $request->email,
                'address' => $request->address,
                'purok_id' => $request->purok_id,
                'member_count' => $request->total_members,
                'income_range' => $request->income_range,
                'housing_type' => $request->housing_type,
                'ownership_status' => $request->ownership_status,
                'water_source' => $request->water_source,
                'electricity' => $request->boolean('electricity'),
                'internet' => $request->boolean('internet'),
                'vehicle' => $request->boolean('vehicle'),
                'remarks' => $request->remarks,
                'status' => 'active',
            ]);
            
            Log::info('Household created successfully', [
                'household_id' => $household->id,
                'household_number' => $household->household_number,
            ]);
            
            $headResident = null;
            
            // Process household members
            foreach ($request->members as $index => $member) {
                if (!isset($member['relationship'])) {
                    Log::warning('Member missing relationship', [
                        'member_index' => $index,
                        'member_data' => $member,
                    ]);
                    continue;
                }
                
                $isHead = $member['relationship'] === 'Head';
                
                if (isset($member['resident_id']) && $member['resident_id']) {
                    // This is an existing resident
                    $resident = Resident::find($member['resident_id']);
                    
                    if ($resident) {
                        // Create household member record
                        HouseholdMember::create([
                            'household_id' => $household->id,
                            'resident_id' => $member['resident_id'],
                            'relationship_to_head' => $member['relationship'],
                            'is_head' => $isHead,
                        ]);
                        
                        // Update the resident's household_id and purok_id
                        $resident->update([
                            'household_id' => $household->id,
                            'purok_id' => $request->purok_id,
                        ]);
                        
                        // Store head resident for user creation
                        if ($isHead) {
                            $headResident = $resident;
                        }
                    }
                    
                } else if (!empty($member['name'])) {
                    // Create new resident and household member record
                    $nameParts = explode(' ', $member['name'], 2);
                    $firstName = $nameParts[0] ?? '';
                    $lastName = $nameParts[1] ?? '';
                    
                    // Try to determine gender from relationship
                    $gender = 'male'; // default
                    $femaleRelationships = ['Spouse', 'Wife', 'Daughter', 'Mother', 'Sister', 'Grandmother'];
                    foreach ($femaleRelationships as $relationship) {
                        if (stripos($member['relationship'], $relationship) !== false) {
                            $gender = 'female';
                            break;
                        }
                    }
                    
                    $newResident = Resident::create([
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'middle_name' => null,
                        'age' => $member['age'] ?? null,
                        'contact_number' => $isHead ? $request->contact_number : null,
                        'address' => $request->address,
                        'purok_id' => $request->purok_id,
                        'household_id' => $household->id,
                        'status' => 'active',
                        'birth_date' => $member['age'] ? now()->subYears($member['age'])->format('Y-m-d') : null,
                        'gender' => $gender,
                        'civil_status' => 'Single',
                    ]);
                    
                    // Create household member record
                    HouseholdMember::create([
                        'household_id' => $household->id,
                        'resident_id' => $newResident->id,
                        'relationship_to_head' => $member['relationship'],
                        'is_head' => $isHead,
                    ]);
                    
                    // Store head resident for user creation
                    if ($isHead) {
                        $headResident = $newResident;
                    }
                }
            }
            
            // Create user account for the head if requested
            if ($headResident && $request->boolean('create_user_account')) {
                $userCredentials = $this->createUserForHead($headResident, $household, $request);
                if ($userCredentials) {
                    // Store credentials for display
                    session()->flash('user_credentials', $userCredentials);
                }
            }
            
            DB::commit();
            
            Log::info('Household creation completed successfully', [
                'household_id' => $household->id,
                'household_number' => $household->household_number,
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->route('households.index')
                ->with('success', 'Household created successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error creating household', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'household_number' => $householdNumber ?? 'unknown',
            ]);
            
            return redirect()->back()
                ->with('error', 'Error creating household: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Create user account for household head
     */
    private function createUserForHead(Resident $resident, Household $household, Request $request)
    {
        try {
            // Check if user already exists for this resident by email or username
            $existingUser = User::where('email', $request->email)
                ->orWhere('username', 'like', strtolower($resident->first_name . '.' . $resident->last_name) . '%')
                ->first();
                
            if ($existingUser) {
                // Update household with existing user_id
                $household->update(['user_id' => $existingUser->id]);
                
                return [
                    'username' => $existingUser->username,
                    'password' => 'Already exists',
                    'name' => $existingUser->first_name . ' ' . $existingUser->last_name,
                    'email' => $existingUser->email,
                    'user_id' => $existingUser->id,
                ];
            }
            
            // Generate username (firstname.lastname or with numbers if exists)
            $baseUsername = strtolower($resident->first_name . '.' . $resident->last_name);
            $username = $baseUsername;
            $counter = 1;
            
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }
            
            // Generate initial password - FULL contact number
            $initialPassword = $request->contact_number;
            
            if (!$initialPassword) {
                $initialPassword = \Illuminate\Support\Str::password(12);
            }
            
            // Get household head role or create if doesn't exist
            $householdRole = Role::where('name', 'Household Head')->first();
            
            if (!$householdRole) {
                $householdRole = Role::create([
                    'name' => 'Household Head',
                    'guard_name' => 'web',
                    'description' => 'Head of household with limited access'
                ]);
            }
            
            // Create user
            $user = User::create([
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'username' => $username,
                'contact_number' => $request->contact_number,
                'email' => $request->email ?? ($resident->first_name . '.' . $resident->last_name . '@example.com'),
                'password' => Hash::make($initialPassword),
                'position' => 'Household Head',
                'department_id' => null,
                'role_id' => $householdRole->id,
                'status' => 'active',
                'require_password_change' => true,
                'password_changed_at' => null,
                'email_verified_at' => now(),
            ]);
            
            // Update household with the newly created user_id
            $household->update(['user_id' => $user->id]);
            
            $credentials = [
                'username' => $username,
                'password' => $initialPassword,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'user_id' => $user->id,
            ];
            
            return $credentials;
            
        } catch (\Exception $e) {
            Log::error('Error creating user account for household head', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'resident_id' => $resident->id,
                'household_id' => $household->id,
            ]);
            
            return null;
        }
    }

    /**
     * Display the specified household.
     */
    public function show(Household $household)
    {
        Log::info('Viewing household details', [
            'household_id' => $household->id,
            'household_number' => $household->household_number,
            'user_id' => auth()->id(),
        ]);
        
        // Load household with members and their resident details
        $household->load([
            'householdMembers.resident.purok',
            'purok',
        ]);
        
        // Get head member
        $headMember = $household->householdMembers()->where('is_head', true)->first();
        $headResident = $headMember ? $headMember->resident : null;
        
        // Transform the data for Inertia - REMOVED head_of_family and head_resident_id
        $householdData = [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'address' => $household->address,
            'purok' => $household->purok ? $household->purok->name : null,
            'purok_id' => $household->purok_id,
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
            'household_members' => $household->householdMembers->map(function ($member) {
                return [
                    'id' => $member->id,
                    'resident_id' => $member->resident_id,
                    'relationship_to_head' => $member->relationship_to_head,
                    'is_head' => (bool) $member->is_head,
                    'resident' => [
                        'id' => $member->resident->id,
                        'first_name' => $member->resident->first_name,
                        'last_name' => $member->resident->last_name,
                        'middle_name' => $member->resident->middle_name,
                        'age' => (int) $member->resident->age,
                        'gender' => $member->resident->gender,
                        'civil_status' => $member->resident->civil_status,
                        'contact_number' => $member->resident->contact_number,
                        'purok' => $member->resident->purok ? $member->resident->purok->name : null,
                        'purok_id' => $member->resident->purok_id,
                        'photo_path' => $member->resident->photo_path,
                        'photo_url' => $member->resident->photo_path ? Storage::url($member->resident->photo_path) : null,
                    ]
                ];
            }),
            'head_resident' => $headResident ? [
                'id' => $headResident->id,
                'first_name' => $headResident->first_name,
                'last_name' => $headResident->last_name,
                'middle_name' => $headResident->middle_name,
                'age' => (int) $headResident->age,
                'gender' => $headResident->gender,
                'civil_status' => $headResident->civil_status,
                'contact_number' => $headResident->contact_number,
                'purok' => $headResident->purok ? $headResident->purok->name : null,
                'purok_id' => $headResident->purok_id,
                'photo_path' => $headResident->photo_path,
                'photo_url' => $headResident->photo_path ? Storage::url($headResident->photo_path) : null,
            ] : null,
        ];
        
        return Inertia::render('admin/Households/Show', [
            'household' => $householdData,
        ]);
    }

    public function edit(Household $household)
    {
        Log::info('Editing household', [
            'household_id' => $household->id,
            'household_number' => $household->household_number,
            'user_id' => auth()->id(),
        ]);
        
        // Get residents without households or those who can be heads
        $heads = Resident::with('purok')
            ->where(function($query) {
                $query->whereNull('household_id')
                      ->orWhere('household_id', '');
            })
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'purok_id', 'photo_path'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'age' => $resident->age,
                    'address' => $resident->address,
                    'purok_id' => $resident->purok_id,
                    'purok_name' => $resident->purok ? $resident->purok->name : null,
                    'photo_path' => $resident->photo_path,
                    'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                ];
            });
        
        // Get all available residents for adding as members (excluding current members)
        $currentMemberIds = $household->householdMembers()->pluck('resident_id')->toArray();
        
        $availableResidents = Resident::with('purok')
            ->where(function($query) use ($currentMemberIds) {
                $query->whereNull('household_id')
                      ->orWhere('household_id', '')
                      ->orWhereIn('id', $currentMemberIds);
            })
            ->when(!empty($currentMemberIds), function($query) use ($currentMemberIds) {
                $query->whereNotIn('id', $currentMemberIds);
            })
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'purok_id', 'photo_path'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'age' => $resident->age,
                    'address' => $resident->address,
                    'purok_id' => $resident->purok_id,
                    'purok_name' => $resident->purok ? $resident->purok->name : null,
                    'photo_path' => $resident->photo_path,
                    'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                ];
            });
        
        // Fetch puroks from database for dropdown
        $puroks = Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
        
        // Get current household members with their details
        $currentMembers = $household->householdMembers()->with('resident.purok')->get()->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => trim($member->resident->first_name . ' ' . $member->resident->last_name),
                'relationship' => $member->relationship_to_head,
                'age' => $member->resident->age,
                'resident_id' => $member->resident->id,
                'household_member_id' => $member->id,
                'is_head' => (bool) $member->is_head,
                'purok_id' => $member->resident->purok_id,
                'purok_name' => $member->resident->purok ? $member->resident->purok->name : null,
                'photo_path' => $member->resident->photo_path,
                'photo_url' => $member->resident->photo_path ? Storage::url($member->resident->photo_path) : null,
            ];
        })->toArray();
        
        // Get purok for household
        $householdPurok = $household->purok_id ? Purok::find($household->purok_id) : null;
        
        // Get available roles for user creation
        $roles = Role::where('name', 'like', '%household%')
            ->orWhere('name', 'like', '%resident%')
            ->orWhere('name', 'like', '%citizen%')
            ->select(['id', 'name', 'description'])
            ->get();
        
        // REMOVED head_of_family and head_resident_id from household data
        return Inertia::render('admin/Households/Edit', [
            'household' => [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'contact_number' => $household->contact_number,
                'email' => $household->email,
                'address' => $household->address,
                'purok_id' => $household->purok_id,
                'purok_name' => $householdPurok ? $householdPurok->name : null,
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

    public function update(Request $request, Household $household)
    {
        Log::info('Updating household', [
            'household_id' => $household->id,
            'household_number' => $household->household_number,
            'user_id' => auth()->id(),
            'request_data' => $request->except(['members', 'password', '_token']),
        ]);
        
        // REMOVED head_of_family and head_resident_id from validation
        $validator = Validator::make($request->all(), [
            'household_number' => 'required|string|max:50|unique:households,household_number,' . $household->id,
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'purok_id' => 'required|exists:puroks,id',
            'total_members' => 'required|integer|min:1',
            'income_range' => 'nullable|string|max:50',
            'housing_type' => 'nullable|string|max:100',
            'ownership_status' => 'nullable|string|max:50',
            'water_source' => 'nullable|string|max:100',
            'electricity' => 'boolean',
            'internet' => 'boolean',
            'vehicle' => 'boolean',
            'remarks' => 'nullable|string',
            'members' => 'required|array|min:1',
            'members.*.name' => 'required|string|max:200',
            'members.*.relationship' => 'required|string|max:50',
            'members.*.age' => 'nullable|integer|min:0|max:120',
            'members.*.resident_id' => 'nullable|exists:residents,id',
            'members.*.purok_id' => 'nullable|exists:puroks,id',
        ]);
        
        if ($validator->fails()) {
            Log::warning('Household update validation failed', [
                'household_id' => $household->id,
                'errors' => $validator->errors()->toArray(),
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Validate that there's exactly one head (based on relationship field)
        $headMembers = collect($request->members)->filter(fn($m) => $m['relationship'] === 'Head')->count();
        if ($headMembers !== 1) {
            return redirect()->back()
                ->withErrors(['members' => 'Household must have exactly one member with "Head" relationship.'])
                ->withInput();
        }
        
        DB::beginTransaction();
        
        try {
            // Update household WITHOUT head_of_family and head_resident_id
            $household->update([
                'household_number' => $request->household_number,
                'contact_number' => $request->contact_number,
                'email' => $request->email,
                'address' => $request->address,
                'purok_id' => $request->purok_id,
                'member_count' => $request->total_members,
                'income_range' => $request->income_range,
                'housing_type' => $request->housing_type,
                'ownership_status' => $request->ownership_status,
                'water_source' => $request->water_source,
                'electricity' => $request->boolean('electricity'),
                'internet' => $request->boolean('internet'),
                'vehicle' => $request->boolean('vehicle'),
                'remarks' => $request->remarks,
            ]);
            
            // Clear existing household members
            $household->householdMembers()->delete();
            
            // Add new household members
            foreach ($request->members as $member) {
                $isHead = $member['relationship'] === 'Head';
                
                if (isset($member['resident_id']) && $member['resident_id']) {
                    // This is an existing resident
                    $resident = Resident::find($member['resident_id']);
                    
                    if ($resident) {
                        HouseholdMember::create([
                            'household_id' => $household->id,
                            'resident_id' => $member['resident_id'],
                            'relationship_to_head' => $member['relationship'],
                            'is_head' => $isHead,
                        ]);
                        
                        // Update resident's household_id and purok_id
                        $resident->update([
                            'household_id' => $household->id,
                            'purok_id' => $request->purok_id,
                        ]);
                    }
                } else if (!empty($member['name'])) {
                    // Create new resident
                    $nameParts = explode(' ', $member['name'], 2);
                    $firstName = $nameParts[0] ?? '';
                    $lastName = $nameParts[1] ?? '';
                    
                    // Try to determine gender from relationship
                    $gender = 'male'; // default
                    $femaleRelationships = ['Spouse', 'Wife', 'Daughter', 'Mother', 'Sister', 'Grandmother'];
                    foreach ($femaleRelationships as $relationship) {
                        if (stripos($member['relationship'], $relationship) !== false) {
                            $gender = 'female';
                            break;
                        }
                    }
                    
                    $newResident = Resident::create([
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'middle_name' => null,
                        'age' => $member['age'] ?? null,
                        'contact_number' => $isHead ? $request->contact_number : null,
                        'address' => $request->address,
                        'purok_id' => $request->purok_id,
                        'household_id' => $household->id,
                        'status' => 'active',
                        'birth_date' => $member['age'] ? now()->subYears($member['age'])->format('Y-m-d') : null,
                        'gender' => $gender,
                        'civil_status' => 'Single',
                    ]);
                    
                    HouseholdMember::create([
                        'household_id' => $household->id,
                        'resident_id' => $newResident->id,
                        'relationship_to_head' => $member['relationship'],
                        'is_head' => $isHead,
                    ]);
                }
            }
            
            // Update the actual member count
            $actualMemberCount = $household->householdMembers()->count();
            $household->update(['member_count' => $actualMemberCount]);
            
            DB::commit();
            
            Log::info('Household updated successfully', [
                'household_id' => $household->id,
                'actual_member_count' => $actualMemberCount,
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->route('households.show', $household)
                ->with('success', 'Household updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error updating household', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'household_id' => $household->id,
            ]);
            
            return redirect()->back()
                ->with('error', 'Error updating household: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Remove the specified household from storage.
     */
    public function destroy(Household $household)
    {
        Log::info('Deleting household', [
            'household_id' => $household->id,
            'household_number' => $household->household_number,
            'user_id' => auth()->id(),
        ]);
        
        DB::beginTransaction();
        
        try {
            // Remove all household members
            $household->householdMembers()->delete();
            
            // Remove all residents from this household
            Resident::where('household_id', $household->id)
                ->update(['household_id' => null]);
            
            $household->delete();
            
            DB::commit();
            
            Log::info('Household deleted successfully', [
                'household_id' => $household->id,
                'household_number' => $household->household_number,
            ]);
            
            return redirect()->route('households.index')
                ->with('success', 'Household deleted successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error deleting household', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'household_id' => $household->id,
            ]);
            
            return redirect()->back()
                ->with('error', 'Error deleting household: ' . $e->getMessage());
        }
    }
    
    /**
     * Add member to household
     */
    public function addMember(Request $request, Household $household)
    {
        $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'relationship' => 'required|string|max:50',
        ]);
        
        Log::info('Adding member to household', [
            'household_id' => $household->id,
            'resident_id' => $request->resident_id,
            'user_id' => auth()->id(),
        ]);
        
        $resident = Resident::find($request->resident_id);
        
        // Check if resident already belongs to another household
        if ($resident->household_id && $resident->household_id != $household->id) {
            Log::warning('Resident already belongs to another household', [
                'resident_id' => $resident->id,
                'current_household_id' => $resident->household_id,
                'target_household_id' => $household->id,
            ]);
            
            return redirect()->back()
                ->with('error', 'Resident already belongs to another household.');
        }
        
        // If adding a new head, remove existing head
        $isHead = $request->relationship === 'Head';
        if ($isHead) {
            $household->householdMembers()->where('is_head', true)->update(['is_head' => false]);
        }
        
        // Create household member record
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $request->resident_id,
            'relationship_to_head' => $request->relationship,
            'is_head' => $isHead,
        ]);
        
        $resident->update(['household_id' => $household->id]);
        $household->increment('member_count');
        
        Log::info('Member added to household successfully', [
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'new_member_count' => $household->member_count,
            'is_head' => $isHead,
        ]);
        
        return redirect()->back()
            ->with('success', 'Member added to household successfully!');
    }
    
    /**
     * Remove member from household
     */
    public function removeMember(Household $household, $memberId)
    {
        Log::info('Removing member from household', [
            'household_id' => $household->id,
            'member_id' => $memberId,
            'user_id' => auth()->id(),
        ]);
        
        $member = HouseholdMember::find($memberId);
        
        if (!$member || $member->household_id != $household->id) {
            return redirect()->back()
                ->with('error', 'Member not found in this household.');
        }
        
        // If removing the head, we need to assign a new head or handle this case
        if ($member->is_head) {
            // You might want to assign a new head or require user to select one
            // For now, we'll just remove and let the user reassign
        }
        
        // Remove the household member record
        $member->delete();
        
        // Update resident's household_id to null
        Resident::where('id', $member->resident_id)->update(['household_id' => null]);
        
        // Decrement member count
        $household->decrement('member_count');
        
        Log::info('Member removed from household successfully', [
            'household_id' => $household->id,
            'resident_id' => $member->resident_id,
            'new_member_count' => $household->member_count,
        ]);
        
        return redirect()->back()
            ->with('success', 'Member removed from household successfully!');
    }
}