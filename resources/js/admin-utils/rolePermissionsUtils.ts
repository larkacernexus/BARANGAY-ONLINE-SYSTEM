// admin-utils/rolePermissionsUtils.ts

import {
    RolePermission,
    Role,
    Permission,
    Granter,
    FilterState,
    SelectionStats,
    BadgeVariant,
    SortIcon,
    ExportRow,
    RolePermissionResponse,
    PermissionGroup
} from '@/types/admin/rolepermissions/rolePermissions.types';

// ==================== Date Formatting Utilities ====================

/**
 * Format date to localized string
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(dateString);
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Format date for export (YYYY-MM-DD)
 */
export const formatDateForExport = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

// ==================== Text Formatting Utilities ====================

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get responsive truncation length based on screen width
 */
export const getTruncationLength = (
    type: 'name' | 'description' = 'name',
    windowWidth: number
): number => {
    if (windowWidth < 640) return type === 'name' ? 15 : 20;
    if (windowWidth < 768) return type === 'name' ? 20 : 25;
    if (windowWidth < 1024) return type === 'name' ? 25 : 30;
    return type === 'name' ? 30 : 35;
};

// ==================== Permission Helper Functions ====================

/**
 * Get permission name from role permission object
 */
export const getPermissionName = (permission: RolePermission): string => {
    return permission.permission?.display_name || 
           permission.permission?.name || 
           permission.permission_name || 
           'N/A';
};

/**
 * Get permission slug from role permission object
 */
