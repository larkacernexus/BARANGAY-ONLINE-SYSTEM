// components/admin/clearances/ClearancesContent.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
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
    ChevronRight
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
} from '@/types/admin/clearances/clearance-types';

// Separate interfaces for better organization
interface ClearancesContentProps {
    // Data props
    clearances: ClearanceRequest[];
    totalItems: number;
    stats?: any;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
    filtersState: any;
    
    // Selection props
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedClearances: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
    
    // UI props
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    isLoading: boolean;
    isPerformingBulkAction: boolean;
    
    // Pagination props
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    
    // Action handlers
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
}

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
    onClearSelection
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
    onClearSelection: () => void;
}) => {
    const handleBulkModeToggle = useCallback(() => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    }, [isBulkMode, setIsBulkMode, onClearSelection]);

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
                    Page {currentPage} of {totalPages}
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
    setShowBulkDeleteDialog
}: ClearancesContentProps) => {
    
    // Memoize bulk actions configuration
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
    
    // Handle bulk mode toggle
    const handleBulkModeToggle = useCallback(() => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    }, [isBulkMode, setIsBulkMode, onClearSelection]);
    
    // Check if any clearances exist
    const hasClearances = clearances.length > 0;
    
    // Get appropriate empty state message
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
    
    // Memoize view rendering to prevent unnecessary re-renders
    const renderContentView = useCallback(() => {
        if (!hasClearances) {
            return (
                <EmptyState
                    icon={emptyStateConfig.icon}
                    title={emptyStateConfig.title}
                    description={emptyStateConfig.description}
                    action={emptyStateConfig.action}
                />
            );
        }
        
        return (
            <>
                {/* Table View */}
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
                
                {/* Grid View */}
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
                
                {/* Grid Selection Summary */}
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
                            className="justify-between"
                        />
                    </div>
                )}
            </>
        );
    }, [
        hasClearances,
        viewMode,
        clearances,
        isBulkMode,
        selectedClearances,
        filtersState,
        onItemSelect,
        onSort,
        hasActiveFilters,
        onClearFilters,
        onDelete,
        onViewPhoto,
        onSelectAllOnPage,
        isSelectAll,
        handleRecordPayment,
        isLoading,
        clearanceTypes,
        statusOptions,
        totalPages,
        currentPage,
        totalItems,
        itemsPerPage,
        onPageChange,
        onClearSelection,
        emptyStateConfig
    ]);
    
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
                onClearSelection={onClearSelection}
            />
            
            <CardContent className="p-0 dark:bg-gray-900">
                {/* Enhanced Bulk Actions Bar */}
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
                
                {/* Floating Select All for Grid View */}
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
                
                {/* Main Content */}
                {renderContentView()}
            </CardContent>
        </Card>
    );
});

ClearancesContent.displayName = 'ClearancesContent';

export default ClearancesContent;