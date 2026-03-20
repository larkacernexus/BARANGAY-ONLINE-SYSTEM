// resources/js/Pages/Admin/Announcements/components/announcement-tabs.tsx
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Bell, Paperclip, Users, Eye } from 'lucide-react';

// Import tab components - fixed import paths
import { DetailsTab } from './details-tab';
import { AttachmentsTab } from './attachments-tab';
import { AudienceTab } from './audience-tab';
import { PreviewTab } from './preview-tab';

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
    is_active: boolean;
    audience_type: string;
    audience_type_label: string;
    audience_summary: string;
    estimated_reach: number;
    target_roles: number[] | null;
    target_puroks: number[] | null;
    target_households: number[] | null;
    target_businesses: number[] | null;
    target_users: number[] | null;
    start_date: string | null;
    end_date: string | null;
    formatted_date_range: string;
    created_at: string;
    updated_at: string;
    status: string;
    status_label: string;
    status_color: string;
    is_currently_active: boolean;
    has_attachments: boolean;
    attachments_count: number;
    attachments?: AnnouncementAttachment[];
    creator: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface AudienceDetails {
    roles?: Array<{ id: number; name: string }>;
    puroks?: Array<{ id: number; name: string }>;
    households?: Array<{ id: number; household_number: string; purok?: { name: string } }>;
    businesses?: Array<{ id: number; business_name: string; owner_name?: string }>;
    users?: Array<{ id: number; first_name: string; last_name: string; email: string; role?: { name: string } }>;
}

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    announcement: Announcement;
    audience_details: AudienceDetails;
    audience_types: Record<string, string>;
    types: Record<string, string>;
    priorities: Record<string, string>;
    AudienceIcon: React.ElementType;
    onPreview: (e: React.MouseEvent) => void;
    onDownload: (attachment: AnnouncementAttachment) => void;
    onDeleteAttachment: (id: number) => void;
    onDuplicate: () => void;
    isDownloading: number | null;
    viewingAttachment: AnnouncementAttachment | null;
    setViewingAttachment: (attachment: AnnouncementAttachment | null) => void;
    formatDate: (date: string | null) => string;
    formatDateTime: (date: string | null) => string;
    getTypeIcon: (type: string) => React.ReactNode;
    getTypeColor: (type: string) => string;
    getPriorityIcon: (priority: number) => React.ReactNode;
    getPriorityColor: (priority: number) => string;
    getAudienceIcon: (type: string) => React.ElementType;
    getFileIcon: (attachment: AnnouncementAttachment) => React.ElementType;
    getStatusIcon: (status: string, isActive: boolean) => React.ReactNode;
    daysUntilEnd: number | null;
}

export const AnnouncementTabs = ({
    activeTab,
    setActiveTab,
    announcement,
    audience_details,
    audience_types,
    types,
    priorities,
    AudienceIcon,
    onPreview,
    onDownload,
    onDeleteAttachment,
    onDuplicate,
    isDownloading,
    viewingAttachment,
    setViewingAttachment,
    formatDate,
    formatDateTime,
    getTypeIcon,
    getTypeColor,
    getPriorityIcon,
    getPriorityColor,
    getAudienceIcon,
    getFileIcon,
    getStatusIcon,
    daysUntilEnd
}: Props) => {
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'details' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        type="button"
                    >
                        <Bell className="h-4 w-4 inline mr-2" />
                        Announcement Details
                    </button>
                    <button
                        onClick={() => setActiveTab('attachments')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                            activeTab === 'attachments' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        type="button"
                    >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attachments
                        {announcement.attachments_count > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                                {announcement.attachments_count}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('audience')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'audience' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        type="button"
                    >
                        <Users className="h-4 w-4 inline mr-2" />
                        Audience Targeting
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'preview' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        type="button"
                    >
                        <Eye className="h-4 w-4 inline mr-2" />
                        Preview
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="pt-2">
                {/* Details Tab */}
                <TabsContent value="details">
                    <DetailsTab
                        announcement={announcement}
                        audience_details={audience_details}
                        AudienceIcon={AudienceIcon}
                        formatDate={formatDate}
                        formatDateTime={formatDateTime}
                        getTypeColor={getTypeColor}
                        getPriorityColor={getPriorityColor}
                        getStatusIcon={getStatusIcon}
                    />
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments">
                    <AttachmentsTab
                        announcement={announcement}
                        onDownload={onDownload}
                        onDeleteAttachment={onDeleteAttachment}
                        isDownloading={isDownloading}
                        setViewingAttachment={setViewingAttachment}
                        formatDateTime={formatDateTime}
                        getFileIcon={getFileIcon}
                    />
                </TabsContent>

                {/* Audience Tab */}
                <TabsContent value="audience">
                    <AudienceTab
                        announcement={announcement}
                        audience_details={audience_details}
                        AudienceIcon={AudienceIcon}
                        onPreview={onPreview}
                        onDuplicate={onDuplicate}
                    />
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview">
                    <PreviewTab
                        announcement={announcement}
                        AudienceIcon={AudienceIcon}
                        onPreview={onPreview}
                        daysUntilEnd={daysUntilEnd}
                        formatDate={formatDate}
                        getTypeIcon={getTypeIcon}
                        getTypeColor={getTypeColor}
                        getPriorityColor={getPriorityColor}
                        getFileIcon={getFileIcon}
                        getAudienceIcon={getAudienceIcon}
                    />
                </TabsContent>
            </div>
        </Tabs>
    );
};