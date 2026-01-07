import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// ==================== CORE TYPES ====================
export interface Auth {
    user: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role?: string;
    permissions?: string[];
    [key: string]: unknown;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
    icon?: LucideIcon;
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    badge?: number | string;
    permissions?: string[];
}

// ==================== BASE PAGE PROPS ====================
export interface PageProps {
    flash?: FlashMessage;
    auth: Auth;
    [key: string]: unknown;
}

export type UsePageProps<T extends PageProps = PageProps> = {
    props: T;
    url: string;
    component: string;
    version: string | null;
};

// ==================== PAGINATION & META ====================
export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface Paginated<T> {
    data: T[];
    meta: PaginationMeta;
    links?: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
}

// ==================== FILTER & SEARCH ====================
export interface FilterParams {
    search?: string;
    status?: string;
    module?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
    [key: string]: unknown;
}

export interface DateRangeFilter {
    from_date?: string;
    to_date?: string;
}

// ==================== STATS & METRICS ====================
export interface Stats {
    label: string;
    value: number | string;
    icon?: string;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
    change?: number;
    description?: string;
}

// ==================== PERMISSIONS MODULE ====================
export interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    module: string;
    guard_name: string;
    is_active: boolean;
    roles_count?: number;
    users_count?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PermissionWithRelations extends Permission {
    roles: Role[];
    pivot?: {
        role_id: number;
        permission_id: number;
    };
}

export interface PermissionFormData {
    name: string;
    display_name: string;
    description?: string;
    module: string;
    guard_name?: string;
    is_active: boolean;
}

export interface Role {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    guard_name: string;
    is_active?: boolean;
    permissions_count?: number;
    users_count?: number;
    created_at: string;
    updated_at: string;
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

export interface GuardType {
    name: string;
    display_name: string;
}

export interface SystemModule {
    name: string;
    display_name: string;
    description?: string;
    icon?: string;
    default_permissions?: string[];
}

export interface PermissionSummary {
    total_permissions: number;
    active_permissions: number;
    inactive_permissions: number;
    modules_count: number;
    average_permissions_per_module: number;
    unused_permissions_count: number;
    recently_added_count: number;
}

// ==================== PUROKS MODULE ====================
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
    updated_at: string;
    households_count?: number;
    residents_count?: number;
}

export interface PurokFormData {
    name: string;
    description?: string;
    leader_name?: string;
    leader_contact?: string;
    google_maps_url?: string;
    status: string;
}

// ==================== RESIDENTS MODULE ====================
export interface Resident {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address: string;
    purok: string;
    purok_id?: number;
    status: string;
    created_at: string;
    updated_at: string;
    birth_date?: string;
    gender?: string;
    occupation?: string;
    household_id?: number;
    [key: string]: unknown;
}

// ==================== FEES MODULE ====================
export interface Fee {
    id: number;
    fee_type_id: number;
    payer_type: string;
    payer_name: string;
    contact_number?: string;
    purok?: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    fee_code: string;
    created_at: string;
    updated_at: string;
    
    fee_type?: {
        name: string;
        category: string;
    };
    resident?: {
        name: string;
    };
    household?: {
        name: string;
    };
    payment?: {
        payment_date?: string;
    };
}

export interface FeeType {
    id: number;
    name: string;
    category: string;
    amount: number;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ==================== HOUSEHOLDS MODULE ====================
export interface Household {
    id: number;
    name: string;
    purok_id: number;
    address: string;
    contact_person: string;
    contact_number?: string;
    member_count: number;
    status: string;
    created_at: string;
    updated_at: string;
    
