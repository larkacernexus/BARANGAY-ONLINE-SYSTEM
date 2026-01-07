<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
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
        $query = Role::withCount('users')->latest();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('is_system_role', $request->type === 'system');
        }

        $roles = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'type']),
            'stats' => [
                'total_roles' => Role::count(),
                'system_roles' => Role::where('is_system_role', true)->count(),
                'custom_roles' => Role::where('is_system_role', false)->count(),
                'roles_with_users' => Role::has('users')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create()
    {
        $permissions = Permission::active()
            ->orderedByModule()
            ->get(['id', 'name', 'display_name', 'module', 'description'])
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
            'name' => 'required|string|max:100|unique:roles',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        DB::transaction(function () use ($request) {
            $role = Role::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_system_role' => false,
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
     * Get role permissions for API.
     */
   public function permissions(Role $role)
{
    // Get all active permissions grouped by module
    $permissions = Permission::active()
        ->orderedByModule()
        ->get(['id', 'name', 'display_name', 'description', 'module', 'is_active'])
        ->groupBy('module');

    // Get current role permissions
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
}