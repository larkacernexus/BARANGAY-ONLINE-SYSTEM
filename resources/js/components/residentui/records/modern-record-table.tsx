import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Eye, Download, Lock, MoreVertical, FileText, 
    User, Trash2, Copy 
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
import { COLOR_MAP } from './constants';

interface ModernRecordTableProps {
    records: any[];
    categories?: any[];
    onView: (doc: any) => void;
    onDownload: (doc: any) => void;
    onDelete: (doc: any) => void;
    onCopyReference?: (ref: string) => void;
    getResidentName: (residentId: number, document?: any) => string; // Updated to accept document
}

export const ModernRecordTable = ({
    records,
    categories,
    onView,
    onDownload,
    onDelete,
    onCopyReference,
    getResidentName,
}: ModernRecordTableProps) => {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Document</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Owner</TableHead>
                        <TableHead className="font-semibold">Uploaded</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Size</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((doc) => {
                        const category = categories?.find(c => c.id === doc.document_category_id);
                        const DocIconComponent = category ? getIconComponent(category.icon) : FileText;
                        const FileIconComponent = getFileIcon(doc.file_extension, doc.mime_type);
                        const fileColor = getFileColor(doc.file_extension);
                        const categoryColor = category ? (COLOR_MAP[category.color] || 'text-gray-600 dark:text-gray-400') : 'text-gray-600 dark:text-gray-400';
                        const isExpired = isDocumentExpired(doc);
                        
                        // Get resident name with the document object
                        const residentName = getResidentName(doc.resident_id, doc);

                        return (
                            <TableRow key={doc.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded ${category?.color ? 'bg-gray-100 dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-900'}`}>
                                                <DocIconComponent className={`h-4 w-4 ${categoryColor}`} />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                {doc.name}
                                            </span>
                                        </div>
                                        {doc.reference_number && (
                                            <button
                                                type="button"
                                                onClick={() => onCopyReference?.(doc.reference_number)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                Ref: {doc.reference_number}
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{category?.name || 'Uncategorized'}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm truncate max-w-[120px]">
                                            {residentName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{formatDate(doc.created_at, false)}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className="text-xs w-fit">
                                            <FileIconComponent className={`h-3 w-3 mr-1 ${fileColor}`} />
                                            {doc.file_extension?.toUpperCase()}
                                        </Badge>
                                        {doc.requires_password && (
                                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 w-fit">
                                                <Lock className="h-3 w-3 mr-1" />
                                                Protected
                                            </Badge>
                                        )}
                                        {isExpired && (
                                            <Badge variant="destructive" className="text-xs w-fit">
                                                Expired
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{doc.file_size_human}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            size="sm"
                                            type="button"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => onView(doc)}
                                            disabled={isExpired}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            type="button"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => onDownload(doc)}
                                            disabled={isExpired}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" type="button" variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem 
                                                    onClick={() => onDelete(doc)} 
                                                    className="text-red-600 dark:text-red-400 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};