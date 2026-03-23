// types/portal/records/document.types.ts

import React from 'react';

// ==================== Security Types ====================

export interface SecurityOptions {
    add_watermark?: boolean;
    enable_encryption?: boolean;
    audit_log_access?: boolean;
    scan_quality?: 'low' | 'medium' | 'high' | 'original';
    restrict_download?: boolean;
    restrict_print?: boolean;
    max_downloads?: number;
    expiration_days?: number;
    ip_restriction?: string[];
    allowed_ips?: string[];
    allowed_devices?: string[];
    session_timeout?: number;
    require_2fa?: boolean;
    [key: string]: any;
}

// ==================== Core Types ====================

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
    description?: string;
    is_active: boolean;
    order?: number;
    count?: number;
}

export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description?: string;
    category_id?: number;
    requires_approval?: boolean;
    validity_days?: number;
    template_path?: string;
}

export interface UploadedByUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

// ==================== Main Document Type (for actual use) ====================

export interface AppDocument {
    id: number;
    name: string;
    file_name?: string;
    file_extension?: string;
    file_size?: number;
    file_size_human?: string;
    mime_type?: string;
    description?: string;
    reference_number?: string;
    issue_date?: string;
    expiry_date?: string;
    view_count?: number;
    download_count?: number;
    is_public?: boolean;
    requires_password: boolean;
    password?: string;
    status?: string;
    status_reason?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    
    // Relations
    resident_id?: number;
    resident?: Resident;
    document_category_id?: number;
    category?: Category;
    document_type_id?: number;
    document_type?: DocumentType;
    
    // File info
    file_path?: string;
    preview_url?: string;
    thumbnail_url?: string;
    original_name?: string;
    checksum?: string;
    
    // Metadata
    metadata?: Record<string, any> | null;
    tags?: string[];
    
    // User info
    uploaded_by?: number;
    uploaded_at?: string;
    uploaded_by_user?: UploadedByUser;
    
    // Security
    security_options?: SecurityOptions;
    
    // Status
    is_archived?: boolean;
    is_favorite?: boolean;
    is_pinned?: boolean;
    is_trashed?: boolean;
    
    // Approval
    approval_status?: 'pending' | 'approved' | 'rejected' | 'draft';
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    
    // UI State (frontend only)
    ui?: {
        is_expanded?: boolean;
        is_selected?: boolean;
        is_loading?: boolean;
        error?: string;
    };
}

// Type alias for backward compatibility
export type Document = AppDocument;

// ==================== Extended Document Types ====================

export interface DocumentVersion {
    id: number;
    document_id: number;
    version_number: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_size_human: string;
    file_extension: string;
    mime_type: string;
    created_at: string;
    created_by: number;
    created_by_user?: UploadedByUser;
    changes?: string;
    is_current: boolean;
}

export interface DocumentComment {
    id: number;
    document_id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user?: UploadedByUser;
    replies?: DocumentComment[];
    parent_id?: number;
}

export interface DocumentActivity {
    id: number;
    document_id: number;
    user_id: number;
    action: DocumentAction;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user?: UploadedByUser;
}

export interface DocumentShare {
    id: number;
    document_id: number;
    shared_by: number;
    shared_with: number;
    permission: 'view' | 'download' | 'edit' | 'full';
    expires_at?: string;
    created_at: string;
    shared_by_user?: UploadedByUser;
    shared_with_user?: UploadedByUser;
}

export interface DocumentExpiration {
    is_expired: boolean;
    days_until_expiry?: number;
    expires_at?: string;
    can_renew: boolean;
    renewal_url?: string;
    grace_period_days?: number;
}

// ==================== Related Document Types ====================

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

// ==================== API Response Types ====================

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
    path?: string;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

export interface DocumentListResponse extends PaginatedResponse<AppDocument> {
    categories: Category[];
    storageStats?: {
        used: string;
        limit: string;
        available: string;
        percentage: number;
        document_count?: number;
    };
    filters: DocumentFilters;
    householdResidents?: Resident[];
    household?: {
        id: number;
        household_number: string;
        head_of_family: string;
        head_resident_id?: number;
    };
    stats?: {
        total: number;
        by_category: Record<string, number>;
        by_status: Record<string, number>;
        total_size: number;
        total_size_human: string;
        recent_uploads: number;
    };
}

