export interface Resident {
    id: number;
    full_name: string;
    first_name?: string;
    last_name?: string;
    address?: string;
    // Add these missing fields:
    contact_number?: string; 
    purok?: string;
    household_number?: string;
}

export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number;
    processing_days: number;
    validity_days?: number;
    description?: string;
    is_active: boolean;
    formatted_fee: string;
    document_types_count?: number;
    required_document_types_count?: number;
    total_requests?: number;
}

export interface ClearanceRequest {
    resident_name: unknown;
    contact_number: unknown;
    address: unknown;
    purok: unknown;
    clearance_code: unknown;
    amount_due: unknown;
    id: number;
    reference_number: string;
    clearance_number?: string;
    resident_id: number;
    clearance_type_id: number;
    purpose: string;
    specific_purpose?: string;
    fee_amount: number;
    urgency: 'normal' | 'rush' | 'express';
    status: 'pending' | 'pending_payment' | 'processing' | 'approved' | 'issued' | 'rejected' | 'cancelled' | 'expired';
    issue_date?: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
    issuing_officer_name?: string;
    resident?: Resident;
    clearance_type?: ClearanceType;
    status_display?: string;
    urgency_display?: string;
    formatted_fee?: string;
    is_valid?: boolean;
    days_remaining?: number;
    balance?: number;
}

export interface StatusOption {
    value: string;
    label: string;
}

export interface Filters {
    search?: string;
    status?: string;
    type?: string;
    urgency?: string;
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
}

export interface PaginatedClearances {
    data: ClearanceRequest[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface PageProps {
    clearances: PaginatedClearances;
    stats?: Stats;
    clearanceTypes: ClearanceType[];
    filters?: Filters;
    statusOptions?: StatusOption[];
}

export type BulkOperation = 'process' | 'approve' | 'issue' | 'reject' | 'cancel' | 'delete' | 'export' | 'print' | 'resend' | 'update_status';
export type BulkEditField = 'status' | 'urgency';

export interface SelectionStats {
    pending: number;
    pendingPayment: number;
    processing: number;
    approved: number;
    issued: number;
    rejected: number;
    cancelled: number;
    expired: number;
    express: number;
    rush: number;
    normal: number;
    totalValue: number;
    avgValue: number;
}