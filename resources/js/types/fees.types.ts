export interface Fee {
    resident_id: unknown;
    household_id: unknown;
    address: unknown;
    id: number;
    fee_type_id: number;
    payer_type: string;
    payer_name: string;
    contact_number?: string;
    purok?: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    fee_code: string;
    fee_type?: {
        name: string;
        category: string;
    };
    resident?: {
        name: string;
    };
    household?: {
        name: string;
    };
    payment?: {
        payment_date?: string;
    };
    created_at: string;
    or_number?: string;
    certificate_number?: string;
    purpose?: string;
    billing_period?: string;
    valid_from?: string;
    valid_until?: string;
    discount_amount?: number;
    surcharge_amount?: number;
    penalty_amount?: number;
    base_amount?: number;
    payment_method?: string;
    payment_reference?: string;
}

export interface PaginationData {
    current_page: number;
    data: Fee[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface Filters {
    search?: string;
    status?: string;
    category?: string;
    purok?: string;
    from_date?: string;
    to_date?: string;
    payer_type?: string;
    min_amount?: string;
    max_amount?: string;
    sort_by?: string;
    sort_order?: string;
}

export interface Stats {
    total: number;
    total_amount: number;
    collected: number;
    pending: number;
    overdue_count: number;
    issued_count: number;
    partially_paid_count: number;
    waived_count: number;
}

export type BulkOperation = 'export' | 'print' | 'delete' | 'issue' | 'mark_paid' | 'mark_overdue' | 'cancel' | 'waive' | 'export_csv' | 'export_pdf' | 'send_reminder' | 'generate_certificates' | 'generate_receipts';

export type SelectionMode = 'page' | 'filtered' | 'all';

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