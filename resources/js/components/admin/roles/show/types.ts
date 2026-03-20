// resources/js/Pages/Admin/Roles/types.ts
export interface Permission {
    id: number;
    name: string;
    display_name: string;
    module: string;
    description?: string;
}

export interface RecentUser {
    id: number;
    name: string;
    email: string;
    username: string;
    status: 'active' | 'inactive';
}

export interface Role {
    id: number;
    name: string;
    description: string;
    is_system_role: boolean;
    created_at: string;
    updated_at: string;
    users_count?: number;
    permissions?: Permission[];
    recent_users?: RecentUser[];
}

export interface RolesShowProps {
    role: Role;
}

export interface Statistic {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
}