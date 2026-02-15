// resources/js/components/admin/committees/CommitteesContent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // ADD THIS
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CommitteesTable } from './CommitteesTable';
import { CommitteesGridView } from './CommitteesGridView';
import { CommitteesBulkActions } from './CommitteesBulkActions';
import { EmptyState } from '@/components/adminui/empty-state';
import { Pagination } from '@/components/adminui/pagination';
import { SelectAllFloat } from '@/components/adminui/select-all-float'; // ADD THIS
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary'; // ADD THIS
import { Grid3X3, List } from 'lucide-react';
import { Committee } from '@/types/committees';

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
    onClearSelection?: () => void; // ADD OPTIONAL PROP
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
    onClearSelection = () => {} // ADD DEFAULT
}: CommitteesContentProps) {
    return (
        <>
            {/* ADD: Floating Select All for Grid View */}
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
                        // Clear selection logic
                        selectedIds.forEach(id => onItemSelect(id));
                    }}
                    onSelectAllOnPage={onSelectAllOnPage}
                />
            )}

            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-lg sm:text-xl">
                            Committees List
                            {selectedIds.length > 0 && isBulkMode && (
                                <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
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
                                        className={`h-8 w-8 p-0 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                                        onClick={() => onViewModeChange('table')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Table view</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                        onClick={() => onViewModeChange('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Grid view</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* ADD: Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && committees.length > 0 && (
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
                        
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={isBulkMode}
                                            onCheckedChange={onToggleBulkMode}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                        <Label htmlFor="bulk-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                                            Bulk Mode
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle bulk selection mode</p>
                                    <p className="text-xs text-gray-500">Ctrl+Shift+B • Ctrl+A to select</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        
                        <div className="text-sm text-gray-500 hidden sm:block">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {committees.length === 0 ? (
                        <EmptyState 
                            hasActiveFilters={hasActiveFilters}
                            onClearFilters={onClearFilters}
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
                            />
                            
                            {/* ADD: Grid Selection Summary */}
                            {viewMode === 'grid' && isBulkMode && selectedIds.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedIds.length}
                                    totalCount={committees.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4"
                                />
                            )}
                        </>
                    )}

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={onPageChange}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    );
}