// resources/js/types/receipt.ts

export interface ReceiptItem {
    id?: number;
    fee_id?: number;
    clearance_request_id?: number;
    fee_name: string;
    fee_code?: string;
    description?: string;
    base_amount: number;
    surcharge?: number;
    penalty?: number;
    discount?: number;
    total_amount: number;
    category?: string;
    period_covered?: string;
    months_late?: number;
    formatted_base_amount?: string;
    formatted_surcharge?: string;
    formatted_penalty?: string;
    formatted_discount?: string;
    formatted_total?: string;
}

export interface FeeBreakdown {
    fee_name: string;
    fee_code?: string;
    base_amount: number;
    total_amount: number;
    formatted_amount?: string;
    quantity?: number;
    unit_price?: number;
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

export interface Receipt {
    id: number;
    receipt_number: string;
    payment_id: number | null;
    clearance_request_id: number | null;
    or_number: string | null;
    receipt_type: 'official' | 'clearance' | 'certificate' | 'fee';
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    payer_type?: 'resident' | 'household' | 'business' | 'other';
    contact_number?: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    amount_paid: number;
    change_due: number;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    payment_method: 'cash' | 'gcash' | 'maya' | 'bank' | 'check' | 'online' | 'other';
    payment_method_label: string;
    payment_method_details?: {
        name: string;
        icon: string;
        color: string;
    };
    reference_number: string | null;
    payment_date: string;
    formatted_payment_date: string;
    issued_date: string;
    formatted_issued_date: string;
    issued_by: string;
    recorded_by?: number;
    recorder?: {
        id: number;
        name: string;
        email: string;
    };
    status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded';
    status_badge: string;
    status_display: string;
    is_voided: boolean;
    void_reason: string | null;
    voided_at?: string | null;
    voided_by?: number | null;
    voider?: {
        id: number;
        name: string;
    };
    printed_count: number;
    last_printed_at: string | null;
    fee_breakdown: FeeBreakdown[];
    items?: ReceiptItem[];
    discount_details?: DiscountDetail[];
    notes: string | null;
    remarks?: string | null;
    purpose?: string;
    collection_type?: string;
    collection_type_display?: string;
    certificate_type?: string;
    certificate_type_display?: string;
    validity_date?: string;
    formatted_validity_date?: string;
    is_cleared: boolean;
    is_cleared_display: string;
    created_at: string;
    formatted_created_at: string;
    updated_at: string;
    formatted_updated_at: string;
}

// ============= Configuration Objects with ClassNames =============

export type ReceiptStatus = 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded';

export const RECEIPT_STATUS_CONFIG: Record<ReceiptStatus, { label: string; color: string; icon: string; className: string }> = {
    completed: {
        label: 'Completed',
        color: 'green',
        icon: 'CheckCircle',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
    },
    pending: {
        label: 'Pending',
        color: 'yellow',
        icon: 'Clock',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    },
    failed: {
        label: 'Failed',
        color: 'red',
        icon: 'XCircle',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'gray',
        icon: 'Ban',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    },
    refunded: {
        label: 'Refunded',
        color: 'orange',
        icon: 'RefreshCw',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    }
};

export type ReceiptType = 'official' | 'clearance' | 'certificate' | 'fee';

export const RECEIPT_TYPE_CONFIG: Record<ReceiptType, { label: string; description: string; icon: string; className: string }> = {
    official: {
        label: 'Official Receipt',
        description: 'Standard payment receipt',
        icon: 'Receipt',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    },
    clearance: {
        label: 'Clearance Receipt',
        description: 'Payment for clearance requests',
        icon: 'FileCheck',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    },
    certificate: {
        label: 'Certificate Receipt',
        description: 'Payment for certificates',
        icon: 'Award',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
    },
    fee: {
        label: 'Fee Receipt',
        description: 'Payment for various fees',
        icon: 'FileText',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    }
};

export interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
    color: string;
    className: string;
    description?: string;
    requires_reference?: boolean;
    reference_label?: string;
}

