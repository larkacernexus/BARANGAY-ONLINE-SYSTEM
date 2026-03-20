// resources/js/Pages/Admin/Puroks/types.ts
export interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    member_count: number;
    address: string;
    contact_number: string;
    created_at: string;
}

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age: number;
    gender: string;
    contact_number: string;
    address: string;
    created_at: string;
}

export interface Stat {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

export interface Demographics {
    gender: {
        male: number;
        female: number;
        other: number;
    };
    age_groups: {
        children: number;
        adults: number;
        seniors: number;
    };
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface Purok {
    id: number;
    name: string;
    slug: string;
    description: string;
    leader_name: string;
    leader_contact: string;
    google_maps_url: string;
    latitude: number;
    longitude: number;
    total_households: number;
    total_residents: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface PurokShowProps {
    purok: Purok;
    stats: Stat[];
    recentHouseholds: Household[];
    recentResidents: Resident[];
    demographics: Demographics;
    households: PaginatedData<Household>;
    residents: PaginatedData<Resident>;
    flash?: {
        success?: string;
        error?: string;
    };
}