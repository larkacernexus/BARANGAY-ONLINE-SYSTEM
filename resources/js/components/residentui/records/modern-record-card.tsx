import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronDown, Eye, Download, Copy, Trash2, Lock, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate, getFileIcon, getFileColor, getDocumentStatus } from './record-utils';

interface ModernRecordCardProps {
    document: any;
    selectMode?: boolean;
    selectedRecords?: number[];
    toggleSelectRecord?: (id: number) => void;
    getResidentName: (residentId: number, doc?: any) => string;
    onView: (doc: any) => void;
    onDownload: (doc: any) => void;
    onDelete?: (doc: any) => void;
    onCopyReference?: (ref: string) => void;
    isMobile?: boolean;
}

export const ModernRecordCard = ({ 
    document: doc, 
    selectMode, 
    selectedRecords, 
    toggleSelectRecord,
    getResidentName,
    onView,
    onDownload,
    onDelete,
    onCopyReference,
    isMobile = true
}: ModernRecordCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const FileIcon = getFileIcon(doc.file_extension, doc.mime_type);
    const fileColor = getFileColor(doc.file_extension);
    const status = getDocumentStatus(doc);

    return (
        <div className="mb-3 last:mb-0 animate-fade-in">
            <Card className={cn(
                "border-0 shadow-lg overflow-hidden transition-all duration-300",
                selectMode && selectedRecords?.includes(doc.id) && "ring-2 ring-blue-500 ring-offset-2",
                status.label === 'Expired' && "border-l-4 border-l-red-500"
            )}>
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectRecord?.(doc.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedRecords?.includes(doc.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    )}
                                >
                                    {selectedRecords?.includes(doc.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => onCopyReference?.(doc.reference_number || '')}
                                        className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {doc.reference_number || 'N/A'}
                                    </button>
                                    <span className={cn(
                                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                                        status.color
                                    )}>
                                        {status.icon}
                                        {status.label}
                                    </span>
                                </div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                    {doc.name}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronDown className={cn(
                                "h-4 w-4 text-gray-500 transition-transform duration-200",
                                isExpanded && "transform rotate-180"
                            )} />
                        </button>
                    </div>

                    {/* File Info Summary */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FileIcon className={cn("h-4 w-4", fileColor)} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {doc.file_extension?.toUpperCase()} • {doc.file_size_human}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded</p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(doc.created_at, true)}
                            </p>
                        </div>
                    </div>

                    {/* Resident Info */}
                    <div className="flex items-center gap-2 mb-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Resident:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {getResidentName(doc.resident_id, doc)}
                        </span>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-slide-down">
                            {/* Description */}
                            {doc.description && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                                        {doc.description}
                                    </p>
                                </div>
                            )}

                            {/* Category */}
                            {doc.category && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {doc.category.name}
                                    </p>
                                </div>
                            )}

                            {/* Expiry Date if exists */}
                            {doc.expiry_date && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</p>
                                    <p className={cn(
                                        "text-xs font-medium",
                                        new Date(doc.expiry_date) < new Date() 
                                            ? "text-red-600 dark:text-red-400" 
                                            : "text-gray-700 dark:text-gray-300"
                                    )}>
                                        {formatDate(doc.expiry_date)}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => onView(doc)}
                                    className="flex-1 gap-2"
                                >
                                    <Eye className="h-3 w-3" />
                                    View Details
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => onDownload(doc)}
                                    className="flex-1 gap-2"
                                >
                                    <Download className="h-3 w-3" />
                                    Download
                                </Button>
                                {onDelete && (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => onDelete(doc)}
                                        className="gap-2 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};