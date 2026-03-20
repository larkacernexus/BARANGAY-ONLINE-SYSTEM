// resources/js/Pages/Admin/Residents/Show/types.ts

export interface HouseholdHead {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number?: string;
    purok?: string;
    purok_id?: number;
    photo_path?: string;
    photo_url?: string;
}

export interface HouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        age: number;
        gender: string;
        civil_status: string;
        contact_number?: string;
        purok?: string;
        purok_id?: number;
        photo_path?: string;
        photo_url?: string;
    };
}

export interface Household {
    id: number;
    household_number: string;
    contact_number: string;
    email?: string;
    address: string;
    purok?: string;
    purok_id: number;
    member_count: number;
    income_range?: string;
    housing_type?: string;
    ownership_status?: string;
    water_source?: string;
    electricity: boolean;
    internet: boolean;
    vehicle: boolean;
    remarks?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    head_resident?: HouseholdHead;
}

export interface HouseholdMembership {
    id: number;
    household_id: number;
    relationship_to_head: string;
    is_head: boolean;
}

export interface RelatedHouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    relationship_to_current?: string;
    is_head: boolean;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        age: number;
        gender: string;
        civil_status: string;
        contact_number?: string;
        purok?: string;
        purok_id?: number;
        photo_path?: string;
        photo_url?: string;
    };
}

export interface DiscountType {
    id: number;
    name: string;
    code: string;
}

export interface ResidentPrivilege {
    id: number;
    resident_id: number;
    privilege_id: number;
    id_number?: string;
    issued_date?: string;
    expiry_date?: string;
    verified_at?: string;
    verified_by?: number;
    status: 'active' | 'expired' | 'pending' | 'expiring_soon';
    remarks?: string;
    created_at: string;
    updated_at: string;
    
    // Joined privilege data
    privilege?: {
        id: number;
        name: string;
        code: string;
        description?: string;
        is_active: boolean;
        discount_type_id?: number;
        default_discount_percentage?: number;
        requires_id_number: boolean;
        requires_verification: boolean;
        validity_years?: number;
        discount_type?: DiscountType;
    };
    
    // Computed fields
    discount_percentage?: number;
    discount_type_name?: string;
    discount_code?: string;
    discount_legal_basis?: string;
    discount_requirements?: string[];
    privilege_name?: string;
    privilege_code?: string;
    privilege_description?: string;
}

export interface Resident {
    id: number;
    resident_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number?: string;
    email?: string;
    address: string;
    purok_id: number;
    purok_name?: string;
    household_id?: number;
    occupation?: string;
    education?: string;
    religion?: string;
    is_voter: boolean;
    place_of_birth?: string;
    remarks?: string;
    status: string;
    photo_path?: string;
    photo_url?: string;
    created_at: string;
    updated_at: string;
    
    privileges?: ResidentPrivilege[];
    
    household?: Household | null;
    household_membership?: HouseholdMembership | null;
    related_household_members?: RelatedHouseholdMember[];
}

export interface HouseholdOption {
    id: number | string;
    household_number: string;
    head_of_family: string;
    member_count: number;
    address?: string;
    purok?: string;
}

export interface PageProps {
    resident: Resident;
    household?: Household | null;
    household_membership?: HouseholdMembership | null;
    related_household_members?: RelatedHouseholdMember[];
    households?: HouseholdOption[];
    puroks?: Array<{ id: number; name: string }>;
    flash?: {
        success?: string;
        error?: string;
    };
}