// components/residentui/records/modern-record-mobile-list-view.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, 
    Eye, 
    Download, 
    MoreHorizontal, 
    FileText, 
    Lock, 
    ChevronRight,
    ChevronDown,
    User,
    Calendar,
    HardDrive,
    Hash,
    Folder,
    Shield,
    Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getDocumentStatus, formatFileSize } from './record-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ModernRecordMobileListViewProps {
    records: any[];
    selectMode?: boolean;
    selectedRecords?: number[];
    onSelectRecord?: (id: number) => void;
    getResidentName: (residentId: number, doc?: any) => string;
    onView: (doc: any) => void;
    onDownload: (doc: any) => void;
    onDelete?: (doc: any) => void;
    onCopyReference?: (ref: string) => void;
}

export function ModernRecordMobileListView({
    records,
    selectMode,
    selectedRecords = [],
    onSelectRecord,
    getResidentName,
    onView,
    onDownload,
    onDelete,
    onCopyReference,
}: ModernRecordMobileListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {records.map((record) => {
                const isSelected = selectedRecords.includes(record.id);
                const isExpanded = expandedId === record.id;
                const status = getDocumentStatus(record);
                const residentName = getResidentName(record.resident_id, record);
                const fileSize = record.file_size_human || (record.file_size ? formatFileSize(record.file_size) : 'Unknown size');
                const fileExtension = record.file_extension?.toUpperCase() || 'FILE';

                return (
                    <div
                        key={record.id}
                        className={cn(
                            "relative transition-colors",
                            isSelected && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                    >
                        {/* Main Row */}
                        <div 
                            className={cn(
                                "py-3 transition-colors cursor-pointer",
                                "active:bg-gray-50 dark:active:bg-gray-800/50"
                            )}
                            onClick={() => selectMode && onSelectRecord?.(record.id)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectRecord?.(record.id);
                                        }}
                                        className={cn(
                                            "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-blue-500 border-blue-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                )}

                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={(e) => toggleExpand(record.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* File Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {record.name}
                                        </h3>
                                        {record.requires_password && (
                                            <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="truncate max-w-[100px]">{residentName}</span>
                                        <span>•</span>
                                        <span className="flex-shrink-0">{formatDate(record.created_at)}</span>
                                        <span>•</span>
                                        <span className="flex-shrink-0">{fileSize}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px] px-1.5 py-0 h-4 border-0",
                                                status.color
                                            )}
                                        >
                                            {status.icon}
                                            <span className="ml-0.5">{status.label}</span>
                                        </Badge>
                                        {record.category && (
                                            <Badge 
                                                variant="secondary" 
                                                className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-800"
                                            >
                                                {record.category.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    {!selectMode && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(record);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDownload(record);
                                                }}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => onCopyReference?.(record.reference_number || '')}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Reference
                                                    </DropdownMenuItem>
                                                    {onDelete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onDelete(record)}
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details Section */}
                        {isExpanded && !selectMode && (
                            <div className="px-3 pb-3 pl-14 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                                <div className="pt-3 space-y-2">
                                    {/* Reference Number */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Hash className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Reference:</span>
                                            <span className="font-mono text-gray-700 dark:text-gray-300">
                                                {record.reference_number || 'N/A'}
                                            </span>
                                        </div>
                                        {record.reference_number && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(record.reference_number, 'Reference number', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        )}
                                    </div>

                                    {/* Resident */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Resident:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {residentName}
                                        </span>
                                    </div>

                                    {/* Category */}
                                    {record.category && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Folder className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {record.category.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {formatDate(record.created_at, true)}
                                        </span>
                                    </div>

                                    {record.updated_at && record.updated_at !== record.created_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(record.updated_at, true)}
                                            </span>
                                        </div>
                                    )}

                                    {/* File Details */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <HardDrive className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">File:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {fileExtension} • {fileSize}
                                        </span>
                                    </div>

                                    {/* Security Status */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Shield className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Security:</span>
                                        <span className={cn(
                                            "text-xs",
                                            record.requires_password 
                                                ? "text-amber-600 dark:text-amber-400" 
                                                : "text-green-600 dark:text-green-400"
                                        )}>
                                            {record.requires_password ? 'Password Protected' : 'Public'}
                                        </span>
                                    </div>

                                    {/* Description if available */}
                                    {record.description && (
                                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {record.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onView(record);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownload(record);
                                            }}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}