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
    status_display: string;
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
// COMMENTED OUT - Not used in admin panel (admins manage users/accounts, not residents directly)
export interface Resident {
    purok: any;
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
    civil_status: any;
    updated_at: string;
}

// ========== HOUSEHOLD ==========
// COMMENTED OUT - Not used in admin panel (household management is separate module)
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
    business_id: null;
    applicant_type: string;
    contact_purok: boolean;
    business: boolean;
    household: boolean;
    payer_name: boolean;
    payer_id: number;
    admin_notes: string;
    payment_date: any;
    status_display: string;
    payment_status: any;
    amount_paid(amount_paid: any): any;
    balance: number;
    payer_type: any;
    contact_number: boolean;
    contact_address: boolean;
    // contact_purok: boolean;
    // business: boolean;
    // payer_name: boolean;
    // payer_id: number;
    or_number: any;
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
    // COMMENTED OUT - Admin panel uses simplified resident data
    // resident?: Resident;
    resident?: {
        address: any;
        purok: any;
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        suffix?: string;
        full_name: string;
        contact_number?: string;
        email?: string;
    };
    // COMMENTED OUT - Not used in admin panel
    // household?: Household;
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
    // COMMENTED OUT - Admin panel filters by other criteria instead of resident
    // resident?: string | 'all';
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

// ========== PAGE PROPS ==========
export interface ClearancePageProps {
    clearances?: PaginatedResponse<ClearanceRequest>;
    stats?: ClearanceStats;
    availableYears?: number[];
    availableClearanceTypes?: ClearanceType[];
    // COMMENTED OUT - Not used in admin panel
    // householdResidents?: Resident[];
    // currentResident?: Resident;
    // household?: Household;
    filters?: ClearanceFilters;
    error?: string;
}

export interface StatusOption {
    value: string;
    label: string;
}

export interface Filters {
    from_date(from_date: any): string | (() => string);
    to_date(to_date: any): string | (() => string);
    search?: string;
    status?: string;
    type?: string;
    urgency?: string;
    payment_status?: any;
    sort?: any;
    direction?: any;
}

export interface Stats {
    totalIssued?: number;
    issuedThisMonth?: number;
    pending?: number;
    pendingToday?: number;
    expiringSoon?: number;
    totalRevenue?: number;
    expressRequests?: number;
    rushRequests?: number;
    total: any;
    processing: any;
    approved: any;
    unpaid: any;
    partially_paid: any;
    paid: any;
    pending_payment: any;
}

export interface PaginationData<T = any> {
    current_page: number;
    data: T[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

// COMMENTED OUT - Not used in admin panel (audit logs are separate concern)
export interface ActivityLog {
    causer: any;
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

export interface Document {
    name: string;
    uploaded_at: any;
    status: string;
    is_verified: any;
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
    url?: string;
    verification_status: DocumentVerificationStatus;
    verified_at?: string;
    verified_by?: number;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface Business {
    id: number;
    business_name: string;
    owner_name: string;
    contact_number: string;
    address: string;
    purok: string;
    business_permit_number?: string;
    barangay_id?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

// ========== BULK OPERATIONS ==========
export type BulkOperation = 
    | 'process'
    | 'approve'
    | 'issue'
    | 'delete'
    | 'export'
    | 'print'
    | 'update_status'
    | 'copy_data'
    | 'generate_receipt'
    | 'send_reminder'
    | 'mark_as_processed'
    | 'mark_as_approved'
    | 'mark_as_issued'
    | 'cancel'
    | 'refund';

// ========== SELECTION MODE ==========
export type SelectionMode = 'page' | 'filtered' | 'all';

// Status badge variants mapping
export type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success";

// Urgency badge variants mapping
export type UrgencyVariant = "default" | "secondary" | "destructive" | "outline";