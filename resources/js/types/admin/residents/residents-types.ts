// types/admin/residents/residents-types.ts

import { ReactNode } from "react";

// ============================================================================
// BASE TYPES
// ============================================================================

export type ResidentStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type CivilStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
export type Gender = 'male' | 'female' | 'other';
export type SelectionMode = 'page' | 'filtered' | 'all' | 'none';

// ============================================================================
// RESIDENT TYPE
// ============================================================================

export interface Resident {
    place_of_birth: string;
    remarks: string;
    id: number;
    resident_id: string | number;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
    email?: string | null;
    contact_number?: string | null;
    birth_date: string;
    age: number;
    gender: 'male' | 'female' | 'other' | null;
    civil_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | null;
    occupation?: string | null;
    religion?: string | null;
    education_level?: string | null;
    
    // Address information
    purok_id: number | null;
    purok?: Purok | null;
    street?: string | null;
    house_number?: string | null;
    
    // Status flags
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    is_voter: boolean;
    is_head: boolean;
    is_archived: boolean;
    
    // Household information
    household_id?: number | null;
    household?: Household | null;
    relationship_to_head?: string | null;
    
    // Photos and documents
    profile_photo?: string | null;
    valid_id_photo?: string | null;
    photo_url?: string | null;
    photo_path?: string | null;
    has_photo?: boolean;
    
    // Privileges
    privileges: ResidentPrivilege[];
    privileges_count?: number;
    active_privileges_count?: number;
    
    // Household memberships
    household_memberships?: HouseholdMembership[];
    
    // Metadata
    created_at: string;
    updated_at: string;
    created_by?: number | null;
    updated_by?: number | null;
    
    // Additional fields for display
    full_name?: string;
    address?: string;
    formatted_birth_date?: string;
}

// ============================================================================
// PRIVILEGE TYPES
// ============================================================================

export interface ResidentPrivilege {
    id: number;
    resident_id: number;
    privilege_id: number;
    privilege?: Privilege;
    privilege_name?: string;
    privilege_code?: string;
    code?: string;
    id_number?: string | null;
    issued_date?: string | null;
    expiry_date?: string | null;
    status?: 'active' | 'expiring_soon' | 'pending' | 'expired';
    is_active: boolean;
    requires_verification?: boolean;
    remarks?: string | null;
    granted_at?: string;
    granted_by?: number;
    valid_until?: string;
    verified_at?: string | null;
    verified_by?: number | null;
    discount_percentage?: number;
    pivot?: ResidentPrivilegePivot;
}

export interface ResidentPrivilegePivot {
    resident_id: number;
    privilege_id: number;
    id_number?: string;
    granted_at: string;
    granted_by: number;
    valid_until?: string;
    status?: string;
    verified_at?: string;
    verified_by?: number;
}

export interface Privilege {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    is_active: boolean;
    requires_id_number?: boolean;
    requires_verification: boolean;
    discount_percentage?: number | null;
    validity_years?: number | null;
    valid_from?: string;
    valid_until?: string;
    discount_type?: DiscountType | null;
    created_at?: string;
    updated_at?: string;
}

export interface DiscountType {
    id: number;
    name: string;
    code: string;
    percentage?: number;
    description?: string;
}

// ============================================================================
// PUROK & HOUSEHOLD TYPES
// ============================================================================

