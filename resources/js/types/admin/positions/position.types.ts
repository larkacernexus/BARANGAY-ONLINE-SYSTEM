// types/admin/position/position.types.ts

export interface Position {
    committee_id: number | null | undefined;
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    role_id: number;
    requires_account: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    committee?: Committee;
    role?: Role;
    officials_count?: number;
}

export interface Role {
    id: number;
    name: string;
}

export interface Committee {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    positions_count?: number;
    created_at: string;
    updated_at: string;
}

export interface PositionStats {
    total: number;
    active: number;
    inactive: number;
    requires_account: number;
    kagawad_count: number;
    assigned: number;
    unassigned: number;
}

export interface PositionFilters {
    search?: string;
    status?: string;
    requires_account?: 'all' | 'yes' | 'no';
    committee_id?: number | null;
    sort_by?: 'name' | 'order' | 'created_at' | 'status' | 'officials_count' | 'code'; 
    sort_order?: 'asc' | 'desc';
}

export interface PaginationData {
    data: Position[];
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
}

export interface PositionFormData {
    code?: string;
    name: string;
    description?: string;
    committee_id?: number | null;
    order: number;
    is_active: boolean;
    requires_account: boolean;
}

export interface PositionValidationErrors {
    code?: string[];
    name?: string[];
    description?: string[];
    committee_id?: string[];
    order?: string[];
    is_active?: string[];
    requires_account?: string[];
}

export type BulkOperation = 'delete' | 'activate' | 'deactivate' | 'toggle_account' | 'export' | 'export_csv' | 'print' | 'generate_report' | 'copy_data';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface BulkActionData {
    action: string;
    position_ids: number[];
    requires_account?: boolean;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    requires_account: number;
    assigned: number;
    unassigned: number;
}

export interface ExportData {
    format: 'csv' | 'excel' | 'pdf';
    ids?: number[];
    filters?: PositionFilters;
}

export interface PositionsPageProps {
    positions: PaginationData;
    filters: PositionFilters;
    stats: PositionStats;
}

// Enums for better type safety
export enum PositionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ALL = 'all'
}

export enum AccountRequirement {
    YES = 'yes',
    NO = 'no',
    ALL = 'all'
}

export enum SortField {
    ID = 'id',
    NAME = 'name',
    CODE = 'code',
    ORDER = 'order',
    CREATED_AT = 'created_at',
    OFFICIALS_COUNT = 'officials_count'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export enum BulkActionType {
    DELETE = 'delete',
    ACTIVATE = 'activate',
    DEACTIVATE = 'deactivate',
    TOGGLE_ACCOUNT = 'toggle_account',
    EXPORT = 'export',
    EXPORT_CSV = 'export_csv',
    PRINT = 'print',
    GENERATE_REPORT = 'generate_report',
    COPY_DATA = 'copy_data'
}

// Helper functions type definitions
export interface PositionUtils {
    filterPositions: (params: {
        positions: Position[];
        search: string;
        filters: PositionFilters;
    }) => Position[];
    
    sortPositions: (params: {
        positions: Position[];
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    }) => Position[];
    
    getSelectionStats: (selectedPositions: Position[]) => SelectionStats;
    
    exportToCSV: (positions: Position[], filename?: string) => void;
    
    formatPositionCode: (position: Position) => string;
    
    getPositionDisplayName: (position: Position) => string;
    
    isKagawad: (position: Position) => boolean;
    
