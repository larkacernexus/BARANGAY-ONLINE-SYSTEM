// types/fees.types.ts

export interface Fee {
    id: number;
    fee_code: string;
    fee_type_id: number;
    certificate_number?: string;
    or_number?: string;
    payer_type: string;
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    purok?: string;
    zone?: string;
    issue_date: string;
    due_date: string;
    period_start?: string;
    period_end?: string;
    valid_from?: string;
    valid_until?: string;
    base_amount: number;
    discount_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    metadata?: any;
    issued_by?: number;
    collected_by?: number;
    created_by?: number;
    updated_by?: number;
    cancelled_by?: number;
    cancelled_at?: string;
    remarks?: string;
    batch_reference?: string;
    requirements_submitted?: string[];
    created_at: string;
    updated_at: string;
    
    // Additional formatted fields
    formatted_issue_date?: string;
    formatted_due_date?: string;
    formatted_created_at?: string;
    is_overdue?: boolean;
    days_overdue?: number;
    payer_type_icon?: string;
    formatted_total_amount?: string;
    formatted_amount_paid?: string;
    formatted_balance?: string;
    payer_details?: any;
    resident_id?: number | null;
    household_id?: number | null;
    
    // Relationships
    fee_type?: FeeType;
    payment_items?: PaymentItem[];
}

export interface FeeType {
    id: number;
    name: string;
    code: string;
    document_category_id: number;
    is_discountable: boolean;
    category?: string; // Added for filtering
}

export interface PaymentItem {
    id: number;
    fee_id: number;
    payment_id: number;
    amount: number;
    payment?: Payment;
}

export interface Payment {
    id: number;
    payment_date: string;
    total_amount: number;
    or_number: string;
    status: string;
    payment_method?: string;
}

export interface Filters {
    search?: string;
    status: string;
    category: string;
    purok: string;
    from_date: string;
    to_date: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    min_amount?: string;
    max_amount?: string;
    payer_type?: string;
}

export interface PaginationData {
    data: Fee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
    links?: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export interface Stats {
    total: number;
    total_amount: number;
    collected: number; // total amount collected (paid)
    pending: number; // total balance pending
    overdue_count: number;
    due_soon_count: number;
    today_count: number;
    today_amount: number;
    today_collected: number;
    this_month_count: number;
    this_month_amount: number;
    this_month_collected: number;
    status_counts: {
        pending: number;
        issued: number;
        partially_paid: number;
        paid: number;
        overdue: number;
        cancelled: number;
        waived: number;
    };
    category_totals: Record<string, any>;
}

export interface SelectionStats {
    total: number;
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    overdueCount: number;
    paidCount: number;
    pendingCount: number;
    issuedCount: number;
    partiallyPaidCount: number;
    withCertificates: number;
    withReceipts: number;
    residents: number;
    households: number;
    businesses: number;
}

export type BulkOperation = 'delete' | 'export' | 'export_csv' | 'mark_paid' | 'cancel' | 'send_reminders';

export type SelectionMode = 'page' | 'filtered' | 'all';