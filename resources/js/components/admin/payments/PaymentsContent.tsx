// components/admin/payments/PaymentsContent.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
    Receipt,
    DollarSign,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    User,
    Users,
    Download,
    Printer,
    Edit,
    Trash2,
    Copy,
    Eye,
    FileSpreadsheet,
    CheckSquare,
    Square,
    Mail,
    QrCode,
    CheckCheck,
    Layers,
    List,
    Grid3X3
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import PaymentsTableView from './PaymentsTableView';
import PaymentsGridView from './PaymentsGridView';
import PaymentsBulkActions from './PaymentsBulkActions';
import { Payment, Filters, SelectionStats } from '@/types/payments.types';

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
    onBulkOperation: (operation: string) => void;
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
    // Refs for bulk actions
    bulkActionRef?: React.RefObject<HTMLDivElement>;
    showBulkActions?: boolean;
    setShowBulkActions?: (show: boolean) => void;
    // Optional custom bulk actions
    customBulkActions?: any;
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
    customBulkActions
}: PaymentsContentProps) {
    
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
                            Page {currentPage} of {totalPages}
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