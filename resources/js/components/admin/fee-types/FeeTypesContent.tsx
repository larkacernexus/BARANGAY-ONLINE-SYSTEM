// components/admin/fee-types/FeeTypesContent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Grid3X3, Rows, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';

// Import reusable components
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import FeeTypesTableView from './FeeTypesTableView';
import FeeTypesGridView from './FeeTypesGridView';
import FeeTypesBulkActions from './FeeTypesBulkActions';

// Import types
import { FeeType, BulkOperation, BulkEditField, SelectionMode, FilterState, SelectionStats } from '@/types/fee-types';

interface FeeTypesContentProps {
    feeTypes: FeeType[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedFeeTypes: number[];
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
    onDelete: (feeType: FeeType) => void;
    onToggleStatus?: (feeType: FeeType) => void;
    onDuplicate?: (feeType: FeeType) => void;
    onViewPhoto: (feeType: FeeType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    setShowBulkCategoryDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    categories: Record<string, string>;
    getCategoryDetails: (feeType: FeeType) => {
        name: string;
        icon: React.ReactNode;
        color: string;
    };
    formatCurrency: (amount: any) => string;
    formatDate: (dateString: string) => string;
}

export default function FeeTypesContent({
    feeTypes,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedFeeTypes,
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
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    onCopySelectedData,
    onSort,
    onBulkOperation,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkCategoryDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats = {
        total: 0,
        active: 0,
        inactive: 0,
        mandatory: 0,
        autoGenerate: 0,
        totalAmount: 0,
        fixedAmount: 0,
        variableAmount: 0
    },
    categories,
    getCategoryDetails,
    formatCurrency,
    formatDate
}: FeeTypesContentProps) {
    
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedFeeTypes.length > 0 && (
                <FeeTypesBulkActions
                    selectedFeeTypes={selectedFeeTypes}
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
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkStatusDialog={setShowBulkStatusDialog}
                    setShowBulkCategoryDialog={setShowBulkCategoryDialog}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && feeTypes.length > 0 && selectedFeeTypes.length < feeTypes.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedFeeTypes.length}
                    totalCount={feeTypes.length}
                    position="bottom-right"
                />
            )}

            {/* Fee Types List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Fee Types List
                                {selectedFeeTypes.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedFeeTypes.length} selected
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
                        {viewMode === 'grid' && isBulkMode && feeTypes.length > 0 && (
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
                    {feeTypes.length === 0 ? (
                        <EmptyState
                            icon={<DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No fee types found"
                            description={hasActiveFilters 
                                ? "No fee types match your current filters. Try adjusting your search or filters."
                                : "No fee types have been added yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : {
                                label: "Add Fee Type",
                                href: "/admin/fee-types/create"
                            }}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <FeeTypesTableView
                                    feeTypes={feeTypes}
                                    isBulkMode={isBulkMode}
                                    selectedFeeTypes={selectedFeeTypes}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    getCategoryDetails={getCategoryDetails}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            ) : (
                                // Grid View
                                <FeeTypesGridView
                                    feeTypes={feeTypes}
                                    isBulkMode={isBulkMode}
                                    selectedFeeTypes={selectedFeeTypes}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    getCategoryDetails={getCategoryDetails}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedFeeTypes.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedFeeTypes.length}
                                    totalCount={feeTypes.length}
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