// types/admin/forms/form.types.ts

import { ReactNode } from 'react';

// Base Form interface
export interface Form {
    mime_type(mime_type: any): ReactNode;
    version: string;
    created_by: any;
    id: number;
    title: string;
    description?: string;
    category: string;
    issuing_agency: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_type: string;
    download_count: number;
    is_active: boolean;
    is_featured: boolean;
    view_count: number;
    last_downloaded_at?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    
    // Optional fields for display
    formatted_size?: string;
    formatted_date?: string;
    category_label?: string;
    agency_label?: string;
    status_label?: string;
}

// Form Category interface
export interface FormCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    sort_order: number;
    is_active: boolean;
    form_count: number;
    created_at: string;
    updated_at: string;
}

// Form Agency interface
export interface FormAgency {
    id: number;
    name: string;
    code: string;
    description?: string;
    website?: string;
    contact?: string;
    email?: string;
    logo?: string;
    is_active: boolean;
    form_count: number;
    created_at: string;
    updated_at: string;
}

// Form Version interface
export interface FormVersion {
    id: number;
    form_id: number;
    version: string;
    file_path: string;
    file_name: string;
    file_size: number;
    changelog?: string;
    is_current: boolean;
    created_at: string;
    updated_at: string;
}

// Form Download interface
export interface FormDownload {
    id: number;
    form_id: number;
    user_id?: number;
    ip_address: string;
    user_agent?: string;
    downloaded_at: string;
    form?: Form;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

// Pagination data
export interface PaginationData {
    data: Form[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links?: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Filter types
export interface Filters {
    search?: string;
    category?: string;
    agency?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    is_featured?: boolean | string;
    file_type?: string;
    min_size?: number;
    max_size?: number;
}

export interface FilterState {
    search: string;
    category: string;
    agency: string;
    status: string;
    from_date: string;
    to_date: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    is_featured: string;
    file_type: string;
    min_size: string;
    max_size: string;
}

// Stats interface
export interface Stats {
    total: number;
    active: number;
    downloads: number;
    categories_count: number;
    agencies_count: number;
    featured_count?: number;
    total_size?: number;
    recent_downloads?: number;
    popular_forms?: PopularForm[];
    top_categories?: CategoryStat[];
    top_agencies?: AgencyStat[];
    downloads_by_month?: MonthlyDownload[];
}

export interface PopularForm {
    id: number;
    title: string;
    download_count: number;
}

export interface CategoryStat {
    category: string;
    count: number;
}

export interface AgencyStat {
    agency: string;
    count: number;
}

export interface MonthlyDownload {
    month: string;
    count: number;
}

// Selection stats
export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    featured: number;
    totalDownloads: number;
    totalSize: number;
    byCategory: Record<string, number>;
    byAgency: Record<string, number>;
    byStatus: Record<string, number>;
    byFileType: Record<string, number>;
}

// Bulk operation types
export type BulkOperation = 
    | 'delete' 
    | 'activate' 
    | 'deactivate' 
    | 'export' 
    | 'download' 
    | 'export_csv'
    | 'change_status'
    | 'change_category';

export type BulkEditField = 
    | 'status' 
    | 'category' 
    | 'agency' 
    | 'is_featured';

export type SelectionMode = 'page' | 'filtered' | 'all';

// Props for the Forms Index page
export interface FormsIndexProps {
    forms?: PaginationData;
    filters?: Filters;
    categories?: string[];
    agencies?: string[];
    stats?: Stats;
    flash?: FlashMessages;
}

// Props for the Forms Show page
export interface FormsShowProps {
    form: Form;
    versions?: FormVersion[];
    related_forms?: Form[];
    stats?: {
        total_downloads: number;
        recent_downloads: FormDownload[];
        average_rating?: number;
        total_reviews?: number;
    };
}

// Props for the Forms Create page
export interface FormsCreateProps {
    categories: FormCategory[];
    agencies: FormAgency[];
    errors?: Record<string, string>;
}

// Props for the Forms Edit page
export interface FormsEditProps {
    form: Form;
    categories: FormCategory[];
    agencies: FormAgency[];
    versions?: FormVersion[];
    errors?: Record<string, string>;
}

// Form data for create/edit
export interface FormFormData {
    title: string;
    description: string;
    category: string;
    issuing_agency: string;
    is_active: boolean;
    is_featured: boolean;
    file?: File;
    version?: string;
    changelog?: string;
}

// Form upload response
export interface FormUploadResponse {
    success: boolean;
    message: string;
    form?: Form;
    errors?: Record<string, string[]>;
}

// Download tracking
export interface DownloadTracking {
    form_id: number;
    user_id?: number;
    ip_address: string;
    user_agent?: string;
    downloaded_at: string;
}

// Flash message types
export interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

// API Response types
export interface FormApiResponse {
    success: boolean;
    message?: string;
    data?: Form | Form[];
    errors?: Record<string, string[]>;
}

export interface BulkOperationResponse {
    success: boolean;
    message: string;
    processed_count: number;
    failed_count: number;
    errors?: BulkOperationError[];
}

export interface BulkOperationError {
    id: number;
    error: string;
}

// Form validation
export interface ValidationRules {
    title: {
        required: boolean;
        min?: number;
        max?: number;
    };
    category: {
        required: boolean;
    };
    issuing_agency: {
        required: boolean;
    };
    file: {
        required: boolean;
        max_size: number;
        allowed_types: string[];
    };
}

export const formValidationRules: ValidationRules = {
    title: {
        required: true,
        min: 3,
        max: 255
    },
    category: {
        required: true
    },
    issuing_agency: {
        required: true
    },
    file: {
        required: true,
        max_size: 10 * 1024 * 1024, // 10MB
        allowed_types: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png'
        ]
    }
};

// Form search options
export interface SearchOptions {
    query: string;
    category?: string;
    agency?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

// Form statistics
export interface FormStatistics {
    total_forms: number;
    active_forms: number;
    total_downloads: number;
    total_categories: number;
    total_agencies: number;
    most_downloaded: Form[];
    recently_added: Form[];
    recently_updated: Form[];
    category_distribution: Record<string, number>;
    agency_distribution: Record<string, number>;
    downloads_timeline: TimelineEntry[];
}

export interface TimelineEntry {
    date: string;
    count: number;
}

// Utility functions with proper typing
export const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

export const formatDateTime = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid Date';
    }
};

