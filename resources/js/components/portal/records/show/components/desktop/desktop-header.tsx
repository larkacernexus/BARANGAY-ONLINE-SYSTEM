// components/document/desktop/desktop-header.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Maximize2, 
    Download, 
    Folder, 
    Lock, 
    Globe, 
    Copy, 
    Share2, 
    MoreVertical, 
    Trash2, 
    Edit,
    Calendar,
    Hash,
    FileText,
    Eye,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../status-badge';
import { getFileIcon, getFileColor, getDocumentStatus } from '@/utils/portal/records/document.utils';
import { Document } from '@/types/portal/records/document.types';
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

interface DesktopHeaderProps {
    document: Document;
    onFullscreen: () => void;
    onDownload: () => void;
    onShare?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onCopyReference?: () => void;
    canDownload: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    isDownloading: boolean;
}

export function DesktopHeader({ 
    document, 
    onFullscreen, 
    onDownload, 
    onShare,
    onEdit,
    onDelete,
    onCopyReference,
    canDownload, 
    canEdit = false,
    canDelete = false,
    isDownloading 
}: DesktopHeaderProps) {
    const status = getDocumentStatus(document);
    const FileIcon = getFileIcon(document.file_extension || '');
    const fileColor = getFileColor(document.file_extension || '');

    const formatDateWithFormat = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleCopyReference = () => {
        if (onCopyReference) {
            onCopyReference();
        } else if (document.reference_number) {
            navigator.clipboard.writeText(document.reference_number);
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <Link href="/portal/my-records">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                
                <div className="flex items-start gap-3">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        fileColor
                    )}>
                        <FileIcon className="h-6 w-6" />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                {document.name}
                            </h1>
                            {document.requires_password && (
                                <Badge variant="outline" className="gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                                    <Lock className="h-3 w-3" />
                                    Protected
                                </Badge>
                            )}
                            <StatusBadge status={status} />
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="gap-1.5 bg-gray-50 dark:bg-gray-900">
                                <Folder className="h-3 w-3" />
                                {document.category?.name || 'Uncategorized'}
                            </Badge>
                            
                            {document.is_public && (
                                <Badge variant="outline" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">
                                    <Globe className="h-3 w-3" />
                                    Public
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {document.file_extension?.toUpperCase() || 'FILE'} • {document.file_size_human || 'Unknown size'}
                            </div>
                            {document.updated_at && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Updated {formatDateWithFormat(document.updated_at)}
                                </div>
                            )}
                            {document.reference_number && (
                                <div className="flex items-center gap-1">
                                    <Hash className="h-4 w-4" />
                                    Ref: {document.reference_number}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-lg"
                                        onClick={handleCopyReference}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        
                        {document.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mt-2">
                                {document.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                onClick={onFullscreen} 
                                className="gap-2 rounded-xl"
                            >
                                <Maximize2 className="h-4 w-4" />
                                Fullscreen
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>View in fullscreen</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                
                {canDownload && !document.security_options?.restrict_download && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    onClick={onDownload} 
                                    disabled={isDownloading} 
                                    className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    {isDownloading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Download
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download document</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {onShare && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                    onClick={onShare}
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Share document</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {(canEdit || canDelete) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {canEdit && (
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Document
                                </DropdownMenuItem>
                            )}
                            {canDelete && (
                                <>
                                    {canEdit && <DropdownMenuSeparator />}
                                    <DropdownMenuItem 
                                        onClick={onDelete}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Document
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}