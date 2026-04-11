import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface PaymentItem {
    id: number;
    fee_id?: number;
    clearance_request_id?: number;
    fee_name: string;
    fee_code: string;
    description?: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    category: string;
    period_covered?: string;
    months_late?: number;
    fee_metadata?: Record<string, any>;
    fee?: FeeDetails;
    clearanceRequest?: ClearanceRequest;
}

export interface RelatedPayment {
    id: number;
    or_number: string;
    payment_date: string;
    formatted_date: string;
    total_amount: number;
    formatted_total: string;
    status: string;
    status_display: string;
    recorder?: {
        id: number;
        name: string;
    };
}

export interface PayerDetails {
    id: number;
    name: string;
    type: string;
    contact_number?: string;
    email?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    household?: {
        id: number;
        household_number: string;
        purok: string;
    };
    members?: Array<{
        id: number;
        name: string;
        relationship: string;
        resident?: {
            id: number;
            name: string;
        };
    }>;
}

export interface ClearanceRequest {
    amount_paid: number;
    discount_amount: number;
    id: number;
    reference_number: string;
    clearance_number?: string;
    purpose?: string;
    specific_purpose?: string;
    urgency: string;
    urgency_display: string;
    needed_date?: string;
    formatted_needed_date?: string;
    fee_amount: number;
    formatted_fee: string;
    status: string;
    status_display: string;
    issue_date?: string;
    formatted_issue_date?: string;
    valid_until?: string;
    formatted_valid_until?: string;
    days_remaining?: number;
    is_valid: boolean;
    remarks?: string;
    admin_notes?: string;
    additional_requirements?: string;
    requirements_met?: string[];
    cancellation_reason?: string;
    processed_at?: string;
    formatted_processed_at?: string;
    created_at: string;
    formatted_created_at?: string;
    clearance_type?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
    resident?: {
        id: number;
        name: string;
        household?: {
            id: number;
            household_number: string;
            purok: string;
        };
    };
    issuing_officer?: {
        id: number;
        username: string;
        email?: string;
    };
    processed_by?: {
        id: number;
        username: string;
        email?: string;
    };
    documents?: Array<{
        id: number;
        file_path: string;
        file_name: string;
        document_type: string;
        created_at: string;
    }>;
    estimated_completion_date?: string;
}

export interface FeeDetails {
    fee_type_name: string | undefined;
    id: number;
    fee_code: string;
    or_number?: string;
    fee_type?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
    payer_type: string;
    resident?: {
        id: number;
        name: string;
        household?: {
            id: number;
            household_number: string;
            purok: string;
        };
    };
    household?: {
        id: number;
        household_number: string;
        purok: string;
    };
    business_name?: string;
    billing_period?: string;
    period_start?: string;
    formatted_period_start?: string;
    period_end?: string;
    formatted_period_end?: string;
    issue_date?: string;
    formatted_issue_date?: string;
    due_date?: string;
    formatted_due_date?: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    purpose?: string;
    property_description?: string;
    business_type?: string;
    area?: number;
    remarks?: string;
    status: string;
    certificate_number?: string;
    valid_from?: string;
    formatted_valid_from?: string;
    valid_until?: string;
    formatted_valid_until?: string;
    waiver_reason?: string;
    requirements_submitted?: string[];
    is_overdue?: boolean;
    days_overdue?: number;
    payment_percentage?: number;
    issued_by?: {
        id: number;
        name: string;
    };
    collected_by?: {
        id: number;
        name: string;
    };
    created_by?: {
        id: number;
        name: string;
    };
    cancelled_at?: string;
}

export interface DiscountDetail {
    id: number | null;
    type: string;
    code?: string | null;
    amount: number;
    formatted_amount: string;
    id_number?: string | null;
    verified_by?: string | null;
    verified_at?: string | null;
    id_presented?: boolean;
}

export interface Payment {
    // Fixed: Replaced StringNumericLiteral with string
    amount: number | bigint | string; 
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household' | 'business' | 'other';
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    payment_date: string;
    formatted_date: string;
    period_covered?: string;
    payment_method: string;
    discount_percentage?: number; 
    payment_method_display: string;
    payment_method_details: {
        name: string;
        icon: string;
        color: string;
    };
    reference_number?: string;
    subtotal: number;
    formatted_subtotal: string;
    surcharge: number;
    formatted_surcharge: string;
    penalty: number;
    formatted_penalty: string;
    discount: number;
    formatted_discount: string;
    discount_type?: string;
    discount_code?: string;
    total_amount: number;
    formatted_total: string;
    amount_paid?: number;
    formatted_amount_paid?: string;
    purpose?: string;
    remarks?: string;
    is_cleared: boolean;
    is_cleared_display: string;
    certificate_type?: string;
    certificate_type_display?: string;
    validity_date?: string;
    formatted_validity_date?: string;
    collection_type: string;
    collection_type_display: string;
    status: 'completed' | 'pending' | 'cancelled' | 'refunded';
    status_display: string;
    method_details?: Record<string, any>;
    recorded_by?: number;
    recorder?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    formatted_created_at: string;
    updated_at: string;
    formatted_updated_at: string;
    items: PaymentItem[];
    payer?: PayerDetails | null;
    has_surcharge: boolean;
    has_penalty: boolean;
    has_discount: boolean;
    corrected_total?: number;
    formatted_corrected_total?: string;
}

// Fixed: Extended InertiaPageProps to satisfy the constraint in Show.tsx
export interface PageProps extends InertiaPageProps {
    payment: Payment;
    clearanceRequests: ClearanceRequest[];
    fees: FeeDetails[];
    payer: PayerDetails | null;
    relatedPayments: RelatedPayment[];
    paymentBreakdown: {
        subtotal: number;
        formatted_subtotal: string;
        surcharge: number;
        formatted_surcharge: string;
        penalty: number;
        formatted_penalty: string;
        discount: number;
        formatted_discount: string;
        total: number;
        formatted_total: string;
    };
    discountDetails?: DiscountDetail[];
    isClearancePayment: boolean;
    isFeePayment: boolean;
    hasClearanceRequests: boolean;
    hasFees: boolean;
    flash: {
        success?: string;
        error?: string;
    };
}