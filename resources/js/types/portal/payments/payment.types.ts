// payment-show/types/payment.types.ts
export type PaymentStatus = 'completed' | 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded' | 'partially_paid';
export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'bank' | 'check' | 'online' | 'card';

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
    payment?: {
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
    };
}

export interface PaymentAttachment {
    id: number;
    file_name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    description?: string;
    uploaded_at: string;
    uploaded_by?: string;
    uploaded_by_name?: string;
}

export interface PaymentNote {
    id: number;
    content: string;
    created_at: string;
    is_public: boolean;
    created_by?: {
        id: number;
        name: string;
        role: string;
    };
}

export interface PaymentAuditLog {
    id: number;
    action: string;
    description: string;
    created_at: string;
    created_by?: {
        id: number;
        name: string;
        role: string;
    };
    ip_address?: string;
    user_agent?: string;
}

export interface PayerDetails {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    household_number?: string;
    purok?: string | { name?: string };
    zone?: string;
    barangay?: string | { name?: string };
    city?: string;
    province?: string;
    zip_code?: string;
    profile_photo?: string;
}

export interface RelatedPayment {
    id: number;
    or_number: string;
    purpose: string;
    total_amount: number;
    formatted_total: string;
    payment_date: string | null;
    formatted_date: string;
    status: PaymentStatus;
    payment_method: PaymentMethod;
}

export interface Payment {
    id: number;
    or_number: string;
    reference_number?: string;
    purpose: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    payment_date: string | null;
    due_date?: string | null;
    status: PaymentStatus;
    payment_method: PaymentMethod;
    payment_method_display: string;
    is_cleared: boolean;
    certificate_type?: string;
    certificate_type_display?: string;
    collection_type: string;
    collection_type_display: string;
    remarks?: string;
    formatted_total: string;
    formatted_date: string;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    
    payer_details?: PayerDetails;
    
    items?: PaymentItem[];
    attachments?: PaymentAttachment[];
    notes?: PaymentNote[];
    audit_log?: PaymentAuditLog[];
    related_payments?: RelatedPayment[];
    
    approved_by?: {
        id: number;
        name: string;
        role: string;
        date: string;
    };
    
    verified_by?: {
        id: number;
        name: string;
        role: string;
        date: string;
    };
    
    receipt?: {
        id: number;
        url: string;
        generated_at: string;
    };
    
    metadata?: Record<string, any>;
    tags?: string[];
    
    created_at: string | null;
    updated_at: string | null;
    created_by?: {
        id: number;
        name: string;
        role: string;
    };
}

export interface PageProps {
    payment: Payment;
    canEdit?: boolean;
    canDelete?: boolean;
    canPrint?: boolean;
    canDownload?: boolean;
    canVerify?: boolean;
    canRefund?: boolean;
    canAddNote?: boolean;
    canUploadAttachment?: boolean;
    canPayOnline?: boolean;
    paymentMethods?: Record<string, string>;
    error?: string;
}

// Optional: Add helper types for payment calculations
export interface PaymentSummary {
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total: number;
    formattedSubtotal: string;
    formattedSurcharge: string;
    formattedPenalty: string;
    formattedDiscount: string;
    formattedTotal: string;
}

export interface PaymentStatusConfig {
    label: string;
    color: string;
    bgColor: string;
    gradient: string;
    icon: React.ElementType;
}