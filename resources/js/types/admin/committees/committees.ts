export interface Committee {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    positions_count?: number;
}

export interface PageProps {
    auth?: any;
    flash?: any;
    errors?: Record<string, string>;
    [key: string]: any;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface CommitteesIndexProps {
    committees?: {
        data: Committee[];
        meta?: PaginationMeta;
    };
    filters?: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
    };
    stats?: {
        total: number;
        active: number;
        inactive: number;
        with_positions: number;
        without_positions: number;
    };
}

export type BulkOperation = 'export' | 'delete' | 'activate' | 'deactivate' | 'print' | 'export_csv' | 'generate_report';