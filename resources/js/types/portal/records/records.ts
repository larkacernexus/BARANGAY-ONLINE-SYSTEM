// types/portal/records.ts
import { LucideIcon, AlertCircleIcon, ArchiveIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';

// ========== DOCUMENT CATEGORY ==========
export interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    icon: string;
    icon_component?: LucideIcon;
    color: string;
    description?: string;
    is_active: boolean;
    order: number;
    document_count?: number;
    document_types?: DocumentType[];
    created_at?: string;
    updated_at?: string;
}

// ========== DOCUMENT TYPE ==========
export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description?: string;
    category: string;
    category_id?: number;
    accepted_formats: string[];
    max_file_size: number;
    is_active: boolean;
    sort_order: number;
    document_category_id?: number;
    template?: DocumentTemplate;
    requires_expiry_date?: boolean;
    requires_reference_number?: boolean;
    requires_issue_date?: boolean;
    requires_password?: boolean;
    is_public_default?: boolean;
    tags?: string[];
    validation_rules?: string[];
    created_at?: string;
    updated_at?: string;
}

// ========== DOCUMENT TEMPLATE ==========
export interface DocumentTemplate {
    id: number;
    name: string;
    description?: string;
    fields: TemplateField[];
    preview_image?: string;
    is_active: boolean;
    version?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TemplateField {
    name: string;
    type: 'text' | 'date' | 'number' | 'select' | 'textarea' | 'email' | 'tel' | 'url';
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: string;
    help_text?: string;
    default_value?: string;
    order?: number;
}

// ========== RESIDENT ==========
export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    household_id?: number;
    created_at?: string;
    updated_at?: string;
}

// ========== HOUSEHOLD ==========
export interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id?: number;
    address?: string;
    purok?: string;
    total_members?: number;
    created_at?: string;
    updated_at?: string;
}

// ========== DOCUMENT ==========
export interface Document {
    uploaded_by_user: any;
    security_options: any;
    preview_url: any;
    id: number;
    name: string;
    description?: string;
    document_category_id: number;
    category?: DocumentCategory;
    document_type_id?: number;
    document_type?: DocumentType;
    file_extension: string;
    file_size: number;
    file_size_human: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    reference_number?: string;
    resident_id: number;
    resident?: Resident;
    issue_date?: string;
    expiry_date?: string;
    status?: DocumentStatus;
    is_public?: boolean;
    requires_password?: boolean;
    is_verified?: boolean;
    verified_at?: string;
    verified_by?: number;
    download_count: number;
    view_count: number;
    tags: string[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
    uploaded_by?: {
        id: number;
        name: string;
        email: string;
    };
}

export type DocumentStatus = 'active' | 'expired' | 'archived' | 'pending_verification';

// ========== STORAGE ==========
export interface StorageStats {
    categories_count: number;
    used: string;
    used_bytes: number;
    limit: string;
    limit_bytes: number;
    available: string;
    available_bytes: number;
    percentage: number;
    document_count?: number;
    category_usage?: Record<string, number>;
}

// ========== FORM DATA ==========
export interface RecordFormData {
    resident_id: string;
    document_type_id: string;
    name: string;
    description: string;
    file: File | null;
    issue_date: string;
    expiry_date: string;
    is_public: boolean;
    requires_password: boolean;
    password: string;
    confirm_password: string;
    reference_number: string;
    tags: string[];
    metadata?: Record<string, any> | string;
    custom_fields?: Record<string, any>;
}

// ========== EXTRACTED INFO ==========
export interface ExtractedInfo {
    documentName?: string;
    description?: string;
    issueDate?: string;
    expiryDate?: string;
    referenceNumber?: string;
    confidence: number;
    metadata?: Record<string, any>;
    textContent?: string;
    detectedType?: string;
    suggestedCategory?: string;
    suggestedTags?: string[];
    suggestedDocumentType?: string;
}

// ========== METADATA ==========
export interface MetadataItem {
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'array';
    label?: string;
    is_editable?: boolean;
}

// ========== FILTERS ==========
export interface RecordFilters {
    search?: string;
    category?: string | 'all';
    resident?: string | 'all';
    document_type?: string | 'all';
    status?: DocumentStatus | 'all';
    date_from?: string;
    date_to?: string;
    page?: string;
    per_page?: string;
    sort_by?: 'created_at' | 'name' | 'file_size' | 'download_count';
    sort_order?: 'asc' | 'desc';
}

// ========== PAGINATION ==========
export interface PaginatedDocuments {
    data: Document[];
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


export interface FormData {
    is_public: boolean | undefined;
    requires_password: boolean | undefined;
    password: string | number | readonly string[] | undefined;
    confirm_password: string | number | readonly string[] | undefined;
    name: string | number | readonly string[] | undefined;
    description: string | number | readonly string[] | undefined;
    issue_date: string | number | readonly string[] | undefined;
    expiry_date: string | number | readonly string[] | undefined;
    reference_number: string | number | readonly string[] | undefined;
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
}

export interface RelatedDocument {
    id: number;
    name: string;
    file_extension?: string;
    file_size_human?: string;
    file_size?: number;
    created_at?: string;
    updated_at?: string;
    category?: {
        id: number;
        name: string;
        slug?: string;
        icon?: string;
        color?: string;
    };
    category_id?: number;
    resident_id?: number;
    resident_name?: string;
    reference_number?: string;
    requires_password?: boolean;
    is_public?: boolean;
    preview_url?: string;
    thumbnail_url?: string;
    relationship_type?: 'same_category' | 'same_resident' | 'related_by_tags' | 'custom';
    relationship_strength?: number;
}


// ========== PAGE PROPS ==========
export interface RecordsPageProps {
    documents: PaginatedDocuments;
    categories: DocumentCategory[];
    storageStats?: StorageStats;
    filters: RecordFilters;
    householdResidents?: Resident[];
    currentResident?: Resident;
    household?: Household;
    templates?: DocumentTemplate[];
    aiFeatures?: {
        ocr_enabled: boolean;
        auto_categorization: boolean;
        metadata_extraction: boolean;
        duplicate_detection: boolean;
    };
    maxFileSize?: number;
    allowedTypes?: string[];
    recentDocuments?: Document[];
    error?: string;
}

// ========== MODAL PROPS ==========
export interface FullScreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    showCloseButton?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
    password: string;
    setPassword: (value: string) => void;
    passwordError: string;
    verifying: boolean;
    onVerify: () => void;
}

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    loading?: boolean;
}

