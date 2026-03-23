// forms-show/types/form.types.ts
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

export interface Permissions {
    can_download: boolean;
    can_print: boolean;
    can_share: boolean;
}

export interface StatusConfig {
    label: string;
    color: string;
    icon: React.ElementType;
    bgColor: string;
    gradient: string;
}