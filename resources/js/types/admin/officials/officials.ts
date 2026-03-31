// types/admin/officials/officials.types.ts

// Import shared types from household types
import { Gender, CivilStatus } from '@/types/admin/households/household.types';

// ========== CORE MODELS ==========

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name: string;
    age: number;
    gender: Gender; // Use shared Gender type
    birth_date?: string;
    civil_status?: CivilStatus; // Use shared CivilStatus type
    contact_number?: string;
    email?: string;
    address?: string;
    photo_path?: string;
    photo_url?: string;
    purok?: {
        id: number;
        name: string;
    };
    household?: {
        id: number;
        household_number: string;
        address: string;
    };
    is_head_of_household?: boolean;
}

export interface Position {
    id: number;
    code: string;
    name: string;
    description?: string;
    order: number;
    role_id: number;
    requires_account: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    committee_id?: number | null;
    additional_committees?: number[];
}

export interface Committee {
    id: number;
    code: string;
    name: string;
    description?: string;
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    is_system_role?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    username: string;
    email?: string;
    contact_number?: string;
    position?: string;
    role_id: number;
    resident_id: number;
    status: 'active' | 'inactive' | 'suspended';
    household_id?: number;
    current_resident_id?: number;
    last_login_at?: string;
    last_login_ip?: string;
    created_at?: string;
    updated_at?: string;
    role?: Role;
    resident?: Resident;
    current_resident?: Resident;
    household?: {
        id: number;
        household_number: string;
        address: string;
    };
    full_name?: string;
    has_qr_code?: boolean;
    is_logged_in?: boolean;
    activities?: ActivityLog[];

}

export interface Official {
    id: number;
    resident_id: number;
    position_id: number;
    committee_id?: number | null;
    term_start: string;
    term_end: string;
    status: 'active' | 'inactive' | 'former';
    order: number;
    responsibilities?: string | null;
    contact_number?: string | null;
    email?: string | null;
    achievements?: string | null;
    photo_path?: string | null;
    photo_url?: string;
    is_regular: boolean;
    user_id?: number | null;
    created_at?: string;
    updated_at?: string;
    
    // Relationships
    resident?: Resident;
    positionData?: Position;
    committeeData?: Committee;
    user?: User;
    
    // Computed attributes
    position?: string;
    committee?: string;
    full_position?: string;
    position_name?: string;
    position_code?: string;
    committee_name?: string;
    committee_code?: string;
    is_current?: boolean;
    term_duration?: string;
    full_name?: string;
}

// ========== FORM DATA TYPES ==========

export interface OfficialFormData {
    resident_id: number | null;
    position_id: number | null;
    committee_id: number | null;
    term_start: string;
    term_end: string;
    status: 'active' | 'inactive' | 'former';
    order: number;
    responsibilities: string;
    contact_number: string;
    email: string;
    achievements: string;
    photo: File | null;
    use_resident_photo: boolean;
    is_regular: boolean;
    user_id: number | null;
}

// ========== FILTER TYPES ==========

export interface FilterState {
    status: string;
    position: string;
    committee: string;
    type: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
}

export interface OfficialFilters {
    search?: string;
    status?: 'all' | 'current' | 'active' | 'inactive' | 'former';
    position?: string;
    committee?: string;
    type?: 'all' | 'regular' | 'ex_officio';
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
}

// ========== STATS TYPES ==========

export interface OfficialStats {
    total: number;
    active: number;
    current: number;
    former: number;
    regular: number;
    ex_officio: number;
    by_position: Record<string, number>;
    by_committee: Record<string, number>;
    by_status: Record<string, number>;
}

// ========== SELECTION TYPES ==========

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    byStatus: Record<string, number>;
    byPosition: Record<string, number>;
    byCommittee: Record<string, number>;
}

export type BulkOperation = 
    | 'delete'
    | 'activate'
    | 'deactivate'
    | 'make_current'
    | 'make_former'
    | 'export'
    | 'export_csv'
    | 'print'
    | 'generate_report'
    | 'message_officials';

// ========== PROPS TYPES ==========
import { PageProps } from '@/types/admin/households/household.types';


export interface OfficialsProps extends PageProps {
    officials: {
        data: Official[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
        links?: any[];
    };
    stats: OfficialStats;
    filters: OfficialFilters;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    statusOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
}

export interface CreateOfficialProps {
    positions: Position[];
    committees: Committee[];
    availableResidents: Resident[];
    availableUsers: User[];
    defaultTermStart: string;
    defaultTermEnd: string;
    roles: Role[];
}

export interface EditOfficialProps {
    official: Official & {
        resident: Resident;
        positionData: Position;
        committeeData?: Committee;
        user?: User;
    };
    positions: Position[];
    committees: Committee[];
    availableResidents: Resident[];
    availableUsers: User[];
    roles: Role[];
    statusOptions: Array<{ value: string; label: string }>;
}

export interface ShowOfficialProps {
    official: Official & {
        resident: Resident & {
            purok?: { id: number; name: string };
            household?: { id: number; household_number: string; address: string };
        };
        positionData: Position;
        committeeData?: Committee;
        user?: User;
    };
    positions: Array<{ value: number; label: string }>;
    committees: Record<number, string>;
}

// ========== UTILITY TYPES ==========

export interface Option {
    value: string;
    label: string;
}

export interface BadgeVariant {
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
    className: string;
    text: string;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface CurrentOfficialsResponse {
    data: Official[];
}

export interface CommitteeOfficialsResponse {
    committee: string;
    description?: string;
    officials: Official[];
}

// ========== FORM ERROR TYPES ==========

export interface OfficialFormErrors {
    resident_id?: string;
    position_id?: string;
    committee_id?: string;
    term_start?: string;
    term_end?: string;
    status?: string;
    contact_number?: string;
    email?: string;
    photo?: string;
    user_id?: string;
    [key: string]: string | undefined;
}

// ========== DIALOG PROPS TYPES ==========

export interface OfficialsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedOfficials: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
}

export interface OfficialsBulkActionsProps {
    selectedOfficials: number[];
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
}

// ========== TABLE/GRID PROPS TYPES ==========

export interface OfficialsTableViewProps {
    officials: Official[];
    isBulkMode: boolean;
    selectedOfficials: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (official: Official) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    windowWidth: number;
}

export interface OfficialsGridViewProps {
    officials: Official[];
    isBulkMode: boolean;
    selectedOfficials: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (official: Official) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    windowWidth: number;
}

export interface OfficialsContentProps {
    officials: Official[];
    stats?: OfficialStats;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedOfficials: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile?: boolean;
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
    onDelete: (official: Official) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    windowWidth: number;
}

// ========== HEADER/FILTER PROPS TYPES ==========

export interface OfficialsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export interface OfficialsStatsProps {
    stats: OfficialStats;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
}

export interface ActivityLog {
    id: number;
    user_id: number;
    action: string;
    description: string;
    properties?: {
        status?: string;
        ip?: string;
        user_agent?: string;
        [key: string]: any;
    };
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    updated_at: string;
}

export interface OfficialsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    statusOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement>;
    handleSort: (column: string) => void;
    exportData: () => void;
}