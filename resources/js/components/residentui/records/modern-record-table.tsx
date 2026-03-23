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
import { Eye, MoreVertical, Copy, FileText, Printer, Download, Trash2, CheckCircleIcon, LockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/residentui/modern/data-table';
import { getIconComponent, formatDate } from './record-utils';

interface Document {
    id: number;
    name: string;
    reference_number?: string;
    file_extension: string;
    file_size_human: string;
    created_at: string;
    category?: {
        name: string;
        color: string;
        icon: string;
    };
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
        full_name?: string;
    };
    resident_id: number;
    requires_password?: boolean;
}

interface ModernRecordTableProps {
    records: Document[];
    categories: any[];
    onView: (doc: Document) => void;
    onDownload: (doc: Document) => void;
    onDelete: (doc: Document) => void;
    onCopyReference: (ref: string) => void;
    getResidentName: (residentId?: number, doc?: Document) => string;
    selectMode?: boolean;
    selectedItems?: number[];
    onSelectItem?: (id: number) => void;
    onSelectAll?: () => void;
}

export function ModernRecordTable({
    records,
    categories,
    onView,
    onDownload,
    onDelete,
    onCopyReference,
    getResidentName,
    selectMode = false,
    selectedItems = [],
    onSelectItem,
    onSelectAll
}: ModernRecordTableProps) {
    const columns = [
        {
            key: 'document',
            header: 'Document Details',
            cell: (doc: Document) => (
                <div className="space-y-1">
                    <button
                        onClick={() => onCopyReference(doc.reference_number || '')}
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
                                {getIconComponent(doc.category.icon, 'h-3 w-3')}
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
            cell: (doc: Document) => (
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
            cell: (doc: Document) => (
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
            cell: (doc: Document) => (
                <div className="space-y-1">
                    {doc.requires_password ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                            <LockIcon className="h-3 w-3" />
                            Password Protected
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <CheckCircleIcon className="h-3 w-3" />
                            Public
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (doc: Document) => (
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
                                onClick={() => onCopyReference(doc.reference_number || '')}
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(doc)}
                                className="text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
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
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onSelectAll={onSelectAll}
            getItemId={(doc) => doc.id}
        />
    );
}