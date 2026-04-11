// types/admin/document-types/document-types.ts

// Add missing icon imports or use any for icons
import { CheckCircle, FileCheck, FileX, Folder, ListOrdered } from 'lucide-react';

export interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
}

// Simple category type for API responses
export interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

export interface PageProps extends Record<string, any> {
    documentTypes: DocumentType[] | null;
    filters: {
        search?: string;
        status?: string;
        category?: string;
        required?: string;
    } | null;
    stats: {
        total: number;
        active: number;
        required: number;
        optional: number;
        max_file_size_mb: number;
        has_formats: number;
    } | null;
    categories: CategoryOption[] | null;
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

// Show page specific types
export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_required: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RecentApplication {
    clearance_type: any;
    clearance_type_name: any;
    applicant_name: string | undefined;
    id: number;
    report_number: string;
    title: string;
    status: string;
    created_at: string;
    complainant_name?: string;
}

export interface ShowPageProps extends Record<string, any> {
    documentType: DocumentType;
    requiredClearanceTypes: ClearanceType[];
    recentApplications: RecentApplication[];
    max_file_size_mb: number;
}

export interface StatisticItem {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
}

export interface Statistic {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
}