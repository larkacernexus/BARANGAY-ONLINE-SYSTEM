export interface DiscountType {
    id: number;
    name: string;
    code: string;
    default_percentage: number;
}

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    contact_number?: string;
    email?: string;
    age?: number;
    gender?: string;
}

export interface ResidentPrivilege {
    id: number;
    resident_id: number;
    privilege_id: number;
    id_number?: string;
    verified_at: string | null;
    expires_at: string | null;
    created_at: string;
    resident: Resident;
}

export interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    discount_type_id: number;
    default_discount_percentage: string | number | null;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    created_at: string;
    updated_at: string;
    discount_type?: DiscountType;
    residents_count?: number;
    active_residents_count?: number;
    pending_count?: number;
    expired_count?: number;
}