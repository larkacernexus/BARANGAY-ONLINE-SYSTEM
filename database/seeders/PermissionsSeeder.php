<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Support\Facades\Auth;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createPermissions();
        $this->assignPermissionsToRoles();
    }

    /**
     * Create all permissions based on actual routes
     */
    private function createPermissions(): void
    {
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
            ['name' => 'manage-role-permissions', 'display_name' => 'Manage Role Permissions', 'module' => 'Permissions', 'description' => 'Assign permissions to roles'],

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
            // INCIDENT MANAGEMENT
            // ====================
            ['name' => 'view-incidents', 'display_name' => 'View Incidents', 'module' => 'Incidents', 'description' => 'View incident reports'],
            ['name' => 'manage-incidents', 'display_name' => 'Manage Incidents', 'module' => 'Incidents', 'description' => 'Full incident management'],
            ['name' => 'manage-complaints', 'display_name' => 'Manage Complaints', 'module' => 'Incidents', 'description' => 'Manage complaints'],
            ['name' => 'review-incidents', 'display_name' => 'Review Incidents', 'module' => 'Incidents', 'description' => 'Review incident status'],

            // ====================
            // BLOTTER REPORTS MANAGEMENT
            // ====================
            ['name' => 'manage-blotters', 'display_name' => 'Manage Blotters', 'module' => 'Blotters', 'description' => 'Full blotter report management'],
            ['name' => 'view-blotters', 'display_name' => 'View Blotters', 'module' => 'Blotters', 'description' => 'View blotter reports only'],
            ['name' => 'create-blotters', 'display_name' => 'Create Blotters', 'module' => 'Blotters', 'description' => 'Create new blotter records'],
            ['name' => 'edit-blotters', 'display_name' => 'Edit Blotters', 'module' => 'Blotters', 'description' => 'Edit blotter records'],
            ['name' => 'delete-blotters', 'display_name' => 'Delete Blotters', 'module' => 'Blotters', 'description' => 'Delete blotter records'],

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
            // PRIVILEGES MANAGEMENT
            // ====================
            ['name' => 'manage-privileges', 'display_name' => 'Manage Privileges', 'module' => 'Privileges', 'description' => 'Manage resident privileges and discounts'],
            ['name' => 'view-privileges', 'display_name' => 'View Privileges', 'module' => 'Privileges', 'description' => 'View privileges only'],
            ['name' => 'assign-privileges', 'display_name' => 'Assign Privileges', 'module' => 'Privileges', 'description' => 'Assign privileges to residents'],

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
            // PORTAL BANNER MANAGEMENT
            // ====================
            ['name' => 'manage-portal-banner', 'display_name' => 'Manage Portal Banner', 'module' => 'System', 'description' => 'Manage portal banner settings and images'],
            ['name' => 'view-portal-banner', 'display_name' => 'View Portal Banner', 'module' => 'System', 'description' => 'View portal banner settings'],

            // ====================
            // REPORTS (GENERAL REPORTS)
            // ====================
            ['name' => 'view-statistics', 'display_name' => 'View Statistics', 'module' => 'Reports', 'description' => 'Access statistics and analytics'],

            // ====================
            // SECURITY LOGS
            // ====================
            ['name' => 'view-security-logs', 'display_name' => 'View Security Logs', 'module' => 'Security', 'description' => 'Access security and audit logs'],

            // ====================
            // DOCUMENT TYPES MANAGEMENT
            // ====================
            ['name' => 'manage-document-types', 'display_name' => 'Manage Document Types', 'module' => 'Documents', 'description' => 'Manage document categories and requirements'],
            ['name' => 'view-document-types', 'display_name' => 'View Document Types', 'module' => 'Documents', 'description' => 'View document types only'],

            // ====================
            // CALENDAR MANAGEMENT
            // ====================
            ['name' => 'manage-calendar', 'display_name' => 'Manage Calendar', 'module' => 'Calendar', 'description' => 'Manage events and schedules'],
            ['name' => 'view-calendar', 'display_name' => 'View Calendar', 'module' => 'Calendar', 'description' => 'View calendar events only'],

            // ====================
            // BUSINESS MANAGEMENT
            // ====================
            ['name' => 'manage-businesses', 'display_name' => 'Manage Businesses', 'module' => 'Businesses', 'description' => 'Manage business registrations'],
        ];

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($permissions as $permissionData) {
            // Add is_active = true by default
            $permissionData['is_active'] = true;
            
            $permission = Permission::firstOrNew(
                ['name' => $permissionData['name']]
            );

            if ($permission->exists) {
                // Update existing permission
                $permission->update($permissionData);
                $updatedCount++;
            } else {
                // Create new permission
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
     * Assign permissions to existing roles using RolePermission pivot model
     */
    private function assignPermissionsToRoles(): void
    {
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
            'Administrator' => Permission::all()->pluck('id')->toArray(),

            // 2. BARANGAY CAPTAIN - ALL EXCEPT BACKUPS
            'Barangay Captain' => Permission::whereNotIn('name', [
                'manage-backups',
            ])->pluck('id')->toArray(),

            // 3. BARANGAY SECRETARY
            'Barangay Secretary' => Permission::whereIn('name', [
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
                'manage-businesses',

                // Document Types - FULL ACCESS (Secretary handles documents)
                'manage-document-types',
                'view-document-types',

                // Portal Banner - FULL ACCESS
                'manage-portal-banner',
                'view-portal-banner',

                // Community Reports - FULL ACCESS
                'manage-reports',
                'view-reports',
                'create-reports',
                'edit-reports',
                'delete-reports',
                'assign-reports',
                'resolve-reports',
                'review-reports',
                'manage-report-types',
                'view-report-types',

                // Incidents
                'view-incidents',
                'manage-incidents',
                'manage-complaints',
                'review-incidents',

                // Blotters - FULL ACCESS
                'manage-blotters',
                'view-blotters',
                'create-blotters',
                'edit-blotters',
                'delete-blotters',

                // Privileges
                'manage-privileges',
                'view-privileges',
                'assign-privileges',

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
            ])->pluck('id')->toArray(),

            // 4. BARANGAY TREASURER
            'Barangay Treasurer' => Permission::whereIn('name', [
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
                'manage-businesses',

                // View document types (for clearance requirements)
                'view-document-types',

                // Portal Banner - View only
                'view-portal-banner',

                // View other modules (NO EDIT ACCESS)
                'view-clearances',
                'view-clearance-types',
                'view-reports',
                'view-blotters',
                'view-announcements',
                'view-calendar',
                'view-privileges',

                // Reports/Statistics
                'view-statistics',
                'view-security-logs',
            ])->pluck('id')->toArray(),

            // 5. BARANGAY KAGAWAD
            'Barangay Kagawad' => Permission::whereIn('name', [
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
                'view-privileges',
                'view-portal-banner',

                // Can view residents and households
                'manage-residents',
                'manage-households',

                // Reports/Statistics - VIEW ONLY
                'view-statistics',
            ])->pluck('id')->toArray(),

            // 6. SK CHAIRMAN
            'SK Chairman' => Permission::whereIn('name', [
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
                'view-portal-banner',
                'view-privileges',

                // Reports/Statistics
                'view-statistics',
            ])->pluck('id')->toArray(),

            // 7. SK KAGAWAD
            'SK Kagawad' => Permission::whereIn('name', [
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
                'view-portal-banner',

                // Reports/Statistics
                'view-statistics',
            ])->pluck('id')->toArray(),

            // 8. RESIDENT
            'Resident' => Permission::whereIn('name', [
                // Community Reports
                'create-reports',
                'view-reports',

                // Announcements
                'view-announcements',

                // Clearances
                'view-clearances',

                // Calendar
                'view-calendar',

                // Portal Banner
                'view-portal-banner',
            ])->pluck('id')->toArray(),

            // 9. STAFF
            'Staff' => Permission::whereIn('name', [
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
                'view-portal-banner',

                // Reports/Statistics
                'view-statistics',
            ])->pluck('id')->toArray(),
        ];

        $assignedCount = 0;
        
        // Assign permissions to each role using RolePermission pivot model
        foreach ($rolePermissions as $roleName => $permissionIds) {
            if (!isset($roles[$roleName])) {
                $this->command->warn("⚠️  Role '$roleName' not found, skipping...");
                continue;
            }

            $role = $roles[$roleName];
            
            if (empty($permissionIds)) {
                $this->command->warn("⚠️  No permissions defined for role '$roleName', skipping...");
                continue;
            }

            // Delete existing role permissions for this role
            RolePermission::where('role_id', $role->id)->delete();
            
            // Create new role permission assignments
            $rolePermissionsData = array_map(function($permissionId) use ($role) {
                return [
                    'role_id' => $role->id,
                    'permission_id' => $permissionId,
                    'granted_by' => null, // System granted
                    'granted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }, $permissionIds);
            
            RolePermission::insert($rolePermissionsData);
            
            $permissionCount = count($permissionIds);
            $assignedCount += $permissionCount;
            $this->command->info("✅ Assigned $permissionCount permissions to '$roleName'");
        }

        // Summary
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('PERMISSIONS ASSIGNED SUCCESSFULLY');
        $this->command->info('========================================');
        $this->command->info("Total role-permission assignments: $assignedCount");

        foreach ($roles as $roleName => $role) {
            $permissionCount = RolePermission::where('role_id', $role->id)->count();
            $this->command->info("- $roleName: $permissionCount permissions");
        }

        $this->command->info('========================================');
        $this->command->info('Key Additions:');
        $this->command->info('1. manage-portal-banner - Added for Portal Banner management');
        $this->command->info('2. view-portal-banner - View only for Portal Banner');
        $this->command->info('3. manage-document-types - Added for Document Types');
        $this->command->info('4. view-document-types - View only for Document Types');
        $this->command->info('5. manage-calendar - Added for Calendar management');
        $this->command->info('6. view-calendar - View only for Calendar');
        $this->command->info('7. manage-businesses - Added for Business management');
        $this->command->info('========================================');

        // Verify all permissions are assigned at least once
        $allPermissions = Permission::all();
        $assignedPermissionIds = RolePermission::distinct('permission_id')->pluck('permission_id');
        $unassignedPermissions = $allPermissions->whereNotIn('id', $assignedPermissionIds);

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