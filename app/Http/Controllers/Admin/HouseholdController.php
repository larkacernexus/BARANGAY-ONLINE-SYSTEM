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
            ->withCount('householdMembers')
            ->latest()
            ->get()
            ->map(function ($household) {
                // Get head member from household members
                $headMember = $household->householdMembers()->where('is_head', true)->first();
                $headName = $headMember ? $headMember->resident->full_name : 'No Head Assigned';
                
                // Check if household has any user account associated (via resident head)
                $hasUserAccount = false;
                if ($headMember && $headMember->resident) {
                    $hasUserAccount = User::where('resident_id', $headMember->resident->id)
                        ->where('household_id', $household->id)
                        ->exists();
                }
                
                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headName,
                    'member_count' => $household->household_members_count,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'purok' => $household->purok,
                    'created_at' => $household->created_at->toISOString(),
                    'status' => $household->status,
                    'has_user_account' => $hasUserAccount,
                ];
            })
            ->toArray();

        // Get paginated households for initial load structure
        $query = Household::query()
            ->withCount('householdMembers')
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
        
        // Calculate average members correctly
        $totalMembers = Household::withCount('householdMembers')->get()->sum('household_members_count');
        $totalHouseholds = Household::count();
        $averageMembers = $totalHouseholds > 0 ? $totalMembers / $totalHouseholds : 0;
        
        // Count households with user accounts
        $householdsWithAccounts = 0;
        foreach (Household::with('householdMembers')->get() as $household) {
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            if ($headMember && $headMember->resident) {
                if (User::where('resident_id', $headMember->resident->id)
                    ->where('household_id', $household->id)
                    ->exists()) {
                    $householdsWithAccounts++;
                }
            }
        }
        
        $stats = [
            ['label' => 'Total Households', 'value' => $totalHouseholds],
            ['label' => 'Active Households', 'value' => Household::where('status', 'active')->count()],
            ['label' => 'Total Members', 'value' => Resident::count()],
            ['label' => 'Average Members', 'value' => number_format($averageMembers, 1)],
            ['label' => 'With User Accounts', 'value' => $householdsWithAccounts],
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
        $heads = Resident::whereDoesntHave('householdMemberships')
            ->orWhereHas('householdMemberships', function ($query) {
                $query->where('is_head', false); // Include residents who are not heads
            })
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'age' => $resident->age,
                    'address' => $resident->address,
                    'photo_path' => $resident->photo_path,
                    'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                ];
            });
        
        // Get all available residents for adding as members
        $availableResidents = Resident::whereDoesntHave('householdMemberships')
            ->orWhereHas('householdMemberships', function ($query) {
                $query->where('is_head', false);
            })
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'age' => $resident->age,
                    'address' => $resident->address,
                    'photo_path' => $resident->photo_path,
                    'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
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
            'request_data' => $request->except(['members', 'password', '_token']),
        ]);
        
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
            ]);
            
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Validate that there's exactly one head
        $headMembers = collect($request->members)->filter(function($m) {
            return isset($m['relationship']) && $m['relationship'] === 'Head';
        })->count();
        
        if ($headMembers !== 1) {
            return redirect()->back()
                ->withErrors(['members' => 'Household must have exactly one member with "Head" relationship.'])
                ->withInput();
        }
        
        // Get purok from database
        $purok = Purok::find($request->purok_id);
        if (!$purok) {
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
            // Create household FIRST
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
                        
                        // Store head resident
                        if ($isHead) {
                            $headResident = $resident;
                        }
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
                        'status' => 'active',
                        'birth_date' => $member['age'] ? now()->subYears($member['age'])->format('Y-m-d') : null,
                        'gender' => $gender,
                        'civil_status' => 'Single',
                        'photo_path' => null,
                    ]);
                    
                    // Create household member record
                    HouseholdMember::create([
                        'household_id' => $household->id,
                        'resident_id' => $newResident->id,
                        'relationship_to_head' => $member['relationship'],
                        'is_head' => $isHead,
                    ]);
                    
                    // Store head resident
                    if ($isHead) {
                        $headResident = $newResident;
                    }
                }
            }
            
            // Create user account for the household head if requested
            if ($request->boolean('create_user_account') && $headResident) {
                $userCredentials = $this->createUserForHouseholdHead($household, $headResident, $request);
                if ($userCredentials) {
                    session()->flash('user_credentials', $userCredentials);
                }
            }
            
            DB::commit();
            
            Log::info('Household creation completed', [
                'household_id' => $household->id,
                'head_resident_id' => $headResident ? $headResident->id : null,
                'user_account_created' => $request->boolean('create_user_account') ? 'yes' : 'no',
            ]);
            
            return redirect()->route('households.index')
                ->with('success', 'Household created successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error creating household', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
            ]);
            
            return redirect()->back()
                ->with('error', 'Error creating household: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Create user account for HOUSEHOLD HEAD (resident-based)
     */
    private function createUserForHouseholdHead(Household $household, Resident $headResident, Request $request)
    {
        try {
            // Check if there's already a user account for this household head
            $existingUser = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            
            if ($existingUser) {
                // Update user details
                $existingUser->update([
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email ?? $headResident->email,
                    'status' => 'active',
                ]);
                
                Log::info('Household head already has user account', [
                    'household_id' => $household->id,
                    'resident_id' => $headResident->id,
                    'user_id' => $existingUser->id,
                ]);
                
                return [
                    'username' => $existingUser->username,
                    'password' => 'Already exists',
                    'name' => $existingUser->first_name . ' ' . $existingUser->last_name,
                    'email' => $existingUser->email,
                    'user_id' => $existingUser->id,
                ];
            }
            
            // Check if this resident already has a user account for another household
            $existingUserForResident = User::where('resident_id', $headResident->id)->first();
            if ($existingUserForResident) {
                // Update existing user to link to this household
                $existingUserForResident->update([
                    'household_id' => $household->id,
                    'first_name' => $headResident->first_name,
                    'last_name' => $headResident->last_name,
                    'contact_number' => $request->contact_number,
                    'email' => $request->email ?? $headResident->email,
                ]);
                
                Log::info('Updated existing user account for household head', [
                    'household_id' => $household->id,
                    'resident_id' => $headResident->id,
                    'user_id' => $existingUserForResident->id,
                ]);
                
                return [
                    'username' => $existingUserForResident->username,
                    'password' => 'Use existing password',
                    'name' => $existingUserForResident->first_name . ' ' . $existingUserForResident->last_name,
                    'email' => $existingUserForResident->email,
                    'user_id' => $existingUserForResident->id,
                ];
            }
            
            // Generate username based on household number and head's name
            $baseUsername = strtolower(str_replace(['-', ' ', 'HH'], ['', '', 'hh'], $household->household_number));
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
            
            // Get household head role
            $householdRole = Role::where('name', 'Household Head')->first();
            
            if (!$householdRole) {
                $householdRole = Role::create([
                    'name' => 'Household Head',
                    'guard_name' => 'web',
                    'description' => 'Head of household with limited access'
                ]);
            }
            
            // Create user account for HOUSEHOLD HEAD
            $user = User::create([
                'first_name' => $headResident->first_name,
                'last_name' => $headResident->last_name,
                'username' => $username,
                'contact_number' => $request->contact_number,
                'email' => $request->email ?? ($headResident->first_name . '.' . $headResident->last_name . '@example.com'),
                'password' => Hash::make($initialPassword),
                'position' => 'Household Head',
                'role_id' => $householdRole->id,
                'resident_id' => $headResident->id,
                'household_id' => $household->id,
                'status' => 'active',
                'require_password_change' => true,
                'password_changed_at' => null,
                'email_verified_at' => now(),
            ]);
            
            $credentials = [
                'username' => $username,
                'password' => $initialPassword,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'user_id' => $user->id,
                'household_number' => $household->household_number,
                'resident_id' => $headResident->id,
            ];
            
            Log::info('User account created for household head', [
                'household_id' => $household->id,
                'resident_id' => $headResident->id,
                'user_id' => $user->id,
            ]);
            
            return $credentials;
            
        } catch (\Exception $e) {
            Log::error('Error creating user account for household head', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'household_id' => $household->id,
                'resident_id' => $headResident->id,
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
        
        // Check if household head has a user account
        $hasUserAccount = false;
        $userAccount = null;
        if ($headResident) {
            $userAccount = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            $hasUserAccount = $userAccount ? true : false;
        }
        
        // Transform the data for Inertia
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
            'has_user_account' => $hasUserAccount,
            'user_account' => $userAccount ? [
                'id' => $userAccount->id,
                'username' => $userAccount->username,
                'email' => $userAccount->email,
                'status' => $userAccount->status,
                'resident_id' => $userAccount->resident_id,
                'resident_name' => $userAccount->first_name . ' ' . $userAccount->last_name,
            ] : null,
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
                'has_user_account' => User::where('resident_id', $headResident->id)
                    ->where('household_id', $household->id)
                    ->exists(),
            ] : null,
            'created_at' => $household->created_at->toISOString(),
            'updated_at' => $household->updated_at->toISOString(),
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
    
    // Get current member IDs for exclusion logic
    $currentMemberIds = $household->householdMembers()->pluck('resident_id')->toArray();
    
    // Get residents without households OR residents in this household (for head selection)
    $heads = Resident::with('purok')
        ->where(function($query) use ($household, $currentMemberIds) {
            // Residents without any household memberships
            $query->whereDoesntHave('householdMemberships')
                  // OR residents that are in this household
                  ->orWhereHas('householdMemberships', function ($q) use ($household) {
                      $q->where('household_id', $household->id);
                  });
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
        })
        ->values(); // Reset array keys
    
    // Get all available residents for adding as members
    // Residents without households OR residents in this household
    $availableResidents = Resident::with('purok')
        ->where(function($query) use ($household, $currentMemberIds) {
            // Residents without any household memberships
            $query->whereDoesntHave('householdMemberships')
                  // OR residents that are in this household
                  ->orWhereHas('householdMemberships', function ($q) use ($household, $currentMemberIds) {
                      $q->where('household_id', $household->id);
                  });
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
        })
        ->values(); // Reset array keys
    
    // Fetch puroks from database for dropdown
    $puroks = Purok::active()
        ->orderBy('name')
        ->get(['id', 'name'])
        ->toArray();
    
    // Get current household members with their details
    $currentMembers = $household->householdMembers()->with('resident.purok')->get()->map(function ($member) {
        return [
            'id' => $member->resident_id,
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
    })->values()->toArray();
    
    // Get purok for household
    $householdPurok = $household->purok_id ? Purok::find($household->purok_id) : null;
    
    // Get available roles for user creation
    $roles = Role::where('name', 'like', '%household%')
        ->orWhere('name', 'like', '%resident%')
        ->orWhere('name', 'like', '%citizen%')
        ->select(['id', 'name', 'description'])
        ->get();
    
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
            'has_user_account' => false,
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
    Log::info('=== STARTING HOUSEHOLD UPDATE ===', [
        'household_id' => $household->id,
        'household_number' => $household->household_number,
        'user_id' => auth()->id(),
        'user_email' => auth()->user()?->email,
        'timestamp' => now()->toDateTimeString(),
        'request_method' => $request->method(),
        'request_url' => $request->fullUrl(),
    ]);

    // Log the entire request data (be careful with sensitive data in production)
    Log::debug('Update request data', [
        'all_data' => $request->all(),
        'members_count' => count($request->members ?? []),
        'members' => $request->members,
    ]);
    
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
    
    Log::info('Validation passed', [
        'household_id' => $household->id,
    ]);
    
    // FIX: Case-insensitive head check
    $headMembers = collect($request->members)->filter(function($m) {
        return strtolower(trim($m['relationship'])) === 'head';
    })->count();
    
    Log::debug('Head count validation', [
        'head_count' => $headMembers,
        'members' => collect($request->members)->map(fn($m) => [
            'name' => $m['name'],
            'relationship' => $m['relationship'],
            'relationship_lowercase' => strtolower(trim($m['relationship'])),
            'resident_id' => $m['resident_id'] ?? null,
        ])->toArray(),
    ]);
    
    if ($headMembers !== 1) {
        Log::error('Invalid head count', [
            'expected' => 1,
            'actual' => $headMembers,
            'relationships_found' => collect($request->members)->pluck('relationship')->toArray(),
        ]);
        
        return redirect()->back()
            ->withErrors(['members' => 'Household must have exactly one member with "Head" relationship.'])
            ->withInput();
    }
    
    // Validate that there are no duplicate resident_ids
    $residentIds = collect($request->members)
        ->filter(fn($m) => isset($m['resident_id']) && $m['resident_id'])
        ->pluck('resident_id')
        ->toArray();
    
    Log::debug('Resident IDs from request', [
        'resident_ids' => $residentIds,
        'count' => count($residentIds),
    ]);
    
    $duplicateResidentIds = array_diff_assoc($residentIds, array_unique($residentIds));
    if (!empty($duplicateResidentIds)) {
        $duplicateIds = array_unique($duplicateResidentIds);
        
        Log::error('Duplicate resident IDs detected', [
            'duplicate_ids' => $duplicateIds,
            'all_resident_ids' => $residentIds,
            'frequency' => array_count_values($residentIds),
        ]);
        
        return redirect()->back()
            ->withErrors(['members' => 'Duplicate residents found. Each resident can only appear once in a household. Duplicate resident IDs: ' . implode(', ', $duplicateIds)])
            ->withInput();
    }
    
    DB::beginTransaction();
    
    try {
        // Get current state before changes
        $currentHeadMember = $household->householdMembers()->where('is_head', true)->first();
        $currentHeadResidentId = $currentHeadMember ? $currentHeadMember->resident_id : null;
        $currentMemberIds = $household->householdMembers()->pluck('resident_id')->toArray();
        
        Log::info('Current household state', [
            'household_id' => $household->id,
            'current_head_resident_id' => $currentHeadResidentId,
            'current_head_name' => $currentHeadMember?->resident?->full_name,
            'current_member_ids' => $currentMemberIds,
            'current_member_count' => count($currentMemberIds),
        ]);
        
        // Find the new head resident from request - FIX: case-insensitive
        $newHeadResident = null;
        $newHeadResidentId = null;
        
        foreach ($request->members as $index => $member) {
            if (strtolower(trim($member['relationship'])) === 'head') {
                Log::debug('Found head in request', [
                    'index' => $index,
                    'member_data' => [
                        'name' => $member['name'],
                        'relationship' => $member['relationship'],
                        'resident_id' => $member['resident_id'] ?? null,
                        'age' => $member['age'] ?? null,
                    ],
                ]);
                
                if (isset($member['resident_id']) && $member['resident_id']) {
                    $newHeadResidentId = $member['resident_id'];
                    $newHeadResident = Resident::find($newHeadResidentId);
                    
                    Log::debug('Found existing resident for head', [
                        'resident_id' => $newHeadResidentId,
                        'resident_name' => $newHeadResident?->full_name,
                    ]);
                }
                break;
            }
        }
        
        Log::info('Head change detection', [
            'old_head_id' => $currentHeadResidentId,
            'new_head_id' => $newHeadResidentId,
            'head_changed' => ($currentHeadResidentId != $newHeadResidentId) ? 'YES' : 'NO',
        ]);
        
        // Update household
        Log::debug('Updating household record', [
            'update_data' => [
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
            ],
        ]);
        
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
        
        Log::info('Household record updated');
        
        // Clear existing household members
        Log::debug('Clearing existing household members', [
            'members_to_delete' => $currentMemberIds,
            'count' => count($currentMemberIds),
        ]);
        
        $household->householdMembers()->delete();
        
        Log::debug('Existing members cleared');
        
        // Track which residents have been added to avoid duplicates
        $addedResidentIds = [];
        $createdMembers = [];
        
        // Add new household members
        foreach ($request->members as $index => $member) {
            // FIX: case-insensitive head check
            $isHead = strtolower(trim($member['relationship'])) === 'head';
            
            Log::debug('Processing member', [
                'index' => $index,
                'member_name' => $member['name'],
                'relationship' => $member['relationship'],
                'is_head' => $isHead,
                'has_resident_id' => isset($member['resident_id']) && $member['resident_id'],
                'resident_id' => $member['resident_id'] ?? null,
            ]);
            
            // Check if resident is already added (shouldn't happen with validation, but just in case)
            if (isset($member['resident_id']) && $member['resident_id']) {
                if (in_array($member['resident_id'], $addedResidentIds)) {
                    Log::warning('Skipping duplicate resident - THIS SHOULD NOT HAPPEN', [
                        'resident_id' => $member['resident_id'],
                        'member_name' => $member['name'],
                        'already_added_ids' => $addedResidentIds,
                    ]);
                    continue;
                }
            }
            
            if (isset($member['resident_id']) && $member['resident_id']) {
                // Existing resident
                $resident = Resident::find($member['resident_id']);
                
                if ($resident) {
                    Log::debug('Adding existing resident to household', [
                        'resident_id' => $resident->id,
                        'resident_name' => $resident->full_name,
                        'relationship' => $member['relationship'],
                        'is_head' => $isHead,
                    ]);
                    
                    $householdMember = HouseholdMember::create([
                        'household_id' => $household->id,
                        'resident_id' => $member['resident_id'],
                        'relationship_to_head' => ucfirst(strtolower(trim($member['relationship']))), // Normalize to first letter uppercase
                        'is_head' => $isHead,
                    ]);
                    
                    $createdMembers[] = [
                        'type' => 'existing',
                        'resident_id' => $member['resident_id'],
                        'member_id' => $householdMember->id,
                    ];
                    
                    $addedResidentIds[] = $member['resident_id'];
                    
                    // Store head resident
                    if ($isHead) {
                        $newHeadResident = $resident;
                        $newHeadResidentId = $resident->id;
                        
                        Log::debug('Head is existing resident', [
                            'head_resident_id' => $resident->id,
                            'head_name' => $resident->full_name,
                        ]);
                    }
                } else {
                    Log::error('Resident not found', [
                        'resident_id' => $member['resident_id'],
                    ]);
                }
            } else if (!empty($member['name'])) {
                // Create new resident
                Log::debug('Creating new resident', [
                    'name' => $member['name'],
                    'age' => $member['age'] ?? null,
                    'relationship' => $member['relationship'],
                ]);
                
                $nameParts = explode(' ', $member['name'], 2);
                $firstName = $nameParts[0] ?? '';
                $lastName = $nameParts[1] ?? '';
                
                $gender = 'male';
                $femaleRelationships = ['spouse', 'wife', 'daughter', 'mother', 'sister', 'grandmother'];
                $relationshipLower = strtolower(trim($member['relationship']));
                foreach ($femaleRelationships as $relationship) {
                    if (stripos($relationshipLower, $relationship) !== false) {
                        $gender = 'female';
                        break;
                    }
                }
                
                Log::debug('New resident details', [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'gender' => $gender,
                    'age' => $member['age'] ?? null,
                ]);
                
                $newResident = Resident::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'middle_name' => null,
                    'age' => $member['age'] ?? null,
                    'contact_number' => $isHead ? $request->contact_number : null,
                    'address' => $request->address,
                    'purok_id' => $request->purok_id,
                    'status' => 'active',
                    'birth_date' => $member['age'] ? now()->subYears($member['age'])->format('Y-m-d') : null,
                    'gender' => $gender,
                    'civil_status' => 'Single',
                    'photo_path' => null,
                ]);
                
                Log::info('New resident created', [
                    'new_resident_id' => $newResident->id,
                    'full_name' => $newResident->full_name,
                ]);
                
                $householdMember = HouseholdMember::create([
                    'household_id' => $household->id,
                    'resident_id' => $newResident->id,
                    'relationship_to_head' => ucfirst(strtolower(trim($member['relationship']))), // Normalize to first letter uppercase
                    'is_head' => $isHead,
                ]);
                
                $createdMembers[] = [
                    'type' => 'new',
                    'resident_id' => $newResident->id,
                    'member_id' => $householdMember->id,
                ];
                
                $addedResidentIds[] = $newResident->id;
                
                if ($isHead) {
                    $newHeadResident = $newResident;
                    $newHeadResidentId = $newResident->id;
                    
                    Log::debug('Head is new resident', [
                        'head_resident_id' => $newResident->id,
                        'head_name' => $newResident->full_name,
                    ]);
                }
            }
        }
        
        Log::info('Household members created', [
            'total_created' => count($createdMembers),
            'added_resident_ids' => $addedResidentIds,
            'created_members_details' => $createdMembers,
        ]);
        
        // ... rest of your user account logic remains the same ...
        
        // Update actual member count
        $actualMemberCount = $household->householdMembers()->count();
        Log::debug('Updating member count', [
            'previous_count' => $household->member_count,
            'actual_count' => $actualMemberCount,
        ]);
        
        $household->update(['member_count' => $actualMemberCount]);
        
        DB::commit();
        
        Log::info('=== HOUSEHOLD UPDATE COMPLETED SUCCESSFULLY ===', [
            'household_id' => $household->id,
            'household_number' => $household->household_number,
            'new_head_resident_id' => $newHeadResidentId,
            'new_head_name' => $newHeadResident?->full_name,
            'head_changed' => ($currentHeadResidentId != $newHeadResidentId) ? 'YES' : 'NO',
            'final_member_count' => $actualMemberCount,
            'execution_time_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2),
        ]);
        
        return redirect()->route('households.show', $household)
            ->with('success', 'Household updated successfully!');
            
    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('ERROR UPDATING HOUSEHOLD', [
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'error_file' => $e->getFile(),
            'error_line' => $e->getLine(),
            'error_trace' => $e->getTraceAsString(),
            'household_id' => $household->id,
            'user_id' => auth()->id(),
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
            // Get head member before deleting
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            
            // If there's a head with a user account, deactivate it
            if ($headMember && $headMember->resident) {
                $user = User::where('resident_id', $headMember->resident->id)
                    ->where('household_id', $household->id)
                    ->first();
                
                if ($user) {
                    $user->update([
                        'status' => 'inactive',
                        'household_id' => null,
                    ]);
                    
                    Log::info('Deactivated user account for household head', [
                        'user_id' => $user->id,
                        'resident_id' => $headMember->resident->id,
                        'household_id' => $household->id,
                    ]);
                }
            }
            
            // Remove all household members
            $household->householdMembers()->delete();
            
            // Delete the household
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
        if ($resident->householdMemberships()->exists()) {
            $existingHouseholdMember = $resident->householdMemberships()->first();
            if ($existingHouseholdMember->household_id != $household->id) {
                Log::warning('Resident already belongs to another household', [
                    'resident_id' => $resident->id,
                    'current_household_id' => $existingHouseholdMember->household_id,
                    'target_household_id' => $household->id,
                ]);
                
                return redirect()->back()
                    ->with('error', 'Resident already belongs to another household.');
            }
        }
        
        // If adding a new head, remove existing head
        $isHead = $request->relationship === 'Head';
        if ($isHead) {
            $oldHeadMember = $household->householdMembers()->where('is_head', true)->first();
            
            if ($oldHeadMember) {
                // Update old head member to not be head
                $oldHeadMember->update(['is_head' => false]);
                
                // Update old head's user account if exists
                $oldHeadUser = User::where('resident_id', $oldHeadMember->resident_id)
                    ->where('household_id', $household->id)
                    ->first();
                
                if ($oldHeadUser) {
                    // Either deactivate or remove household association
                    $oldHeadUser->update([
                        'household_id' => null,
                        'status' => 'inactive',
                    ]);
                }
            }
        }
        
        // Create household member record
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $request->resident_id,
            'relationship_to_head' => $request->relationship,
            'is_head' => $isHead,
        ]);
        
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
        
        // If removing the head, we need to assign a new head
        if ($member->is_head) {
            // Try to find another member to promote as head (spouse first, then oldest member)
            $spouseMember = $household->householdMembers()
                ->where('relationship_to_head', 'Spouse')
                ->where('id', '!=', $memberId)
                ->first();
            
            if ($spouseMember) {
                // Promote spouse to head
                $spouseMember->update(['is_head' => true]);
                $newHeadResident = Resident::find($spouseMember->resident_id);
                
                // Update or create user account for new head
                if ($newHeadResident) {
                    $this->createOrUpdateUserForHouseholdHead($household, $newHeadResident);
                }
            } else {
                // Find oldest member to promote as head
                $oldestMember = $household->householdMembers()
                    ->with('resident')
                    ->where('id', '!=', $memberId)
                    ->orderByRaw('resident.age DESC')
                    ->first();
                
                if ($oldestMember) {
                    $oldestMember->update(['is_head' => true]);
                    $newHeadResident = Resident::find($oldestMember->resident_id);
                    
                    // Update or create user account for new head
                    if ($newHeadResident) {
                        $this->createOrUpdateUserForHouseholdHead($household, $newHeadResident);
                    }
                } else {
                    // No other members, household will be headless
                    // Deactivate any existing user account for this household
                    $oldHeadUser = User::where('resident_id', $member->resident_id)
                        ->where('household_id', $household->id)
                        ->first();
                    
                    if ($oldHeadUser) {
                        $oldHeadUser->update([
                            'household_id' => null,
                            'status' => 'inactive',
                        ]);
                    }
                }
            }
        }
        
        // Remove the household member record
        $member->delete();
        
        // Decrement member count
        $household->decrement('member_count');
        
        Log::info('Member removed from household successfully', [
            'household_id' => $household->id,
            'resident_id' => $member->resident_id,
            'new_member_count' => $household->member_count,
            'was_head' => $member->is_head,
        ]);
        
        return redirect()->back()
            ->with('success', 'Member removed from household successfully!');
    }
    
    /**
     * Change household head (transfer account to another resident)
     */
    public function changeHead(Request $request, Household $household)
    {
        $request->validate([
            'new_head_resident_id' => 'required|exists:residents,id',
        ]);
        
        Log::info('Changing household head', [
            'household_id' => $household->id,
            'new_head_resident_id' => $request->new_head_resident_id,
        ]);
        
        DB::beginTransaction();
        
        try {
            // Get current head member
            $currentHeadMember = $household->householdMembers()->where('is_head', true)->first();
            $newHeadResident = Resident::find($request->new_head_resident_id);
            
            if (!$newHeadResident) {
                throw new \Exception('Resident not found.');
            }
            
            // Check if new head is a member of this household
            $newHeadMember = $household->householdMembers()
                ->where('resident_id', $request->new_head_resident_id)
                ->first();
            
            if (!$newHeadMember) {
                throw new \Exception('The selected resident is not a member of this household.');
            }
            
            // Update head status
            if ($currentHeadMember) {
                $currentHeadMember->update(['is_head' => false]);
                
                // Deactivate or update old head's user account
                $oldHeadUser = User::where('resident_id', $currentHeadMember->resident_id)
                    ->where('household_id', $household->id)
                    ->first();
                
                if ($oldHeadUser) {
                    $oldHeadUser->update([
                        'household_id' => null,
                        'status' => 'inactive',
                    ]);
                }
            }
            
            $newHeadMember->update([
                'is_head' => true,
                'relationship_to_head' => 'Head'
            ]);
            
            // Create or update user account for new household head
            $userCredentials = $this->createUserForHouseholdHead(
                $household,
                $newHeadResident,
                new Request([
                    'contact_number' => $household->contact_number,
                    'email' => $household->email,
                ])
            );
            
            if ($userCredentials) {
                session()->flash('user_credentials', $userCredentials);
            }
            
            DB::commit();
            
            Log::info('Household head changed successfully', [
                'household_id' => $household->id,
                'old_head_resident_id' => $currentHeadMember ? $currentHeadMember->resident_id : null,
                'new_head_resident_id' => $newHeadResident->id,
            ]);
            
            return redirect()->back()
                ->with('success', 'Household head changed successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error changing household head', [
                'error_message' => $e->getMessage(),
                'household_id' => $household->id,
            ]);
            
            return redirect()->back()
                ->with('error', 'Error changing household head: ' . $e->getMessage());
        }
    }
    
    /**
     * Helper method to create or update user account for household head
     */
    private function createOrUpdateUserForHouseholdHead(Household $household, Resident $headResident)
    {
        // Check if user account already exists for this household head
        $existingUser = User::where('resident_id', $headResident->id)
            ->where('household_id', $household->id)
            ->first();
        
        if ($existingUser) {
            // Update existing user
            $existingUser->update([
                'first_name' => $headResident->first_name,
                'last_name' => $headResident->last_name,
                'contact_number' => $household->contact_number,
                'email' => $household->email ?? $headResident->email,
                'status' => 'active',
            ]);
            
            return $existingUser;
        }
        
        // Check if this resident already has a user account
        $existingUserForResident = User::where('resident_id', $headResident->id)->first();
        if ($existingUserForResident) {
            // Update existing user to link to this household
            $existingUserForResident->update([
                'household_id' => $household->id,
                'first_name' => $headResident->first_name,
                'last_name' => $headResident->last_name,
                'contact_number' => $household->contact_number,
                'email' => $household->email ?? $headResident->email,
                'status' => 'active',
            ]);
            
            return $existingUserForResident;
        }
        
        // Create new user account
        $householdRole = Role::where('name', 'Household Head')->first();
        
        if (!$householdRole) {
            $householdRole = Role::create([
                'name' => 'Household Head',
                'guard_name' => 'web',
                'description' => 'Head of household with limited access'
            ]);
        }
        
        // Generate username
        $baseUsername = strtolower(str_replace(['-', ' ', 'HH'], ['', '', 'hh'], $household->household_number));
        $username = $baseUsername;
        $counter = 1;
        
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }
        
        // Use contact number as initial password
        $initialPassword = $household->contact_number ?: \Illuminate\Support\Str::password(12);
        
        $user = User::create([
            'first_name' => $headResident->first_name,
            'last_name' => $headResident->last_name,
            'username' => $username,
            'contact_number' => $household->contact_number,
            'email' => $household->email ?? ($headResident->first_name . '.' . $headResident->last_name . '@example.com'),
            'password' => Hash::make($initialPassword),
            'position' => 'Household Head',
            'role_id' => $householdRole->id,
            'resident_id' => $headResident->id,
            'household_id' => $household->id,
            'status' => 'active',
            'require_password_change' => true,
            'password_changed_at' => null,
            'email_verified_at' => now(),
        ]);
        
        return $user;
    }
    
    /**
     * Create user account for existing household (if not created during creation)
     */
    public function createUserAccount(Household $household)
    {
        Log::info('Creating user account for existing household', [
            'household_id' => $household->id,
            'user_id' => auth()->id(),
        ]);
        
        DB::beginTransaction();
        
        try {
            // Check if household already has a head with user account
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            if (!$headMember) {
                return redirect()->back()
                    ->with('error', 'Household does not have a head member.');
            }
            
            $headResident = $headMember->resident;
            
            // Check if user account already exists for this household head
            $existingUser = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            
            if ($existingUser) {
                return redirect()->back()
                    ->with('info', 'Household head already has a user account.');
            }
            
            // Create user account
            $userCredentials = $this->createUserForHouseholdHead(
                $household,
                $headResident,
                new Request([
                    'contact_number' => $household->contact_number,
                    'email' => $household->email,
                ])
            );
            
            if ($userCredentials) {
                DB::commit();
                
                session()->flash('user_credentials', $userCredentials);
                
                Log::info('User account created for existing household', [
                    'household_id' => $household->id,
                    'resident_id' => $headResident->id,
                    'user_id' => $userCredentials['user_id'] ?? null,
                ]);
                
                return redirect()->back()
                    ->with('success', 'User account created successfully!');
            } else {
                throw new \Exception('Failed to create user account.');
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error creating user account for household', [
                'error_message' => $e->getMessage(),
                'household_id' => $household->id,
            ]);
            
            return redirect()->back()
                ->with('error', 'Error creating user account: ' . $e->getMessage());
        }
    }
    
    /**
     * Reset user account password for household head
     */
    public function resetUserPassword(Household $household)
    {
        Log::info('Resetting user account password for household head', [
            'household_id' => $household->id,
            'user_id' => auth()->id(),
        ]);
        
        DB::beginTransaction();
        
        try {
            // Get household head
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            if (!$headMember) {
                return redirect()->back()
                    ->with('error', 'Household does not have a head member.');
            }
            
            // Check if user account exists
            $user = User::where('resident_id', $headMember->resident_id)
                ->where('household_id', $household->id)
                ->first();
            
            if (!$user) {
                return redirect()->back()
                    ->with('error', 'Household head does not have a user account.');
            }
            
            // Generate new password (full contact number)
            $newPassword = $household->contact_number;
            if (!$newPassword) {
                $newPassword = \Illuminate\Support\Str::password(12);
            }
            
            // Update password and require change on next login
            $user->update([
                'password' => Hash::make($newPassword),
                'require_password_change' => true,
                'password_changed_at' => null,
            ]);
            
            DB::commit();
            
            $credentials = [
                'username' => $user->username,
                'password' => $newPassword,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
            ];
            
            session()->flash('user_credentials', $credentials);
            
            Log::info('User account password reset', [
                'household_id' => $household->id,
                'user_id' => $user->id,
                'resident_id' => $headMember->resident_id,
            ]);
            
            return redirect()->back()
                ->with('success', 'Password reset successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error resetting user password', [
                'error_message' => $e->getMessage(),
                'household_id' => $household->id,
            ]);
            
            return redirect()->back()
                ->with('error', 'Error resetting password: ' . $e->getMessage());
        }
    }
}