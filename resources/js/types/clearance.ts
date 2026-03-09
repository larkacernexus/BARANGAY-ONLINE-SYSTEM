// types/clearance.ts

export interface ClearanceRequest {
    amount_paid: number;
    or_number: boolean;
    payment_date(payment_date: any): import("react").ReactNode;
    payment_status: string;
    id: number;
    resident_id: number;
    clearance_type_id: number;
    
    // Identification numbers
    reference_number: string;
    clearance_number?: string;
    
    // Request details
    purpose: string;
    specific_purpose?: string;
    urgency: 'normal' | 'rush' | 'express';
    urgency_display: string;
    
    // Financial details
    fee_amount: number;
    formatted_fee: string;
    
    // Dates
    needed_date?: string;
    issue_date?: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
    processed_at?: string;
    
    // Additional information
    additional_requirements?: string;
    requirements_met?: string[];
    admin_notes?: string;
    remarks?: string;
    cancellation_reason?: string;
    
    // Status
    status: 'pending' | 'pending_payment' | 'processing' | 'approved' | 'issued' | 'rejected' | 'cancelled' | 'expired';
    status_display: string;
    
    // Officer information
    issuing_officer_name?: string;
    issuing_officer_id?: number;
    processed_by?: number;
    requested_by_user_id?: number;
    
    // Relationships
    resident?: Resident;
    clearance_type?: ClearanceType;
    documents?: Document[];
    payment_item?: PaymentItem;
    
    // Calculated fields
    estimated_completion_date?: string;
    formatted_estimated_completion_date?: string;
    formatted_issue_date?: string;
    formatted_valid_until?: string;
    formatted_created_at?: string;
    formatted_updated_at?: string;
    formatted_processed_at?: string;
    formatted_needed_date?: string;
    
    // Payment status helpers
    is_payment_required?: boolean;
    is_payment_pending?: boolean;
    is_payment_paid?: boolean;
    days_since_created?: number;
    days_until_needed?: number;
    
    // Payment object (if exists)
    payment?: Payment;
}

export interface Resident {
    id: number;
    full_name: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix?: string;
    address: string;
    contact_number?: string;
    email?: string;
    birth_date?: string;
    formatted_birth_date?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    gender_display?: string;
    civil_status?: 'single' | 'married' | 'widowed' | 'separated' | 'divorced';
    civil_status_display?: string;
    occupation?: string;
    photo_path?: string;
    initials?: string;
}

export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description?: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    eligibility_criteria?: any;
    purpose_options?: string[];
}

export interface Document {
    id: number;
    clearance_request_id: number;
    document_type_id?: number;
    
    // File information
    name: string;
    description?: string;
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_file_size: string;
    file_type?: string;
    mime_type?: string;
    extension?: string;
    
    // Status
    is_verified: boolean;
    status?: 'pending' | 'verified' | 'rejected';
    
    // URLs
    url: string;
    thumbnail_url?: string;
    
    // Dates
    uploaded_at: string;
    formatted_uploaded_at: string;
    verified_at?: string;
    formatted_verified_at?: string;
    
    // Type information
    document_type?: DocumentType;
    
    // Helpers
    is_image: boolean;
    is_pdf: boolean;
}

export interface DocumentType {
    id: number;
    name: string;
    description?: string;
    is_required: boolean;
    file_types?: string[];
    max_size?: number; // in bytes
}

export interface Payment {
    id: number;
    
    // Receipt information
    or_number: string;
    reference_number?: string;
    
    // Financial details
    total_amount: number;
    formatted_amount: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_type?: string;
    
    // Payment details
    payment_method: 'cash' | 'gcash' | 'maya' | 'bank' | 'check' | 'online_banking' | 'others';
    payment_method_display: string;
    payment_date: string;
    paid_at: string;
    formatted_paid_at: string;
    formatted_payment_date: string;
    
    // Payer information
    payer_name: string;
    payer_type: 'resident' | 'household' | 'business' | 'other';
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    
    // Purpose and remarks
    purpose: string;
    remarks?: string;
    period_covered?: string;
    
    // Status
    status: 'pending' | 'completed' | 'cancelled' | 'refunded';
    status_display: string;
    
    // Administrative
    is_cleared: boolean;
    validity_date?: string;
    collection_type: 'manual' | 'system';
    recorded_by: number;
    
    // Dates
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    
    // Method details (for digital payments)
    method_details?: any;
}

export interface PaymentItem {
    id: number;
    payment_id: number;
    clearance_request_id: number;
    
    // Financial details
    amount: number;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    
    // Item description
    description: string;
    fee_name?: string;
    fee_code?: string;
    category?: string;
    
    // Dates
    created_at: string;
    updated_at?: string;
}

export interface ActivityLog {
    id: number;
    description: string;
    event?: string;
    properties?: any;
    created_at: string;
    formatted_date: string;
    user?: {
        id: number;
        name: string;
        email?: string;
        photo_path?: string;
        initials: string;
    };
    icon?: string;
    color?: string;
}

export interface StatusHistory {
    id: number;
    clearance_request_id: number;
    status: string;
    remarks?: string;
    created_by: string;
    created_at: string;
}

export interface OfficerNote {
    id: number;
    clearance_request_id: number;
    content: string;
    created_by: string;
    created_at: string;
}

// Helper types for frontend display
export interface DocumentStats {
    total: number;
    verified: number;
    pending: number;
    rejected?: number;
}

export interface ClearancePermissions {
    canEdit: boolean;
    canDelete: boolean;
    canProcess: boolean;
    canIssue: boolean;
    canApprove: boolean;
    canPrint: boolean;
    canVerifyPayment: boolean;
    canAssignOfficer: boolean;
    canViewDocuments: boolean;
    canUploadDocuments: boolean;
}

// For the show page props
export interface ShowClearanceProps {
    clearance: ClearanceRequest;
    activityLogs?: ActivityLog[];
    canEdit: boolean;
    canDelete: boolean;
    canProcess: boolean;
    canIssue: boolean;
    canApprove: boolean;
    canPrint: boolean;
}

// For document viewer props
export interface DocumentViewerProps {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
    onVerify?: (documentId: number) => void;
    onReject?: (documentId: number, notes: string) => void;
    canVerify?: boolean;
}

// Status badge variants mapping
export type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success";

// Urgency badge variants mapping
export type UrgencyVariant = "default" | "secondary" | "destructive" | "outline";