// types/admin/fees/fees.ts

// Base Fee interface
export interface Fee {
    name: any;
    description: any;
    surcharge_amount: number;
    discount_amount: number;
    cancelled_at: any;
    id: number;
    fee_type_id: number;
    resident_id: number;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'issued' | 'partial' | 'partially_paid';
    due_date: string;
    paid_date?: string | null;
    payment_method?: string | null;
    payment_reference?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    
    // Additional fields from the grid view
    fee_code?: string;
    code?: string;
    payer_type?: 'resident' | 'household' | 'business';
    type?: 'resident' | 'household' | 'business';
    payer_name?: string;
    contact_number?: string;
    purok?: string;
    issue_date?: string;
    amount_paid?: number;
    paid_amount?: number;
    balance?: number;
    household_id?: number;
    address?: string;
    total_amount?: number;
    certificate_number?: string;
    or_number?: string;
    
    // Relations
    fee_type?: FeeType;
    resident?: Resident;
    payments?: Payment[];
    
    // Computed fields
    is_overdue?: boolean;
    days_overdue?: number;
    penalty_amount?: number;
}

// Fee Type interface
export interface FeeType {
    fee_code: string;
    id: number;
    code: string;
    name: string;
    short_name?: string;
    description?: string;
    base_amount: number | string;
    amount_type: 'fixed' | 'percentage' | 'sliding_scale';
    frequency: 'one_time' | 'annual' | 'quarterly' | 'monthly';
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    category?: string;
    document_category_id?: number | null;
    is_discountable?: boolean;
    surcharge_description?: string;
    penalty_description?: string;
    
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
}

// Resident interface
export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    email?: string;
    phone?: string;
    contact_number?: string;
    purok?: string;
    address?: string;
    is_senior?: boolean;
    is_pwd?: boolean;
    is_solo_parent?: boolean;
    is_indigent?: boolean;
    full_name?: string;
    privileges?: PrivilegeData[];
}

// Household interface - ONLY DECLARE ONCE
export interface Household {
    id: number;
    name: string;
    contact_number?: string;
    phone?: string;
    purok?: string;
    address?: string;
    head_id?: number;
    head_name?: string;
    member_count?: number;
    head_privileges?: PrivilegeData[];
    privileges?: PrivilegeData[];
    created_at?: string;
    updated_at?: string;
}

// Privilege Data interface
export interface PrivilegeData {
    id: number;
    name: string;
    code: string;
    status: 'active' | 'expiring_soon' | 'expired' | 'inactive';
    discount_percentage?: number;
    valid_until?: string;
    description?: string;
    type?: 'senior' | 'pwd' | 'solo_parent' | 'indigent' | 'other';
}

// Document Category interface
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

// Discount Rule interface
export interface DiscountRule {
    id: number;
    discount_type: string;
    name: string;
    value_type: 'percentage' | 'fixed';
    discount_value: number;
    description?: string;
    verification_document?: string;
    applies_to_fee_type_ids?: number[];
    applies_to_all_fee_types?: boolean;
    is_active?: boolean;
    sort_order?: number;
}

// Discount Info interface
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

// Payment interface
export interface Payment {
    id: number;
    fee_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
    notes?: string;
    created_at: string;
}

