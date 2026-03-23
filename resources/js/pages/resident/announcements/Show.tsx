// announcement-show/index.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { useMobileDetect, useScrollSpy, useExpandableSections } from '@/components/residentui/hooks/useResidentUI';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';
import { cn } from '@/lib/utils';

import { AnnouncementHeader } from '@/components/portal/announcements/show/components/AnnouncementHeader';
import { MobileAnnouncementHeader } from '@/components/portal/announcements/show/components/MobileAnnouncementHeader';
import { AnnouncementStats } from '@/components/portal/announcements/show/components/AnnouncementStats';
import { AnnouncementTabs } from '@/components/portal/announcements/show/components/AnnouncementTabs';
import { AnnouncementSidebar } from '@/components/portal/announcements/show/components/AnnouncementSidebar';
import { PriorityAlertBanner } from '@/components/portal/announcements/show/components/PriorityAlertBanner';
import { DetailsTab } from '@/components/portal/announcements/show/tabs/DetailsTab';
import { AttachmentsTab } from '@/components/portal/announcements/show/tabs/AttachmentsTab';
import { RelatedTab } from '@/components/portal/announcements/show/tabs/RelatedTab';

import { useAnnouncementActions } from '@/components/residentui/hooks/useAnnouncementActions';
import { useAnnouncementBookmarks } from '@/components/residentui/hooks/useAnnouncementBookmarks';

