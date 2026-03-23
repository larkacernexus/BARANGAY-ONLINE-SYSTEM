// types/portal/clearance/clearance.types.ts

// Add these type exports at the top
export type ClearanceStatus = 'pending' | 'processing' | 'ready_for_payment' | 'issued' | 'cancelled' | 'rejected';
export type UrgencyLevel = 'normal' | 'rush' | 'express';

export interface DocumentType {
    id: number;
    name: string;
    code?: string;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ClearanceDocument {
    id: number;
    file_path: string;
    file_name: string;
    original_name?: string;
    description?: string;
    file_size: number;
    file_type?: string;
    mime_type?: string;
    is_verified: boolean;
    document_type_id?: number;
    clearance_request_id: number;
    created_at: string;
    updated_at: string;
    document_type?: DocumentType;
}

export interface Payment {
    id: number;
    or_number: string;
    payment_method: string;
    payment_method_display?: string;
    reference_number?: string;
    total_amount: number | string;
    formatted_total?: string;
    payment_date: string;
    status: string;
    payer_name: string;
    purpose: string;
    remarks?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PaymentItem {
    id: number;
    payment_id: number;
    clearance_request_id: number;
    fee_name: string;
    fee_code: string;
    base_amount: number | string;
    surcharge: number | string;
    penalty: number | string;
    total_amount: number | string;
    formatted_total?: string;
    description?: string;
    category: string;
    period_covered?: string;
    created_at: string;
    updated_at: string;
    payment?: Payment;
}

export interface StatusHistory {
    id: number;
    clearance_request_id: number;
    status: ClearanceStatus; // Use the exported type
    remarks?: string;
    created_at: string;
    updated_at: string;
    causer?: {
        id: number;
        name: string;
        type: string;
    };
}

export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description?: string;
    fee: number | string;
    processing_days: number;
    validity_days?: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    household_id: number;
    contact_number?: string;
    email?: string;
    address?: string;
    profile_photo?: string;
}

export interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id?: number;
    reference_number: string;
    clearance_number?: string;
    status: ClearanceStatus; // Use the exported type
    purpose: string;
    specific_purpose?: string;
    urgency: UrgencyLevel; // Use the exported type
    needed_date: string;
    additional_requirements?: string;
    fee_amount: number | string;
    issue_date?: string;
    valid_until?: string;
    remarks?: string;
    issuing_officer_name?: string;
    created_at: string;
    updated_at: string;
    
    clearance_type?: ClearanceType;
    resident?: Resident;
    documents?: ClearanceDocument[];
    status_history?: StatusHistory[];
    payment_items?: PaymentItem[];
}

export interface ClearanceFilters {
    search?: string;
    status?: ClearanceStatus; // Use the exported type
    clearance_type?: string;
    urgency?: UrgencyLevel; // Use the exported type
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ClearanceStats {
    total: number;
    pending: number;
    processing: number;
    ready_for_payment: number;
    issued: number;
    cancelled: number;
    rejected: number;
    total_fees_collected: number;
    average_processing_days: number;
}