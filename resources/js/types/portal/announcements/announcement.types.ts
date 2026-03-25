// /components/residentui/announcements/types.ts
export interface AnnouncementAttachment {
    id: number;
    announcement_id: number;
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface RelatedAnnouncement {
    id: number;
    title: string;
    type: string;
    type_label: string;
    priority: number;
    priority_label: string;
    excerpt?: string;
    created_at: string;
    has_attachments?: boolean;
    attachments_count?: number;
}

export interface Announcement {
    is_personalized: any;
    excerpt: string;
    id: number;
    title: string;
    content: string;
    type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
    type_label: string;
    priority: number;
    priority_label: string;
    is_currently_active: boolean;
    status: string;
    status_label: string;
    status_color: string;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    created_at: string;
    updated_at: string;
    audience_type: string;
    audience_summary: string;
    estimated_reach?: number;
    views_count?: number;
    has_attachments: boolean;
    attachments_count: number;
    attachments?: AnnouncementAttachment[];
    author?: {
        id: number;
        name: string;
        role?: string;
        avatar?: string;
    };
}

export interface TypeConfig {
    label: string;
    color: string;
    icon: React.ElementType;
    gradient: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    hoverColor: string;
}

export interface PriorityConfig {
    label: string;
    color: string;
    icon: React.ElementType;
    gradient: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

export interface AnnouncementStats {
    total: number;
    active: number;
    unread: number;
    personalized: number;
    with_attachments: number;
}

export interface AnnouncementFilters {
    search?: string;
    type?: string;
    priority?: string;
    status?: string;
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