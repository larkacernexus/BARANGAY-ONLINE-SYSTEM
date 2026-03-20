// resources/js/Pages/Admin/ClearanceTypes/types.ts
export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description: string;
    category: string;
    is_required: boolean;
}

export interface PrivilegeData {
    id: number;
    name: string;
    code: string;
    description?: string;
    default_discount_percentage?: number;
    requires_id_number?: boolean;
    requires_verification?: boolean;
    validity_years?: number;
    is_active: boolean;
}

export interface DiscountConfig {
    privilege_id: number;
    privilege_code: string;
    privilege_name: string;
    discount_percentage: number;
    is_active: boolean;
    requires_verification: boolean;
    requires_id_number: boolean;
}

export interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number | string;
    is_discountable: boolean;
    processing_days: number | string;
    validity_days: number | string;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    purpose_options: string;
    eligibility_criteria: any;
    created_at: string;
    updated_at: string;
    clearances_count: number;
    document_types?: DocumentType[];
    discount_configs?: DiscountConfig[];
    [key: string]: any;
}

export interface ShowClearanceTypeProps {
    clearanceType: ClearanceType;
    recentClearances?: Array<{
        id: number;
        resident_name: string;
        status: string;
        created_at: string;
    }>;
    privileges?: PrivilegeData[];
}

export interface Statistic {
    label: string;
    value: number;
    icon: React.ElementType;
    description: string;
    color: string;
}

export interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
    count?: number;
}