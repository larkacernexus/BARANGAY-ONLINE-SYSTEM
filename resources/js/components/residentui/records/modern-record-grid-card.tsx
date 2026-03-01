import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Eye, Download, Lock, MoreVertical, FileText,
    Calendar, User, Trash2
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

interface ModernRecordGridCardProps {
    document: any;
    categories?: any[];
    onView?: (doc: any) => void;
    onDownload?: (doc: any) => void;
    onDelete?: (doc: any) => void;
    getResidentName: (id: number) => string;
}

export const ModernRecordGridCard = ({
    document,
    categories,
    onView,
    onDownload,
    onDelete,
    getResidentName,
}: ModernRecordGridCardProps) => {
    const category = categories?.find(c => c.id === document.document_category_id);
    const DocIconComponent = category ? getIconComponent(category.icon) : FileText;
    const FileIconComponent = getFileIcon(document.file_extension, document.mime_type);
    const fileColor = getFileColor(document.file_extension);
    const categoryColor = category ? (COLOR_MAP[category.color] || 'text-gray-600 dark:text-gray-400') : 'text-gray-600 dark:text-gray-400';
    const isExpired = isDocumentExpired(document);

    return (
        <Card className={cn(
            "border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900",
            isExpired && "border-l-4 border-l-red-500"
        )}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                        "p-2 rounded-full flex-shrink-0",
                        category?.color ? BG_COLOR_MAP[category.color] : 'bg-gray-100 dark:bg-gray-800'
                    )}>
                        <DocIconComponent className={cn("h-5 w-5", categoryColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm sm:text-base line-clamp-2 break-words dark:text-white">
                            {document.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            Belongs to: {getResidentName(document.resident_id)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                    <FileIconComponent className={`h-3 w-3 mr-1 ${fileColor}`} />
                    {document.file_extension?.toUpperCase() || 'FILE'}
                </Badge>
                {document.requires_password && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                        <Lock className="h-3 w-3 mr-1" />
                        Protected
                    </Badge>
                )}
                {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                        Expired
                    </Badge>
                )}
            </div>
            
            {document.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {document.description}
                </p>
            )}
            
            {document.reference_number && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                    Ref: {document.reference_number}
                </div>
            )}
            
            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                {document.issue_date && (
                    <div className="truncate">
                        Issued: {formatDate(document.issue_date, false)}
                    </div>
                )}
                {document.expiry_date && (
                    <div className={`truncate ${isExpired ? 'text-red-600 font-semibold' : ''}`}>
                        Expires: {formatDate(document.expiry_date, false)}
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(document.created_at, true)}</span>
                </div>
                <div className="truncate">{document.file_size_human}</div>
            </div>
            
            {/* Action Buttons - Simplified like working code */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    type="button"
                    variant={document.requires_password ? "outline" : "default"}
                    className={cn(
                        "flex-1",
                        document.requires_password && "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    )}
                    onClick={() => onView?.(document)}
                    disabled={isExpired}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    {document.requires_password ? 'Unlock' : 'View'}
                </Button>
                
                <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onDownload?.(document)}
                    disabled={isExpired}
                >
                    <Download className="h-4 w-4 mr-2" />
                </Button>
            </div>
        </Card>
    );
};