// resources/js/components/admin/backup/BackupTableView.tsx

import React, { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    Clock,
    Lock,
    Unlock,
    Download,
    Trash2,
    MoreVertical,
    CheckCircle,
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import type { BackupFile } from '@/types/admin/backup/backup';

interface BackupTableViewProps {
    backups: BackupFile[];
    isBulkMode: boolean;
    selectedBackups: string[]; // Changed from number[] to string[]
    onItemSelect: (id: string) => void; // Changed from number to string
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
    isPerformingBulkAction?: boolean;
    onCopySelectedData?: () => void;
    setShowBulkDeleteDialog?: (value: boolean) => void;
    getSortIcon: (column: string) => string | null;
    getTypeBadge: (type: string) => JSX.Element;
    getSizeColor: (size: number) => string;
    formatBytes: (bytes: number) => string;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    FileIcon: React.ComponentType<{ type: string; className?: string }>;
    ProtectionIcon: React.ComponentType<{ isProtected?: boolean; className?: string }>;
    startIndex: number;
    endIndex: number;
    onSort: (column: string) => void;
    filtersState: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
}

export default function BackupTableView({
    backups,
    isBulkMode,
    selectedBackups,
    onItemSelect,
    onDelete,
    onDownload,
    onToggleProtection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    isSelectAll,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    isPerformingBulkAction = false,
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
    onSort,
    filtersState
}: BackupTableViewProps) {
    // Convert backup.id to string for comparison
    const getBackupId = (backup: BackupFile): string => backup.id.toString();

    return (
        <>
            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                    {isBulkMode && (
                                        <TableHead className="px-4 py-3 w-12 dark:text-gray-400">
                                            <Checkbox
                                                checked={isSelectAll}
                                                onCheckedChange={onSelectAllOnPage}
                                                disabled={isPerformingBulkAction}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600"
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        onClick={() => onSort('filename')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Filename
                                            {getSortIcon('filename') && (
                                                <span className="text-xs">{getSortIcon('filename')}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px] cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        onClick={() => onSort('type')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Type
                                            {getSortIcon('type') && (
                                                <span className="text-xs">{getSortIcon('type')}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px] cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        onClick={() => onSort('size_bytes')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Size
                                            {getSortIcon('size_bytes') && (
                                                <span className="text-xs">{getSortIcon('size_bytes')}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px] cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        onClick={() => onSort('created_at')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Created
                                            {getSortIcon('created_at') && (
                                                <span className="text-xs">{getSortIcon('created_at')}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                                        Protection
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {backups.map((backup) => (
                                    <TableRow 
                                        key={backup.id}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors border-gray-200 dark:border-gray-700 ${
                                            selectedBackups.includes(getBackupId(backup)) ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                        }`}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3">
                                                <Checkbox
                                                    checked={selectedBackups.includes(getBackupId(backup))}
                                                    onCheckedChange={() => onItemSelect(getBackupId(backup))}
                                                    disabled={isPerformingBulkAction}
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600"
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <FileIcon type={backup.type} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] cursor-help">
                                                                    {backup.filename || backup.name}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                                                <p className="text-sm max-w-xs">{backup.filename || backup.name}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    {backup.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                            {backup.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {getTypeBadge(backup.type)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <span className={`text-sm font-medium ${getSizeColor(backup.size_bytes)}`}>
                                                {formatBytes(backup.size_bytes)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatTimeAgo(backup.created_at)}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                                    {formatDate(backup.created_at)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {backup.status === 'completed' ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">Completed</span>
                                                    </>
                                                ) : backup.status === 'failed' ? (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">Failed</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 text-yellow-500 dark:text-yellow-400 animate-spin" />
                                                        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{backup.status}</span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onToggleProtection(backup)}
                                                className="h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900"
                                                title={backup.is_protected ? 'Remove protection' : 'Protect backup'}
                                                disabled={isPerformingBulkAction}
                                            >
                                                <ProtectionIcon 
                                                    isProtected={backup.is_protected} 
                                                    className={`h-4 w-4 ${backup.is_protected ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}
                                                />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-900"
                                                        disabled={isPerformingBulkAction}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                                    <DropdownMenuItem onClick={() => onDownload(backup)} className="dark:text-gray-200 dark:focus:bg-gray-700">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onToggleProtection(backup)} className="dark:text-gray-200 dark:focus:bg-gray-700">
                                                        {backup.is_protected ? (
                                                            <>
                                                                <Unlock className="mr-2 h-4 w-4" />
                                                                Remove Protection
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="mr-2 h-4 w-4" />
                                                                Protect
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                    <DropdownMenuItem 
                                                        className="text-red-600 dark:text-red-400 dark:focus:bg-red-950/30"
                                                        onClick={() => onDelete(backup)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {startIndex} to {endIndex} of {totalItems} results
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isPerformingBulkAction}
                            className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                        className={`h-8 w-8 p-0 ${
                                            currentPage === pageNum 
                                                ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900'
                                        }`}
                                        disabled={isPerformingBulkAction}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isPerformingBulkAction}
                            className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}