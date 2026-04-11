// admin-utils/rolesUtils.ts
import { Role, SelectionStats } from '@/types/admin/roles/roles';

export interface FilterState {
    search: string;
    type: string;
    sort_by?: string;
    sort_order?: string;
}

export type BulkOperation = 
    | 'export' 
    | 'export_csv'
    | 'print' 
    | 'delete' 
    | 'archive' 
    | 'duplicate' 
    | 'change_type' 
    | 'generate_report' 
    | 'send_notification' 
    | 'assign_permissions' 
    | 'export_permissions';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface RoleStats {
    total: number;
    system_roles: number;
    custom_roles: number;
    active_roles: number;
    total_permissions: number;
    total_users: number;
    recent_roles?: Role[];
}

// Filter roles
export const filterRoles = (
    roles: Role[],
    search: string,
    filters: FilterState
): Role[] => {
    let result = [...roles];

    // Search filter
    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(role => 
            role.name?.toLowerCase().includes(searchLower) ||
            role.description?.toLowerCase().includes(searchLower) ||
            role.slug?.toLowerCase().includes(searchLower)
        );
    }

    // Type filter
    if (filters.type !== 'all') {
        if (filters.type === 'system') {
            result = result.filter(role => role.is_system_role);
        } else if (filters.type === 'custom') {
            result = result.filter(role => !role.is_system_role);
        }
    }

    return result;
};

// Calculate selection stats
export const getSelectionStats = (selectedRoles: Role[]): SelectionStats => {
    const systemCount = selectedRoles.filter(role => role.is_system_role).length;
    const customCount = selectedRoles.filter(role => !role.is_system_role).length;
    const totalUsers = selectedRoles.reduce((sum, r) => sum + (r.users_count || 0), 0);
    const totalPermissions = selectedRoles.reduce((sum, r) => sum + (r.permissions_count || 0), 0);
    
    return {
    total: selectedRoles.length,
    systemRoles: systemCount, // Changed from 'system'
    customRoles: customCount, // Changed from 'custom'
    totalUsers: totalUsers,
    totalPermissions: totalPermissions,
    latestRole: selectedRoles[0]?.name,
    deletable: 0,
};
};

// Check if a role can be deleted
export const canDeleteRole = (role: Role): boolean => {
    return !role.is_system_role && (role.users_count || 0) === 0;
};

