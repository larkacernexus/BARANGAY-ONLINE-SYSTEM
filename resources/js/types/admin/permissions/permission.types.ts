// types/admin/permissions/permission.types.ts

export interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    module: string;
    is_active: boolean;
    roles_count?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PermissionStats {
    total: number;
    active: number;
    inactive: number;
    modules: number;
    rolesAssigned: number;
}

export interface FilterParams {
    search?: string;
    module?: string;
    status?: 'all' | 'active' | 'inactive';
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links?: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    meta: PaginationMeta;
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface ModuleInfo {
    name: string;
    display_name?: string;
    description?: string;
    icon?: string;
    permissions_count?: number;
}

export interface Role {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    is_active: boolean;
    permissions_count?: number;
    users_count?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role_names?: string[];
    has_permission?: boolean;
}

export interface SystemModule {
    name: string;
    display_name: string;
    description?: string;
    icon?: string;
    permissions_count?: number;
    order?: number;
    is_active?: boolean;
}

export interface DeveloperContactDetails {
    name: string;
    email: string;
    phone: string;
    department: string;
    company: string;
    website: string;
    officeHours: string;
    specialization: string;
    responseTime: string;
    notes: string;
}

export interface PermissionsIndexProps {
    permissions: Paginated<Permission>;
    modules: string[] | ModuleInfo[];
    filters: FilterParams;
    stats?: PermissionStats;
}

export interface PermissionCreateProps {
    modules?: SystemModule[];
    validation_errors?: Record<string, string>;
}

// Updated PermissionShowProps with can property
export interface PermissionShowProps {
    permission: Permission;
    roles?: Role[];
    users?: User[];
    can?: {
        edit: boolean;
        delete: boolean;
    };
}

export interface AuditLogEntry {
    id: number;
    user_id: number;
    user_name: string;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'assigned' | 'revoked';
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export interface PermissionAssignment {
    permission_id: number;
    role_id: number;
    assigned_by: number;
    assigned_at: string;
    is_active: boolean;
    expiry_date?: string | null;
}

// Enums for better type safety
export enum PermissionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ALL = 'all'
}

export enum PermissionAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage'
}

export enum ExportFormat {
    CSV = 'csv',
    EXCEL = 'xlsx',
    PDF = 'pdf'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

// Helper types for API responses
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface BulkOperationResponse {
    success: boolean;
    assigned_count?: number;
    removed_count?: number;
    failed_count?: number;
    errors?: string[];
}

// Utility type for permission checks
export type PermissionCheck = {
    has_permission: boolean;
    permission_name: string;
    role_names?: string[];
};

export type PermissionsMap = Record<string, PermissionCheck>;

export const filterParamsToRecord = (params: FilterParams): Record<string, string | number | undefined> => {
    return params as Record<string, string | number | undefined>;
};