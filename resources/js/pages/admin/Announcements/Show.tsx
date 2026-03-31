// resources/js/Pages/Admin/Announcements/Show.tsx

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { route } from 'ziggy-js';

// Import types
import type { 
    Announcement, 
    AnnouncementAttachment, 
    AudienceDetails,
    AnnouncementType,
    PriorityLevel,
    AudienceType
} from '@/types/admin/announcements/announcement.types';

// Import all the extracted components
import { AnnouncementHeader } from '@/components/admin/announcements/show/components/announcement-header';
import { ExpiryBanner } from '@/components/admin/announcements/show/components/expiry-banner';
import { AnnouncementTabs } from '@/components/admin/announcements/show/components/announcement-tabs';
import { ImagePreviewDialog } from '@/components/admin/announcements/show/components/image-preview-dialog';
import { PreviewModal } from '@/components/admin/announcements/show/components/preview-modal';

// Import icons needed for helper functions
import { 
    AlertCircle, CalendarDays, Wrench, Tag, Megaphone, 
    Bell, Users, MapPin, Home, Briefcase, UserCircle, Globe,
    FileImage, FileText, FileSpreadsheet, FileArchive, File,
    XCircle, CheckCircle, Clock, Archive, Eye, EyeOff
} from 'lucide-react';

// ==================== PROPS INTERFACE ====================
interface Props {
    announcement: Announcement;
    audience_details: AudienceDetails;
    types: Record<string, string>;
    priorities: Record<string, string>;
    audience_types: Record<string, string>;
}

// ==================== HELPER FUNCTIONS ====================
export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getTypeIcon = (type: AnnouncementType | string) => {
    switch (type) {
        case 'important': return <AlertCircle className="h-5 w-5" />;
        case 'event': return <CalendarDays className="h-5 w-5" />;
        case 'maintenance': return <Wrench className="h-5 w-5" />;
        case 'other': return <Tag className="h-5 w-5" />;
        default: return <Megaphone className="h-5 w-5" />;
    }
};

export const getTypeColor = (type: AnnouncementType | string): string => {
    switch (type) {
        case 'important': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 'event': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        case 'other': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        default: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    }
};

