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
import { FileText, ArrowUpDown } from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import FeesTableView from './FeesTableView';
import FeesGridView from './FeesGridView';
import FeesBulkActions from './FeesBulkActions';
import { Fee, Filters, SelectionStats, BulkOperation } from '@/types/admin/fees/fees';

interface FeesContentProps {
    fees: Fee[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedFees: number[];
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
    onClearSelection?: () => void;
    onDelete: (fee: Fee) => void;
    onViewDetails?: (fee: Fee) => void;
    onEdit?: (fee: Fee) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onCopySelectedData?: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    filtersState: Filters;
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: SelectionStats;
    statuses?: Record<string, string>;
    categories?: Record<string, string>;
    puroks?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
    bulkActionRef?: React.RefObject<HTMLDivElement>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    onRemindersSent?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
}

export default function FeesContent({
    fees,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedFees,
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
    onClearSelection = () => {},
    onDelete,
    onViewDetails,
    onEdit,
    onCopyToClipboard,
    onCopySelectedData = () => {},
    onSort,
    onBulkOperation,
    setShowBulkDeleteDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    statuses = {},
    categories = {},
    puroks = [],
    sortBy = 'name',
    sortOrder = 'asc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'name-asc',
    bulkActionRef,
    showBulkActions = false,
    setShowBulkActions = () => {},
    onRemindersSent,
    onExport,
    onPrint
}: FeesContentProps) {
    
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // Helper functions
    const formatCurrency = (amount: number | string | undefined) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount || 0;
        if (isNaN(numAmount)) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            archived: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        };
        return colors[status] || 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    };

    const getStatusIcon = (status: string) => null;

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            tax: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            clearance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            permit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
        return colors[category] || colors.fee;
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            tax: 'Tax',
            clearance: 'Clearance',
            permit: 'Permit',
            fee: 'Fee'
        };
        return labels[category] || category;
    };

    const hasFees = fees && fees.length > 0;

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedFees.length > 0 && (
                <FeesBulkActions
                    selectedFees={selectedFees}
                    selectionMode={selectionMode}
                    selectionStats={selectionStats}
                    isPerformingBulkAction={isPerformingBulkAction}
                    isSelectAll={isSelectAll}
                    totalItems={totalItems}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={onSelectAllOnPage}
                    onSelectAllFiltered={onSelectAllFiltered}
                    onSelectAll={onSelectAll}
                    onBulkOperation={onBulkOperation}
                    onCopySelectedData={onCopySelectedData}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    bulkActionRef={bulkActionRef}
                    showBulkActions={showBulkActions}
                    setShowBulkActions={setShowBulkActions}
                    setIsBulkMode={setIsBulkMode}
                    onRemindersSent={onRemindersSent}
                    onExport={onExport}
                    onPrint={onPrint}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && hasFees && selectedFees.length < fees.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedFees.length}
                    totalCount={fees.length}
                    position="bottom-right"
                />
            )}

            {/* Fees List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Fees List
                                {selectedFees.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedFees.length} selected
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
                                        <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                                        <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="category-asc">Category (A to Z)</SelectItem>
                                        <SelectItem value="category-desc">Category (Z to A)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && hasFees && (
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
                    {/* Empty State */}
                    {!hasFees ? (
                        <EmptyState
                            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No fees found"
                            description={hasActiveFilters 
                                ? "No fees match your current filters. Try adjusting your search or filters."
                                : "No fees have been created yet."}
                            hasFilters={hasActiveFilters}
                            onClearFilters={hasActiveFilters ? onClearFilters : undefined}
                            onCreateNew={!hasActiveFilters ? () => window.location.href = '/admin/fees/create' : undefined}
                            createLabel="Create Fee"
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <FeesTableView
                                    fees={fees}
                                    isBulkMode={isBulkMode}
                                    selectedFees={selectedFees}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onViewDetails={onViewDetails}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    statuses={statuses}
                                    categories={categories}
                                    formatCurrency={formatCurrency}
                                    getStatusColor={getStatusColor}
                                    getStatusIcon={getStatusIcon}
                                    getCategoryColor={getCategoryColor}
                                    getCategoryLabel={getCategoryLabel}
                                />
                            ) : (
                                // Grid View
                                <FeesGridView
                                    fees={fees}
                                    isBulkMode={isBulkMode}
                                    selectedFees={selectedFees}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onViewDetails={onViewDetails}
                                    onCopyToClipboard={onCopyToClipboard}
                                    formatCurrency={formatCurrency}
                                    getStatusColor={getStatusColor}
                                    getStatusIcon={getStatusIcon}
                                    getCategoryColor={getCategoryColor}
                                    getCategoryLabel={getCategoryLabel}
                                    statuses={statuses}
                                    categories={categories}
                                />
                            )}

                            {/* Grid Selection Summary */}
                            {viewMode === 'grid' && isBulkMode && selectedFees.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedFees.length}
                                    totalCount={fees.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                    extraInfo={
                                        selectionStats && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Total amount: {formatCurrency(selectionStats.totalAmount || 0)}
                                            </div>
                                        )
                                    }
                                />
                            )}

                            {/* Pagination */}
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