import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
    User, 
    FileSpreadsheet, 
    Printer, 
    Copy, 
    PlayCircle, 
    CheckCircle, 
    FileText, 
    Trash2, 
    Download,
    DollarSign,
    Clock,
    CheckSquare,
    Square,
    PackageX,
    FileCheck,
    AlertCircle
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ClearancesTableView from './ClearancesTableView';
import ClearancesGridView from './ClearancesGridView';
import ClearancesBulkActions from './ClearancesBulkActions';
import { ClearanceRequest, ClearanceType, StatusOption } from '@/types/clearances';

interface ClearancesContentProps {
    clearances: ClearanceRequest[];
    totalItems: number;
    stats?: any;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedClearances: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
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
    onBulkOperation: (operation: string, customData?: any) => Promise<void>;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    filtersState: any;
    handleRecordPayment: (clearance: ClearanceRequest) => void;
    isLoading: boolean;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
}

export default function ClearancesContent({
    clearances,
    totalItems,
    stats,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedClearances,
    viewMode,
    setViewMode,
    isMobile,
    hasActiveFilters,
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
    setShowBulkDeleteDialog,
    filtersState,
    handleRecordPayment,
    isLoading,
    clearanceTypes,
    statusOptions,
    isPerformingBulkAction,
    selectionMode,
    selectionStats
}: ClearancesContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected clearances'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected clearances'
            }
        ],
        secondary: [
            {
                label: 'Mark as Processing',
                icon: <PlayCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('mark_processing'),
                tooltip: 'Mark selected as processing'
            },
            {
                label: 'Approve',
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('approve'),
                tooltip: 'Approve selected clearances'
            },
            {
                label: 'Issue',
                icon: <FileText className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('issue'),
                tooltip: 'Issue selected clearances'
            },
            {
                label: 'Export CSV',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export_csv'),
                tooltip: 'Export as CSV'
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard'
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected clearances',
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

    return (
        <>
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
            {viewMode === 'grid' && clearances.length > 0 && selectedClearances.length < clearances.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedClearances.length}
                    totalCount={clearances.length}
                    position="bottom-right"
                />
            )}

            {/* Clearances List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Clearance Requests
                                {selectedClearances.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedClearances.length} selected
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
                        {viewMode === 'grid' && isBulkMode && clearances.length > 0 && (
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
                    {clearances.length === 0 ? (
                        <EmptyState
                            icon={<FileCheck className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No clearance requests found"
                            description={hasActiveFilters 
                                ? "No clearance requests match your current filters. Try adjusting your search or filters."
                                : "No clearance requests have been created yet."}
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
                            ) : (
                                // Grid View
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

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedClearances.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedClearances.length}
                                    totalCount={clearances.length}
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