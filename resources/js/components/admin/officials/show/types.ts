// resources/js/Pages/Admin/Officials/types.ts
export interface Resident {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    birth_date?: string;
    civil_status: string;
    contact_number?: string;
    email?: string;
    address: string;
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
}

export interface Official {
    user: any;
    official_id: string;
    first_name: any;
    middle_name: any;
    last_name: any;
    suffix: string;
    phone: any;
    purok: any;
    is_active: any;
    id: number;
    position: string;
    full_position: string;
    committee?: string;
    committee_name?: string;
    term_start: string;
    term_end: string;
    term_duration: string;
    status: string;
    order: number;
    responsibilities?: string;
    contact_number?: string;
    email?: string;
    achievements?: string;
    photo_path?: string;
    photo_url?: string;
    is_regular: boolean;
    is_current: boolean;
    created_at: string;
    updated_at: string;
    resident?: Resident;
}

export interface ShowOfficialProps {
    official: Official;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
}