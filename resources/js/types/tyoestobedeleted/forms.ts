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
    download_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface PaginationData {
    current_page: number;
    data: Form[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface Filters {
    search?: string;
    category?: string;
    agency?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
}

export interface Stats {
    total: number;
    active: number;
    downloads: number;
    categories_count: number;
    agencies_count: number;
}

export interface PageProps {
    forms: PaginationData;
    filters: Filters;
    categories: string[];
    agencies: string[];
    stats: Stats;
    flash?: {
        success?: string;
        error?: string;
    };
}