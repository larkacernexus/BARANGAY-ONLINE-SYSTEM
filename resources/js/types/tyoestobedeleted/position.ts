// Add these to your existing types.ts file

export interface Committee {
    id: number;
    name: string;
    code: string;
}

export interface Role {
    id: number;
    name: string;
}

export interface Position {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    role_id: number;
    requires_account: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    committee?: Committee;
    role?: Role;
    officials_count?: number;
}

export interface PositionFilters {
    search?: string;
    status?: string;
    requires_account?: string;
    sort_by?: 'name' | 'order' | 'created_at' | 'status' | 'officials_count';
    sort_order?: 'asc' | 'desc';
}

export interface PositionStats {
    total: number;
    active: number;
    requires_account: number;
    kagawad_count: number;
    inactive: number;
    assigned: number;
    unassigned: number;
}