// app/Pages/Admin/Payments/types.ts

// Define Discount Rule types
export interface DiscountRule {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: string; // SENIOR, PWD, SOLO_PARENT, INDIGENT, VETERAN, etc.
    value_type: 'percentage' | 'fixed';
    discount_value: number;
    maximum_discount_amount: number | null;
    minimum_purchase_amount: number | null;
    priority: number;
    requires_verification: boolean;
    verification_document: string | null;
    applicable_to: string | null; // resident, household, business, all
    stackable: boolean;
    exclusive_with: string[] | null;
    effective_date: string | null;
    expiry_date: string | null;
    formatted_value: string;
    status: string;
    type_label: string;
    is_expired: boolean;
}

export interface ResidentDiscount {
    type: 'senior' | 'pwd' | 'solo_parent' | 'indigent' | 'veteran' | 'government_employee';
    label: string;
    percentage: number;
    id_number?: string;
    has_id: boolean;
}

export interface FeeType {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    base_amount: number | string;
    category: string;
    frequency: string;
    has_senior_discount: boolean;
    senior_discount_percentage?: number;
    has_pwd_discount: boolean;
    pwd_discount_percentage?: number;
    has_solo_parent_discount: boolean;
    solo_parent_discount_percentage?: number;
    has_indigent_discount: boolean;
    indigent_discount_percentage?: number;
    has_surcharge: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
    validity_days?: number;
}

export interface BackendFee {
    id: string | number;
    fee_type_id: string | number;
    fee_code: string;
    payer_type: 'resident' | 'household' | 'business';
    resident_id: string | number | null;
    household_id: string | number | null;
    business_name: string | null;
    payer_name: string;
    contact_number: string | null;
    address: string | null;
    purok: string | null;
    zone: string | null;
    billing_period: string | null;
    period_start: string | null;
    period_end: string | null;
    issue_date: string;
    due_date: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    discount_type: string | null;
    total_amount: number;
    status: 'pending' | 'issued' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled' | 'waived';
    amount_paid: number | null;
    balance: number;
    purpose: string | null;
    fee_type_name?: string;
    fee_type_category?: string;
    [key: string]: any;
}

export interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    payer_name: string;
    payer_type: 'resident' | 'household' | 'business';
    payer_id?: string | number;
    due_date: string;
    base_amount: string | number;
    surcharge_amount: string | number;
    penalty_amount: string | number;
    discount_amount: string | number;
    amount_paid: string | number;
    balance: string | number;
    total_amount?: string | number;
    status: string;
    purpose?: string;
    fee_type_name?: string;
    fee_type_category?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
    category?: string;
    applicableDiscounts?: Array<{
        type: string;
        label: string;
        percentage: number;
        applicablePercentage: number;
        has_id: boolean;
        id_number?: string;
    }>;
    canApplyDiscount?: boolean;
    // Fee type discount settings from backend
    fee_type_has_senior_discount?: boolean;
    fee_type_senior_discount_percentage?: number;
    fee_type_has_pwd_discount?: boolean;
    fee_type_pwd_discount_percentage?: number;
    fee_type_has_solo_parent_discount?: boolean;
    fee_type_solo_parent_discount_percentage?: number;
    fee_type_has_indigent_discount?: boolean;
    fee_type_indigent_discount_percentage?: number;
}

export interface ClearanceType {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    fee: number | string;
    formatted_fee?: string;
    processing_days?: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    eligibility_criteria?: string;
    purpose_options?: string[];
    // Discount eligibility for clearance types
    has_senior_discount?: boolean;
    senior_discount_percentage?: number;
    has_pwd_discount?: boolean;
    pwd_discount_percentage?: number;
    has_solo_parent_discount?: boolean;
    solo_parent_discount_percentage?: number;
    has_indigent_discount?: boolean;
    indigent_discount_percentage?: number;
}

export interface ClearanceRequest {
    id: string | number;
    resident_id: string | number;
    clearance_type_id: string | number;
    reference_number: string;
    purpose: string;
    specific_purpose?: string;
    fee_amount: number | string;
    status: string;
    clearance_type?: ClearanceType;
    resident?: Resident;
    can_be_paid?: boolean;
    already_paid?: boolean;
}

export interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    outstanding_fees?: OutstandingFee[];
    household_id?: string | number;
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
    discount_eligibility_list?: ResidentDiscount[];
    has_special_classification?: boolean;
    is_senior?: boolean;
    is_pwd?: boolean;
    is_solo_parent?: boolean;
    is_indigent?: boolean;
    is_veteran?: boolean;
    is_government_employee?: boolean;
}

export interface Household {
    id: string | number;
    head_name: string;
    contact_number?: string;
    address: string;
    household_number: string;
    purok?: string;
    outstanding_fees?: OutstandingFee[];
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
}

