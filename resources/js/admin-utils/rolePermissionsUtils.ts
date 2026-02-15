// admin-utils/rolePermissionsUtils.ts
export interface RolePermission {
    permission_name: any;
    role_name: any;
    permission_slug(permission_slug: any, arg1: string): unknown;
    status(status: any): unknown;
    assigned_at(assigned_at: any): unknown;
    permission_type: string;
    role_type: string;
    assigned_by_name: string;
    assigned_by_email: any;
    expires_at: any;
    id: number;
    role_id: number;
    permission_id: number;
    granted_by: number;
    granted_at: string;
    role?: {
        id: number;
        name: string;
        is_system_role: boolean;
        users_count?: number;
    };
    permission?: {
        id: number;
        name: string;
        display_name: string;
        module: string;
        is_active: boolean;
    };
    granter?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface FilterState {
    search: string;
    role: string;
    module: string;
    granter: string;
    sort: string;
    order: 'asc' | 'desc';
}

export type BulkOperation = 'export' | 'bulk_revoke' | 'print' | 'generate_report';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    uniqueRoles: number;
    uniquePermissions: number;
    uniqueModules: number;
    systemRoles: number;
    customRoles: number;
    latestAssignment?: string;
}

// Format date
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

// Format time ago
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

// Truncate text
export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Get responsive truncation length
export const getTruncationLength = (
    type: 'name' | 'description' = 'name',
    windowWidth: number
): number => {
    if (windowWidth < 640) return type === 'name' ? 15 : 20;
    if (windowWidth < 768) return type === 'name' ? 20 : 25;
    if (windowWidth < 1024) return type === 'name' ? 25 : 30;
    return type === 'name' ? 30 : 35;
};

// Get role type badge variant
export const getRoleTypeBadgeVariant = (isSystemRole: boolean) => {
    return isSystemRole 
        ? { className: 'bg-purple-50 text-purple-700 border-purple-200', text: 'System' }
        : { className: 'bg-green-50 text-green-700 border-green-200', text: 'Custom' };
};

// Get module badge variant
export const getModuleBadgeVariant = (module: string) => {
    const moduleColors: Record<string, string> = {
        'admin': 'bg-blue-50 text-blue-700 border-blue-200',
        'user': 'bg-green-50 text-green-700 border-green-200',
        'role': 'bg-purple-50 text-purple-700 border-purple-200',
        'permission': 'bg-red-50 text-red-700 border-red-200',
        'settings': 'bg-gray-50 text-gray-700 border-gray-200',
        'report': 'bg-orange-50 text-orange-700 border-orange-200',
        'dashboard': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    
    return {
        className: moduleColors[module.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200',
        text: module
    };
};

// Calculate selection stats
export const getSelectionStats = (selectedPermissions: RolePermission[]): SelectionStats => {
    const selectedData = selectedPermissions;
    const uniqueRoles = [...new Set(selectedData.map(rp => rp.role_id))].length;
    const uniquePermissions = [...new Set(selectedData.map(rp => rp.permission_id))].length;
    const uniqueModules = [...new Set(selectedData.map(rp => rp.permission?.module))].filter(Boolean).length;
    const systemRoles = selectedData.filter(rp => rp.role?.is_system_role).length;
    const customRoles = selectedData.filter(rp => !rp.role?.is_system_role).length;
    const latestAssignment = selectedData.length > 0 
        ? selectedData.reduce((latest, rp) => 
            new Date(rp.granted_at) > new Date(latest.granted_at) ? rp : latest
          ).granted_at
        : undefined;
    
    return {
        total: selectedData.length,
        uniqueRoles,
        uniquePermissions,
        uniqueModules,
        systemRoles,
        customRoles,
        latestAssignment
    };
};

// Format for export
export const formatForExport = (permissions: RolePermission[]): string => {
    const exportData = permissions.map(rp => ({
        'ID': rp.id,
        'Role Name': rp.role?.name || 'N/A',
        'Role Type': rp.role?.is_system_role ? 'System' : 'Custom',
        'Permission Name': rp.permission?.name || 'N/A',
        'Permission Display': rp.permission?.display_name || 'N/A',
        'Module': rp.permission?.module || 'N/A',
        'Granted By': rp.granter?.name || 'N/A',
        'Granted At': formatDate(rp.granted_at),
        'Permission Status': rp.permission?.is_active ? 'Active' : 'Inactive',
        'Role Users': rp.role?.users_count || 0,
    }));
    
    const headers = Object.keys(exportData[0]);
    return [
        headers.join(','),
        ...exportData.map(row => 
            headers.map(header => {
                const value = row[header as keyof typeof row];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',')
        )
    ].join('\n');
};

// Get sort icon
export const getSortIcon = (sortBy: string, currentSort: string, currentOrder: 'asc' | 'desc') => {
    if (sortBy !== currentSort) return 'arrow-up-down';
    return currentOrder === 'asc' ? 'chevron-up' : 'chevron-down';
};

// Safe data normalization
export const safeNormalizeData = (data: any) => {
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