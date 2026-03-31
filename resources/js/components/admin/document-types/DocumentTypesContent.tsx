// components/admin/document-types/DocumentTypesContent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Grid3X3, Rows, AlertCircle } from 'lucide-react';

// Import reusable components
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import DocumentTypesTableView from './DocumentTypesTableView';
import DocumentTypesGridView from './DocumentTypesGridView';
import DocumentTypesBulkActions from './DocumentTypesBulkActions';

// Import types
import { 
    DocumentType, 
    BulkOperation, 
    BulkEditField, 
    SelectionMode, 
    FilterState, 
    SelectionStats 
} from '@/types/admin/document-types/document-types';

interface DocumentTypesContentProps {
    documentTypes: DocumentType[];
    categories: Array<{ id: number; name: string; slug: string }>;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedDocumentTypes: number[];
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
    onDelete: (documentType: DocumentType) => void;
    onToggleStatus?: (documentType: DocumentType) => void;
    onDuplicate?: (documentType: DocumentType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkRequiredDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    getFileSizeMB: (bytes: number) => number;
    formatFileFormats: (formats?: string[]) => string;
    formatDate: (dateString: string) => string;
}

export default function DocumentTypesContent({
    documentTypes,
    categories,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedDocumentTypes,
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
    onCopyToClipboard,
    onCopySelectedData,
    onSort,
    onBulkOperation,
    setShowBulkDeleteDialog,
    setShowBulkRequiredDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats = {
        total: 0,
        active: 0,
        inactive: 0,
        required: 0,
        optional: 0,
        hasFormats: 0,
        totalFileSizeMB: 0,
        maxFileSizeMB: 0,
        categories: {}
    },
    getFileSizeMB,
    formatFileFormats,
    formatDate
}: DocumentTypesContentProps) {
    
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedDocumentTypes.length > 0 && (
                <DocumentTypesBulkActions
                    selectedDocumentTypes={selectedDocumentTypes}
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
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkRequiredDialog={setShowBulkRequiredDialog}
                    categories={categories}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && documentTypes.length > 0 && selectedDocumentTypes.length < documentTypes.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedDocumentTypes.length}
                    totalCount={documentTypes.length}
                    position="bottom-right"
                />
            )}

            {/* Document Types List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Document Types
                                {selectedDocumentTypes.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedDocumentTypes.length} selected
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
                        {viewMode === 'grid' && isBulkMode && documentTypes.length > 0 && (
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Esc to exit • Del to delete</p>
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
                    {documentTypes.length === 0 ? (
                        <EmptyState
                            icon={<AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No document types found"
                            description={hasActiveFilters 
                                ? "No document types match your current filters. Try adjusting your search or filters."
                                : "No document types have been added yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : {
                                label: "Add Document Type",
                                href: "/document-types/create"
                            }}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <DocumentTypesTableView
                                    documentTypes={documentTypes}
                                    categories={categories}
                                    isBulkMode={isBulkMode}
                                    selectedDocumentTypes={selectedDocumentTypes}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    getFileSizeMB={getFileSizeMB}
                                    formatFileFormats={formatFileFormats}
                                    formatDate={formatDate}
                                />
                            ) : (
                                // Grid View
                                <DocumentTypesGridView
                                    documentTypes={documentTypes}
                                    categories={categories}
                                    isBulkMode={isBulkMode}
                                    selectedDocumentTypes={selectedDocumentTypes}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    onCopyToClipboard={onCopyToClipboard}
                                    getFileSizeMB={getFileSizeMB}
                                    formatFileFormats={formatFileFormats}
                                    formatDate={formatDate}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedDocumentTypes.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedDocumentTypes.length}
                                    totalCount={documentTypes.length}
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