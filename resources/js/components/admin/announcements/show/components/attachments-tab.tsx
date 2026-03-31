// resources/js/Pages/Admin/Announcements/components/attachments-tab.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    Paperclip, 
    Eye, 
    Download, 
    Trash2, 
    Loader2,
    FileImage,
    FileText,
    FileSpreadsheet,
    FileArchive,
    File
} from 'lucide-react';
import { route } from 'ziggy-js';

// Import types from admin types
import type { 
    Announcement, 
    AnnouncementAttachment 
} from '@/types/admin/announcements/announcement.types';

interface Props {
    announcement: Announcement;
    onDownload: (attachment: AnnouncementAttachment) => void;
    onViewAttachment: (attachment: AnnouncementAttachment) => void;
    onDeleteAttachment: (id: number) => void;
    isDownloading: number | null;
    setViewingAttachment: (attachment: AnnouncementAttachment | null) => void;
    formatDateTime: (date: string | null) => string;
    getFileIcon: (attachment: AnnouncementAttachment) => React.ElementType;
}

export const AttachmentsTab = ({
    announcement,
    onDownload,
    onViewAttachment,
    onDeleteAttachment,
    isDownloading,
    setViewingAttachment,
    formatDateTime,
    getFileIcon
}: Props) => {
    const attachments = announcement.attachments || [];

    // Helper to get image URL
    const getImageUrl = (attachment: AnnouncementAttachment): string => {
        if (attachment.file_path.startsWith('http') || attachment.file_path.startsWith('/storage/')) {
            return attachment.file_path;
        }
        return `/storage/${attachment.file_path}`;
    };

    // Helper to get file type label
    const getFileTypeLabel = (attachment: AnnouncementAttachment): string => {
        if (attachment.is_image) return 'Image';
        
        const mimeType = attachment.mime_type;
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('word')) return 'Document';
        if (mimeType.includes('excel')) return 'Spreadsheet';
        if (mimeType.includes('zip')) return 'Archive';
        
        return mimeType.split('/')[1]?.toUpperCase() || 'File';
    };

    const images = attachments.filter(a => a.is_image);
    const documents = attachments.filter(a => !a.is_image);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Paperclip className="h-5 w-5" />
                    Attachments ({attachments.length})
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Files attached to this announcement
                </CardDescription>
            </CardHeader>
            <CardContent>
                {attachments.length > 0 ? (
                    <div className="space-y-6">
                        {/* Image Attachments */}
                        {images.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold dark:text-gray-100 flex items-center gap-2">
                                    <FileImage className="h-4 w-4" />
                                    Images ({images.length})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="group relative rounded-lg overflow-hidden border dark:border-gray-700 cursor-pointer"
                                            onClick={() => setViewingAttachment(attachment)}
                                        >
                                            <div className="aspect-square">
                                                <img
                                                    src={getImageUrl(attachment)}
                                                    alt={attachment.original_name || attachment.file_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder-image.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-white hover:text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingAttachment(attachment);
                                                    }}
                                                    type="button"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                <p className="text-xs text-white truncate">
                                                    {attachment.original_name || attachment.file_name}
                                                </p>
                                                <p className="text-[10px] text-white/80">
                                                    {attachment.formatted_size}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Document Attachments */}
                        {documents.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold dark:text-gray-100 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Documents ({documents.length})
                                </h3>
                                <div className="space-y-3">
                                    {documents.map((attachment) => {
                                        const FileIcon = getFileIcon(attachment);
                                        return (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <FileIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate dark:text-gray-200">
                                                        {attachment.original_name || attachment.file_name}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <span>{attachment.formatted_size}</span>
                                                        <span>•</span>
                                                        <span className="truncate">{getFileTypeLabel(attachment)}</span>
                                                        <span>•</span>
                                                        <span>Uploaded: {formatDateTime(attachment.created_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                                                    onClick={() => onViewAttachment(attachment)}
                                                                    type="button"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>View</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                                                    onClick={() => onDownload(attachment)}
                                                                    disabled={isDownloading === attachment.id}
                                                                    type="button"
                                                                >
                                                                    {isDownloading === attachment.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Download className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Download</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                                                    onClick={() => onDeleteAttachment(attachment.id)}
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Paperclip className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">No attachments</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            This announcement has no attachments.
                        </p>
                        <Link href={route('admin.announcements.edit', announcement.id)}>
                            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300" type="button">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Add Attachments
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};