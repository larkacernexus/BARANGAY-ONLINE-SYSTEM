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
    ArrowUpDown,
    Rows3
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
    stats?: any[] | {
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
    perPage?: string;
    onPerPageChange?: (value: string) => void;
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
    sortOrder: 'asc' | 'desc' | string;
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
    isLoading?: boolean;
}

export default function HouseholdsContent({
    households,
    stats = { total: 0, active: 0, inactive: 0, totalMembers: 0, averageMembers: 0, purokCount: 0 },
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
    perPage = '15',
    onPerPageChange = () => {},
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
    getCurrentSortValue = () => 'household_number-asc',
    isLoading = false
}: HouseholdsContentProps) {
    
    // Per page options
    const perPageOptions = [
        { value: '15', label: '15 per page' },
        { value: '30', label: '30 per page' },
        { value: '50', label: '50 per page' },
        { value: '100', label: '100 per page' },
        { value: '500', label: '500 per page' },
    ];

    // Handle per page change
    const handlePerPageChange = (value: string) => {
        if (isLoading) return;
        onPerPageChange(value);
    };
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected households',
                disabled: isLoading
            },
            {
                label: 'Edit Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Bulk edit status',
                disabled: isLoading
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate'),
                tooltip: 'Activate selected households',
                disabled: isLoading
            },
            {
                label: 'Deactivate',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate'),
                tooltip: 'Deactivate selected households',
                disabled: isLoading
            },
            {
                label: 'Change Purok',
                icon: <Globe className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkPurokDialog?.(true),
                tooltip: 'Change purok for selected households',
                disabled: isLoading
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected households',
                disabled: isLoading
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard',
                disabled: isLoading
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected households',
                variant: 'destructive' as const,
                disabled: isLoading
            }
        ]
    };

    // Toggle bulk mode handler
    const handleBulkModeToggle = () => {
        if (isLoading) return;
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // Check if we have any households
    const hasHouseholds = households && households.length > 0;

    // Safe stats extraction
    const safeStats = Array.isArray(stats) 
        ? { total: 0, active: 0, inactive: 0, totalMembers: 0, averageMembers: 0, purokCount: 0 }
        : stats;

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
                                        <SelectItem value="household_number-asc">Household # (A to Z)</SelectItem>
                                        <SelectItem value="household_number-desc">Household # (Z to A)</SelectItem>
                                        <SelectItem value="head_name-asc">Head of Household (A to Z)</SelectItem>
                                        <SelectItem value="head_name-desc">Head of Household (Z to A)</SelectItem>
                                        <SelectItem value="member_count-asc">Members (Low to High)</SelectItem>
                                        <SelectItem value="member_count-desc">Members (High to Low)</SelectItem>
                                        <SelectItem value="purok-asc">Purok (A to Z)</SelectItem>
                                        <SelectItem value="purok-desc">Purok (Z to A)</SelectItem>
                                        <SelectItem value="status-asc">Status (A to Z)</SelectItem>
                                        <SelectItem value="status-desc">Status (Z to A)</SelectItem>
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
                                    Showing {households.length > 0 ? '1' : '0'} - {households.length} of {totalItems}
                                </>
                            )}
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
                                    isLoading={isLoading}
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
                                    isLoading={isLoading}
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