import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../StatusBadge';
import { Check, Eye, Download, Copy, MoreVertical, FileText, Trash2, Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, getFileColor, getDocumentStatus } from './record-utils';

interface ModernRecordGridCardProps {
    document: any;
    selectMode?: boolean;
    selectedRecords?: number[];
    toggleSelectRecord?: (id: number) => void;
    getResidentName: (residentId: number, doc?: any) => string;
    onView: (doc: any) => void;
    onDownload: (doc: any) => void;
    onDelete?: (doc: any) => void;
    onCopyReference?: (ref: string) => void;
}

export const ModernRecordGridCard = ({ 
    document: doc, 
    selectMode, 
    selectedRecords, 
    toggleSelectRecord,
    getResidentName,
    onView,
    onDownload,
    onDelete,
    onCopyReference
}: ModernRecordGridCardProps) => {
    const fileColor = getFileColor(doc.file_extension);
    const status = getDocumentStatus(doc);
    const residentName = getResidentName(doc.resident_id, doc);

    return (
        <div className="animate-fade-in-up">
            <Card className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800",
                selectMode && selectedRecords?.includes(doc.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                status.label === 'Expired' && "border-l-4 border-l-red-500"
            )}>
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectRecord?.(doc.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedRecords?.includes(doc.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedRecords?.includes(doc.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => onCopyReference?.(doc.reference_number || '')}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {doc.reference_number || 'N/A'}
                                    </button>
                                    <span className={cn(
                                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                                        status.color
                                    )}>
                                        {status.label}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {doc.name}
                                </p>
                            </div>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <DropdownMenuItem 
                                    onClick={() => onCopyReference?.(doc.reference_number || '')}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Reference
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onDownload(doc)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={() => onView(doc)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                {onDelete && (
                                    <>
                                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                        <DropdownMenuItem 
                                            onClick={() => onDelete(doc)}
                                            className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className={cn("text-sm font-medium uppercase", fileColor)}>
                                    {doc.file_extension || 'FILE'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {doc.file_size_human}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(doc.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {doc.category?.name || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Resident Info Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Resident</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                {residentName}
                            </span>
                        </div>
                        
                        {doc.description && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {doc.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onView(doc)}
                            className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Eye className="h-4 w-4" />
                            View
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onDownload(doc)}
                            className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};