<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::withCount('roles')->latest();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('module') && $request->module !== 'all') {
            $query->where('module', $request->module);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        $permissions = $query->paginate(30)->withQueryString();

        $modules = Permission::getModules();
        $availableModules = Permission::distinct()->pluck('module')->sort()->values();

        return Inertia::render('admin/Permissions/Index', [
            'permissions' => $permissions,
            'modules' => $modules,
            'available_modules' => $availableModules,
            'filters' => $request->only(['search', 'module', 'status']),
            'stats' => [
                'total_permissions' => Permission::count(),
                'active_permissions' => Permission::where('is_active', true)->count(),
                'modules_count' => $availableModules->count(),
                'assigned_permissions' => Permission::has('roles')->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Permissions/Create', [
            'modules' => Permission::getModules(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:permissions',
            'display_name' => 'required|string|max:100',
            'module' => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        Permission::create([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'module' => $request->module,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function show(Permission $permission)
    {
        $permission->load(['roles' => function ($query) {
            $query->withCount('users')->latest();
        }]);

        return Inertia::render('admin/Permissions/Show', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'display_name' => $permission->display_name,
                'module' => $permission->module,
                'description' => $permission->description,
                'is_active' => $permission->is_active,
                'roles_count' => $permission->roles_count ?? $permission->roles()->count(),
                'roles' => $permission->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description,
                        'users_count' => $role->users_count,
                        'is_system_role' => $role->is_system_role,
                    ];
                }),
                'created_at' => $permission->created_at->toISOString(),
                'updated_at' => $permission->updated_at->toISOString(),
            ],
        ]);
    }

    public function edit(Permission $permission)
    {
        return Inertia::render('admin/Permissions/Edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'display_name' => $permission->display_name,
                'module' => $permission->module,
                'description' => $permission->description,
                'is_active' => $permission->is_active,
            ],
            'modules' => Permission::getModules(),
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:permissions,name,' . $permission->id,
            'display_name' => 'required|string|max:100',
            'module' => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $permission->update([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'module' => $request->module,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('permissions.show', $permission)
            ->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission)
    {
        if ($permission->roles()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete permission that is assigned to roles. Remove assignments first.');
        }

        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }

    public function toggleStatus(Permission $permission)
    {
        $permission->update(['is_active' => !$permission->is_active]);

        $status = $permission->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Permission {$status} successfully.");
    }
}