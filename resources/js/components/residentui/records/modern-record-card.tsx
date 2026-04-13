import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronDown, Eye, Download, Copy, Trash2, Lock, FileText, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate, getFileColor, getDocumentStatus, getFileTypeDisplay } from './record-utils';

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
    const fileColor = getFileColor(doc.file_extension);
    const fileTypeDisplay = getFileTypeDisplay(doc.file_extension);
    const status = getDocumentStatus(doc);

    // Format date with year
    const formatDateWithYear = (date: string) => {
        if (!date) return 'N/A';
        try {
            const d = new Date(date);
            return d.toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return formatDate(date);
        }
    };

    // Check if there are any expandable details
    const hasExpandableDetails = doc.description || doc.category || doc.expiry_date;

    return (
        <div className="mb-2 last:mb-0 animate-fade-in">
            <Card className={cn(
                "border-0 shadow-md hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800",
                selectMode && selectedRecords?.includes(doc.id) && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900",
                status.label === 'Expired' && "border-l-2 border-l-red-500"
            )}>
                <CardContent className="p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectRecord?.(doc.id)}
                                    className={cn(
                                        "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                        selectedRecords?.includes(doc.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedRecords?.includes(doc.id) && (
                                        <Check className="h-2.5 w-2.5 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <button
                                        onClick={() => onCopyReference?.(doc.reference_number || '')}
                                        className="font-mono text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                                    >
                                        {doc.reference_number || 'N/A'}
                                    </button>
                                    <span className={cn(
                                        "inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full",
                                        status.color
                                    )}>
                                        <span>{status.label}</span>
                                    </span>
                                </div>
                                <p className="font-medium text-xs text-gray-900 dark:text-white line-clamp-1">
                                    {doc.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File Info Summary */}
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className={cn("text-[9px] font-medium uppercase", fileColor)}>
                                {doc.file_extension || 'FILE'}
                            </span>
                            <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                • {doc.file_size_human}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 dark:text-gray-400">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>{formatDateWithYear(doc.created_at)}</span>
                        </div>
                    </div>

                    {/* Resident Info */}
                    <div className="flex items-center gap-1 mb-1.5 text-[10px]">
                        <User className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                            {getResidentName(doc.resident_id, doc)}
                        </span>
                    </div>

                    {/* Details Box - Additional Info */}
                    {(doc.category || doc.expiry_date) && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 mb-2">
                            <div className="grid grid-cols-2 gap-1.5">
                                {doc.category && (
                                    <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                                        <Tag className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 truncate">
                                            {doc.category.name}
                                        </span>
                                    </div>
                                )}
                                {doc.expiry_date && (
                                    <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                                        <AlertCircle className={cn(
                                            "h-2.5 w-2.5 flex-shrink-0",
                                            new Date(doc.expiry_date) < new Date() 
                                                ? "text-red-500 dark:text-red-400" 
                                                : "text-gray-400 dark:text-gray-500"
                                        )} />
                                        <span className={cn(
                                            "truncate",
                                            new Date(doc.expiry_date) < new Date() 
                                                ? "text-red-600 dark:text-red-400" 
                                                : "text-gray-600 dark:text-gray-400"
                                        )}>
                                            Exp: {formatDateWithYear(doc.expiry_date)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Expandable Details */}
                    {hasExpandableDetails && isExpanded && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-slide-down">
                            {/* Description */}
                            {doc.description && (
                                <div>
                                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Description</p>
                                    <p className="text-[10px] text-gray-700 dark:text-gray-300 line-clamp-3">
                                        {doc.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onView(doc)}
                            className="flex-1 gap-1 h-7 text-[10px] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Eye className="h-3 w-3" />
                            View
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDownload(doc)}
                            className="flex-1 gap-1 h-7 text-[10px] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Download className="h-3 w-3" />
                            Download
                        </Button>
                        {onDelete && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onDelete(doc)}
                                className="gap-1 h-7 text-[10px] border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-3 w-3" />
                                Delete
                            </Button>
                        )}
                        {hasExpandableDetails && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                title={isExpanded ? "Show Less" : "Show More"}
                            >
                                <ChevronDown className={cn(
                                    "h-3.5 w-3.5 transition-transform duration-200",
                                    isExpanded && "transform rotate-180"
                                )} />
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};