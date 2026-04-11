// types/portal/receipts/receipt.types.ts

export interface ReceiptItem {
    description: any;
    payor_name: any;
    amount: any;
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    formatted_total: string;
    formatted_amount_paid: string;
    payment_method: string;
    payment_method_label: string;
    formatted_payment_date: string;
    formatted_issued_date: string;
    issued_by: string;
    status: string;
    status_badge: string;
    items_count: number;
    has_discount: boolean;
    reference_number?: string;
    clearance_id?: number;
    fee_id?: number;
    notes?: string;
    payment_date?: string | null;
    created_at: string;
    updated_at: string;
}

export interface HouseholdData {
    id: number;
    household_number: string;
    head_name: string;
    address: string;
    contact_number: string | null;
    email: string | null;
    member_count: number;
    has_user_account: boolean;
}

export interface ReceiptStats {
    total_count: number;
    total_amount: string;
    total_amount_raw: number;
    this_month_count: number;
    this_month_amount: string;
    this_month_amount_raw: number;
    latest_receipt: string | null;
    clearance_count: number;
    fee_count: number;
    official_count: number;
    paid_count: number;
    pending_count: number;
    partial_count: number;
    cancelled_count?: number;
}

export interface ReceiptFilters {
    search?: string;
    date_from?: string;
    date_to?: string;
    receipt_type?: string;
    status?: string;
    payment_method?: string;
    page?: string;
    sort?: string;
}

export interface ReceiptsPageProps {
    // Add index signature to satisfy Inertia's PageProps requirement
    [key: string]: any;
    
    receipts: {
        data: ReceiptItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    household: HouseholdData;
    filters: ReceiptFilters;
    stats: ReceiptStats;
    receiptTypes: Array<{ value: string; label: string }>;
    paymentMethods: Array<{ value: string; label: string }>;
    availableYears?: number[];
    error?: string;
}

export interface ReceiptCardProps {
    receipt: ReceiptItem;
    selectMode?: boolean;
    selectedReceipts?: number[];
    toggleSelectReceipt?: (id: number) => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: string | number) => string;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
    onCopyReceiptNumber: (receiptNumber: string) => void;
    onCopyORNNumber: (orNumber: string | null) => void;
    isMobile?: boolean;
}

export interface ReceiptTableProps {
    receipts: ReceiptItem[];
    selectMode?: boolean;
    selectedReceipts?: number[];
    toggleSelectReceipt?: (id: number) => void;
    selectAllReceipts?: () => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: string | number) => string;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
    onCopyReceiptNumber: (receiptNumber: string) => void;
    onCopyORNNumber: (orNumber: string | null) => void;
}