// types/resident.ts
export interface Purok {
    id: number;
    name: string;
}

export interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string;
    discount_percentage?: number;
    requires_id_number?: boolean;
    requires_verification?: boolean;
    validity_years?: number;
    is_active?: boolean;
}

export interface PrivilegeAssignment {
    privilege_id: number;
    id_number?: string;
    verified_at?: string;
    expires_at?: string;
    remarks?: string;
    discount_percentage?: number;
}

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number: string;
    email: string;
    address: string;
    purok_id: number | null;
    resident_id: string;
    household_id: number | null;
    occupation: string;
    education: string;
    religion: string;
    is_voter: boolean;
    place_of_birth: string;
    remarks: string;
    status: string;
    photo_path: string | null;
    created_at: string;
    updated_at: string;
    
    // New privileges data
    privileges?: PrivilegeAssignment[];
    
    // Relationships
    purok?: {
        id: number;
        name: string;
    };
    household_relation?: {
        id: number;
        household_number: string;
    };
}

export interface ResidentFormData {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number: string;
    email: string;
    address: string;
    purok_id: number | null;
    occupation: string;
    education: string;
    religion: string;
    is_voter: boolean;
    place_of_birth: string;
    remarks: string;
    status: string;
    photo: File | null;
    privileges: PrivilegeAssignment[];
    _method: 'PUT';
}