// resources/js/components/admin/receipts/ReceiptsContent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ReceiptsTableView from '@/components/admin/receipts/ReceiptsTableView';
import ReceiptsGridView from '@/components/admin/receipts/ReceiptsGridView';
import ReceiptsBulkActions from '@/components/admin/receipts/ReceiptsBulkActions';
import { Receipt } from '@/components/admin/receipts/receipt';
import { FileSpreadsheet, Printer, BarChart3, Copy, Ban, FileText, Receipt as ReceiptIcon } from 'lucide-react';

interface ReceiptsContentProps {
    receipts: Receipt[];
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
    onDelete: (receipt: Receipt) => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    onView: (id: number) => void;
    onPrint: (receipt: Receipt) => void;
    onVoid: (id: number, receiptNumber: string) => void;
    onGenerateFromClearance: (clearanceId: number) => void;
    setShowBulkVoidDialog?: (show: boolean) => void;
    setShowBulkExportDialog?: (show: boolean) => void;
    pendingClearances?: any[];
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
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
    selectionStats = {}
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
        // Implement sort icon logic
        return null;
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
                            onCreateNew={() => window.location.href = '/admin/receipts/create'}
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