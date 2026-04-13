// @/types/admin/clearance-types/clearance-types.ts

import { PageProps as InertiaPageProps } from '@inertiajs/core';

// ========== CORE INTERFACES ==========

export interface ClearanceType {
    remarks: any;
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number;
    formatted_fee?: string;
    is_discountable: boolean;
    processing_days: number;
    validity_days: number;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    clearances_count?: number;
    created_at: string;
    updated_at: string;
    purpose_options?: string;
    document_types_count?: number;
    image_url?: string | null;
    sort_order?: number;
    created_by?: number;
    updated_by?: number;
    document_types?: DocumentType[];
    discount_configs?: DiscountConfig[];
    eligibility_criteria?: EligibilityCriterion[] | string;
}

// Document Type interface
export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description: string;
    category: string;
    is_required: boolean;
    sort_order: number;
    accepted_formats?: string[];
    max_file_size?: number;
    is_active: boolean;
}

// Common Type interface
export interface CommonType {
    name: string;
    code: string;
    description: string;
    fee: number;
    processing_days: number;
    validity_days: number;
    requires_payment?: boolean;
}

// Eligibility Criterion interface
export interface EligibilityCriterion {
    field: string;
    operator: string;
    value: string;
}

// Discount Config interface
export interface DiscountConfig {
    privilege_id: number;
    privilege_code: string;
    privilege_name: string;
    discount_percentage: number;
    is_active: boolean;
    requires_verification: boolean;
    requires_id_number: boolean;
}

export interface PrivilegeData {
    id: number;
    name: string;
    code: string;
    description?: string;
    default_discount_percentage?: number;
    requires_id_number?: boolean;
    requires_verification?: boolean;
    validity_years?: number;
    is_active: boolean;
}

// ========== PROPS INTERFACES ==========

export interface ShowClearanceTypeProps {
    clearanceType: ClearanceType;
    recentClearances?: Array<{
        id: number;
        resident_name: string;
        status: string;
        created_at: string;
    }>;
    privileges?: PrivilegeData[];
}

// Paginated response structure
export interface PaginatedClearanceTypesResponse {
    data: ClearanceType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// Filter state interfaces
export interface FilterState {
    search: string;
    status: string;
    fee_range: any;
    date_range: any;
    requires_payment: string;
    discountable: string;
    sort: string;
    direction: 'asc' | 'desc';
}

export interface ClearanceTypeFilters {
    search?: string;
    status?: string;
    requires_payment?: string;
    discountable?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
}

// Stats interface
export interface ClearanceTypeStats {
    total: number;
    active: number;
    discountable: number;
    non_discountable: number;
    requires_payment: number;
    requires_approval: number;
    online_only: number;
}

// Form data for create/update
export interface ClearanceTypeFormData {
    name: string;
    code: string;
    description: string;
    fee: number | string;
    is_discountable: boolean;
    processing_days: number | string;
    validity_days: number | string;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    purpose_options?: string;
    image?: File | null;
    document_type_ids?: number[];
    eligibility_criteria?: EligibilityCriterion[];
    discount_configs?: DiscountConfig[];
}

// Bulk operation types
export type BulkOperationType = 
    | 'activate'
    | 'deactivate'
    | 'delete'
    | 'export'
    | 'duplicate'
    | 'toggle-payment'
    | 'toggle-approval'
    | 'toggle-online'
    | 'update'
    | 'mark_discountable'
    | 'mark_non_discountable';

export type BulkOperation = BulkOperationType;

export type BulkEditField = 
    | 'processing_days'
    | 'validity_days'
    | 'fee'
    | 'requires_payment'
    | 'requires_approval'
    | 'is_online_only'
    | 'is_discountable';

export type SelectionMode = 'page' | 'filtered' | 'all';

// Selection stats interface
export interface SelectionStats {
    active: number;
    inactive: number;
    discountable: number;
    non_discountable: number;
    paid: number;
    free: number;
    needsApproval: number;
    onlineOnly: number;
    totalValue: number;
    avgProcessingDays: number;
}

// Dialog state interface
export interface BulkDialogsState {
    showBulkDeleteDialog: boolean;
    showBulkActivateDialog: boolean;
    showBulkDeactivateDialog: boolean;
    showBulkEditDialog: boolean;
}

// Bulk edit form data
export interface BulkEditFormData {
    field: BulkEditField;
    value: string | number | boolean;
    ids: number[];
}

// Response interfaces
export interface BulkOperationResponse {
    success: boolean;
    message: string;
    updated_count?: number;
    errors?: Record<string, string[]>;
}

export interface ClearanceTypeResponse {
    success: boolean;
    message: string;
    clearance_type?: ClearanceType;
}

// Helper function types
export type TruncationLengthFunction = (type: 'name' | 'description' | 'code') => number;

// Page props interface
export interface ClearanceTypesPageProps extends InertiaPageProps {
    clearanceTypes: PaginatedClearanceTypesResponse;
    filters: ClearanceTypeFilters;
    stats: ClearanceTypeStats;
    auth: {
        user: any;
    };
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    [key: string]: any;
}

// ========== HELPER FUNCTIONS ==========

export const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
};

