<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request)
    {
        $query = Role::withCount('users')
            ->withCount('permissions')
            ->latest();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Type filter (system/custom)
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('is_system_role', $request->type === 'system');
        }

        // Users count range filter
        if ($request->filled('users_range')) {
            $this->applyUsersRangeFilter($query, $request->users_range);
        }

        // Permissions count range filter
        if ($request->filled('permissions_range')) {
            $this->applyPermissionsRangeFilter($query, $request->permissions_range);
        }

        // Sorting (for table header)
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Handle sorting by relationship counts
        switch ($sortBy) {
            case 'users_count':
                $query->orderBy('users_count', $sortOrder);
                break;
            case 'permissions_count':
                $query->orderBy('permissions_count', $sortOrder);
                break;
            case 'type':
                $query->orderBy('is_system_role', $sortOrder);
                break;
            case 'created_at':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        $roles = $query->paginate(20)->withQueryString();

        // Transform roles to include counts
        $roles->through(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'is_system_role' => $role->is_system_role,
                'users_count' => $role->users_count ?? 0,
                'permissions_count' => $role->permissions_count ?? 0,
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ];
        });

        return Inertia::render('admin/Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'type', 'users_range', 'permissions_range', 'sort_by', 'sort_order']),
            'stats' => [
                'total_roles' => Role::count(),
                'system_roles' => Role::where('is_system_role', true)->count(),
                'custom_roles' => Role::where('is_system_role', false)->count(),
                'roles_with_users' => Role::has('users')->count(),
                'roles_without_users' => Role::doesntHave('users')->count(),
                'roles_with_permissions' => Role::has('permissions')->count(),
                'roles_without_permissions' => Role::doesntHave('permissions')->count(),
            ],
        ]);
    }

    /**
     * Apply users count range filter to query
     */
    private function applyUsersRangeFilter($query, string $range): void
    {
        switch ($range) {
            case '0':
                $query->having('users_count', 0);
                break;
            case '1-5':
                $query->havingBetween('users_count', [1, 5]);
                break;
            case '6-10':
                $query->havingBetween('users_count', [6, 10]);
                break;
            case '11-20':
                $query->havingBetween('users_count', [11, 20]);
                break;
            case '20+':
                $query->having('users_count', '>=', 20);
                break;
        }
    }

    /**
     * Apply permissions count range filter to query
     */
    private function applyPermissionsRangeFilter($query, string $range): void
    {
        switch ($range) {
            case '0':
                $query->having('permissions_count', 0);
                break;
            case '1-5':
                $query->havingBetween('permissions_count', [1, 5]);
                break;
            case '6-10':
                $query->havingBetween('permissions_count', [6, 10]);
                break;
            case '11-20':
                $query->havingBetween('permissions_count', [11, 20]);
                break;
            case '20+':
                $query->having('permissions_count', '>=', 20);
                break;
        }
    }

    /**
     * Show the form for creating a new role.
     */
    public function create()
    {
        $permissions = Permission::active()
            ->orderedByModule()
            ->get(['id', 'name', 'display_name', 'module', 'description', 'is_active'])
            ->groupBy('module');

        return Inertia::render('admin/Roles/Create', [
            'modules' => Permission::getModules(),
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:roles|regex:/^[a-z_]+$/',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ], [
            'name.regex' => 'Role name must contain only lowercase letters and underscores.'
        ]);

        DB::transaction(function () use ($request) {
            $role = Role::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_system_role' => $request->is_system_role ?? false,
            ]);

            if ($request->has('permissions')) {
                $role->assignPermissions($request->permissions);
            }
        });

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        $role->load(['permissions', 'users' => function ($query) {
            $query->latest()->take(10);
        }]);

        return Inertia::render('admin/Roles/Show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'is_system_role' => $role->is_system_role,
                'users_count' => $role->users_count ?? $role->users()->count(),
                'permissions_count' => $role->permissions()->count(),
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $permission->display_name,
                        'module' => $permission->module,
                        'description' => $permission->description,
                    ];
                }),
                'recent_users' => $role->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->first_name . ' ' . $user->last_name,
                        'email' => $user->email,
                        'username' => $user->username,
                        'status' => $user->status,
                    ];
                }),
                'created_at' => $role->created_at->toISOString(),
                'updated_at' => $role->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role)
    {
        if ($role->is_system_role) {
            return redirect()->route('roles.index')
                ->with('error', 'System roles cannot be edited.');
        }

        $role->load('permissions:id');

        $permissions = Permission::active()
            ->orderedByModule()
            ->get(['id', 'name', 'display_name', 'module', 'description'])
            ->groupBy('module');

        return Inertia::render('admin/Roles/Edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('id')->toArray(),
            ],
            'modules' => Permission::getModules(),
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role)
    {
        if ($role->is_system_role) {
            return redirect()->back()
                ->with('error', 'System roles cannot be modified.');
        }

        $request->validate([
            'name' => 'required|string|max:100|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        DB::transaction(function () use ($request, $role) {
            $role->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            $role->assignPermissions($request->permissions ?? []);
        });

        return redirect()->route('roles.show', $role)
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->is_system_role) {
            return redirect()->back()
                ->with('error', 'System roles cannot be deleted.');
        }

        if ($role->users()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete role that has users assigned. Reassign users first.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Show role permissions management page
     */
    public function permissions(Role $role)
    {
        $permissions = Permission::active()
            ->orderedByModule()
            ->get(['id', 'name', 'display_name', 'description', 'module', 'is_active'])
            ->groupBy('module');

        $currentPermissions = $role->permissions()->pluck('permissions.id')->toArray();

        return Inertia::render('admin/Roles/Permissions', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'is_system_role' => $role->is_system_role,
            ],
            'permissions' => $permissions,
            'currentPermissions' => $currentPermissions,
            'modules' => Permission::getModules(),
        ]);
    }

    /**
     * Assign permissions to role
     */
    public function assignPermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);
        
        try {
            DB::beginTransaction();
            
            $grantedBy = Auth::id();
            $assignments = [];
            $now = now();
            
            foreach ($validated['permission_ids'] as $permissionId) {
                if ($role->permissions()->where('permission_id', $permissionId)->exists()) {
                    continue;
                }
                
                $assignments[] = [
                    'role_id' => $role->id,
                    'permission_id' => $permissionId,
                    'granted_by' => $grantedBy,
                    'granted_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            
            if (empty($assignments)) {
                return redirect()->back()->with('warning', 'All selected permissions are already assigned to this role.');
            }
            
            RolePermission::insert($assignments);
            
            DB::commit();
            
            return redirect()->route('roles.permissions', $role)
                ->with('success', count($assignments) . ' permission(s) assigned successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to assign permissions: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Revoke permission from role
     */
    public function revokePermission(Role $role, Permission $permission)
    {
        if ($role->is_system_role) {
            return redirect()->back()->withErrors([
                'error' => 'Cannot revoke permissions from system roles.'
            ]);
        }
        
        try {
            $role->permissions()->detach($permission->id);
            
            return redirect()->route('roles.permissions', $role)
                ->with('success', 'Permission revoked successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to revoke permission: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk action for roles
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,change_type,duplicate',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'is_system_role' => 'required_if:action,change_type|boolean',
        ]);

        $action = $request->action;
        $roleIds = $request->role_ids;

        DB::beginTransaction();

        try {
            switch ($action) {
                case 'delete':
                    // Filter out system roles and roles with users
                    $deletableRoles = Role::whereIn('id', $roleIds)
                        ->where('is_system_role', false)
                        ->doesntHave('users')
                        ->get();
                    
                    foreach ($deletableRoles as $role) {
                        $role->delete();
                    }
                    
                    DB::commit();
                    return redirect()->back()->with('success', count($deletableRoles) . ' role(s) deleted successfully.');
                    break;

                case 'change_type':
                    $isSystemRole = $request->is_system_role;
                    $updated = Role::whereIn('id', $roleIds)
                        ->where('is_system_role', false) // Only custom roles can change type
                        ->update(['is_system_role' => $isSystemRole]);
                    
                    DB::commit();
                    return redirect()->back()->with('success', $updated . ' role(s) type updated successfully.');
                    break;

                case 'duplicate':
                    $duplicated = 0;
                    $rolesToDuplicate = Role::whereIn('id', $roleIds)->get();
                    
                    foreach ($rolesToDuplicate as $role) {
                        $newRole = $role->replicate();
                        $newRole->name = $role->name . '_copy_' . time() . '_' . $duplicated;
                        $newRole->is_system_role = false; // Duplicates are always custom roles
                        $newRole->save();
                        
                        // Copy permissions
                        foreach ($role->permissions as $permission) {
                            $newRole->permissions()->attach($permission->id, [
                                'granted_by' => Auth::id(),
                                'granted_at' => now(),
                            ]);
                        }
                        
                        $duplicated++;
                    }
                    
                    DB::commit();
                    return redirect()->back()->with('success', $duplicated . ' role(s) duplicated successfully.');
                    break;

                default:
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Invalid action.');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Bulk action failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate bulk report for selected roles
     */
    public function generateBulkReport(Request $request)
    {
        $ids = explode(',', $request->get('ids', ''));
        $roles = Role::whereIn('id', $ids)
            ->withCount(['users', 'permissions'])
            ->with(['permissions'])
            ->get();

        $report = [
            'generated_at' => now()->toISOString(),
            'total_roles' => $roles->count(),
            'roles' => $roles->map(function ($role) {
                return [
                    'name' => $role->name,
                    'type' => $role->is_system_role ? 'System' : 'Custom',
                    'description' => $role->description,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                    'permissions' => $role->permissions->pluck('display_name')->toArray(),
                    'created_at' => $role->created_at->toDateString(),
                ];
            }),
        ];

        if ($request->wantsJson()) {
            return response()->json($report);
        }

        // For CSV download
        $csv = [];
        $csv[] = ['Name', 'Type', 'Description', 'Users', 'Permissions', 'Created At'];
        foreach ($report['roles'] as $role) {
            $csv[] = [
                $role['name'],
                $role['type'],
                $role['description'] ?? 'N/A',
                $role['users_count'],
                $role['permissions_count'],
                $role['created_at'],
            ];
        }

        $filename = 'roles-report-' . now()->format('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w+');
        foreach ($csv as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->withHeaders([
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
    }
}