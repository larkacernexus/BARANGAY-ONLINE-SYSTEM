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
                $query->whereHas('permission', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%");
                })->orWhereHas('role', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
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
                $query->where('granted_by', $request->input('granter'));
            });

        // Handle sorting
        $sort = $request->input('sort', 'granted_at');
        $order = $request->input('order', 'desc');
        
        if ($sort === 'module') {
            $query->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
                  ->orderBy('permissions.module', $order)
                  ->select('role_permissions.*');
        } else {
            $query->orderBy($sort, $order);
        }

        // Get roles and modules for filters
        $roles = Role::orderBy('name')->get(['id', 'name']);
        $modules = Permission::distinct()->pluck('module')->filter()->values();
        
        // Fixed granters query - use username instead of first_name/last_name
        $granters = DB::table('users')
            ->join('role_permissions', 'users.id', '=', 'role_permissions.granted_by')
            ->select('users.id', 'users.username', 'users.email')
            ->distinct()
            ->orderBy('username')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->username,
                    'email' => $user->email,
                ];
            });

        // Paginate the results
        $perPage = $request->input('per_page', 15);
        $rolePermissions = $query->paginate($perPage);

        // Format the response
        $formattedRolePermissions = $rolePermissions->through(function ($rolePermission) {
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
                'granter' => $rolePermission->granter ? [
                    'id' => $rolePermission->granter->id,
                    'username' => $rolePermission->granter->username,
                    'email' => $rolePermission->granter->email,
                ] : null,
            ];
        });

        return Inertia::render('admin/RolePermissions/Index', [
            'role_permissions' => $formattedRolePermissions,
            'filters' => $request->only(['search', 'role', 'module', 'granter', 'sort', 'order', 'per_page']),
            'roles' => $roles,
            'modules' => $modules,
            'granters' => $granters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Load roles with their permissions
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

        // Get active permissions
        $permissions = Permission::where('is_active', true)
            ->select('id', 'name', 'display_name', 'module', 'description', 'is_active')
            ->orderBy('module')
            ->orderBy('display_name')
            ->get()
            ->groupBy('module');

        // Get unique modules
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
            
            // Get existing permissions for this role
            $existingPermissions = $role->permissions()->pluck('permission_id')->toArray();
            
            // Filter out already assigned permissions
            $newPermissions = array_diff($validated['permission_ids'], $existingPermissions);
            
            if (empty($newPermissions)) {
                return redirect()->back()->withErrors([
                    'permission_ids' => 'All selected permissions are already assigned to this role.'
                ]);
            }

            // Prepare data for bulk insert
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
        // Check if role is system role (some system role permissions might be protected)
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

            // Get the role permissions to delete
            $rolePermissions = RolePermission::with('role')
                ->whereIn('id', $validated['permission_ids'])
                ->get();

            // Filter out system role permissions
            $systemRolePermissions = $rolePermissions->filter(function ($rp) {
                return $rp->role->is_system_role;
            });

            if ($systemRolePermissions->count() > 0) {
                DB::rollBack();
                return redirect()->back()->withErrors([
                    'error' => 'Cannot revoke permissions from system roles. Please remove system role permissions from your selection.'
                ]);
            }

            // Delete the permissions
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

        // Apply filters if any
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role_id', $request->role);
        }

        if ($request->has('module') && $request->module !== 'all') {
            $query->whereHas('permission', function ($q) use ($request) {
                $q->where('module', $request->module);
            });
        }

        $rolePermissions = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="role-permissions-' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($rolePermissions) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
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

            // Add data rows
            foreach ($rolePermissions as $rp) {
                fputcsv($file, [
                    $rp->id,
                    $rp->role_id,
                    $rp->role->name ?? 'N/A',
                    $rp->role->is_system_role ? 'System' : 'Custom',
                    $rp->permission_id,
                    $rp->permission->name ?? 'N/A',
                    $rp->permission->display_name ?? 'N/A',
                    $rp->permission->module ?? 'N/A',
                    $rp->granted_by,
                    $rp->granter->username ?? 'N/A',
                    $rp->granter->email ?? 'N/A',
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
                // Remove all existing permissions from target role
                RolePermission::where('role_id', $targetRole->id)->delete();
                $targetPermissions = [];
            }

            // Find permissions to copy
            $permissionsToCopy = array_diff($sourcePermissions, $targetPermissions);

            if (empty($permissionsToCopy)) {
                return redirect()->back()->withErrors([
                    'error' => 'No new permissions to copy. All permissions from source role are already assigned to target role.'
                ]);
            }

            // Prepare assignments
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
        ];

        return response()->json($stats);
    }
}