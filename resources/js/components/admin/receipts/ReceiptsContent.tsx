import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ReceiptsTableView from '@/components/admin/receipts/ReceiptsTableView';
import ReceiptsGridView from '@/components/admin/receipts/ReceiptsGridView';
import ReceiptsBulkActions from '@/components/admin/receipts/ReceiptsBulkActions';
import { FileSpreadsheet, Printer, BarChart3, Copy, Ban, FileText, Receipt as ReceiptIcon, ArrowUpDown } from 'lucide-react';

// ✅ Define the ReceiptData type that matches actual backend data
interface ReceiptData {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    formatted_total: string;
    formatted_amount_paid: string;
    payment_method: string;
    payment_method_label: string;
    formatted_issued_date: string;
    status: string;
    is_voided: boolean;
    printed_count: number;
    fee_breakdown: Array<any>;
}

interface SelectionStats {
    count: number;
    totalAmount: number;
    formattedTotalAmount: string;
    paidAmount: number;
    formattedPaidAmount: string;
    voidedCount: number;
    printedCount: number;
    paymentMethods: Record<string, number>;
}

interface ReceiptsContentProps {
    receipts: ReceiptData[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedReceipts: number[];
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
    onDelete: (receipt: ReceiptData) => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    onView: (id: number) => void;
    onPrint: (receipt: ReceiptData) => void;
    onVoid: (id: number, receiptNumber: string) => void;
    onGenerateFromClearance: (clearanceId: number) => void;
    setShowBulkVoidDialog?: (show: boolean) => void;
    setShowBulkExportDialog?: (show: boolean) => void;
    pendingClearances?: any[];
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: SelectionStats;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
    onCreateNew?: () => void;
}

export default function ReceiptsContent({
    receipts,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedReceipts,
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
    onView,
    onPrint,
    onVoid,
    onGenerateFromClearance,
    setShowBulkVoidDialog,
    setShowBulkExportDialog,
    pendingClearances = [],
    isPerformingBulkAction,
    selectionMode,
    selectionStats = {
        count: 0,
        totalAmount: 0,
        formattedTotalAmount: '₱0.00',
        paidAmount: 0,
        formattedPaidAmount: '₱0.00',
        voidedCount: 0,
        printedCount: 0,
        paymentMethods: {}
    },
    sortBy = 'issued_date',
    sortOrder = 'desc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'issued_date-desc',
    onCreateNew = () => window.location.href = '/admin/receipts/create'
}: ReceiptsContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected receipts'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected receipts'
            },
            {
                label: 'Generate Report',
                icon: <BarChart3 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_report'),
                tooltip: 'Generate report for selected receipts'
            }
        ],
        secondary: [
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard'
            }
        ],
        destructive: [
            {
                label: 'Void',
                icon: <Ban className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkVoidDialog?.(true),
                tooltip: 'Void selected receipts',
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
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedReceipts.length > 0 && (
                <ReceiptsBulkActions
                    selectedReceipts={selectedReceipts}
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
                    setShowBulkVoidDialog={setShowBulkVoidDialog}
                    bulkActions={bulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && receipts.length > 0 && selectedReceipts.length < receipts.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedReceipts.length}
                    totalCount={receipts.length}
                    position="bottom-right"
                />
            )}

            {/* Receipts List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <ReceiptIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Receipt List
                                {selectedReceipts.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedReceipts.length} selected
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
                                        <SelectItem value="receipt_number-asc">Receipt # (A to Z)</SelectItem>
                                        <SelectItem value="receipt_number-desc">Receipt # (Z to A)</SelectItem>
                                        <SelectItem value="or_number-asc">OR # (A to Z)</SelectItem>
                                        <SelectItem value="or_number-desc">OR # (Z to A)</SelectItem>
                                        <SelectItem value="payer_name-asc">Payer Name (A to Z)</SelectItem>
                                        <SelectItem value="payer_name-desc">Payer Name (Z to A)</SelectItem>
                                        <SelectItem value="payment_method-asc">Payment Method (A to Z)</SelectItem>
                                        <SelectItem value="payment_method-desc">Payment Method (Z to A)</SelectItem>
                                        <SelectItem value="total_amount-asc">Amount (Low to High)</SelectItem>
                                        <SelectItem value="total_amount-desc">Amount (High to Low)</SelectItem>
                                        <SelectItem value="status-asc">Status (A to Z)</SelectItem>
                                        <SelectItem value="status-desc">Status (Z to A)</SelectItem>
                                        <SelectItem value="issued_date-asc">Issue Date (Oldest first)</SelectItem>
                                        <SelectItem value="issued_date-desc">Issue Date (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && receipts.length > 0 && (
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
                    {receipts.length === 0 ? (
                        <EmptyState
                            icon={<ReceiptIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No receipts found"
                            description={hasActiveFilters 
                                ? "No receipts match your current filters. Try adjusting your search or filters."
                                : "No receipts have been generated yet."}
                            hasFilters={hasActiveFilters}
                            onClearFilters={onClearFilters}
                            onCreateNew={onCreateNew}
                            createLabel="Generate Receipt"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <ReceiptsTableView
                                    receipts={receipts}
                                    isBulkMode={isBulkMode}
                                    selectedReceipts={selectedReceipts}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onView={onView}
                                    onPrint={onPrint}
                                    onVoid={onVoid}
                                    onDelete={onDelete}
                                    selectionStats={selectionStats}
                                    getSortIcon={getSortIcon}
                                />
                            ) : (
                                // Grid View
                                <ReceiptsGridView
                                    receipts={receipts}
                                    isBulkMode={isBulkMode}
                                    selectedReceipts={selectedReceipts}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onView={onView}
                                    onPrint={onPrint}
                                    onVoid={onVoid}
                                    onDelete={onDelete}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    selectionStats={selectionStats}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedReceipts.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedReceipts.length}
                                    totalCount={receipts.length}
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

            {/* Pending Clearances Alert */}
            {pendingClearances.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-400">
                                Pending Receipt Generation
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                {pendingClearances.length} approved clearance(s) need receipts
                            </p>
                            <div className="mt-3 space-y-2">
                                {pendingClearances.map((clearance) => (
                                    <div key={clearance.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {clearance.resident_name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {clearance.clearance_type} • {clearance.control_number}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {clearance.formatted_fee}
                                            </span>
                                            <button
                                                onClick={() => onGenerateFromClearance(clearance.id)}
                                                className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}