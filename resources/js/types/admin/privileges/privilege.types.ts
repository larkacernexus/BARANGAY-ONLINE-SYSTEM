// types/admin/privileges/privilege.types.ts

export interface DiscountType {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    contact_number?: string;
    email?: string;
    age?: number;
    gender?: string;
    birth_date?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ResidentPrivilege {
    id: number;
    resident_id: number;
    privilege_id: number;
    id_number?: string;
    verified_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at?: string;
    resident?: Resident;
    privilege?: Privilege;
}

export interface Privilege {
    discountType: any;
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    discount_type_id: number;
    default_discount_percentage: string | number;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    created_at: string;
    updated_at: string;
    discount_type?: DiscountType;
    residents_count?: number;
    active_residents_count?: number;
    pending_count?: number;
    expired_count?: number;
}

export interface PrivilegeFilters {
    search?: string;
    status?: string;
    discount_type?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    requires_verification?: string;
    requires_id_number?: string;
}

export interface PrivilegeStats {
    total: number;
    active: number;
    totalAssignments: number;
    activeAssignments: number;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    requiresVerification: number;
    requiresIdNumber: number;
    totalAssignments: number;
    avgDiscount?: number;
}

export interface PaginationData {
    data: Privilege[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

export interface PrivilegeFormData {
    name: string;
    code: string;
    description?: string | null;
    discount_type_id: number | null;
    default_discount_percentage: number;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    is_active: boolean;
}

export interface PrivilegeValidationErrors {
    name?: string[];
    code?: string[];
    description?: string[];
    discount_type_id?: string[];
    default_discount_percentage?: string[];
    requires_id_number?: string[];
    requires_verification?: string[];
    validity_years?: string[];
    is_active?: string[];
}

export type BulkOperation = 'delete' | 'update_status' | 'export' | 'export_csv' | 'print' | 'copy_data';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface BulkActionData {
    action: string;
    privilege_ids: number[];
    status?: number;
}

export interface ExportData {
    format: 'csv' | 'excel' | 'pdf';
    ids?: number[];
    filters?: PrivilegeFilters;
}

export interface PrivilegesPageProps {
    privileges: PaginationData;
    filters: PrivilegeFilters;
    discountTypes: DiscountType[];
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
    stats?: PrivilegeStats;
}

// Enums
export enum PrivilegeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ALL = 'all'
}

export enum SortField {
    NAME = 'name',
    CODE = 'code',
    DISCOUNT_PERCENTAGE = 'discount_percentage',
    RESIDENTS_COUNT = 'residents_count',
    ACTIVE_RESIDENTS_COUNT = 'active_residents_count',
    STATUS = 'status',
    CREATED_AT = 'created_at'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export enum BulkActionType {
    DELETE = 'delete',
    UPDATE_STATUS = 'update_status',
    EXPORT = 'export',
    EXPORT_CSV = 'export_csv',
    PRINT = 'print',
    COPY_DATA = 'copy_data'
}

// Default values
export const defaultPrivilegeStats: PrivilegeStats = {
    total: 0,
    active: 0,
    totalAssignments: 0,
    activeAssignments: 0
};

export const defaultPrivilegeFilters: PrivilegeFilters = {
    status: 'all',
    discount_type: 'all',
    requires_verification: 'all',
    requires_id_number: 'all',
    sort_by: 'name',
    sort_order: 'asc'
};

export const defaultPrivilegeFormData: PrivilegeFormData = {
    name: '',
    code: '',
    description: null,
    discount_type_id: null,
    default_discount_percentage: 0,
    requires_id_number: false,
    requires_verification: false,
    validity_years: null,
    is_active: true
};

// Helper functions
export const privilegeUtils = {
    filterPrivileges: (params: {
        privileges: Privilege[];
        search: string;
        filters: PrivilegeFilters;
    }): Privilege[] => {
        let filtered = [...params.privileges];
        const { search, filters } = params;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(privilege =>
                privilege.name.toLowerCase().includes(searchLower) ||
                privilege.code.toLowerCase().includes(searchLower) ||
                (privilege.description?.toLowerCase().includes(searchLower) || false) ||
                (privilege.discount_type?.name.toLowerCase().includes(searchLower) || false)
            );
        }

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(privilege =>
                filters.status === 'active' ? privilege.is_active : !privilege.is_active
            );
        }

        if (filters.discount_type && filters.discount_type !== 'all') {
            filtered = filtered.filter(privilege =>
                privilege.discount_type_id === Number(filters.discount_type)
            );
        }

        if (filters.requires_verification && filters.requires_verification !== 'all') {
            const requiresVerification = filters.requires_verification === 'yes';
            filtered = filtered.filter(privilege =>
                privilege.requires_verification === requiresVerification
            );
        }

