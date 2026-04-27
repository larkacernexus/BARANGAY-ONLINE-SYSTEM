import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    User, 
    ArrowUpDown,
    Rows3
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ResidentsTableView from './ResidentsTableView';
import ResidentsGridView from './ResidentsGridView';
import ResidentBulkActions from './ResidentsBulkActions';
import { Resident, Purok, FilterState, Stats, SelectionMode, SelectionStats } from '@/types/admin/residents/residents-types';

// Import BulkActionItem type
import { BulkActionItem } from './ResidentsBulkActions';

interface ResidentsContentProps {
    residents: Resident[];
    stats?: Stats;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedResidents: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile?: boolean;
    hasActiveFilters: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    perPage?: string;
    onPerPageChange?: (value: string) => void;
    onPageChange: (page: number) => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onItemSelect: (id: number) => void;
    onClearFilters: () => void;
    onClearSelection: () => void;
    onDelete: (resident: Resident) => void;
    onToggleStatus?: (resident: Resident) => void;
    onViewPhoto: (resident: Resident) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: string, data?: any) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    setShowBulkPurokDialog?: (show: boolean) => void;
    setShowBulkPrivilegeDialog?: (show: boolean) => void;
    setShowBulkRemovePrivilegeDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    puroks?: Purok[];
    customBulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
        privilege?: BulkActionItem[];
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
    isLoading?: boolean;
}

