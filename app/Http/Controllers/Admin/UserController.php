<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
 public function index(Request $request)
{
    // Use caching for statistics
    $stats = Cache::remember('users.statistics', 300, function () {
        return [
            ['label' => 'Total Users', 'value' => User::count()],
            ['label' => 'Active Users', 'value' => User::where('status', 'active')->count()],
            ['label' => 'Household Accounts', 'value' => User::whereNotNull('household_id')->count()],
            ['label' => 'Official Accounts', 'value' => User::whereNotNull('position')
                ->whereNull('household_id')
                ->count()],
            ['label' => 'With 2FA', 'value' => User::whereNotNull('two_factor_confirmed_at')->count()],
            ['label' => 'Inactive Users', 'value' => User::where('status', 'inactive')->count()],
        ];
    });
    
    // Build query with eager loading
    $query = User::query()
        ->with(['role', 'currentResident', 'household.currentHeadResident'])
        ->select([
            'id',
            'username',
            'email',
            'contact_number',
            'position',
            'role_id',
            'status',
            'email_verified_at',
            'last_login_at',
            'last_login_ip',
            'login_count',
            'created_at',
            'updated_at',
            'two_factor_confirmed_at',
            'require_password_change',
            'resident_id',
            'household_id',
            'current_resident_id'
        ]);
    
    // Apply filters (your existing filter logic is great!)
    $this->applyFilters($query, $request);
    
    // Apply sorting
    $sortBy = $request->input('sort_by', 'created_at');
    $sortOrder = $request->input('sort_order', 'desc');
    
    $allowedSortColumns = [
        'username', 'email', 'created_at', 'last_login_at', 
        'login_count', 'status', 'role_id', 'position'
    ];
    
    if (in_array($sortBy, $allowedSortColumns)) {
        $query->orderBy($sortBy, $sortOrder);
    } else {
        $query->orderBy('created_at', 'desc');
    }
    
    // ✅ Pagination - DEFAULT IS 15, max 500
    $perPage = $this->getPerPage($request);
    $users = $query->paginate($perPage)->withQueryString();
    
    // Format users efficiently
    $formattedUsers = $users->through(fn($user) => $this->formatUser($user));
    
    // Get roles for filter dropdown (cached)
    $roles = Cache::remember('users.roles', 3600, function () {
        return Role::select(['id', 'name', 'description'])
            ->withCount(['users' => fn($q) => $q->where('status', 'active')])
            ->get()
            ->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'count' => $role->users_count,
                'color' => $this->getRoleColor($role->name),
            ]);
    });
    
    // Account type options
    $accountTypeOptions = [
        ['value' => 'all', 'label' => 'All Types'],
        ['value' => 'household', 'label' => 'Household Accounts'],
        ['value' => 'official', 'label' => 'Official Accounts'],
        ['value' => 'administrative', 'label' => 'Administrative'],
    ];
    
    // Log for monitoring
    Log::info('Users index (Server-Side)', [
        'total_users' => $users->total(),
        'current_page' => $users->currentPage(),
        'per_page' => $perPage,
        'filters' => $request->only(['search', 'role_id', 'status'])
    ]);
    
    return Inertia::render('admin/Users/Index', [
        'users' => $formattedUsers,
        'stats' => $stats,
        'roles' => $roles,
        'accountTypeOptions' => $accountTypeOptions,
        'filters' => $request->only([
            'search', 'role_id', 'status', 'account_type', 'two_factor', 
            'email_verified', 'date_from', 'date_to', 'last_login', 
            'sort_by', 'sort_order', 'per_page'
        ]),
        'can' => [
            'create_users' => auth()->user()->can('create-users'),
            'edit_users' => auth()->user()->can('edit-users'),
            'delete_users' => auth()->user()->can('delete-users'),
            'bulk_actions' => auth()->user()->can('bulk-actions'),
            'export_users' => auth()->user()->can('export-users'),
        ],
    ]);
}

    /**
     * Get the per page value from request
     *
     * @param Request $request
     * @return int
     */
    private function getPerPage(Request $request): int
    {
        $allowedPerPage = ['15', '30', '50', '100', '500', 'all'];
        $defaultPerPage = 15;
        $maxPerPage = 500;
        
        $perPage = $request->input('per_page', $defaultPerPage);
        
        // Handle 'all' option - return total count (capped at max)
        if ($perPage === 'all') {
            return min(User::count() ?: $defaultPerPage, $maxPerPage);
        }
        
        // Validate that per_page is in allowed values
        if (in_array((string)$perPage, $allowedPerPage)) {
            return (int) $perPage;
        }
        
        // Return default if invalid value
        return $defaultPerPage;
    }
    
    /**
     * Apply all filters to the query
     */
    private function applyFilters($query, Request $request)
    {
        // Search filter (your existing logic)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhereHas('currentResident', fn($q) => $q
                      ->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                  )
                  ->orWhereHas('role', fn($q) => $q
                      ->where('name', 'like', "%{$search}%")
                  );
            });
        }
        
        // Role filter
        if ($request->filled('role_id') && $request->input('role_id') !== 'all') {
            $query->where('role_id', $request->input('role_id'));
        }
        
        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        // Account type filter
        if ($request->filled('account_type') && $request->input('account_type') !== 'all') {
            match($request->input('account_type')) {
                'household' => $query->whereNotNull('household_id'),
                'official' => $query->whereNull('household_id')->whereNotNull('position'),
                'administrative' => $query->whereNull('household_id')
                    ->where('position', 'Administrator'),
                default => null
            };
        }
        
        // 2FA filter
        if ($request->filled('two_factor') && $request->input('two_factor') !== 'all') {
            $request->input('two_factor') === 'enabled' 
                ? $query->whereNotNull('two_factor_confirmed_at')
                : $query->whereNull('two_factor_confirmed_at');
        }
        
        // Email verification filter
        if ($request->filled('email_verified') && $request->input('email_verified') !== 'all') {
            $request->input('email_verified') === 'verified'
                ? $query->whereNotNull('email_verified_at')
                : $query->whereNull('email_verified_at');
        }
        
        // Date range filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
        
        // Last login filter
        if ($request->filled('last_login') && $request->input('last_login') !== 'all') {
            $days = match($request->input('last_login')) {
                'today' => 1,
                'week' => 7,
                'month' => 30,
                'quarter' => 90,
                'year' => 365,
                default => 0
            };
            
            $days > 0 
                ? $query->where('last_login_at', '>=', now()->subDays($days))
                : $query->whereNull('last_login_at');
        }
    }
    
    /**
     * Format a single user for frontend
     */
    private function formatUser($user): array
    {
        // Get resident info
        $residentName = null;
        $householdInfo = null;
        
        if ($user->currentResident) {
            $residentName = $user->currentResident->full_name;
            if ($user->currentResident->household) {
                $householdInfo = [
                    'id' => $user->currentResident->household->id,
                    'number' => $user->currentResident->household->household_number,
                ];
            }
        } elseif ($user->household?->currentHeadResident) {
            $residentName = $user->household->currentHeadResident->full_name;
            $householdInfo = [
                'id' => $user->household->id,
                'number' => $user->household->household_number,
            ];
        }
        
        // Permission counts
        $rolePermissions = $user->role?->permissions()->count() ?? 0;
        $userPermissions = method_exists($user, 'permissions') 
            ? $user->permissions()->count() 
            : 0;
        
        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'contact_number' => $user->contact_number,
            'position' => $user->position,
            'resident_name' => $residentName,
            'household_info' => $householdInfo,
            'is_household_account' => !is_null($user->household_id),
            'is_official_account' => !is_null($user->position) 
                && !in_array(strtolower($user->position), ['administrator', 'admin']),
            'role_id' => $user->role_id,
            'role' => $user->role ? [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'color' => $this->getRoleColor($user->role->name),
            ] : null,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'last_login_at' => $user->last_login_at,
            'last_login_ip' => $user->last_login_ip,
            'login_count' => $user->login_count,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'two_factor_enabled' => !is_null($user->two_factor_confirmed_at),
            'require_password_change' => $user->require_password_change,
            'is_online' => $user->last_login_at 
                && $user->last_login_at->gt(now()->subMinutes(15)),
            'total_permissions' => $rolePermissions + $userPermissions,
            'account_type' => $this->getAccountType($user),
        ];
    }
    
    
    /**
     * Helper: Get account type
     */
    private function getAccountType(User $user): string
    {
        if ($user->household_id) {
            return 'household';
        } elseif ($user->position && !in_array(strtolower($user->position), ['administrator', 'admin'])) {
            return 'official';
        } else {
            return 'administrative';
        }
    }
    
    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request)
    {
        // Determine what type of user to create
        $type = $request->input('type', 'administrative');
        
        // Get available residents for household or official accounts
        $availableResidents = [];
        $availableHouseholds = [];
        
        if ($type === 'household') {
            // Get households without user accounts
            $availableHouseholds = Household::whereNull('user_id')
                ->where('status', 'active')
                ->with(['currentHeadResident'])
                ->get()
                ->map(function ($household) {
                    return [
                        'id' => $household->id,
                        'household_number' => $household->household_number,
                        'head_resident' => $household->currentHeadResident ? [
                            'id' => $household->currentHeadResident->id,
                            'name' => $household->currentHeadResident->full_name,
                        ] : null,
                        'address' => $household->full_address,
                    ];
                });
        } elseif ($type === 'official') {
            // Get residents who don't have official positions yet
            $availableResidents = Resident::whereDoesntHave('officials')
                ->where('status', 'active')
                ->with(['household'])
                ->get()
                ->map(function ($resident) {
                    return [
                        'id' => $resident->id,
                        'name' => $resident->full_name,
                        'household' => $resident->household ? [
                            'id' => $resident->household->id,
                            'number' => $resident->household->household_number,
                        ] : null,
                        'age' => $resident->age,
                        'gender' => $resident->gender,
                    ];
                });
        }
        
        // Get permissions grouped by module
        $permissions = Permission::where('is_active', true)
            ->orderBy('module')
            ->orderBy('display_name')
            ->get()
            ->groupBy('module')
            ->map(function ($permissions) {
                return $permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $permission->display_name,
                        'description' => $permission->description,
                        'module' => $permission->module,
                    ];
                });
            })
            ->toArray();
        
        // Get roles with permissions
        $roles = Role::with(['permissions' => function ($query) {
            $query->select([
                'permissions.id',
                'permissions.name', 
                'permissions.display_name', 
                'permissions.description'
            ]);
        }])->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $permission->display_name,
                    ];
                }),
            ];
        });
        
        // Get position options for official accounts
        $positionOptions = [];
        if ($type === 'official') {
            $positionOptions = [
                ['value' => 'Barangay Captain', 'label' => 'Barangay Captain'],
                ['value' => 'Barangay Secretary', 'label' => 'Barangay Secretary'],
                ['value' => 'Barangay Treasurer', 'label' => 'Barangay Treasurer'],
                ['value' => 'SK Chairman', 'label' => 'SK Chairman'],
                ['value' => 'Kagawad', 'label' => 'Kagawad'],
            ];
        }
        
        return Inertia::render('admin/Users/Create', [
            'type' => $type,
            'permissions' => $permissions,
            'roles' => $roles,
            'availableResidents' => $availableResidents,
            'availableHouseholds' => $availableHouseholds,
            'positionOptions' => $positionOptions,
        ]);
    }
    
    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $type = $request->input('type', 'administrative');
        
        // Base validation rules
        $rules = [
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'contact_number' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'selected_permissions' => 'nullable|array',
            'selected_permissions.*' => 'exists:permissions,id',
            'status' => 'required|in:active,inactive',
            'require_password_change' => 'boolean',
            'is_email_verified' => 'boolean',
            'send_setup_email' => 'boolean',
        ];
        
        // Add type-specific validation
        if ($type === 'household') {
            $rules['household_id'] = 'required|exists:households,id';
        } elseif ($type === 'official') {
            $rules['resident_id'] = 'required|exists:residents,id';
            $rules['position'] = 'required|string|max:100';
        } else {
            // Administrative account
            $rules['position'] = 'nullable|string|max:100';
        }
        
        $validator = Validator::make($request->all(), $rules);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Prepare user data
        $userData = [
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'contact_number' => $request->contact_number,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'require_password_change' => $request->boolean('require_password_change', false),
            'email_verified_at' => $request->boolean('is_email_verified') ? now() : null,
        ];
        
        // Set type-specific data
        if ($type === 'household') {
            $household = Household::findOrFail($request->household_id);
            $userData['household_id'] = $household->id;
            
            // Set current resident to household head
            if ($household->currentHeadResident) {
                $userData['current_resident_id'] = $household->currentHeadResident->id;
            }
            
            // Default position for household accounts
            $userData['position'] = 'Household Head';
            
        } elseif ($type === 'official') {
            $resident = Resident::findOrFail($request->resident_id);
            $userData['position'] = $request->position;
            
            // Link to resident's household if exists
            if ($resident->household) {
                $userData['household_id'] = $resident->household->id;
                $userData['current_resident_id'] = $resident->id;
            }
            
        } else {
            // Administrative account
            $userData['position'] = $request->position ?? 'Administrator';
        }
        
        // Create user
        $user = User::create($userData);
        
        // Update household with user_id if this is a household account
        if ($type === 'household' && isset($household)) {
            $household->update(['user_id' => $user->id]);
        }
        
        // Attach permissions if provided
        if ($request->filled('selected_permissions') && is_array($request->selected_permissions) && method_exists($user, 'permissions')) {
            // Get existing user permissions to avoid duplicates
            $existingPermissions = $user->permissions()->pluck('permissions.id')->toArray();
            $newPermissions = array_diff($request->selected_permissions, $existingPermissions);
            
            if (!empty($newPermissions)) {
                // Attach new permissions
                foreach ($newPermissions as $permissionId) {
                    $user->permissions()->attach($permissionId);
                }
            }
        }
        
        // Send setup email if requested
        if ($request->boolean('send_setup_email')) {
            // Send setup email logic here
            // Mail::to($user->email)->send(new UserSetupMail($user, $request->password));
        }
        
        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User created successfully!');
    }
    
    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        // Load relationships
        $user->load([
            'role.permissions',
            'currentResident.household',
            'household.currentHeadResident'
        ]);
        
        // Get the resident name based on account type
        $residentInfo = null;
        if ($user->currentResident) {
            $residentInfo = [
                'id' => $user->currentResident->id,
                'name' => $user->currentResident->full_name,
                'first_name' => $user->currentResident->first_name,
                'last_name' => $user->currentResident->last_name,
                'age' => $user->currentResident->age,
                'gender' => $user->currentResident->gender,
                'household' => $user->currentResident->household ? [
                    'id' => $user->currentResident->household->id,
                    'number' => $user->currentResident->household->household_number,
                    'address' => $user->currentResident->household->full_address,
                ] : null,
            ];
        } elseif ($user->household && $user->household->currentHeadResident) {
            // For household accounts without specific current resident
            $residentInfo = [
                'id' => $user->household->currentHeadResident->id,
                'name' => $user->household->currentHeadResident->full_name,
                'first_name' => $user->household->currentHeadResident->first_name,
                'last_name' => $user->household->currentHeadResident->last_name,
                'age' => $user->household->currentHeadResident->age,
                'gender' => $user->household->currentHeadResident->gender,
                'household' => [
                    'id' => $user->household->id,
                    'number' => $user->household->household_number,
                    'address' => $user->household->full_address,
                ],
            ];
        }
        
        // Get user's direct permissions
        $directPermissions = collect();
        if (method_exists($user, 'permissions')) {
            $directPermissions = $user->permissions()
                ->select([
                    'permissions.id',
                    'permissions.name', 
                    'permissions.display_name', 
                    'permissions.description', 
                    'permissions.module'
                ])
                ->get();
        }
        
        // Get all permissions for this user (including role permissions)
        $rolePermissions = $user->role ? $user->role->permissions : collect();
        
        // Combine and group permissions
        $allPermissions = $directPermissions->concat($rolePermissions)->unique('id');
        $groupedPermissions = $allPermissions->groupBy('module')->map(function ($permissions, $module) use ($directPermissions, $rolePermissions) {
            return $permissions->map(function ($permission) use ($directPermissions, $rolePermissions) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'description' => $permission->description,
                    'module' => $permission->module,
                    'source' => $directPermissions->contains('id', $permission->id) 
                        ? 'direct' 
                        : 'role',
                ];
            });
        });
        
        // Calculate user statistics
        $stats = [
            ['label' => 'Total Logins', 'value' => $user->login_count],
            ['label' => 'Direct Permissions', 'value' => $directPermissions->count()],
            ['label' => 'Role Permissions', 'value' => $rolePermissions->count()],
            ['label' => 'Total Permissions', 'value' => $allPermissions->count()],
            ['label' => 'Account Type', 'value' => ucfirst($this->getAccountType($user))],
        ];
        
        // Add household info if applicable
        if ($user->household_id) {
            $stats[] = ['label' => 'Household Members', 'value' => $user->household->member_count ?? 0];
        }
        
        return Inertia::render('admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'contact_number' => $user->contact_number,
                'position' => $user->position,
                'role_id' => $user->role_id,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'description' => $user->role->description,
                    'color' => $this->getRoleColor($user->role->name),
                ] : null,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'require_password_change' => $user->require_password_change,
                'password_changed_at' => $user->password_changed_at,
                'two_factor_enabled' => !is_null($user->two_factor_confirmed_at),
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
                'login_count' => $user->login_count,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'is_online' => $user->last_login_at && Carbon::parse($user->last_login_at)->gt(now()->subMinutes(15)),
                'account_type' => $this->getAccountType($user),
                'is_household_account' => !is_null($user->household_id),
                'resident_info' => $residentInfo,
                'household_id' => $user->household_id,
                'current_resident_id' => $user->current_resident_id,
            ],
            'permissions' => $groupedPermissions,
            'stats' => $stats,
        ]);
    }
    
    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        // Load user with permissions
        $user->load([
            'permissions',
            'currentResident',
            'household.currentHeadResident'
        ]);
        
        // Determine account type
        $accountType = $this->getAccountType($user);
        
        // Get available residents for switching if this is an official account
        $availableResidents = [];
        $availableHouseholds = [];
        
        if ($accountType === 'official' || $accountType === 'household') {
            $availableResidents = Resident::where('status', 'active')
                ->with(['household'])
                ->get()
                ->map(function ($resident) {
                    return [
                        'id' => $resident->id,
                        'name' => $resident->full_name,
                        'household' => $resident->household ? [
                            'id' => $resident->household->id,
                            'number' => $resident->household->household_number,
                        ] : null,
                        'age' => $resident->age,
                        'gender' => $resident->gender,
                    ];
                });
            
            $availableHouseholds = Household::where('status', 'active')
                ->with(['currentHeadResident'])
                ->get()
                ->map(function ($household) {
                    return [
                        'id' => $household->id,
                        'household_number' => $household->household_number,
                        'head_resident' => $household->currentHeadResident ? [
                            'id' => $household->currentHeadResident->id,
                            'name' => $household->currentHeadResident->full_name,
                        ] : null,
                        'address' => $household->full_address,
                    ];
                });
        }
        
        // Get permissions grouped by module
        $permissions = Permission::where('is_active', true)
            ->orderBy('module')
            ->orderBy('display_name')
            ->get()
            ->groupBy('module')
            ->map(function ($permissions) {
                return $permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $permission->display_name,
                        'description' => $permission->description,
                        'module' => $permission->module,
                    ];
                });
            })
            ->toArray();
        
        // Get roles with permissions
        $roles = Role::with(['permissions' => function ($query) {
            $query->select([
                'permissions.id',
                'permissions.name', 
                'permissions.display_name', 
                'permissions.description'
            ]);
        }])->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $permission->display_name,
                    ];
                }),
            ];
        });
        
        // Get user's permission IDs
        $userPermissionIds = $user->permissions->pluck('id')->toArray();
        
        return Inertia::render('admin/Users/Edit', [
            'user' => $user,
            'account_type' => $accountType,
            'permissions' => $permissions,
            'roles' => $roles,
            'userPermissionIds' => $userPermissionIds,
            'availableResidents' => $availableResidents,
            'availableHouseholds' => $availableHouseholds,
        ]);
    }
    
    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        // Determine account type
        $accountType = $this->getAccountType($user);
        
        // Base validation rules
        $rules = [
            'username' => 'required|string|max:50|unique:users,username,' . $user->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'contact_number' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'selected_permissions' => 'nullable|array',
            'selected_permissions.*' => 'exists:permissions,id',
            'status' => 'required|in:active,inactive',
            'require_password_change' => 'boolean',
            'is_email_verified' => 'boolean',
        ];
        
        // Add type-specific validation for changing account type
        if ($request->has('change_account_type')) {
            $newType = $request->input('new_account_type');
            
            if ($newType === 'household') {
                $rules['new_household_id'] = 'required|exists:households,id';
            } elseif ($newType === 'official') {
                $rules['new_resident_id'] = 'required|exists:residents,id';
                $rules['new_position'] = 'required|string|max:100';
            } elseif ($newType === 'administrative') {
                $rules['new_position'] = 'nullable|string|max:100';
            }
        } else {
            // Keep current account type, update position if applicable
            if ($accountType === 'official') {
                $rules['position'] = 'required|string|max:100';
            } else {
                $rules['position'] = 'nullable|string|max:100';
            }
        }
        
        // Password update validation
        if ($request->filled('password')) {
            $rules['password'] = ['confirmed', Rules\Password::defaults()];
        }
        
        $validator = Validator::make($request->all(), $rules);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Prepare update data
        $updateData = [
            'username' => $request->username,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'require_password_change' => $request->boolean('require_password_change', false),
        ];
        
        // Handle email verification
        if ($request->boolean('is_email_verified')) {
            $updateData['email_verified_at'] = now();
        } elseif ($request->has('is_email_verified')) {
            $updateData['email_verified_at'] = null;
        }
        
        // Handle password update
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
            $updateData['password_changed_at'] = $request->boolean('require_password_change') ? null : now();
        }
        
        // Handle account type change
        if ($request->boolean('change_account_type')) {
            $newType = $request->input('new_account_type');
            
            // Clear old account type data
            $updateData['household_id'] = null;
            $updateData['current_resident_id'] = null;
            $updateData['position'] = null;
            
            // Set new account type data
            if ($newType === 'household') {
                $household = Household::findOrFail($request->new_household_id);
                $updateData['household_id'] = $household->id;
                $updateData['position'] = 'Household Head';
                
                if ($household->currentHeadResident) {
                    $updateData['current_resident_id'] = $household->currentHeadResident->id;
                }
                
                // Update household user_id
                $household->update(['user_id' => $user->id]);
                
            } elseif ($newType === 'official') {
                $resident = Resident::findOrFail($request->new_resident_id);
                $updateData['position'] = $request->new_position;
                
                if ($resident->household) {
                    $updateData['household_id'] = $resident->household->id;
                    $updateData['current_resident_id'] = $resident->id;
                }
                
            } else {
                // Administrative account
                $updateData['position'] = $request->new_position ?? 'Administrator';
            }
            
        } else {
            // Keep same account type, update position if applicable
            if ($accountType === 'official') {
                $updateData['position'] = $request->position;
            } elseif ($accountType === 'administrative') {
                $updateData['position'] = $request->position ?? $user->position;
            }
        }
        
        // Update user
        $user->update($updateData);
        
        // Update permissions if provided
        if ($request->has('selected_permissions') && method_exists($user, 'permissions')) {
            // Get current permissions
            $currentPermissions = $user->permissions()->pluck('permissions.id')->toArray();
            $newPermissions = $request->selected_permissions ?? [];
            
            // Find permissions to add and remove
            $permissionsToAdd = array_diff($newPermissions, $currentPermissions);
            $permissionsToRemove = array_diff($currentPermissions, $newPermissions);
            
            // Remove permissions
            if (!empty($permissionsToRemove)) {
                $user->permissions()->detach($permissionsToRemove);
            }
            
            // Add new permissions
            if (!empty($permissionsToAdd)) {
                foreach ($permissionsToAdd as $permissionId) {
                    $user->permissions()->attach($permissionId);
                }
            }
        } elseif (method_exists($user, 'permissions')) {
            // If no permissions are provided, remove all custom permissions
            $user->permissions()->detach();
        }
        
        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User updated successfully!');
    }
    
    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->back()
                ->with('error', 'You cannot delete your own account.');
        }
        
        // If this is a household account, clear the user_id from household
        if ($user->household) {
            $user->household->update(['user_id' => null]);
        }
        
        $user->delete();
        
        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully!');
    }
    
    /**
     * Reset user password
     */
    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'require_password_change' => 'boolean',
        ]);
        
        $user->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => $request->boolean('require_password_change') ? null : now(),
            'require_password_change' => $request->boolean('require_password_change', false),
        ]);
        
        return redirect()->back()
            ->with('success', 'Password reset successfully!');
    }
    
    /**
     * Toggle user status
     */
    public function toggleStatus(User $user)
    {
        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);
        
        $status = $user->status === 'active' ? 'activated' : 'deactivated';
        
        return redirect()->back()
            ->with('success', "User {$status} successfully!");
    }
    
    /**
     * Update user permissions
     */
    public function updatePermissions(Request $request, User $user)
    {
        $request->validate([
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        
        if (!method_exists($user, 'permissions')) {
            return redirect()->back()
                ->with('error', 'Permissions relationship not found.');
        }
        
        // Get current permissions
        $currentPermissions = $user->permissions()->pluck('permissions.id')->toArray();
        $newPermissions = $request->permissions ?? [];
        
        // Find permissions to add and remove
        $permissionsToAdd = array_diff($newPermissions, $currentPermissions);
        $permissionsToRemove = array_diff($currentPermissions, $newPermissions);
        
        // Remove permissions
        if (!empty($permissionsToRemove)) {
            $user->permissions()->detach($permissionsToRemove);
        }
        
        // Add new permissions
        if (!empty($permissionsToAdd)) {
            foreach ($permissionsToAdd as $permissionId) {
                $user->permissions()->attach($permissionId);
            }
        }
        
        return redirect()->back()
            ->with('success', 'Permissions updated successfully!');
    }
    
    /**
     * Helper: Get color for role badge
     */
    private function getRoleColor(string $roleName): string
    {
        return match(strtolower($roleName)) {
            'administrator', 'admin' => 'bg-red-100 text-red-800 border-red-200',
            'super admin', 'superadmin' => 'bg-purple-100 text-purple-800 border-purple-200',
            'manager', 'supervisor' => 'bg-blue-100 text-blue-800 border-blue-200',
            'editor', 'moderator' => 'bg-green-100 text-green-800 border-green-200',
            'household head' => 'bg-orange-100 text-orange-800 border-orange-200',
            'barangay captain', 'captain' => 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'kagawad' => 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'secretary', 'treasurer' => 'bg-teal-100 text-teal-800 border-teal-200',
            default => 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
    
    /**
     * Helper: Parse user agent string
     */
    private function parseUserAgent(?string $userAgent): array
    {
        if (!$userAgent) {
            return [
                'browser' => 'Unknown',
                'os' => 'Unknown',
                'full' => 'Unknown Device',
                'device' => 'Desktop',
            ];
        }
        
        // Browser detection
        $browser = 'Unknown';
        if (strpos($userAgent, 'Chrome') !== false && strpos($userAgent, 'Edg') === false) {
            $browser = 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            $browser = 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false && strpos($userAgent, 'Chrome') === false) {
            $browser = 'Safari';
        } elseif (strpos($userAgent, 'Edg') !== false) {
            $browser = 'Edge';
        } elseif (strpos($userAgent, 'MSIE') !== false || strpos($userAgent, 'Trident') !== false) {
            $browser = 'Internet Explorer';
        } elseif (strpos($userAgent, 'Opera') !== false) {
            $browser = 'Opera';
        }
        
        // OS detection
        $os = 'Unknown';
        if (strpos($userAgent, 'Windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($userAgent, 'Mac') !== false) {
            $os = 'macOS';
        } elseif (strpos($userAgent, 'Linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($userAgent, 'Android') !== false) {
            $os = 'Android';
        } elseif (strpos($userAgent, 'iPhone') !== false || strpos($userAgent, 'iPad') !== false) {
            $os = 'iOS';
        }
        
        // Device type
        $device = 'Desktop';
        if (strpos($userAgent, 'Mobile') !== false) {
            $device = 'Mobile';
        } elseif (strpos($userAgent, 'Tablet') !== false) {
            $device = 'Tablet';
        }
        
        return [
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
            'full' => "$browser on $os ($device)",
        ];
    }
    
    /**
     * Resend verification email
     */
    public function resendVerification(User $user)
    {
        if ($user->hasVerifiedEmail()) {
            return redirect()->back()
                ->with('warning', 'User email is already verified.');
        }
        
        // Send verification email logic here
        // $user->sendEmailVerificationNotification();
        
        return redirect()->back()
            ->with('success', 'Verification email sent successfully!');
    }
    
    /**
     * Force password change
     */
    public function forcePasswordChange(User $user)
    {
        $user->update([
            'require_password_change' => true,
            'password_changed_at' => null,
        ]);
        
        return redirect()->back()
            ->with('success', 'User will be required to change password on next login.');
    }
    
    /**
     * Bulk actions for users
     */
    public function bulkActions(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete,reset_password',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);
        
        $userIds = $request->user_ids;
        
        switch ($request->action) {
            case 'activate':
                User::whereIn('id', $userIds)->update(['status' => 'active']);
                $message = count($userIds) . ' users activated successfully!';
                break;
                
            case 'deactivate':
                User::whereIn('id', $userIds)->update(['status' => 'inactive']);
                $message = count($userIds) . ' users deactivated successfully!';
                break;
                
            case 'delete':
                // Prevent deleting yourself
                $userIds = array_diff($userIds, [auth()->id()]);
                
                // Clear household user_id references before deleting
                $householdUsers = User::whereIn('id', $userIds)
                    ->whereNotNull('household_id')
                    ->with('household')
                    ->get();
                
                foreach ($householdUsers as $user) {
                    if ($user->household) {
                        $user->household->update(['user_id' => null]);
                    }
                }
                
                // Delete users
                User::whereIn('id', $userIds)->delete();
                $message = count($userIds) . ' users deleted successfully!';
                break;
                
            case 'reset_password':
                $tempPassword = 'Temporary@123';
                foreach ($userIds as $userId) {
                    $user = User::find($userId);
                    $user->update([
                        'password' => Hash::make($tempPassword),
                        'require_password_change' => true,
                        'password_changed_at' => null,
                    ]);
                }
                $message = 'Passwords reset for ' . count($userIds) . ' users!';
                break;
                
            default:
                return redirect()->back()
                    ->with('error', 'Invalid action selected.');
        }
        
        return redirect()->back()
            ->with('success', $message);
    }
    
    /**
     * Export users
     */
    public function export(Request $request)
    {
        $users = User::with(['role', 'currentResident', 'household.currentHeadResident'])->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="users_' . date('Y-m-d') . '.csv"',
        ];
        
        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'ID', 'Username', 'Email', 'Contact Number', 'Position', 'Role', 
                'Resident Name', 'Household Number', 'Account Type', 'Status', 
                'Email Verified', 'Last Login', 'Login Count', 'Created At'
            ]);
            
            // Data
            foreach ($users as $user) {
                // Get resident name
                $residentName = '';
                if ($user->currentResident) {
                    $residentName = $user->currentResident->full_name;
                } elseif ($user->household && $user->household->currentHeadResident) {
                    $residentName = $user->household->currentHeadResident->full_name;
                }
                
                // Get household number
                $householdNumber = '';
                if ($user->household) {
                    $householdNumber = $user->household->household_number;
                } elseif ($user->currentResident && $user->currentResident->household) {
                    $householdNumber = $user->currentResident->household->household_number;
                }
                
                // Determine account type
                $accountType = $this->getAccountType($user);
                
                fputcsv($file, [
                    $user->id,
                    $user->username,
                    $user->email,
                    $user->contact_number,
                    $user->position,
                    $user->role ? $user->role->name : '',
                    $residentName,
                    $householdNumber,
                    ucfirst($accountType),
                    $user->status,
                    $user->email_verified_at ? 'Yes' : 'No',
                    $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Never',
                    $user->login_count,
                    $user->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}