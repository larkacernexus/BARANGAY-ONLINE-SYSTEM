import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Key, ArrowUpDown } from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import RolePermissionsTableView from './RolePermissionsTableView';
import RolePermissionsGridView from './RolePermissionsGridView';
import RolePermissionsBulkActions from './RolePermissionsBulkActions';

// Import types from the types file
import { 
    RolePermission, 
    FilterState, 
    SelectionMode, 
    SelectionStats, 
    BulkOperation 
} from '@/types/admin/rolepermissions/rolePermissions.types';

interface RolePermissionsContentProps {
    permissions: RolePermission[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedPermissions: number[];
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
    onRevokePermission: (permission: RolePermission) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onCopySelectedData: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    setShowBulkRevokeDialog: (show: boolean) => void;
    filtersState: FilterState;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    windowWidth: number;
    expandedPermission: number | null;
    togglePermissionExpansion: (id: number) => void;
    // Sort dropdown props
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export default function RolePermissionsContent({
    permissions,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedPermissions,
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
    onRevokePermission,
    onCopyToClipboard,
    onCopySelectedData,
    onBulkOperation,
    setShowBulkRevokeDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    windowWidth,
    expandedPermission,
    togglePermissionExpansion,
    sortBy = 'granted_at',
    sortOrder = 'desc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'granted_at-desc'
}: RolePermissionsContentProps) {
    
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
            {isBulkMode && selectedPermissions.length > 0 && (
                <RolePermissionsBulkActions
                    selectedPermissions={selectedPermissions}
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
                    setShowBulkRevokeDialog={setShowBulkRevokeDialog}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && permissions.length > 0 && selectedPermissions.length < permissions.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedPermissions.length}
                    totalCount={permissions.length}
                    position="bottom-right"
                />
            )}

            {/* Permissions List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Permission Assignments
                                {selectedPermissions.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedPermissions.length} selected
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
                                        <SelectItem value="permission_name-asc">Permission (A to Z)</SelectItem>
                                        <SelectItem value="permission_name-desc">Permission (Z to A)</SelectItem>
                                        <SelectItem value="role_name-asc">Role (A to Z)</SelectItem>
                                        <SelectItem value="role_name-desc">Role (Z to A)</SelectItem>
                                        <SelectItem value="module-asc">Module (A to Z)</SelectItem>
                                        <SelectItem value="module-desc">Module (Z to A)</SelectItem>
                                        <SelectItem value="granter-asc">Assigned By (A to Z)</SelectItem>
                                        <SelectItem value="granter-desc">Assigned By (Z to A)</SelectItem>
                                        <SelectItem value="granted_at-asc">Assigned (Oldest first)</SelectItem>
                                        <SelectItem value="granted_at-desc">Assigned (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && permissions.length > 0 && (
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
                    {permissions.length === 0 ? (
                        <EmptyState
                            icon={<Key className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No permission assignments found"
                            description={hasActiveFilters 
                                ? "No assignments match your current filters. Try adjusting your search or filters."
                                : "No permissions have been assigned to roles yet."}
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
                                <RolePermissionsTableView
                                    permissions={permissions}
                                    isBulkMode={isBulkMode}
                                    selectedPermissions={selectedPermissions}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onRevokePermission={onRevokePermission}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    windowWidth={windowWidth}
                                    expandedPermission={expandedPermission}
                                    togglePermissionExpansion={togglePermissionExpansion}
                                />
                            ) : (
                                // Grid View
                                <RolePermissionsGridView
                                    permissions={permissions}
                                    isBulkMode={isBulkMode}
                                    selectedPermissions={selectedPermissions}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onRevokePermission={onRevokePermission}
                                    onCopyToClipboard={onCopyToClipboard}
                                    windowWidth={windowWidth}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedPermissions.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedPermissions.length}
                                    totalCount={permissions.length}
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