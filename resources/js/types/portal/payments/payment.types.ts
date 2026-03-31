// types/payment.ts

export type PaymentStatus = 
    | 'completed' 
    | 'paid' 
    | 'pending' 
    | 'overdue' 
    | 'cancelled' 
    | 'refunded' 
    | 'partially_paid';

export type PaymentMethod = 
    | 'cash' 
    | 'gcash' 
    | 'maya' 
    | 'bank' 
    | 'check' 
    | 'online' 
    | 'card';

export type ViewMode = 'grid' | 'list';
export type TabValue = 'all' | PaymentStatus;
export type CollectionType = 'clearance' | 'certificate' | 'fee' | 'tax' | 'donation';
export type CertificateType = 'barangay_clearance' | 'indigency' | 'residency' | 'business' | 'other';

// ============================================================================
// Core Payment Types
// ============================================================================

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
    balance_due: number;
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

// ============================================================================
// Pagination & Response Types
// ============================================================================

export interface PaymentsPaginatedResponse {
    data: Payment[];
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

export interface PaymentStats {
    total_payments: number;
    pending_payments: number;
    total_paid: number;
    balance_due: number;
    completed_payments: number;
    overdue_payments: number;
    cancelled_payments: number;
    current_year_total: number;
    current_year_paid: number;
    current_year_balance: number;
    refunded_payments?: number;
    partially_paid_payments?: number;
}

// ============================================================================
// Filter & Form Types
// ============================================================================

export interface PaymentFilters {
    search?: string;
    status?: string;
    payment_method?: string;
    collection_type?: string;
    certificate_type?: string;
    year?: string;
    month?: string;
    from_date?: string;
    to_date?: string;
    page?: string;
    per_page?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaymentMethodType {
    type: string;
    display_name: string;
    icon?: React.ElementType;
    color?: string;
}

export interface CollectionTypeOption {
    type: CollectionType;
    display_name: string;
    description?: string;
}

export interface CertificateTypeOption {
    type: CertificateType;
    display_name: string;
    description?: string;
    requirements?: string[];
}

// ============================================================================
// Summary & Helper Types
// ============================================================================

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

export interface PaymentSummaryCard {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    textColor: string;
    trend?: string;
    trendUp?: boolean;
    badge?: string | null;
}

export interface PaymentExportOptions {
    format: 'csv' | 'pdf' | 'excel';
    includeHeaders?: boolean;
    includeBreakdown?: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    statuses?: PaymentStatus[];
    paymentMethods?: PaymentMethod[];
}

// ============================================================================
// Props Types for Components
// ============================================================================

export interface PaymentShowPageProps {
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

export interface PaymentListPageProps {
    payments?: PaymentsPaginatedResponse;
    stats?: PaymentStats;
    availableYears?: number[];
    availablePaymentMethods?: PaymentMethodType[];
    availableCollectionTypes?: CollectionTypeOption[];
    availableCertificateTypes?: CertificateTypeOption[];
    currentResident?: PayerDetails;
    hasProfile?: boolean;
    filters?: PaymentFilters;
    error?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PaymentCardProps {
    payment: Payment;
    selectMode?: boolean;
    selectedPayments?: number[];
    onSelectPayment?: (id: number) => void;
    formatDate: (date: string) => string;
    formatCurrency: (amount: number) => string;
    onViewDetails: (id: number) => void;
    onMakePayment?: (id: number) => void;
    onDownloadReceipt?: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
    isMobile?: boolean;
}

export interface PaymentGridCardProps extends Omit<PaymentCardProps, 'isMobile'> {
    // Additional grid-specific props
}

export interface PaymentFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    paymentMethodFilter: string;
    handlePaymentMethodChange: (value: string) => void;
    collectionTypeFilter?: string;
    handleCollectionTypeChange?: (value: string) => void;
    certificateTypeFilter?: string;
    handleCertificateTypeChange?: (value: string) => void;
    yearFilter: string;
    handleYearChange: (value: string) => void;
    dateRange?: {
        from: string;
        to: string;
    };
    handleDateRangeChange?: (range: { from: string; to: string }) => void;
    loading: boolean;
    availablePaymentMethods: PaymentMethodType[];
    availableCollectionTypes?: CollectionTypeOption[];
    availableCertificateTypes?: CertificateTypeOption[];
    availableYears: number[];
    printPayments: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    onCopySummary: () => void;
}

export interface PaymentListViewProps {
    payments: Payment[];
    selectMode?: boolean;
    selectedPayments?: number[];
    onSelectPayment?: (id: number) => void;
    onSelectAll?: () => void;
    formatDate: (date: string) => string;
    formatCurrency: (amount: number) => string;
    onViewDetails: (id: number) => void;
    onMakePayment?: (id: number) => void;
    onDownloadReceipt?: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
    onPrint?: () => void;
}

export interface PaymentGridViewProps {
    payments: Payment[];
    selectMode?: boolean;
    selectedPayments?: number[];
    onSelectPayment?: (id: number) => void;
    formatDate: (date: string) => string;
    formatCurrency: (amount: number) => string;
    onViewDetails: (id: number) => void;
    onMakePayment?: (id: number) => void;
    onDownloadReceipt?: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
    isMobile?: boolean;
}

// ============================================================================
// Utility Functions Types
// ============================================================================

export interface PaymentUtils {
    formatDate: (dateString: string, isMobile?: boolean) => string;
    formatCurrency: (amount: number) => string;
    getPaymentMethodDisplay: (method: string) => string;
    getPaymentStatusColor: (status: string) => string;
    getPaymentStatusLabel: (status: string) => string;
    getStatusCount: (stats: PaymentStats, status: string, payments: Payment[]) => number;
    printPaymentsList: (
        payments: Payment[],
        statusFilter: string,
        formatDate: Function,
        formatCurrency: Function,
        toast?: any
    ) => void;
    exportToCSV: (
        payments: Payment[],
        statusFilter: string,
        formatDate: Function,
        setIsExporting: Function,
        toast: any
    ) => void;
    calculatePaymentSummary: (payment: Payment) => PaymentSummary;
    validatePaymentStatus: (status: string) => status is PaymentStatus;
    isPaymentOverdue: (dueDate?: string | null) => boolean;
    getPaymentProgress: (payment: Payment) => number;
}

// ============================================================================
// Constants Types
// ============================================================================

export interface PaymentStatusConfigMap {
    [key: string]: PaymentStatusConfig;
}

export interface PaymentMethodConfig {
    [key: string]: {
        display: string;
        icon?: React.ElementType;
        color?: string;
        requiresReference?: boolean;
    };
}

export interface TabConfig {
    id: string;
    label: string;
    icon: React.ElementType;
    status?: PaymentStatus;
    count?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaymentCreateResponse {
    success: boolean;
    payment: Payment;
    message: string;
    redirect_url?: string;
}

export interface PaymentUpdateResponse {
    success: boolean;
    payment: Payment;
    message: string;
}

export interface PaymentDeleteResponse {
    success: boolean;
    message: string;
}

export interface PaymentReceiptResponse {
    success: boolean;
    receipt_url: string;
    generated_at: string;
    expires_at?: string;
}

export interface PaymentVerifyResponse {
    success: boolean;
    payment: Payment;
    verified_by: {
        id: number;
        name: string;
        role: string;
        date: string;
    };
    message: string;
}

export interface PaymentRefundResponse {
    success: boolean;
    payment: Payment;
    refund_amount: number;
    refund_date: string;
    reference_number?: string;
    message: string;
}