export default function ResidentsContent({
    residents,
    stats: _stats, // Prefixed with underscore since it's not used
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedResidents,
    viewMode,
    setViewMode,
    isMobile = false,
    hasActiveFilters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    perPage = '15',
    onPerPageChange = () => {},
    onPageChange,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onItemSelect,
    onClearFilters,
    onClearSelection,
    onDelete,
    onToggleStatus,
    onViewPhoto,
    onCopyToClipboard,
    onCopySelectedData,
    onSort,
    onBulkOperation,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkPurokDialog,
    setShowBulkPrivilegeDialog,
    setShowBulkRemovePrivilegeDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    puroks = [],
    customBulkActions,
    sortBy = 'last_name',
    sortOrder = 'asc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'last_name-asc',
    isLoading = false
}: ResidentsContentProps) {
    
    // Toggle handler for bulk mode
    const handleBulkModeToggle = () => {
        if (isLoading) return;
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // Per page options
    const perPageOptions = [
        { value: '15', label: '15 per page' },
        { value: '30', label: '30 per page' },
        { value: '50', label: '50 per page' },
        { value: '100', label: '100 per page' },
        { value: '500', label: '500 per page' },
        { value: '1000', label: '1000 per page' },
    ];

    // Handle per page change
    const handlePerPageChange = (value: string) => {
        if (isLoading) return;
        onPerPageChange(value);
    };

    // Ensure hasActiveFilters is a boolean (in case it's passed as string)
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Check if we have any residents
    const hasResidents = residents && residents.length > 0;

    // Convert selectionStats to match the expected SelectionStats type
    const normalizedSelectionStats = selectionStats ? {
        total: selectionStats.total || 0,
        male: selectionStats.male || selectionStats.males || 0,
        female: selectionStats.female || selectionStats.females || 0,
        males: selectionStats.males || selectionStats.male || 0,
        females: selectionStats.females || selectionStats.female || 0,
        other: selectionStats.other || 0,
        voters: selectionStats.voters || 0,
        heads: selectionStats.heads || 0,
        active: selectionStats.active || 0,
        inactive: selectionStats.inactive || 0,
        averageAge: selectionStats.averageAge || 0,
        hasPhotos: selectionStats.hasPhotos || 0,
        privilegeCounts: selectionStats.privilegeCounts || {},
        hasPrivileges: selectionStats.hasPrivileges || 0
    } : undefined;

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedResidents.length > 0 && (
                <ResidentBulkActions
                    selectedResidents={selectedResidents}
                    selectionMode={selectionMode}
                    selectionStats={normalizedSelectionStats}
                    isPerformingBulkAction={isPerformingBulkAction}
                    isSelectAll={isSelectAll}
                    isMobile={isMobile}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={onSelectAllOnPage}
                    onSelectAllFiltered={onSelectAllFiltered}
                    onSelectAll={onSelectAll}
                    onBulkOperation={onBulkOperation}
                    onCopySelectedData={onCopySelectedData}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkStatusDialog={setShowBulkStatusDialog}
                    setShowBulkPurokDialog={setShowBulkPurokDialog}
                    setShowBulkPrivilegeDialog={setShowBulkPrivilegeDialog}
                    setShowBulkRemovePrivilegeDialog={setShowBulkRemovePrivilegeDialog}
                    bulkActions={customBulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && hasResidents && selectedResidents.length < residents.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedResidents.length}
                    totalCount={residents.length}
                    position="bottom-right"
                />
            )}

            {/* Residents List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Residents
                                {selectedResidents.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedResidents.length} selected
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        {!isMobile && (
                            <ViewToggle
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                isMobile={isMobile}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Per Page Selector */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={perPage}
                                    onValueChange={handlePerPageChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[130px] h-8 text-xs">
                                        <SelectValue placeholder="Per page..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Sort By Dropdown */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={getCurrentSortValue()}
                                    onValueChange={onSortChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="last_name-asc">Last Name (A to Z)</SelectItem>
                                        <SelectItem value="last_name-desc">Last Name (Z to A)</SelectItem>
                                        <SelectItem value="first_name-asc">First Name (A to Z)</SelectItem>
                                        <SelectItem value="first_name-desc">First Name (Z to A)</SelectItem>
                                        <SelectItem value="age-asc">Age (Youngest to Oldest)</SelectItem>
                                        <SelectItem value="age-desc">Age (Oldest to Youngest)</SelectItem>
                                        <SelectItem value="gender-asc">Gender (A to Z)</SelectItem>
                                        <SelectItem value="gender-desc">Gender (Z to A)</SelectItem>
                                        <SelectItem value="civil_status-asc">Civil Status (A to Z)</SelectItem>
                                        <SelectItem value="civil_status-desc">Civil Status (Z to A)</SelectItem>
                                        <SelectItem value="status-asc">Status (A to Z)</SelectItem>
                                        <SelectItem value="status-desc">Status (Z to A)</SelectItem>
                                        <SelectItem value="purok-asc">Purok (A to Z)</SelectItem>
                                        <SelectItem value="purok-desc">Purok (Z to A)</SelectItem>
                                        <SelectItem value="is_voter-asc">Voter (No to Yes)</SelectItem>
                                        <SelectItem value="is_voter-desc">Voter (Yes to No)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && hasResidents && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all-grid"
                                    checked={isSelectAll}
                                    onCheckedChange={onSelectAllOnPage}
                                    disabled={isLoading}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                                />
                                <Label htmlFor="select-all-grid" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                    {isSelectAll ? 'Deselect Page' : 'Select Page'}
                                </Label>
                            </div>
                        )}
                        
                        {/* Bulk Mode Toggle */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="bulk-mode"
                                                checked={isBulkMode}
                                                onCheckedChange={handleBulkModeToggle}
                                                disabled={isLoading}
                                                className="data-[state=checked]:bg-blue-600 h-5 w-9 dark:data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="bulk-mode" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                        <p>Toggle bulk selection mode</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ctrl+Shift+B • Ctrl+A to select</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        
                        {/* Page Info */}
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            {totalItems > 0 && (
                                <>
                                    Showing {residents.length > 0 ? '1' : '0'} - {residents.length} of {totalItems}
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {/* Empty State with dark mode */}
                    {!hasResidents ? (
                        <EmptyState
                            icon={<User className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No residents found"
                            description={activeFilters 
                                ? "No residents match your current filters. Try adjusting your search or filters."
                                : "No residents have been added yet."}
                            action={activeFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : undefined}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <ResidentsTableView
                                    residents={residents}
                                    isBulkMode={isBulkMode}
                                    selectedResidents={selectedResidents}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={activeFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    isLoading={isLoading}
                                />
                            ) : (
                                // Grid View
                                <ResidentsGridView
                                    residents={residents}
                                    isBulkMode={isBulkMode}
                                    selectedResidents={selectedResidents}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={activeFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    isLoading={isLoading}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedResidents.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedResidents.length}
                                    totalCount={residents.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                    extraInfo={
                                        normalizedSelectionStats && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {normalizedSelectionStats.male} male • {normalizedSelectionStats.female} female • 
                                                Avg age: {normalizedSelectionStats.averageAge.toFixed(1)}
                                            </div>
                                        )
                                    }
                                />
                            )}

                            {/* Per Page & Pagination Footer */}
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    {/* Mobile Per Page Selector */}
                                    {isMobile && (
                                        <div className="flex items-center gap-2 w-full">
                                            <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Select
                                                value={perPage}
                                                onValueChange={handlePerPageChange}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger className="w-full h-8 text-xs">
                                                    <SelectValue placeholder="Per page..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perPageOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <div className="w-full">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={onPageChange}
                                            showCount={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}