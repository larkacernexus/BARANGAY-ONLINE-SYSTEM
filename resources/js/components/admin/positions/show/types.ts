// resources/js/Pages/Admin/Positions/types.ts
export interface Committee {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

export interface Role {
    id: number;
    name: string;
    description: string;
}

export interface Official {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    start_date: string;
    end_date: string | null;
}

export interface Position {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    role_id: number | null;
    requires_account: boolean;
    is_active: boolean;
    committee_id: number | null;
    additional_committees: number[];
    created_at: string;
    updated_at: string;
    committee?: Committee;
    role?: Role;
    officials?: Official[];
    officials_count?: number;
    all_committees?: Committee[];
}

export interface PositionShowProps {
    position: Position;
}