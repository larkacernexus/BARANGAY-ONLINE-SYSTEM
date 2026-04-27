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
    Printer, 
    Copy, 
    PlayCircle, 
    CheckCircle, 
    FileText, 
    Trash2, 
    Download,
    FileCheck,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Rows3
} from 'lucide-react';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ClearancesTableView from './ClearancesTableView';
import ClearancesGridView from './ClearancesGridView';
import ClearancesBulkActions from './ClearancesBulkActions';
import { 
    ClearanceRequest, 
    ClearanceType, 
    StatusOption, 
    BulkOperation 
} from '@/types/admin/clearances/clearance';

interface ClearancesContentProps {
    clearances: ClearanceRequest[];
    totalItems: number;
    stats?: any;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
    filtersState: any;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedClearances: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    isLoading: boolean;
    isPerformingBulkAction: boolean;
    currentPage: number;
    totalPages: number;
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
    onDelete: (clearance: ClearanceRequest) => void;
    onViewPhoto: (clearance: ClearanceRequest) => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation, customData?: any) => Promise<void>;
    onCopySelectedData: () => void;
    handleRecordPayment: (clearance: ClearanceRequest) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

// ✅ Dynamic per-page options generator - 15 IS THE DEFAULT, NO 20
const getDynamicPerPageOptions = (totalItems: number) => {
    const options: { value: string; label: string }[] = [];
    
    // Always show 15
    options.push({ value: '15', label: '15 per page' });
    
    // Show 30 if total > 15
    if (totalItems > 15) {
        options.push({ value: '30', label: '30 per page' });
    }
    
    // Show 50 if total > 30
    if (totalItems > 30) {
        options.push({ value: '50', label: '50 per page' });
    }
    
    // Show 100 if total > 50
    if (totalItems > 50) {
        options.push({ value: '100', label: '100 per page' });
    }
    
    // Show 500 if total > 100
    if (totalItems > 100) {
        options.push({ value: '500', label: '500 per page' });
    }
    
    // Show All only if total <= 550
    if (totalItems > 0 && totalItems <= 550) {
        options.push({ value: 'all', label: `Show All (${totalItems})` });
    }
    
    return options;
};

