// types/official.ts

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    age: number;
    gender: string;
    birth_date?: string;
    civil_status?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    photo_path?: string;
    photo_url?: string;
    purok?: {
        id: number;
        name: string;
    };
    household?: {
        id: number;
        household_number: string;
        address: string;
    };
    is_head_of_household?: boolean;
    full_name?: string;
}

export interface Position {
    id: number;
    code: string;
    name: string;
    description?: string;
    order: number;
    role_id: number;
    requires_account: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    committee_id?: number | null;
    additional_committees?: number[];
}

export interface Committee {
    id: number;
    code: string;
    name: string;
    description?: string;
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    is_system_role?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    username: string;
    email?: string;
    contact_number?: string;
    position?: string; // This stores the position name (e.g., "Barangay Captain")
    role_id: number;
    resident_id: number;
    status: 'active' | 'inactive' | 'suspended';
    household_id?: number;
    current_resident_id?: number;
    last_login_at?: string;
    last_login_ip?: string;
    created_at?: string;
    updated_at?: string;
    role?: Role;
    resident?: Resident;
    current_resident?: Resident;
    household?: {
        id: number;
        household_number: string;
        address: string;
    };
    full_name?: string;
    has_qr_code?: boolean;
    is_logged_in?: boolean;
}

export interface OfficialFormData {
    // Resident & Position
    resident_id: number | null;
    position_id: number | null;
    committee_id: number | null;
    
    // Term Details
    term_start: string;
    term_end: string;
    status: 'active' | 'inactive' | 'former';
    order: number;
    
    // Official Details
    responsibilities: string;
    contact_number: string;
    email: string;
    achievements: string;
    
    // Photo
    photo: File | null;
    use_resident_photo: boolean;
    
    // Official Type
    is_regular: boolean;
    
    // 🔥 KEY: Position Account Assignment (NOT user creation)
    user_id: number | null; // The position account being assigned to this resident
}

export interface Official {
    id: number;
    resident_id: number;
    position_id: number;
    committee_id: number | null;
    term_start: string;
    term_end: string;
    status: 'active' | 'inactive' | 'former';
    order: number;
    responsibilities: string | null;
    contact_number: string | null;
    email: string | null;
    achievements: string | null;
    photo_path: string | null;
    photo_url?: string;
    is_regular: boolean;
    user_id: number | null; // The position account assigned
    created_at?: string;
    updated_at?: string;
    
    // Relationships
    resident?: Resident;
    positionData?: Position;
    committeeData?: Committee;
    user?: User; // The assigned position account
    
    // Computed attributes
    is_current?: boolean;
    full_position?: string;
    position_name?: string;
    position_code?: string;
    committee_name?: string;
    committee_code?: string;
    term_duration?: string;
}

export interface OfficialFilters {
    search?: string;
    status?: 'all' | 'current' | 'active' | 'inactive' | 'former';
    position?: string;
    committee?: string;
    type?: 'all' | 'regular' | 'ex_officio';
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
}

export interface OfficialStats {
    total: number;
    active: number;
    current: number;
    former: number;
    regular: number;
    ex_officio: number;
    by_position: Record<string, number>;
}

export interface OfficialIndexProps {
    officials: {
        data: Official[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    stats: OfficialStats;
    filters: OfficialFilters;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    statusOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
}

export interface CreateOfficialProps {
    positions: Position[];
    committees: Committee[];
    availableResidents: Resident[];
    availableUsers: User[]; // 🔥 Position accounts only!
    defaultTermStart: string;
    defaultTermEnd: string;
    roles: Role[];
}

export interface EditOfficialProps {
    official: Official & {
        resident: Resident;
        positionData: Position;
        committeeData?: Committee;
        user?: User;
    };
    positions: Position[];
    committees: Committee[];
    availableResidents: Resident[];
    availableUsers: User[]; // 🔥 Position accounts only!
    roles: Role[];
    statusOptions: Array<{ value: string; label: string }>;
}

export interface ShowOfficialProps {
    official: Official & {
        resident: Resident & {
            purok?: { id: number; name: string };
            household?: { id: number; household_number: string; address: string };
        };
        positionData: Position;
        committeeData?: Committee;
        user?: User;
    };
    positions: Array<{ value: number; label: string }>;
    committees: Record<number, string>;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface CurrentOfficialsResponse {
    data: Official[];
}

export interface CommitteeOfficialsResponse {
    committee: string;
    description?: string;
    officials: Official[];
}

// Form Error Types
export interface OfficialFormErrors {
    resident_id?: string;
    position_id?: string;
    committee_id?: string;
    term_start?: string;
    term_end?: string;
    status?: string;
    contact_number?: string;
    email?: string;
    photo?: string;
    user_id?: string;
    [key: string]: string | undefined;
}