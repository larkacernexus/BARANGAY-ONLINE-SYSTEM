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

interface AnnouncementAttachment {
    id: number;
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    created_at: string;
    created_by?: string;
}

interface Announcement {
    id: number;
    attachments?: AnnouncementAttachment[];
    attachments_count: number;
}

interface Props {
    announcement: Announcement;
    onDownload: (attachment: AnnouncementAttachment) => void;
    onDeleteAttachment: (id: number) => void;
    isDownloading: number | null;
    setViewingAttachment: (attachment: AnnouncementAttachment | null) => void;
    formatDateTime: (date: string | null) => string;
    getFileIcon: (attachment: AnnouncementAttachment) => React.ElementType;
}

export const AttachmentsTab = ({
    announcement,
    onDownload,
    onDeleteAttachment,
    isDownloading,
    setViewingAttachment,
    formatDateTime,
    getFileIcon
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Paperclip className="h-5 w-5" />
                    Attachments
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Files attached to this announcement
                </CardDescription>
            </CardHeader>
            <CardContent>
                {announcement.attachments && announcement.attachments.length > 0 ? (
                    <div className="space-y-6">
                        {/* Image Attachments */}
                        {announcement.attachments.filter(a => a.is_image).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold dark:text-gray-100 flex items-center gap-2">
                                    <FileImage className="h-4 w-4" />
                                    Images ({announcement.attachments.filter(a => a.is_image).length})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {announcement.attachments
                                        .filter(a => a.is_image)
                                        .map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="group relative rounded-lg overflow-hidden border dark:border-gray-700 cursor-pointer"
                                                onClick={() => setViewingAttachment(attachment)}
                                            >
                                                <div className="aspect-square">
                                                    <img
                                                        src={`/storage/${attachment.file_path}`}
                                                        alt={attachment.original_name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                                                        {attachment.original_name}
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
                        {announcement.attachments.filter(a => !a.is_image).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold dark:text-gray-100 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Documents ({announcement.attachments.filter(a => !a.is_image).length})
                                </h3>
                                <div className="space-y-3">
                                    {announcement.attachments
                                        .filter(a => !a.is_image)
                                        .map((attachment) => {
                                            const FileIcon = getFileIcon(attachment);
                                            return (
                                                <div
                                                    key={attachment.id}
                                                    className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <FileIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate dark:text-gray-200">
                                                            {attachment.original_name}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            <span>{attachment.formatted_size}</span>
                                                            <span>•</span>
                                                            <span className="truncate">
                                                                {attachment.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                            </span>
                                                            {attachment.created_by && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Uploaded by {attachment.created_by}</span>
                                                                </>
                                                            )}
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
                                                                        onClick={() => window.open(`/storage/${attachment.file_path}`, '_blank')}
                                                                        type="button"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Preview</TooltipContent>
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