// Pagination data
export interface PaginationData {
    data: Fee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links?: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Filter types
export interface Filters {
    search?: string;
    status?: string;
    category?: string;
    purok?: string;
    from_date?: string;
    to_date?: string;
    date_from?: string;
    date_to?: string;
    min_amount?: string;  
    max_amount?: string;  
    amount_min?: number;
    amount_max?: number;
    has_discount?: boolean;
    is_overdue?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
   due_date_range?: string;  
}

export interface FilterState {
    search: string;
    status: string;
    category: string;
    purok: string;
    date_from: string;
    date_to: string;
    amount_min: string;
    amount_max: string;
}

// Stats interface
export interface Stats {
    total: number;
    total_amount: number;
    collected: number;
    pending: number;
    overdue_count: number;
    due_soon_count: number;
    today_count: number;
    today_amount: number;
    today_collected: number;
    this_month_count: number;
    this_month_amount: number;
    this_month_collected: number;
    status_counts: Record<string, number>;
    category_totals: Record<string, number>;
    issued_count?: number;
    partially_paid_count?: number;
    waived_count?: number;
    // Legacy fields for compatibility
    total_fees?: number;
    paid_amount?: number;
    pending_amount?: number;
    overdue_amount?: number;
    collection_rate?: number;
    active_fees?: number;
    overdue_fees?: number;
    paid_fees?: number;
    pending_fees?: number;
    by_status?: Record<string, number>;
    by_category?: Record<string, number>;
    by_purok?: Record<string, number>;
    recent_payments?: Payment[];
}

// Selection stats
export interface SelectionStats {
    total: number;
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    overdueCount: number;
    paidCount: number;
    pendingCount: number;
    issuedCount: number;
    partiallyPaidCount: number;
    withCertificates: number;
    withReceipts: number;
    residents: number;
    households: number;
    businesses: number;
    // For compatibility
    paid?: number;
    pending?: number;
    overdue?: number;
    paidAmount?: number;
    pendingAmount?: number;
    overdueAmount?: number;
    byStatus?: Record<string, number>;
}

// Bulk operation types
export type BulkOperation = 
    | 'delete' 
    | 'activate'        
    | 'deactivate'      
    | 'mark_paid' 
    | 'mark_pending' 
    | 'send_reminders' 
    | 'export' 
    | 'export_csv' 
    | 'apply_penalties' 
    | 'waive_penalties'
    | 'print'          
    | 'copy_data';

export type BulkEditField = 
    | 'status' 
    | 'due_date' 
    | 'payment_method'
    | 'notes';

export type SelectionMode = 'page' | 'filtered' | 'all';

// Flash message types
export interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

// Permissions interface
export interface Permissions {
    can_edit: boolean;
    can_delete: boolean;
    can_record_payment: boolean;
    can_cancel: boolean;
    can_waive: boolean;
    can_view_audit?: boolean;
    can_approve?: boolean;
    can_collect?: boolean;
}

// Props for the Fees Index page
export interface FeesIndexProps {
    fees: PaginationData;
    filters: Filters;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    puroks: string[];
    stats: Stats;
    flash?: FlashMessages;
}

// Props for the Fees Show page
export interface FeesShowProps {
    fee: Fee;
    fee_type: FeeType;
    resident: Resident;
    payments: Payment[];
    similar_fees?: Fee[];
    stats?: {
        total_paid: number;
        total_penalties: number;
        payment_history: Payment[];
    };
}

// Props for the Fees Create page
export interface FeesCreateProps {
    fee_types: FeeType[];  // Note: plural with underscore
    residents: Resident[];
    households?: Household[];
    puroks: string[];
    default_resident_id?: number;
    default_fee_type_id?: number;
    default_household_id?: number;
    errors?: Record<string, string>;
    discountRules?: DiscountRule[];
    documentCategories?: DocumentCategory[];
    initialData?: Partial<BulkFeeFormData>;
    duplicateFrom?: FeeType | null;
    allPrivileges?: PrivilegeData[];
    preselectedResident?: Resident | null;
    preselectedHousehold?: Household | null;
}

// Bulk Fee Form Data interface
export interface BulkFeeFormData extends FeeFormData {
    payer_type: string;
    household_id: string;
    business_name: string;
    address: string;
    zone: string;
    billing_period: string;
    period_start: string;
    period_end: string;
    issue_date: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    purpose: string;
    property_description: string;
    business_type: string;
    area: number;
    remarks: string;
    requirements_submitted: string[];
    ph_legal_compliance_notes: string;
    bulk_type: 'none' | 'residents' | 'households' | 'custom';
    selected_resident_ids: string[];
    selected_household_ids: string[];
    custom_payers: Array<{
        id: string;
        name: string;
        contact_number: string;
        purok: string;
        address: string;
        type: 'custom';
    }>;
    apply_to_all_residents: boolean;
    apply_to_all_households: boolean;
    filter_purok: string;
    filter_discount_eligible: boolean;
    payer_name: string;
    contact_number: string;
    purok: string;
}

// Props for the Fees Edit page
export interface FeesEditProps {
    fee: Fee;
    fee_type: FeeType;
    resident: Resident;
    fee_types: FeeType[];
    residents: Resident[];
    puroks: string[];
    errors?: Record<string, string>;
}

// Form data for create/edit
export interface FeeFormData {
    fee_type_id: number;
    resident_id: number;
    amount: number;
    due_date: string;
    status: string;
    payment_method?: string;
    payment_reference?: string;
    notes?: string;
    apply_discounts?: boolean;
    senior_discount?: boolean;
    pwd_discount?: boolean;
    solo_parent_discount?: boolean;
    indigent_discount?: boolean;
}

// Validation and calculation utilities
export const calculateDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (today <= due) return 0;
    
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return '₱0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numAmount);
};

export const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        partial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        partially_paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[status] || colors.pending;
};

export const getStatusIcon = (status: string): React.ReactNode => {
    return null;
};

export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        tax: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        clearance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        permit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        donation: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[category] || colors.fee;
};

export const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        tax: 'Tax',
        clearance: 'Clearance',
        permit: 'Permit',
        fee: 'Fee',
        donation: 'Donation'
    };
    return labels[category] || category;
};

// Helper function to parse number safely
export const parseNumber = (value: any): number => {
    if (value === undefined || value === null) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
};

// Helper function to safely convert to string
export const safeString = (value: any): string => {
    if (value === undefined || value === null) return '';
    return String(value);
};