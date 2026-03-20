// types/fees.ts

// ============================================
// UTILITY TYPES
// ============================================

export interface FormErrors {
    [key: string]: string | undefined;
}

// ============================================
// PRIVILEGE TYPES - DYNAMIC FROM DATABASE
// ============================================

export interface Privilege {
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

export interface ResidentPrivilege {
    code: any;
    id: number;
    resident_id: number;
    privilege_id: number;
    privilege: Privilege;
    id_number?: string;
    verified_at?: string | null;
    expires_at?: string | null;
    remarks?: string;
    discount_percentage?: number;
    is_active: boolean;
    status: 'pending' | 'active' | 'expired' | 'expiring_soon';
}

// ============================================
// PAYER TYPES
// ============================================

export const PAYER_TYPES = {
    RESIDENT: 'App\\Models\\Resident',
    HOUSEHOLD: 'App\\Models\\Household',
    BUSINESS: 'business',
    VISITOR: 'visitor',
    OTHER: 'other',
} as const;

export type PayerType = typeof PAYER_TYPES[keyof typeof PAYER_TYPES];

export const BULK_TYPES = {
    NONE: 'none',
    RESIDENTS: 'residents',
    HOUSEHOLDS: 'households',
    CUSTOM: 'custom',
} as const;

export type BulkType = typeof BULK_TYPES[keyof typeof BULK_TYPES];

// Fee Status from Fee model
export const FEE_STATUS = {
    DRAFT: 'draft',
    ISSUED: 'issued',
    PENDING_PAYMENT: 'pending_payment',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
    WAIVED: 'waived',
} as const;

export type FeeStatus = typeof FEE_STATUS[keyof typeof FEE_STATUS];

// Value Types from DiscountRule model
export const VALUE_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
} as const;

export type ValueType = typeof VALUE_TYPES[keyof typeof VALUE_TYPES];

// ============================================
// CORE FEE FORM DATA
// ============================================

export interface FeeFormData {
    // Fee Type (from FeeType model)
    fee_type_id: string;
    
    // Payer Information (polymorphic from Fee model)
    payer_type: PayerType | '';
    resident_id: string;
    household_id: string;
    business_name: string;
    payer_name: string;
    contact_number: string;
    address: string;
    purok: string;
    zone: string;
    
    // Timing (from Fee model)
    issue_date: string;
    due_date: string;
    period_start: string;
    period_end: string;
    valid_from?: string;
    valid_until?: string;
    
    // Amounts (from Fee model)
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    total_discounts: number; // Calculated sum of all discounts - Always 0 at creation
    total_amount: number;
    amount_paid: number; // Always 0 at creation
    balance: number; // Always total_amount at creation
    
    // Fee-specific data (metadata JSON from Fee model)
    purpose: string;
    property_description: string;
    business_type: string;
    area: number;
    
    // Metadata (from Fee model)
    remarks: string;
    batch_reference: string;
    requirements_submitted: string[];
    
    // Status (from Fee model)
    status: FeeStatus;
    
    // For Reference Only - These will be populated dynamically from privileges
    resident_privileges?: ResidentPrivilege[];
    billing_period: any;
}

// ============================================
// BULK FEE FORM DATA
// ============================================

export interface CustomPayer {
    id: string;
    name: string;
    contact_number?: string;
    purok?: string;
    address?: string;
    type: 'custom';
}

export interface BulkFeeFormData extends Omit<FeeFormData, 'resident_id' | 'household_id' | 'payer_name' | 'contact_number' | 'purok' | 'address'> {
    // Bulk Mode
    bulk_type: BulkType;
    
    // Resident Bulk Selection
    selected_resident_ids: (string | number)[];
    apply_to_all_residents: boolean;
    
    // Household Bulk Selection
    selected_household_ids: (string | number)[];
    apply_to_all_households: boolean;
    
    // Custom Payer Bulk Selection
    custom_payers: CustomPayer[];
    
    // Filters (for UI only)
    filter_purok?: string;
    filter_discount_eligible?: boolean; // For filtering UI only, NOT for applying discounts
}

// ============================================
// FEE TYPE (from FeeType model)
// ============================================

export interface FeeType {
    id: number;
    code: string;
    document_category_id: number | null;
    document_category?: DocumentCategory | null;
    name: string;
    short_name?: string;
    