export const getDiscountableBadgeVariant = (isDiscountable: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isDiscountable ? 'default' : 'secondary';
};

export const getPaymentBadgeVariant = (requiresPayment: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return requiresPayment ? 'destructive' : 'secondary';
};

export const getApprovalBadgeVariant = (requiresApproval: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return requiresApproval ? 'destructive' : 'secondary';
};

export const getOnlineOnlyBadgeVariant = (isOnlineOnly: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isOnlineOnly ? 'default' : 'secondary';
};

// Utility functions
export const getPurposeOptionsCount = (type: ClearanceType): number => {
    if (!type.purpose_options) return 0;
    return type.purpose_options.split(',').filter(opt => opt.trim() !== '').length;
};

export const formatClearanceTypeDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export const formatCurrency = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const validAmount = isNaN(numericAmount) ? 0 : numericAmount;
    
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(validAmount);
};

// Document helper functions
export const formatAcceptedFormats = (formats: any): string => {
    if (!formats) return 'None specified';
    if (Array.isArray(formats)) {
        return formats.length > 0 ? formats.join(', ') : 'None specified';
    }
    if (typeof formats === 'string') {
        return formats.split(',').map(f => f.trim()).filter(f => f).join(', ') || 'None specified';
    }
    return 'None specified';
};

export const formatFileSize = (size: any): string => {
    const num = Number(size);
    if (isNaN(num) || num <= 0) return 'Not specified';
    return `${(num / 1024).toFixed(1)} MB`;
};

export const numbersEqual = (a: number, b: number, tolerance = 0.001): boolean => {
    return Math.abs(a - b) < tolerance;
};

// Selection stats calculator
export const calculateSelectionStats = (selectedTypes: ClearanceType[]): SelectionStats => {
    const totalValue = selectedTypes.reduce((sum, t) => sum + safeNumber(t.fee, 0), 0);
    
    let avgProcessingDays = 0;
    if (selectedTypes.length > 0) {
        const totalProcessingDays = selectedTypes.reduce((sum, t) => sum + safeNumber(t.processing_days, 0), 0);
        avgProcessingDays = totalProcessingDays / selectedTypes.length;
    }
    
    return {
        active: selectedTypes.filter(t => Boolean(t.is_active)).length,
        inactive: selectedTypes.filter(t => !t.is_active).length,
        discountable: selectedTypes.filter(t => Boolean(t.is_discountable)).length,
        non_discountable: selectedTypes.filter(t => !t.is_discountable).length,
        paid: selectedTypes.filter(t => Boolean(t.requires_payment)).length,
        free: selectedTypes.filter(t => !t.requires_payment).length,
        needsApproval: selectedTypes.filter(t => Boolean(t.requires_approval)).length,
        onlineOnly: selectedTypes.filter(t => Boolean(t.is_online_only)).length,
        totalValue: safeNumber(totalValue, 0),
        avgProcessingDays: safeNumber(avgProcessingDays, 0),
    };
};

