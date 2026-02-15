// resources/js/utils/permissions.ts
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

// Define all available permissions
export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view-dashboard',
    
    // Users
    MANAGE_USERS: 'manage-users',
    VIEW_USERS: 'view-users',
    CREATE_USERS: 'create-users',
    EDIT_USERS: 'edit-users',
    DELETE_USERS: 'delete-users',
    
    // Roles
    MANAGE_ROLES: 'manage-roles',
    VIEW_ROLES: 'view-roles',
    CREATE_ROLES: 'create-roles',
    EDIT_ROLES: 'edit-roles',
    DELETE_ROLES: 'delete-roles',
    
    // Permissions
    MANAGE_PERMISSIONS: 'manage-permissions',
    
    // Residents
    MANAGE_RESIDENTS: 'manage-residents',
    VIEW_RESIDENTS: 'view-residents',
    CREATE_RESIDENTS: 'create-residents',
    EDIT_RESIDENTS: 'edit-residents',
    DELETE_RESIDENTS: 'delete-residents',
    
    // Officials
    MANAGE_OFFICIALS: 'manage-officials',
    
    // Payments
    MANAGE_PAYMENTS: 'manage-payments',
    VIEW_PAYMENTS: 'view-payments',
    CREATE_PAYMENTS: 'create-payments',
    
    // Fees
    MANAGE_FEES: 'manage-fees',
    
    // Complaints
    MANAGE_COMPLAINTS: 'manage-complaints',
    
    // Clearances
    MANAGE_CLEARANCES: 'manage-clearances',
    
    // Reports
    VIEW_REPORTS: 'view-reports',
    GENERATE_REPORTS: 'generate-reports',
    
    // Backup
    MANAGE_BACKUPS: 'manage-backups',
    
    // Security
    VIEW_SECURITY: 'view-security',
    
    // Settings
    MANAGE_SETTINGS: 'manage-settings',
    
    // Forms
    MANAGE_FORMS: 'manage-forms',
    
    // Announcements
    MANAGE_ANNOUNCEMENTS: 'manage-announcements',
    
    // Purok
    MANAGE_PUROKS: 'manage-puroks',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Custom hook for permission checking
export default function usePermissions() {
    const { auth } = usePage<PageProps>().props;
    
    const hasPermission = (permission: Permission): boolean => {
        if (!auth.user) return false;
        if (auth.user.is_admin) return true;
        return auth.user.permissions.includes(permission);
    };
    
    const hasAnyPermission = (permissions: Permission[]): boolean => {
        if (!auth.user) return false;
        if (auth.user.is_admin) return true;
        return permissions.some(permission => auth.user!.permissions.includes(permission));
    };
    
    const hasAllPermissions = (permissions: Permission[]): boolean => {
        if (!auth.user) return false;
        if (auth.user.is_admin) return true;
        return permissions.every(permission => auth.user!.permissions.includes(permission));
    };
    
    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        permissions: auth.user?.permissions || [],
        isAdmin: auth.user?.is_admin || false,
        user: auth.user,
    };
}

// Helper to check route access
export const canAccessRoute = (routePermissions: Permission[]): boolean => {
    const { auth } = usePage<PageProps>().props;
    
    if (!auth.user) return false;
    if (auth.user.is_admin) return true;
    
    return routePermissions.some(permission => 
        auth.user!.permissions.includes(permission)
    );
};