// Format for clipboard/export
export const formatForClipboard = (roles: Role[]): string => {
    if (!roles || roles.length === 0) {
        return '';
    }
    
    const exportData = roles.map(role => ({
        'Role ID': role.id || 'N/A',
        'Name': role.name || 'N/A',
        'Slug': role.slug || 'N/A',
        'Type': role.is_system_role ? 'System' : 'Custom',
        'Description': role.description || 'N/A',
        'Users Count': role.users_count || 0,
        'Permissions Count': role.permissions_count || 0,
        'Created At': formatDate(role.created_at),
        'Updated At': formatDate(role.updated_at),
    }));
    
    const headers = Object.keys(exportData[0]);
    return [
        headers.join(','),
        ...exportData.map(row => 
            headers.map(header => {
                const value = row[header as keyof typeof row];
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
};

// Format date
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

// Truncate text with responsive length
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

// Get stats card color
export const getStatsCardColor = (index: number): string => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'teal'];
    return colors[index % colors.length];
};

// Get quick filter actions
export const getQuickFilterActions = (appliedFilters: FilterState) => {
    return [
        {
            label: 'System Roles',
            icon: 'shield',
            action: () => ({ type: 'system' }),
            active: appliedFilters.type === 'system',
            color: 'text-purple-700 bg-purple-50 border-purple-200'
        },
        {
            label: 'Custom Roles',
            icon: 'edit',
            action: () => ({ type: 'custom' }),
            active: appliedFilters.type === 'custom',
            color: 'text-green-700 bg-green-50 border-green-200'
        },
        {
            label: 'All Roles',
            icon: 'shield',
            action: () => ({ type: 'all' }),
            active: appliedFilters.type === 'all',
            color: 'text-blue-700 bg-blue-50 border-blue-200'
        },
    ];
};

// Normalize stats - returns RoleStats object
export const normalizeStats = (propsStats: any, roles: Role[]): RoleStats => {
    // If propsStats is already a valid RoleStats object with total property
    if (propsStats && typeof propsStats === 'object' && propsStats.total !== undefined) {
        return {
            total: propsStats.total || 0,
            system_roles: propsStats.system_roles || propsStats.systemRoles || 0,
            custom_roles: propsStats.custom_roles || propsStats.customRoles || 0,
            active_roles: propsStats.active_roles || propsStats.activeRoles || roles.length,
            total_permissions: propsStats.total_permissions || propsStats.totalPermissions || 0,
            total_users: propsStats.total_users || propsStats.totalUsers || 0,
            recent_roles: propsStats.recent_roles || propsStats.recentRoles || roles.slice(0, 5)
        };
    }
    
    // Calculate stats from roles array if propsStats is missing or invalid
    const systemRoles = roles.filter(r => r.is_system_role).length;
    const customRoles = roles.filter(r => !r.is_system_role).length;
    const totalUsers = roles.reduce((sum, r) => sum + (r.users_count || 0), 0);
    const totalPermissions = roles.reduce((sum, r) => sum + (r.permissions_count || 0), 0);
    
    return {
        total: roles.length,
        system_roles: systemRoles,
        custom_roles: customRoles,
        active_roles: roles.length,
        total_permissions: totalPermissions,
        total_users: totalUsers,
        recent_roles: roles.slice(0, 5)
    };
};

// Additional helper function for bulk operations validation
export const validateBulkOperation = (
    operation: BulkOperation,
    selectedRoles: Role[]
): { valid: boolean; message?: string } => {
    if (!selectedRoles || selectedRoles.length === 0) {
        return { valid: false, message: 'Please select at least one role' };
    }

    switch (operation) {
        case 'delete':
            const deletableCount = selectedRoles.filter(role => canDeleteRole(role)).length;
            if (deletableCount === 0) {
                return { valid: false, message: 'No deletable roles selected. System roles or roles with users cannot be deleted.' };
            }
            break;
        case 'change_type':
            const hasSystemRoles = selectedRoles.some(role => role.is_system_role);
            if (hasSystemRoles) {
                return { valid: false, message: 'Cannot change type of system roles' };
            }
            break;
        case 'archive':
            const hasArchived = selectedRoles.some(role => role.is_system_role);
            if (hasArchived) {
                return { valid: false, message: 'Cannot archive system roles' };
            }
            break;
        // Export operations are always valid
        case 'export':
        case 'export_csv':
        case 'export_permissions':
        case 'duplicate':
        case 'generate_report':
        case 'print':
        case 'send_notification':
        case 'assign_permissions':
            break;
        default:
            // Handle any unknown operations
            const exhaustiveCheck: never = operation;
            return { valid: false, message: `Unknown operation: ${operation}` };
    }

    return { valid: true };
};

// Helper to get bulk operation label
export const getBulkOperationLabel = (operation: BulkOperation): string => {
    const labels: Record<BulkOperation, string> = {
        'delete': 'Delete',
        'archive': 'Archive',
        'duplicate': 'Duplicate',
        'change_type': 'Change Type',
        'export': 'Export',
        'export_csv': 'Export as CSV',
        'print': 'Print',
        'generate_report': 'Generate Report',
        'send_notification': 'Send Notification',
        'assign_permissions': 'Assign Permissions',
        'export_permissions': 'Export Permissions'
    };
    return labels[operation] || operation;
};

// Helper to get bulk operation icon
export const getBulkOperationIcon = (operation: BulkOperation): string => {
    const icons: Record<BulkOperation, string> = {
        'delete': 'Trash2',
        'archive': 'Archive',
        'duplicate': 'Copy',
        'change_type': 'Tags',
        'export': 'Download',
        'export_csv': 'FileSpreadsheet',
        'print': 'Printer',
        'generate_report': 'FileText',
        'send_notification': 'Bell',
        'assign_permissions': 'Key',
        'export_permissions': 'FileKey'
    };
    return icons[operation] || 'Settings';
};

// Helper to get bulk operation color
export const getBulkOperationColor = (operation: BulkOperation): string => {
    const colors: Record<BulkOperation, string> = {
        'delete': 'destructive',
        'archive': 'warning',
        'duplicate': 'default',
        'change_type': 'default',
        'export': 'secondary',
        'export_csv': 'secondary',
        'print': 'secondary',
        'generate_report': 'default',
        'send_notification': 'default',
        'assign_permissions': 'default',
        'export_permissions': 'secondary'
    };
    return colors[operation] || 'default';
};