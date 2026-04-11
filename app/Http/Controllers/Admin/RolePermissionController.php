<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RolePermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RolePermission::with(['role', 'permission', 'granter'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->whereHas('permission', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('display_name', 'like', "%{$search}%");
                    })->orWhereHas('role', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->when($request->filled('role') && $request->input('role') !== 'all', function ($query) use ($request) {
                $query->where('role_id', $request->input('role'));
            })
            ->when($request->filled('module') && $request->input('module') !== 'all', function ($query) use ($request) {
                $query->whereHas('permission', function ($q) use ($request) {
                    $q->where('module', $request->input('module'));
                });
            })
            ->when($request->filled('granter') && $request->input('granter') !== 'all', function ($query) use ($request) {
                if ($request->input('granter') === 'system') {
                    $query->whereNull('granted_by');
                } else {
                    $query->where('granted_by', $request->input('granter'));
                }
            });

        // Date range filter
        if ($request->filled('date_range') && $request->input('date_range') !== '') {
            $this->applyDateRangeFilter($query, $request->input('date_range'));
        }

        // Roles count range filter
        if ($request->filled('roles_count_range') && $request->input('roles_count_range') !== '') {
            $this->applyRolesCountRangeFilter($query, $request->input('roles_count_range'));
        }

        // Sorting - removed from filters, handled by table header
        $sortBy = $request->input('sort_by', 'granted_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        if ($sortBy === 'module') {
            $query->leftJoin('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
                  ->orderBy('permissions.module', $sortOrder)
                  ->select('role_permissions.*');
        } elseif ($sortBy === 'permission_name') {
            $query->leftJoin('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
                  ->orderBy('permissions.display_name', $sortOrder)
                  ->select('role_permissions.*');
        } elseif ($sortBy === 'role_name') {
            $query->leftJoin('roles', 'role_permissions.role_id', '=', 'roles.id')
                  ->orderBy('roles.name', $sortOrder)
                  ->select('role_permissions.*');
        } elseif ($sortBy === 'granter') {
            $query->leftJoin('users', 'role_permissions.granted_by', '=', 'users.id')
                  ->orderBy('users.username', $sortOrder)
                  ->select('role_permissions.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Get roles and modules for filters
        $roles = Role::orderBy('name')->get(['id', 'name']);
        $modules = Permission::distinct()->pluck('module')->filter()->values();
        
        // Get ALL users who CAN grant permissions
        $granters = collect();
        
        // Get users with permission management capabilities
        $usersWithPermission = User::whereHas('permissions', function ($query) {
                $query->where('name', 'manage-permissions')
                      ->orWhere('name', 'assign-permissions')
                      ->orWhere('name', 'manage-roles');
            })
            ->orWhereHas('role.permissions', function ($query) {
                $query->where('name', 'manage-permissions')
                      ->orWhere('name', 'assign-permissions')
                      ->orWhere('name', 'manage-roles');
            })
            ->select('id', 'username', 'email', 'first_name', 'last_name')
            ->orderBy('username')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->username ?: ($user->first_name . ' ' . $user->last_name),
                    'email' => $user->email,
                ];
            });
        
        $granters = $granters->concat($usersWithPermission);
        
        // If no users found with permissions, add admin users
        if ($granters->isEmpty()) {
            $adminUsers = User::whereHas('role', function ($query) {
                    $query->where('name', 'admin')
                          ->orWhere('name', 'super_admin');
                })
                ->select('id', 'username', 'email', 'first_name', 'last_name')
                ->orderBy('username')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->username ?: ($user->first_name . ' ' . $user->last_name),
                        'email' => $user->email,
                    ];
                });
            
            $granters = $granters->concat($adminUsers);
        }
        
        // Add "System" option for NULL granted_by records
        $granters->prepend([
            'id' => 'system',
            'name' => 'System',
            'email' => 'system@local',
        ]);
        
        // Add current user if not already in list
        $currentUser = Auth::user();
        if ($currentUser && !$granters->contains('id', $currentUser->id)) {
            $granters->push([
                'id' => $currentUser->id,
                'name' => $currentUser->username ?: ($currentUser->first_name . ' ' . $currentUser->last_name),
                'email' => $currentUser->email,
            ]);
        }

        // Paginate the results
        $perPage = $request->input('per_page', 15);
        $rolePermissions = $query->paginate($perPage);

        // Format the response
        $formattedRolePermissions = $rolePermissions->through(function ($rolePermission) {
            // Handle NULL granter
            $granterData = null;
            if ($rolePermission->granted_by) {
                $granterData = $rolePermission->granter ? [
                    'id' => $rolePermission->granter->id,
                    'username' => $rolePermission->granter->username,
                    'email' => $rolePermission->granter->email,
                ] : null;
            }
            
            return [
                'id' => $rolePermission->id,
                'role_id' => $rolePermission->role_id,
                'permission_id' => $rolePermission->permission_id,
                'granted_by' => $rolePermission->granted_by,
                'granted_at' => $rolePermission->granted_at,
                'created_at' => $rolePermission->created_at,
                'updated_at' => $rolePermission->updated_at,
                'role' => $rolePermission->role ? [
                    'id' => $rolePermission->role->id,
                    'name' => $rolePermission->role->name,
                    'description' => $rolePermission->role->description,
                    'is_system_role' => $rolePermission->role->is_system_role,
                ] : null,
                'permission' => $rolePermission->permission ? [
                    'id' => $rolePermission->permission->id,
                    'name' => $rolePermission->permission->name,
                    'display_name' => $rolePermission->permission->display_name,
                    'module' => $rolePermission->permission->module,
                    'description' => $rolePermission->permission->description,
                    'is_active' => $rolePermission->permission->is_active,
                ] : null,
                'granter' => $granterData,
            ];
        });

        return Inertia::render('admin/RolePermissions/Index', [
            'role_permissions' => $formattedRolePermissions,
            'filters' => $request->only([
                'search', 'role', 'module', 'granter', 
                'date_range', 'roles_count_range', 
                'sort_by', 'sort_order', 'per_page'
            ]),
            'roles' => $roles,
            'modules' => $modules,
            'granters' => $granters,
        ]);
    }

    /**
     * Apply date range filter to query
     */
    private function applyDateRangeFilter($query, string $range): void
    {
        switch ($range) {
            case 'today':
                $query->whereDate('granted_at', Carbon::today());
                break;
            case 'yesterday':
                $query->whereDate('granted_at', Carbon::yesterday());
                break;
            case 'this_week':
                $query->whereBetween('granted_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                break;
            case 'last_week':
                $query->whereBetween('granted_at', [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()]);
                break;
            case 'this_month':
                $query->whereMonth('granted_at', Carbon::now()->month)
                      ->whereYear('granted_at', Carbon::now()->year);
                break;
            case 'last_month':
                $query->whereMonth('granted_at', Carbon::now()->subMonth()->month)
                      ->whereYear('granted_at', Carbon::now()->subMonth()->year);
                break;
            case 'this_quarter':
                $query->whereBetween('granted_at', [Carbon::now()->startOfQuarter(), Carbon::now()->endOfQuarter()]);
                break;
            case 'this_year':
                $query->whereYear('granted_at', Carbon::now()->year);
                break;
        }
    }

    /**
     * Apply roles count range filter to query
     */
    private function applyRolesCountRangeFilter($query, string $range): void
    {
        $subquery = DB::table('role_permissions')
            ->select('permission_id', DB::raw('COUNT(*) as usage_count'))
            ->groupBy('permission_id');
        
        $query->leftJoinSub($subquery, 'permission_usage', function ($join) {
            $join->on('role_permissions.permission_id', '=', 'permission_usage.permission_id');
        });
        
        switch ($range) {
            case '0':
                $query->where(function ($q) {
                    $q->where('permission_usage.usage_count', 0)
                      ->orWhereNull('permission_usage.usage_count');
                });
                break;
            case '1':
                $query->where('permission_usage.usage_count', 1);
                break;
            case '2-5':
                $query->whereBetween('permission_usage.usage_count', [2, 5]);
                break;
            case '6-10':
                $query->whereBetween('permission_usage.usage_count', [6, 10]);
                break;
            case '10+':
                $query->where('permission_usage.usage_count', '>=', 10);
                break;
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::with(['permissions:id,name,display_name,module,is_active'])
            ->withCount(['users', 'permissions'])
            ->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'is_system_role' => $role->is_system_role,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                    'permissions' => $role->permissions->pluck('id')->toArray()
                ];
            });

        $permissions = Permission::where('is_active', true)
            ->select('id', 'name', 'display_name', 'module', 'description', 'is_active')
            ->orderBy('module')
            ->orderBy('display_name')
            ->get()
            ->groupBy('module');

        $modules = Permission::distinct('module')
            ->whereNotNull('module')
            ->pluck('module')
            ->filter()
            ->values();

        return Inertia::render('admin/RolePermissions/Create', [
            'roles' => $roles,
            'permissions' => $permissions,
            'modules' => $modules,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $role = Role::findOrFail($validated['role_id']);
            
            $existingPermissions = $role->permissions()->pluck('permission_id')->toArray();
            $newPermissions = array_diff($validated['permission_ids'], $existingPermissions);
            
            if (empty($newPermissions)) {
                return redirect()->back()->withErrors([
                    'permission_ids' => 'All selected permissions are already assigned to this role.'
                ]);
            }

            $assignments = [];
            foreach ($newPermissions as $permissionId) {
                $assignments[] = [
                    'role_id' => $validated['role_id'],
                    'permission_id' => $permissionId,
                    'granted_by' => Auth::id(),
                    'granted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            RolePermission::insert($assignments);

            DB::commit();

            return redirect()->route('role-permissions.index')
                ->with('success', count($newPermissions) . ' permission(s) assigned successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to assign permissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(RolePermission $rolePermission)
    {
        $rolePermission->load(['role', 'permission', 'granter']);

        return Inertia::render('admin/RolePermissions/Show', [
            'role_permission' => [
                'id' => $rolePermission->id,
                'role_id' => $rolePermission->role_id,
                'permission_id' => $rolePermission->permission_id,
                'granted_by' => $rolePermission->granted_by,
                'granted_at' => $rolePermission->granted_at,
                'created_at' => $rolePermission->created_at,
                'updated_at' => $rolePermission->updated_at,
                'role' => $rolePermission->role ? [
                    'id' => $rolePermission->role->id,
                    'name' => $rolePermission->role->name,
                    'description' => $rolePermission->role->description,
                    'is_system_role' => $rolePermission->role->is_system_role,
                ] : null,
                'permission' => $rolePermission->permission ? [
                    'id' => $rolePermission->permission->id,
                    'name' => $rolePermission->permission->name,
                    'display_name' => $rolePermission->permission->display_name,
                    'module' => $rolePermission->permission->module,
                    'description' => $rolePermission->permission->description,
                    'is_active' => $rolePermission->permission->is_active,
                ] : null,
                'granter' => $rolePermission->granter ? [
                    'id' => $rolePermission->granter->id,
                    'username' => $rolePermission->granter->username,
                    'email' => $rolePermission->granter->email,
                ] : null,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RolePermission $rolePermission)
    {
        if ($rolePermission->role->is_system_role) {
            return redirect()->back()->withErrors([
                'error' => 'Cannot revoke permissions from system roles.'
            ]);
        }

        try {
            $rolePermission->delete();
            
            return redirect()->route('role-permissions.index')
                ->with('success', 'Permission revoked successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to revoke permission: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk revoke permissions
     */
    public function bulkRevoke(Request $request)
    {
        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:role_permissions,id',
        ]);

        try {
            DB::beginTransaction();

            $rolePermissions = RolePermission::with('role')
                ->whereIn('id', $validated['permission_ids'])
                ->get();

            $systemRolePermissions = $rolePermissions->filter(function ($rp) {
                return $rp->role->is_system_role;
            });

            if ($systemRolePermissions->count() > 0) {
                DB::rollBack();
                return redirect()->back()->withErrors([
                    'error' => 'Cannot revoke permissions from system roles. Please remove system role permissions from your selection.'
                ]);
            }

            $deletedCount = RolePermission::whereIn('id', $validated['permission_ids'])->delete();

            DB::commit();

            return redirect()->route('role-permissions.index')
                ->with('success', $deletedCount . ' permission(s) revoked successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to revoke permissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Export role permissions to CSV
     */
    public function export(Request $request)
    {
        $query = RolePermission::with(['role', 'permission', 'granter']);

        // Apply filters
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role_id', $request->role);
        }

        if ($request->filled('module') && $request->module !== 'all') {
            $query->whereHas('permission', function ($q) use ($request) {
                $q->where('module', $request->module);
            });
        }

        if ($request->filled('granter') && $request->granter !== 'all') {
            if ($request->granter === 'system') {
                $query->whereNull('granted_by');
            } else {
                $query->where('granted_by', $request->granter);
            }
        }

        if ($request->filled('date_range')) {
            $this->applyDateRangeFilter($query, $request->date_range);
        }

        if ($request->filled('roles_count_range')) {
            $this->applyRolesCountRangeFilter($query, $request->roles_count_range);
        }

        $rolePermissions = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="role-permissions-' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($rolePermissions) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, [
                'Assignment ID',
                'Role ID',
                'Role Name',
                'Role Type',
                'Permission ID',
                'Permission Name',
                'Display Name',
                'Module',
                'Granted By (ID)',
                'Granted By (Username)',
                'Granted By (Email)',
                'Granted At',
            ]);

            foreach ($rolePermissions as $rp) {
                $granterName = $rp->granter->username ?? ($rp->granter->first_name . ' ' . $rp->granter->last_name) ?? 'System';
                
                fputcsv($file, [
                    $rp->id,
                    $rp->role_id,
                    $rp->role->name ?? 'N/A',
                    $rp->role->is_system_role ? 'System' : 'Custom',
                    $rp->permission_id,
                    $rp->permission->name ?? 'N/A',
                    $rp->permission->display_name ?? 'N/A',
                    $rp->permission->module ?? 'N/A',
                    $rp->granted_by ?? 'system',
                    $granterName,
                    $rp->granter->email ?? 'system@local',
                    $rp->granted_at,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get permissions for a specific role (for API/JSON response)
     */
    public function getRolePermissions(Role $role)
    {
        $permissions = $role->permissions()
            ->select('permissions.id', 'permissions.name', 'permissions.display_name', 'permissions.module')
            ->get();

        return response()->json([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'is_system_role' => $role->is_system_role,
            ],
            'permissions' => $permissions,
            'count' => $permissions->count(),
        ]);
    }

    /**
     * Assign permissions to multiple roles at once
     */
    public function assignToMultipleRoles(Request $request)
    {
        $validated = $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        try {
            DB::beginTransaction();

            $assignments = [];
            $totalAssigned = 0;

            foreach ($validated['role_ids'] as $roleId) {
                $role = Role::findOrFail($roleId);
                $existingPermissions = $role->permissions()->pluck('permission_id')->toArray();
                
                foreach ($validated['permission_ids'] as $permissionId) {
                    if (!in_array($permissionId, $existingPermissions)) {
                        $assignments[] = [
                            'role_id' => $roleId,
                            'permission_id' => $permissionId,
                            'granted_by' => Auth::id(),
                            'granted_at' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                        $totalAssigned++;
                    }
                }
            }

            if (empty($assignments)) {
                return redirect()->back()->withErrors([
                    'error' => 'All selected permissions are already assigned to the selected roles.'
                ]);
            }

            RolePermission::insert($assignments);

            DB::commit();

            return redirect()->route('role-permissions.index')
                ->with('success', $totalAssigned . ' permission(s) assigned to ' . count($validated['role_ids']) . ' role(s) successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to assign permissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Copy permissions from one role to another
     */
    public function copyPermissions(Request $request)
    {
        $validated = $request->validate([
            'source_role_id' => 'required|exists:roles,id',
            'target_role_id' => 'required|exists:roles,id|different:source_role_id',
            'replace_existing' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $sourceRole = Role::findOrFail($validated['source_role_id']);
            $targetRole = Role::findOrFail($validated['target_role_id']);

            $sourcePermissions = $sourceRole->permissions()->pluck('permission_id')->toArray();
            $targetPermissions = $targetRole->permissions()->pluck('permission_id')->toArray();

            if ($validated['replace_existing'] ?? false) {
                RolePermission::where('role_id', $targetRole->id)->delete();
                $targetPermissions = [];
            }

            $permissionsToCopy = array_diff($sourcePermissions, $targetPermissions);

            if (empty($permissionsToCopy)) {
                return redirect()->back()->withErrors([
                    'error' => 'No new permissions to copy. All permissions from source role are already assigned to target role.'
                ]);
            }

            $assignments = [];
            foreach ($permissionsToCopy as $permissionId) {
                $assignments[] = [
                    'role_id' => $targetRole->id,
                    'permission_id' => $permissionId,
                    'granted_by' => Auth::id(),
                    'granted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            RolePermission::insert($assignments);

            DB::commit();

            return redirect()->route('role-permissions.index')
                ->with('success', count($permissionsToCopy) . ' permission(s) copied from ' . $sourceRole->name . ' to ' . $targetRole->name . ' successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to copy permissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get permissions statistics
     */
    public function getStats()
    {
        $stats = [
            'total_assignments' => RolePermission::count(),
            'total_roles' => Role::count(),
            'total_permissions' => Permission::where('is_active', true)->count(),
            'roles_with_permissions' => Role::has('permissions')->count(),
            'permissions_by_module' => Permission::select('module', DB::raw('count(*) as count'))
                ->whereNotNull('module')
                ->groupBy('module')
                ->get()
                ->toArray(),
            'assignments_by_role' => Role::select('roles.name', DB::raw('count(role_permissions.id) as count'))
                ->leftJoin('role_permissions', 'roles.id', '=', 'role_permissions.role_id')
                ->groupBy('roles.id', 'roles.name')
                ->orderBy('count', 'desc')
                ->get()
                ->toArray(),
            'permissions_by_usage' => DB::table('role_permissions')
                ->select('permission_id', DB::raw('COUNT(*) as usage_count'))
                ->groupBy('permission_id')
                ->orderBy('usage_count', 'desc')
                ->limit(10)
                ->get()
                ->toArray(),
        ];

        return response()->json($stats);
    }
}