export const PAYMENT_METHOD_CONFIG: Record<string, PaymentMethod> = {
    cash: {
        value: 'cash',
        label: 'Cash',
        icon: 'DollarSign',
        color: 'green',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        description: 'Cash payment',
        requires_reference: false
    },
    gcash: {
        value: 'gcash',
        label: 'GCash',
        icon: 'Smartphone',
        color: 'blue',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        description: 'GCash mobile payment',
        requires_reference: true,
        reference_label: 'GCash Reference Number'
    },
    maya: {
        value: 'maya',
        label: 'Maya',
        icon: 'Smartphone',
        color: 'purple',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        description: 'Maya (formerly PayMaya)',
        requires_reference: true,
        reference_label: 'Maya Reference Number'
    },
    bank: {
        value: 'bank',
        label: 'Bank Transfer',
        icon: 'Building',
        color: 'indigo',
        className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        description: 'Bank transfer payment',
        requires_reference: true,
        reference_label: 'Bank Reference Number'
    },
    check: {
        value: 'check',
        label: 'Check',
        icon: 'FileText',
        color: 'amber',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        description: 'Check payment',
        requires_reference: true,
        reference_label: 'Check Number'
    },
    online: {
        value: 'online',
        label: 'Online Payment',
        icon: 'Globe',
        color: 'cyan',
        className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
        description: 'Online payment gateway',
        requires_reference: true,
        reference_label: 'Transaction Reference'
    },
    other: {
        value: 'other',
        label: 'Other',
        icon: 'CreditCard',
        color: 'gray',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
        description: 'Other payment method',
        requires_reference: false
    }
};

// ============= Helper Functions =============

export const getReceiptStatusConfig = (status: ReceiptStatus, isVoided: boolean) => {
    if (isVoided) {
        return {
            label: 'Voided',
            color: 'red',
            icon: 'Ban',
            className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
        };
    }
    return RECEIPT_STATUS_CONFIG[status] || RECEIPT_STATUS_CONFIG.pending;
};

export const getReceiptTypeConfig = (type: ReceiptType) => {
    return RECEIPT_TYPE_CONFIG[type] || RECEIPT_TYPE_CONFIG.official;
};

export const getPaymentMethodConfig = (method: string): PaymentMethod => {
    return PAYMENT_METHOD_CONFIG[method] || PAYMENT_METHOD_CONFIG.other;
};

// ============= Stats Types =============
export interface ReceiptStats {
    total: {
        count: number;
        amount: number;
        formatted_amount: string;
    };
    today: {
        count: number;
        amount: number;
        formatted_amount: string;
    };
    this_month: {
        count: number;
        amount: number;
        formatted_amount: string;
    };
    voided: number;
    by_method: Array<{
        method: string;
        method_label: string;
        count: number;
        total: number;
        formatted_total: string;
    }>;
    by_type: Array<{
        type: string;
        type_label: string;
        count: number;
    }>;
    by_status: Array<{
        status: string;
        status_label: string;
        count: number;
    }>;
}

// ============= Pagination & Filters =============
export interface PendingClearance {
    id: number;
    control_number: string;
    resident_name: string;
    clearance_type: string;
    fee: number;
    formatted_fee: string;
    payment_id?: number;
}

export interface ReceiptFilters {
    search?: string;
    status?: string;
    payment_method?: string;
    receipt_type?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
    sort_by?: 'receipt_number' | 'issued_date' | 'total_amount' | 'payer_name' | 'status' | 'payment_method';
    sort_order?: 'asc' | 'desc';
}

export interface ReceiptFilterOptions {
    payment_methods: Array<{ value: string; label: string }>;
    receipt_types: Array<{ value: string; label: string }>;
    status_options: Array<{ value: string; label: string }>;
}

