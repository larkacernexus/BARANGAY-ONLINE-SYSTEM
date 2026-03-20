// components/admin/roles/RolesContent.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useState } from 'react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import RolesTableView from './RolesTableView';
import RolesGridView from './RolesGridView';
import RolesBulkActions from './RolesBulkActions';
import { Role } from '@/types';
import { FilterState, SelectionMode, SelectionStats } from '@/admin-utils/rolesUtils';

interface RolesContentProps {
    roles: Role[];
    stats?: any;
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedRoles: number[];
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
    onDelete: (role: Role) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onBulkOperation: (operation: string) => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkTypeDialog?: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    windowWidth: number;
    toggleRoleExpansion: (roleId: number) => void;
    expandedRole: number | null;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function RolesContent({
    roles,
    stats,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedRoles,
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
    onCopyToClipboard,
    onCopySelectedData,
    onBulkOperation,
    setShowBulkDeleteDialog,
    setShowBulkTypeDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    windowWidth,
    toggleRoleExpansion,
    expandedRole,
    bulkEditValue,
    setBulkEditValue
}: RolesContentProps) {
    
    // Add viewMode state for toggling between table and grid views
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
            {isBulkMode && selectedRoles.length > 0 && (
                <RolesBulkActions
                    selectedRoles={selectedRoles}
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
                    setShowBulkTypeDialog={setShowBulkTypeDialog}
                    bulkEditValue={bulkEditValue}
                    setBulkEditValue={setBulkEditValue}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && roles.length > 0 && selectedRoles.length < roles.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedRoles.length}
                    totalCount={roles.length}
                    position="bottom-right"
                />
            )}

            {/* Roles List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Roles
                                {selectedRoles.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedRoles.length} selected
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
                        {viewMode === 'grid' && isBulkMode && roles.length > 0 && (
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
                                            <Label 
                                                htmlFor="bulk-mode" 
                                                className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300"
                                            >
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
                    {roles.length === 0 ? (
                        <EmptyState
                            icon={<Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No roles found"
                            description={hasActiveFilters 
                                ? "No roles match your current filters. Try adjusting your search or filters."
                                : "No roles have been created yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : undefined}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View or Grid View */}
                            {viewMode === 'table' ? (
                                <RolesTableView
                                    roles={roles}
                                    isBulkMode={isBulkMode}
                                    selectedRoles={selectedRoles}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    windowWidth={windowWidth}
                                    toggleRoleExpansion={toggleRoleExpansion}
                                    expandedRole={expandedRole}
                                />
                            ) : (
                                // Grid View
                                <RolesGridView
                                    roles={roles}
                                    isBulkMode={isBulkMode}
                                    selectedRoles={selectedRoles}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onCopyToClipboard={onCopyToClipboard}
                                    windowWidth={windowWidth}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedRoles.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedRoles.length}
                                    totalCount={roles.length}
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