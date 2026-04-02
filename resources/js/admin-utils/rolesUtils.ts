// admin-utils/rolesUtils.ts
import { Role } from '@/types/admin/roles/roles';

export interface FilterState {
    search: string;
    type: string;
    sort_by?: string;
    sort_order?: string;
}

export type BulkOperation = 
    'export' | 'print' | 'delete' | 'archive' | 'duplicate' | 
    'change_type' | 'generate_report' | 'send_notification' | 
    'assign_permissions' | 'export_permissions';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    system: number;
    custom: number;
    totalUsers: number;
    deletable: number;
    avgUsers: string;
    hasSystemRoles: boolean;
    hasUsers: boolean;
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
    const selectedData = selectedRoles;
    const systemCount = selectedData.filter(role => role.is_system_role).length;
    const customCount = selectedData.filter(role => !role.is_system_role).length;
    const totalUsers = selectedData.reduce((sum, r) => sum + (r.users_count || 0), 0);
    const deletableCount = selectedData.filter(role => canDeleteRole(role)).length;
    
    return {
        total: selectedData.length,
        system: systemCount,
        custom: customCount,
        totalUsers: totalUsers,
        deletable: deletableCount,
        avgUsers: selectedData.length > 0 ? (totalUsers / selectedData.length).toFixed(1) : '0',
        hasSystemRoles: systemCount > 0,
        hasUsers: totalUsers > 0,
    };
};

// Check if a role can be deleted
export const canDeleteRole = (role: Role): boolean => {
    return !role.is_system_role && (role.users_count || 0) === 0;
};

// Format for clipboard/export
export const formatForClipboard = (roles: Role[]): string => {
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
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',')
        )
    ].join('\n');
};

// Format date
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
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

// Normalize stats
export const normalizeStats = (propsStats: any, roles: Role[]) => {
    if (Array.isArray(propsStats)) {
        return propsStats;
    }
    
    if (propsStats && typeof propsStats === 'object' && !Array.isArray(propsStats)) {
        return Object.entries(propsStats).map(([label, value]) => ({
            label: typeof label === 'string' ? label.replace(/_/g, ' ') : 'Stat',
            value: typeof value === 'number' || typeof value === 'string' ? value : String(value),
        }));
    }
    
    const totalRoles = roles.length;
    const systemRoles = roles.filter(r => r.is_system_role).length;
    const customRoles = roles.filter(r => !r.is_system_role).length;
    const totalUsers = roles.reduce((sum, r) => sum + (r.users_count || 0), 0);
    
    return [
        { label: 'Total Roles', value: totalRoles },
        { label: 'System Roles', value: systemRoles },
        { label: 'Custom Roles', value: customRoles },
        { label: 'Total Users', value: totalUsers },
    ];
};