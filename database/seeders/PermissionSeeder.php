<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Dashboard Module
            ['name' => 'dashboard.access', 'display_name' => 'Access Dashboard', 'module' => 'Dashboard', 'description' => 'Access the main dashboard'],
            ['name' => 'dashboard.view_stats', 'display_name' => 'View Statistics', 'module' => 'Dashboard', 'description' => 'View statistical data on dashboard'],
            
            // Residents Module
            ['name' => 'residents.view', 'display_name' => 'View Residents', 'module' => 'Residents', 'description' => 'View resident records'],
            ['name' => 'residents.create', 'display_name' => 'Create Residents', 'module' => 'Residents', 'description' => 'Create new resident records'],
            ['name' => 'residents.edit', 'display_name' => 'Edit Residents', 'module' => 'Residents', 'description' => 'Edit existing resident records'],
            ['name' => 'residents.delete', 'display_name' => 'Delete Residents', 'module' => 'Residents', 'description' => 'Delete resident records'],
            ['name' => 'residents.export', 'display_name' => 'Export Residents', 'module' => 'Residents', 'description' => 'Export resident data'],
            
            // Households Module
            ['name' => 'households.view', 'display_name' => 'View Households', 'module' => 'Households', 'description' => 'View household records'],
            ['name' => 'households.create', 'display_name' => 'Create Households', 'module' => 'Households', 'description' => 'Create new household records'],
            ['name' => 'households.edit', 'display_name' => 'Edit Households', 'module' => 'Households', 'description' => 'Edit existing household records'],
            ['name' => 'households.delete', 'display_name' => 'Delete Households', 'module' => 'Households', 'description' => 'Delete household records'],
            
            // Payments Module
            ['name' => 'payments.view', 'display_name' => 'View Payments', 'module' => 'Payments', 'description' => 'View payment records'],
            ['name' => 'payments.create', 'display_name' => 'Create Payments', 'module' => 'Payments', 'description' => 'Record new payments'],
            ['name' => 'payments.edit', 'display_name' => 'Edit Payments', 'module' => 'Payments', 'description' => 'Edit payment records'],
            ['name' => 'payments.delete', 'display_name' => 'Delete Payments', 'module' => 'Payments', 'description' => 'Delete payment records'],
            ['name' => 'payments.approve', 'display_name' => 'Approve Payments', 'module' => 'Payments', 'description' => 'Approve pending payments'],
            
            // Clearances Module
            ['name' => 'clearances.view', 'display_name' => 'View Clearances', 'module' => 'Clearances', 'description' => 'View clearance records'],
            ['name' => 'clearances.create', 'display_name' => 'Create Clearances', 'module' => 'Clearances', 'description' => 'Create new clearances'],
            ['name' => 'clearances.edit', 'display_name' => 'Edit Clearances', 'module' => 'Clearances', 'description' => 'Edit clearance records'],
            ['name' => 'clearances.approve', 'display_name' => 'Approve Clearances', 'module' => 'Clearances', 'description' => 'Approve pending clearances'],
            ['name' => 'clearances.print', 'display_name' => 'Print Clearances', 'module' => 'Clearances', 'description' => 'Print clearance certificates'],
            
            // Reports Module
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'module' => 'Reports', 'description' => 'View generated reports'],
            ['name' => 'reports.generate', 'display_name' => 'Generate Reports', 'module' => 'Reports', 'description' => 'Generate new reports'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'module' => 'Reports', 'description' => 'Export report data'],
            
            // Users Module
            ['name' => 'users.view', 'display_name' => 'View Users', 'module' => 'Users', 'description' => 'View user accounts'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'module' => 'Users', 'description' => 'Create new user accounts'],
            ['name' => 'users.edit', 'display_name' => 'Edit Users', 'module' => 'Users', 'description' => 'Edit user accounts'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'module' => 'Users', 'description' => 'Delete user accounts'],
            ['name' => 'users.permissions', 'display_name' => 'Manage Permissions', 'module' => 'Users', 'description' => 'Manage user permissions'],
            
            // Settings Module
            ['name' => 'settings.view', 'display_name' => 'View Settings', 'module' => 'Settings', 'description' => 'View system settings'],
            ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'module' => 'Settings', 'description' => 'Edit system settings'],
            
            // Departments Module
            ['name' => 'departments.view', 'display_name' => 'View Departments', 'module' => 'Departments', 'description' => 'View department information'],
            ['name' => 'departments.manage', 'display_name' => 'Manage Departments', 'module' => 'Departments', 'description' => 'Manage department records'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Create roles
        $roles = [
            [
                'name' => 'Administrator',
                'description' => 'Full system access and management',
                'is_system_role' => true,
                'permissions' => Permission::all()->pluck('id')->toArray(),
            ],
            [
                'name' => 'Barangay Captain',
                'description' => 'Barangay captain with oversight access',
                'is_system_role' => true,
                'permissions' => Permission::whereIn('module', ['Dashboard', 'Residents', 'Households', 'Reports'])
                    ->pluck('id')->toArray(),
            ],
            [
                'name' => 'Treasury Officer',
                'description' => 'Payment and financial management',
                'is_system_role' => true,
                'permissions' => Permission::whereIn('module', ['Dashboard', 'Payments', 'Reports'])
                    ->pluck('id')->toArray(),
            ],
            [
                'name' => 'Records Clerk',
                'description' => 'Resident and household management',
                'is_system_role' => true,
                'permissions' => Permission::whereIn('module', ['Dashboard', 'Residents', 'Households', 'Reports'])
                    ->pluck('id')->toArray(),
            ],
            [
                'name' => 'Clearance Officer',
                'description' => 'Clearance and certificate issuance',
                'is_system_role' => true,
                'permissions' => Permission::whereIn('module', ['Dashboard', 'Clearances', 'Reports'])
                    ->pluck('id')->toArray(),
            ],
            [
                'name' => 'Viewer',
                'description' => 'Read-only access',
                'is_system_role' => true,
                'permissions' => Permission::where('name', 'like', '%.view')
                    ->pluck('id')->toArray(),
            ],
        ];

        foreach ($roles as $roleData) {
            $permissionIds = $roleData['permissions'];
            unset($roleData['permissions']);
            
            $role = Role::create($roleData);
            $role->assignPermissions($permissionIds);
        }

        // Create departments
        $departments = [
            ['name' => 'Barangay Office', 'description' => 'Main barangay administration office'],
            ['name' => 'Finance Department', 'description' => 'Handles financial transactions and payments'],
            ['name' => 'Registry Department', 'description' => 'Manages resident and household records'],
            ['name' => 'Services Department', 'description' => 'Provides barangay services and clearances'],
            ['name' => 'Health Department', 'description' => 'Health and sanitation services'],
            ['name' => 'Security Department', 'description' => 'Peace and order maintenance'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        // Create admin user
        $admin = User::create([
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@barangaykibawe.ph',
            'username' => 'admin',
            'password' => Hash::make('password123'),
            'contact_number' => '09123456789',
            'position' => 'System Administrator',
            'department_id' => Department::where('name', 'Barangay Office')->first()->id,
            'role_id' => Role::where('name', 'Administrator')->first()->id,
            'status' => 'active', // Changed from is_active to status
            'email_verified_at' => now(),
        ]);

        // Create sample barangay captain
        $captain = User::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'captain@barangaykibawe.ph',
            'username' => 'captain',
            'password' => Hash::make('password123'),
            'contact_number' => '09123456780',
            'position' => 'Barangay Captain',
            'department_id' => Department::where('name', 'Barangay Office')->first()->id,
            'role_id' => Role::where('name', 'Barangay Captain')->first()->id,
            'status' => 'active', // Changed from is_active to status
            'email_verified_at' => now(),
        ]);
    }
}