export const getPriorityIcon = (priority: PriorityLevel | number) => {
    const priorityNum = typeof priority === 'number' ? priority : parseInt(priority);
    switch (priorityNum) {
        case 4: return <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
        case 3: return <Bell className="h-4 w-4 text-orange-500 dark:text-orange-400" />;
        case 2: return <Bell className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
        case 1: return <Bell className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
        default: return <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
};

export const getPriorityColor = (priority: PriorityLevel | number): string => {
    const priorityNum = typeof priority === 'number' ? priority : parseInt(priority);
    switch (priorityNum) {
        case 4: return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 3: return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
        case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        case 1: return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

export const getAudienceIcon = (type: AudienceType | string) => {
    switch (type) {
        case 'roles': return Users;
        case 'puroks': return MapPin;
        case 'households': return Home;
        case 'household_members': return Users;
        case 'businesses': return Briefcase;
        case 'specific_users': return UserCircle;
        default: return Globe;
    }
};

export const getFileIcon = (attachment: AnnouncementAttachment) => {
    const mimeType = attachment.mime_type;
    const fileName = attachment.file_name;
    
    if (mimeType.includes('image')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return FileText;
    if (mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return FileSpreadsheet;
    if (mimeType.includes('zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return FileArchive;
    return File;
};

export const getStatusIcon = (status: string, isActive: boolean) => {
    if (!isActive) return <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    switch (status) {
        case 'active':
        case 'published':
            return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
        case 'draft':
        case 'pending':
            return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
        case 'archived':
            return <Archive className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        default:
            return <Bell className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
};

export default function AnnouncementsShow({ announcement, audience_details, types, priorities, audience_types }: Props) {
    const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'audience' | 'preview'>('details');
    const [viewingAttachment, setViewingAttachment] = useState<AnnouncementAttachment | null>(null);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handleDownload = (attachment: AnnouncementAttachment) => {
        setIsDownloading(attachment.id);
        try {
            window.location.href = route('admin.announcements.download-attachment', attachment.id);
            toast.success('Download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download file');
        } finally {
            setIsDownloading(null);
        }
    };

    const handleViewAttachment = (attachment: AnnouncementAttachment) => {
        if (attachment.is_image) {
            setViewingAttachment(attachment);
        } else {
            window.open(route('admin.announcements.view-attachment', attachment.id), '_blank');
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;
        
        try {
            await router.delete(route('admin.announcements.delete-attachment', attachmentId), {
                onSuccess: () => {
                    toast.success('Attachment deleted successfully');
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to delete attachment');
                }
            });
        } catch (error) {
            toast.error('Failed to delete attachment');
        }
    };

    const handleDuplicate = () => {
        if (confirm('Duplicate this announcement?')) {
            router.post(route('admin.announcements.duplicate', announcement.id), {}, {
                onSuccess: () => {
                    toast.success('Announcement duplicated successfully');
                }
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this announcement? This will also delete all attachments.')) {
            router.delete(route('admin.announcements.destroy', announcement.id), {
                onSuccess: () => {
                    toast.success('Announcement deleted successfully');
                    router.visit(route('admin.announcements.index'));
                }
            });
        }
    };

    const handleToggleStatus = () => {
        router.post(route('admin.announcements.toggle-status', announcement.id), {}, {
            onSuccess: () => {
                toast.success(`Announcement ${announcement.is_active ? 'deactivated' : 'activated'} successfully`);
            }
        });
    };

    const handleCopyLink = () => {
        const link = route('admin.announcements.show', announcement.id);
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPreviewOpen(true);
    };

    // Get days until end date
    const getDaysUntilEnd = (): number | null => {
        if (!announcement.end_date) return null;
        const end = new Date(announcement.end_date);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilEnd = getDaysUntilEnd();
    const AudienceIcon = getAudienceIcon(announcement.audience_type);

    return (
        <AppLayout
            title={`Announcement: ${announcement.title}`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Announcements', href: route('admin.announcements.index') },
                { title: announcement.title, href: route('admin.announcements.show', announcement.id) }
            ]}
        >
            <Head title={`Announcement: ${announcement.title}`} />

            <div className="space-y-6">
                {/* Header with Actions */}
                <AnnouncementHeader
                    announcement={announcement}
                    copied={copied}
                    onCopyLink={handleCopyLink}
                    onPreview={handlePreview}
                    onToggleStatus={handleToggleStatus}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                />

                {/* Status Banner - For expiring soon or expired announcements */}
                <ExpiryBanner
                    announcement={announcement}
                    daysUntilEnd={daysUntilEnd}
                />

                {/* Main Content Tabs */}
                <AnnouncementTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    announcement={announcement}
                    audience_details={audience_details}
                    audience_types={audience_types}
                    types={types}
                    priorities={priorities}
                    AudienceIcon={AudienceIcon}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onViewAttachment={handleViewAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                    onDuplicate={handleDuplicate}
                    isDownloading={isDownloading}
                    viewingAttachment={viewingAttachment}
                    setViewingAttachment={setViewingAttachment}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                    getPriorityIcon={getPriorityIcon}
                    getPriorityColor={getPriorityColor}
                    getAudienceIcon={getAudienceIcon}
                    getFileIcon={getFileIcon}
                    getStatusIcon={getStatusIcon}
                    daysUntilEnd={daysUntilEnd}
                />
            </div>

            {/* Image Preview Dialog */}
            <ImagePreviewDialog
                viewingAttachment={viewingAttachment}
                setViewingAttachment={setViewingAttachment}
                onDownload={handleDownload}
                isDownloading={isDownloading}
                formatDateTime={formatDateTime}
            />

            {/* Announcement Preview Modal */}
            <PreviewModal
                previewOpen={previewOpen}
                setPreviewOpen={setPreviewOpen}
                announcement={announcement}
                AudienceIcon={AudienceIcon}
                daysUntilEnd={daysUntilEnd}
                formatDate={formatDate}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                getPriorityColor={getPriorityColor}
                getFileIcon={getFileIcon}
                getAudienceIcon={getAudienceIcon}
            />
        </AppLayout>
    );
}