    // Amount Configuration
    base_amount: number;
    amount_type: 'fixed' | 'computed' | string;
    computation_formula?: any;
    unit?: string;
    
    // Discount Configuration - DYNAMIC
    is_discountable: boolean;
    
    // Surcharge Configuration
    has_surcharge: boolean;
    surcharge_percentage: number;
    surcharge_fixed: number;
    
    // Penalty Configuration
    has_penalty: boolean;
    penalty_percentage: number;
    penalty_fixed: number;
    
    // Schedule
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'bi_annual' | 'custom' | null;
    validity_days: number | null;
    due_day: number | null;
    
    // Applicability
    applicable_to: 'all_residents' | 'property_owners' | 'business_owners' | 'households' | 'specific_purok' | 'specific_zone' | 'visitors' | null;
    applicable_puroks?: string[] | null;
    requirements?: string[] | null;
    
    // Dates
    effective_date?: string | null;
    expiry_date?: string | null;
    
    // Status
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    sort_order: number;
    
    // Description
    description: string | null;
    notes: string | null;
    
    // DYNAMIC: Discount fields will be added from privileges
    // Example: has_SENIOR_discount, SENIOR_discount_percentage, etc.
    [key: string]: any;
}

// ============================================
// DISCOUNT RULE (from DiscountRule model)
// ============================================

export interface DiscountRule {
    id: number;
    code: string;
    name: string;
    description?: string;
    discount_type: string; // Will match privilege codes
    value_type: ValueType;
    discount_value: number;
    maximum_discount_amount?: number;
    minimum_purchase_amount?: number;
    priority: number;
    requires_verification: boolean;
    verification_document?: string;
    applicable_to?: 'resident' | 'household' | 'business' | 'all' | null;
    applicable_puroks?: string[] | null;
    stackable: boolean;
    exclusive_with?: string[] | number[] | null;
    effective_date?: string | null;
    expiry_date?: string | null;
    is_active: boolean;
    sort_order: number;
    notes?: string | null;
    
    // Link to privilege
    privilege_id?: number;
    
    // Appended attributes
    formatted_value?: string;
    status?: 'Active' | 'Inactive' | 'Scheduled' | 'Expired';
    is_expired?: boolean;
    type_label?: string;
    privilege_code?: string;
}

// ============================================
// DISPLAY-ONLY DISCOUNT INFO - DYNAMIC
// ============================================

export interface DiscountInfo {
    eligibleDiscounts: Array<{
        code: string;
        name: string;
        percentage: number;
        legalBasis: string;
        description: string;
        requirements?: string[];
    }>;
    legalNotes: string[];
    warnings: string[];
}

// ============================================
// RESIDENT (from Resident model - DYNAMIC)
// ============================================

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name: string;
    purok?: string;
    purok_id?: number;
    contact_number?: string;
    email?: string;
    birth_date?: string;
    age?: number;
    gender?: string;
    civil_status?: string;
    occupation?: string;
    address?: string;
    is_voter?: boolean;
    status?: string;
    
    // DYNAMIC: Privilege data
    privileges?: ResidentPrivilege[];
    privileges_count?: number;
    active_privileges_count?: number;
    discount_eligibility_list?: Array<{
        type: string;
        label: string;
        percentage: number;
        id_number?: string;
        has_id: boolean;
        privilege_code?: string;
    }>;
    has_special_classification: boolean;
    
    [key: string]: any;
}

// ============================================
// HOUSEHOLD (from Household model - DYNAMIC)
// ============================================

export interface Household {
    id: number;
    household_number: string;
    head_of_family?: string;
    name: string;
    purok?: string;
    purok_id?: number;
    contact_number?: string;
    email?: string;
    address?: string;
    member_count?: number;
    householdMembers?: Array<{
        resident: Resident;
        is_head: boolean;
    }>;
    
    // Head resident's privileges
    head_privileges?: Array<{
        code: string;
        name: string;
        id_number?: string;
    }>;
    has_discount_eligible_head?: boolean;
}

// ============================================
// DOCUMENT CATEGORY
// ============================================

export interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
}

// ============================================
// PROPS FOR FEES CREATE PAGE
// ============================================

export interface FeesCreateProps {
    // Data from backend
    feeTypes: FeeType[];
    residents: Resident[];
    households: Household[];
    discountRules: DiscountRule[]; // Passed for informational display only
    documentCategories: DocumentCategory[];
    puroks: string[];
    
