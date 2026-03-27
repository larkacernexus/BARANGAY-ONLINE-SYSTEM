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
        $this->createPermissions();
        $this->createRolesAndAssignPermissions();
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
            // COMMUNITY REPORTS MANAGEMENT (CHANGED FROM COMPLAINTS)
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
        ];
        
        foreach ($permissions as $permissionData) {
            Permission::firstOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
        }
        
        $this->command->info('✅ Created ' . count($permissions) . ' permissions');
    }

    /**
     * Create roles and assign permissions based on actual middleware usage
     */
    private function createRolesAndAssignPermissions(): void
    {
        // ====================
        // 1. SYSTEM ADMINISTRATOR - CAN ACCESS ALL
        // ====================
        $administrator = Role::firstOrCreate(
            ['name' => 'Administrator'],
            [
                'description' => 'Full system control and technical management',
                'is_system_role' => true,
            ]
        );
        
        // Assign ALL permissions to Administrator
        $allPermissions = Permission::all()->pluck('id')->toArray();
        $administrator->permissions()->sync($allPermissions);
        $this->command->info('✅ Created Administrator role with ALL ' . count($allPermissions) . ' permissions');
        
        // ====================
        // 2. BARANGAY CAPTAIN - CAN PERFORM ALL
        // ====================
        $barangayCaptain = Role::firstOrCreate(
            ['name' => 'Barangay Captain'],
            [
                'description' => 'Overall barangay management and supervision - Full access',
                'is_system_role' => true,
            ]
        );
        
        // Captain gets ALL permissions except system/technical ones
        $captainPermissions = Permission::whereNotIn('name', [
            'manage-backups', // Captain might not need backup management
        ])->pluck('id')->toArray();
        
        $barangayCaptain->permissions()->sync($captainPermissions);
        $this->command->info('✅ Created Barangay Captain role with ' . count($captainPermissions) . ' permissions');
        
        // ====================
        // 3. BARANGAY SECRETARY - MANAGE REPORTS, PROVIDE CLEARANCES, VIEW FINANCIAL, CANNOT ISSUE PAYMENTS
        // ====================
        $barangaySecretary = Role::firstOrCreate(
            ['name' => 'Barangay Secretary'],
            [
                'description' => 'Document management, community reports, clearances, view financial records but cannot issue payments',
                'is_system_role' => true,
            ]
        );
        
        $secretaryPermissions = Permission::whereIn('name', [
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
            
            // Community Reports - FULL ACCESS (Secretary handles reports)
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
            
            // Financial - VIEW ONLY (cannot issue payments)
            'view-payments',
            'view-fees',
            'view-fee-types',
            
            // Reports/Statistics - VIEW ONLY
            'view-statistics',
            'view-security-logs',
            
        ])->pluck('id')->toArray();
        
        $barangaySecretary->permissions()->sync($secretaryPermissions);
        $this->command->info('✅ Created Barangay Secretary role with ' . count($secretaryPermissions) . ' permissions');
        
        // ====================
        // 4. BARANGAY TREASURER - EXCLUSIVELY MONEY, VIEW REPORTS ONLY
        // ====================
        $barangayTreasurer = Role::firstOrCreate(
            ['name' => 'Barangay Treasurer'],
            [
                'description' => 'Financial management only - Can view reports but cannot manage',
                'is_system_role' => true,
            ]
        );
        
        $treasurerPermissions = Permission::whereIn('name', [
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
            
            // View other modules (NO EDIT ACCESS)
            'view-clearances',
            'view-clearance-types',
            'view-reports',        // Can view community reports only
            'view-blotters',       // Can view blotters only
            'view-announcements',
            
            // Reports/Statistics
            'view-statistics',
            'view-security-logs',
            
        ])->pluck('id')->toArray();
        
        $barangayTreasurer->permissions()->sync($treasurerPermissions);
        $this->command->info('✅ Created Barangay Treasurer role with ' . count($treasurerPermissions) . ' permissions');
        
        // ====================
        // 5. BARANGAY KAGAWAD - VIEW ONLY (AS REQUESTED: VIEW ONLY FOR REPORTS)
        // ====================
        $barangayKagawad = Role::firstOrCreate(
            ['name' => 'Barangay Kagawad'],
            [
                'description' => 'Barangay Councilor - View-only access for reports, cannot create/edit',
                'is_system_role' => true,
            ]
        );
        
        $kagawadPermissions = Permission::whereIn('name', [
            // Dashboard - Can view admin dashboard
            'view-dashboard',
            'view-admin-dashboard',
            
            // VIEW ONLY permissions for all modules
            'view-clearances',
            'view-clearance-types',
            'view-reports',        // Can view community reports (VIEW ONLY)
            'view-blotters',       // Can view blotters (VIEW ONLY)
            'view-announcements',
            'view-payments',
            'view-fees',
            'view-fee-types',
            
            // Can view residents and households (for constituent service)
            'manage-residents',    // For viewing constituents
            'manage-households',   // For viewing households
            
            // Reports/Statistics - VIEW ONLY
            'view-statistics',
            
        ])->pluck('id')->toArray();
        
        $barangayKagawad->permissions()->sync($kagawadPermissions);
        $this->command->info('✅ Created Barangay Kagawad role with ' . count($kagawadPermissions) . ' permissions (VIEW ONLY)');
        
        // ====================
        // 6. SK CHAIRMAN - LIMITED ADMIN ACCESS
        // ====================
        $skChairman = Role::firstOrCreate(
            ['name' => 'SK Chairman'],
            [
                'description' => 'Youth council leader - Limited admin access',
                'is_system_role' => true,
            ]
        );
        
        $skChairmanPermissions = Permission::whereIn('name', [
            // Dashboard
            'view-dashboard',
            'view-admin-dashboard',
            
            // Limited management - Announcements only
            'manage-announcements',
            'view-announcements',
            
            // Can view residents (for youth)
            'manage-residents',
            'manage-households',
            
            // Can view reports
            'view-reports',
            'view-blotters',
            'view-clearances',
            'view-clearance-types',
            
            // Reports/Statistics
            'view-statistics',
            
        ])->pluck('id')->toArray();
        
        $skChairman->permissions()->sync($skChairmanPermissions);
        $this->command->info('✅ Created SK Chairman role with ' . count($skChairmanPermissions) . ' permissions');
        
        // ====================
        // 7. SK KAGAWAD - VIEW ONLY
        // ====================
        $skKagawad = Role::firstOrCreate(
            ['name' => 'SK Kagawad'],
            [
                'description' => 'SK council member - View only access',
                'is_system_role' => true,
            ]
        );
        
        $skKagawadPermissions = Permission::whereIn('name', [
            // Dashboard - VIEW ONLY
            'view-dashboard',
            'view-admin-dashboard',
            
            // VIEW ONLY for limited modules
            'view-announcements',
            'view-clearances',
            'view-reports',
            'view-blotters',
            
            // Reports/Statistics - VIEW ONLY
            'view-statistics',
            
        ])->pluck('id')->toArray();
        
        $skKagawad->permissions()->sync($skKagawadPermissions);
        $this->command->info('✅ Created SK Kagawad role with ' . count($skKagawadPermissions) . ' permissions (VIEW ONLY)');
        
        // ====================
        // 8. RESIDENT - CAN CREATE REPORTS, VIEW OWN REPORTS
        // ====================
        $resident = Role::firstOrCreate(
            ['name' => 'Resident'],
            [
                'description' => 'Barangay residents - Can create and view own community reports',
                'is_system_role' => true,
            ]
        );
        
        $residentPermissions = Permission::whereIn('name', [
            // Community Reports - Can create and view own reports
            'create-reports',      // Can submit community reports
            'view-reports',        // Can view own reports (filtered in controller)
            
            // Announcements - Can view
            'view-announcements',
            
            // Clearances - Can view and apply
            'view-clearances',
            
        ])->pluck('id')->toArray();
        
        $resident->permissions()->sync($residentPermissions);
        $this->command->info('✅ Created Resident role with ' . count($residentPermissions) . ' permissions (Can create/view own reports)');
        
        // ====================
        // 9. STAFF - CAN BE ASSIGNED REPORTS
        // ====================
        $staff = Role::firstOrCreate(
            ['name' => 'Staff'],
            [
                'description' => 'Barangay staff - Can be assigned and work on reports',
                'is_system_role' => false,
            ]
        );
        
        $staffPermissions = Permission::whereIn('name', [
            // Dashboard
            'view-dashboard',
            'view-admin-dashboard',
            
            // Community Reports - Limited access (assigned reports only)
            'view-reports',        // Can view assigned reports
            'resolve-reports',     // Can resolve assigned reports
            'edit-reports',        // Can edit assigned reports
            
            // View residents (for report context)
            'manage-residents',
            'manage-households',
            
            // View announcements
            'view-announcements',
            
            // Reports/Statistics - Limited
            'view-statistics',
            
        ])->pluck('id')->toArray();
        
        $staff->permissions()->sync($staffPermissions);
        $this->command->info('✅ Created Staff role with ' . count($staffPermissions) . ' permissions (Assigned reports only)');
        
        // ====================
        // SUMMARY
        // ====================
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('ROLES CREATED SUCCESSFULLY');
        $this->command->info('========================================');
        $this->command->info('1. Administrator - ALL permissions (' . count($allPermissions) . ')');
        $this->command->info('2. Barangay Captain - Full access (' . count($captainPermissions) . ')');
        $this->command->info('3. Barangay Secretary - Reports + Clearances + View financial (' . count($secretaryPermissions) . ')');
        $this->command->info('4. Barangay Treasurer - Financial only + View reports (' . count($treasurerPermissions) . ')');
        $this->command->info('5. Barangay Kagawad - View only for reports (' . count($kagawadPermissions) . ')');
        $this->command->info('6. SK Chairman - Limited access (' . count($skChairmanPermissions) . ')');
        $this->command->info('7. SK Kagawad - View only (' . count($skKagawadPermissions) . ')');
        $this->command->info('8. Resident - Create/view own reports (' . count($residentPermissions) . ')');
        $this->command->info('9. Staff - Assigned reports only (' . count($staffPermissions) . ')');
        $this->command->info('========================================');
        $this->command->info('Key Points:');
        $this->command->info('- Kagawads: Can VIEW reports only (as requested)');
        $this->command->info('- Secretary: Manages reports + clearances');
        $this->command->info('- Treasurer: Can view reports but cannot manage');
        $this->command->info('- Captain: Full access to all reports');
        $this->command->info('- Residents: Can create and view own reports');
        $this->command->info('- Staff: Can only work on assigned reports');
        $this->command->info('========================================');
        $this->command->info('Total roles created: 9');
        $this->command->info('Total permissions created: ' . Permission::count());
    }
}