export interface DocumentDetailsResponse {
    document: AppDocument;
    relatedDocuments: RelatedDocument[];
    permissions: {
        can_view: boolean;
        can_download: boolean;
        can_edit: boolean;
        can_delete: boolean;
        can_share: boolean;
        can_comment: boolean;
        can_approve: boolean;
    };
    activities?: DocumentActivity[];
    comments?: DocumentComment[];
    versions?: DocumentVersion[];
}

// ==================== Filter Types ====================

export interface DocumentFilters {
    search?: string;
    category?: string;
    resident?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    tags?: string[];
    is_public?: boolean;
    requires_password?: boolean;
    sort_by?: 'name' | 'created_at' | 'updated_at' | 'file_size' | 'view_count' | 'download_count';
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
    trashed?: boolean;
    archived?: boolean;
    favorite?: boolean;
}

// ==================== Upload Types ====================

export interface DocumentUpload {
    name: string;
    description?: string;
    category_id: number;
    document_type_id?: number;
    file: File;
    is_public?: boolean;
    requires_password?: boolean;
    password?: string;
    expiry_date?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    security_options?: Partial<SecurityOptions>;
}

export interface DocumentUploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
    error?: string;
    uploaded_size?: number;
    total_size?: number;
    speed?: number;
    time_remaining?: number;
}

// ==================== Permission Types ====================

export interface DocumentPermission {
    id: number;
    document_id: number;
    user_id: number;
    permission: 'view' | 'download' | 'edit' | 'delete' | 'share' | 'manage';
    granted_by: number;
    granted_at: string;
    expires_at?: string;
    user?: Resident;
    granted_by_user?: UploadedByUser;
}

// ==================== Document Status Types ====================

export type DocumentStatus = 
    | 'draft'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'active'
    | 'expired'
    | 'archived'
    | 'deleted'
    | 'processing'
    | 'failed';

export interface DocumentStatusConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge: string;
    description: string;
    actions?: string[];
}

// ==================== Document Sort Options ====================

export interface DocumentSortOption {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    default_order?: 'asc' | 'desc';
}

// ==================== Document View Types ====================

export type DocumentViewMode = 'grid' | 'list';
export type DocumentViewSize = 'small' | 'medium' | 'large';

// ==================== Document Preview Types ====================

export interface DocumentPreview {
    url: string;
    type: 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'code' | 'unknown';
    mime_type: string;
    extension: string;
    can_preview: boolean;
    preview_url?: string;
    thumbnail_url?: string;
    embed_url?: string;
    download_url?: string;
}

// ==================== Document Export Types ====================

export interface DocumentExportOptions {
    format: 'pdf' | 'csv' | 'json' | 'zip';
    include_metadata?: boolean;
    include_comments?: boolean;
    include_activities?: boolean;
    quality?: 'low' | 'medium' | 'high';
    pages?: number[];
    filename?: string;
}

// ==================== Document Share Types ====================

export interface DocumentShareOptions {
    user_ids?: number[];
    emails?: string[];
    permission: 'view' | 'download' | 'edit' | 'full';
    expires_at?: string;
    require_password?: boolean;
    password?: string;
    max_downloads?: number;
    message?: string;
}

export interface DocumentShareLink {
    id: string;
    url: string;
    token: string;
    permission: string;
    expires_at?: string;
    max_downloads?: number;
    download_count: number;
    created_at: string;
}

// ==================== Document Action Types ====================

export type DocumentAction = 
    | 'view'
    | 'download'
    | 'print'
    | 'share'
    | 'delete'
    | 'restore'
    | 'update'
    | 'create'
    | 'comment'
    | 'version'
    | 'approve'
    | 'reject'
    | 'archive'
    | 'favorite'
    | 'pin';

// ==================== Document Notification Types ====================

export interface DocumentNotification {
    id: number;
    document_id: number;
    user_id: number;
    type: 'share' | 'comment' | 'approval' | 'expiry' | 'version';
    message: string;
    read_at?: string;
    created_at: string;
    document?: AppDocument;
    user?: UploadedByUser;
}

