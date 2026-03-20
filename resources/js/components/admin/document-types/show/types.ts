// resources/js/Pages/Admin/DocumentTypes/types.ts
export interface DocumentType {
    processing_days: any;
    id: number;
    code: string;
    name: string;
    description: string | null;
    document_category_id: number;
    is_required: boolean;
    is_active: boolean;
    accepted_formats: string[] | string;
    accepted_formats_list: string;
    max_file_size: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    category?: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    };
    clearanceRequirements?: any[];
    requiredByClearanceTypes?: any[];
}

export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    document_requirements_count?: number;
    pivot?: {
        is_required: boolean;
        sort_order: number;
    };
}

export interface PageProps {
    documentType: DocumentType;
    requiredClearanceTypes: ClearanceType[];
    recentApplications: any[];
    max_file_size_mb: number;
}

export interface Statistic {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
}