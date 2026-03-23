// announcement-show/tabs/AttachmentsTab.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernDocumentThumbnail } from '@/components/residentui/modern-document-viewer';
import { 
    Paperclip, FileImage, FileText, Download, Eye, Loader2, 
    FileSpreadsheet, FileArchive, File, Inbox 
} from 'lucide-react';
import { AnnouncementAttachment } from '@/types/portal/announcements/announcement.types';
import { getFileIcon, formatFileSize } from '@/utils/portal/announcements/announcement-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AttachmentsTabProps {
    attachments: AnnouncementAttachment[];
    isDownloading: boolean;
    onView: (attachment: AnnouncementAttachment) => void;
    onDownload: (attachment: AnnouncementAttachment) => void;
}

export function AttachmentsTab({ attachments, isDownloading, onView, onDownload }: AttachmentsTabProps) {
    const imageAttachments = attachments.filter(a => a.is_image);
    const documentAttachments = attachments.filter(a => !a.is_image);

    return (
        <div className="space-y-4">
            {attachments.length > 0 ? (
                <>
                    {/* Image Attachments */}
                    {imageAttachments.length > 0 && (
                        <ModernCard
                            title={`Photos (${imageAttachments.length})`}
                            icon={FileImage}
                            iconColor="from-green-500 to-green-600"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {imageAttachments.map((attachment) => (
                                    <ModernDocumentThumbnail
                                        key={attachment.id}
                                        document={attachment}
                                        onView={() => onView(attachment)}
                                        onDownload={() => onDownload(attachment)}
                                    />
                                ))}
                            </div>
                        </ModernCard>
                    )}

                    {/* Document Attachments */}
                    {documentAttachments.length > 0 && (
                        <ModernCard
                            title={`Documents (${documentAttachments.length})`}
                            icon={Paperclip}
                            iconColor="from-blue-500 to-blue-600"
                        >
                            <div className="space-y-2">
                                {documentAttachments.map((attachment) => {
                                    const FileIcon = getFileIcon(attachment.mime_type, attachment.file_name);
                                    
                                    return (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                                        >
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0">
                                                <FileIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {attachment.original_name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{attachment.formatted_size}</span>
                                                    <span>•</span>
                                                    <span className="truncate">
                                                        {attachment.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg"
                                                                onClick={() => window.open(`/storage/${attachment.file_path}`, '_blank')}
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
                                                                className="h-8 w-8 rounded-lg"
                                                                onClick={() => onDownload(attachment)}
                                                                disabled={isDownloading}
                                                            >
                                                                {isDownloading ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Download className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Download</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ModernCard>
                    )}
                </>
            ) : (
                <ModernEmptyState
                    status="empty"
                    title="No Attachments"
                    message="This announcement has no attachments"  // Changed from 'description' to 'message'
                    icon={Inbox}
                    // className removed as ModernEmptyState doesn't accept className
                />
            )}
        </div>
    );
}