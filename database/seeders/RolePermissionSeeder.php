<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing
        DB::table('role_permissions')->truncate();

        $roles = Role::all()->keyBy('name');

        // FIRST, ensure all permissions used in routes exist
        $this->ensurePermissionsExist();

        // Define permission assignments matching your routes
        $rolePermissions = [
            'Administrator' => $this->getAllPermissions(),

            'Barangay Captain' => $this->getCaptainPermissions(),

            'Barangay Secretary' => $this->getSecretaryPermissions(),

            'Barangay Treasurer' => $this->getTreasurerPermissions(),

            'Barangay Kagawad' => $this->getKagawadPermissions(),

            'SK Chairman' => $this->getSKChairmanPermissions(),

            'SK Kagawad' => $this->getSKKagawadPermissions(),

            'Treasury Officer' => $this->getTreasuryOfficerPermissions(),

            'Records Clerk' => $this->getRecordsClerkPermissions(),

            'Clearance Officer' => $this->getClearanceOfficerPermissions(),

            'Viewer' => $this->getViewerPermissions(),

            'Staff' => $this->getStaffPermissions(),

            // IMPORTANT: This must match your middleware 'resident'
            'Household Head' => $this->getHouseholdHeadPermissions(),
        ];

        // Assign permissions
        foreach ($rolePermissions as $roleName => $permissionNames) {
            if (!isset($roles[$roleName])) {
                $this->command->warn("⚠️  Role '{$roleName}' not found");
                continue;
            }

            $permissions = Permission::whereIn('name', $permissionNames)->get();
            $roles[$roleName]->permissions()->sync($permissions->pluck('id'));
            
            $this->command->info("✅ Assigned to '{$roleName}': " . $permissions->count() . " permissions");
        }
    }

    private function ensurePermissionsExist(): void
    {
        // All permissions used in your routes
        $requiredPermissions = [
            // Dashboard
            'view-dashboard', 'view-admin-dashboard',
            
            // User Management
            'manage-users',
            
            // Roles & Permissions
            'manage-roles', 'manage-permissions', 'manage-role-permissions',
            
            // Residents
            'manage-residents', 'view-residents',
            
            // Households
            'manage-households', 'view-households',
            
            // Puroks
            'manage-puroks', 'view-puroks',
            
            // Officials
            'manage-officials', 'manage-committees', 'manage-positions',
            
            // Documents
            'manage-document-types', 'view-document-types',
            
            // Clearances
            'manage-clearances', 'view-clearances', 'issue-clearances',
            'manage-clearance-types', 'view-clearance-types',
            
            // Forms
            'manage-forms',
            
            // Announcements
            'manage-announcements', 'view-announcements',
            
            // Calendar (MISSING in your seeder)
            'manage-calendar', 'view-calendar',
            
            // Community Reports
            'manage-reports', 'view-reports', 'create-reports', 'edit-reports',
            'delete-reports', 'assign-reports', 'resolve-reports', 'review-reports',
            'manage-report-types', 'view-report-types',
            
            // Incidents & Blotters
            'manage-incidents', 'view-incidents', 
            'manage-blotters', 'view-blotters',
            'manage-complaints', 'review-incidents', // MISSING in your seeder
            
            // Financial
            'manage-payments', 'view-payments',
            'manage-fees', 'view-fees',
            'manage-fee-types', 'view-fee-types',
            
            // Business (MISSING in your seeder)
            'manage-businesses', 'view-businesses',
            
            // Reports & Statistics
            'view-statistics', 'view-security-logs',
            
            // Backup
            'manage-backups',
        ];

        foreach ($requiredPermissions as $permName) {
            Permission::firstOrCreate(
                ['name' => $permName],
                [
                    'display_name' => ucwords(str_replace('-', ' ', $permName)),
                    'module' => $this->getModuleFromPermission($permName),
                    'is_active' => true
                ]
            );
        }
    }

    private function getModuleFromPermission($permission): string
    {
        if (str_contains($permission, 'dashboard')) return 'Dashboard';
        if (str_contains($permission, 'users')) return 'User Management';
        if (str_contains($permission, 'role')) return 'Role Management';
        if (str_contains($permission, 'permission')) return 'Permission Management';
        if (str_contains($permission, 'resident')) return 'Residents';
        if (str_contains($permission, 'household')) return 'Households';
        if (str_contains($permission, 'purok')) return 'Puroks';
        if (str_contains($permission, 'official')) return 'Officials';
        if (str_contains($permission, 'committee')) return 'Committees';
        if (str_contains($permission, 'position')) return 'Positions';
        if (str_contains($permission, 'document')) return 'Documents';
        if (str_contains($permission, 'clearance')) return 'Clearances';
        if (str_contains($permission, 'form')) return 'Forms';
        if (str_contains($permission, 'announcement')) return 'Announcements';
        if (str_contains($permission, 'calendar')) return 'Calendar';
        if (str_contains($permission, 'report')) return 'Reports';
        if (str_contains($permission, 'incident')) return 'Incidents';
        if (str_contains($permission, 'blotter')) return 'Blotters';
        if (str_contains($permission, 'complaint')) return 'Complaints';
        if (str_contains($permission, 'payment')) return 'Payments';
        if (str_contains($permission, 'fee')) return 'Fees';
        if (str_contains($permission, 'business')) return 'Business';
        if (str_contains($permission, 'statistic')) return 'Statistics';
        if (str_contains($permission, 'security')) return 'Security';
        if (str_contains($permission, 'backup')) return 'Backup';
        
        return 'General';
    }

    private function getAllPermissions(): array
    {
        return Permission::all()->pluck('name')->toArray();
    }

    private function getCaptainPermissions(): array
    {
        return Permission::whereNotIn('name', [
            'manage-backups',
            'manage-roles',
            'manage-permissions',
            'manage-role-permissions',
        ])->pluck('name')->toArray();
    }

    private function getSecretaryPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'manage-residents', 'manage-households', 'manage-puroks',
            'manage-officials', 'manage-committees', 'manage-positions',
            'manage-document-types', 'view-document-types',
            'manage-clearances', 'view-clearances', 'issue-clearances',
            'manage-clearance-types', 'view-clearance-types',
            'manage-forms', 'manage-announcements', 'view-announcements',
            'manage-calendar', 'view-calendar',
            'manage-reports', 'view-reports', 'create-reports', 'edit-reports',
            'delete-reports', 'assign-reports', 'resolve-reports', 'review-reports',
            'manage-report-types', 'view-report-types',
            'manage-incidents', 'view-incidents', 'manage-blotters', 'view-blotters',
            'manage-complaints',
            'view-payments', 'view-fees', 'view-fee-types',
            'view-businesses',
            'view-statistics', 'view-security-logs',
        ];
    }

    private function getTreasurerPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'manage-payments', 'manage-fees', 'manage-fee-types',
            'view-fees', 'view-fee-types',
            'manage-residents', 'manage-households',
            'view-document-types',
            'view-clearances', 'view-clearance-types',
            'view-reports', 'view-announcements', 'view-calendar',
            'view-businesses',
            'view-statistics', 'view-security-logs',
        ];
    }

    private function getKagawadPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'view-residents', 'view-households',
            'view-clearances', 'view-clearance-types',
            'view-reports', 'view-blotters', 'view-incidents',
            'view-announcements', 'view-calendar',
            'view-payments', 'view-fees', 'view-fee-types',
            'view-document-types', 'view-statistics',
            'view-businesses',
        ];
    }

    private function getSKChairmanPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'manage-announcements', 'view-announcements',
            'manage-calendar', 'view-calendar',
            'view-residents',
            'view-reports', 'view-blotters', 'view-incidents',
            'view-clearances', 'view-clearance-types',
            'view-document-types', 'view-statistics',
            'view-businesses',
        ];
    }

    private function getSKKagawadPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'view-announcements', 'view-calendar',
            'view-reports', 'view-blotters', 'view-incidents',
            'view-clearances', 'view-document-types',
            'view-statistics',
            'view-businesses',
        ];
    }

    private function getTreasuryOfficerPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'manage-payments', 'manage-fees', 'manage-fee-types',
            'view-fees', 'view-fee-types',
            'view-residents', 'view-households',
            'view-clearances', 'view-clearance-types',
            'view-document-types', 'view-statistics',
            'view-businesses',
        ];
    }

    private function getRecordsClerkPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'manage-residents', 'manage-households', 'manage-puroks',
            'manage-document-types', 'view-document-types',
            'manage-forms',
            'view-clearances', 'view-clearance-types',
            'view-announcements', 'view-calendar',
            'view-businesses',
            'view-statistics',
        ];
    }

    private function getClearanceOfficerPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'manage-clearances', 'view-clearances', 'issue-clearances',
            'manage-clearance-types', 'view-clearance-types',
            'view-residents', 'view-households',
            'view-document-types',
            'view-announcements', 'view-calendar',
            'view-businesses',
            'view-statistics',
        ];
    }

    private function getViewerPermissions(): array
    {
        return [
            'view-dashboard',
            'view-residents', 'view-households', 'view-puroks',
            'view-clearances', 'view-announcements',
            'view-calendar', 'view-reports',
            'view-businesses',
            'view-statistics',
        ];
    }

    private function getStaffPermissions(): array
    {
        return [
            'view-dashboard', 'view-admin-dashboard',
            'view-reports', 'edit-reports', 'resolve-reports',
            'view-residents', 'view-households',
            'view-announcements', 'view-calendar',
            'view-document-types', 'view-statistics',
            'view-businesses',
        ];
    }

    private function getHouseholdHeadPermissions(): array
    {
        return [
            'view-dashboard',
            'manage-residents',  // Own profile
            'manage-households', // Own household
            'create-reports',
            'view-reports',
            'view-clearances',   // Can request clearances
            'view-announcements',
            'view-calendar',
            'view-businesses',   // Can view business info
        ];
    }
}