// ==================== Document Analytics Types ====================

export interface DocumentAnalytics {
    document_id: number;
    period: 'day' | 'week' | 'month' | 'year' | 'all';
    views: {
        total: number;
        unique: number;
        by_date: Array<{ date: string; count: number }>;
        by_hour?: Array<{ hour: number; count: number }>;
    };
    downloads: {
        total: number;
        unique: number;
        by_date: Array<{ date: string; count: number }>;
    };
    shares: {
        total: number;
        by_date: Array<{ date: string; count: number }>;
    };
    avg_time_spent?: number;
    bounce_rate?: number;
    top_referrers?: Array<{ source: string; count: number }>;
    devices?: Array<{ device: string; count: number }>;
    browsers?: Array<{ browser: string; count: number }>;
    locations?: Array<{ country: string; count: number }>;
}

// ==================== Document Search Types ====================

export interface DocumentSearchResult {
    document: AppDocument;
    relevance_score: number;
    matched_fields: string[];
    highlight?: {
        name?: string;
        description?: string;
        content?: string;
    };
}

export interface DocumentSearchOptions {
    query: string;
    categories?: number[];
    residents?: number[];
    date_from?: string;
    date_to?: string;
    tags?: string[];
    status?: DocumentStatus[];
    limit?: number;
    offset?: number;
    sort_by?: 'relevance' | 'date' | 'views' | 'downloads';
    sort_order?: 'asc' | 'desc';
}

// ==================== Document Template Types ====================

export interface DocumentTemplate {
    id: number;
    name: string;
    description?: string;
    category_id?: number;
    file_path: string;
    file_extension: string;
    file_size: number;
    thumbnail_url?: string;
    variables: Array<{
        name: string;
        label: string;
        type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
        required: boolean;
        default?: any;
        options?: string[];
    }>;
    created_at: string;
    updated_at: string;
}

// ==================== Document Signature Types ====================

export interface DigitalSignature {
    id: number;
    document_id: number;
    user_id: number;
    signature_type: 'electronic' | 'digital' | 'wet';
    signature_data?: string;
    certificate_id?: string;
    signed_at: string;
    ip_address?: string;
    user_agent?: string;
    user?: UploadedByUser;
}

export interface SignatureRequest {
    id: number;
    document_id: number;
    requested_by: number;
    requested_to: number;
    status: 'pending' | 'signed' | 'rejected' | 'expired';
    expires_at?: string;
    created_at: string;
    signed_at?: string;
    document?: AppDocument;
    requested_by_user?: UploadedByUser;
    requested_to_user?: UploadedByUser;
}

// ==================== OCR Types ====================

export interface OCRResult {
    id: number;
    document_id: number;
    text: string;
    confidence: number;
    language: string;
    pages: Array<{
        page_number: number;
        text: string;
        confidence: number;
        words: Array<{
            text: string;
            confidence: number;
            bounding_box: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        }>;
    }>;
    processed_at: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
}

// ==================== Utility Types ====================

