// resources/js/components/admin/backup/BackupContent.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Trash2, Grid, Table as TableIcon, Save, Database } from 'lucide-react';

// Import the view components
import BackupGridView from '@/components/admin/backup/BackupGridView';
import BackupTableView from '@/components/admin/backup/BackupTableView';

// Utils
import { 
    formatBytes, 
    formatDate, 
    formatTimeAgo, 
    getFileIconComponent,
    getProtectionIcon,
    calculateSelectionStats
} from '@/admin-utils/backupUtils';

// Import types
import type { BackupFile, SelectionStats } from '@/types/admin/backup/backup';

// Helper components
const FileIcon = ({ type, className }: { type: string; className?: string }) => {
    const IconComponent = getFileIconComponent(type);
    return <IconComponent className={className} />;
};

const ProtectionIcon = ({ isProtected, className }: { isProtected?: boolean; className?: string }) => {
    const IconComponent = getProtectionIcon(isProtected);
    return <IconComponent className={className} />;
};

interface BackupContentProps {
    backups: BackupFile[];
    isBulkMode: boolean;
    selectedBackups: string[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
    filtersState: {
        type: string;
        size: string;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    onItemSelect: (id: string) => void;
    onSort: (column: string) => void;
    onDelete: (backup: BackupFile) => void;
    onDownload: (backup: BackupFile) => void;
    onToggleProtection: (backup: BackupFile) => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    isSelectAll: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onCreateBackup: () => void;
    filteredBackups: BackupFile[];
    setIsBulkMode: (value: boolean) => void;
    showSelectionOptions: boolean;
    setShowSelectionOptions: (value: boolean) => void;
    selectionRef: React.RefObject<HTMLDivElement | null>; // Add | null here
    isPerformingBulkAction?: boolean;
    selectionStats?: SelectionStats;
    onCopySelectedData?: () => void;
    setShowBulkDeleteDialog?: (value: boolean) => void;
}

export default function BackupContent({
    backups,
    isBulkMode,
    selectedBackups,
    viewMode,
    setViewMode,
    isMobile,
    filtersState,
    onItemSelect,
    onSort,
    onDelete,
    onDownload,
    onToggleProtection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onClearSelection,
    isSelectAll,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    hasActiveFilters,
    onClearFilters,
    onCreateBackup,
    filteredBackups,
    setIsBulkMode,
    showSelectionOptions,
    setShowSelectionOptions,
    selectionRef, // Now accepts HTMLDivElement | null
    isPerformingBulkAction = false,
    selectionStats,
    onCopySelectedData,
    setShowBulkDeleteDialog
}: BackupContentProps) {
    
    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? '↑' : '↓';
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'full':
                return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium">Full</span>;
            case 'database':
                return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">Database</span>;
            case 'files':
                return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">Files</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">{type}</span>;
        }
    };

    const getSizeColor = (size: number) => {
        if (size < 100 * 1024 * 1024) return 'text-green-600 dark:text-green-400';
        if (size < 500 * 1024 * 1024) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

    // Common props for both views
    const viewProps = {
        backups,
        isBulkMode,
        selectedBackups,
        onItemSelect,
        onDelete,
        onDownload,
        onToggleProtection,
        onSelectAllOnPage,
        onSelectAllFiltered,
        onSelectAll,
        onClearSelection,
        isSelectAll,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        onPageChange,
        hasActiveFilters,
        onClearFilters,
        onCreateBackup,
        isPerformingBulkAction,
        onCopySelectedData,
        setShowBulkDeleteDialog,
        getSortIcon,
        getTypeBadge,
        getSizeColor,
        formatBytes,
        formatDate,
        formatTimeAgo,
        FileIcon,
        ProtectionIcon,
        startIndex,
        endIndex,
        onSort, // Add onSort for table view
        filtersState // Add filtersState for table view
    };

    return (
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Backups</CardTitle>
                <div className="flex items-center gap-2">
                    {/* View Toggle Buttons */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                        disabled={isMobile}
                    >
                        {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
                    </Button>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {/* Bulk Selection Bar */}
                {isBulkMode && selectedBackups.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                                {selectedBackups.length} selected
                            </span>
                            {selectedBackups.length < totalItems && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={onSelectAllFiltered}
                                    className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400"
                                    disabled={isPerformingBulkAction}
                                >
                                    Select all {totalItems} filtered
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {onCopySelectedData && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onCopySelectedData}
                                    disabled={isPerformingBulkAction}
                                    className="h-7 text-xs dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                </Button>
                            )}
                            {setShowBulkDeleteDialog && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowBulkDeleteDialog(true)}
                                    disabled={isPerformingBulkAction}
                                    className="h-7 text-xs dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 dark:border-red-800"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearSelection}
                                disabled={isPerformingBulkAction}
                                className="h-7 text-xs dark:text-gray-300 dark:hover:bg-gray-900"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Render the appropriate view */}
                {viewMode === 'grid' ? (
                    <BackupGridView {...viewProps} />
                ) : (
                    <BackupTableView {...viewProps} />
                )}

                {/* Empty State */}
                {backups.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/20 m-4">
                        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                            <Database className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No backups found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            {hasActiveFilters 
                                ? 'Try changing your filters or search criteria.'
                                : 'Create your first backup to get started.'}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    onClick={onClearFilters}
                                    disabled={isPerformingBulkAction}
                                    className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                >
                                    Clear Filters
                                </Button>
                            )}
                            <Button 
                                onClick={onCreateBackup}
                                className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700"
                                disabled={isPerformingBulkAction}
                            >
                                <Save className="h-4 w-4" />
                                Create Backup
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}