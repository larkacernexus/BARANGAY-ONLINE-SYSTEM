// types/admin/fee-types/fee-types.ts

export interface FeeType {
    id: number;
    code: string;
    name: string;
    short_name?: string;
    description?: string;
    document_category_id: number | null;
    document_category?: DocumentCategory;
    base_amount: number | string;
    amount_type: 'fixed' | 'percentage' | 'sliding_scale';
    unit?: string;
    frequency: 'one_time' | 'annual' | 'quarterly' | 'monthly';
    validity_days: number | null;
    applicable_to: 'all_residents' | 'property_owners' | 'business_owners' | 'specific_purok';
    applicable_puroks?: string[];
    requirements?: string[];
    effective_date: string;
    expiry_date?: string | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    due_day?: number | null;
    sort_order: number;
    
    // Discount fields
    has_senior_discount: boolean;
    senior_discount_percentage: number | null;
    has_pwd_discount: boolean;
    pwd_discount_percentage: number | null;
    has_solo_parent_discount: boolean;
    solo_parent_discount_percentage: number | null;
    has_indigent_discount: boolean;
    indigent_discount_percentage: number | null;
    
    // Penalty fields
    has_surcharge: boolean;
    surcharge_percentage: number | null;
    surcharge_fixed: number | null;
    has_penalty: boolean;
    penalty_percentage: number | null;
    penalty_fixed: number | null;
    
    notes?: string;
    
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    
    // Computed properties
    amount_display?: string;
    category_name?: string;
    category_slug?: string;
    status?: 'active' | 'inactive' | 'expired';
    discount_summary?: string;
    penalty_summary?: string;
}

export interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

export interface FeeTypeStats {
    total: number;
    active: number;
    inactive: number;
    mandatory: number;
    autoGenerate: number;
    totalAmount: number;
    withDiscounts: number;
    withPenalties: number;
}

export interface FilterState {
    search: string;
    category: string;
    status: string;
    hasDiscount: string;
    hasPenalty: string;
    frequency: string;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    mandatory: number;
    autoGenerate: number;
    totalAmount: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byAmountType: Record<string, number>;
    byFrequency: Record<string, number>;
    byDiscountType: Record<string, number>;
}

export type BulkOperation = 
    | 'delete' 
    | 'activate' 
    | 'deactivate' 
    | 'export' 
    | 'export_csv' 
    | 'duplicate' 
    | 'update_category'
    | 'enable_discounts'
    | 'disable_discounts'
    | 'apply_standard_discounts';

export type BulkEditField = 
    | 'status' 
    | 'category' 
    | 'mandatory' 
    | 'frequency'
    | 'has_senior_discount'
    | 'has_pwd_discount'
    | 'has_solo_parent_discount'
    | 'has_indigent_discount'
    | 'has_surcharge'
    | 'has_penalty';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface PageProps extends Record<string, any> {
    feeTypes: FeeType[];
    categories: Record<string, string>;
    filters: {
        search?: string;
        category?: string;
        status?: string;
        hasDiscount?: string;
        hasPenalty?: string;
        frequency?: string;
    };
    stats?: FeeTypeStats;
}

// Fee Type creation specific types
export interface CreateFeeTypeProps extends Record<string, any> {
    categories: CategoryOption[];
    amountTypes: Record<string, string>;
    frequencies: Record<string, string>;
    applicableTo: Record<string, string>;
    puroks: string[];
    errors?: Record<string, string>;
    commonFormats?: Record<string, string>;
    commonTypes?: Array<{
        code: string;
        name: string;
        description: string;
        accepted_formats: string[];
        max_file_size: number;
        sort_order: number;
        is_required: boolean;
        category_id: number;
    }>;
}

// Fee Type edit specific types
export interface EditFeeTypeProps extends Record<string, any> {
    feeType: FeeType;
    categories: CategoryOption[];
    amountTypes: Record<string, string>;
    frequencies: Record<string, string>;
    applicableTo: Record<string, string>;
    puroks: string[];
    errors?: Record<string, string>;
}

// Fee Type show page types
export interface ShowFeeTypeProps extends Record<string, any> {
    feeType: FeeType;
    relatedFees?: FeeType[];
    usageCount?: number;
    totalCollected?: number;
    lastUsed?: string;
    discountStats?: {
        seniorCount: number;
        pwdCount: number;
        soloParentCount: number;
        indigentCount: number;
        totalDiscountAmount: number;
    };
    penaltyStats?: {
        latePayments: number;
        totalSurchargeCollected: number;
        totalPenaltyCollected: number;
    };
}

