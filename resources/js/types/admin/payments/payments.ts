// types/admin/payments/payments.ts

// ==================== BULK OPERATION TYPES ====================

export type BulkOperationType = 
    | 'export' 
    | 'print' 
    | 'delete' 
    | 'update_status' 
    | 'send_receipt' 
    | 'mark_cleared' 
    | 'export_csv'
    | 'generate_qr'
    | 'copy_data';

// ==================== PAYMENT ITEM TYPES ====================

export interface PaymentItem {
    id: number | string;
    fee_id?: string;
    fee_name: string;
    fee_code: string;
    description?: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    category: string;
    period_covered?: string;
    months_late?: number;
    metadata?: {
        is_clearance_fee?: boolean;
        clearance_request_id?: number;
        clearance_type_id?: number;
        clearance_type_code?: string;
        clearance_type_name?: string;
        reference_number?: string;
        purpose?: string;
        specific_purpose?: string;
        [key: string]: any;
    };
}

// ==================== PAYMENT TYPES ====================

export interface Payment {
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household' | 'business';
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    payment_date: string;
    formatted_date?: string;
    period_covered?: string;
    payment_method: string;
    payment_method_display?: string;
    reference_number?: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_type?: string;
    total_amount: number;
    amount_paid: number;
    formatted_total?: string;
    formatted_subtotal?: string;
    formatted_surcharge?: string;
    formatted_penalty?: string;
    formatted_discount?: string;
    formatted_amount_paid?: string;
    formatted_change_due?: string;
    purpose?: string;
    remarks?: string;
    notes?: any;
    is_cleared: boolean;
    certificate_type?: string;
    validity_date?: string;
    collection_type: string;
    status: 'completed' | 'pending' | 'cancelled' | 'issued' | 'pending_payment';
    recorded_by?: number;
    recorded_by_name?: string;
    recorded_by_user_name?: string;
    created_at: string;
    updated_at: string;
    items?: PaymentItem[];
    recorder?: {
        id: number;
        name: string;
    };
}

// ==================== PAYMENT FORM DATA TYPES ====================

export interface PaymentFormData {
    photo_path: string | null;  // ← Make sure this is a property, not a method
    photo_url: string | null;    // ← Make sure this is a property, not a method
    amount_paid: number;
    payer_type: string;
    payer_id: string | number;
    payer_name: string;
    contact_number: string;
    address: string;
    household_number: string;
    purok: string;
    items: PaymentItem[];
    payment_date: string;
    period_covered: string;
    or_number: string;
    payment_method: string;
    reference_number: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_code: string;
    discount_id?: number;
    discount_type: string;
    total_amount: number;
    purpose: string;
    remarks: string;
    is_cleared: boolean;
    clearance_type: string;
    clearance_type_id: string | number;
    clearance_code: string;
    validity_date: string;
    collection_type: string;
    clearance_request_id?: number;
    verification_id_number?: string;
    verification_remarks?: string;
}

// ==================== OUTSTANDING FEE TYPES ====================

export interface OutstandingFee {
    fee_type: any;
    resident_id: string | number;
    household_id: string | number;
    business_id: string | number;
    id: number;

    resident_details?: any; 
    fee_id?: number;
    fee_type_id?: number;
    fee_name: string;
    fee_code: string;
    period_start: any;
    period_end: any;
    fee_type_name?: string;
    fee_type_category?: string;
    payer_type: string;
    business_name: any;
    business_type: any;
    contact_number: any;
    address: any;
    purok: any;
    payer_id: number;
    payer_name: any;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    amount_paid: number;
    balance: number;
    total_amount: number;
    status: any;
    purpose?: string;
    category?: string;
    period_covered?: string;
    billing_period?: string;
    months_late?: number;
    due_date?: string;
    applicableDiscounts?: any[];
    canApplyDiscount?: boolean;
}

// ==================== RESIDENT TYPES ====================

export interface Resident {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    contact_number: string;
    email?: string;
    address: string;
    purok: string;
    purok_id?: number;
    household_number: string;
    household_id?: number;
    age?: number;
    gender?: string;
    civil_status?: string;
    occupation?: string;
    birth_date?: string;
    status?: string;
    is_voter?: boolean;
    photo_path?: string | null;
    // Privilege related
    is_senior?: boolean;
    is_pwd?: boolean;
    is_solo_parent?: boolean;
    is_indigent?: boolean;
    privileges?: any[];
    privileges_count?: number;
    active_privileges_count?: number;
    has_privileges?: boolean;
    [key: string]: any;
}

