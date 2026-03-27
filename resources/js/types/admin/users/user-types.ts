// types/admin/users/user-types.ts

// ============================================
// Import Inertia Types
// ============================================
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// ============================================
// Core User Types (Matches Laravel Model)
// ============================================

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserRole {
  id: number;
  name: string;
  guard_name?: string;
  count?: number;
  description?: string;
  color?: string;
  is_system_role?: boolean;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface UserDepartment {
  id: number;
  name: string;
  code?: string;
  description?: string;
  manager_id?: number;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  email_verified_at: string | null;
  password?: string;
  remember_token?: string;
  role_id: number;
  role?: UserRole;
  status: UserStatus;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  two_factor_recovery_codes?: string[];
  last_login_at: string | null;
  last_login_ip?: string | null;
  department_id?: number | null;
  department?: UserDepartment;
  avatar?: string | null;
  phone?: string | null;
  timezone?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  [key: string]: any;
}

// ============================================
// Laravel Pagination Types
// ============================================

export interface LaravelPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface LaravelPaginatedData<T> {
  data: T[];
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
  links: LaravelPaginationLink[];
}

// ============================================
// Filter & Sort Types (Laravel Request)
// ============================================

export type SortOrder = 'asc' | 'desc';

export interface UserFilters {
  search?: string;
  role_id?: string | number;
  status?: UserStatus | string;
  department_id?: string | number;
  sort_by?: string;
  sort_order?: SortOrder;
  from_date?: string;
  to_date?: string;
  has_two_factor?: boolean;
  is_verified?: boolean;
  has_department?: boolean;
  trashed?: 'with' | 'only' | null;
  per_page?: number;
}

// ============================================
// Page Props Types (Inertia.js + Laravel) - FIXED
// ============================================

/**
 * Base Page Props that extend Inertia's PageProps
 * This includes the required index signature [key: string]: any
 */
export interface PageProps extends InertiaPageProps {
  auth: {
    user: User | null;
    permissions: string[];
    roles: string[];
  };
  app: {
    name: string;
    locale: string;
    fallback_locale: string;
    environment: string;
  };
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  errors?: Record<string, string>;
}

/**
 * Shared Page Props (alias for backward compatibility)
 */
export type SharedPageProps = PageProps;

/**
 * Users Page Props - extends the base PageProps
 */
export interface UsersPageProps extends PageProps {
  users: LaravelPaginatedData<User>;
  stats: UserStat[];
  roles: UserRole[];
  departments?: UserDepartment[];
  filters: UserFilters;
  permissions?: Permission[];
  can: {
    create_users: boolean;
    edit_users: boolean;
    delete_users: boolean;
    bulk_actions: boolean;
    export_users: boolean;
    manage_roles: boolean;
    impersonate?: boolean;
  };
}

// ============================================
// User Statistics Types
// ============================================

export interface UserStat {
  label: string;
  value: number;
  change?: number;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  route?: string;
}

// ============================================
// Permission & Role Types (Laravel Spatie)
// ============================================

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  display_name?: string;
  description?: string;
  group?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends UserRole {
  permissions: Permission[];
}

// ============================================
// Bulk Operation Types
// ============================================

export type BulkOperation = 
  | 'export'
  | 'activate'
  | 'deactivate'
  | 'delete'
  | 'role'
  | 'department'
  | 'send_email'
  | 'resend_invitation'
  | 'impersonate';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface BulkActionState {
  isOpen: boolean;
  isLoading: boolean;
  value: string;
  operation?: BulkOperation;
}

// ============================================
// View & UI Types
// ============================================

export type ViewMode = 'table' | 'grid' | 'list';

export interface SortConfig {
  column: string;
  order: SortOrder;
}

export interface UsersUIState {
  viewMode: ViewMode;
  isMobile: boolean;
  windowWidth: number;
  isRefreshing: boolean;
  showAdvancedFilters: boolean;
  showKeyboardShortcuts: boolean;
  bulkActionLoading: boolean;
}

export interface UsersSelectionState {
  selectedUsers: number[];
  isBulkMode: boolean;
  isSelectAll: boolean;
  selectionMode: SelectionMode;
  lastSelectedId?: number;
}

// ============================================
// Form Types (Laravel Validation)
// ============================================

export interface UserFormData {
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  role_id: number;
  status?: UserStatus;
  department_id?: number | null;
  password?: string;
  password_confirmation?: string;
  send_invitation?: boolean;
  two_factor_enabled?: boolean;
  timezone?: string;
  language?: string;
  phone?: string | null;
}

export type UserUpdateData = Partial<UserFormData> & {
  id: number;
};

export interface UserValidationErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  role_id?: string;
  status?: string;
  department_id?: string;
  password?: string;
}

// ============================================
// API & Inertia Request Types
// ============================================