export interface PaymentItem {
    id: number;
    fee_id: string | number;
    fee_name: string;
    fee_code: string;
    description: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    category: string;
    period_covered: string;
    months_late: number;
    metadata?: {
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
        clearance_type_id?: string | number;
        clearance_type_code?: string;
        is_outstanding_fee?: boolean;
        original_fee_id?: string | number;
        payer_type?: string;
        payer_id?: string | number;
        original_fee_data?: {
            base_amount: number;
            surcharge_amount: number;
            penalty_amount: number;
            discount_amount: number;
            amount_paid: number;
            balance: number;
            total_amount?: number;
        };
        appliedDiscount?: {
            rule_id?: number; // ID of the applied discount rule
            code?: string; // Discount rule code
            type?: string; // Discount type for backward compatibility
            percentage?: number; // Applied percentage
            amount: number; // Discount amount
            residentId?: string | number;
            residentName?: string;
            verification_id?: string; // ID number used for verification
            verified_at?: string; // Timestamp of verification
        };
    };
}

export interface PaymentFormData {
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
    discount_code: string; // Changed from discount_type - stores the discount rule code
    discount_id?: number; // ID of the applied discount rule
    discount_type: string; // Kept for backward compatibility
    total_amount: number;
    purpose: string;
    remarks: string;
    is_cleared: boolean;
    clearance_type: string;
    clearance_type_id: string | number;
    clearance_code: string;
    validity_date: string;
    collection_type: 'manual' | 'system';
    clearance_request_id?: string | number;
    // Verification fields for discounts that require it
    verification_id_number?: string;
    verification_remarks?: string;
}

export interface PreFilledFeeData {
    fee_id?: number;
    fee_type_id?: number;
    payer_type?: string;
    payer_id?: number;
    payer_name?: string;
    contact_number?: string;
    address?: string;
    purok?: string;
    fee_code?: string;
    fee_name?: string;
    description?: string;
    total_amount?: number;
    balance?: number;
    clearance_request_id?: string | number;
    clearance_type_id?: string | number;
    clearance_type?: string;
    clearance_code?: string;
}

export interface SelectedFeeDetails {
    id: string | number;
    fee_code: string;
    fee_type_id: string | number;
    fee_type_name: string;
    fee_type_category: string;
    payer_name: string;
    payer_type: string;
    payer_id: string | number;
    contact_number: string;
    address: string;
    purok: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    total_discounts: number;
    total_amount: number;
    balance: number;
    status: string;
    issue_date: string;
    due_date: string;
    purpose: string;
    remarks: string;
    // New discount fields
    applicable_discounts?: Array<{
        type: string;
        label: string;
        percentage: number;
        id_number?: string;
        has_id: boolean;
    }>;
    discount_eligibility_text?: string;
    resident_discount_info?: {
        id: string | number;
        name: string;
        is_senior: boolean;
        is_pwd: boolean;
        is_solo_parent: boolean;
        is_indigent: boolean;
        has_special_classification: boolean;
        discount_eligibility_list: ResidentDiscount[];
    };
    // Fee type discount settings
    fee_type_has_senior_discount?: boolean;
    fee_type_senior_discount_percentage?: number;
    fee_type_has_pwd_discount?: boolean;
    fee_type_pwd_discount_percentage?: number;
    fee_type_has_solo_parent_discount?: boolean;
    fee_type_solo_parent_discount_percentage?: number;
    fee_type_has_indigent_discount?: boolean;
    fee_type_indigent_discount_percentage?: number;
}

export interface PageProps {
    residents: Resident[];
    households: Household[];
    fees: BackendFee[];
    feeTypes?: FeeType[];
    discountRules?: DiscountRule[]; // Added: Full discount rule data
    discountTypes?: Record<string, string>; // For dropdown display (kept for compatibility)
    discountCodeToIdMap?: Record<string, number>; // Added: Map discount codes to IDs
    pre_filled_data?: PreFilledFeeData;
    clearance_request?: ClearanceRequest | null;
    clearance_fee_type?: any;
    clearanceTypes?: Record<string, string>;
    clearanceTypesDetails?: ClearanceType[];
    clearance_requests?: ClearanceRequest[];
    // New properties for discount eligibility
    selected_fee_details?: SelectedFeeDetails | null;
    selected_fee_type_id?: string | number;
}

// Utility type for discount application
export interface DiscountApplication {
    rule: DiscountRule;
    amount: number;
    verification_id?: string;
    verified_at?: string;
}

// Type for discount calculation result
export interface DiscountCalculationResult {
    discountAmount: number;
    appliedRule?: DiscountRule;
    items: PaymentItem[];
    subtotal: number;
    surcharge: number;
    penalty: number;
    total: number;
}