export interface Purok {
    id: number;
    name: string;
    code?: string;
    description?: string;
    residents_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Household {
    id: number;
    household_number: string;
    purok_id: number;
    purok?: Purok;
    head_id?: number;
    head?: Resident;
    head_of_family?: string;
    members?: Resident[];
    total_members: number;
    member_count?: number;
    address?: string;
    created_at: string;
    updated_at: string;
}

export interface HouseholdMembership {
    id: number;
    household_id: number;
    resident_id: number;
    is_head: boolean;
    relationship?: string;
    relationship_to_head?: string;
    joined_at?: string;
    left_at?: string;
    is_active: boolean;
    household?: Household;
    resident?: Resident;
}

export interface HouseholdOption {
    id: number | string;
    household_number: string;
    head_of_family: string;
    member_count: number;
    address?: string;
    purok?: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginatedResidents {
    data: Resident[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
    links?: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface Stats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
    male: number;
    female: number;
    voters: number;
    heads_of_household: number;
    with_privileges: number;
    by_purok?: Record<string, number>;
    by_civil_status?: Record<string, number>;
    by_age_group?: Record<string, number>;
}

export interface SelectionStats {
    total: number;
    male: number;
    female: number;
    other: number;
    averageAge: number;
    hasPhotos: number;
    males: number;
    females: number;
    voters: number;
    heads: number;
    active: number;
    inactive: number;
    privilegeCounts: Record<string, number>;
    hasPrivileges: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface FilterState {
    status: string;
    purok_id: string;
    gender: string;
    min_age: string;
    max_age: string;
    civil_status: string;
    is_voter: string;
    is_head: string;
    privilege: string;
    privilege_id: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    search?: string;
}

// ============================================================================
// PAGE PROPS
// ============================================================================

export interface PageProps {
    auth?: Auth;
    flash?: FlashMessage;
    errors?: Record<string, string>;
    [key: string]: any;
}

export interface Auth {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    role_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface ResidentsProps extends PageProps {
    residents: PaginatedResidents;
    stats: Stats;
    filters: FilterState;
    puroks: Purok[];
    civilStatusOptions: Array<{ value: string; label: string }>;
    ageRanges: Array<{ min: number; max: number; label: string }>;
    allResidents?: Resident[];
    privileges: Privilege[];
    can?: {
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
        bulk_edit?: boolean;
    };
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ResidentsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export interface ResidentsStatsProps {
    stats: Stats;
}

export interface ResidentsFiltersProps {
    stats: Stats;
    search: string;
    setSearch: (value: string) => void;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filtersState: FilterState;
    updateFilter: (key: string, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    puroks: Purok[];
    privileges: Privilege[];
    ageRanges: Array<{ min: number; max: number; label: string }>;
    civilStatusOptions: Array<{ value: string; label: string }>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface ResidentsContentProps {
    residents: Resident[];
    stats: Stats;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedResidents: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (value: 'table' | 'grid') => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onItemSelect: (id: number) => void;
    onClearFilters: () => void;
    onClearSelection: () => void;
    onDelete: (resident: Resident) => void;
    onToggleStatus: (resident: Resident) => void;
    onViewPhoto: (resident: Resident) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: string, data?: any) => void;
    setShowBulkDeleteDialog: (value: boolean) => void;
    setShowBulkStatusDialog: (value: boolean) => void;
    setShowBulkPurokDialog: (value: boolean) => void;
    setShowBulkPrivilegeDialog: (value: boolean) => void;
    setShowBulkRemovePrivilegeDialog: (value: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    puroks: Purok[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
    isLoading?: boolean;
}

export interface ResidentsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (value: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (value: boolean) => void;
    showBulkPurokDialog: boolean;
    setShowBulkPurokDialog: (value: boolean) => void;
    showBulkPrivilegeDialog: boolean;
    setShowBulkPrivilegeDialog: (value: boolean) => void;
    showBulkRemovePrivilegeDialog: boolean;
    setShowBulkRemovePrivilegeDialog: (value: boolean) => void;
    isPerformingBulkAction: boolean;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    selectedResidents: number[];
    handleBulkOperation: (operation: string, data?: any) => void;
    handleBulkPrivilegeAction: () => void;
    handleBulkStatusUpdate: (status: string) => void;
    handleBulkPurokUpdate: (purokId: number) => void;
    handleBulkDelete: () => void;
    puroks: Purok[];
    privileges: Privilege[];
    selectionStats: SelectionStats;
    bulkPrivilegeAction: 'add' | 'remove';
}

export interface ResidentsTableRowProps {
    resident: Resident;
    isBulkMode: boolean;
    isSelected: boolean;
    onSelect: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    getFullName: (resident: Resident) => string;
    truncateText: (text: string | null, maxLength?: number) => string;
    getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
    getStatusIcon: (status: string) => ReactNode | null;
    formatDate: (dateString: string | null) => string;
    getAge: (birthDate: string) => number;
    onDelete?: (resident: Resident) => void;
    onToggleStatus?: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onEdit?: (resident: Resident) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

// ============================================================================
// FORM & API TYPES
// ============================================================================

export interface ResidentFormData {
    age: number;
    place_of_birth?: string | null;
    remarks?: string | null;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
    birth_date: string;
    gender: 'male' | 'female' | 'other' | null;
    civil_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | null;
    contact_number?: string | null;
    email?: string | null;
    occupation?: string | null;
    religion?: string | null;
    education_level?: string | null;
    purok_id?: number | null;
    street?: string | null;
    house_number?: string | null;
    is_voter: boolean;
    is_head: boolean;
    household_id?: number | null;
    relationship_to_head?: string | null;
    privileges?: Array<{
        privilege_id: number;
        id_number?: string;
        verified_at?: string;
        expires_at?: string;
        remarks?: string;
        discount_percentage?: number;
    }>;
    photo?: File | null;
    address?: string | null;
    _method?: string;
}

export interface ResidentValidationErrors {
    first_name?: string[];
    last_name?: string[];
    birth_date?: string[];
    gender?: string[];
    civil_status?: string[];
    email?: string[];
    contact_number?: string[];
    purok_id?: string[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface BulkActionResponse {
    success: boolean;
    message: string;
    updated_count: number;
    errors?: Array<{
        id: number;
        error: string;
    }>;
}

export interface BulkOperation {
    action: string;
    resident_ids: number[];
    status?: string;
    purok_id?: number;
    privilege_id?: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ResidentExportData {
    'Full Name': string;
    'Age': number;
    'Gender': string;
    'Birth Date': string;
    'Purok': string;
    'Street': string;
    'House Number': string;
    'Status': string;
    'Civil Status': string;
    'Is Voter': string;
    'Is Head of Household': string;
    'Privileges': string;
    'Contact Number': string;
    'Email': string;
    'Occupation': string;
    'Religion': string;
    'Education Level': string;
    'Date Registered': string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ResidentUtils {
    getFullName: (resident: Resident) => string;
    getAddress: (resident: Resident) => string;
    getAge: (birthDate: string) => number;
    formatDate: (dateString: string) => string;
    getStatusBadgeVariant: (status: ResidentStatus) => "default" | "secondary" | "destructive" | "outline";
    getStatusIcon: (status: ResidentStatus) => ReactNode | null;
    hasActivePrivileges: (resident: Resident) => boolean;
    getActivePrivileges: (resident: Resident) => ResidentPrivilege[];
    getExpiringPrivileges: (resident: Resident, daysThreshold?: number) => ResidentPrivilege[];
}

export interface RelatedHouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    relationship_to_current?: string;
    is_head: boolean;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        age: number;
        gender: string;
        civil_status: string;
        contact_number?: string;
        purok?: string;
        purok_id?: number;
        photo_path?: string;
        photo_url?: string;
    };
}