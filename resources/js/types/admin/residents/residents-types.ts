import { JSX } from "react";
import { PageProps } from '@inertiajs/core';

export interface Resident {
    photo_url: unknown;
    household_memberships: any;
    resident_id(resident_id: any): unknown;
    photo_path: unknown;
    educational_attainment(educational_attainment: any): unknown;
    id: number;
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
    
    // Privileges
    privileges: Privilege[];
    
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
    members?: Resident[];
    total_members: number;
    created_at: string;
    updated_at: string;
}

export interface Privilege {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    is_active: boolean;
    requires_verification: boolean;
    valid_from?: string;
    valid_until?: string;
    created_at?: string;
    updated_at?: string;
    pivot?: {
        resident_id: number;
         id_number?: string;
        privilege_id: number;
        granted_at: string;
        granted_by: number;
        valid_until?: string;
    };
}

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

export interface FilterState {
    status: string;
    purok_id: string | number;
    gender: string;
    min_age: string | number;
    max_age: string | number;
    civil_status: string;
    is_voter: string;
    is_head: string;
    privilege: string;
    privilege_id: string | number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    search?: string;
}

export interface ResidentsProps extends PageProps {
    residents: Resident[];
    stats: Stats;
    filters: FilterState;
    puroks: Purok[];
    civilStatusOptions: Array<{ value: string; label: string }>;
    ageRanges: Array<{ min: number; max: number; label: string }>;
    allResidents: Resident[];
    privileges: Privilege[];
    can?: {
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
        bulk_edit?: boolean;
    };
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
    getStatusIcon: (status: string) => JSX.Element | null;
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

export interface ResidentsFiltersProps {
    stats: Stats;
    search: string;
    setSearch: (value: string) => void;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
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
    searchInputRef: React.RefObject<HTMLInputElement>;
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

export interface ResidentsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export interface ResidentsStatsProps {
    stats: Stats;
}

export interface SelectionStats {
    male: number;
    female: number;
    other: number;
    averageAge: number;
    hasPhotos: number;
    total: number;
    males: number;
    females: number;
    voters: number;
    heads: number;
    active: number;
    inactive: number;
    privilegeCounts: Record<string, number>;
    hasPrivileges: number;
}

export type SelectionMode = 'page' | 'filtered' | 'all' | 'none';

export interface BulkOperation {
    action: string;
    resident_ids: number[];
    status?: string;
    purok_id?: number;
    privilege_id?: number;
}

export interface ResidentFormData {
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    birth_date: string;
    gender: 'male' | 'female' | 'other';
    civil_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
    contact_number?: string;
    email?: string;
    occupation?: string;
    religion?: string;
    education_level?: string;
    purok_id?: number;
    street?: string;
    house_number?: string;
    is_voter: boolean;
    is_head: boolean;
    household_id?: number;
    relationship_to_head?: string;
    privileges?: number[];
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

export interface BulkActionResponse {
    success: boolean;
    message: string;
    updated_count: number;
    errors?: Array<{
        id: number;
        error: string;
    }>;
}