// components/document/mobile/mobile-header.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, MoreVertical, Maximize2, Download, Printer, Folder, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../status-badge';
import { getFileIcon, getFileColor, getDocumentStatus } from '@/utils/portal/records/document.utils';
import { Document } from '@/types/portal/records/document.types';


interface MobileHeaderProps {
    document: Document;
    onFullscreen: () => void;
    onDownload: () => void;
    canDownload: boolean;
}

export function MobileHeader({ document, onFullscreen, onDownload, canDownload }: MobileHeaderProps) {
    const FileIcon = getFileIcon(document.file_extension || '');
    const fileColor = getFileColor(document.file_extension || '');

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/portal/my-records">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-xl", fileColor)}>
                                <FileIcon className="h-4 w-4" />
                            </div>
                            <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                {document.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-gray-50 dark:bg-gray-900">
                                <Folder className="h-2.5 w-2.5" />
                                {document.category?.name || 'Uncategorized'}
                            </Badge>
                            <StatusBadge status={getDocumentStatus(document)} />
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={onFullscreen}>
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Fullscreen
                            </DropdownMenuItem>
                            {canDownload && !document.security_options?.restrict_download && (
                                <DropdownMenuItem onClick={onDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                            )}
                            {!document.security_options?.restrict_print && (
                                <DropdownMenuItem onClick={() => window.print()}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}