export interface InertiaVisitOptions {
  preserveState?: boolean;
  preserveScroll?: boolean;
  only?: string[];
  except?: string[];
  replace?: boolean;
  onStart?: () => void;
  onFinish?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export interface UserIndexRequest {
  page?: number;
  per_page?: number;
  search?: string;
  role_id?: number;
  status?: UserStatus;
  department_id?: number;
  sort_by?: string;
  sort_order?: SortOrder;
  trashed?: 'with' | 'only';
}

export interface UserStoreRequest extends UserFormData {
  // Additional fields specific to creation
}

export interface UserUpdateRequest extends UserUpdateData {
  // Additional fields specific to update
}

// ============================================
// Export/Import Types
// ============================================

export interface UserExportData {
  'Name': string;
  'Email': string;
  'Role': string;
  'Department': string;
  'Status': string;
  'Email Verified': string;
  '2FA Enabled': string;
  'Last Login': string;
  'Created': string;
  'Last Updated'?: string;
  'Phone'?: string;
  'Timezone'?: string;
}

export interface UserImportRow {
  email: string;
  first_name?: string;
  last_name?: string;
  role_name?: string;
  department_name?: string;
  status?: UserStatus;
  send_invitation?: boolean;
}

export interface UserImportResult {
  success: boolean;
  message: string;
  imported_count: number;
  failed_count: number;
  errors?: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

// ============================================
// Component Props Types
// ============================================

export interface UsersHeaderProps {
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
  isMobile?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  canCreateUsers?: boolean;
  onUserCreate?: () => void;
}

export interface UsersStatsProps {
  stats: UserStat[];
  isLoading?: boolean;
  onStatClick?: (stat: UserStat) => void;
}

export interface UsersFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (value: boolean) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
  roles: UserRole[];
  departments?: UserDepartment[];
  departmentFilter?: string;
  setDepartmentFilter?: (value: string) => void;
  isBulkMode: boolean;
  selectedUsers: number[];
  setSelectedUsers: (users: number[]) => void;
  setIsSelectAll: (value: boolean) => void;
  users: LaravelPaginatedData<User>;
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  onSelectAllOnPage: () => void;
  onSelectAllFiltered: () => void;
  onSelectAll: () => void;
  isLoading?: boolean;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
}

export interface UsersContentProps {
  users: LaravelPaginatedData<User>;
  selectedUsers: number[];
  selectedUsersData: User[];
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
  isSelectAll: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void; // This should accept ViewMode, not SetStateAction
  isMobile: boolean;
  hasActiveFilters: boolean; // This should be boolean, not string | boolean
  handleClearFilters: () => void;
  handleSelectAllOnPage: () => void;
  handleItemSelect: (id: number) => void;
  handlePageChange: (page: number) => void;
  setShowBulkDeleteDialog: (show: boolean) => void;
  setShowBulkStatusDialog: (show: boolean) => void;
  setShowBulkRoleDialog: (show: boolean) => void;
  roles: UserRole[];
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
  onClearSelection: () => void;
  onBulkOperation: (operation: BulkOperation) => void;
  onCopySelectedData: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onUserClick?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onUserStatusChange?: (user: User, status: UserStatus) => void;
  onUserImpersonate?: (user: User) => void;
}

export interface UsersDialogsProps {
  showBulkDeleteDialog: boolean;
  setShowBulkDeleteDialog: (show: boolean) => void;
  showBulkStatusDialog: boolean;
  setShowBulkStatusDialog: (show: boolean) => void;
  showBulkRoleDialog: boolean;
  setShowBulkRoleDialog: (show: boolean) => void;
  selectedUsers: number[];
  selectedUsersData: User[];
  isPerformingBulkAction: boolean;
  bulkEditValue: string;
  setBulkEditValue: (value: string) => void;
  roles: UserRole[];
  departments?: UserDepartment[];
  onBulkDeleteConfirm?: () => void;
  onBulkStatusConfirm?: (status: UserStatus) => void;
  onBulkRoleConfirm?: (roleId: number) => void;
  onBulkDepartmentConfirm?: (departmentId: number) => void;
}

// ✅ ADD THIS MISSING EXPORT
export interface UsersKeyboardShortcutsProps {
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
  isPerformingBulkAction: boolean;
  onSelectAllPage: () => void;
  onSelectAllFiltered: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

// ============================================
// Utility Functions Types
// ============================================

export interface UserHelperFunctions {
  getFullName: (user: User) => string;
  getAvatarUrl: (user: User) => string | null;
  getUserStatusColor: (status: UserStatus) => string;
  getUserStatusBadge: (status: UserStatus) => React.ReactNode;
  formatUserDate: (date: string | null) => string;
  isUserActive: (user: User) => boolean;
  canUserLogin: (user: User) => boolean;
}

// ============================================
// Event Types (for Laravel Events)
// ============================================

export interface UserCreatedEvent {
  user: User;
  created_by?: User;
  invitation_sent?: boolean;
}

export interface UserUpdatedEvent {
  user: User;
  changes: Partial<User>;
  updated_by?: User;
}

export interface UserDeletedEvent {
  user: User;
  deleted_by?: User;
  permanent?: boolean;
}

// ============================================
// Configuration Types
// ============================================

export interface UserModuleConfig {
  enableTwoFactor: boolean;
  enableEmailVerification: boolean;
  enableDepartmentAssignment: boolean;
  enableUserImpersonation: boolean;
  defaultUserStatus: UserStatus;
  defaultUserRole: number;
  allowedStatuses: UserStatus[];
  defaultPerPage: number;
  perPageOptions: number[];
}