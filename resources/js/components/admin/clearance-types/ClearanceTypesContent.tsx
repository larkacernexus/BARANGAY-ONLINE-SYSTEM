import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

// Import reusable components
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ClearanceTypesTableView from './ClearanceTypesTableView';
import ClearanceTypesGridView from './ClearanceTypesGridView';
import ClearanceTypesBulkActions from './ClearanceTypesBulkActions';

// Import types
import { 
    ClearanceType, 
    BulkOperation, 
    SelectionMode, 
    FilterState, 
    SelectionStats,
    getPurposeOptionsCount,
    PaginatedClearanceTypesResponse
} from '@/types/admin/clearance-types/clearance-types';

interface ClearanceTypesContentProps {
    clearanceTypes: PaginatedClearanceTypesResponse;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedTypes: number[];
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
    onDelete: (type: ClearanceType) => void;
    onToggleStatus: (type: ClearanceType) => void;
    onToggleDiscountable?: (type: ClearanceType) => void;
    onDuplicate: (type: ClearanceType) => void;
    onViewPhoto: (type: ClearanceType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onSmartBulkToggle: () => void;
    onSmartBulkDiscountableToggle?: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkEditDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
    getTruncationLength: (type: 'name' | 'description' | 'code') => number;
}

export default function ClearanceTypesContent({
    clearanceTypes,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedTypes,
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
    onToggleDiscountable,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    onCopySelectedData,
    onSort,
    onBulkOperation,
    onSmartBulkToggle,
    onSmartBulkDiscountableToggle,
    setShowBulkDeleteDialog,
    setShowBulkEditDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    sortBy = 'name',
    sortOrder = 'asc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'name-asc',
    getTruncationLength
}: ClearanceTypesContentProps) {
    
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedTypes.length > 0 && (
                <ClearanceTypesBulkActions
                    selectedTypes={selectedTypes}
                    selectionMode={selectionMode}
                    selectionStats={selectionStats}
                    isPerformingBulkAction={isPerformingBulkAction}
                    isSelectAll={isSelectAll}
                    isMobile={isMobile}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={onSelectAllOnPage}
                    onSelectAllFiltered={onSelectAllFiltered}
                    onSelectAll={onSelectAll}
                    onBulkOperation={onBulkOperation}
                    onCopySelectedData={onCopySelectedData}
                    onSmartBulkToggle={onSmartBulkToggle}
                    onSmartBulkDiscountableToggle={onSmartBulkDiscountableToggle}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkEditDialog={setShowBulkEditDialog}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && clearanceTypes.data.length > 0 && selectedTypes.length < clearanceTypes.data.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedTypes.length}
                    totalCount={clearanceTypes.data.length}
                    position="bottom-right"
                />
            )}

            {/* Clearance Types List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Clearance Types
                                {selectedTypes.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedTypes.length} selected
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
                                        <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                        <SelectItem value="code-asc">Code (A to Z)</SelectItem>
                                        <SelectItem value="code-desc">Code (Z to A)</SelectItem>
                                        <SelectItem value="fee-asc">Fee (Low to High)</SelectItem>
                                        <SelectItem value="fee-desc">Fee (High to Low)</SelectItem>
                                        <SelectItem value="processing_days-asc">Processing Days (Low to High)</SelectItem>
                                        <SelectItem value="processing_days-desc">Processing Days (High to Low)</SelectItem>
                                        <SelectItem value="validity_days-asc">Validity Days (Low to High)</SelectItem>
                                        <SelectItem value="validity_days-desc">Validity Days (High to Low)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="requires_payment-asc">Requires Payment (No to Yes)</SelectItem>
                                        <SelectItem value="requires_payment-desc">Requires Payment (Yes to No)</SelectItem>
                                        <SelectItem value="is_discountable-asc">Discountable (No to Yes)</SelectItem>
                                        <SelectItem value="is_discountable-desc">Discountable (Yes to No)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && clearanceTypes.data.length > 0 && (
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ctrl+Shift+B • Ctrl+A to select</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Esc to exit • Del to delete</p>
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
                    {clearanceTypes.data.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No clearance types found"
                            description={hasActiveFilters 
                                ? "No clearance types match your current filters. Try adjusting your search or filters."
                                : "No clearance types have been added yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : {
                                label: "Create Clearance Type",
                                href: "/admin/clearance-types/create"
                            }}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <ClearanceTypesTableView
                                    clearanceTypes={clearanceTypes.data}
                                    isBulkMode={isBulkMode}
                                    selectedTypes={selectedTypes}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onToggleDiscountable={onToggleDiscountable}
                                    onDuplicate={onDuplicate}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    getPurposeOptionsCount={getPurposeOptionsCount}
                                    getTruncationLength={getTruncationLength}
                                />
                            ) : (
                                // Grid View
                                <ClearanceTypesGridView
                                    clearanceTypes={clearanceTypes.data}
                                    isBulkMode={isBulkMode}
                                    selectedTypes={selectedTypes}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onToggleDiscountable={onToggleDiscountable}
                                    onDuplicate={onDuplicate}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    getPurposeOptionsCount={getPurposeOptionsCount}
                                    getTruncationLength={getTruncationLength}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedTypes.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedTypes.length}
                                    totalCount={clearanceTypes.data.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                />
                            )}

                            {/* Pagination with dark mode */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                                    </div>
                                    <div className="flex gap-2">
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
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}