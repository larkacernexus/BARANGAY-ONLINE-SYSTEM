// types/admin/roles/roles.types.ts
import { PageProps } from '@inertiajs/react';

// ==================== Core Type Definitions ====================

export interface Role {
    slug?: any;
    id: number;
    name: string;
    description?: string;
    is_system_role: boolean;
    users_count?: number;
    permissions_count?: number;
    permissions?: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    display_name: string;
    module: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    created_at: string;
}

// ==================== Stats Types ====================

export interface RoleStats {
    total: number;
    system_roles: number;
    custom_roles: number;
    active_roles: number;
    total_permissions: number;
    total_users: number;
    recent_roles?: Role[];
}

// ==================== UI State Types ====================

export interface FilterState {
    search: string;
    type: string;
}

export type BulkOperation = 
    | 'delete' 
    | 'change_type' 
    | 'export' 
    | 'export_csv' 
    | 'export_permissions' 
    | 'duplicate' 
    | 'archive' 
    | 'generate_report';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    systemRoles: number;
    customRoles: number;
    totalUsers: number;
    totalPermissions: number;
    latestRole?: string;
}

// ==================== Component Props ====================

// Custom props (without PageProps)
export interface RolesIndexCustomProps {
    roles: {
        data: Role[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        };
    };
    filters: {
        search: string;
        type: string;
    };
    stats: RoleStats;
}

// Use imported PageProps from Inertia
export type RolesIndexProps = RolesIndexCustomProps & PageProps;

// Similar for other props
export interface RoleCreateCustomProps {
    permissions?: Permission[];
    validation_errors?: Record<string, string>;
    success_message?: string;
}

export type RoleCreateProps = RoleCreateCustomProps & PageProps;

export interface RoleEditCustomProps {
    role: Role;
    permissions?: Permission[];
    validation_errors?: Record<string, string>;
    success_message?: string;
}

export type RoleEditProps = RoleEditCustomProps & PageProps;

export interface RoleShowCustomProps {
    role: Role & {
        permissions?: Permission[];
        users?: User[];
    };
    stats?: {
        users_count: number;
        permissions_count: number;
    };
}

export type RoleShowProps = RoleShowCustomProps & PageProps;

// ==================== Form Data Types ====================

export interface RoleFormData {
    name: string;
    description: string;
    is_system_role: boolean;
    permissions: number[];
}

// ==================== Utility Types ====================

export interface BadgeVariant {
    className: string;
    text: string;
}

export interface QuickFilterAction {
    label: string;
    icon: string;
    onClick: () => void;
    variant?: string;
    disabled?: boolean;
    tooltip?: string;
}

export type SortIcon = 'arrow-up-down' | 'chevron-up' | 'chevron-down';

export interface ExportRow {
    'ID': number;
    'Name': string;
    'Type': string;
    'Description': string;
    'Users': number;
    'Permissions': number;
    'Created At': string;
}

export interface PermissionExportRow {
    'Role': string;
    'Permissions': string;
    'Total Permissions': number;
}