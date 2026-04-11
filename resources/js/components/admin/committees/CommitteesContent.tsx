import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CommitteesTable } from './CommitteesTable';
import { CommitteesGridView } from './CommitteesGridView';
import { CommitteesBulkActions } from './CommitteesBulkActions';
import { EmptyState } from '@/components/adminui/empty-state';
import { Pagination } from '@/components/adminui/pagination';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import { Grid3X3, List, Users, ArrowUpDown } from 'lucide-react';
import { Committee } from '@/types/admin/committees/committees';

interface CommitteesContentProps {
    committees: Committee[];
    selectedIds: number[];
    isBulkMode: boolean;
    isSelectAll: boolean;
    viewMode: 'table' | 'grid';
    isMobile: boolean;
    hasActiveFilters: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onItemSelect: (id: number) => void;
    onSelectAllOnPage: () => void;
    onViewModeChange: (mode: 'table' | 'grid') => void;
    onPageChange: (page: number) => void;
    onClearFilters: () => void;
    onDelete: (committee: Committee) => void;
    onToggleStatus: (committee: Committee) => void;
    onToggleBulkMode: () => void;
    onClearSelection?: () => void;
    onCreateCommittee?: () => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export function CommitteesContent({
    committees,
    selectedIds,
    isBulkMode,
    isSelectAll,
    viewMode,
    isMobile,
    hasActiveFilters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onItemSelect,
    onSelectAllOnPage,
    onViewModeChange,
    onPageChange,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onToggleBulkMode,
    onClearSelection = () => {},
    onCreateCommittee = () => {},
    sortBy = 'order',
    sortOrder = 'asc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'order-asc'
}: CommitteesContentProps) {
    
    const handleBulkModeToggle = () => {
        onToggleBulkMode();
        if (isBulkMode) {
            onClearSelection();
        }
    };

    return (
        <>
            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && committees.length > 0 && selectedIds.length < committees.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedIds.length}
                    totalCount={committees.length}
                    position="bottom-right"
                />
            )}

            {isBulkMode && selectedIds.length > 0 && (
                <CommitteesBulkActions
                    selectedIds={selectedIds}
                    selectedCount={selectedIds.length}
                    isPerformingBulkAction={false}
                    onClearSelection={() => {
                        selectedIds.forEach(id => onItemSelect(id));
                    }}
                    onSelectAllOnPage={onSelectAllOnPage}
                />
            )}

            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-lg sm:text-xl dark:text-gray-100">
                            Committees List
                            {selectedIds.length > 0 && isBulkMode && (
                                <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-1 rounded">
                                    {selectedIds.length} selected
                                </span>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900 ${
                                            viewMode === 'table' 
                                                ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-200' 
                                                : ''
                                        }`}
                                        onClick={() => onViewModeChange('table')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                    Table view
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900 ${
                                            viewMode === 'grid' 
                                                ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-200' 
                                                : ''
                                        }`}
                                        onClick={() => onViewModeChange('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                    Grid view
                                </TooltipContent>
                            </Tooltip>
                        </div>
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
                                        <SelectItem value="order-asc">Order (Low to High)</SelectItem>
                                        <SelectItem value="order-desc">Order (High to Low)</SelectItem>
                                        <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                        <SelectItem value="description-asc">Description (A to Z)</SelectItem>
                                        <SelectItem value="description-desc">Description (Z to A)</SelectItem>
                                        <SelectItem value="position_count-asc">Positions (Low to High)</SelectItem>
                                        <SelectItem value="position_count-desc">Positions (High to Low)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && committees.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all-grid"
                                    checked={isSelectAll}
                                    onCheckedChange={onSelectAllOnPage}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                                />
                                <Label 
                                    htmlFor="select-all-grid" 
                                    className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                                >
                                    {isSelectAll ? 'Deselect Page' : 'Select Page'}
                                </Label>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={isBulkMode}
                                            onCheckedChange={handleBulkModeToggle}
                                            className="data-[state=checked]:bg-blue-600 h-5 w-9 dark:data-[state=checked]:bg-blue-600"
                                        />
                                        <Label 
                                            htmlFor="bulk-mode" 
                                            className="text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                                        >
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
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {committees.length === 0 ? (
                        <EmptyState
                            icon={<Users className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No committees found"
                            description={hasActiveFilters 
                                ? "No committees match your current filters. Try adjusting your search or filters."
                                : "No committees have been created yet."}
                            hasFilters={hasActiveFilters}
                            onClearFilters={onClearFilters}
                            onCreateNew={!hasActiveFilters ? onCreateCommittee : undefined}
                            createLabel="Create Committee"
                        />
                    ) : viewMode === 'table' ? (
                        <CommitteesTable
                            committees={committees}
                            selectedIds={selectedIds}
                            isBulkMode={isBulkMode}
                            isSelectAll={isSelectAll}
                            onItemSelect={onItemSelect}
                            onSelectAllOnPage={onSelectAllOnPage}
                            onDelete={onDelete}
                            onToggleStatus={onToggleStatus}
                            // sortBy={sortBy}
                            // sortOrder={sortOrder}
                            // onSort={onSortChange}
                        />
                    ) : (
                        <>
                            <CommitteesGridView
                                committees={committees}
                                selectedIds={selectedIds}
                                isBulkMode={isBulkMode}
                                onItemSelect={onItemSelect}
                                onDelete={onDelete}
                                onToggleStatus={onToggleStatus}
                                isMobile={isMobile}
                                hasActiveFilters={hasActiveFilters}
                                onClearFilters={onClearFilters}
                                onCopyToClipboard={(text, label) => {
                                    navigator.clipboard.writeText(text);
                                }}
                            />
                            
                            {/* Grid Selection Summary */}
                            {viewMode === 'grid' && isBulkMode && selectedIds.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedIds.length}
                                    totalCount={committees.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                />
                            )}
                        </>
                    )}

                    {totalPages > 1 && (
                        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}