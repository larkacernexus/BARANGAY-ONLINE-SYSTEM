// Updated ResidentsContent.tsx with fixed customBulkActions type
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
    User, 
    Download, 
    Printer, 
    Edit, 
    Trash2, 
    Copy, 
    Users, 
    Globe,
    FileSpreadsheet,
    Home,
    CheckSquare,
    Square,
    UserPlus,
    UserMinus,
    FileDown
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
}

export default function ResidentsContent({
    residents,
    stats,
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
    customBulkActions
}: ResidentsContentProps) {
    
    // Toggle handler for bulk mode
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // Ensure hasActiveFilters is a boolean (in case it's passed as string)
    const activeFilters = Boolean(hasActiveFilters);

    // Convert selectionStats to match the expected SelectionStats type
    // The SelectionStats interface expects both singular and plural forms
    const normalizedSelectionStats = selectionStats ? {
        // Core stats
        total: selectionStats.total,
        
        // Gender stats - both singular and plural
        male: selectionStats.male || selectionStats.males || 0,
        female: selectionStats.female || selectionStats.females || 0,
        males: selectionStats.males || selectionStats.male || 0,
        females: selectionStats.females || selectionStats.female || 0,
        other: selectionStats.other || 0,
        
        // Voter and household stats
        voters: selectionStats.voters || 0,
        heads: selectionStats.heads || 0,
        
        // Status stats
        active: selectionStats.active || 0,
        inactive: selectionStats.inactive || 0,
        
        // Additional stats
        averageAge: selectionStats.averageAge || 0,
        hasPhotos: selectionStats.hasPhotos || 0,
        
        // Privilege stats
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
                    bulkActions={customBulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && residents.length > 0 && selectedResidents.length < residents.length && isBulkMode && (
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
                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && residents.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all-grid"
                                    checked={isSelectAll}
                                    onCheckedChange={onSelectAllOnPage}
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
                                                className="data-[state=checked]:bg-blue-600 h-5 w-9 dark:data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="bulk-mode" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                        <p>Toggle bulk selection mode</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        
                        {/* Page Info */}
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {/* Empty State with dark mode */}
                    {residents.length === 0 ? (
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
                                />
                            )}

                            {/* Pagination with dark mode */}
                            {totalPages > 1 && (
                                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={onPageChange}
                                        showCount={true}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}