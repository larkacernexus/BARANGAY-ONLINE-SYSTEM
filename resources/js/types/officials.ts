// types/officials.types.ts
export interface Official {
    id: number;
    position: string;
    full_position: string;
    committee?: string;
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
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        full_name: string;
        age: number;
        gender: string;
        contact_number?: string;
        photo_path?: string;
        photo_url?: string;
    };
}

export interface OfficialsProps {
    officials: {
        data: Official[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    stats: {
        total: number;
        active: number;
        current: number;
        former: number;
        regular: number;
        ex_officio: number;
        by_position: Record<string, number>;
        by_committee: Record<string, number>;
        by_status: Record<string, number>;
    };
    filters: {
        search?: string;
        status?: string;
        position?: string;
        committee?: string;
        type?: string;
        sort_by?: string;
        sort_order?: string;
    };
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    statusOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
}