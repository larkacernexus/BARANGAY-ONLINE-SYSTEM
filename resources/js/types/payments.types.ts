// types/payments.types.ts
export interface PaymentItem {
    id: number;
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
}

export interface Payment {
    amount_paid: number;
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household';
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    payment_date: string;
    formatted_date?: string;
    period_covered?: string;
    payment_method: string;
    reference_number?: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_type?: string;
    total_amount: number;
    formatted_total?: string;
    purpose?: string;
    remarks?: string;
    is_cleared: boolean;
    certificate_type?: string;
    validity_date?: string;
    collection_type: string;
    status: 'completed' | 'pending' | 'cancelled';
    recorded_by?: number;
    recorded_by_name?: string;
    created_at: string;
    updated_at: string;
    items?: PaymentItem[];
    recorder?: {
        id: number;
        name: string;
    };
}

export interface Filters {
    search?: string;
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    payer_type?: string;
}

export interface Stats {
    total: number;
    today: number;
    monthly: number;
    total_amount: number;
    today_amount: number;
    monthly_amount: number;
}

export interface PaginationData {
    data: Payment[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: any[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface SelectionStats {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalAmount: number;
    avgAmount: number;
    cashPayments: number;
    digitalPayments: number;
    residents: number;
    households: number;
}