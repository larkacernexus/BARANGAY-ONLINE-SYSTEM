// types/admin/banners/banner.ts

/**
 * Banner interface representing a banner entity
 */
export interface Banner {
    id: number;
    title: string;
    description: string | null;
    image_path: string | null;
    mobile_image_path: string | null;
    image_url?: string | null;
    mobile_image_url?: string | null;
    link_url: string | null;
    button_text: string | null;
    alt_text: string | null;
    sort_order: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    target_audience: BannerTargetAudience;
    target_puroks: number[] | null;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    // Relationships
    creator?: User;
    updater?: User;
    puroks?: Purok[];
    
    // Computed properties
    has_image?: boolean;
    has_mobile_image?: boolean;
    is_currently_active?: boolean;
    is_scheduled?: boolean;
    is_expired?: boolean;
    is_pending?: boolean;
}

/**
 * Banner target audience types
 */
export type BannerTargetAudience = 'all' | 'specific_puroks';

/**
 * Banner form data interface for create/edit
 */
export interface BannerFormData {
    title: string;
    description: string;
    image_path: string;
    mobile_image_path: string;
    link_url: string;
    button_text: string;
    alt_text: string;
    sort_order: number;
    is_active: boolean;
    start_date: string;
    end_date: string;
    target_audience: BannerTargetAudience;
    target_puroks: number[];
}

/**
 * Banner filters for index page
 */
export interface BannerFilters {
    search?: string;
    is_active?: boolean | '';
    target_audience?: BannerTargetAudience | '';
    sort_by?: BannerSortField;
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

/**
 * Banner sort field options
 */
export type BannerSortField = 
    | 'title'
    | 'sort_order'
    | 'is_active'
    | 'start_date'
    | 'end_date'
    | 'created_at'
    | 'updated_at';

/**
 * Banner bulk action types
 */
export type BannerBulkAction = 
    | 'activate'
    | 'deactivate'
    | 'delete'
    | 'duplicate'
    | 'change_order';

/**
 * Banner statistics interface
 */
export interface BannerStats {
    total: number;
    active: number;
    inactive: number;
    scheduled: number;
    expired: number;
    by_audience: {
        all: number;
        specific_puroks: number;
    };
}

/**
 * Banner validation errors
 */
export interface BannerValidationErrors {
    title?: string[];
    description?: string[];
    image_path?: string[];
    mobile_image_path?: string[];
    link_url?: string[];
    button_text?: string[];
    alt_text?: string[];
    sort_order?: string[];
    is_active?: string[];
    start_date?: string[];
    end_date?: string[];
    target_audience?: string[];
    target_puroks?: string[];
}

/**
 * Banner props for create page
 */
export interface BannerCreateProps {
    puroks: Purok[];
    nextOrder?: number;
}

/**
 * Banner props for edit page
 */
export interface BannerEditProps {
    banner: Banner;
    puroks: Purok[];
}

/**
 * Banner props for index page
 */
export interface BannerIndexProps {
    banners: {
        data: Banner[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: BannerFilters;
    stats: BannerStats;
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        toggle_active: boolean;
        reorder: boolean;
    };
}

/**
 * Banner props for show page
 */
export interface BannerShowProps {
    banner: Banner;
    can: {
        edit: boolean;
        delete: boolean;
        toggle_active: boolean;
    };
}

/**
 * Purok interface (minimal for banner targeting)
 */
export interface Purok {
    id: number;
    name: string;
    code?: string;
}

/**
 * User interface (minimal for audit trail)
 */
export interface User {
    id: number;
    name: string;
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

/**
 * Banner preview data interface
 */
export interface BannerPreviewData {
    title: string;
    description: string | null;
    image_url: string | null;
    mobile_image_url: string | null;
    link_url: string | null;
    button_text: string | null;
    alt_text: string | null;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    target_audience: BannerTargetAudience;
    target_puroks_count: number;
    sort_order: number;
}

/**
 * Banner table column configuration
 */
export interface BannerTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

/**
 * Banner reorder item
 */
export interface BannerReorderItem {
    id: number;
    order: number;
}

/**
 * Banner reorder request
 */
export interface BannerReorderRequest {
    orders: BannerReorderItem[];
}

/**
 * Banner toggle active response
 */
export interface BannerToggleResponse {
    success: boolean;
    is_active: boolean;
    message: string;
}

/**
 * Banner bulk action request
 */
export interface BannerBulkActionRequest {
    ids: number[];
    action: BannerBulkAction;
    data?: Record<string, any>;
}

/**
 * Banner bulk action response
 */
export interface BannerBulkActionResponse {
    success: boolean;
    message: string;
    affected_count: number;
    failed_ids?: number[];
}

/**
 * Helper type for banner status badge
 */
export type BannerStatus = 'active' | 'inactive' | 'scheduled' | 'expired' | 'pending';

/**
 * Banner status configuration
 */
export interface BannerStatusConfig {
    label: string;
    color: string;
    bgColor: string;
    darkBgColor: string;
    icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Banner audience configuration
 */
export interface BannerAudienceConfig {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

/**
 * Banner form tabs configuration
 */
export interface BannerFormTab {
    id: 'basic' | 'media' | 'targeting' | 'schedule';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    requiredFields: string[];
    description?: string;
}

/**
 * Banner media upload result
 */
export interface BannerMediaUploadResult {
    success: boolean;
    path?: string;
    url?: string;
    error?: string;
}

/**
 * Banner visibility check result
 */
export interface BannerVisibilityResult {
    visible: boolean;
    reason?: string;
    audience_match?: boolean;
    schedule_match?: boolean;
    active_match?: boolean;
}