// resources/js/Pages/Admin/Fees/types.ts

// Define StringNumericLiteral type (option 1 - simplest)
type StringNumericLiteral = string | number | bigint;

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

export interface ResidentPrivilege {
    id: number;
    privilege_id: number;
    privilege: PrivilegeData;
    id_number?: string;
    verified_at?: string;
    expires_at?: string;
    status: 'pending' | 'active' | 'expired' | 'expiring_soon';
    discount_percentage?: number;
}

export interface Fee {
    amount: StringNumericLiteral;
    id: number;
    fee_code: string;
    fee_type_id: number;
    payer_type: string;
    payer_name: string;
    contact_number?: string;
    address?: string;
    purok: string;
    zone?: string;
    purpose?: string;
    issue_date: string;
    due_date: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    status_display?: string;
    payment_date?: string;
    payment_method?: string;
    or_number?: string;
    transaction_reference?: string;
    certificate_number?: string;
    valid_from?: string;
    valid_until?: string;
    property_description?: string;
    business_type?: string;
    area?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
    computation_details?: string;
    requirements_submitted?: string;
    remarks?: string;
    waiver_reason?: string;
    created_at: string;
    updated_at: string;
    cancelled_at?: string;
    
    fee_type?: {
        id: number;
        code: string;
        name: string;
        description?: string;
        base_amount: number;
        amount_type: string;
        is_discountable: boolean;
        has_surcharge: boolean;
        surcharge_percentage?: number;
        has_penalty: boolean;
        penalty_percentage?: number;
        requirements?: string[];
        [key: string]: any;
    };
    
    resident?: {
        id: number;
        name: string;
        full_name: string;
        contact_number?: string;
        email?: string;
        address?: string;
        purok: string;
        zone?: string;
        birth_date?: string;
        gender?: string;
        occupation?: string;
        profile_photo?: string;
        privileges?: ResidentPrivilege[];
        privileges_list?: any[];
        active_privileges_list?: any[];
    };
    
    household?: {
        id: number;
        name: string;
        address: string;
        household_head_name: string;
        contact_number?: string;
        purok: string;
        zone?: string;
        head_privileges?: any[];
    };
    
    business?: {
        id: number;
        business_name: string;
        owner_name: string;
        business_type: string;
        address: string;
        contact_number?: string;
        email?: string;
        purok: string;
        zone?: string;
        owner_id?: number;
    };
    
    issued_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    
    collected_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    
    approved_by_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

export interface PaymentDiscount {
    id: number;
    rule_name: string;
    discount_type: string | null;
    amount: number;
    formatted_amount: string;
    id_number: string | null;
    verified_by: string;
    privilege_code?: string;
}

export interface PaymentHistory {
    id: number;
    amount: number;
    formatted_amount: string;
    subtotal: number;
    formatted_subtotal: string;
    discounts: PaymentDiscount[];
    total_discount: number;
    formatted_total_discount: string;
    description: string;
    payment_date: string | null;
    or_number: string | null;
    payment_method: string | null;
    reference_number: string | null;
    status: string;
    received_by: string;
    created_at: string | null;
    applied_privileges?: Array<{
        code: string;
        name: string;
        id_number?: string;
        amount: number;
    }>;
}

export interface RelatedFee {
    id: number;
    fee_code: string;
    fee_type_name: string;
    total_amount: string;
    status: string;
    status_label?: string;
    issue_date: string;
}

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