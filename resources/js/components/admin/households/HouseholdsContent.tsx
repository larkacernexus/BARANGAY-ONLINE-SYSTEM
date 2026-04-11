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
    FileSpreadsheet, 
    Edit, 
    Trash2, 
    Copy, 
    Users, 
    Globe, 
    Printer, 
    Download,
    Home,
    CheckSquare,
    Square,
    ArrowUpDown
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import HouseholdsTableView from '@/components/admin/households/HouseholdsTableView';
import HouseholdsGridView from '@/components/admin/households/HouseholdsGridView';
import HouseholdBulkActions from './HouseholdsBulkActions';
import { Household, Purok, SelectionStats, SelectionMode, BulkAction } from '@/types/admin/households/household.types';

interface HouseholdsContentProps {
    households: Household[];
    stats: {
        total: number;
        active: number;
        inactive: number;
        totalMembers: number;
        averageMembers: number;
        purokCount: number;
    };
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedHouseholds: number[];
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
    onItemSelect: (id: number) => void;
    onClearFilters: () => void;
    onDelete: (household: Household) => void;
    onToggleStatus?: (household: Household) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSort: (column: string) => void;
    puroks: Purok[];
    sortBy: string;
    sortOrder: string;
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    onBulkOperation: (operation: BulkAction) => void;
    onClearSelection: () => void;
    onCopySelectedData: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    setShowBulkPurokDialog?: (show: boolean) => void;
    selectionMode: SelectionMode;
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export default function HouseholdsContent({
    households,
    stats,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedHouseholds,
    viewMode,
    setViewMode,
    isMobile,
    hasActiveFilters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onSelectAllOnPage,
    onItemSelect,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onCopyToClipboard,
    onSort,
    puroks,
    sortBy,
    sortOrder,
    selectionStats,
    isPerformingBulkAction,
    onBulkOperation,
    onClearSelection,
    onCopySelectedData,
    onSelectAllFiltered,
    onSelectAll,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkPurokDialog,
    selectionMode,
    onSortChange = () => {},
    getCurrentSortValue = () => 'household_number-asc'
}: HouseholdsContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected households'
            },
            {
                label: 'Edit Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Bulk edit status'
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate'),
                tooltip: 'Activate selected households'
            },
            {
                label: 'Deactivate',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate'),
                tooltip: 'Deactivate selected households'
            },
            {
                label: 'Change Purok',
                icon: <Globe className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkPurokDialog?.(true),
                tooltip: 'Change purok for selected households'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected households'
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard'
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected households',
                variant: 'destructive' as const
            }
        ]
    };

    // Toggle bulk mode handler
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // Check if we have any households
    const hasHouseholds = households && households.length > 0;

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedHouseholds.length > 0 && (
                <HouseholdBulkActions
                    selectedHouseholds={selectedHouseholds}
                    selectionMode={selectionMode}
                    selectionStats={selectionStats}
                    isPerformingBulkAction={isPerformingBulkAction}
                    isSelectAll={isSelectAll}
                    isMobile={isMobile}
                    totalItems={totalItems}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={onSelectAllOnPage}
                    onSelectAllFiltered={onSelectAllFiltered}
                    onSelectAll={onSelectAll}
                    onBulkOperation={onBulkOperation}
                    onCopySelectedData={onCopySelectedData}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    bulkActions={bulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && hasHouseholds && selectedHouseholds.length < households.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedHouseholds.length}
                    totalCount={households.length}
                    position="bottom-right"
                />
            )}

            {/* Households List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Household List
                                {selectedHouseholds.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedHouseholds.length} selected
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <ViewToggle
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            isMobile={isMobile}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sort By Dropdown */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={getCurrentSortValue()}
                                    onValueChange={onSortChange}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="household_number-asc">Household # (A to Z)</SelectItem>
                                        <SelectItem value="household_number-desc">Household # (Z to A)</SelectItem>
                                        <SelectItem value="head_name-asc">Head of Household (A to Z)</SelectItem>
                                        <SelectItem value="head_name-desc">Head of Household (Z to A)</SelectItem>
                                        <SelectItem value="member_count-asc">Members (Low to High)</SelectItem>
                                        <SelectItem value="member_count-desc">Members (High to Low)</SelectItem>
                                        <SelectItem value="purok-asc">Purok (A to Z)</SelectItem>
                                        <SelectItem value="purok-desc">Purok (Z to A)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && hasHouseholds && (
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ctrl+Shift+B • Ctrl+A to select</p>
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
                    {!hasHouseholds ? (
                        <EmptyState
                            icon={<Home className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No households found"
                            description={hasActiveFilters 
                                ? "No households match your current filters. Try adjusting your search or filters."
                                : "No households have been created yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : undefined}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <HouseholdsTableView
                                    households={households}
                                    isBulkMode={isBulkMode}
                                    selectedHouseholds={selectedHouseholds}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    puroks={puroks}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                />
                            ) : (
                                // Grid View
                                <HouseholdsGridView
                                    households={households}
                                    isBulkMode={isBulkMode}
                                    selectedHouseholds={selectedHouseholds}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onCopyToClipboard={onCopyToClipboard}
                                    puroks={puroks}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedHouseholds.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedHouseholds.length}
                                    totalCount={households.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                    extraInfo={
                                        selectionStats && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Total members: {selectionStats.totalMembers || 0}
                                            </div>
                                        )
                                    }
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