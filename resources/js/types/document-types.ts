// types/document-types.ts
export interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description?: string;
    document_category_id: number;
    category?: DocumentCategory;
    is_required: boolean;
    is_active: boolean;
    accepted_formats?: string[];
    max_file_size: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    
    // Computed properties
    accepted_formats_list?: string;
    max_file_size_mb?: number;
    category_name?: string;
    category_slug?: string;
}

export type BulkOperation = 
    | 'delete' 
    | 'activate' 
    | 'deactivate' 
    | 'export' 
    | 'export_csv' 
    | 'duplicate' 
    | 'update_required';

export type BulkEditField = 'status' | 'required' | 'category';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface FilterState {
    search: string;
    status: string;
    category: string;
    required: string;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    required: number;
    optional: number;
    hasFormats: number;
    totalFileSizeMB: number;
    maxFileSizeMB: number;
    categories: Record<number, number>;
}