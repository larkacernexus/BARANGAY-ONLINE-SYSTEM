// types/fees.ts

// ============================================
// UTILITY TYPES
// ============================================

export interface FormErrors {
    [key: string]: string | undefined;
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

// Discount Types from DiscountRule model
export const DISCOUNT_TYPES = {
    SENIOR: 'SENIOR',
    PWD: 'PWD',
    SOLO_PARENT: 'SOLO_PARENT',
    INDIGENT: 'INDIGENT',
    VETERAN: 'VETERAN',
    STUDENT: 'STUDENT',
} as const;

export type DiscountTypeCode = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES];

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
    billing_period(billing_period: any): string | number | readonly string[] | undefined;
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
    
    // Philippine Law Compliance - For Reference Only
    // These are not stored in Fee model, just for UI display
    ph_senior_id_verified: boolean;
    ph_pwd_id_verified: boolean;
    ph_solo_parent_id_verified: boolean;
    ph_indigent_id_verified: boolean;
    ph_legal_compliance_notes: string;
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
    
    // Discount Configuration
    is_discountable: boolean; // This is the only discount-related field in FeeType
    
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
    
    // Appended attributes
    display_name?: string;
    category_display?: string;
    applicable_to_display?: string;
    frequency_display?: string;
}

// ============================================
// DISCOUNT RULE (from DiscountRule model)
// ============================================

export interface DiscountRule {
    id: number;
    code: string;
    name: string;
    description?: string;
    discount_type: DiscountTypeCode;
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
    
    // Appended attributes
    formatted_value?: string;
    status?: 'Active' | 'Inactive' | 'Scheduled' | 'Expired';
    is_expired?: boolean;
    type_label?: string;
}

// ============================================
// DISPLAY-ONLY DISCOUNT INFO
// ============================================

export interface DiscountInfo {
    eligibleDiscounts: Array<{
        code: DiscountTypeCode;
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
// RESIDENT (from Resident model - partial for reference)
// ============================================

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    full_name: string;
    purok?: string;
    purok_id?: number;
    contact_number?: string;
    birth_date?: string;
    age?: number;
    gender?: string;
    occupation?: string;
    address?: string;
    
    // Eligibility Flags (for reference only - used by DiscountRule)
    is_senior: boolean;
    is_pwd: boolean;
    is_solo_parent: boolean;
    is_indigent: boolean;
    is_veteran?: boolean;
    is_student?: boolean;
    
    // ID Numbers (for reference)
    senior_id_number?: string;
    pwd_id_number?: string;
    solo_parent_id_number?: string;
    indigent_id_number?: string;
    
    // Eligibility
    has_special_classification: boolean;
    eligible_discounts?: DiscountTypeCode[];
}

// ============================================
// HOUSEHOLD (from Household model - partial for reference)
// ============================================

export interface Household {
    id: number;
    household_number: string;
    head_of_family?: string;
    name: string;
    purok?: string;
    purok_id?: number;
    contact_number?: string;
    address?: string;
    member_count?: number;
    householdMembers?: Array<{
        resident: Resident;
        is_head: boolean;
    }>;
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
// HELPER FUNCTIONS
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

// ============================================
// CONSTANTS
// ============================================

// Philippine Legal Discount Laws (For Display Only)
export const PHILIPPINE_DISCOUNT_LAWS = {
    SENIOR: {
        code: 'RA 9994',
        name: 'Expanded Senior Citizens Act of 2010',
        maxPercentage: 20,
        description: 'For senior citizens aged 60 and above',
        requirements: ['Valid Senior Citizen ID', 'Age 60+'],
        discountType: 'SENIOR' as DiscountTypeCode,
    },
    PWD: {
        code: 'RA 10754',
        name: 'Expanded PWD Benefits Act',
        maxPercentage: 20,
        description: 'For Persons With Disabilities',
        requirements: ['Valid PWD ID'],
        discountType: 'PWD' as DiscountTypeCode,
    },
    SOLO_PARENT: {
        code: 'RA 8972',
        name: 'Solo Parents Welfare Act of 2000',
        maxPercentage: 10,
        description: 'For solo parents',
        requirements: ['Valid Solo Parent ID'],
        discountType: 'SOLO_PARENT' as DiscountTypeCode,
    },
    INDIGENT: {
        code: 'Local Ordinance',
        name: 'Social Reform and Poverty Alleviation Act',
        maxPercentage: 20,
        description: 'For indigent families',
        requirements: ['Certificate of Indigency'],
        discountType: 'INDIGENT' as DiscountTypeCode,
    },
} as const;

// ============================================
// TYPE GUARDS
// ============================================

export const isResident = (payer: any): payer is Resident => {
    return payer && 'is_senior' in payer;
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
    ph_senior_id_verified: false,
    ph_pwd_id_verified: false,
    ph_solo_parent_id_verified: false,
    ph_indigent_id_verified: false,
    ph_legal_compliance_notes: '',
    billing_period: function (billing_period: any): string | number | readonly string[] | undefined {
        throw new Error("Function not implemented.");
    }
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