// Separate component for the header to reduce re-renders
const ClearancesHeader = memo(({ 
    viewMode, 
    setViewMode, 
    isMobile, 
    isBulkMode, 
    setIsBulkMode,
    selectedCount,
    isSelectAll,
    onSelectAllOnPage,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onClearSelection,
    sortBy,
    sortOrder,
    onSortChange,
    getCurrentSortValue,
    perPage,
    onPerPageChange,
    isLoading
}: {
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    selectedCount: number;
    isSelectAll: boolean;
    onSelectAllOnPage: () => void;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onClearSelection: () => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
    perPage?: string;
    onPerPageChange?: (value: string) => void;
    isLoading?: boolean;
}) => {
    const handleBulkModeToggle = useCallback(() => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    }, [isBulkMode, setIsBulkMode, onClearSelection]);

    const perPageOptions = getDynamicPerPageOptions(totalItems);

    const handlePerPageChange = (value: string) => {
        if (isLoading) return;
        onPerPageChange?.(value);
    };

    const startItem = totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                        Clearance Requests
                        {selectedCount > 0 && (
                            <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                {selectedCount} selected
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
                {/* Per Page Selector - always show when there are items */}
                {!isMobile && onPerPageChange && totalItems > 0 && (
                    <div className="flex items-center gap-2">
                        <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Select
                            value={perPage || '15'}
                            onValueChange={handlePerPageChange}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="15 per page" />
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
                {!isMobile && onSortChange && getCurrentSortValue && (
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
                                <SelectItem value="reference_number-asc">Reference # (A to Z)</SelectItem>
                                <SelectItem value="reference_number-desc">Reference # (Z to A)</SelectItem>
                                <SelectItem value="resident_name-asc">Resident Name (A to Z)</SelectItem>
                                <SelectItem value="resident_name-desc">Resident Name (Z to A)</SelectItem>
                                <SelectItem value="status-asc">Status (A to Z)</SelectItem>
                                <SelectItem value="status-desc">Status (Z to A)</SelectItem>
                                <SelectItem value="payment_status-asc">Payment Status (A to Z)</SelectItem>
                                <SelectItem value="payment_status-desc">Payment Status (Z to A)</SelectItem>
                                <SelectItem value="fee_amount-asc">Fee Amount (Low to High)</SelectItem>
                                <SelectItem value="fee_amount-desc">Fee Amount (High to Low)</SelectItem>
                                <SelectItem value="amount_paid-asc">Amount Paid (Low to High)</SelectItem>
                                <SelectItem value="amount_paid-desc">Amount Paid (High to Low)</SelectItem>
                                <SelectItem value="urgency-asc">Urgency (Low to High)</SelectItem>
                                <SelectItem value="urgency-desc">Urgency (High to Low)</SelectItem>
                                <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                <SelectItem value="issue_date-asc">Issue Date (Oldest first)</SelectItem>
                                <SelectItem value="issue_date-desc">Issue Date (Newest first)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Grid view select all checkbox */}
                {viewMode === 'grid' && isBulkMode && (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all-grid"
                            checked={isSelectAll}
                            onCheckedChange={onSelectAllOnPage}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600"
                        />
                        <Label 
                            htmlFor="select-all-grid" 
                            className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                        >
                            {isSelectAll ? 'Deselect Page' : 'Select Page'}
                        </Label>
                    </div>
                )}
                
                {/* Bulk Mode Toggle */}
                {!isMobile && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="bulk-mode"
                                    checked={isBulkMode}
                                    onCheckedChange={handleBulkModeToggle}
                                    className="data-[state=checked]:bg-blue-600 h-5 w-9"
                                />
                                <Label 
                                    htmlFor="bulk-mode" 
                                    className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                                >
                                    Bulk Mode
                                </Label>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="dark:bg-gray-900 dark:text-gray-200">
                            <p>Toggle bulk selection mode (Ctrl+Shift+B)</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                
                {/* Page Info */}
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    {totalItems > 0 && (
                        <>Showing {startItem} - {endItem} of {totalItems}</>
                    )}
                </div>
            </div>
        </CardHeader>
    );
});

ClearancesHeader.displayName = 'ClearancesHeader';

// Main component
const ClearancesContent = memo(({
    clearances,
    totalItems,
    stats,
    clearanceTypes,
    statusOptions,
    filtersState,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedClearances,
    selectionMode,
    selectionStats,
    viewMode,
    setViewMode,
    isMobile,
    hasActiveFilters,
    isLoading,
    isPerformingBulkAction,
    currentPage,
    totalPages,
    itemsPerPage,
    perPage = '15',  // ✅ DEFAULT IS 15
    onPerPageChange = () => {},
    onPageChange,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onItemSelect,
    onClearFilters,
    onClearSelection,
    onDelete,
    onViewPhoto,
    onSort,
    onBulkOperation,
    onCopySelectedData,
    handleRecordPayment,
    setShowBulkDeleteDialog,
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'created_at-desc'
}: ClearancesContentProps) => {
    
    const perPageOptions = getDynamicPerPageOptions(totalItems);

    const handlePerPageChange = (value: string) => {
        if (isLoading) return;
        onPerPageChange(value);
    };
    
    const bulkActions = useMemo(() => ({
        primary: [
            {
                label: 'Export CSV',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkOperation),
                tooltip: 'Export selected clearances as CSV',
                shortcut: 'Ctrl+E'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print' as BulkOperation),
                tooltip: 'Print selected clearances',
                shortcut: 'Ctrl+P'
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard',
                shortcut: 'Ctrl+C'
            }
        ],
        status: [
            {
                label: 'Mark as Processing',
                icon: <PlayCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('process' as BulkOperation),
                tooltip: 'Mark selected as processing',
                variant: 'default' as const
            },
            {
                label: 'Approve',
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('approve' as BulkOperation),
                tooltip: 'Approve selected clearances',
                variant: 'default' as const
            },
            {
                label: 'Issue',
                icon: <FileText className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('issue' as BulkOperation),
                tooltip: 'Issue selected clearances',
                variant: 'default' as const
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected clearances (Delete key)',
                variant: 'destructive' as const
            }
        ]
    }), [onBulkOperation, onCopySelectedData, setShowBulkDeleteDialog]);
    
    const hasClearances = clearances.length > 0;
    
    const emptyStateConfig = useMemo(() => {
        if (hasActiveFilters) {
            return {
                title: "No matching clearance requests",
                description: "Try adjusting your search filters or clearing them to see more results.",
                action: { label: "Clear Filters", onClick: onClearFilters },
                icon: <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            };
        }
        return {
            title: "No clearance requests yet",
            description: "Get started by creating your first clearance request.",
            action: undefined,
            icon: <FileCheck className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        };
    }, [hasActiveFilters, onClearFilters]);
    
    return (
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            <ClearancesHeader
                viewMode={viewMode}
                setViewMode={setViewMode}
                isMobile={isMobile}
                isBulkMode={isBulkMode}
                setIsBulkMode={setIsBulkMode}
                selectedCount={selectedClearances.length}
                isSelectAll={isSelectAll}
                onSelectAllOnPage={onSelectAllOnPage}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onClearSelection={onClearSelection}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                getCurrentSortValue={getCurrentSortValue}
                perPage={perPage}
                onPerPageChange={handlePerPageChange}
                isLoading={isLoading}
            />
            
            <CardContent className="p-0 dark:bg-gray-900">
                {isBulkMode && selectedClearances.length > 0 && (
                    <ClearancesBulkActions
                        selectedClearances={selectedClearances}
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
                
                {viewMode === 'grid' && 
                 hasClearances && 
                 selectedClearances.length < clearances.length && 
                 isBulkMode && (
                    <SelectAllFloat
                        isSelectAll={isSelectAll}
                        onSelectAll={onSelectAllOnPage}
                        selectedCount={selectedClearances.length}
                        totalCount={clearances.length}
                        position="bottom-right"
                    />
                )}
                
                {!hasClearances ? (
                    <EmptyState
                        icon={emptyStateConfig.icon}
                        title={emptyStateConfig.title}
                        description={emptyStateConfig.description}
                        action={emptyStateConfig.action}
                    />
                ) : (
                    <>
                        {viewMode === 'table' && (
                            <ClearancesTableView
                                clearances={clearances}
                                isBulkMode={isBulkMode}
                                selectedClearances={selectedClearances}
                                filtersState={filtersState}
                                onItemSelect={onItemSelect}
                                onSort={onSort}
                                hasActiveFilters={hasActiveFilters}
                                onClearFilters={onClearFilters}
                                onDelete={onDelete}
                                onViewPhoto={onViewPhoto}
                                onSelectAllOnPage={onSelectAllOnPage}
                                isSelectAll={isSelectAll}
                                handleRecordPayment={handleRecordPayment}
                                isLoading={isLoading}
                                clearanceTypes={clearanceTypes}
                                statusOptions={statusOptions}
                            />
                        )}
                        
                        {viewMode === 'grid' && (
                            <ClearancesGridView
                                clearances={clearances}
                                isBulkMode={isBulkMode}
                                selectedClearances={selectedClearances}
                                onItemSelect={onItemSelect}
                                hasActiveFilters={hasActiveFilters}
                                onClearFilters={onClearFilters}
                                onDelete={onDelete}
                                onViewPhoto={onViewPhoto}
                                handleRecordPayment={handleRecordPayment}
                            />
                        )}
                        
                        {viewMode === 'grid' && isBulkMode && selectedClearances.length > 0 && (
                            <GridSelectionSummary
                                selectedCount={selectedClearances.length}
                                totalCount={clearances.length}
                                isSelectAll={isSelectAll}
                                onSelectAll={onSelectAllOnPage}
                                onClearSelection={onClearSelection}
                                className="mt-4 mx-4"
                            />
                        )}
                        
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                {isMobile && totalItems > 0 && (
                                    <div className="flex items-center gap-2 w-full">
                                        <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Select
                                            value={perPage}
                                            onValueChange={handlePerPageChange}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="15 per page" />
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
    );
});

ClearancesContent.displayName = 'ClearancesContent';

export default ClearancesContent;