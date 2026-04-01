export interface Purok {
    id: number;
    name: string;
    slug: string;
    description: string;
    leader_name: string;
    leader_contact: string;
    google_maps_url: string;
    total_households: number;
    total_residents: number;
    status: string;
    created_at: string;
    updated_at?: string;
    households_count?: number;
    residents_count?: number;
    location?: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
}

export interface Demographics {
    gender: {
        male: number;
        female: number;
        other?: number;
    };
    ageGroups: {
        '0-17': number;
        '18-30': number;
        '31-59': number;
        '60+': number;
    };
    civilStatus: {
        single: number;
        married: number;
        widowed: number;
        divorced: number;
    };
    occupation: {
        employed: number;
        unemployed: number;
        student: number;
        retired: number;
    };
    education: {
        elementary: number;
        highSchool: number;
        college: number;
        postgraduate: number;
        none: number;
    };
}

export interface Household {
    latitude: any;
    longitude: any;
    id: number;
    purok_id: number;
    household_number: string;
    address: string;
    total_members: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    head_of_household?: Resident;
    members?: Resident[];
}

export interface Resident {
    id: number;
    household_id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    birth_date: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    civil_status: 'single' | 'married' | 'widowed' | 'divorced' | 'separated';
    occupation?: string;
    education_level?: string;
    is_active: boolean;
    is_head: boolean;
    contact_number?: string;
    email?: string;
    created_at: string;
    updated_at?: string;
    household?: Household;
}

// Generic paginated data interface
export interface PaginatedData<T = Household | Resident> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

export interface PurokFilters {
    search?: string;
    status?: string;
    sort_by?: 'name' | 'total_households' | 'total_residents' | 'created_at' | 'status' | 'leader_name';
    sort_order?: 'asc' | 'desc';
}

export interface PurokStats {
    total: number;
    active: number;
    totalHouseholds: number;
    totalResidents: number;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    totalHouseholds: number;
    totalResidents: number;
    avgHouseholds: number;
    avgResidents: number;
    hasLeaders: number;
    hasMaps: number;
}

export type BulkOperation = 
    | 'export' 
    | 'delete' 
    | 'update_status' 
    | 'send_message' 
    | 'print' 
    | 'export_csv' 
    | 'generate_report' 
    | 'copy_data' 
    | 'activate' 
    | 'deactivate' 
    | 'publish' 
    | 'archive' 
    | 'change_type' 
    | 'change_status';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface BulkActionData {
    action: string;
    purok_ids: number[];
    status?: string;
}

export interface ExportData {
    format: 'csv' | 'excel' | 'pdf';
    ids?: number[];
    filters?: PurokFilters;
}

export interface PuroksPageProps {
    puroks: PaginatedData<Purok>;
    filters: PurokFilters;
    stats: PurokStats;
}

// Enums
export enum PurokStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ALL = 'all'
}

export enum SortField {
    NAME = 'name',
    TOTAL_HOUSEHOLDS = 'total_households',
    TOTAL_RESIDENTS = 'total_residents',
    CREATED_AT = 'created_at',
    STATUS = 'status',
    LEADER_NAME = 'leader_name'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export enum BulkActionType {
    DELETE = 'delete',
    UPDATE_STATUS = 'update_status',
    EXPORT = 'export',
    EXPORT_CSV = 'export_csv',
    PRINT = 'print',
    SEND_MESSAGE = 'send_message',
    GENERATE_REPORT = 'generate_report',
    COPY_DATA = 'copy_data',
    ACTIVATE = 'activate',
    DEACTIVATE = 'deactivate',
    PUBLISH = 'publish',
    ARCHIVE = 'archive',
    CHANGE_TYPE = 'change_type',
    CHANGE_STATUS = 'change_status'
}

// Default values
export const defaultPurokStats: PurokStats = {
    total: 0,
    active: 0,
    totalHouseholds: 0,
    totalResidents: 0
};

export const defaultPurokFilters: PurokFilters = {
    status: 'all',
    sort_by: 'name',
    sort_order: 'asc'
};

export interface PaginationData {
    data: Purok[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