    // ALL PRIVILEGES from database
    allPrivileges?: Privilege[];
    
    // Preselected Data
    preselectedResident?: Resident | null;
    preselectedHousehold?: Household | null;
    
    // Form State
    errors?: FormErrors;
    initialData?: Partial<FeeFormData>;
    
    // Duplication
    duplicateFrom?: {
        id: number;
        fee_code: string;
        fee_type_name: string;
    };
}

// ============================================
// HELPER FUNCTIONS - DYNAMIC
// ============================================

// Safe number parsing
export const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '' || value === 'null') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

// Safe string conversion
export const safeString = (value: any): string => {
    if (value === null || value === undefined || value === 'null') return '';
    return String(value);
};

// Currency formatting
export const formatCurrency = (amount: any): string => {
    const num = parseNumber(amount);
    return '₱' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Calculate total amount (NO DISCOUNT LOGIC)
export const calculateTotalAmount = (
    base: number,
    surcharge: number = 0,
    penalty: number = 0
): number => {
    const total = parseNumber(base) + parseNumber(surcharge) + parseNumber(penalty);
    return Math.max(0, total);
};

/**
 * Check if resident has a specific privilege - DYNAMIC
 */
export const hasPrivilege = (resident: Resident | null, privilegeCode: string): boolean => {
    if (!resident || !resident.privileges) return false;
    
    return resident.privileges.some((p: ResidentPrivilege) => 
        p.code?.toUpperCase() === privilegeCode?.toUpperCase() && 
        (p.status === 'active' || p.status === 'expiring_soon')
    );
};

/**
 * Get resident's active privileges - DYNAMIC
 */
export const getActivePrivileges = (resident: Resident | null): ResidentPrivilege[] => {
    if (!resident || !resident.privileges) return [];
    
    return resident.privileges.filter((p: ResidentPrivilege) => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
};

/**
 * Get privilege icon - DYNAMIC based on code
 */
export const getPrivilegeIcon = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, string> = {
        'S': '👴',
        'P': '♿',
        'I': '🏠',
        'F': '🌾',
        'O': '✈️',
        '4': '📦',
        'U': '💼',
        'A': '🎫',
        'B': '🎫',
        'C': '🎫',
        'D': '🎫',
        'E': '🎫',
    };
    
    return iconMap[firstChar] || '🎫';
};

/**
 * Get privilege color - DYNAMIC based on hash of code
 */
export const getPrivilegeColor = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400';
};

// ============================================
// CONSTANTS - REMOVED HARDCODED DISCOUNT TYPES
// ============================================

// REMOVED: DISCOUNT_TYPES constant
// REMOVED: PHILIPPINE_DISCOUNT_LAWS constant

// ============================================
// TYPE GUARDS - DYNAMIC
// ============================================

export const isResident = (payer: any): payer is Resident => {
    return payer && 'first_name' in payer && 'last_name' in payer;
};

export const isHousehold = (payer: any): payer is Household => {
    return payer && 'household_number' in payer;
};

export const isValidPayerType = (type: string): type is PayerType => {
    return Object.values(PAYER_TYPES).includes(type as PayerType);
};

export const isValidBulkType = (type: string): type is BulkType => {
    return Object.values(BULK_TYPES).includes(type as BulkType);
};

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_FEE_FORM_DATA: FeeFormData = {
    fee_type_id: '',
    payer_type: '',
    resident_id: '',
    household_id: '',
    business_name: '',
    payer_name: '',
    contact_number: '',
    address: '',
    purok: '',
    zone: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    base_amount: 0,
    surcharge_amount: 0,
    penalty_amount: 0,
    total_discounts: 0,
    total_amount: 0,
    amount_paid: 0,
    balance: 0,
    purpose: '',
    property_description: '',
    business_type: '',
    area: 0,
    remarks: '',
    batch_reference: '',
    requirements_submitted: [],
    status: 'draft',
    billing_period: '',
};

export const DEFAULT_BULK_FEE_FORM_DATA: BulkFeeFormData = {
    ...DEFAULT_FEE_FORM_DATA,
    bulk_type: 'none',
    selected_resident_ids: [],
    selected_household_ids: [],
    custom_payers: [],
    apply_to_all_residents: false,
    apply_to_all_households: false,
    filter_purok: '',
    filter_discount_eligible: false,
};