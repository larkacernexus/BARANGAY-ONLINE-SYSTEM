<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting permissions seeding...');
        
        $this->createPermissions();
        $this->assignPermissionsToRoles();
        
        $this->command->info('✅ Permissions seeding completed!');
    }

    /**
     * Create all permissions based on actual routes
     */
    private function createPermissions(): void
    {
        $this->command->info('Creating permissions...');
        
        $permissions = [
            // ====================
            // DASHBOARD
            // ====================
            ['name' => 'view-dashboard', 'display_name' => 'View Dashboard', 'module' => 'Dashboard', 'description' => 'Access main dashboard'],
            ['name' => 'view-admin-dashboard', 'display_name' => 'View Admin Dashboard', 'module' => 'Dashboard', 'description' => 'Access admin dashboard'],

            // ====================
            // USER MANAGEMENT
            // ====================
            ['name' => 'manage-users', 'display_name' => 'Manage Users', 'module' => 'Users', 'description' => 'Full user management access'],

            // ====================
            // ROLES & PERMISSIONS
            // ====================
            ['name' => 'manage-roles', 'display_name' => 'Manage Roles', 'module' => 'Roles', 'description' => 'Create, edit, and delete roles'],
            ['name' => 'manage-permissions', 'display_name' => 'Manage Permissions', 'module' => 'Permissions', 'description' => 'Manage system permissions'],

            // ====================
            // RESIDENT MANAGEMENT
            // ====================
            ['name' => 'manage-residents', 'display_name' => 'Manage Residents', 'module' => 'Residents', 'description' => 'Full resident management'],

            // ====================
            // OFFICIALS MANAGEMENT
            // ====================
            ['name' => 'manage-officials', 'display_name' => 'Manage Officials', 'module' => 'Officials', 'description' => 'Manage barangay officials'],

            // ====================
            // COMMITTEES MANAGEMENT
            // ====================
            ['name' => 'manage-committees', 'display_name' => 'Manage Committees', 'module' => 'Committees', 'description' => 'Manage barangay committees'],

            // ====================
            // POSITIONS MANAGEMENT
            // ====================
            ['name' => 'manage-positions', 'display_name' => 'Manage Positions', 'module' => 'Positions', 'description' => 'Manage official positions'],

            // ====================
            // HOUSEHOLDS MANAGEMENT
            // ====================
            ['name' => 'manage-households', 'display_name' => 'Manage Households', 'module' => 'Households', 'description' => 'Manage household records'],

            // ====================
            // PAYMENTS MANAGEMENT
            // ====================
            ['name' => 'manage-payments', 'display_name' => 'Manage Payments', 'module' => 'Payments', 'description' => 'Full payment management'],
            ['name' => 'view-payments', 'display_name' => 'View Payments', 'module' => 'Payments', 'description' => 'View payment records only'],

            // ====================
            // FEES MANAGEMENT
            // ====================
            ['name' => 'manage-fees', 'display_name' => 'Manage Fees', 'module' => 'Fees', 'description' => 'Manage fee structure'],
            ['name' => 'view-fees', 'display_name' => 'View Fees', 'module' => 'Fees', 'description' => 'View fee records only'],

            // ====================
            // FEE TYPES MANAGEMENT
            // ====================
            ['name' => 'manage-fee-types', 'display_name' => 'Manage Fee Types', 'module' => 'Fees', 'description' => 'Manage fee categories'],
            ['name' => 'view-fee-types', 'display_name' => 'View Fee Types', 'module' => 'Fees', 'description' => 'View fee types only'],

            // ====================
            // COMMUNITY REPORTS MANAGEMENT
            // ====================
            ['name' => 'manage-reports', 'display_name' => 'Manage Community Reports', 'module' => 'Community Reports', 'description' => 'Full community report management'],
            ['name' => 'view-reports', 'display_name' => 'View Community Reports', 'module' => 'Community Reports', 'description' => 'View community reports only'],
            ['name' => 'create-reports', 'display_name' => 'Create Community Reports', 'module' => 'Community Reports', 'description' => 'Create new community reports'],
            ['name' => 'edit-reports', 'display_name' => 'Edit Community Reports', 'module' => 'Community Reports', 'description' => 'Edit existing community reports'],
            ['name' => 'delete-reports', 'display_name' => 'Delete Community Reports', 'module' => 'Community Reports', 'description' => 'Delete community reports'],
            ['name' => 'assign-reports', 'display_name' => 'Assign Community Reports', 'module' => 'Community Reports', 'description' => 'Assign reports to staff'],
            ['name' => 'resolve-reports', 'display_name' => 'Resolve Community Reports', 'module' => 'Community Reports', 'description' => 'Mark reports as resolved'],
            ['name' => 'review-reports', 'display_name' => 'Review Community Reports', 'module' => 'Community Reports', 'description' => 'Review and acknowledge reports'],

            // ====================
            // BLOTTER REPORTS MANAGEMENT
            // ====================
            ['name' => 'manage-blotters', 'display_name' => 'Manage Blotters', 'module' => 'Blotters', 'description' => 'Full blotter report management'],
            ['name' => 'view-blotters', 'display_name' => 'View Blotters', 'module' => 'Blotters', 'description' => 'View blotter reports only'],

            // ====================
            // REPORT TYPES MANAGEMENT
            // ====================
            ['name' => 'manage-report-types', 'display_name' => 'Manage Report Types', 'module' => 'Community Reports', 'description' => 'Manage community report categories'],
            ['name' => 'view-report-types', 'display_name' => 'View Report Types', 'module' => 'Community Reports', 'description' => 'View report types only'],

            // ====================
            // FORMS MANAGEMENT
            // ====================
            ['name' => 'manage-forms', 'display_name' => 'Manage Forms', 'module' => 'Forms', 'description' => 'Manage downloadable forms'],

            // ====================
            // ANNOUNCEMENTS MANAGEMENT
            // ====================
            ['name' => 'manage-announcements', 'display_name' => 'Manage Announcements', 'module' => 'Announcements', 'description' => 'Manage public announcements'],
            ['name' => 'view-announcements', 'display_name' => 'View Announcements', 'module' => 'Announcements', 'description' => 'View announcements only'],

            // ====================
            // CLEARANCES MANAGEMENT
            // ====================
            ['name' => 'manage-clearances', 'display_name' => 'Manage Clearances', 'module' => 'Clearances', 'description' => 'Full clearance management'],
            ['name' => 'view-clearances', 'display_name' => 'View Clearances', 'module' => 'Clearances', 'description' => 'View clearances only'],
            ['name' => 'issue-clearances', 'display_name' => 'Issue Clearances', 'module' => 'Clearances', 'description' => 'Issue/approve clearances'],

            // ====================
            // CLEARANCE TYPES MANAGEMENT
            // ====================
            ['name' => 'manage-clearance-types', 'display_name' => 'Manage Clearance Types', 'module' => 'Clearances', 'description' => 'Manage clearance categories'],
            ['name' => 'view-clearance-types', 'display_name' => 'View Clearance Types', 'module' => 'Clearances', 'description' => 'View clearance types only'],

            // ====================
            // PUROK MANAGEMENT
            // ====================
            ['name' => 'manage-puroks', 'display_name' => 'Manage Puroks', 'module' => 'Puroks', 'description' => 'Manage purok/zones'],

            // ====================
            // BACKUP MANAGEMENT
            // ====================
            ['name' => 'manage-backups', 'display_name' => 'Manage Backups', 'module' => 'System', 'description' => 'Create, download, and restore system backups'],

            // ====================
            // REPORTS (GENERAL REPORTS)
            // ====================
            ['name' => 'view-statistics', 'display_name' => 'View Statistics', 'module' => 'Reports', 'description' => 'Access statistics and analytics'],

            // ====================
            // SECURITY LOGS
            // ====================
            ['name' => 'view-security-logs', 'display_name' => 'View Security Logs', 'module' => 'Security', 'description' => 'Access security and audit logs'],

            // ====================
            // NEW: DOCUMENT TYPES MANAGEMENT (ADDED)
            // ====================
            ['name' => 'manage-document-types', 'display_name' => 'Manage Document Types', 'module' => 'Documents', 'description' => 'Manage document categories and requirements'],
            ['name' => 'view-document-types', 'display_name' => 'View Document Types', 'module' => 'Documents', 'description' => 'View document types only'],

            // ====================
            // NEW: CALENDAR MANAGEMENT (ADDED)
            // ====================
            ['name' => 'manage-calendar', 'display_name' => 'Manage Calendar', 'module' => 'Calendar', 'description' => 'Manage events and schedules'],
            ['name' => 'view-calendar', 'display_name' => 'View Calendar', 'module' => 'Calendar', 'description' => 'View calendar events only'],
        ];

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($permissions as $permissionData) {
            $permission = Permission::firstOrNew(['name' => $permissionData['name']]);

            if ($permission->exists) {
                $permission->update($permissionData);
                $updatedCount++;
            } else {
                $permission->fill($permissionData)->save();
                $createdCount++;
            }
        }

        $this->command->info('✅ Permissions created/updated:');
        $this->command->info('   - Created: ' . $createdCount . ' new permissions');
        $this->command->info('   - Updated: ' . $updatedCount . ' existing permissions');
        $this->command->info('   - Total: ' . Permission::count() . ' permissions in database');
    }

    /**
     * Assign permissions to existing roles
     */
    private function assignPermissionsToRoles(): void
    {
        $this->command->info('Assigning permissions to roles...');
        
        // Get all roles that exist
        $roles = Role::all()->keyBy('name');

        if ($roles->isEmpty()) {
            $this->command->warn('⚠️  No roles found in database. Please run roles seeder first.');
            return;
        }

        $this->command->info('Found ' . $roles->count() . ' existing roles');

        // Define permission assignments for each role
        $rolePermissions = [
            // 1. SYSTEM ADMINISTRATOR - ALL PERMISSIONS
            'Administrator' => Permission::all()->pluck('name')->toArray(),

            // 2. BARANGAY CAPTAIN - ALL EXCEPT BACKUPS
            'Barangay Captain' => Permission::whereNotIn('name', [
                'manage-backups',
            ])->pluck('name')->toArray(),

            // 3. BARANGAY SECRETARY
            'Barangay Secretary' => [
                // Dashboard
                'view-dashboard',
                'view-admin-dashboard',

                // Document Management - FULL ACCESS
                'manage-residents',
                'manage-forms',
                'manage-clearances',
                'issue-clearances',
                'manage-clearance-types',
                'view-clearance-types',
                'manage-households',
                'manage-puroks',
                'manage-positions',
                'manage-committees',
                'manage-officials',

                // Document Types - FULL ACCESS (Secretary handles documents)
                'manage-document-types',
                'view-document-types',

                // Community Reports - FULL ACCESS
                'manage-reports',
                'view-reports',
                'create-reports',
                'edit-reports',
                'assign-reports',
                'resolve-reports',
                'review-reports',
                'manage-report-types',
                'view-report-types',

                // Blotters - FULL ACCESS
                'manage-blotters',
                'view-blotters',

                // Announcements - FULL ACCESS
                'manage-announcements',
                'view-announcements',

                // Calendar - FULL ACCESS
                'manage-calendar',
                'view-calendar',

                // Financial - VIEW ONLY
                'view-payments',
                'view-fees',
                'view-fee-types',

                // Reports/Statistics - VIEW ONLY
                'view-statistics',
                'view-security-logs',
            ],

            // 4. BARANGAY TREASURER
            'Barangay Treasurer' => [
                // Dashboard
                'view-dashboard',
                'view-admin-dashboard',

                // Financial Management - FULL ACCESS
                'manage-payments',
                'manage-fees',
                'manage-fee-types',
                'view-fee-types',
                'view-fees',

                // View residents for billing
                'manage-residents',
                'manage-households',
                'manage-puroks',

                // View document types (for clearance requirements)
                'view-document-types',

                // View other modules (NO EDIT ACCESS)
                'view-clearances',
                'view-clearance-types',
                'view-reports',
                'view-blotters',
                'view-announcements',
                'view-calendar',

                // Reports/Statistics
                'view-statistics',
                'view-security-logs',
            ],

            // 5. BARANGAY KAGAWAD
            'Barangay Kagawad' => [
                // Dashboard
                'view-dashboard',
                'view-admin-dashboard',

                // VIEW ONLY permissions
                'view-clearances',
                'view-clearance-types',
                'view-reports',
                'view-blotters',
                'view-announcements',
                'view-payments',
                'view-fees',
                'view-fee-types',
                'view-document-types',
                'view-calendar',

                // Can view residents and households
                'manage-residents',
                'manage-households',

                // Reports/Statistics - VIEW ONLY
                'view-statistics',
            ],

            // 6. SK CHAIRMAN
            'SK Chairman' => [
                // Dashboard
                'view-dashboard',
                'view-admin-dashboard',

                // Limited management
                'manage-announcements',
                'view-announcements',
                'manage-calendar',
                'view-calendar',

                // Can view residents
                'manage-residents',
                'manage-households',

                // Can view reports
                'view-reports',
                'view-blotters',
                'view-clearances',
                'view-clearance-types',
                'view-document-types',

                // Reports/Statistics
                'view-statistics',
            ],

            // 7. SK KAGAWAD
            'SK Kagawad' => [
                // Dashboard
                'view-dashboard',
                'view-admin-dashboard',

                // VIEW ONLY
                'view-announcements',
                'view-clearances',
                'view-reports',
                'view-blotters',
                'view-document-types',
                'view-calendar',

                // Reports/Statistics
                'view-statistics',
            ],

            // 8. RESIDENT
            'Resident' => [
                // Community Reports
                'create-reports',
                'view-reports',

                // Announcements
                'view-announcements',

                // Clearances
                'view-clearances',

                // Calendar
                'view-calendar',
            ],

            // 9. STAFF
            'Staff' => [
                // Dashboard
                'view-dashboard',
                'view-admin-dashboard',

                // Community Reports - Limited
                'view-reports',
                'resolve-reports',
                'edit-reports',

                // View residents
                'manage-residents',
                'manage-households',

                // View announcements
                'view-announcements',
                'view-calendar',
                'view-document-types',

                // Reports/Statistics
                'view-statistics',
            ],
        ];

        // Assign permissions to each role
        foreach ($rolePermissions as $roleName => $permissionNames) {
            if (!isset($roles[$roleName])) {
                $this->command->warn("⚠️  Role '$roleName' not found, skipping...");
                continue;
            }

            $role = $roles[$roleName];
            $permissions = Permission::whereIn('name', $permissionNames)->get();

            if ($permissions->isEmpty()) {
                $this->command->warn("⚠️  No permissions found for role '$roleName', skipping...");
                continue;
            }

            $role->permissions()->sync($permissions->pluck('id'));
            $this->command->info("✅ Assigned " . $permissions->count() . " permissions to '$roleName'");
        }

        // Summary
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('PERMISSIONS ASSIGNED SUCCESSFULLY');
        $this->command->info('========================================');

        foreach ($roles as $roleName => $role) {
            $permissionCount = $role->permissions()->count();
            $this->command->info("- $roleName: $permissionCount permissions");
        }

        $this->command->info('========================================');
        $this->command->info('Key Additions:');
        $this->command->info('1. manage-document-types - Added for Document Types');
        $this->command->info('2. view-document-types - View only for Document Types');
        $this->command->info('3. manage-calendar - Added for Calendar management');
        $this->command->info('4. view-calendar - View only for Calendar');
        $this->command->info('========================================');

        // Verify all permissions are assigned at least once
        $allPermissions = Permission::all();
        $assignedPermissions = collect();

        foreach ($roles as $role) {
            $assignedPermissions = $assignedPermissions->merge($role->permissions->pluck('id'));
        }

        $assignedPermissions = $assignedPermissions->unique();
        $unassignedPermissions = $allPermissions->whereNotIn('id', $assignedPermissions);

        if ($unassignedPermissions->isNotEmpty()) {
            $this->command->warn('⚠️  Unassigned permissions:');
            foreach ($unassignedPermissions as $permission) {
                $this->command->warn("   - {$permission->name} ({$permission->display_name})");
            }
        } else {
            $this->command->info('✅ All permissions are assigned to at least one role');
        }
    }
}