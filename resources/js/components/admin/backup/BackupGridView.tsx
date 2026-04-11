// resources/js/components/admin/backup/BackupGridView.tsx

import React, { JSX } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

interface BackupGridViewProps {
    backups: BackupFile[];
    isBulkMode: boolean;
    selectedBackups: string[]; // Changed from number[] to string[]
    onItemSelect: (id: string) => void; // Changed from number to string
    onDelete: (backup: BackupFile) => void;
    onDownload: (backup: BackupFile) => void;
    onToggleProtection: (backup: BackupFile) => void;
    onSelectAllFiltered: () => void;
    onClearSelection: () => void;
    isSelectAll: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    hasActiveFilters: boolean;
    isPerformingBulkAction?: boolean;
    onCopySelectedData?: () => void;
    setShowBulkDeleteDialog?: (value: boolean) => void;
    getTypeBadge: (type: string) => JSX.Element;
    getSizeColor: (size: number) => string;
    formatBytes: (bytes: number) => string;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    FileIcon: React.ComponentType<{ type: string; className?: string }>;
    ProtectionIcon: React.ComponentType<{ isProtected?: boolean; className?: string }>;
    startIndex: number;
    endIndex: number;
}

export default function BackupGridView({
    backups,
    isBulkMode,
    selectedBackups,
    onItemSelect,
    onDelete,
    onDownload,
    onToggleProtection,
    onSelectAllFiltered,
    onClearSelection,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    isPerformingBulkAction = false,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    getTypeBadge,
    getSizeColor,
    formatBytes,
    formatDate,
    formatTimeAgo,
    FileIcon,
    ProtectionIcon,
    startIndex,
    endIndex
}: BackupGridViewProps) {
    // Convert backup.id to string for comparison
    const getBackupId = (backup: BackupFile): string => backup.id.toString();

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-950">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {backups.map((backup) => (
                    <Card 
                        key={backup.id}
                        className={`relative overflow-hidden transition-all border bg-white dark:bg-gray-900 ${
                            selectedBackups.includes(getBackupId(backup)) 
                                ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                : 'hover:shadow-md dark:hover:shadow-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        {isBulkMode && (
                            <div className="absolute top-3 left-3 z-10">
                                <Checkbox
                                    checked={selectedBackups.includes(getBackupId(backup))}
                                    onCheckedChange={() => onItemSelect(getBackupId(backup))}
                                    disabled={isPerformingBulkAction}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                />
                            </div>
                        )}
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`flex items-center gap-3 ${isBulkMode ? 'ml-6' : ''}`}>
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileIcon type={backup.type} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                                                        {backup.filename || backup.name}
                                                    </h3>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                    <p>{backup.filename || backup.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getTypeBadge(backup.type)}
                                            <span className={`text-xs font-medium ${getSizeColor(backup.size_bytes)}`}>
                                                {formatBytes(backup.size_bytes)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            disabled={isPerformingBulkAction}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem 
                                            onClick={() => onDownload(backup)} 
                                            className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => onToggleProtection(backup)} 
                                            className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
                                        >
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
                                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                        <DropdownMenuItem 
                                            className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                                            onClick={() => onDelete(backup)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimeAgo(backup.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <ProtectionIcon 
                                        isProtected={backup.is_protected} 
                                        className={`h-3 w-3 ${backup.is_protected ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}
                                    />
                                    <span>{backup.is_protected ? 'Protected' : 'Unprotected'}</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {backup.status === 'completed' ? (
                                        <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                                    ) : backup.status === 'failed' ? (
                                        <XCircle className="h-3 w-3 text-red-500 dark:text-red-400" />
                                    ) : (
                                        <RefreshCw className="h-3 w-3 text-yellow-500 dark:text-yellow-400 animate-spin" />
                                    )}
                                    <span className="text-xs capitalize text-gray-700 dark:text-gray-300">{backup.status}</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(backup.created_at)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-900 dark:text-gray-200">{startIndex}</span> to <span className="font-medium text-gray-900 dark:text-gray-200">{endIndex}</span> of <span className="font-medium text-gray-900 dark:text-gray-200">{totalItems}</span> results
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isPerformingBulkAction}
                            className="h-8 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:disabled:opacity-50"
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
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                            className="h-8 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}