import { Announcement, RelatedAnnouncement, AnnouncementAttachment } from '@/types/portal/announcements/announcement.types';
import { getTypeConfig, getPriorityConfig, formatRelativeTime } from '@/utils/portal/announcements/announcement-utils';
import { FileText, Paperclip, Layers, Share2, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PageProps {
    announcement: Announcement;
    relatedAnnouncements: RelatedAnnouncement[];
    resident?: {
        full_name: string;
        household_number?: string;
        purok?: string;
    } | null;
}

export default function AnnouncementShow({ announcement, relatedAnnouncements, resident }: PageProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [viewingDocument, setViewingDocument] = useState<AnnouncementAttachment | null>(null);
    const [showAllRelated, setShowAllRelated] = useState(false);
    
    const { isMobile, isClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    const { expandedSections, toggleSection } = useExpandableSections({
        announcementInfo: true,
        attachments: true,
        related: true
    });

    const {
        loading,
        isDownloading,
        isLiked,
        isShareCopied,
        handleShare,
        handleLike,
        handlePrint,
        handleDownloadAttachment,
        setLoading
    } = useAnnouncementActions({ announcement });

    const {
        isBookmarked,
        handleBookmark
    } = useAnnouncementBookmarks({ announcementId: announcement.id });

    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    
    // Fix: Ensure these are always boolean values
    const isUpcoming = announcement.start_date ? new Date(announcement.start_date) > new Date() : false;
    const isExpired = announcement.end_date ? new Date(announcement.end_date) < new Date() : false;

    const tabsConfig = [
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'attachments', label: 'Attachments', icon: Paperclip },
        { id: 'related', label: 'Related', icon: Layers },
    ];

    const getTabCount = (tabId: string) => {
        switch (tabId) {
            case 'attachments': return announcement.attachments?.length || 0;
            case 'related': return relatedAnnouncements.length;
            default: return 0;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getFABConfig = () => {
        return {
            icon: <Share2 className="h-6 w-6 text-white" />,
            label: 'Share',
            color: 'blue' as const,
            onClick: handleShare
        };
    };

    const fabConfig = getFABConfig();

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'Announcements', href: '/portal/resident-announcements' },
                { title: announcement.title, href: '#' }
            ]}
            hideMobileFooter={isMobile}
        >
            <div className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                {isMobile ? (
                    <MobileAnnouncementHeader
                        announcement={announcement}
                        showStickyActions={showStickyActions}
                        isBookmarked={isBookmarked}
                        isLiked={isLiked}
                        isShareCopied={isShareCopied}
                        onBack={() => router.get('/portal/resident-announcements')}
                        onShare={handleShare}
                        onBookmark={handleBookmark}
                        onLike={handleLike}
                        onPrint={handlePrint}
                    />
                ) : (
                    <AnnouncementHeader
                        announcement={announcement}
                        isBookmarked={isBookmarked}
                        isLiked={isLiked}
                        isShareCopied={isShareCopied}
                        onShare={handleShare}
                        onBookmark={handleBookmark}
                        onLike={handleLike}
                        onPrint={handlePrint}
                    />
                )}

                {/* Priority Alert Banner */}
                {announcement.priority >= 3 && (
                    <PriorityAlertBanner priority={announcement.priority} />
                )}

                {/* Main Content */}
                <div className={cn(
                    "grid gap-3 md:gap-6",
                    isMobile ? "grid-cols-1" : "lg:grid-cols-3"
                )}>
                    <div className={isMobile ? "col-span-1" : "lg:col-span-2"}>
                        <AnnouncementTabs
                            tabs={tabsConfig}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            getTabCount={getTabCount}
                        />

                        <div className="mt-3 space-y-3">
                            {activeTab === 'details' && (
                                <DetailsTab
                                    announcement={announcement}
                                    typeConfig={typeConfig}
                                    priorityConfig={priorityConfig}
                                    isUpcoming={isUpcoming}
                                    isExpired={isExpired}
                                    isMobile={isMobile}
                                    expandedSections={expandedSections}
                                    toggleSection={toggleSection}
                                />
                            )}

                            {activeTab === 'attachments' && (
                                <AttachmentsTab
                                    attachments={announcement.attachments || []}
                                    isDownloading={isDownloading}
                                    onView={setViewingDocument}
                                    onDownload={handleDownloadAttachment}
                                />
                            )}

                            {activeTab === 'related' && (
                                <RelatedTab
                                    relatedAnnouncements={relatedAnnouncements}
                                    showAllRelated={showAllRelated}
                                    onToggleShowAll={() => setShowAllRelated(!showAllRelated)}
                                />
                            )}
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="space-y-4 lg:space-y-6">
                            <AnnouncementSidebar
                                announcement={announcement}
                                resident={resident}
                                isBookmarked={isBookmarked}
                                isLiked={isLiked}
                                isShareCopied={isShareCopied}
                                isDownloading={isDownloading}
                                imageAttachmentsCount={announcement.attachments?.filter(a => a.is_image).length || 0}
                                documentAttachmentsCount={announcement.attachments?.filter(a => !a.is_image).length || 0}
                                onShare={handleShare}
                                onBookmark={handleBookmark}
                                onLike={handleLike}
                                onPrint={handlePrint}
                                onViewAttachments={() => setActiveTab('attachments')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            {isMobile && showStickyActions && fabConfig && (
                <ModernFloatingActionButton
                    icon={fabConfig.icon}
                    label={fabConfig.label}
                    onClick={fabConfig.onClick}
                    color={fabConfig.color}
                />
            )}

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{viewingDocument.original_name}</DialogTitle>
                            <DialogDescription>
                                {viewingDocument.formatted_size} • Uploaded on {new Date(viewingDocument.created_at).toLocaleDateString()}
                            </DialogDescription>
                        </DialogHeader>
                        {viewingDocument.is_image ? (
                            <div className="mt-4 flex justify-center">
                                <img
                                    src={`/storage/${viewingDocument.file_path}`}
                                    alt={viewingDocument.original_name}
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="mt-4 p-8 text-center bg-gray-50 rounded-lg">
                                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600">Preview not available for this file type</p>
                                <Button 
                                    className="mt-4"
                                    onClick={() => handleDownloadAttachment(viewingDocument)}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    Download File
                                </Button>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => window.open(`/storage/${viewingDocument.file_path}`, '_blank')}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open in New Tab
                            </Button>
                            <Button onClick={() => handleDownloadAttachment(viewingDocument)} disabled={isDownloading}>
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Download
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <ModernLoadingOverlay loading={loading} message="Loading..." />
        </ResidentLayout>
    );
}