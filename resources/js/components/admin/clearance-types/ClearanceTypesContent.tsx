// components/admin/clearance-types/ClearanceTypesContent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Grid3X3, Rows, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

// Import reusable components
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import ClearanceTypesTableView from './ClearanceTypesTableView';
import ClearanceTypesGridView from './ClearanceTypesGridView';
import ClearanceTypesBulkActions from './ClearanceTypesBulkActions';

// Import types
import { ClearanceType, BulkOperation, BulkEditField, SelectionMode } from '@/types/clearance-types';

interface FilterState {
    search: string;
    status: string;
    requires_payment: string;
    sort: string;
    direction: string;
}

interface SelectionStats {
    active: number;
    inactive: number;
    paid: number;
    free: number;
    needsApproval: number;
    onlineOnly: number;
    totalValue: number;
    avgProcessingDays: number;
}

interface ClearanceTypesContentProps {
    clearanceTypes: {
        data: ClearanceType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedTypes: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile?: boolean;
    hasActiveFilters: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (pageUrl: string) => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onItemSelect: (id: number) => void;
    onClearFilters: () => void;
    onClearSelection: () => void;
    onDelete: (type: ClearanceType) => void;
    onToggleStatus?: (type: ClearanceType) => void;
    onDuplicate?: (type: ClearanceType) => void;
    onViewPhoto: (type: ClearanceType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onSmartBulkToggle: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkEditDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    truncateText: (text: string, maxLength?: number) => string;
    getStatusBadgeVariant: (isActive: boolean) => "default" | "secondary" | "destructive" | "outline";
    getPurposeOptionsCount: (type: ClearanceType) => number;
    formatDate: (dateString: string) => string;
    getTruncationLength: (type: 'name' | 'description' | 'code') => number;
}

export default function ClearanceTypesContent({
    clearanceTypes,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedTypes,
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
    onSmartBulkToggle,
    setShowBulkDeleteDialog,
    setShowBulkEditDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    truncateText,
    getStatusBadgeVariant,
    getPurposeOptionsCount,
    formatDate,
    getTruncationLength
}: ClearanceTypesContentProps) {
    
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedTypes.length > 0 && (
                <ClearanceTypesBulkActions
                    selectedTypes={selectedTypes}
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
                    onSmartBulkToggle={onSmartBulkToggle}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkEditDialog={setShowBulkEditDialog}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && clearanceTypes.data.length > 0 && selectedTypes.length < clearanceTypes.data.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedTypes.length}
                    totalCount={clearanceTypes.data.length}
                    position="bottom-right"
                />
            )}

            {/* Clearance Types List/Grid View */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
                                Clearance Types
                                {selectedTypes.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedTypes.length} selected
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
                        {viewMode === 'grid' && isBulkMode && clearanceTypes.data.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all-grid"
                                    checked={isSelectAll}
                                    onCheckedChange={onSelectAllOnPage}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label htmlFor="select-all-grid" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap">
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
                                                className="data-[state=checked]:bg-blue-600 h-5 w-9"
                                            />
                                            <Label htmlFor="bulk-mode" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap">
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Toggle bulk selection mode</p>
                                        <p className="text-xs text-gray-500">Ctrl+Shift+B • Ctrl+A to select</p>
                                        <p className="text-xs text-gray-500">Esc to exit • Del to delete</p>
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
                <CardContent className="p-0">
                    {/* Empty State */}
                    {clearanceTypes.data.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="h-12 w-12 text-gray-400" />}
                            title="No clearance types found"
                            description={hasActiveFilters 
                                ? "No clearance types match your current filters. Try adjusting your search or filters."
                                : "No clearance types have been added yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : {
                                label: "Create Clearance Type",
                                href: "/admin/clearance-types/create"
                            }}
                            className="py-12 sm:py-16"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <ClearanceTypesTableView
                                    clearanceTypes={clearanceTypes.data}
                                    isBulkMode={isBulkMode}
                                    selectedTypes={selectedTypes}
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
                                    truncateText={truncateText}
                                    getStatusBadgeVariant={getStatusBadgeVariant}
                                    getPurposeOptionsCount={getPurposeOptionsCount}
                                    getTruncationLength={getTruncationLength}
                                />
                            ) : (
                                // Grid View
                                <ClearanceTypesGridView
                                    clearanceTypes={clearanceTypes.data}
                                    isBulkMode={isBulkMode}
                                    selectedTypes={selectedTypes}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    onViewPhoto={onViewPhoto}
                                    onCopyToClipboard={onCopyToClipboard}
                                    truncateText={truncateText}
                                    getStatusBadgeVariant={getStatusBadgeVariant}
                                    getPurposeOptionsCount={getPurposeOptionsCount}
                                    getTruncationLength={getTruncationLength}
                                />
                            )}

                            {/* Grid Selection Summary */}
                            {viewMode === 'grid' && isBulkMode && selectedTypes.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedTypes.length}
                                    totalCount={clearanceTypes.data.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4"
                                />
                            )}

                            {/* Pagination */}
                            {clearanceTypes.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        Showing {clearanceTypes.from} to {clearanceTypes.to} of {clearanceTypes.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={(page) => {
                                                const link = clearanceTypes.links.find(l => l.label === page.toString());
                                                if (link) onPageChange(link.url || '');
                                            }}
                                            showCount={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}