// ==================== HOUSEHOLD TYPES ====================

export interface Household {
    id: number;
    household_number: string;
    head_name: string;
    head_id?: number;
    contact_number: string;
    email?: string;
    address: string;
    full_address?: string;
    purok: string;
    purok_id?: number;
    member_count?: number;
    members?: Array<{
        resident_id: number;
        name: string;
        relationship: string;
        is_head: boolean;
        age?: number;
        gender?: string;
        [key: string]: any;
    }>;
    has_discount_eligible_head?: boolean;
    head_privileges?: Array<{
        code: string;
        name: string;
        id_number?: string;
    }>;
    [key: string]: any;
}

// ==================== BUSINESS TYPES ====================

export interface Business {
    id: number;
    business_name: string;
    owner_name: string;
    owner_id?: number;
    contact_number: string;
    email?: string;
    address: string;
    purok: string;
    purok_id?: number;
    business_type?: string;
    business_type_label?: string;
    status?: 'active' | 'closed' | 'pending';
    permit_expiry_date?: string;
    is_permit_valid?: boolean;
    owner_has_privileges?: boolean;
    owner_privileges?: Array<{
        code: string;
        name: string;
        id_number?: string;
    }>;
    [key: string]: any;
}



// ==================== CLEARANCE TYPES ====================

export interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id: number;
    reference_number: string;
    purpose: string;
    specific_purpose?: string;
    fee_amount: string | number;
    formatted_fee?: string;
    status: string;
    status_display?: string;
    can_be_paid: boolean;
    already_paid: boolean;
    payer_type?: string;
    payer_id?: number;
    clearance_type?: {
        id: number;
        name: string;
        code: string;
        fee: string | number;
        formatted_fee: string;
        validity_days: number;
        processing_days: number;
        description: string;
        requires_payment?: boolean;
        requires_approval?: boolean;
        is_online_only?: boolean;
        is_discountable?: boolean;
        // Dynamic discount fields
        [key: string]: any;
    };
    resident?: {
        photo_path: any;
        photo_url: any;
        id: number;
        name: string;
        contact_number: string;
        address: string;
        purok: string;
        household_number: string;
    };
    applicableDiscounts?: any[];
    canApplyDiscount?: boolean;
}

// ==================== BACKEND FEE TYPES ====================

export interface BackendFee {
    resident_id: any;
    household_id: any;
    business_id: any;
    surcharge_amount: any;
    penalty_amount: any;
    discount_amount: any;
    amount_paid: any;
    total_amount: any;
    purpose: string | undefined;
    fee_type_name: string | undefined;
    fee_type_category: string | undefined;
    billing_period: string | undefined;
    period_start: undefined;
    period_end: undefined;
    business_name: any;
    business_type: any;
    contact_number: undefined;
    address: undefined;
    purok: undefined;
    applicableDiscounts: never[];
    canApplyDiscount: boolean;
    resident_details: any;
    id: number;
    fee_type_id?: number;
    fee_name: string;
    fee_code: string;
    amount: number;
    base_amount?: number;
    balance: number;
    payer_type: string;
    payer_id: number;
    payer_name?: string;
    category?: string;
    period_covered?: string;
    months_late?: number;
    status?: string;
    due_date?: string;
}

// ==================== DISCOUNT TYPES ====================

export interface DiscountRule {
    id: number;
    code: string;
    name: string;
    type: string;
    discount_type?: string;
    value_type?: 'percentage' | 'fixed';
    discount_value?: number;
    value?: number;
    minimum_purchase_amount?: number;
    maximum_discount_amount?: number;
    requires_verification: boolean;
    verification_document?: string;
    is_active?: boolean;
    description?: string;
    priority?: number;
    stackable?: boolean;
    effective_date?: string;
    expiry_date?: string;
    [key: string]: any;
}

// ==================== FEE TYPE TYPES ====================

