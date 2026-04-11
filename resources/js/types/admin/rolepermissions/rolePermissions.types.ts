// types/admin/rolepermissions/rolePermissions.types.ts

// ==================== Core Type Definitions ====================

export interface Role {
    id: number;
    name: string;
    description?: string;
    is_system_role: boolean;
    users_count?: number;
    permissions?: number[];
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
    roles_count: any;
}

export interface Granter {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}

export interface RolePermission {
    granted_by_name: any;
    created_at: any;
    module: string | undefined;
    roles_count: any;
    granter_id: any;
    id: number;
    role_id: number;
    permission_id: number;
    granted_by: number;
    granted_at: string;
    expires_at?: string | null;
    permission_display_name?: string; 
    
    // Optional properties from nested objects (for backward compatibility)
    permission_name?: string;
    role_name?: string;
    permission_type?: string;
    role_type?: string;
    assigned_by_name?: string;
    assigned_by_email?: string;
    is_active: any;
    
    // Nested objects
    role?: Role;
    permission?: Permission;
    granter?: Granter;
}

// ==================== UI State Types ====================

export interface FilterState {
    search: string;
    role: string;
    module: string;
    granter: string;
    date_range: string;
    roles_count_range: string;
    sort: string;
    order: 'asc' | 'desc';
}

export type BulkOperation = 'export' | 'bulk_revoke' | 'print' | 'generate_report';
export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    uniqueRoles: number;
    uniquePermissions: number;
    uniqueModules: number;
    systemRoles: number;
    customRoles: number;
    latestAssignment?: string;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface RolePermissionResponse {
    data: RolePermission[];
    meta: PaginationMeta;
}

// ==================== Component Props ====================

// Props for the index page
export interface RolePermissionCustomProps {
    role_permissions?: {
        data: RolePermission[];
        meta: PaginationMeta;
    };
    filters?: {
        date_range(date_range: any, arg1: string): string | (() => string);
        roles_count_range(roles_count_range: any, arg1: string): string | (() => string);
        search?: string;
        role?: string;
        module?: string;
        granter?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    };
    roles?: Array<{ id: number; name: string }>;
    modules?: Array<string>;
    granters?: Array<{ id: number; name: string }>;
}

export type RolePermissionProps = RolePermissionCustomProps & Record<string, any>;

// Props for the create page
export interface RolePermissionCreateProps {
    roles?: Role[];
    permissions?: Permission[];
    modules?: string[];
    validation_errors?: Record<string, string>;
    success_message?: string;
}

// Props for the show page
export interface RolePermissionShowProps {
    role_permission: {
        id: number;
        role_id: number;
        permission_id: number;
        granted_by: number;
        granted_at: string;
        notes?: string;
        role: Role;
        permission: Permission;
        granter: Granter;
    };
}

// ==================== Form Data Types ====================

export interface RolePermissionFormData {
    role_id: string | number;
    permission_ids: number[];
    notes: string;
    grant_all_module_permissions: boolean;
}

// ==================== Grouping Types ====================

export interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

// ==================== Utility Types ====================

export interface BadgeVariant {
    className: string;
    text: string;
}

export type SortIcon = 'arrow-up-down' | 'chevron-up' | 'chevron-down';

export interface ExportRow {
    'ID': number;
    'Role Name': string;
    'Role Type': string;
    'Permission Name': string;
    'Permission Display': string;
    'Module': string;
    'Granted By': string;
    'Granted At': string;
    'Permission Status': string;
    'Role Users': number;
}