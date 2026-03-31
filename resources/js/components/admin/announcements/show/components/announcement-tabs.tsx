// resources/js/Pages/Admin/Announcements/components/announcement-tabs.tsx

import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Bell, Paperclip, Users, Eye } from 'lucide-react';

// Import types from admin types
import type { 
    Announcement, 
    AnnouncementAttachment, 
    AudienceDetails,
    AnnouncementType,
    PriorityLevel,
    AudienceType
} from '@/types/admin/announcements/announcement.types';

// Import tab components
import { DetailsTab } from './details-tab';
import { AttachmentsTab } from './attachments-tab';
import { AudienceTab } from './audience-tab';
import { PreviewTab } from './preview-tab';

// Props interface using imported types
interface Props {
    activeTab: 'details' | 'attachments' | 'audience' | 'preview';
    setActiveTab: (tab: 'details' | 'attachments' | 'audience' | 'preview') => void;
    announcement: Announcement;
    audience_details: AudienceDetails;
    audience_types: Record<string, string>;
    types: Record<string, string>;
    priorities: Record<string, string>;
    AudienceIcon: React.ElementType;
    onPreview: (e: React.MouseEvent) => void;
    onDownload: (attachment: AnnouncementAttachment) => void;
    onViewAttachment: (attachment: AnnouncementAttachment) => void;
    onDeleteAttachment: (id: number) => void;
    onDuplicate: () => void;
    isDownloading: number | null;
    viewingAttachment: AnnouncementAttachment | null;
    setViewingAttachment: (attachment: AnnouncementAttachment | null) => void;
    formatDate: (date: string | null) => string;
    formatDateTime: (date: string | null) => string;
    getTypeIcon: (type: AnnouncementType | string) => React.ReactNode;
    getTypeColor: (type: AnnouncementType | string) => string;
    getPriorityIcon: (priority: PriorityLevel | number) => React.ReactNode;
    getPriorityColor: (priority: PriorityLevel | number) => string;
    getAudienceIcon: (type: AudienceType | string) => React.ElementType;
    getFileIcon: (attachment: AnnouncementAttachment) => React.ElementType;
    getStatusIcon: (status: string, isActive: boolean) => React.ReactNode;
    daysUntilEnd: number | null;
}

// Tab configuration for better maintainability
const TABS_CONFIG = [
    { id: 'details', label: 'Announcement Details', icon: Bell, showCount: false },
    { id: 'attachments', label: 'Attachments', icon: Paperclip, showCount: true, countKey: 'attachments_count' },
    { id: 'audience', label: 'Audience Targeting', icon: Users, showCount: false },
    { id: 'preview', label: 'Preview', icon: Eye, showCount: false }
] as const;

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
    onViewAttachment,
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
    // Helper to check if tab is active
    const isActive = (tab: typeof activeTab) => activeTab === tab;

    // Helper to get tab button classes
    const getTabButtonClass = (tabId: typeof activeTab) => {
        const baseClasses = "py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center";
        const activeClasses = "border-blue-500 text-blue-600 dark:text-blue-400";
        const inactiveClasses = "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600";
        
        return `${baseClasses} ${isActive(tabId) ? activeClasses : inactiveClasses}`;
    };

    // Get count for tab if applicable
    const getTabCount = (tabId: string): number | null => {
        if (tabId === 'attachments') {
            return announcement.attachments_count || 0;
        }
        return null;
    };

    // Handle tab change - if the parent only accepts 3 tabs, we need to map preview to something else
    // But since we've updated the parent to include preview, this shouldn't be needed
    const handleTabChange = (tab: 'details' | 'attachments' | 'audience' | 'preview') => {
        setActiveTab(tab);
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8" aria-label="Announcement tabs" role="tablist">
                    {TABS_CONFIG.map((tab) => {
                        const count = getTabCount(tab.id);
                        const Icon = tab.icon;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={getTabButtonClass(tab.id)}
                                type="button"
                                role="tab"
                                aria-selected={isActive(tab.id)}
                                aria-controls={`${tab.id}-tab-panel`}
                                id={`${tab.id}-tab`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.label}
                                {tab.showCount && count !== null && count > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content - Using conditional rendering */}
            <div className="pt-2">
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div role="tabpanel" id="details-tab-panel" aria-labelledby="details-tab">
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
                    </div>
                )}

                {/* Attachments Tab */}
                {activeTab === 'attachments' && (
                    <div role="tabpanel" id="attachments-tab-panel" aria-labelledby="attachments-tab">
                        <AttachmentsTab
                            announcement={announcement}
                            onDownload={onDownload}
                            onViewAttachment={onViewAttachment}
                            onDeleteAttachment={onDeleteAttachment}
                            isDownloading={isDownloading}
                            setViewingAttachment={setViewingAttachment}
                            formatDateTime={formatDateTime}
                            getFileIcon={getFileIcon}
                        />
                    </div>
                )}

                {/* Audience Tab */}
                {activeTab === 'audience' && (
                    <div role="tabpanel" id="audience-tab-panel" aria-labelledby="audience-tab">
                        <AudienceTab
                            announcement={announcement}
                            audience_details={audience_details}
                            audience_types={audience_types}
                            types={types}
                            priorities={priorities}
                            AudienceIcon={AudienceIcon}
                            onPreview={onPreview}
                            onDuplicate={onDuplicate}
                            formatDate={formatDate}
                            getTypeIcon={getTypeIcon}
                            getTypeColor={getTypeColor}
                            getPriorityIcon={getPriorityIcon}
                            getPriorityColor={getPriorityColor}
                        />
                    </div>
                )}

                {/* Preview Tab */}
                {activeTab === 'preview' && (
                    <div role="tabpanel" id="preview-tab-panel" aria-labelledby="preview-tab">
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
                    </div>
                )}
            </div>
        </div>
    );
};