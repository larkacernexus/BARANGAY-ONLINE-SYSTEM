// resources/js/Pages/Admin/FeeTypes/types.ts
export interface DiscountFeeType {
    id: number;
    fee_type_id: number;
    discount_type_id: number;
    percentage: number | string;
    is_active: boolean;
    sort_order: number | null;
    notes: string | null;
    discount_type?: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        default_percentage: number | string;
        legal_basis: string | null;
        requirements: string[] | null;
        is_active: boolean;
        is_mandatory: boolean;
        sort_order: number | null;
    };
}

export interface FeeType {
    amount: number;
    id: number;
    code: string;
    name: string;
    short_name: string | null;
    category: string;
    base_amount: number | string;
    amount_type: string;
    computation_formula: Record<string, any> | null;
    unit: string | null;
    has_senior_discount: boolean;
    has_pwd_discount: boolean;
    has_solo_parent_discount: boolean;
    has_indigent_discount: boolean;
    discount_percentage: number | string | null;
    has_surcharge: boolean;
    surcharge_percentage: number | string | null;
    surcharge_fixed: number | string | null;
    has_penalty: boolean;
    penalty_percentage: number | string | null;
    penalty_fixed: number | string | null;
    frequency: string;
    validity_days: number | null;
    applicable_to: string;
    applicable_puroks: string[] | string | null;
    requirements: string[] | string | null;
    approval_needed: boolean;
    effective_date: string;
    expiry_date: string | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    due_day: number | null;
    sort_order: number | null;
    description: string | null;
    notes: string | null;
    fees_count: number;
    discount_fee_types?: DiscountFeeType[];
    
    // Added properties
    senior_discount_percentage?: number | string | null;
    pwd_discount_percentage?: number | string | null;
    solo_parent_discount_percentage?: number | string | null;
    indigent_discount_percentage?: number | string | null;
    created_at: string;
    updated_at: string;
}

export interface Fee {
    id: number;
    code: string;
    amount: number | string;
    status: string;
    due_date: string;
    resident?: {
        full_name: string;
        purok: string;
    };
    household?: {
        household_number: string;
        purok: string;
    };
}

export interface PageProps {
    feeType: FeeType;
    recentFees?: Fee[];
    statistics?: {
        total_collected?: number;
        total_pending?: number;
        total_overdue?: number;
        average_amount?: number;
    };
}

export interface Statistic {
    label: string;
    value: string | number;
    icon: string;
    description: string;
    color: string;
}