// Fee Type history types
export interface FeeTypeHistory {
    id: number;
    fee_type_id: number;
    user_id: number;
    user_name?: string;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'discount_updated' | 'penalty_updated';
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    created_at: string;
}

// Discount types
export interface DiscountConfig {
    type: 'senior' | 'pwd' | 'solo_parent' | 'indigent';
    hasDiscount: boolean;
    percentage: number | null;
    legalBasis: string;
    description: string;
    mandatory: boolean;
    defaultPercentage: number;
}

export interface PenaltyConfig {
    hasSurcharge: boolean;
    surchargePercentage: number | null;
    surchargeFixed: number | null;
    hasPenalty: boolean;
    penaltyPercentage: number | null;
    penaltyFixed: number | null;
}

// Philippine standard discount rates
export const PHILIPPINE_STANDARD_DISCOUNTS = {
    senior: {
        percentage: 20,
        legalBasis: 'RA 9994',
        description: 'Expanded Senior Citizens Act of 2010',
        mandatory: true
    },
    pwd: {
        percentage: 20,
        legalBasis: 'RA 10754',
        description: 'Persons with Disability Benefits Act',
        mandatory: true
    },
    solo_parent: {
        percentage: 10,
        legalBasis: 'RA 8972',
        description: 'Solo Parents Welfare Act of 2000',
        mandatory: false
    },
    indigent: {
        percentage: 50,
        legalBasis: 'LGU Ordinance',
        description: 'Based on local government classification',
        mandatory: false
    }
} as const;

// Helper functions types
export interface CategoryDetails {
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

export interface DiscountDetails {
    summary: string;
    activeDiscounts: string[];
    totalDiscountPercentage?: number;
    highestDiscount: number;
    applicableGroups: string[];
}

// Form data interfaces
export interface FeeFormData {
    code: string;
    name: string;
    short_name: string;
    document_category_id: string;
    base_amount: number;
    amount_type: string;
    unit: string;
    description: string;
    frequency: string;
    validity_days: number | null;
    applicable_to: string;
    applicable_puroks: string[];
    requirements: string[];
    effective_date: string;
    expiry_date: string;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    due_day: number | null;
    sort_order: number;
    
    // Separate discount fields for each type
    has_senior_discount: boolean;
    senior_discount_percentage: number | null;
    
    has_pwd_discount: boolean;
    pwd_discount_percentage: number | null;
    
    has_solo_parent_discount: boolean;
    solo_parent_discount_percentage: number | null;
    
    has_indigent_discount: boolean;
    indigent_discount_percentage: number | null;
    
    has_surcharge: boolean;
    surcharge_percentage: number | null;
    surcharge_fixed: number | null;
    has_penalty: boolean;
    penalty_percentage: number | null;
    penalty_fixed: number | null;
    notes: string;
}

// Validation and calculation utilities
export interface FeeCalculation {
    baseAmount: number;
    appliedDiscounts: Array<{
        type: string;
        percentage: number;
        amount: number;
    }>;
    totalDiscount: number;
    subtotal: number;
    surcharge?: number;
    penalty?: number;
    total: number;
}

// API Response types
export interface FeeTypeApiResponse {
    success: boolean;
    message?: string;
    data?: FeeType | FeeType[];
    errors?: Record<string, string[]>;
}

export interface BulkOperationResponse {
    success: boolean;
    message: string;
    processedCount: number;
    failedCount: number;
    errors?: Array<{
        id: number;
        error: string;
    }>;
}

// Export types
export interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf';
    includeStats?: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    fields?: Array<keyof FeeType>;
}

// Filter utilities
export interface FilterOptions {
    search?: string;
    category?: number | string;
    status?: 'active' | 'inactive' | 'all';
    hasDiscount?: boolean;
    hasPenalty?: boolean;
    frequency?: FeeType['frequency'];
    amountType?: FeeType['amount_type'];
    dateFrom?: string;
    dateTo?: string;
}

// Sort options
export interface SortOptions {
    field: keyof FeeType;
    direction: 'asc' | 'desc';
}

// Pagination options
export interface PaginationOptions {
    page: number;
    perPage: number;
    total?: number;
    lastPage?: number;
}

