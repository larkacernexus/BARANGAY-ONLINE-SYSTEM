// types/announcement.ts

export interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
    type_label: string;
    priority: 0 | 1 | 2 | 3 | 4;
    priority_label: string;
    is_active: boolean;
    audience_type: 'all' | 'roles' | 'puroks' | 'households' | 'household_members' | 'businesses' | 'specific_users';
    audience_summary?: string;
    estimated_reach?: number;
    target_roles?: number[];
    target_puroks?: number[];
    target_households?: number[];
    target_businesses?: number[];
    target_users?: number[];
    start_date?: string | null;
    start_time?: string | null;
    end_date?: string | null;
    end_time?: string | null;
    formatted_date_range?: string;
    created_at: string;
    updated_at: string;
    status: 'active' | 'upcoming' | 'expired' | 'inactive';
    status_label: string;
    status_color: string;
    is_currently_active?: boolean;
    creator?: {
        id: number;
        name: string;
        email?: string;
    };
}

export interface AnnouncementFormData {
    title: string;
    content: string;
    type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
    priority: number;
    is_active: boolean;
    audience_type: string;
    target_roles: number[];
    target_puroks: number[];
    target_households: number[];
    target_businesses: number[];
    target_users: number[];
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
}

export interface AnnouncementFilters {
    search?: string;
    type?: string;
    audience_type?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
}

export interface AnnouncementStats {
    total: number;
    active: number;
    expired: number;
    upcoming: number;
    inactive: number;
    by_audience: {
        all: number;
        roles: number;
        puroks: number;
        households: number;
        household_members: number;
        businesses: number;
        specific_users: number;
    };
}

export interface Role {
    id: number;
    name: string;
}

export interface Purok {
    id: number;
    name: string;
}

export interface Household {
    id: number;
    household_number: string;
    purok_id?: number;
    purok?: Purok;
    address?: string;
}

export interface Business {
    id: number;
    business_name: string;
    owner_name?: string;
    owner_id?: number;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    email: string;
    role_id?: number;
    role?: Role;
    household_id?: number;
    household?: Household;
}

export type BulkOperation = 
    | 'delete' 
    | 'activate' 
    | 'deactivate' 
    | 'publish' 
    | 'archive' 
    | 'change_audience'
    | 'export'
    | 'copy_data';

export type SelectionMode = 'page' | 'filtered' | 'all' | 'none';