export interface FileInfo {
    name: string;
    size: number;
    size_human: string;
    extension: string;
    mime_type: string;
    last_modified: Date;
    preview?: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export interface ValidationResult {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    metadata?: Record<string, any>;
}

// ==================== Component Props Types ====================

export interface DocumentCardProps {
    document: AppDocument;
    viewMode?: DocumentViewMode;
    size?: DocumentViewSize;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (id: number) => void;
    onClick?: (document: AppDocument) => void;
    onDownload?: (document: AppDocument) => void;
    onShare?: (document: AppDocument) => void;
    onDelete?: (document: AppDocument) => void;
    onFavorite?: (document: AppDocument) => void;
    className?: string;
}

export interface DocumentFiltersProps {
    filters: DocumentFilters;
    onFilterChange: (filters: DocumentFilters) => void;
    categories?: Category[];
    residents?: Resident[];
    tags?: string[];
    loading?: boolean;
    className?: string;
}

export interface DocumentUploadProps {
    onUpload: (files: File[], options: DocumentUpload) => void;
    multiple?: boolean;
    maxSize?: number;
    allowedExtensions?: string[];
    categories?: Category[];
    documentTypes?: DocumentType[];
    className?: string;
}

// ==================== Page Props Types ====================

export interface DocumentPageProps {
    document: AppDocument;
    relatedDocuments?: RelatedDocument[];
    canDownload?: boolean;
    canDelete?: boolean;
    error?: string;
    needsPassword?: boolean;
    sessionExpiry?: string;
    sessionData?: any;
    debugMode?: boolean;
    householdResidents?: Resident[];
    currentResident?: Resident;
    household?: {
        id: number;
        household_number: string;
        head_of_family: string;
        head_resident_id?: number;
    };
}

// ==================== Constants ====================

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, DocumentStatusConfig> = {
    draft: {
        label: 'Draft',
        icon: () => null,
        color: 'gray',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        description: 'Document is in draft mode'
    },
    pending: {
        label: 'Pending',
        icon: () => null,
        color: 'yellow',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        description: 'Awaiting approval'
    },
    approved: {
        label: 'Approved',
        icon: () => null,
        color: 'green',
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        description: 'Document has been approved'
    },
    rejected: {
        label: 'Rejected',
        icon: () => null,
        color: 'red',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        description: 'Document has been rejected'
    },
    active: {
        label: 'Active',
        icon: () => null,
        color: 'green',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        description: 'Document is active and accessible'
    },
    expired: {
        label: 'Expired',
        icon: () => null,
        color: 'red',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        description: 'Document has expired'
    },
    archived: {
        label: 'Archived',
        icon: () => null,
        color: 'gray',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        description: 'Document is archived'
    },
    deleted: {
        label: 'Deleted',
        icon: () => null,
        color: 'gray',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        description: 'Document is in trash'
    },
    processing: {
        label: 'Processing',
        icon: () => null,
        color: 'blue',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        description: 'Document is being processed'
    },
    failed: {
        label: 'Failed',
        icon: () => null,
        color: 'red',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        description: 'Document processing failed'
    }
};

export const DOCUMENT_SORT_OPTIONS: DocumentSortOption[] = [
    { value: 'date', label: 'Date', icon: () => null, default_order: 'desc' },
    { value: 'name', label: 'Name', icon: () => null, default_order: 'asc' },
    { value: 'size', label: 'Size', icon: () => null, default_order: 'desc' }
];

export const DOCUMENT_VIEW_MODES: Record<DocumentViewMode, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
    grid: { icon: () => null, label: 'Grid View' },
    list: { icon: () => null, label: 'List View' }
};

// ==================== Type Guards ====================

export const isAppDocument = (obj: any): obj is AppDocument => {
    return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
};

export const isDocument = isAppDocument; // Alias for backward compatibility

export const isCategory = (obj: any): obj is Category => {
    return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj && 'slug' in obj;
};

export const isResident = (obj: any): obj is Resident => {
    return obj && typeof obj === 'object' && 'id' in obj && 'first_name' in obj && 'last_name' in obj;
};

// ==================== Helper Functions ====================

export const getDocumentStatusConfig = (status: string): DocumentStatusConfig => {
    return DOCUMENT_STATUS_CONFIG[status as DocumentStatus] || DOCUMENT_STATUS_CONFIG.active;
};

export const getDocumentStatusBadge = (status: string): string => {
    return getDocumentStatusConfig(status).badge;
};

export const getDocumentStatusColor = (status: string): string => {
    return getDocumentStatusConfig(status).color;
};

export const getDocumentStatusLabel = (status: string): string => {
    return getDocumentStatusConfig(status).label;
};

export const isDocumentExpired = (document: AppDocument): boolean => {
    if (!document.expiry_date) return false;
    try {
        return new Date(document.expiry_date) < new Date();
    } catch {
        return false;
    }
};

export const formatDocumentDate = (dateString?: string, isMobile?: boolean): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        if (isMobile) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

export const formatDocumentDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'N/A';
    }
};