        if (filters.requires_id_number && filters.requires_id_number !== 'all') {
            const requiresIdNumber = filters.requires_id_number === 'yes';
            filtered = filtered.filter(privilege =>
                privilege.requires_id_number === requiresIdNumber
            );
        }

        if (filters.sort_by) {
            filtered.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (filters.sort_by) {
                    case 'name':
                        aValue = a.name;
                        bValue = b.name;
                        break;
                    case 'code':
                        aValue = a.code;
                        bValue = b.code;
                        break;
                    case 'discount_percentage':
                        aValue = Number(a.default_discount_percentage);
                        bValue = Number(b.default_discount_percentage);
                        break;
                    case 'residents_count':
                        aValue = a.residents_count || 0;
                        bValue = b.residents_count || 0;
                        break;
                    case 'active_residents_count':
                        aValue = a.active_residents_count || 0;
                        bValue = b.active_residents_count || 0;
                        break;
                    case 'status':
                        aValue = a.is_active ? 1 : 0;
                        bValue = b.is_active ? 1 : 0;
                        break;
                    default:
                        aValue = a[filters.sort_by as keyof Privilege];
                        bValue = b[filters.sort_by as keyof Privilege];
                }

                if (typeof aValue === 'string') {
                    const comparison = aValue.localeCompare(bValue);
                    return filters.sort_order === 'asc' ? comparison : -comparison;
                } else {
                    const comparison = (aValue || 0) - (bValue || 0);
                    return filters.sort_order === 'asc' ? comparison : -comparison;
                }
            });
        }

        return filtered;
    },

    getSelectionStats: (selectedPrivileges: Privilege[]): SelectionStats => {
        const total = selectedPrivileges.length;
        const active = selectedPrivileges.filter(p => p.is_active).length;
        const inactive = total - active;
        const requiresVerification = selectedPrivileges.filter(p => p.requires_verification).length;
        const requiresIdNumber = selectedPrivileges.filter(p => p.requires_id_number).length;
        const totalAssignments = selectedPrivileges.reduce((sum, p) => sum + (p.residents_count || 0), 0);
        
        const discounts = selectedPrivileges
            .map(p => Number(p.default_discount_percentage))
            .filter(d => !isNaN(d));
        const avgDiscount = discounts.length > 0 
            ? discounts.reduce((sum, d) => sum + d, 0) / discounts.length 
            : undefined;

        return {
            total,
            active,
            inactive,
            requiresVerification,
            requiresIdNumber,
            totalAssignments,
            avgDiscount
        };
    },

    exportToCSV: (privileges: Privilege[], filename = 'privileges-export') => {
        const headers = ['ID', 'Name', 'Code', 'Description', 'Discount Type', 'Discount %', 'Requires ID', 'Requires Verification', 'Validity (Years)', 'Status', 'Total Assignments', 'Active Assignments', 'Created At'];
        const rows = privileges.map(privilege => [
            privilege.id,
            privilege.name,
            privilege.code,
            privilege.description || '',
            privilege.discount_type?.name || '',
            privilege.default_discount_percentage,
            privilege.requires_id_number ? 'Yes' : 'No',
            privilege.requires_verification ? 'Yes' : 'No',
            privilege.validity_years || 'Lifetime',
            privilege.is_active ? 'Active' : 'Inactive',
            privilege.residents_count || 0,
            privilege.active_residents_count || 0,
            new Date(privilege.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => 
                typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    formatPrivilegeCode: (privilege: Privilege): string => {
        return privilege.code || `PRIV-${privilege.id.toString().padStart(3, '0')}`;
    },

    getPrivilegeDisplayName: (privilege: Privilege): string => {
        const parts = [];
        if (privilege.code) parts.push(`[${privilege.code}]`);
        parts.push(privilege.name);
        if (privilege.discount_type) parts.push(`(${privilege.discount_type.name})`);
        return parts.join(' ');
    },

    getDiscountPercentage: (privilege: Privilege): number => {
        return Number(privilege.default_discount_percentage) || 0;
    },

    hasActiveResidents: (privilege: Privilege): boolean => {
        return (privilege.active_residents_count ?? 0) > 0;
    },

    // New helper functions for assignments
    getAssignmentStatus: (assignment: ResidentPrivilege): 'pending' | 'active' | 'expired' => {
        if (!assignment.verified_at) return 'pending';
        if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) return 'expired';
        return 'active';
    },

    isAssignmentActive: (assignment: ResidentPrivilege): boolean => {
        return assignment.verified_at !== null && 
               (!assignment.expires_at || new Date(assignment.expires_at) >= new Date());
    },

    getDaysUntilExpiry: (assignment: ResidentPrivilege): number | null => {
        if (!assignment.expires_at) return null;
        const expiryDate = new Date(assignment.expires_at);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};