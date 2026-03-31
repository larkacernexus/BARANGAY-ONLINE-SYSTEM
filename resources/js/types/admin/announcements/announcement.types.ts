// types/admin/announcements/announcement.types.ts

export type AnnouncementType = 'general' | 'important' | 'event' | 'maintenance' | 'other';
export type PriorityLevel = 1 | 2 | 3 | 4;
export type AudienceType = 'all' | 'roles' | 'puroks' | 'households' | 'household_members' | 'businesses' | 'specific_users';
export type AnnouncementStatus = 'draft' | 'pending' | 'published' | 'active' | 'archived';

export interface AnnouncementAttachment {
    id: number;
    announcement_id?: number; // Make optional for admin view
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    description?: string;
    created_at: string;
    updated_at?: string;
    created_by?: string;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    excerpt?: string;
    type: AnnouncementType;
    type_label: string;
    priority: PriorityLevel;
    priority_label: string;
    is_active: boolean;
    audience_type: AudienceType;
    audience_type_label: string;
    audience_summary: string;
    estimated_reach?: number;
    target_roles: number[] | null;
    target_puroks: number[] | null;
    target_households: number[] | null;
    target_businesses: number[] | null;
    target_users: number[] | null;
    start_date: string | null;
    end_date: string | null;
    start_time?: string | null;
    end_time?: string | null;
    formatted_date_range: string;
    created_at: string;
    updated_at: string;
    status: AnnouncementStatus;
    status_label: string;
    status_color: string;
    is_currently_active: boolean;
    has_attachments: boolean;
    attachments_count: number;
    attachments?: AnnouncementAttachment[];
    creator?: {
        id: number;
        name: string;
        email: string;
    } | null;
    author?: {
        id: number;
        name: string;
        role?: string;
        avatar?: string;
    };
    views_count?: number;
}

export interface Role {
    id: number;
    name: string;
}

export interface Purok {
    id: number;
    name: string;
}

export interface Household {
    id: number;
    household_number: string;
    purok?: Purok;
}

export interface Business {
    id: number;
    business_name: string;
    owner_name?: string;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role?: Role;
}

export interface AudienceDetails {
    roles?: Role[];
    puroks?: Purok[];
    households?: Household[];
    businesses?: Business[];
    users?: User[];
}

export interface AnnouncementStats {
    total: number;
    active: number;
    unread: number;
    personalized: number;
    with_attachments: number;
    expired: number;
    upcoming: number;
    draft?: number;
    scheduled?: number;
    archived?: number;
}

export interface AnnouncementFilters {
    search?: string;
    type?: string;
    priority?: string;
    from_date?: string;
    status?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    author_id?: string;
    has_attachments?: boolean;
}

export interface PaginationData {
    data: Announcement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export type BulkOperation = 
    | 'delete'
    | 'activate'
    | 'deactivate'
    | 'publish'
    | 'archive'
    | 'export'
    | 'print'
    | 'change_status'
    | 'change_type'
    | 'copy_data';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    upcoming: number;
    types: Record<string, number>;
    priorities: Record<string, number>;
    authors?: Record<string, number>;
    statuses?: Record<string, number>;
}

export interface AnnouncementsPaginatedResponse {
    data: Announcement[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
}