// Format for clipboard export
export const formatForClipboard = (types: ClearanceType[]): string => {
    if (types.length === 0) return '';
    
    const data = types.map(type => ({
        Name: type.name,
        Code: type.code,
        Fee: type.formatted_fee || formatCurrency(type.fee),
        Discountable: type.is_discountable ? 'Yes' : 'No',
        Status: type.is_active ? 'Active' : 'Inactive',
        'Processing Days': `${type.processing_days} days`,
        'Validity Days': `${type.validity_days} days`,
        'Requires Payment': type.requires_payment ? 'Yes' : 'No',
        'Requires Approval': type.requires_approval ? 'Yes' : 'No',
        'Online Only': type.is_online_only ? 'Yes' : 'No',
        'Clearances Count': type.clearances_count || 0,
        'Created At': formatClearanceTypeDate(type.created_at),
        'Updated At': formatClearanceTypeDate(type.updated_at),
    }));
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => 
            Object.values(row).map(value => 
                typeof value === 'string' && (value.includes(',') || value.includes('"'))
                    ? `"${value.replace(/"/g, '""')}"`
                    : value
            ).join(',')
        )
    ].join('\n');
};

// Filter clearance types helper
export const filterClearanceTypes = (
    types: ClearanceType[],
    search: string,
    filters: FilterState | ClearanceTypeFilters,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
): ClearanceType[] => {
    let filtered = [...types];
    
    // Apply search
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(type =>
            type.name.toLowerCase().includes(searchLower) ||
            type.code.toLowerCase().includes(searchLower) ||
            type.description.toLowerCase().includes(searchLower)
        );
    }
    
    // Apply status filter
    const status = (filters as any).status;
    if (status && status !== 'all') {
        const isActive = status === 'active';
        filtered = filtered.filter(type => type.is_active === isActive);
    }
    
    // Apply payment filter
    const requiresPayment = (filters as any).requires_payment;
    if (requiresPayment && requiresPayment !== 'all') {
        const reqPayment = requiresPayment === 'yes';
        filtered = filtered.filter(type => type.requires_payment === reqPayment);
    }
    
    // Apply discountable filter
    const discountable = (filters as any).discountable;
    if (discountable && discountable !== 'all') {
        const isDiscountable = discountable === 'yes';
        filtered = filtered.filter(type => type.is_discountable === isDiscountable);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'code':
                aValue = a.code.toLowerCase();
                bValue = b.code.toLowerCase();
                break;
            case 'fee':
                aValue = a.fee;
                bValue = b.fee;
                break;
            case 'is_discountable':
                aValue = a.is_discountable ? 1 : 0;
                bValue = b.is_discountable ? 1 : 0;
                break;
            case 'clearances_count':
                aValue = a.clearances_count || 0;
                bValue = b.clearances_count || 0;
                break;
            case 'processing_days':
                aValue = a.processing_days;
                bValue = b.processing_days;
                break;
            case 'validity_days':
                aValue = a.validity_days;
                bValue = b.validity_days;
                break;
            default:
                aValue = a[sortBy as keyof ClearanceType];
                bValue = b[sortBy as keyof ClearanceType];
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    return filtered;
};

// Parse eligibility criteria from string or array
export const parseEligibilityCriteria = (criteria: any): EligibilityCriterion[] => {
    if (!criteria) return [];
    if (Array.isArray(criteria)) return criteria;
    if (typeof criteria === 'string') {
        try {
            return JSON.parse(criteria);
        } catch {
            return [];
        }
    }
    return [];
};

// Get purpose options from string
export const getPurposeOptions = (purposeOptions?: string): string[] => {
    if (!purposeOptions) return [];
    return purposeOptions.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
};

// Get status color
export const getStatusColor = (isActive: boolean): string => {
    return isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
};

// Get status icon
export const getStatusIcon = (isActive: boolean): React.ReactNode => {
    // This will be implemented in the component with actual icons
    return null;
};

export interface PageProps extends InertiaPageProps {
    clearanceTypes: PaginatedClearanceTypesResponse;
    filters: ClearanceTypeFilters;
    stats: ClearanceTypeStats;
    auth: {
        user: any;
    };
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    [key: string]: any;
}