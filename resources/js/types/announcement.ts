export interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
    priority: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface PaginatedAnnouncements {
    data: Announcement[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface FilterOptions {
    search?: string;
    type?: string;
    priority?: string;
}