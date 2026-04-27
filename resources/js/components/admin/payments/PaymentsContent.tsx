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
    Receipt,
    ArrowUpDown,
    Rows3
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import PaymentsTableView from './PaymentsTableView';
import PaymentsGridView from './PaymentsGridView';
import PaymentsBulkActions from './PaymentsBulkActions';
import { Payment, Filters, SelectionStats, BulkOperationType } from '@/types/admin/payments/payments';

interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface PayerTypeOption {
    value: string;
    label: string;
}

interface PaymentsContentProps {
    payments: Payment[];
    paymentsMeta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedPayments: number[];
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
    onDelete: (payment: Payment) => void;
    onViewDetails: (payment: Payment) => void;
    onPrintReceipt: (payment: Payment) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperationType, customData?: any) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    filtersState: Filters;
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: SelectionStats;
    expandedPayments: Set<number>;
    togglePaymentExpanded: (id: number) => void;
    paymentMethods?: PaymentMethod[];
    statusOptions?: StatusOption[];
    payerTypeOptions?: PayerTypeOption[];
    isLoading: boolean;
    windowWidth: number;
    bulkActionRef?: React.RefObject<HTMLDivElement | null>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    customBulkActions?: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export default function PaymentsContent({
    payments,
    paymentsMeta,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedPayments,
    viewMode,
    setViewMode,
    isMobile = false,
    hasActiveFilters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    perPage = '20',
    onPerPageChange = () => {},
    onPageChange,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onItemSelect,
    onClearFilters,
    onClearSelection,
    onDelete,
    onViewDetails,
    onPrintReceipt,
    onCopyToClipboard,
    onCopySelectedData,
    onSort,
    onBulkOperation,
    setShowBulkDeleteDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats = {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        totalAmount: 0,
        avgAmount: 0,
        cashPayments: 0,
        digitalPayments: 0,
        residents: 0,
        households: 0
    },
    expandedPayments,
    togglePaymentExpanded,
    paymentMethods = [],
    statusOptions = [],
    payerTypeOptions = [],
    isLoading,
    windowWidth,
    bulkActionRef,
    showBulkActions = false,
    setShowBulkActions = () => {},
    customBulkActions,
    sortBy = 'payment_date',
    sortOrder = 'desc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'payment_date-desc'
}: PaymentsContentProps) {
    
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
    
    // Toggle handler for bulk mode
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    // Helper functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedPayments.length > 0 && (
                <PaymentsBulkActions
                    selectedPayments={selectedPayments}
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
                    customBulkActions={customBulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && payments.length > 0 && selectedPayments.length < payments.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedPayments.length}
                    totalCount={payments.length}
                    position="bottom-right"
                />
            )}

            {/* Payments List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Payment Transactions
                                {selectedPayments.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedPayments.length} selected
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
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="or_number-asc">OR Number (A to Z)</SelectItem>
                                        <SelectItem value="or_number-desc">OR Number (Z to A)</SelectItem>
                                        <SelectItem value="payer_name-asc">Payer Name (A to Z)</SelectItem>
                                        <SelectItem value="payer_name-desc">Payer Name (Z to A)</SelectItem>
                                        <SelectItem value="payment_method-asc">Payment Method (A to Z)</SelectItem>
                                        <SelectItem value="payment_method-desc">Payment Method (Z to A)</SelectItem>
                                        <SelectItem value="total_amount-asc">Amount (Low to High)</SelectItem>
                                        <SelectItem value="total_amount-desc">Amount (High to Low)</SelectItem>
                                        <SelectItem value="status-asc">Status (A to Z)</SelectItem>
                                        <SelectItem value="status-desc">Status (Z to A)</SelectItem>
                                        <SelectItem value="payment_date-asc">Payment Date (Oldest first)</SelectItem>
                                        <SelectItem value="payment_date-desc">Payment Date (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && payments.length > 0 && (
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
                            {totalItems > 0 && (
                                <>
                                    Showing {payments.length > 0 ? '1' : '0'} - {payments.length} of {totalItems}
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {/* Empty State with dark mode */}
                    {payments.length === 0 ? (
                        <EmptyState
                            icon={<Receipt className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No payments found"
                            description={hasActiveFilters 
                                ? "No payments match your current filters. Try adjusting your search or filters."
                                : "No payments have been recorded yet."}
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
                                <PaymentsTableView
                                    payments={payments}
                                    isBulkMode={isBulkMode}
                                    selectedPayments={selectedPayments}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onViewDetails={onViewDetails}
                                    onPrintReceipt={onPrintReceipt}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    expandedPayments={expandedPayments}
                                    togglePaymentExpanded={togglePaymentExpanded}
                                    paymentMethods={paymentMethods}
                                    statusOptions={statusOptions}
                                    payerTypeOptions={payerTypeOptions}
                                    isLoading={isLoading}
                                    windowWidth={windowWidth}
                                />
                            ) : (
                                // Grid View
                                <PaymentsGridView
                                    payments={payments}
                                    isBulkMode={isBulkMode}
                                    selectedPayments={selectedPayments}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onViewDetails={onViewDetails}
                                    onPrintReceipt={onPrintReceipt}
                                    onCopyToClipboard={onCopyToClipboard}
                                    formatCurrency={formatCurrency}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedPayments.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedPayments.length}
                                    totalCount={payments.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                    extraInfo={
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Total amount: {formatCurrency(selectionStats.totalAmount)}
                                        </div>
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