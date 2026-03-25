// /types/portal/forms/form.types.ts
import { LucideIcon } from 'lucide-react';

// ========== BASIC TYPES ==========
export interface Form {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    issuing_agency: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_type: string;
    mime_type: string;
    download_count: number;
    view_count: number;
    is_active: boolean;
    is_featured: boolean;
    is_public: boolean;
    requires_login: boolean;
    tags: string[];
    version?: string;
    valid_from?: string;
    valid_until?: string;
    language?: string;
    pages?: number;
    created_at: string;
    updated_at: string;
    
    related_forms?: Array<{
        id: number;
        title: string;
        slug: string;
        category: string;
        download_count: number;
        file_type: string;
        file_size: number;
    }>;
}

// ========== PAGINATION ==========
export interface PaginationData {
    current_page: number;
    data: Form[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// ========== STATS ==========
export interface Stats {
    total: number;
    active: number;
    downloads: number;
    categories_count: number;
    agencies_count: number;
    popular_categories: Array<{category: string; count: number}>;
    popular_agencies: Array<{agency: string; count: number}>;
}

// ========== FILTERS ==========
export interface FormFilters {
    search?: string;
    category?: string;
    agency?: string;
    sort_by?: string;
    sort_order?: string;
    page?: string;
}

// ========== PERMISSIONS ==========
export interface Permissions {
    can_download: boolean;
    can_print: boolean;
    can_share: boolean;
    can_view_versions?: boolean;
    can_leave_feedback?: boolean;
    requires_login?: boolean;
    requires_verification?: boolean;
}

// ========== STATUS CONFIG ==========
export interface StatusConfig {
    label: string;
    color: string;
    icon: React.ElementType;
    bgColor: string;
    textColor?: string;
    borderColor?: string;
    gradient: string;
}

// ========== FORM ATTACHMENTS ==========
export interface FormAttachment {
    id: number;
    form_id: number;
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    description?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

// ========== FORM VERSIONS ==========
export interface FormVersion {
    id: number;
    form_id: number;
    version_number: string;
    file_path: string;
    file_name: string;
    file_size: number;
    changelog?: string;
    is_current: boolean;
    created_by?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

// ========== FORM DOWNLOADS ==========
export interface FormDownload {
    id: number;
    form_id: number;
    user_id?: number;
    user_name?: string;
    user_email?: string;
    ip_address?: string;
    user_agent?: string;
    downloaded_at: string;
}

// ========== FORM FEEDBACK ==========
export interface FormFeedback {
    id: number;
    form_id: number;
    user_id?: number;
    user_name?: string;
    user_email?: string;
    rating: number;
    comment?: string;
    is_helpful: boolean;
    created_at: string;
    updated_at: string;
}

// ========== RELATED FORM ==========
export interface RelatedForm {
    id: number;
    title: string;
    slug: string;
    category: string;
    description?: string;
    download_count: number;
    view_count: number;
    file_type: string;
    file_size: number;
    formatted_file_size: string;
    is_featured: boolean;
    created_at: string;
}

// ========== FORM STATS ==========
export interface FormStats {
    total(total: any): unknown;
    active: any;
    downloads(downloads: any): unknown;
    popular_categories: any;
    agencies_count: any;
    popular_agencies: any;
    categories_count: any;
    total_downloads: number;
    total_views: number;
    average_rating?: number;
    total_feedback: number;
    helpful_count: number;
    not_helpful_count: number;
    downloads_today: number;
    downloads_this_week: number;
    downloads_this_month: number;
}

// ========== PAGE PROPS ==========
export interface FormPageProps {
    form: Form;
    permissions: Permissions;
    stats: FormStats;
    relatedForms: RelatedForm[];
    user?: {
        id: number;
        name: string;
        email: string;
        has_downloaded?: boolean;
    };
    canEdit?: boolean;
    canDelete?: boolean;
    error?: string;
}

// ========== FORM ACTIONS ==========
export interface FormAction {
    id: string;
    label: string;
    icon: LucideIcon;
    color?: string;
    requiresAuth?: boolean;
    requiresVerification?: boolean;
    action: () => void;
}

// ========== TAB CONFIGURATION ==========
export interface FormTab {
    id: string;
    label: string;
    icon: LucideIcon;
    count?: number;
    isActive?: boolean;
    component?: React.ReactNode;
}