export interface FeeType {
    id: number;
    name: string;
    code: string;
    category?: string;
    description?: string;
    base_amount?: number;
    has_surcharge?: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty?: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
    is_discountable?: boolean;
    validity_days?: number;
    is_active?: boolean;
    // Dynamic discount fields
    [key: string]: any;
}

// ==================== FILTERS AND STATS ====================

export interface Filters {
    search?: string;
    status?: string;
    payment_method?: string;
    payer_type?: string;
    clearance_type_id?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface Stats {
    total: number;
    today: number;
    monthly: number;
    total_amount: number;
    today_amount: number;
    monthly_amount: number;
}

// ==================== PAGINATION TYPES ====================

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    path?: string;
    per_page: number;
    to: number;
    total: number;
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
    data: Payment[];
    links?: PaginationLinks;
    meta: PaginationMeta;
}

// ==================== SELECTION TYPES ====================

export interface SelectionStats {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalAmount: number;
    avgAmount: number;
    cashPayments: number;
    digitalPayments: number;
    residents: number;
    households: number;
}

// ==================== OPTION TYPES ====================

export interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
}

export interface StatusOption {
    value: string;
    label: string;
    color?: string;
}

export interface PayerTypeOption {
    value: string;
    label: string;
}

// ==================== BULK OPERATION RESPONSE ====================

export interface BulkOperationResponse {
    success: boolean;
    message: string;
    updated_count?: number;
    errors?: string[];
}

// ==================== PAGE PROPS ====================

export interface PageProps {
    payments?: PaginationData;
    residents?: Resident[];
    households?: Household[];
    businesses?: Business[];
    fees?: BackendFee[];
    feeTypes?: FeeType[];
    discountRules?: DiscountRule[];
    discountTypes?: Record<string, string>;
    discountCodeToIdMap?: Record<string, number>;
    pre_filled_data?: any;
    clearance_request?: ClearanceRequest;
    clearanceTypes?: Record<string, string>;
    clearanceTypesDetails?: any[];
    clearance_requests?: ClearanceRequest[];
    selected_fee_details?: any;
    selected_fee_type_id?: number;
    payerClearanceRequests?: ClearanceRequest[];
    filters?: Filters;
    stats?: Stats;
    // Index signature to satisfy Inertia's PageProps constraint
    [key: string]: unknown;
}

// ==================== COMPONENT PROPS TYPES ====================

export interface LatePaymentSettingsProps {
    selectedFee: OutstandingFee;
    isLatePayment: boolean;
    setIsLatePayment: (value: boolean) => void;
    monthsLate: number;
    setMonthsLate: (value: number) => void;
    handleAddWithLateSettings: () => void;
    handleCancelLateSettings: () => void;
    onAddWithLateSettings?: () => void;
    onCancelLateSettings?: () => void;
}

export interface Fee {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    base_amount: number | string;
    category: 'tax' | 'clearance' | 'certificate' | 'service' | 'rental' | 'fine' | 'business' | 'document' | 'other';
    frequency: string;
    has_surcharge?: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty?: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
    validity_days?: number;
    applicable_to?: string[];
    is_active?: boolean;
    processing_days?: number;
}

export interface FeeItemProps {
    fee: Fee;
    handleFeeSelection: (fee: Fee) => void;
    isSelected?: boolean;
    showDetails?: boolean;
    compact?: boolean;
    disabled?: boolean;
}

// ==================== PAYER TYPE UNION ====================

export type PayerType = 
    | { type: 'resident'; data: Resident }
    | { type: 'household'; data: Household }
    | { type: 'business'; data: Business }
    | { type: 'clearance'; data: ClearanceRequest }
    | { type: 'fee'; data: BackendFee | OutstandingFee };

// ==================== PRIVILEGE TYPES (for consistency with previous file) ====================

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
    id: number;
    resident_id: number;
    privilege_id: number;
    privilege?: Privilege;
    id_number?: string;
    verified_at?: string | null;
    expires_at?: string | null;
    remarks?: string;
    discount_percentage?: number;
    status: 'pending' | 'active' | 'expired' | 'expiring_soon';
    is_active: boolean;
    code: any;
}

// ==================== RESIDENT DISCOUNT TYPES ====================

export interface ResidentDiscount {
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id: boolean;
    privilege_code?: string;
    expires_at?: any;
    
}