export const getPermissionSlug = (permission: RolePermission): string => {
    const name = permission.permission?.name || permission.permission_name || '';
    return name.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Get permission status as string
 */
export const getPermissionStatus = (permission: RolePermission): string => {
    return permission.permission?.is_active ? 'Active' : 'Inactive';
};

/**
 * Get role name from role permission object
 */
export const getRoleName = (permission: RolePermission): string => {
    return permission.role?.name || permission.role_name || 'N/A';
};

/**
 * Get role type from role permission object
 */
export const getRoleType = (permission: RolePermission): string => {
    return permission.role?.is_system_role ? 'System' : 'Custom';
};

/**
 * Get assigned at date
 */
export const getAssignedAt = (permission: RolePermission): string => {
    return formatDate(permission.granted_at);
};

// ==================== Badge Variant Utilities ====================

/**
 * Get role type badge variant
 */
export const getRoleTypeBadgeVariant = (isSystemRole: boolean): BadgeVariant => {
    return isSystemRole 
        ? { className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800', text: 'System' }
        : { className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', text: 'Custom' };
};

/**
 * Get module badge variant
 */
export const getModuleBadgeVariant = (module: string): BadgeVariant => {
    const moduleColors: Record<string, string> = {
        'admin': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'user': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'role': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'permission': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'settings': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'report': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'dashboard': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    };
    
    const normalizedModule = module?.toLowerCase() || 'unknown';
    return {
        className: moduleColors[normalizedModule] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        text: module || 'Unknown'
    };
};

/**
 * Get permission status badge variant
 */
export const getPermissionStatusBadgeVariant = (isActive: boolean): BadgeVariant => {
    return isActive
        ? { className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', text: 'Active' }
        : { className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', text: 'Inactive' };
};

// ==================== Statistics Utilities ====================

/**
 * Calculate selection statistics from selected permissions
 */
export const getSelectionStats = (selectedPermissions: RolePermission[]): SelectionStats => {
    if (!selectedPermissions.length) {
        return {
            total: 0,
            uniqueRoles: 0,
            uniquePermissions: 0,
            uniqueModules: 0,
            systemRoles: 0,
            customRoles: 0,
        };
    }
    
    const uniqueRoles = new Set(selectedPermissions.map(rp => rp.role_id)).size;
    const uniquePermissions = new Set(selectedPermissions.map(rp => rp.permission_id)).size;
    const uniqueModules = new Set(
        selectedPermissions
            .map(rp => rp.permission?.module)
            .filter(Boolean)
    ).size;
    const systemRoles = selectedPermissions.filter(rp => rp.role?.is_system_role).length;
    const customRoles = selectedPermissions.filter(rp => !rp.role?.is_system_role).length;
    
    const latestAssignment = selectedPermissions.length > 0 
        ? selectedPermissions.reduce((latest, rp) => 
            new Date(rp.granted_at) > new Date(latest.granted_at) ? rp : latest
          ).granted_at
        : undefined;
    
    return {
        total: selectedPermissions.length,
        uniqueRoles,
        uniquePermissions,
        uniqueModules,
        systemRoles,
        customRoles,
        latestAssignment
    };
};

// ==================== Export Utilities ====================

/**
 * Format permissions for CSV export
 */
export const formatForExport = (permissions: RolePermission[]): string => {
    if (!permissions.length) return '';
    
    const exportData: ExportRow[] = permissions.map(rp => ({
        'ID': rp.id,
        'Role Name': rp.role?.name || 'N/A',
        'Role Type': rp.role?.is_system_role ? 'System' : 'Custom',
        'Permission Name': rp.permission?.name || 'N/A',
        'Permission Display': rp.permission?.display_name || 'N/A',
        'Module': rp.permission?.module || 'N/A',
        'Granted By': rp.granter?.name || 'System',
        'Granted At': formatDate(rp.granted_at),
        'Permission Status': rp.permission?.is_active ? 'Active' : 'Inactive',
        'Role Users': rp.role?.users_count || 0,
    }));
    
    const headers = Object.keys(exportData[0]) as (keyof ExportRow)[];
    
    return [
        headers.join(','),
        ...exportData.map(row => 
            headers.map(header => {
                const value = row[header];
                if (value === undefined || value === null) return '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value);
            }).join(',')
        )
    ].join('\n');
};

// ==================== Sort Utilities ====================

/**
 * Get sort icon based on current sort state
 */
export const getSortIcon = (
    sortBy: string, 
    currentSort: string, 
    currentOrder: 'asc' | 'desc'
): SortIcon => {
    if (sortBy !== currentSort) return 'arrow-up-down';
    return currentOrder === 'asc' ? 'chevron-up' : 'chevron-down';
};

// ==================== Data Normalization Utilities ====================

/**
 * Safely normalize API response data
 */
export const safeNormalizeData = (data: any): RolePermissionResponse => {
    return {
        data: Array.isArray(data?.data) ? data.data : [],
        meta: data?.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
            from: 0,
            to: 0
        }
    };
};

/**
 * Validate and normalize role permission object
 */
export const normalizeRolePermission = (item: any): RolePermission | null => {
    if (!item || typeof item !== 'object') return null;
    
    return {
        id: item.id || 0,
        role_id: item.role_id || 0,
        permission_id: item.permission_id || 0,
        granted_by: item.granted_by || 0,
        granted_at: item.granted_at || new Date().toISOString(),
        expires_at: item.expires_at || null,
        role: item.role,
        permission: item.permission,
        granter: item.granter,
    };
};

// ==================== Filter Utilities ====================

/**
 * Check if filters are active
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
    return Boolean(
        filters.search ||
        filters.role !== 'all' ||
        filters.module !== 'all' ||
        filters.granter !== 'all'
    );
};

/**
 * Get filter summary text
 */
export const getFilterSummary = (
    filters: FilterState,
    roles: Role[],
    granters: Granter[]
): string => {
    const parts: string[] = [];
    
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.role !== 'all') {
        const role = roles.find(r => r.id.toString() === filters.role);
        if (role) parts.push(`Role: ${role.name}`);
    }
    if (filters.module !== 'all') parts.push(`Module: ${filters.module}`);
    if (filters.granter !== 'all') {
        const granter = granters.find(g => g.id.toString() === filters.granter);
        if (granter) parts.push(`Granted by: ${granter.name}`);
    }
    
    return parts.join(' • ');
};

// ==================== Validation Utilities ====================

/**
 * Validate role permission assignment
 */
export const validateAssignment = (
    roleId: number | null,
    permissionIds: number[]
): { isValid: boolean; error?: string } => {
    if (!roleId) {
        return { isValid: false, error: 'Please select a role' };
    }
    
    if (!permissionIds.length) {
        return { isValid: false, error: 'Please select at least one permission' };
    }
    
    return { isValid: true };
};

// ==================== Grouping Utilities ====================

/**
 * Group permissions by module
 */
export const groupPermissionsByModule = (permissions: Permission[]): PermissionGroup[] => {
    const grouped = new Map<string, Permission[]>();
    
    permissions.forEach(permission => {
        const module = permission.module || 'Other';
        if (!grouped.has(module)) {
            grouped.set(module, []);
        }
        grouped.get(module)!.push(permission);
    });
    
    return Array.from(grouped.entries())
        .map(([module, permissions]) => ({
            module,
            permissions: permissions.sort((a, b) => a.display_name.localeCompare(b.display_name))
        }))
        .sort((a, b) => a.module.localeCompare(b.module));
};

// ==================== Search Utilities ====================

/**
 * Search permissions by query string
 */
export const searchPermissions = (
    permissions: Permission[],
    query: string
): Permission[] => {
    if (!query) return permissions;
    
    const lowerQuery = query.toLowerCase();
    return permissions.filter(permission =>
        permission.name.toLowerCase().includes(lowerQuery) ||
        permission.display_name.toLowerCase().includes(lowerQuery) ||
        (permission.description?.toLowerCase() || '').includes(lowerQuery) ||
        (permission.module?.toLowerCase() || '').includes(lowerQuery)
    );
};