    purok?: Purok;
    residents?: Resident[];
}

// ==================== PAGE PROPS INTERFACES ====================

// Dashboard
export interface DashboardPageProps extends PageProps {
    stats?: {
        residents_count: number;
        households_count: number;
        fees_collected: number;
        pending_requests: number;
        active_puroks: number;
        total_permissions: number;
        [key: string]: number;
    };
    recent_activities?: Array<{
        id: number;
        description: string;
        user: string;
        time: string;
        type: string;
        icon: string;
    }>;
    charts?: {
        resident_distribution?: Array<{ purok: string; count: number }>;
        fee_collection?: Array<{ month: string; amount: number }>;
    };
}

// Permissions
export interface PermissionsIndexPageProps extends PageProps {
    permissions: Paginated<Permission>;
    modules: string[];
    filters: FilterParams;
    stats: Stats[];
    guard_types?: GuardType[];
    system_modules?: SystemModule[];
    summary?: PermissionSummary;
}

export interface PermissionFormPageProps extends PageProps {
    permission?: Permission;
    modules: string[];
    guard_types: GuardType[];
    validation_errors?: Record<string, string>;
}

// Puroks
export interface PuroksIndexPageProps extends PageProps {
    puroks: Paginated<Purok>;
    stats: Stats[];
    filters: FilterParams;
}

export interface PurokFormPageProps extends PageProps {
    purok?: Purok;
    validation_errors?: Record<string, string>;
}

// Residents
export interface ResidentsIndexPageProps extends PageProps {
    residents: Paginated<Resident>;
    filters: FilterParams;
    puroks: string[] | Array<{ id: number; name: string }>;
    stats: Stats[];
}

// Fees
export interface FeesIndexPageProps extends PageProps {
    fees: Paginated<Fee>;
    filters: FilterParams & DateRangeFilter;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    puroks: string[] | Array<{ id: number; name: string }>;
    stats: {
        total: number;
        total_amount: number;
        collected: number;
        pending: number;
        overdue_count: number;
    };
}

// Households
export interface HouseholdsIndexPageProps extends PageProps {
    households: Paginated<Household>;
    filters: FilterParams;
    puroks: Array<{ id: number; name: string }>;
    stats: Stats[];
}

// Profile
export interface ProfilePageProps extends PageProps {
    user: User & {
        role?: string;
        permissions?: string[];
        two_factor_enabled?: boolean;
    };
    activity_log?: Array<{
        id: number;
        description: string;
        created_at: string;
        ip_address?: string;
        user_agent?: string;
    }>;
}

// ==================== UTILITY TYPES ====================
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    icon?: string;
}

export interface StatusBadgeConfig {
    active: {
        variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
        icon: string;
        text: string;
        color: string;
    };
    inactive: {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: string;
        text: string;
        color: string;
    };
    pending: {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: string;
        text: string;
        color: string;
    };
    [key: string]: {
        variant: string;
        icon: string;
        text: string;
        color: string;
    };
}

export interface TableColumn<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface ActionMenuItem {
    label: string;
    icon?: LucideIcon | string;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'destructive';
    separator?: boolean;
    disabled?: boolean;
    permissions?: string[];
}

export interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf';
    columns?: string[];
    include_relations?: boolean;
    filters?: FilterParams;
}

export interface BulkOperation {
    selectedIds: number[];
    action: 'activate' | 'deactivate' | 'delete' | 'export';
    data?: Record<string, any>;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message: string;
    meta?: PaginationMeta;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
}

// ==================== FORM & VALIDATION ====================
export interface ValidationErrors {
    [key: string]: string[];
}

export interface FormState<T = any> {
    data: T;
    errors: ValidationErrors;
    processing: boolean;
    progress?: number;
    wasSuccessful?: boolean;
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// ==================== SETTINGS TYPES ====================
export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    date_format: string;
    time_format: string;
    items_per_page: number;
    enable_notifications: boolean;
    [key: string]: any;
}

// ==================== EXPORT ALL TYPES ====================
export type {
    // Re-export for convenience
    Auth,
    User,
    PageProps,
    Paginated,
    FilterParams,
    Stats,
    Permission,
    Purok,
    Resident,
    Fee,
    Household,
    Role,
};