// components/admin/fees/FeesContent.tsx - COMPLETE REVISED FILE

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileText, ArrowUpDown, Rows3 } from 'lucide-react';

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
    perPage?: string;
    onPerPageChange?: (value: string) => void;
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
    bulkActionRef?: React.RefObject<HTMLDivElement | null>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    onRemindersSent?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
    isLoading?: boolean;
}

// ✅ Dynamic per-page options - 15 is default, no 20
const getDynamicPerPageOptions = (totalItems: number) => {
    const options: { value: string; label: string }[] = [];
    
    options.push({ value: '15', label: '15 per page' });
    
    if (totalItems > 15) {
        options.push({ value: '30', label: '30 per page' });
    }
    
    if (totalItems > 30) {
        options.push({ value: '50', label: '50 per page' });
    }
    
    if (totalItems > 50) {
        options.push({ value: '100', label: '100 per page' });
    }
    
    if (totalItems > 100) {
        options.push({ value: '500', label: '500 per page' });
    }
    
    if (totalItems > 0 && totalItems <= 550) {
        options.push({ value: 'all', label: `Show All (${totalItems})` });
    }
    
    return options;
};

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
    perPage = '15',
    onPerPageChange = () => {},
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
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'created_at-desc',
    bulkActionRef,
    showBulkActions = false,
    setShowBulkActions = () => {},
    onRemindersSent,
    onExport,
    onPrint,
    isLoading = false
}: FeesContentProps) {
    
    const perPageOptions = getDynamicPerPageOptions(totalItems);

    const handlePerPageChange = (value: string) => {
        if (isLoading) return;
        onPerPageChange(value);
    };
    
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // ✅ PROPERLY DEFINED FUNCTIONS - NOT inline throw statements
    const formatCurrency = (amount: number | string | undefined) => {
        if (amount === undefined || amount === null) return '₱0.00';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
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
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            partial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            partially_paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    // ✅ Properly defined helper functions
    const getStatusIcon = (status: string): React.ReactNode => {
        return null; // or return proper icons if needed
    };

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            tax: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            clearance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            permit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            donation: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const getCategoryLabel = (category: string): string => {
        const labels: Record<string, string> = {
            tax: 'Tax',
            clearance: 'Clearance',
            permit: 'Permit',
            fee: 'Fee',
            donation: 'Donation'
        };
        return labels[category] || category;
    };

    const hasFees = fees && fees.length > 0;

    return (
        <>
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

            {viewMode === 'grid' && hasFees && selectedFees.length < fees.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedFees.length}
                    totalCount={fees.length}
                    position="bottom-right"
                />
            )}

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
                            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} isMobile={isMobile} />
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Per Page Selector */}
                        {!isMobile && totalItems > 0 && (
                            <div className="flex items-center gap-2">
                                <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select value={perPage} onValueChange={handlePerPageChange} disabled={isLoading}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                        <SelectValue placeholder="15 per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Sort By Dropdown */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select value={getCurrentSortValue()} onValueChange={onSortChange} disabled={isLoading}>
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
                                        <SelectItem value="status-asc">Status (A to Z)</SelectItem>
                                        <SelectItem value="status-desc">Status (Z to A)</SelectItem>
                                        <SelectItem value="payer_type-asc">Payer Type (A to Z)</SelectItem>
                                        <SelectItem value="payer_type-desc">Payer Type (Z to A)</SelectItem>
                                        <SelectItem value="due_date-asc">Due Date (Oldest first)</SelectItem>
                                        <SelectItem value="due_date-desc">Due Date (Newest first)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all */}
                        {viewMode === 'grid' && isBulkMode && hasFees && (
                            <div className="flex items-center gap-2">
                                <Checkbox id="select-all-grid" checked={isSelectAll} onCheckedChange={onSelectAllOnPage} disabled={isLoading} className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600" />
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
                                            <Switch id="bulk-mode" checked={isBulkMode} onCheckedChange={handleBulkModeToggle} disabled={isLoading} className="data-[state=checked]:bg-blue-600 h-5 w-9" />
                                            <Label htmlFor="bulk-mode" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">Bulk Mode</Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-200"><p>Toggle bulk selection mode</p></TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        
                        {/* Page Info */}
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            {totalItems > 0 && <>Showing {fees.length > 0 ? '1' : '0'} - {fees.length} of {totalItems}</>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {!hasFees ? (
                        <EmptyState
                            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No fees found"
                            description={hasActiveFilters ? "No fees match your current filters." : "No fees have been created yet."}
                            action={hasActiveFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
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
                                    sortBy={sortBy} 
                                    sortOrder={sortOrder} 
                                    isLoading={isLoading} 
                                />
                            ) : (
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
                                    isLoading={isLoading} 
                                />
                            )}

                            {viewMode === 'grid' && isBulkMode && selectedFees.length > 0 && (
                                <GridSelectionSummary selectedCount={selectedFees.length} totalCount={fees.length} isSelectAll={isSelectAll} onSelectAll={onSelectAllOnPage} onClearSelection={onClearSelection} className="mt-4 mx-4" extraInfo={selectionStats && <div className="text-xs text-gray-500 mt-1">Total: {formatCurrency(selectionStats.totalAmount || 0)}</div>} />
                            )}

                            {/* Footer with mobile per-page selector */}
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    {isMobile && totalItems > 0 && (
                                        <div className="flex items-center gap-2 w-full">
                                            <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Select value={perPage} onValueChange={handlePerPageChange} disabled={isLoading}>
                                                <SelectTrigger className="w-full h-8 text-xs">
                                                    <SelectValue placeholder="15 per page" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perPageOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="w-full">
                                        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={onPageChange} showCount={true} />
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