export const getStatusColor = (isActive: boolean): string => {
    return isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

export const getStatusIcon = (isActive: boolean): ReactNode => {
    // This should be implemented with actual icons from lucide-react
    return null;
};

export const getStatusVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
};

export const getStatusLabel = (isActive: boolean): string => {
    return isActive ? 'Active' : 'Inactive';
};

export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Health & Medical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'Education': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        'Employment': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        'Housing': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
        'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    };
    return colors[category] || colors['Other'];
};

export const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        'Social Services': 'Social Services',
        'Permits & Licenses': 'Permits & Licenses',
        'Health & Medical': 'Health & Medical',
        'Education': 'Education',
        'Legal & Police': 'Legal & Police',
        'Employment': 'Employment',
        'Housing': 'Housing',
        'Other': 'Other'
    };
    return labels[category] || category;
};

export const getAgencyColor = (agency: string): string => {
    const colors: Record<string, string> = {
        'Barangay': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Municipal': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'City': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'Provincial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'National': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    };
    return colors[agency] || colors['Other'];
};

export const getAgencyLabel = (agency: string): string => {
    const labels: Record<string, string> = {
        'Barangay': 'Barangay',
        'Municipal': 'Municipal',
        'City': 'City',
        'Provincial': 'Provincial',
        'National': 'National',
        'Other': 'Other'
    };
    return labels[agency] || agency;
};

export const getFileTypeIcon = (fileType: string): string => {
    const icons: Record<string, string> = {
        'application/pdf': 'FileText',
        'application/msword': 'FileText',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',
        'application/vnd.ms-excel': 'FileSpreadsheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'FileSpreadsheet',
        'image/jpeg': 'Image',
        'image/png': 'Image'
    };
    return icons[fileType] || 'File';
};

export const getFileTypeColor = (fileType: string): string => {
    const colors: Record<string, string> = {
        'application/pdf': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'application/msword': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'application/vnd.ms-excel': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'image/jpeg': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'image/png': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[fileType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

export const getFileTypeLabel = (fileType: string): string => {
    const labels: Record<string, string> = {
        'application/pdf': 'PDF',
        'application/msword': 'Word Document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
        'application/vnd.ms-excel': 'Excel Spreadsheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
        'image/jpeg': 'JPEG Image',
        'image/png': 'PNG Image'
    };
    return labels[fileType] || fileType.split('/').pop()?.toUpperCase() || 'Unknown';
};

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface PageProps {
    auth?: any;
    flash?: FlashMessage;
    errors?: Record<string, string>;
    [key: string]: any;
}