// ========== PREVIEW PROPS ==========
export interface PDFPreviewProps {
    file: File;
    zoomLevel: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export interface ImagePreviewProps {
    file: File;
    zoomLevel: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    rotation?: number;
    onRotate?: () => void;
}

export interface FilePreviewProps {
    file: File;
    onClose?: () => void;
}

// ========== NAVIGATION PROPS ==========
export interface MobileNavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentStep: number;
    totalSteps: number;
    steps: Array<{
        title: string;
        description: string;
        icon: React.ReactNode;
    }>;
    onStepClick?: (step: number) => void;
}

export interface MobileBottomActionBarProps {
    processing: boolean;
    selectedFile: File | null;
    documentTypeId: string;
    residentId: string;
    onUpload: () => void;
    onCancel: () => void;
    isFormValid?: boolean;
}

// ========== STEP CONFIG ==========
export interface FormStep {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    isCompleted?: boolean;
    isCurrent?: boolean;
}

export interface UploadStepProps {
    selectedFile: File | null;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    isUploading: boolean;
    uploadProgress?: number;
    error?: string;
    acceptedFileTypes?: string[];
    maxFileSize?: number;
}

export interface MetadataStepProps {
    extractedInfo?: ExtractedInfo;
    metadata: MetadataItem[];
    onMetadataChange: (metadata: MetadataItem[]) => void;
    loading?: boolean;
}

// ========== AI FEATURES ==========
export interface AIFeatures {
    ocr_enabled: boolean;
    auto_categorization: boolean;
    metadata_extraction: boolean;
    duplicate_detection: boolean;
}

export interface DuplicateResult {
    is_duplicate: boolean;
    existing_documents?: Document[];
    similarity_score?: number;
    message?: string;
}

// ========== VALIDATION ==========
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// ========== UPLOAD PROGRESS ==========
export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}

// ========== CONSTANTS ==========
export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: LucideIcon;
}> = {
    active: {
        label: 'Active',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircleIcon
    },
    expired: {
        label: 'Expired',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircleIcon
    },
    archived: {
        label: 'Archived',
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700',
        icon: ArchiveIcon
    },
    pending_verification: {
        label: 'Pending Verification',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: ClockIcon
    }
};