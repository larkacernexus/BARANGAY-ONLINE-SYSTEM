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
    Shield, 
    Download, 
    FileSpreadsheet, 
    Printer, 
    Users2,
    Archive,
    Copy,
    Edit,
    Trash2,
    Users,
    Calendar,
    AlertCircle,
    CheckSquare,
    Square,
    Share2,
    BarChart3,
    Key,
    KeyRound,
    Filter,
    Hash,
    List,
    Grid3X3,
    MoreVertical,
    TargetIcon,
    ChevronUp,
    ChevronDown,
    CheckCircle,
    XCircle,
    Crown,
    Loader2,
    X,
    ArrowUpDown
} from 'lucide-react';

import { Link } from '@inertiajs/react';
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import PositionsTableView from '@/components/admin/positions/PositionsTableView';
import PositionsGridView from '@/components/admin/positions/PositionsGridView';
import PositionsBulkActions from '@/components/admin/positions/PositionsBulkActions';
import { Position, PositionFilters, PositionStats, BulkOperation } from '@/types/admin/positions/position.types';
import { positionUtils } from '@/admin-utils/position-utils';

interface PositionsContentProps {
    positions: Position[];
    stats?: PositionStats;
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
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    filtersState: PositionFilters;
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
    onCopyToClipboard?: (text: string, label: string) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export default function PositionsContent({
    positions,
    stats,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedPositions,
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
    onSelectAllFiltered,
    onSelectAll,
    onItemSelect,
    onClearFilters,
    onClearSelection,
    onDelete,
    onSort,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats = {},
    onCopyToClipboard,
    sortBy = 'order',
    sortOrder = 'asc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'order-asc'
}: PositionsContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkOperation),
                tooltip: 'Export selected positions'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print' as BulkOperation),
                tooltip: 'Print selected positions'
            },
            {
                label: 'Report',
                icon: <BarChart3 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_report' as BulkOperation),
                tooltip: 'Generate report for selected positions'
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate' as BulkOperation),
                tooltip: 'Activate selected positions'
            },
            {
                label: 'Deactivate',
                icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate' as BulkOperation),
                tooltip: 'Deactivate selected positions'
            },
            {
                label: 'Require Account',
                icon: <Key className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('toggle_account' as BulkOperation),
                tooltip: 'Set account requirement for selected positions'
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
                tooltip: 'Delete selected positions',
                variant: 'destructive' as const
            }
        ]
    };

    // Toggle handler for bulk mode
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedPositions.length > 0 && (
                <PositionsBulkActions
                    selectedPositions={selectedPositions}
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
                    setShowBulkStatusDialog={setShowBulkStatusDialog}
                    bulkActions={bulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && positions.length > 0 && selectedPositions.length < positions.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedPositions.length}
                    totalCount={positions.length}
                    position="bottom-right"
                />
            )}

            {/* Positions List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Positions List
                                {selectedPositions.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedPositions.length} selected
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
                                        <SelectItem value="order-asc">Display Order (Low to High)</SelectItem>
                                        <SelectItem value="order-desc">Display Order (High to Low)</SelectItem>
                                        <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                        <SelectItem value="code-asc">Code (A to Z)</SelectItem>
                                        <SelectItem value="code-desc">Code (Z to A)</SelectItem>
                                        <SelectItem value="committee-asc">Committee (A to Z)</SelectItem>
                                        <SelectItem value="committee-desc">Committee (Z to A)</SelectItem>
                                        <SelectItem value="description-asc">Description (A to Z)</SelectItem>
                                        <SelectItem value="description-desc">Description (Z to A)</SelectItem>
                                        <SelectItem value="member_count-asc">Officials (Low to High)</SelectItem>
                                        <SelectItem value="member_count-desc">Officials (High to Low)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="requires_account-asc">Account Required (No to Yes)</SelectItem>
                                        <SelectItem value="requires_account-desc">Account Required (Yes to No)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && positions.length > 0 && (
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
                    {positions.length === 0 ? (
                        <EmptyState
                            icon={<Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No positions found"
                            description={hasActiveFilters 
                                ? "No positions match your current filters. Try adjusting your search or filters."
                                : "No positions have been created yet."}
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
                                <PositionsTableView
                                    positions={positions}
                                    isBulkMode={isBulkMode}
                                    selectedPositions={selectedPositions}
                                    isMobile={isMobile}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    selectionStats={selectionStats}
                                    getSortIcon={getSortIcon}
                                />
                            ) : (
                                // Grid View
                                <PositionsGridView
                                    positions={positions}
                                    isBulkMode={isBulkMode}
                                    selectedPositions={selectedPositions}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onDelete={onDelete}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    selectionStats={selectionStats}
                                    onCopyToClipboard={onCopyToClipboard}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedPositions.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedPositions.length}
                                    totalCount={positions.length}
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