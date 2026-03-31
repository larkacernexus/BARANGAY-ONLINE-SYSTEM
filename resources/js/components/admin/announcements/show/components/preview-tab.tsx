// resources/js/Pages/Admin/Announcements/components/preview-tab.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Eye, 
    Bell, 
    Calendar, 
    Users, 
    Paperclip, 
    Clock,
    CheckCircle,
    ExternalLink
} from 'lucide-react';

// Import types from admin types
import type { 
    Announcement, 
    AnnouncementAttachment,
    AnnouncementType,
    PriorityLevel,
    AudienceType
} from '@/types/admin/announcements/announcement.types';

interface Props {
    announcement: Announcement;
    AudienceIcon: React.ElementType;
    onPreview: (e: React.MouseEvent) => void;
    daysUntilEnd: number | null;
    formatDate: (date: string | null) => string;
    getTypeIcon: (type: AnnouncementType | string) => React.ReactNode;
    getTypeColor: (type: AnnouncementType | string) => string;
    getPriorityColor: (priority: PriorityLevel | number) => string;
    getFileIcon: (attachment: AnnouncementAttachment) => React.ElementType;
    getAudienceIcon: (type: AudienceType | string) => React.ElementType;
}

export const PreviewTab = ({
    announcement,
    AudienceIcon,
    onPreview,
    daysUntilEnd,
    formatDate,
    getTypeIcon,
    getTypeColor,
    getPriorityColor,
    getFileIcon,
    getAudienceIcon
}: Props) => {
    // Helper to get audience icon component
    const getAudienceIconComponent = () => {
        if (announcement.audience_type === 'all') {
            return <Users className="h-3 w-3" />;
        }
        const Icon = getAudienceIcon(announcement.audience_type);
        return <Icon className="h-3 w-3" />;
    };

    // Helper to check if announcement is expired
    const isExpired = daysUntilEnd !== null && daysUntilEnd <= 0;

    // Helper to get status display
    const getStatusDisplay = () => {
        if (announcement.is_currently_active) {
            return {
                icon: <CheckCircle className="h-3 w-3" />,
                text: 'Active',
                color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
            };
        }
        if (isExpired) {
            return {
                icon: <Clock className="h-3 w-3" />,
                text: 'Expired',
                color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
            };
        }
        if (daysUntilEnd !== null && daysUntilEnd <= 3) {
            return {
                icon: <Clock className="h-3 w-3" />,
                text: `Expires in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''}`,
                color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
            };
        }
        return null;
    };

    const statusDisplay = getStatusDisplay();

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Eye className="h-5 w-5" />
                            Preview
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            How this announcement appears to targeted users
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreview}
                        className="dark:border-gray-600 dark:text-gray-300"
                        type="button"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Preview Modal
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Preview Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-4">
                        <div className="flex items-center gap-2 text-white">
                            <Bell className="h-5 w-5" />
                            <span className="font-semibold">Announcement</span>
                            {statusDisplay && (
                                <Badge variant="outline" className={`ml-auto ${statusDisplay.color} border-white/20`}>
                                    {statusDisplay.icon}
                                    <span className="ml-1">{statusDisplay.text}</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                    
                    {/* Preview Content */}
                    <div className="p-6 bg-white dark:bg-gray-900">
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`p-3 rounded-lg shrink-0 ${getTypeColor(announcement.type)}`}>
                                {getTypeIcon(announcement.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold dark:text-gray-100 break-words">
                                    {announcement.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(announcement.created_at)}
                                    </span>
                                    <span>•</span>
                                    <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                                        {announcement.priority_label} Priority
                                    </Badge>
                                    {announcement.end_date && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Ends: {formatDate(announcement.end_date)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Audience Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20">
                                {getAudienceIconComponent()}
                                <span className="ml-1">{announcement.audience_type_label}</span>
                            </Badge>
                            {announcement.estimated_reach && (
                                <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                    <Users className="h-3 w-3" />
                                    <span className="ml-1">{announcement.estimated_reach.toLocaleString()} recipients</span>
                                </Badge>
                            )}
                            {announcement.has_attachments && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                    <Paperclip className="h-3 w-3" />
                                    {announcement.attachments_count} attachment{announcement.attachments_count !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>

                        <Separator className="dark:border-gray-700 my-4" />

                        {/* Announcement Content */}
                        <div className="prose max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                {announcement.content || 'No content provided.'}
                            </div>
                        </div>

                        {/* Attachments Preview */}
                        {announcement.attachments && announcement.attachments.length > 0 && (
                            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Paperclip className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="font-medium dark:text-gray-300">
                                        Attachments ({announcement.attachments.length})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {announcement.attachments.slice(0, 5).map((attachment) => {
                                        const FileIcon = getFileIcon(attachment);
                                        return (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                                            >
                                                <FileIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                <span className="max-w-[200px] truncate dark:text-gray-300">
                                                    {attachment.original_name || attachment.file_name}
                                                </span>
                                                {attachment.formatted_size && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        ({attachment.formatted_size})
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {announcement.attachments.length > 5 && (
                                        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm dark:text-gray-300">
                                            +{announcement.attachments.length - 5} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Preview Footer */}
                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                            <div className="text-xs text-center text-gray-400 dark:text-gray-500">
                                This is a preview. The actual announcement may appear differently based on user device and settings.
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};