export const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getResidentName = (resident?: Resident | null, residentId?: number, residents?: Resident[]): string => {
    if (resident) {
        if (resident.full_name) return resident.full_name;
        if (resident.first_name || resident.last_name) {
            return `${resident.first_name || ''} ${resident.last_name || ''}`.trim();
        }
    }
    
    if (residentId && residents) {
        const found = residents.find(r => r.id === residentId);
        if (found) {
            if (found.full_name) return found.full_name;
            return `${found.first_name || ''} ${found.last_name || ''}`.trim();
        }
    }
    
    return 'Unknown Resident';
};

export const getResidentInitials = (name: string): string => {
    if (!name || name === 'Unknown Resident') return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export const getCategoryDisplay = (category?: Category | null): string => {
    if (!category) return 'Uncategorized';
    return category.name;
};

export const getDocumentPreviewUrl = (document: AppDocument): string => {
    if (document.preview_url) return document.preview_url;
    if (document.file_path) return `/storage/${document.file_path}`;
    return `/my-records/${document.id}/preview`;
};

export const getDocumentDownloadUrl = (document: AppDocument): string => {
    return `/my-records/${document.id}/download`;
};

export const getDocumentShareUrl = (document: AppDocument, token: string): string => {
    return `/shared/documents/${token}`;
};

export const canViewDocument = (document: AppDocument, currentResidentId?: number): boolean => {
    if (document.is_public) return true;
    if (currentResidentId && document.resident_id === currentResidentId) return true;
    return false;
};

export const canDownloadDocument = (document: AppDocument, currentResidentId?: number): boolean => {
    if (!canViewDocument(document, currentResidentId)) return false;
    if (document.security_options?.restrict_download) return false;
    return true;
};

export const canEditDocument = (document: AppDocument, currentResidentId?: number): boolean => {
    if (!currentResidentId) return false;
    if (document.resident_id === currentResidentId) return true;
    return false;
};

export const canDeleteDocument = (document: AppDocument, currentResidentId?: number): boolean => {
    if (!currentResidentId) return false;
    if (document.resident_id === currentResidentId) return true;
    return false;
};

export const canShareDocument = (document: AppDocument, currentResidentId?: number): boolean => {
    if (!currentResidentId) return false;
    if (document.resident_id === currentResidentId) return true;
    return false;
};

export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
        console.log(successMessage);
    } catch (error) {
        console.error('Failed to copy:', error);
    }
};

export const getCsrfToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    return metaToken ? metaToken.getAttribute('content') : null;
};

// ==================== Storage Utilities ====================

export interface StorageStats {
    used: string;
    limit: string;
    available: string;
    percentage: number;
    document_count?: number;
}

export const calculateStorageStats = (documents: AppDocument[], storageLimit: string = '100 MB'): StorageStats => {
    const parseSize = (size: string): number => {
        const units: Record<string, number> = {
            'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024
        };
        const match = size.match(/^([\d.]+)\s*([A-Z]+)$/i);
        if (!match) return 0;
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        return value * (units[unit] || 1);
    };
    
    const limitBytes = parseSize(storageLimit);
    const usedBytes = documents.reduce((total, doc) => total + (doc.file_size || 0), 0);
    const availableBytes = Math.max(0, limitBytes - usedBytes);
    const percentage = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;
    
    return {
        used: formatFileSize(usedBytes),
        limit: storageLimit,
        available: formatFileSize(availableBytes),
        percentage: Math.min(percentage, 100),
        document_count: documents.length
    };
};

// ==================== Search Utilities ====================

export const searchDocuments = (documents: AppDocument[], searchTerm: string): AppDocument[] => {
    if (!searchTerm) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter(doc => 
        doc.name?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.reference_number?.toLowerCase().includes(term) ||
        doc.file_name?.toLowerCase().includes(term)
    );
};

export const filterDocumentsByCategory = (documents: AppDocument[], categoryId?: string): AppDocument[] => {
    if (!categoryId || categoryId === 'all') return documents;
    const id = parseInt(categoryId);
    return documents.filter(doc => doc.document_category_id === id);
};

export const filterDocumentsByResident = (documents: AppDocument[], residentId?: string): AppDocument[] => {
    if (!residentId || residentId === 'all') return documents;
    const id = parseInt(residentId);
    return documents.filter(doc => doc.resident_id === id);
};