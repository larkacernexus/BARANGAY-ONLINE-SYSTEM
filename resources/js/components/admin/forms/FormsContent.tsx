import { EmptyState } from '@/components/adminui/empty-state';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import { Pagination } from '@/components/adminui/pagination';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { BulkOperation, Filters, Form } from '@/types/admin/forms/forms.types';
import { ArrowUpDown, FileText, Rows3 } from 'lucide-react';
import FormsBulkActions from './FormsBulkActions';
import FormsGridView from './FormsGridView';
import FormsTableView from './FormsTableView';

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
    perPage?: string;
    onPerPageChange?: (value: string) => void;
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

// ✅ Dynamic per-page options - 15 is default, NO 20
const getDynamicPerPageOptions = (totalItems: number) => {
    const options: { value: string; label: string }[] = [];
    options.push({ value: '15', label: '15 per page' });
    if (totalItems > 15) options.push({ value: '30', label: '30 per page' });
    if (totalItems > 30) options.push({ value: '50', label: '50 per page' });
    if (totalItems > 50) options.push({ value: '100', label: '100 per page' });
    if (totalItems > 100) options.push({ value: '500', label: '500 per page' });
    if (totalItems > 0 && totalItems <= 550)
        options.push({ value: 'all', label: `Show All (${totalItems})` });
    return options;
};

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
    perPage = '15',
    onPerPageChange = () => {},
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
    getCurrentSortValue = () => 'created_at-desc',
}: FormsContentProps) {
    const perPageOptions = getDynamicPerPageOptions(totalItems);
    const handlePerPageChange = (value: string) => onPerPageChange(value);
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) onClearSelection();
    };
    const formatFileSize = (bytes: number): string => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
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
                    bulkActions={{
                        primary: [],
                        secondary: [],
                        destructive: [],
                    }}
                />
            )}
            {viewMode === 'grid' &&
                forms.length > 0 &&
                selectedForms.length < forms.length &&
                isBulkMode && (
                    <SelectAllFloat
                        isSelectAll={isSelectAll}
                        onSelectAll={onSelectAllOnPage}
                        selectedCount={selectedForms.length}
                        totalCount={forms.length}
                        position="bottom-right"
                    />
                )}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50 p-4 pb-3 sm:p-6 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base font-semibold sm:text-lg md:text-xl dark:text-gray-100">
                                Forms List
                                {selectedForms.length > 0 && isBulkMode && (
                                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-normal text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
                        {/* ✅ Per Page Selector */}
                        {!isMobile && totalItems > 0 && (
                            <div className="flex items-center gap-2">
                                <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={perPage}
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger className="h-8 w-[140px] text-xs">
                                        <SelectValue placeholder="15 per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={getCurrentSortValue()}
                                    onValueChange={onSortChange}
                                >
                                    <SelectTrigger className="h-8 w-[180px] text-xs">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="title-asc">
                                            Title (A to Z)
                                        </SelectItem>
                                        <SelectItem value="title-desc">
                                            Title (Z to A)
                                        </SelectItem>
                                        <SelectItem value="category-asc">
                                            Category (A to Z)
                                        </SelectItem>
                                        <SelectItem value="category-desc">
                                            Category (Z to A)
                                        </SelectItem>
                                        <SelectItem value="issuing_agency-asc">
                                            Agency (A to Z)
                                        </SelectItem>
                                        <SelectItem value="issuing_agency-desc">
                                            Agency (Z to A)
                                        </SelectItem>
                                        <SelectItem value="download_count-asc">
                                            Downloads (Low to High)
                                        </SelectItem>
                                        <SelectItem value="download_count-desc">
                                            Downloads (High to Low)
                                        </SelectItem>
                                        <SelectItem value="file_size-asc">
                                            File Size (Small to Large)
                                        </SelectItem>
                                        <SelectItem value="file_size-desc">
                                            File Size (Large to Small)
                                        </SelectItem>
                                        <SelectItem value="status-asc">
                                            Status (Inactive to Active)
                                        </SelectItem>
                                        <SelectItem value="status-desc">
                                            Status (Active to Inactive)
                                        </SelectItem>
                                        <SelectItem value="is_featured-asc">
                                            Featured (No to Yes)
                                        </SelectItem>
                                        <SelectItem value="is_featured-desc">
                                            Featured (Yes to No)
                                        </SelectItem>
                                        <SelectItem value="created_at-asc">
                                            Created (Oldest first)
                                        </SelectItem>
                                        <SelectItem value="created_at-desc">
                                            Created (Newest first)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {viewMode === 'grid' &&
                            isBulkMode &&
                            forms.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all-grid"
                                        checked={isSelectAll}
                                        onCheckedChange={onSelectAllOnPage}
                                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 dark:border-gray-600"
                                    />
                                    <Label
                                        htmlFor="select-all-grid"
                                        className="cursor-pointer text-xs font-medium whitespace-nowrap sm:text-sm dark:text-gray-300"
                                    >
                                        {isSelectAll
                                            ? 'Deselect Page'
                                            : 'Select Page'}
                                    </Label>
                                </div>
                            )}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="bulk-mode"
                                                checked={isBulkMode}
                                                onCheckedChange={
                                                    handleBulkModeToggle
                                                }
                                                className="h-5 w-9 data-[state=checked]:bg-blue-600"
                                            />
                                            <Label
                                                htmlFor="bulk-mode"
                                                className="cursor-pointer text-xs font-medium whitespace-nowrap sm:text-sm dark:text-gray-300"
                                            >
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-200">
                                        <p>Toggle bulk selection mode</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        <div className="hidden text-xs text-gray-500 sm:block sm:text-sm dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {forms.length === 0 ? (
                        <EmptyState
                            icon={
                                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                            }
                            title="No forms found"
                            description={
                                hasActiveFilters
                                    ? 'No forms match your current filters.'
                                    : 'No forms have been uploaded yet.'
                            }
                            action={
                                hasActiveFilters
                                    ? {
                                          label: 'Clear Filters',
                                          onClick: onClearFilters,
                                      }
                                    : undefined
                            }
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
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
                            {viewMode === 'grid' &&
                                isBulkMode &&
                                selectedForms.length > 0 && (
                                    <GridSelectionSummary
                                        selectedCount={selectedForms.length}
                                        totalCount={forms.length}
                                        isSelectAll={isSelectAll}
                                        onSelectAll={onSelectAllOnPage}
                                        onClearSelection={onClearSelection}
                                        className="mx-4 mt-4"
                                    />
                                )}
                            {/* ✅ Footer with mobile per-page selector */}
                            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                    {isMobile && totalItems > 0 && (
                                        <div className="flex w-full items-center gap-2">
                                            <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Select
                                                value={perPage}
                                                onValueChange={
                                                    handlePerPageChange
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-full text-xs">
                                                    <SelectValue placeholder="15 per page" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perPageOptions.map((o) => (
                                                        <SelectItem
                                                            key={o.value}
                                                            value={o.value}
                                                        >
                                                            {o.label}
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
        </>
    );
}