    getCommitteePositionCount: (positions: Position[], committeeId: number) => number;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface BulkOperationResponse {
    success: boolean;
    affected_count?: number;
    failed_count?: number;
    errors?: string[];
}

// Component Props types
export interface PositionsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export interface PositionsStatsProps {
    globalStats: PositionStats;
    filteredStats: PositionStats;
    isLoading?: boolean;
}

export interface PositionsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange: (value: string) => void;
    filtersState: PositionFilters;
    updateFilter: (key: keyof PositionFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
}

export interface PositionsContentProps {
    positions: Position[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedPositions: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
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
    onDelete: (position: Position) => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog: (show: boolean) => void;
    setShowBulkStatusDialog: (show: boolean) => void;
    filtersState: PositionFilters;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
}

export interface PositionsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedPositions: number[];
    handleBulkOperation: () => void;
    handleBulkAccountToggle: () => void;
    selectionStats: SelectionStats;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

// Utility functions for position operations
export const positionUtils: PositionUtils = {
    filterPositions: ({ positions, search, filters }) => {
        let filtered = [...positions];
        
        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(position => 
                position.name.toLowerCase().includes(searchLower) ||
                (position.code && position.code.toLowerCase().includes(searchLower)) ||
                (position.description && position.description.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply status filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(position => 
                filters.status === 'active' ? position.is_active : !position.is_active
            );
        }
        
        // Apply requires_account filter
        if (filters.requires_account && filters.requires_account !== 'all') {
            filtered = filtered.filter(position => 
                filters.requires_account === 'yes' ? position.requires_account : !position.requires_account
            );
        }
        
        // Apply committee filter
        if (filters.committee_id) {
            filtered = filtered.filter(position => position.committee_id === filters.committee_id);
        }
        
        // Apply sorting
        if (filters.sort_by) {
            filtered.sort((a, b) => {
                let aValue: any = a[filters.sort_by as keyof Position];
                let bValue: any = b[filters.sort_by as keyof Position];
                
                if (filters.sort_by === 'officials_count') {
                    aValue = a.officials_count || 0;
                    bValue = b.officials_count || 0;
                }
                
                if (filters.sort_order === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }
        
        return filtered;
    },
    
    sortPositions: ({ positions, sortBy, sortOrder }) => {
        const sorted = [...positions];
        sorted.sort((a, b) => {
            let aValue: any = a[sortBy as keyof Position];
            let bValue: any = b[sortBy as keyof Position];
            
            if (sortBy === 'officials_count') {
                aValue = a.officials_count || 0;
                bValue = b.officials_count || 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        return sorted;
    },
    
    getSelectionStats: (selectedPositions) => {
        return {
            total: selectedPositions.length,
            active: selectedPositions.filter(p => p.is_active).length,
            inactive: selectedPositions.filter(p => !p.is_active).length,
            requires_account: selectedPositions.filter(p => p.requires_account).length,
            assigned: selectedPositions.filter(p => (p.officials_count || 0) > 0).length,
            unassigned: selectedPositions.filter(p => (p.officials_count || 0) === 0).length
        };
    },
    
    exportToCSV: (positions, filename = 'positions-export') => {
        const headers = ['ID', 'Code', 'Name', 'Description', 'Committee', 'Order', 'Officials Count', 'Requires Account', 'Status', 'Created At'];
        const rows = positions.map(position => [
            position.id,
            position.code || '',
            position.name,
            position.description || '',
            position.committee?.name || '',
            position.order,
            position.officials_count || 0,
            position.requires_account ? 'Yes' : 'No',
            position.is_active ? 'Active' : 'Inactive',
            new Date(position.created_at).toLocaleDateString()
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => 
                typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
            ).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    formatPositionCode: (position) => {
        if (position.code) return position.code;
        return `POS-${position.id.toString().padStart(3, '0')}`;
    },
    
    getPositionDisplayName: (position) => {
        const parts = [];
        if (position.code) parts.push(`[${position.code}]`);
        parts.push(position.name);
        if (position.committee) parts.push(`(${position.committee.name})`);
        return parts.join(' ');
    },
    
    isKagawad: (position) => {
        return position.code?.startsWith('KAG') || false;
    },
    
    getCommitteePositionCount: (positions, committeeId) => {
        return positions.filter(p => p.committee_id === committeeId).length;
    }
};

// Default values
export const defaultPositionStats: PositionStats = {
    total: 0,
    active: 0,
    inactive: 0,
    requires_account: 0,
    kagawad_count: 0,
    assigned: 0,
    unassigned: 0
};

export const defaultPositionFilters: PositionFilters = {
    status: 'all',
    requires_account: 'all',
    sort_by: 'order',
    sort_order: 'asc'
};

export const defaultPositionFormData: PositionFormData = {
    name: '',
    order: 0,
    is_active: true,
    requires_account: false,
    code: '',
    description: '',
    committee_id: null
};


export interface PageProps {
    auth?: Auth;
    flash?: FlashMessage;
    errors?: Record<string, string>;
    [key: string]: any;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface Auth {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    role_id?: number;
    role?: Role;
    permissions?: Permission[];
    created_at?: string;
    updated_at?: string;
}

export interface Permission {
    id: number;
    name: string;
    guard_name?: string;
}