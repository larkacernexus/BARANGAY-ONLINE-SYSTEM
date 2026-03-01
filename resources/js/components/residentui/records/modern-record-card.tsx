import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Eye, Download, Lock, Calendar, User, MoreVertical, 
    FileText, ChevronDown, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getFileIcon, getFileColor, getIconComponent, isDocumentExpired, formatDate } from './record-utils';
import { COLOR_MAP, BG_COLOR_MAP } from './constants';
import { useState } from 'react';

interface ModernRecordCardProps {
    document: any;
    categories?: any[];
    onView?: (doc: any) => void;
    onDownload?: (doc: any) => void;
    onDelete?: (doc: any) => void;
    getResidentName: (id: number) => string;
}

export const ModernRecordCard = ({
    document,
    categories,
    onView,
    onDownload,
    onDelete,
    getResidentName,
}: ModernRecordCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const category = categories?.find(c => c.id === document.document_category_id);
    const DocIconComponent = category ? getIconComponent(category.icon) : FileText;
    const FileIconComponent = getFileIcon(document.file_extension, document.mime_type);
    const fileColor = getFileColor(document.file_extension);
    const categoryColor = category ? (COLOR_MAP[category.color] || 'text-gray-600 dark:text-gray-400') : 'text-gray-600 dark:text-gray-400';
    const isExpired = isDocumentExpired(document);

    return (
        <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white dark:bg-gray-900">
            <div className="flex items-start gap-3">
                <div className={cn(
                    "p-2 rounded-full flex-shrink-0",
                    category?.color ? BG_COLOR_MAP[category.color] : 'bg-gray-100 dark:bg-gray-800'
                )}>
                    <DocIconComponent className={`h-4 w-4 ${categoryColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate dark:text-white">{document.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{getResidentName(document.resident_id)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <FileIconComponent className={`h-3 w-3 ${fileColor}`} />
                                    <span>{document.file_extension?.toUpperCase()}</span>
                                </div>
                                {document.requires_password && (
                                    <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                )}
                                {isExpired && (
                                    <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                                        Expired
                                    </Badge>
                                )}
                            </div>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" type="button" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem 
                                    onClick={() => onView?.(document)}
                                    disabled={isExpired}
                                    className="cursor-pointer"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {document.requires_password ? 'Unlock & View' : 'View'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onDownload?.(document)}
                                    disabled={isExpired}
                                    className="cursor-pointer"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-red-600 cursor-pointer"
                                    onClick={() => onDelete?.(document)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    {document.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                            {document.description}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(document.created_at, true)}
                            </div>
                            <div className="flex items-center gap-1">
                                <span>{document.file_size_human}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                type="button"
                                variant={document.requires_password ? "outline" : "default"}
                                className="h-7 px-2 text-xs"
                                onClick={() => onView?.(document)}
                                disabled={isExpired}
                            >
                                {document.requires_password ? 'Unlock' : 'View'}
                            </Button>
                            
                            <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => onDownload?.(document)}
                                disabled={isExpired}
                            >
                                <Download className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};