// Helper functions for fee type utilities
export const getDiscountConfig = (type: keyof typeof PHILIPPINE_STANDARD_DISCOUNTS): DiscountConfig => {
    const config = PHILIPPINE_STANDARD_DISCOUNTS[type];
    return {
        type,
        hasDiscount: false,
        percentage: config.percentage,
        legalBasis: config.legalBasis,
        description: config.description,
        mandatory: config.mandatory,
        defaultPercentage: config.percentage
    };
};

export const calculateDiscountAmount = (
    amount: number,
    percentage: number | null
): number => {
    if (!percentage || percentage <= 0) return 0;
    return (amount * percentage) / 100;
};

export const calculateTotalWithDiscounts = (
    amount: number,
    discounts: Array<{ percentage: number | null }>
): { totalDiscount: number; finalAmount: number } => {
    let totalDiscount = 0;
    let currentAmount = amount;
    
    // Get the highest applicable discount (only one discount applies)
    const highestDiscount = Math.max(
        ...discounts.map(d => d.percentage || 0)
    );
    
    if (highestDiscount > 0) {
        totalDiscount = calculateDiscountAmount(amount, highestDiscount);
        currentAmount = amount - totalDiscount;
    }
    
    return {
        totalDiscount,
        finalAmount: currentAmount
    };
};

export const getFeeStatus = (feeType: FeeType): 'active' | 'inactive' | 'expired' => {
    if (!feeType.is_active) return 'inactive';
    
    if (feeType.expiry_date && new Date(feeType.expiry_date) < new Date()) {
        return 'expired';
    }
    
    return 'active';
};

export const getDiscountSummary = (feeType: FeeType): string => {
    const discounts: string[] = [];
    
    if (feeType.has_senior_discount) discounts.push(`Senior (${feeType.senior_discount_percentage}%)`);
    if (feeType.has_pwd_discount) discounts.push(`PWD (${feeType.pwd_discount_percentage}%)`);
    if (feeType.has_solo_parent_discount) discounts.push(`Solo Parent (${feeType.solo_parent_discount_percentage}%)`);
    if (feeType.has_indigent_discount) discounts.push(`Indigent (${feeType.indigent_discount_percentage}%)`);
    
    return discounts.length > 0 ? discounts.join(', ') : 'No discounts';
};

export const getPenaltySummary = (feeType: FeeType): string => {
    const penalties: string[] = [];
    
    if (feeType.has_surcharge) {
        if (feeType.surcharge_percentage) penalties.push(`${feeType.surcharge_percentage}% monthly`);
        if (feeType.surcharge_fixed) penalties.push(`₱${feeType.surcharge_fixed} fixed`);
    }
    
    if (feeType.has_penalty) {
        if (feeType.penalty_percentage) penalties.push(`${feeType.penalty_percentage}% one-time`);
        if (feeType.penalty_fixed) penalties.push(`₱${feeType.penalty_fixed} fixed`);
    }
    
    return penalties.length > 0 ? penalties.join(' + ') : 'No penalties';
};

// Category helper functions
export const getCategoryDetails = (categorySlug?: string): CategoryDetails => {
    const categories: Record<string, CategoryDetails> = {
        tax: {
            name: 'Taxes',
            icon: 'Briefcase',
            color: 'blue',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: 'text-blue-700 dark:text-blue-400',
            borderColor: 'border-blue-200 dark:border-blue-800'
        },
        clearance: {
            name: 'Clearances',
            icon: 'FileText',
            color: 'green',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            textColor: 'text-green-700 dark:text-green-400',
            borderColor: 'border-green-200 dark:border-green-800'
        },
        permit: {
            name: 'Permits',
            icon: 'Shield',
            color: 'purple',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            textColor: 'text-purple-700 dark:text-purple-400',
            borderColor: 'border-purple-200 dark:border-purple-800'
        },
        fee: {
            name: 'Fees',
            icon: 'DollarSign',
            color: 'yellow',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            textColor: 'text-yellow-700 dark:text-yellow-400',
            borderColor: 'border-yellow-200 dark:border-yellow-800'
        },
        donation: {
            name: 'Donations',
            icon: 'Heart',
            color: 'red',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            textColor: 'text-red-700 dark:text-red-400',
            borderColor: 'border-red-200 dark:border-red-800'
        },
        default: {
            name: 'Other',
            icon: 'Tag',
            color: 'gray',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-700 dark:text-gray-400',
            borderColor: 'border-gray-200 dark:border-gray-700'
        }
    };
    
    return categories[categorySlug || 'default'] || categories.default;
};