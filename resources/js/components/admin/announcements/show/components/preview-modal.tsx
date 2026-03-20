// resources/js/Pages/Admin/Announcements/components/preview-modal.tsx
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Bell, 
    Calendar, 
    Users, 
    Paperclip, 
    Clock,
    CheckCircle
} from 'lucide-react';

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
    title: string;
    content: string;
    type: string;
    type_label: string;
    priority: number;
    priority_label: string;
    audience_type: string;
    audience_type_label: string;
    estimated_reach: number;
    attachments?: AnnouncementAttachment[];
    end_date: string | null;
    created_at: string;
    is_currently_active: boolean;
}

interface Props {
    previewOpen: boolean;
    setPreviewOpen: (open: boolean) => void;
    announcement: Announcement;
    AudienceIcon: React.ElementType;
    daysUntilEnd: number | null;
    formatDate: (date: string | null) => string;
    getTypeIcon: (type: string) => React.ReactNode;
    getTypeColor: (type: string) => string;
    getPriorityColor: (priority: number) => string;
    getFileIcon: (attachment: AnnouncementAttachment) => React.ElementType;
    getAudienceIcon: (type: string) => React.ElementType;
}

export const PreviewModal = ({
    previewOpen,
    setPreviewOpen,
    announcement,
    AudienceIcon,
    daysUntilEnd,
    formatDate,
    getTypeIcon,
    getTypeColor,
    getPriorityColor,
    getFileIcon,
    getAudienceIcon
}: Props) => {
    return (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">Announcement Preview</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        How this announcement appears to users
                    </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4 border dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Preview Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <div className="flex items-center gap-2 text-white">
                            <Bell className="h-5 w-5" />
                            <span className="font-semibold">Announcement</span>
                        </div>
                    </div>
                    
                    {/* Preview Content */}
                    <div className="p-6 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-lg ${getTypeColor(announcement.type)}`}>
                                {getTypeIcon(announcement.type)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold dark:text-gray-100">{announcement.title}</h2>
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(announcement.created_at)}
                                    </span>
                                    <span>•</span>
                                    <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                                        {announcement.priority_label} Priority
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Audience Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                <AudienceIcon className="h-3 w-3" />
                                {announcement.audience_type_label}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                <Users className="h-3 w-3" />
                                {announcement.estimated_reach.toLocaleString()} recipients
                            </Badge>
                        </div>

                        <Separator className="dark:border-gray-700 my-4" />

                        {/* Announcement Content */}
                        <div className="prose max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                {announcement.content}
                            </div>
                        </div>

                        {/* Attachments Preview */}
                        {announcement.attachments && announcement.attachments.length > 0 && (
                            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Paperclip className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="font-medium dark:text-gray-300">Attachments</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {announcement.attachments.slice(0, 3).map((attachment) => {
                                        const FileIcon = getFileIcon(attachment);
                                        return (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                                            >
                                                <FileIcon className="h-3 w-3" />
                                                <span className="max-w-[150px] truncate dark:text-gray-300">{attachment.original_name}</span>
                                            </div>
                                        );
                                    })}
                                    {announcement.attachments.length > 3 && (
                                        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm dark:text-gray-300">
                                            +{announcement.attachments.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};