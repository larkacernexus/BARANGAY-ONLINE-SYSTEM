// src/components/residentui/records/modern-record-list-view.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import { Eye, MoreVertical, Copy, FileText, Printer, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/residentui/modern/data-table';
import { formatDate, getDocumentStatus } from './record-utils';

interface ModernRecordListViewProps {
    records: any[];
    selectMode?: boolean;
    selectedRecords?: number[];
    onSelectRecord?: (id: number) => void;
    onSelectAll?: () => void;
    getResidentName: (residentId: number, doc?: any) => string;
    onView: (doc: any) => void;
    onDownload: (doc: any) => void;
    onDelete?: (doc: any) => void;
    onCopyReference?: (ref: string) => void;
    onPrint?: () => void;
}

export function ModernRecordListView({
    records,
    selectMode,
    selectedRecords = [],
    onSelectRecord,
    onSelectAll,
    getResidentName,
    onView,
    onDownload,
    onDelete,
    onCopyReference,
    onPrint
}: ModernRecordListViewProps) {
    const columns = [
        {
            key: 'document',
            header: 'Document Details',
            cell: (doc: any) => (
                <div className="space-y-1">
                    <button
                        onClick={() => onCopyReference?.(doc.reference_number || '')}
                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {doc.reference_number || 'N/A'}
                    </button>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                    </p>
                    <div className="flex items-center gap-2">
                        {doc.category && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                {doc.category.name}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.file_extension?.toUpperCase()} • {doc.file_size_human}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'resident',
            header: 'Resident',
            cell: (doc: any) => (
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getResidentName(doc.resident_id, doc)}
                    </p>
                </div>
            )
        },
        {
            key: 'date',
            header: 'Date Uploaded',
            cell: (doc: any) => (
                <div className="space-y-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(doc.created_at)}
                    </p>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (doc: any) => {
                const status = getDocumentStatus(doc);
                return (
                    <span className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                        status.color
                    )}>
                        {status.icon}
                        {status.label}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (doc: any) => (
                <div className="flex justify-end gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onView(doc)}
                                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDownload(doc)}
                                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <DropdownMenuItem
                                onClick={() => onCopyReference?.(doc.reference_number || '')}
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Reference Number
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onView(doc)}
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDownload(doc)}
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onPrint}
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(doc)}
                                        className="text-red-600 dark:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <DataTable
            data={records}
            columns={columns}
            selectMode={selectMode}
            selectedItems={selectedRecords}
            onSelectItem={onSelectRecord}
            onSelectAll={onSelectAll}
            getItemId={(doc) => doc.id}
        />
    );
}