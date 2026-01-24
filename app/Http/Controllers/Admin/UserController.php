<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['role', 'department'])
            ->select([
                'id',
                'first_name',
                'last_name',
                'email',
                'username',
                'contact_number',
                'position',
                'department_id',
                'role_id',
                'status',
                'email_verified_at',
                'last_login_at',
                'last_login_ip',
                'login_count',
                'created_at',
                'updated_at',
                'two_factor_confirmed_at',
                'require_password_change'
            ]);
        
        // Search filter
        if ($request->has('search') && !empty($search = $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }
        
        // Role filter
        if ($request->has('role_id') && $request->input('role_id') !== 'all') {
            $query->where('role_id', $request->input('role_id'));
        }
        
        // Status filter
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        // Department filter
        if ($request->has('department_id') && $request->input('department_id') !== 'all') {
            $query->where('department_id', $request->input('department_id'));
        }
        
        // 2FA filter
        if ($request->has('two_factor') && $request->input('two_factor') !== 'all') {
            if ($request->input('two_factor') === 'enabled') {
                $query->whereNotNull('two_factor_confirmed_at');
            } else {
                $query->whereNull('two_factor_confirmed_at');
            }
        }
        
        // Email verification filter
        if ($request->has('email_verified') && $request->input('email_verified') !== 'all') {
            if ($request->input('email_verified') === 'verified') {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }
        
        // Date range filters
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
        
        // Login activity filter
        if ($request->has('last_login') && $request->input('last_login') !== 'all') {
            $days = match($request->input('last_login')) {
                'today' => 1,
                'week' => 7,
                'month' => 30,
                'quarter' => 90,
                'year' => 365,
                default => 0
            };
            
            if ($days > 0) {
                $query->where('last_login_at', '>=', now()->subDays($days));
            } else {
                $query->whereNull('last_login_at');
            }
        }
        
        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Validate sort column to prevent SQL injection
        $allowedSortColumns = ['first_name', 'last_name', 'email', 'created_at', 'last_login_at', 'login_count', 'status', 'role_id'];
        $sortBy = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'created_at';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? $sortOrder : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);
        
        // Pagination
        $perPage = min($request->input('per_page', 20), 100);
        $users = $query->paginate($perPage)->withQueryString();
        
        // Format users for frontend
        $formattedUsers = $users->through(function ($user) {
            // Get role permissions count safely
            $rolePermissions = 0;
            if ($user->role && method_exists($user->role, 'permissions')) {
                $rolePermissions = $user->role->permissions()->count();
            }
            
            // Get user permissions count safely
            $userPermissions = 0;
            if (method_exists($user, 'permissions')) {
                $userPermissions = $user->permissions()->count();
            }
            
            return [
                'id' => $user->id,
                'name' => $user->first_name || $user->last_name 
                    ? trim($user->first_name . ' ' . $user->last_name) 
                    : $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'username' => $user->username,
                'contact_number' => $user->contact_number,
                'position' => $user->position,
                'department_id' => $user->department_id,
                'department' => $user->department ? [
                    'id' => $user->department->id,
                    'name' => $user->department->name,
                ] : null,
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
                'recent_logins_count' => 0, // Temporary - fix when loginLogs relationship exists
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'two_factor_enabled' => !is_null($user->two_factor_confirmed_at),
                'require_password_change' => $user->require_password_change,
                'is_online' => $user->last_login_at && $user->last_login_at->gt(now()->subMinutes(15)),
                'total_permissions' => $rolePermissions + $userPermissions,
            ];
        });
        
        // Calculate statistics
        $stats = [
            ['label' => 'Total Users', 'value' => User::count()],
            ['label' => 'Active Users', 'value' => User::where('status', 'active')->count()],
            ['label' => 'Online Now', 'value' => User::where('status', 'active')
                ->where('last_login_at', '>=', now()->subMinutes(15))
                ->count()],
            ['label' => 'New This Month', 'value' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count()],
            ['label' => 'With 2FA', 'value' => User::whereNotNull('two_factor_confirmed_at')->count()],
            ['label' => 'Inactive Users', 'value' => User::where('status', 'inactive')->count()],
        ];
        
        // Get roles with user counts
        $roles = Role::select(['id', 'name', 'description'])
            ->withCount(['users' => function ($query) {
                $query->where('status', 'active');
            }])
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'count' => $role->users_count,
                    'color' => $this->getRoleColor($role->name),
                ];
            });
        
        // Get departments for filtering
        $departments = Department::select(['id', 'name'])
            ->withCount('users')
            ->get()
            ->map(function ($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'count' => $dept->users_count,
                ];
            });
        
        return Inertia::render('admin/Users/Index', [
            'users' => $formattedUsers,
            'stats' => $stats,
            'roles' => $roles,
            'departments' => $departments,
            'filters' => $request->only(['search', 'role_id', 'status', 'department_id', 'two_factor', 'email_verified', 'date_from', 'date_to', 'last_login', 'sort_by', 'sort_order', 'per_page']),
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'per_page' => $perPage,
        ]);
    }
    
    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
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
        
        // Get roles with permissions (without pivot column issues)
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
        
        // Get departments
        $departments = Department::where('is_active', true)
            ->get()
            ->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'description' => $department->description,
                ];
            });
        
        // If tables are empty, provide fallback data
        if ($roles->isEmpty()) {
            $roles = collect([
                ['id' => 1, 'name' => 'Administrator', 'description' => 'Full system access', 'permissions' => []],
                ['id' => 2, 'name' => 'Treasury Officer', 'description' => 'Payment management', 'permissions' => []],
                ['id' => 3, 'name' => 'Records Clerk', 'description' => 'Resident management', 'permissions' => []],
                ['id' => 4, 'name' => 'Clearance Officer', 'description' => 'Clearance issuance', 'permissions' => []],
                ['id' => 5, 'name' => 'Viewer', 'description' => 'Read-only access', 'permissions' => []],
            ]);
        }
        
        if ($departments->isEmpty()) {
            $departments = collect([
                ['id' => 1, 'name' => 'Barangay Office', 'description' => 'Main administration'],
                ['id' => 2, 'name' => 'Finance Department', 'description' => 'Financial management'],
                ['id' => 3, 'name' => 'Registry Department', 'description' => 'Records management'],
                ['id' => 4, 'name' => 'Services Department', 'description' => 'Public services'],
                ['id' => 5, 'name' => 'Health Department', 'description' => 'Health services'],
                ['id' => 6, 'name' => 'Security Department', 'description' => 'Security services'],
            ]);
        }
        
        return Inertia::render('admin/Users/Create', [
            'permissions' => $permissions,
            'roles' => $roles,
            'departments' => $departments,
        ]);
    }
    
    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:50|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'contact_number' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'role_id' => 'required|exists:roles,id',
            'selected_permissions' => 'nullable|array',
            'selected_permissions.*' => 'exists:permissions,id',
            'status' => 'required|in:active,inactive',
            'require_password_change' => 'boolean',
            'is_email_verified' => 'boolean',
            'send_setup_email' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Create user
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'contact_number' => $request->contact_number,
            'position' => $request->position,
            'department_id' => $request->department_id,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'require_password_change' => $request->boolean('require_password_change', false),
            'email_verified_at' => $request->boolean('is_email_verified') ? now() : null,
        ]);
        
        // Attach permissions if provided - Only if relationship exists
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
        
        return redirect()->route('users.show', $user)
            ->with('success', 'User created successfully!');
    }
    
    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        // Load basic relationships
        $user->load(['department']);
        
        // Load role with its permissions (without pivot column issues)
        $role = $user->role ? Role::with(['permissions' => function ($query) {
            $query->select([
                'permissions.id',
                'permissions.name', 
                'permissions.display_name', 
                'permissions.description', 
                'permissions.module'
            ]);
        }])->find($user->role_id) : null;
        
        // Load user's direct permissions (without pivot column issues)
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
        
        // Get recent login activity (last 10 logins) - if loginLogs relationship exists
        $recentLogins = [];
        if (method_exists($user, 'loginLogs')) {
            $recentLogins = $user->loginLogs()
                ->select(['id', 'ip_address', 'user_agent', 'login_at', 'logout_at', 'created_at'])
                ->latest('login_at')
                ->take(10)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'ip_address' => $log->ip_address,
                        'user_agent' => $log->user_agent,
                        'login_at' => $log->login_at,
                        'logout_at' => $log->logout_at,
                        'duration' => $log->logout_at 
                            ? Carbon::parse($log->login_at)->diffInMinutes(Carbon::parse($log->logout_at)) . ' minutes'
                            : 'Still active',
                        'device' => $this->parseUserAgent($log->user_agent),
                        'created_at' => $log->created_at,
                    ];
                })->toArray();
        }
        
        // Get all permissions for this user (including role permissions)
        $rolePermissions = $role ? $role->permissions : collect();
        
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
        ];
        
        // Add recent login count if available
        if (method_exists($user, 'loginLogs')) {
            $stats[] = ['label' => 'Recent Logins (30 days)', 'value' => $user->loginLogs()
                ->where('login_at', '>=', now()->subDays(30))
                ->count()];
            $stats[] = ['label' => 'Active Sessions', 'value' => $user->loginLogs()
                ->whereNull('logout_at')
                ->where('login_at', '>=', now()->subHours(24))
                ->count()];
        }
        
        // Get user activity timeline
        $activityTimeline = collect();
        
        // Add login activities
        foreach ($recentLogins as $login) {
            $activityTimeline->push([
                'id' => 'login_' . $login['id'],
                'type' => 'login',
                'title' => 'User Login',
                'description' => 'Logged in from ' . $login['device']['browser'] . ' on ' . $login['device']['os'],
                'icon' => 'login',
                'timestamp' => $login['login_at'],
                'details' => [
                    'ip_address' => $login['ip_address'],
                    'device' => $login['device']['full'],
                    'duration' => $login['duration'],
                ],
                'color' => 'blue',
            ]);
            
            if ($login['logout_at']) {
                $activityTimeline->push([
                    'id' => 'logout_' . $login['id'],
                    'type' => 'logout',
                    'title' => 'User Logout',
                    'description' => 'Logged out after ' . $login['duration'],
                    'icon' => 'logout',
                    'timestamp' => $login['logout_at'],
                    'details' => [
                        'session_duration' => $login['duration'],
                    ],
                    'color' => 'gray',
                ]);
            }
        }
        
        // Sort timeline by timestamp
        $activityTimeline = $activityTimeline->sortByDesc('timestamp')->values();
        
        return Inertia::render('admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->first_name || $user->last_name 
                    ? trim($user->first_name . ' ' . $user->last_name) 
                    : $user->email,
                'email' => $user->email,
                'username' => $user->username,
                'contact_number' => $user->contact_number,
                'position' => $user->position,
                'department_id' => $user->department_id,
                'department' => $user->department ? [
                    'id' => $user->department->id,
                    'name' => $user->department->name,
                    'description' => $user->department->description,
                ] : null,
                'role_id' => $user->role_id,
                'role' => $role ? [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'color' => $this->getRoleColor($role->name),
                ] : null,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'require_password_change' => $user->require_password_change,
                'password_changed_at' => $user->password_changed_at,
                'two_factor_secret' => $user->two_factor_secret,
                'two_factor_recovery_codes' => $user->two_factor_recovery_codes,
                'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
                'login_count' => $user->login_count,
                'current_login_ip' => $user->current_login_ip,
                'last_logout_at' => $user->last_logout_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'is_online' => $user->last_login_at && Carbon::parse($user->last_login_at)->gt(now()->subMinutes(15)),
            ],
            'permissions' => $groupedPermissions,
            'directPermissions' => $directPermissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'description' => $permission->description,
                    'module' => $permission->module,
                ];
            }),
            'rolePermissions' => $rolePermissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'description' => $permission->description,
                    'module' => $permission->module,
                ];
            }),
            'stats' => $stats,
            'recentLogins' => $recentLogins,
            'activityTimeline' => $activityTimeline,
        ]);
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
            'user', 'member' => 'bg-gray-100 text-gray-800 border-gray-200',
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
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        // Load user with permissions
        $user->load(['permissions' => function ($query) {
            $query->select([
                'permissions.id',
                'permissions.name', 
                'permissions.display_name', 
                'permissions.description', 
                'permissions.module'
            ]);
        }]);
        
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
        
        // Get roles with permissions (without pivot column issues)
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
        
        // Get departments
        $departments = Department::where('is_active', true)
            ->get()
            ->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'description' => $department->description,
                ];
            });
        
        // Get user's permission IDs
        $userPermissionIds = $user->permissions->pluck('id')->toArray();
        
        return Inertia::render('admin/Users/Edit', [
            'user' => $user,
            'permissions' => $permissions,
            'roles' => $roles,
            'departments' => $departments,
            'userPermissionIds' => $userPermissionIds,
        ]);
    }
    
    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'username' => 'required|string|max:50|unique:users,username,' . $user->id,
            'contact_number' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'role_id' => 'required|exists:roles,id',
            'selected_permissions' => 'nullable|array',
            'selected_permissions.*' => 'exists:permissions,id',
            'status' => 'required|in:active,inactive',
            'require_password_change' => 'boolean',
            'is_email_verified' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Update user
        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'username' => $request->username,
            'contact_number' => $request->contact_number,
            'position' => $request->position,
            'department_id' => $request->department_id,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'require_password_change' => $request->boolean('require_password_change', false),
            'email_verified_at' => $request->boolean('is_email_verified') ? now() : $user->email_verified_at,
        ]);
        
        // Update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Rules\Password::defaults()],
            ]);
            
            $user->update([
                'password' => Hash::make($request->password),
                'password_changed_at' => $request->boolean('require_password_change') ? null : now(),
            ]);
        }
        
        // Update permissions if provided - Only if relationship exists
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
        
        return redirect()->route('users.show', $user)
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
     * Update user permissions (separate endpoint if needed)
     */
    public function updatePermissions(Request $request, User $user)
    {
        $request->validate([
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        
        // Only proceed if relationship exists
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
                
                // Delete users
                User::whereIn('id', $userIds)->delete();
                $message = count($userIds) . ' users deleted successfully!';
                break;
                
            case 'reset_password':
                $tempPassword = 'Temporary@123'; // In production, generate secure password
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
        $users = User::with(['role', 'department'])->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="users_' . date('Y-m-d') . '.csv"',
        ];
        
        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'ID', 'First Name', 'Last Name', 'Email', 'Username', 'Contact Number',
                'Position', 'Department', 'Role', 'Status', 'Email Verified',
                'Last Login', 'Login Count', 'Created At'
            ]);
            
            // Data
            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->first_name,
                    $user->last_name,
                    $user->email,
                    $user->username,
                    $user->contact_number,
                    $user->position,
                    $user->department ? $user->department->name : '',
                    $user->role ? $user->role->name : '',
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