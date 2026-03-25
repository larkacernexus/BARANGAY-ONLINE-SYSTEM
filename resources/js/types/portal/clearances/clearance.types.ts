// types/portal/clearance/clearance.types.ts

// ========== ENUMS & CONSTANTS ==========
export type ClearanceStatus = 'pending' | 'pending_payment' | 'processing' | 'approved' | 'issued' | 'rejected' | 'cancelled';

export type UrgencyLevel = 'normal' | 'rush' | 'express';

export type PaymentMethod = 'gcash' | 'maya' | 'bank_transfer' | 'over_the_counter' | 'cash' | 'check';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

// ========== DOCUMENT TYPES ==========
export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_required: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ClearanceDocument {
    id: number;
    clearance_request_id: number;
    document_type_id?: number;
    document_type?: DocumentType;
    file_path: string;
    file_name: string;
    original_name: string;
    description?: string;
    file_size: number;
    mime_type: string;
    is_image: boolean;
    verification_status: DocumentVerificationStatus;
    verified_at?: string;
    verified_by?: number;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

// ========== PAYMENT TYPES ==========
export interface Payment {
    id: number;
    or_number: string;
    payment_method: PaymentMethod;
    payment_method_display: string;
    reference_number?: string;
    total_amount: number;
    formatted_total: string;
    payment_date: string;
    status: PaymentStatus;
    payer_name: string;
    payer_email?: string;
    payer_contact?: string;
    purpose: string;
    remarks?: string;
    verified_by?: number;
    verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentItem {
    id: number;
    payment_id: number;
    clearance_request_id: number;
    clearance_request?: ClearanceRequest;
    fee_name: string;
    fee_code: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    formatted_total: string;
    description?: string;
    category: string;
    period_covered?: string;
    created_at: string;
    updated_at: string;
}

// ========== STATUS HISTORY ==========
export interface StatusHistory {
    id: number;
    clearance_request_id: number;
    status: ClearanceStatus;
    remarks?: string;
    created_at: string;
    updated_at: string;
    causer?: {
        id: number;
        name: string;
        type: 'resident' | 'admin' | 'system';
        role?: string;
    };
}

// ========== CLEARANCE TYPE ==========
export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    requires_documents: boolean;
    is_popular: boolean;
    is_active: boolean;
    purpose_options?: string[];
    document_requirements?: DocumentType[];
    created_at: string;
    updated_at: string;
}

// ========== RESIDENT ==========
export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name: string;
    household_id: number;
    contact_number?: string;
    email?: string;
    address?: string;
    profile_photo?: string;
    barangay_id?: number;
    purok_id?: number;
    created_at: string;
    updated_at: string;
}

// ========== HOUSEHOLD ==========
export interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id?: number;
    address?: string;
    purok?: string;
    total_members: number;
    created_at: string;
    updated_at: string;
}

// ========== CLEARANCE REQUEST ==========
export interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id: number;
    reference_number: string;
    clearance_number?: string;
    status: ClearanceStatus;
    purpose: string;
    specific_purpose?: string;
    urgency: UrgencyLevel;
    needed_date: string;
    additional_requirements?: string;
    fee_amount: number;
    formatted_fee: string;
    issue_date?: string;
    valid_until?: string;
    remarks?: string;
    issuing_officer_name?: string;
    rejection_reason?: string;
    cancelled_at?: string;
    cancelled_by?: number;
    created_at: string;
    updated_at: string;
    
    // Relations
    clearance_type?: ClearanceType;
    resident?: Resident;
    household?: Household;
    documents?: ClearanceDocument[];
    status_history?: StatusHistory[];
    payment_items?: PaymentItem[];
    payment?: Payment;
    
    // Computed fields
    is_urgent: boolean;
    days_until_needed: number;
    formatted_created_at: string;
    formatted_needed_date: string;
    formatted_issue_date?: string;
    days_overdue?: number;
    is_overdue: boolean;
}

// ========== FILTERS ==========
export interface ClearanceFilters {
    search?: string;
    status?: ClearanceStatus | 'all';
    clearance_type?: string | 'all';
    urgency?: UrgencyLevel | 'all';
    resident?: string | 'all';
    year?: string | 'all';
    date_from?: string;
    date_to?: string;
    sort_by?: 'created_at' | 'needed_date' | 'fee_amount' | 'status';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

// ========== STATISTICS ==========
export interface ClearanceStats {
    total_clearances: number;
    pending_clearances: number;
    pending_payment_clearances: number;
    processing_clearances: number;
    approved_clearances: number;
    issued_clearances: number;
    rejected_clearances: number;
    cancelled_clearances: number;
    total_fees: number;
    total_paid: number;
    total_balance: number;
    current_year_total: number;
    current_year_issued: number;
    average_processing_days: number;
}

// ========== PAGINATION ==========
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// ========== FORM DATA ==========
export interface ClearanceFormData {
    clearance_type_id: string;
    purpose: string;
    purpose_custom: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes: string;
    resident_id: string;
    documents: File[];
    descriptions: string[];
    document_type_ids: number[];
    _method: 'post' | 'put';
}

// ========== DRAFT ==========
export interface ClearanceDraft {
    id?: string;
    clearance_type_id: string;
    purpose: string;
    purpose_custom: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes: string;
    uploadedFiles: UploadedFileWithMetadata[];
    selectedDocumentTypes: Set<number>;
    activeStep: number;
    updated_at: string;
}

export interface UploadedFileWithMetadata {
    file: File;
    description: string;
    document_type_id?: number;
}

// ========== PAGE PROPS ==========
export interface ClearancePageProps {
    clearances?: PaginatedResponse<ClearanceRequest>;
    stats?: ClearanceStats;
    availableYears?: number[];
    availableClearanceTypes?: ClearanceType[];
    householdResidents?: Resident[];
    currentResident?: Resident;
    household?: Household;
    filters?: ClearanceFilters;
    error?: string;
}