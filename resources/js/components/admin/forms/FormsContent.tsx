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
    FileText, 
    Download, 
    FileSpreadsheet, 
    Copy, 
    Edit, 
    Trash2, 
    Users,
    FileDown,
    Archive,
    ArchiveRestore,
    Folder,
    Building,
    ArrowUpDown
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import FormsTableView from './FormsTableView';
import FormsGridView from './FormsGridView';
import FormsBulkActions from './FormsBulkActions';
import { Form, Filters, BulkOperation } from '@/types/admin/forms/forms.types';

interface FormsContentProps {
    forms: Form[];
    stats?: any;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedForms: number[];
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
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    onSort: (column: string) => void;
    onCopySelectedData: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    filtersState: Filters;
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
    categories?: string[];
    agencies?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export default function FormsContent({
    forms,
    stats,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedForms,
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
    onToggleStatus,
    onDownload,
    onSort,
    onCopySelectedData,
    onBulkOperation,
    setShowBulkDeleteDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    categories = [],
    agencies = [],
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'created_at-desc'
}: FormsContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected forms'
            },
            {
                label: 'Download',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('download'),
                tooltip: 'Download selected forms'
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate'),
                tooltip: 'Activate selected forms'
            },
            {
                label: 'Deactivate',
                icon: <Archive className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate'),
                tooltip: 'Deactivate selected forms'
            },
            {
                label: 'Change Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_status'),
                tooltip: 'Change status for selected forms'
            },
            {
                label: 'Change Category',
                icon: <Folder className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('change_category'),
                tooltip: 'Change category for selected forms'
            },
            {
                label: 'Export CSV',
                icon: <FileDown className="h-3.5 w-3.5 mr-1.5" />,
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
                tooltip: 'Delete selected forms',
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

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedForms.length > 0 && (
                <FormsBulkActions
                    selectedForms={selectedForms}
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
            {viewMode === 'grid' && forms.length > 0 && selectedForms.length < forms.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedForms.length}
                    totalCount={forms.length}
                    position="bottom-right"
                />
            )}

            {/* Forms List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Forms List
                                {selectedForms.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedForms.length} selected
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
                                        <SelectItem value="title-asc">Title (A to Z)</SelectItem>
                                        <SelectItem value="title-desc">Title (Z to A)</SelectItem>
                                        <SelectItem value="category-asc">Category (A to Z)</SelectItem>
                                        <SelectItem value="category-desc">Category (Z to A)</SelectItem>
                                        <SelectItem value="issuing_agency-asc">Agency (A to Z)</SelectItem>
                                        <SelectItem value="issuing_agency-desc">Agency (Z to A)</SelectItem>
                                        <SelectItem value="download_count-asc">Downloads (Low to High)</SelectItem>
                                        <SelectItem value="download_count-desc">Downloads (High to Low)</SelectItem>
                                        <SelectItem value="file_size-asc">File Size (Small to Large)</SelectItem>
                                        <SelectItem value="file_size-desc">File Size (Large to Small)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="is_featured-asc">Featured (No to Yes)</SelectItem>
                                        <SelectItem value="is_featured-desc">Featured (Yes to No)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && forms.length > 0 && (
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ctrl+Shift+B • Ctrl+A to select</p>
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
                    {forms.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No forms found"
                            description={hasActiveFilters 
                                ? "No forms match your current filters. Try adjusting your search or filters."
                                : "No forms have been uploaded yet."}
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
                                <FormsTableView
                                    forms={forms}
                                    isBulkMode={isBulkMode}
                                    selectedForms={selectedForms}
                                    isMobile={isMobile}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDownload={onDownload}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    formatFileSize={formatFileSize}
                                />
                            ) : (
                                // Grid View
                                <FormsGridView
                                    forms={forms}
                                    isBulkMode={isBulkMode}
                                    selectedForms={selectedForms}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDownload={onDownload}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    formatFileSize={formatFileSize}
                                    categories={categories}
                                    agencies={agencies}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedForms.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedForms.length}
                                    totalCount={forms.length}
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