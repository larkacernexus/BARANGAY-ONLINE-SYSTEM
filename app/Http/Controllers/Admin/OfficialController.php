<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Official;
use App\Models\Resident;
use App\Models\User;
use App\Models\Role;
use App\Models\Position;
use App\Models\Committee;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Official::with(['resident' => function ($q) {
            // FIXED: Remove 'user_id' from select - residents table doesn't have it
            $q->select('id', 'first_name', 'last_name', 'middle_name', 'age', 'gender', 'contact_number', 'photo_path');
        }]);

        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->whereHas('resident', function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('middle_name', 'like', '%' . $request->search . '%');
            })
            ->orWhere('position', 'like', '%' . $request->search . '%')
            ->orWhere('committee', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'current') {
                $query->current();  
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('position') && $request->position !== 'all') {
            $query->where('position', $request->position);
        }

        if ($request->has('committee') && $request->committee !== 'all') {
            $query->where('committee', $request->committee);
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('is_regular', $request->type === 'regular');
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Get paginated results
        $officials = $query->paginate($request->get('per_page', 15))->withQueryString();

        // Get positions for filter dropdown - format as object
        $positions = Position::active()
            ->ordered()
            ->get()
            ->mapWithKeys(function ($position) {
                return [$position->code => ['name' => $position->name, 'order' => $position->order]];
            });

        // Get committees from model
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
            'current' => Official::current()->count(),
            'former' => Official::where('status', 'former')->count(),
            'regular' => Official::where('is_regular', true)->count(),
            'ex_officio' => Official::where('is_regular', false)->count(),
            'by_position' => Position::active()->get()->mapWithKeys(function ($position) {
                return [$position->code => Official::where('position', $position->code)->count()];
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
                ['value' => 'ex_officio', 'label' => 'Ex-Officio'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get residents who are not currently officials (active)
        $availableResidents = Resident::whereDoesntHave('officials', function ($query) {
        })
        ->where('status', 'active')
        ->select('id', 'first_name', 'last_name', 'middle_name', 'age', 'gender', 
                 'birth_date', 'civil_status', 'contact_number', 'email', 
                 'address', 'photo_path', 'purok_id')
        ->with(['purok:id,name', 'household:id,household_number,address'])
        ->orderBy('last_name')
        ->get();

        // Get positions for dropdown
        $positions = Position::active()
            ->ordered()
            ->get()
            ->map(function ($position) {
                return [
                    'value' => $position->code,
                    'label' => $position->name,
                    'order' => $position->order,
                    'role_id' => $position->role_id,
                    'requires_account' => (bool) $position->requires_account,
                ];
            })
            ->toArray();

        // Get committees
        $committees = Committee::active()
            ->ordered()
            ->get()
            ->map(function ($committee) {
                return [
                    'value' => $committee->code,
                    'label' => $committee->name,
                    'description' => $committee->description,
                ];
            })
            ->toArray();

        // Get all roles for user account creation
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
        // Get active position codes for validation
        $positionCodes = Position::active()->pluck('code')->toArray();
        $committeeCodes = Committee::active()->pluck('code')->toArray();

        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'position' => 'required|string|in:' . implode(',', $positionCodes),
            'committee' => 'nullable|string|in:' . implode(',', $committeeCodes),
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
            'create_user_account' => 'boolean',
            'role_id' => 'nullable|exists:roles,id',
            'username' => 'nullable|string|max:255|unique:users,username',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Check if resident already holds an active position
        $existingOfficial = Official::where('resident_id', $validated['resident_id'])
            ->first();

        if ($existingOfficial) {
            return redirect()->back()->withErrors([
                'resident_id' => 'This resident already holds an active official position.'
            ]);
        }

        // Get position details
        $position = Position::where('code', $validated['position'])->first();
        
        // Get resident details
        $resident = Resident::findOrFail($validated['resident_id']);
        
        // Check if position requires account but user didn't select account creation
        if ($position && $position->requires_account && !$request->boolean('create_user_account')) {
            return redirect()->back()->withErrors([
                'create_user_account' => 'This position requires a system account. Please enable account creation.'
            ]);
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('official-photos', 'public');
            $validated['photo_path'] = $path;
        }

        // Set order if not provided
        if (!isset($validated['order']) && $position) {
            $validated['order'] = $position->order;
        }

        // Start transaction
        DB::beginTransaction();
        try {
            // Create the official record
            $official = Official::create($validated);

            // Handle user account if needed
            $shouldCreateAccount = $request->boolean('create_user_account') || ($position && $position->requires_account);
            
            if ($shouldCreateAccount) {
                $this->handleOfficialUserAccount($resident, $validated, $position);
            }

            DB::commit();
            
            return redirect()->route('officials.show', $official)->with('success', 'Official created successfully.');
            
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
        $official->load(['resident' => function ($query) {
            $query->with(['household', 'purok']);
        }]);

        // Get position name
        $position = Position::where('code', $official->position)->first();
        $positionName = $position ? $position->name : $official->position;

        // Get committee name
        $committeeName = null;
        if ($official->committee) {
            $committee = Committee::where('code', $official->committee)->first();
            $committeeName = $committee ? $committee->name : $official->committee;
        }

        // Get user account if exists
        $userAccount = null;
        if ($official->resident && $official->resident->household) {
            $user = User::where('household_id', $official->resident->household->id)
                ->where('current_resident_id', $official->resident->id)
                ->first();
            
            if ($user) {
                $userAccount = [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : null,
                    'status' => $user->status,
                ];
            }
        }

        // Get all positions for edit dropdown
        $positions = Position::active()
            ->ordered()
            ->get()
            ->map(function ($position) {
                return [
                    'value' => $position->code,
                    'label' => $position->name,
                ];
            });

        return Inertia::render('admin/Officials/Show', [
            'official' => [
                'id' => $official->id,
                'position' => $official->position,
                'position_name' => $positionName,
                'committee' => $official->committee,
                'committee_name' => $committeeName,
                'term_start' => $official->term_start->format('Y-m-d'),
                'term_end' => $official->term_end->format('Y-m-d'),
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
                'created_at' => $official->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $official->updated_at->format('Y-m-d H:i:s'),
                'resident' => $official->resident ? [
                    'id' => $official->resident->id,
                    'full_name' => $official->resident->full_name,
                    'first_name' => $official->resident->first_name,
                    'last_name' => $official->resident->last_name,
                    'middle_name' => $official->resident->middle_name,
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
                    'user_account' => $userAccount,
                ] : null,
            ],
            'positions' => $positions,
            'committees' => Committee::active()->ordered()->get()->mapWithKeys(function ($committee) {
                return [$committee->code => $committee->name];
            })->toArray(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Official $official)
    {
        $official->load(['resident']);

        // Get all residents for selection (including current resident)
        $availableResidents = Resident::where('status', 'active')
            ->select('id', 'first_name', 'last_name', 'middle_name', 'age', 'gender', 'contact_number', 'photo_path')
            ->orderBy('last_name')
            ->get();

        // Get user account info if exists
        $userAccount = null;
        if ($official->resident && $official->resident->household) {
            $user = User::where('household_id', $official->resident->household->id)
                ->where('current_resident_id', $official->resident->id)
                ->first();
            
            if ($user) {
                $userAccount = [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'status' => $user->status,
                ];
            }
        }

        // Get positions
        $positions = Position::active()
            ->ordered()
            ->get()
            ->map(function ($position) {
                return [
                    'value' => $position->code,
                    'label' => $position->name,
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
                    'value' => $committee->code,
                    'label' => $committee->name,
                ];
            });

        return Inertia::render('admin/Officials/Edit', [
            'official' => [
                'id' => $official->id,
                'resident_id' => $official->resident_id,
                'position' => $official->position,
                'committee' => $official->committee,
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
                'user_account' => $userAccount,
            ],
            'positions' => $positions,
            'committees' => $committees,
            'availableResidents' => $availableResidents,
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
        // Get active position codes for validation
        $positionCodes = Position::active()->pluck('code')->toArray();
        $committeeCodes = Committee::active()->pluck('code')->toArray();

        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'position' => 'required|string|in:' . implode(',', $positionCodes),
            'committee' => 'nullable|string|in:' . implode(',', $committeeCodes),
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
            'remove_photo' => 'boolean',
            'create_user_account' => 'boolean',
            'role_id' => 'nullable|exists:roles,id',
            'username' => 'nullable|string|max:255|unique:users,username,' . ($official->resident->household->user_id ?? 0),
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Check if resident already holds an active position (excluding current official)
        if ($validated['resident_id'] != $official->resident_id) {
            $existingOfficial = Official::where('resident_id', $validated['resident_id'])
                ->where('id', '!=', $official->id)
                ->first();

            if ($existingOfficial) {
                return redirect()->back()->withErrors([
                    'resident_id' => 'This resident already holds an active official position.'
                ]);
            }
        }

        // Get position details
        $position = Position::where('code', $validated['position'])->first();
        
        // Check if position requires account but user didn't select account creation
        if ($position && $position->requires_account && !$request->boolean('create_user_account')) {
            return redirect()->back()->withErrors([
                'create_user_account' => 'This position requires a system account. Please enable account creation.'
            ]);
        }

        // Start transaction
        DB::beginTransaction();
        try {
            // Get current resident (before update)
            $currentResident = $official->resident;
            
            // Get new resident
            $newResident = Resident::findOrFail($validated['resident_id']);
            
            // Check if we're replacing an official (changing resident or position)
            $isReplacingOfficial = ($official->resident_id != $validated['resident_id']) || ($official->position != $validated['position']);
            
            if ($isReplacingOfficial) {
                // Handle the replaced official's account
                $this->handleReplacedOfficial($currentResident, $official);
            }

            // Handle photo removal
            if ($request->boolean('remove_photo') && $official->photo_path) {
                Storage::disk('public')->delete($official->photo_path);
                $validated['photo_path'] = null;
            }

            // Handle new photo upload
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($official->photo_path) {
                    Storage::disk('public')->delete($official->photo_path);
                }
                
                $path = $request->file('photo')->store('official-photos', 'public');
                $validated['photo_path'] = $path;
            }

            // Set order if not provided
            if (!isset($validated['order']) && $position) {
                $validated['order'] = $position->order;
            }

            // Update official record
            $official->update($validated);

            // Handle account creation for new resident if needed
            $shouldCreateAccount = $request->boolean('create_user_account') || ($position && $position->requires_account);
            
            if ($shouldCreateAccount) {
                $this->handleOfficialUserAccount($newResident, $validated, $position);
            }

            DB::commit();
            
            return redirect()->route('officials.show', $official)->with('success', 'Official updated successfully.');
            
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
            
            return redirect()->route('officials.index')->with('success', 'Official deleted successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to delete official: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle user account creation/update for officials based on BUSINESS RULES
     */
    private function handleOfficialUserAccount($resident, $data, $position = null)
    {
        // Check if resident belongs to a household
        if (!$resident->household_id) {
            // Resident doesn't belong to a household, cannot create account
            return null;
        }

        $household = $resident->household;

        // Check if household already has a user account
        if ($household->user_id) {
            $user = User::find($household->user_id);
            if ($user) {
                // Update existing user account
                $updateData = [
                    'username' => $data['username'] ?? $user->username,
                    'email' => $data['email'] ?? $resident->email,
                    'contact_number' => $data['contact_number'] ?? $resident->contact_number,
                    'position' => $position ? $position->name : ($data['position'] ?? 'Official'),
                    'role_id' => $data['role_id'] ?? ($position ? $position->role_id : 6),
                    'status' => 'active', // Ensure account is active
                    'current_resident_id' => $resident->id,
                    'household_id' => $household->id,
                ];

                // Update password if provided
                if (isset($data['password']) && $data['password']) {
                    $updateData['password'] = Hash::make($data['password']);
                    $updateData['require_password_change'] = true;
                }

                $user->update($updateData);
                return $user;
            }
        }
        
        // Create new user account
        // Generate username if not provided
        $username = $data['username'] ?? $this->generateUsername($resident);

        // Generate password if not provided
        $password = $data['password'] ?? Str::random(12);

        // Create user
        $user = User::create([
            'username' => $username,
            'email' => $data['email'] ?? $resident->email,
            'password' => Hash::make($password),
            'contact_number' => $data['contact_number'] ?? $resident->contact_number,
            'position' => $position ? $position->name : ($data['position'] ?? 'Official'),
            'role_id' => $data['role_id'] ?? ($position ? $position->role_id : 6),
            'status' => 'active',
            'household_id' => $household->id,
            'current_resident_id' => $resident->id,
            'require_password_change' => true,
            'email_verified_at' => now(),
        ]);

        // Update household with user_id
        $household->update(['user_id' => $user->id]);

        return $user;
    }

    /**
     * Handle replaced official's account based on BUSINESS RULES
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
            // User account is not linked to this resident, nothing to do
            return;
        }
        
        // Check if resident is a household head
        $isHouseholdHead = $resident->isHeadOfHousehold();

        // BUSINESS LOGIC IMPLEMENTATION:
        
        // 1. For Kagawad position
        if ($oldOfficial->position === 'kagawad') {
            if ($isHouseholdHead) {
                // RULE: If household head → CHANGE ROLE to regular household role
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
                // RULE: If NOT household head → MAKE ACCOUNT INACTIVE
                $user->update(['status' => 'inactive']);
            }
        }
        
        // 2. For Captain position (when captain is replaced)
        elseif ($oldOfficial->position === 'captain') {
            // RULE: "just revise the resident_id on the officials table"
            // So the previous captain keeps their account with whatever role they had
            if ($user->position === 'Barangay Captain' || $user->position === 'Captain') {
                $user->update(['position' => 'Former Barangay Captain']);
            }
        }
        
        // 3. For other positions (Secretary, Treasurer, SK Chairman)
        elseif (in_array($oldOfficial->position, ['secretary', 'treasurer', 'sk_chairman'])) {
            // These are default account positions
            // If replaced, they keep their account but position changes
            $oldPositionName = Position::where('code', $oldOfficial->position)->value('name') ?? $oldOfficial->position;
            if ($user->position === $oldPositionName) {
                $user->update(['position' => 'Former ' . $oldPositionName]);
            }
        }
    }

    /**
     * Generate a username from resident name
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

    /**
     * Get current officials for display (e.g., in dashboard)
     */
    public function currentOfficials()
    {
        $officials = Official::with(['resident' => function ($query) {
            $query->select('id', 'first_name', 'last_name', 'middle_name', 'photo_path');
        }])
        ->orderBy('order')
        ->get();

        return response()->json($officials);
    }

    /**
     * Get officials by committee
     */
    public function byCommittee($committee)
    {
        $committeeModel = Committee::where('code', $committee)->first();
        
        if (!$committeeModel) {
            return response()->json(['error' => 'Committee not found'], 404);
        }

        $officials = Official::with(['resident'])
            ->where('committee', $committee)
            ->where('status', 'active')
            ->orderBy('order')
            ->get();

        return response()->json([
            'committee' => $committeeModel->name,
            'description' => $committeeModel->description,
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
            $officials = Official::whereIn('id', $request->ids)->get();

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
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:officials,id',
            'status' => 'required|in:active,inactive,former',
        ]);

        Official::whereIn('id', $request->ids)->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated successfully']);
    }

    /**
     * Export officials
     */
    public function export(Request $request)
    {
        $query = Official::with('resident');

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'current') {
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('position') && $request->position !== 'all') {
            $query->where('position', $request->position);
        }

        $officials = $query->get();

        // Get position names
        $positionNames = Position::pluck('name', 'code')->toArray();
        
        // Get committee names
        $committeeNames = Committee::pluck('name', 'code')->toArray();

        // Generate CSV
        $csv = "ID,Resident Name,Position,Committee,Term Start,Term End,Status,Contact,Email,Type\n";
        
        foreach ($officials as $official) {
            $csv .= implode(',', [
                $official->id,
                '"' . $official->resident->full_name . '"',
                $positionNames[$official->position] ?? $official->position,
                $official->committee ? ($committeeNames[$official->committee] ?? $official->committee) : 'N/A',
                $official->term_start->format('Y-m-d'),
                $official->term_end->format('Y-m-d'),
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