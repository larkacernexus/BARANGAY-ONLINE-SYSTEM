// types/fee-types.ts
export interface FeeType {
    id: number;
    code: string;
    name: string;
    short_name: string;
    description?: string;
    base_amount: number | string | null;
    amount_type: string;
    frequency: string;
    validity_days: number | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    document_category_id: number | null;
    document_category?: {
        name: string;
        icon?: string;
        color?: string;
    };
    created_at: string;
    updated_at: string;
}

export type BulkOperation = 'export' | 'print' | 'delete' | 'activate' | 'deactivate' | 'update_category' | 'export_csv' | 'export_pdf' | 'duplicate' | 'generate_reports' | 'send_message';

export type BulkEditField = 'status' | 'category';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface FilterState {
    search: string;
    category: string;
    status: string;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    mandatory: number;
    autoGenerate: number;
    totalAmount: number;
    fixedAmount: number;
    variableAmount: number;
}

export interface PageProps {
    feeTypes: FeeType[];
    categories: Record<string, string>;
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}