export interface ReceiptPagination {
    data: Receipt[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface ReceiptPageProps {
    receipts: ReceiptPagination;
    filters: ReceiptFilters;
    stats: ReceiptStats;
    pendingClearances?: PendingClearance[];
    filterOptions: ReceiptFilterOptions;
}

// ============= Bulk Action Types =============
export type BulkAction = 'export' | 'print' | 'void' | 'copy_data' | 'generate_report';

export interface BulkOperation {
    action: BulkAction;
    receipt_ids: number[];
    void_reason?: string;
    format?: 'csv' | 'excel' | 'pdf';
    include_breakdown?: boolean;
}

export interface BulkOperationResponse {
    success: boolean;
    message: string;
    data?: {
        exported_count?: number;
        voided_count?: number;
        file_url?: string;
        download_url?: string;
    };
    errors?: Record<string, string[]>;
}

// ============= Selection Types =============
export interface SelectionStats {
    count: number;
    totalAmount: number;
    formattedTotalAmount: string;
    paidAmount: number;
    formattedPaidAmount: string;
    voidedCount: number;
    paymentMethods: Record<string, number>;
    receiptTypes: Record<string, number>;
}

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface BulkSelectionState {
    selectedIds: number[];
    selectionMode: SelectionMode;
    totalSelected: number;
    totalAvailable: number;
    selectionStats: SelectionStats;
}

// ============= Print Types =============
export interface PrintableReceiptData {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    payer_type?: string;
    contact_number?: string;
    subtotal: number | string;
    surcharge: number | string;
    penalty: number | string;
    discount: number | string;
    total_amount: number | string;
    amount_paid: number | string;
    change_due: number | string;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    payment_method: string;
    payment_method_label: string;
    reference_number: string | null;
    formatted_payment_date: string;
    formatted_issued_date: string;
    issued_by: string;
    fee_breakdown: FeeBreakdown[];
    notes: string | null;
    payment_id?: number;
    clearance_request_id?: number | null;
    purpose?: string;
    collection_type?: string;
    remarks?: string;
    certificate_type?: string;
    certificate_type_display?: string;
}

export interface BarangayInfo {
    name: string;
    address: string;
    contact?: string;
    logo?: string;
    bir_reg_no?: string;
}

export interface OfficerInfo {
    name: string;
    position: string;
    signature?: string;
}

// ============= Chart Data Types =============
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    count: number;
    amount: number;
    formatted_amount: string;
}

// ============= Export Types =============
export interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf';
    date_from?: string;
    date_to?: string;
    status?: string[];
    payment_method?: string[];
    receipt_type?: string[];
    include_breakdown?: boolean;
    include_discounts?: boolean;
}

// ============= Activity Log Types =============
export interface ReceiptActivity {
    id: number;
    receipt_id: number;
    action: 'created' | 'printed' | 'voided' | 'updated' | 'emailed' | 'downloaded';
    user_id: number;
    user_name: string;
    description: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    formatted_created_at: string;
}

// ============= Form Types =============
export interface ReceiptFormData {
    payment_id?: number;
    clearance_request_id?: number;
    receipt_type: 'official' | 'clearance' | 'certificate' | 'fee';
    notes?: string;
    purpose?: string;
    certificate_type?: string;
}

export interface ReceiptValidation {
    has_valid_payment: boolean;
    has_valid_clearance: boolean;
    is_duplicate: boolean;
    duplicate_count?: number;
    warnings?: string[];
}

// ============= Receipt Template Types =============
export interface ReceiptTemplate {
    id: number;
    name: string;
    type: 'official' | 'clearance' | 'certificate' | 'fee';
    content: string;
    styles: Record<string, any>;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// ============= Receipt Summary Types =============
export interface ReceiptSummary {
    total_receipts: number;
    total_amount: number;
    formatted_total_amount: string;
    average_amount: number;
    formatted_average_amount: string;
    most_common_method: string;
    most_common_type: string;
    void_rate: number;
}

// ============= Dashboard Types =============
export interface ReceiptDashboardStats {
    today: {
        count: number;
        amount: number;
        formatted_amount: string;
        percentage_of_month: number;
    };
    week: {
        count: number;
        amount: number;
        formatted_amount: string;
        daily_average: number;
        formatted_daily_average: string;
    };
    month: {
        count: number;
        amount: number;
        formatted_amount: string;
        projection: number;
        formatted_projection: string;
    };
    year: {
        count: number;
        amount: number;
        formatted_amount: string;
        year_over_year: number;
    };
    trends: {
        daily: TimeSeriesDataPoint[];
        weekly: TimeSeriesDataPoint[];
        monthly: TimeSeriesDataPoint[];
    };
    top_payers: Array<{
        name: string;
        total: number;
        formatted_total: string;
        receipt_count: number;
    }>;
    popular_items: Array<{
        name: string;
        count: number;
        total: number;
        formatted_total: string;
    }>;
}