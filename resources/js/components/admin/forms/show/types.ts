// resources/js/Pages/Admin/Forms/types.ts
export interface Form {
    id: number;
    title: string;
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
    created_by?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    last_downloaded_at?: string;
    last_downloaded_by?: {
        id: number;
        name: string;
        email: string;
    };
    last_viewed_at?: string;
    last_viewed_by?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface PageProps {
    form?: Form;
    related_forms?: Form[];
    download_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
    };
    view_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface Tab {
    id: string;
    label: string;
    icon: string;
}