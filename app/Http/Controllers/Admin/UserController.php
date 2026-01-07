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

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['role', 'department'])
            ->latest();
        
        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
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
        
        $users = $query->paginate(20)->withQueryString();
        
        $stats = [
            ['label' => 'Total Users', 'value' => User::count()],
            ['label' => 'Active Users', 'value' => User::where('status', 'active')->count()],
            ['label' => 'Administrators', 'value' => User::where('role_id', 1)->count()], // Assuming role_id 1 is Administrator
            ['label' => 'New This Month', 'value' => User::whereMonth('created_at', now()->month)->count()],
        ];
        
        $roles = Role::select(['id', 'name'])
            ->withCount('users')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'count' => $role->users_count,
                ];
            });
        
        return Inertia::render('admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role_id', 'status']),
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
        
        // Get roles with permissions
        $roles = Role::with('permissions')->get()->map(function ($role) {
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
            'name' => $request->first_name . ' ' . $request->last_name,
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
        
        // Attach custom permissions if provided
        if ($request->filled('selected_permissions')) {
            $permissionsData = [];
            foreach ($request->selected_permissions as $permissionId) {
                $permissionsData[$permissionId] = ['is_granted' => true];
            }
            $user->customPermissions()->attach($permissionsData);
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
        $user->load([
            'role',
            'department',
            'customPermissions' => function ($query) {
                $query->where('is_granted', true);
            }
        ]);
        
        // Get all permissions for this user (including role permissions)
        $allPermissions = $user->getAllPermissions();
        $rolePermissions = $user->role ? $user->role->permissions : collect();
        
        // Group permissions by module for display
        $groupedPermissions = $allPermissions->groupBy('module');
        
        return Inertia::render('admin/Users/Show', [
            'user' => $user,
            'permissions' => $groupedPermissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }
    
    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load(['customPermissions']);
        
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
        $roles = Role::with('permissions')->get()->map(function ($role) {
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
        
        // Get user's custom permission IDs
        $userPermissionIds = $user->customPermissions->pluck('id')->toArray();
        
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
            'name' => $request->first_name . ' ' . $request->last_name,
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
        
        // Sync custom permissions if provided
        if ($request->has('selected_permissions')) {
            $permissionsData = [];
            foreach ($request->selected_permissions as $permissionId) {
                $permissionsData[$permissionId] = ['is_granted' => true];
            }
            $user->customPermissions()->sync($permissionsData);
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
        
        $permissionsData = [];
        foreach ($request->permissions as $permissionId) {
            $permissionsData[$permissionId] = ['is_granted' => true];
        }
        
        $user->customPermissions()->sync($permissionsData);
        
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
}