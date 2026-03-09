// pages/resident/Announcements/Show.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Calendar,
    Clock,
    AlertTriangle,
    Info,
    Wrench,
    PartyPopper,
    Bell,
    Share2,
    Bookmark,
    Printer,
    Download,
    Eye,
    FileText,
    FileImage,
    File,
    ChevronRight,
    User,
    ExternalLink,
    MessageSquare,
    Building,
    Phone,
    Mail,
    Copy,
    Check,
    Paperclip,
    MapPin,
    BellRing,
    Tag,
    ShieldAlert,
    Megaphone,
    ChevronDown,
    ChevronUp,
    Star,
    Clock4,
    Pin,
    Users,
    Shield,
    AlertCircle,
    FileSpreadsheet,
    FileArchive,
    Heart,
    ThumbsUp,
    MessageCircle,
    Share,
    BookmarkPlus,
    BookmarkCheck,
    Target,
    Globe,
    Home,
    Briefcase,
    MoreVertical,
    Inbox,
    Loader2,
    Layers,
    Receipt,
    X
} from 'lucide-react';

// Import from reusable UI library
import { formatCurrency, formatDate, formatDateTime, downloadFile } from '@/components/residentui/lib/resident-ui-utils';
import { useMobileDetect, useScrollSpy, useExpandableSections } from '@/components/residentui/hooks/useResidentUI';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';
import { ModernUrgencyBadge } from '@/components/residentui/modern-urgency-badge';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernDocumentViewer, ModernDocumentThumbnail } from '@/components/residentui/modern-document-viewer';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { ModernExpandableSection } from '@/components/residentui/modern-expandable-section';
import { ModernFloatingActionButton } from '@/components/residentui/modern-floating-action-button';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { cn } from '@/lib/utils';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Type configuration
const TYPE_CONFIG = {
    important: {
        label: 'Important',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: ShieldAlert,
        gradient: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        hoverColor: 'hover:bg-red-100'
    },
    event: {
        label: 'Event',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: PartyPopper,
        gradient: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        hoverColor: 'hover:bg-green-100'
    },
    maintenance: {
        label: 'Maintenance',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Wrench,
        gradient: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        hoverColor: 'hover:bg-blue-100'
    },
    general: {
        label: 'General',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: Megaphone,
        gradient: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        hoverColor: 'hover:bg-gray-100'
    },
    other: {
        label: 'Other',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Bell,
        gradient: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100'
    },
};

// Priority configuration
const PRIORITY_CONFIG = {
    0: {
        label: 'Normal',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: Bell,
        gradient: 'from-gray-100 to-gray-200',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300'
    },
    1: {
        label: 'Low',
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: Info,
        gradient: 'from-blue-100 to-blue-200',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300'
    },
    2: {
        label: 'Medium',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: AlertCircle,
        gradient: 'from-yellow-100 to-yellow-200',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300'
    },
    3: {
        label: 'High',
        color: 'bg-orange-100 text-orange-700 border-orange-300',
        icon: AlertTriangle,
        gradient: 'from-orange-100 to-orange-200',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300'
    },
    4: {
        label: 'Urgent',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: Shield,
        gradient: 'from-red-100 to-red-200',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300'
    },
};

// Audience icon mapping
const AUDIENCE_ICONS = {
    all: Globe,
    roles: Users,
    puroks: MapPin,
    households: Home,
    household_members: Users,
    businesses: Briefcase,
    specific_users: User,
};

// Helper function to get priority config safely
const getPriorityConfig = (priority: number) => {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG[0];
};

// Helper function to get type config safely
const getTypeConfig = (type: string) => {
    return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.general;
};

interface AnnouncementAttachment {
    id: number;
    announcement_id: number;
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface RelatedAnnouncement {
    id: number;
    title: string;
    type: string;
    type_label: string;
    priority: number;
    priority_label: string;
    excerpt?: string;
    created_at: string;
    has_attachments?: boolean;
    attachments_count?: number;
}

interface PageProps {
    announcement: {
        id: number;
        title: string;
        content: string;
        type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
        type_label: string;
        priority: number;
        priority_label: string;
        is_currently_active: boolean;
        status: string;
        status_label: string;
        status_color: string;
        start_date: string | null;
        end_date: string | null;
        start_time: string | null;
        end_time: string | null;
        created_at: string;
        updated_at: string;
        audience_type: string;
        audience_summary: string;
        estimated_reach?: number;
        views_count?: number;
        has_attachments: boolean;
        attachments_count: number;
        attachments?: AnnouncementAttachment[];
        author?: {
            id: number;
            name: string;
            role?: string;
            avatar?: string;
        };
    };
    relatedAnnouncements: RelatedAnnouncement[];
    resident?: {
        full_name: string;
        household_number?: string;
        purok?: string;
    } | null;
    priorityOptions: Record<number, string>;
    types: Record<string, string>;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file type icon
const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.includes('image')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return FileText;
    if (mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return FileSpreadsheet;
    if (mimeType.includes('zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return FileArchive;
    return File;
};

export default function AnnouncementShow({ announcement, relatedAnnouncements, resident }: PageProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [expandedAttachments, setExpandedAttachments] = useState(false);
    const [showAllRelated, setShowAllRelated] = useState(false);
    const [viewingDocument, setViewingDocument] = useState<AnnouncementAttachment | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const { isMobile, isClient: isMobileClient } = useMobileDetect();
    const showStickyActions = useScrollSpy(200);
    const { expandedSections, toggleSection } = useExpandableSections({
        announcementInfo: true,
        attachments: true,
        related: true
    });

    const headerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const PriorityIcon = priorityConfig.icon;
    const TypeIcon = typeConfig.icon;

    // Get audience icon
    const AudienceIcon = AUDIENCE_ICONS[announcement.audience_type as keyof typeof AUDIENCE_ICONS] || Globe;

    // Set client state
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Set document title
    useEffect(() => {
        if (isClient) {
            document.title = `${announcement.title} | Barangay Announcements`;
        }
    }, [announcement.title, isClient]);

    // Check if bookmarked on mount
    useEffect(() => {
        if (isClient) {
            const bookmarks = JSON.parse(localStorage.getItem('announcement_bookmarks') || '[]');
            setIsBookmarked(bookmarks.includes(announcement.id));
        }
    }, [announcement.id, isClient]);


    // Format relative time
    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return formatDate(dateString);
        }
    };

    // Check if announcement is upcoming
    const isUpcoming = announcement.start_date && new Date(announcement.start_date) > new Date();

    // Check if announcement is expired
    const isExpired = announcement.end_date && new Date(announcement.end_date) < new Date();

    // Handle download attachment
    const handleDownloadAttachment = async (attachment: AnnouncementAttachment) => {
        if (!isClient) return;

        setIsDownloading(true);
        try {
            // Try to download via API first for tracking
            const response = await fetch(`/portal/announcements/attachments/${attachment.id}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachment.original_name || attachment.file_name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // Fallback to direct storage access
                await downloadFile(
                    `/storage/${attachment.file_path}`,
                    attachment.original_name || attachment.file_name
                );
            }
            
            // Track download
            router.post(`/portal/announcements/attachments/${attachment.id}/track-download`, {}, {
                preserveState: true,
                preserveScroll: true,
                onError: () => console.error('Failed to track download')
            });
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Handle share
    const handleShare = async () => {
        if (!isClient) return;

        const shareUrl = window.location.href;
        const shareText = `Check out this announcement: ${announcement.title}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: announcement.title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    handleCopyShareLink();
                }
            }
        } else {
            handleCopyShareLink();
        }
    };

    const handleCopyShareLink = () => {
        if (!isClient) return;

        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setIsShareCopied(true);
                setTimeout(() => setIsShareCopied(false), 2000);
            })
            .catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setIsShareCopied(true);
                    setTimeout(() => setIsShareCopied(false), 2000);
                } catch (err) {
                    console.error('Copy failed:', err);
                }
                document.body.removeChild(textArea);
            });
    };

    // Handle bookmark
    const handleBookmark = () => {
        if (!isClient) return;

        const bookmarks = JSON.parse(localStorage.getItem('announcement_bookmarks') || '[]');

        if (isBookmarked) {
            const newBookmarks = bookmarks.filter((id: number) => id !== announcement.id);
            localStorage.setItem('announcement_bookmarks', JSON.stringify(newBookmarks));
            setIsBookmarked(false);
        } else {
            bookmarks.push(announcement.id);
            localStorage.setItem('announcement_bookmarks', JSON.stringify(bookmarks));
            setIsBookmarked(true);
        }
    };

    // Handle like
    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    // Handle print
    const handlePrint = () => {
        if (!isClient) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${announcement.title}</title>
                    <style>
                        body { font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .title { font-size: 28px; font-weight: bold; margin-bottom: 16px; }
                        .meta { color: #666; margin-bottom: 32px; }
                        .content { line-height: 1.6; }
                        .attachments { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
                        .attachment { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9f9f9; border-radius: 4px; margin-bottom: 8px; }
                    </style>
                </head>
                <body>
                    <div class="title">${announcement.title}</div>
                    <div class="meta">Posted: ${formatDateTime(announcement.created_at)}</div>
                    <div class="content">${announcement.content}</div>
                    ${announcement.attachments && announcement.attachments.length > 0 ? `
                        <div class="attachments">
                            <h3>Attachments (${announcement.attachments.length})</h3>
                            ${announcement.attachments.map(att => `
                                <div class="attachment">
                                    <span>📎</span>
                                    <span>${att.original_name} (${att.formatted_size})</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    // Filter attachments by type
    const imageAttachments = announcement.attachments?.filter(a => a.is_image) || [];
    const documentAttachments = announcement.attachments?.filter(a => !a.is_image) || [];

    // Tabs configuration
    const tabsConfig = [
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'attachments', label: 'Attachments', icon: Paperclip },
        { id: 'related', label: 'Related', icon: Layers },
    ];

    const [activeTab, setActiveTab] = useState('details');

    const getTabCount = (tabId: string) => {
        switch (tabId) {
            case 'attachments':
                return announcement.attachments?.length || 0;
            case 'related':
                return relatedAnnouncements.length;
            default:
                return 0;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'Announcements', href: '/portal/resident-announcements' },
                { title: announcement.title, href: '#' }
            ]}
        >
            <Head title={`${announcement.title} | Barangay Announcements`} />

            <div ref={scrollContainerRef} className="space-y-3 md:space-y-6 px-4 md:px-6 pb-32 md:pb-6">
                {/* Mobile Header */}
                {isMobile && (
                    <div ref={headerRef}>
                        <ModernMobileHeader
                            title={announcement.title}
                            subtitle="Announcement"
                            onBack={() => router.get('/portal/resident-announcements')}
                            showSticky={showStickyActions}
                            actions={
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={handlePrint}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleShare}>
                                            {isShareCopied ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2 text-green-600" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleBookmark}>
                                            <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                                            {isBookmarked ? 'Saved' : 'Save'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLike}>
                                            <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                                            Helpful
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            }
                        />
                    </div>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/portal/resident-announcements">
                                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    {announcement.title}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Posted {formatRelativeTime(announcement.created_at)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-xl"
                                onClick={handleLike}
                            >
                                <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current text-blue-600' : ''}`} />
                                Helpful
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-xl"
                                onClick={handlePrint}
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-xl"
                                onClick={handleShare}
                            >
                                {isShareCopied ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </>
                                )}
                            </Button>
                            <Button
                                variant={isBookmarked ? "default" : "outline"}
                                size="sm"
                                className="gap-2 rounded-xl"
                                onClick={handleBookmark}
                            >
                                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                {isBookmarked ? 'Saved' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Priority Alert Banner */}
                {announcement.priority >= 3 && (
                    <Alert className={cn(
                        "border-0 rounded-xl shadow-lg",
                        announcement.priority === 4
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : "bg-gradient-to-r from-orange-500 to-orange-600"
                    )}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                    {announcement.priority === 4 ? (
                                        <Shield className="h-5 w-5 text-white" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-white" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <AlertTitle className="text-white font-bold">
                                    {announcement.priority === 4 ? '🚨 URGENT ANNOUNCEMENT' : '⚠️ HIGH PRIORITY NOTICE'}
                                </AlertTitle>
                                <AlertDescription className="text-white/90 text-sm mt-1">
                                    {announcement.priority === 4
                                        ? 'Immediate action required. Please read this announcement carefully.'
                                        : 'Important information that requires your attention.'}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Main Content */}
                <div className={cn(
                    "grid gap-3 md:gap-6",
                    isMobile ? "grid-cols-1" : "lg:grid-cols-3"
                )}>
                    {/* Left Column */}
                    <div className={cn(
                        isMobile ? "col-span-1" : "lg:col-span-2"
                    )}>
                        <ModernTabs
                            tabs={tabsConfig}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            getTabCount={getTabCount}
                            className="mb-3"
                        />

                        <div className="mt-3 space-y-3">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <>
                                    {/* Personalized Audience Badge */}
                                    {announcement.audience_type !== 'all' && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <Target className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-purple-900 mb-1">Personalized for You</h3>
                                                    <p className="text-sm text-purple-700">{announcement.audience_summary}</p>
                                                    {announcement.estimated_reach && (
                                                        <p className="text-xs text-purple-600 mt-2">
                                                            Target audience: {announcement.estimated_reach.toLocaleString()} residents
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isMobile ? (
                                        // Mobile Expandable Sections
                                        <>
                                            <ModernExpandableSection
                                                title="Announcement Details"
                                                icon={
                                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r ${typeConfig.gradient} flex items-center justify-center">
                                                        <TypeIcon className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                }
                                                isExpanded={expandedSections.announcementInfo}
                                                onToggle={() => toggleSection('announcementInfo')}
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className={`${typeConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                                            <TypeIcon className="h-3.5 w-3.5" />
                                                            {announcement.type_label}
                                                        </Badge>
                                                        <Badge className={`${priorityConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                                            <PriorityIcon className="h-3.5 w-3.5" />
                                                            {announcement.priority_label}
                                                        </Badge>
                                                        {announcement.has_attachments && (
                                                            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                                                <Paperclip className="h-3.5 w-3.5" />
                                                                {announcement.attachments_count}
                                                            </Badge>
                                                        )}
                                                        <Badge className={cn(
                                                            "gap-1.5 px-3 py-1.5 border rounded-full",
                                                            isExpired ? 'bg-gray-100 text-gray-700' :
                                                                isUpcoming ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-green-100 text-green-700'
                                                        )}>
                                                            {isExpired ? (
                                                                <>
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    Expired
                                                                </>
                                                            ) : isUpcoming ? (
                                                                <>
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    Upcoming
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <BellRing className="h-3.5 w-3.5" />
                                                                    Active
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500">Posted</p>
                                                            <p className="text-xs">{formatRelativeTime(announcement.created_at)}</p>
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500">Views</p>
                                                            <p className="text-xs">{announcement.views_count?.toLocaleString() || 0}</p>
                                                        </div>
                                                    </div>

                                                    {announcement.author && (
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <p className="text-[10px] text-gray-500 mb-1">Author</p>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback className="text-xs bg-gray-200">
                                                                        {announcement.author.name.split(' ').map(n => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-xs font-medium">{announcement.author.name}</p>
                                                                    {announcement.author.role && (
                                                                        <p className="text-[10px] text-gray-500">{announcement.author.role}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(announcement.start_date || announcement.end_date) && (
                                                        <div className="space-y-2">
                                                            {announcement.start_date && (
                                                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                                    <p className="text-[10px] text-gray-500">Starts</p>
                                                                    <p className="text-xs">{formatDate(announcement.start_date)}</p>
                                                                    {announcement.start_time && (
                                                                        <p className="text-[10px] text-gray-500">{announcement.start_time}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {announcement.end_date && (
                                                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                                    <p className="text-[10px] text-gray-500">Ends</p>
                                                                    <p className="text-xs">{formatDate(announcement.end_date)}</p>
                                                                    {announcement.end_time && (
                                                                        <p className="text-[10px] text-gray-500">{announcement.end_time}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </ModernExpandableSection>

                                            <ModernCard title="Content">
                                                <div
                                                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                                                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                                                />
                                            </ModernCard>
                                        </>
                                    ) : (
                                        // Desktop View
                                        <>
                                            <ModernCard
                                                title="Announcement Information"
                                                icon={TypeIcon}
                                                iconColor={typeConfig.gradient}
                                            >
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <Badge className={`${typeConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                                        <TypeIcon className="h-3.5 w-3.5" />
                                                        {announcement.type_label}
                                                    </Badge>
                                                    <Badge className={`${priorityConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                                        <PriorityIcon className="h-3.5 w-3.5" />
                                                        {announcement.priority_label}
                                                    </Badge>
                                                    {announcement.has_attachments && (
                                                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                                            <Paperclip className="h-3.5 w-3.5" />
                                                            {announcement.attachments_count} attachment{announcement.attachments_count !== 1 ? 's' : ''}
                                                        </Badge>
                                                    )}
                                                    <Badge className={cn(
                                                        "gap-1.5 px-3 py-1.5 border rounded-full",
                                                        isExpired ? 'bg-gray-100 text-gray-700' :
                                                            isUpcoming ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                    )}>
                                                        {isExpired ? (
                                                            <>
                                                                <Clock className="h-3.5 w-3.5" />
                                                                Expired
                                                            </>
                                                        ) : isUpcoming ? (
                                                            <>
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                Upcoming
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BellRing className="h-3.5 w-3.5" />
                                                                Active
                                                            </>
                                                        )}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Posted</p>
                                                        <p className="font-medium mt-1">{formatRelativeTime(announcement.created_at)}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500">Views</p>
                                                        <p className="font-medium mt-1">{announcement.views_count?.toLocaleString() || 0}</p>
                                                    </div>
                                                </div>

                                                {announcement.author && (
                                                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                        <p className="text-xs text-gray-500 mb-2">Author</p>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-gray-200">
                                                                    {announcement.author.name.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{announcement.author.name}</p>
                                                                {announcement.author.role && (
                                                                    <p className="text-sm text-gray-500">{announcement.author.role}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {(announcement.start_date || announcement.end_date) && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {announcement.start_date && (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                                <p className="text-xs text-gray-500">Starts</p>
                                                                <p className="font-medium mt-1">{formatDate(announcement.start_date)}</p>
                                                                {announcement.start_time && (
                                                                    <p className="text-sm text-gray-500 mt-1">at {announcement.start_time}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {announcement.end_date && (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                                <p className="text-xs text-gray-500">Ends</p>
                                                                <p className="font-medium mt-1">{formatDate(announcement.end_date)}</p>
                                                                {announcement.end_time && (
                                                                    <p className="text-sm text-gray-500 mt-1">at {announcement.end_time}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </ModernCard>

                                            <ModernCard title="Content">
                                                <div
                                                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                                                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                                                />
                                            </ModernCard>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Attachments Tab */}
                            {activeTab === 'attachments' && (
                                <>
                                    {announcement.attachments && announcement.attachments.length > 0 ? (
                                        <div className="space-y-4">
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
                                                                onView={() => setViewingDocument(attachment)}
                                                                onDownload={() => handleDownloadAttachment(attachment)}
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
                                                                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
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
                                                                                        onClick={() => handleDownloadAttachment(attachment)}
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
                                        </div>
                                    ) : (
                                        <ModernEmptyState
                                            status="empty"
                                            title="No Attachments"
                                            description="This announcement has no attachments"
                                            icon={Inbox}
                                            className="py-12"
                                        />
                                    )}
                                </>
                            )}

                            {/* Related Tab */}
                            {activeTab === 'related' && (
                                <>
                                    {relatedAnnouncements.length > 0 ? (
                                        <ModernCard
                                            title="Related Announcements"
                                            icon={Layers}
                                            iconColor="from-purple-500 to-purple-600"
                                        >
                                            <div className="space-y-3">
                                                {(showAllRelated ? relatedAnnouncements : relatedAnnouncements.slice(0, 5)).map((related) => {
                                                    const relatedTypeConfig = getTypeConfig(related.type);
                                                    const relatedPriorityConfig = getPriorityConfig(related.priority);
                                                    const RelatedPriorityIcon = relatedPriorityConfig.icon;

                                                    return (
                                                        <Link
                                                            key={related.id}
                                                            href={`/portal/resident-announcements/${related.id}`}
                                                            className="block"
                                                        >
                                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                                                <div className="flex gap-3">
                                                                    <div className={`h-10 w-10 rounded-lg ${relatedTypeConfig.color} flex items-center justify-center flex-shrink-0`}>
                                                                        <relatedTypeConfig.icon className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                            <Badge className={`${relatedTypeConfig.color} text-xs px-2 py-0.5 rounded-full`}>
                                                                                {related.type_label}
                                                                            </Badge>
                                                                            <Badge className={`${relatedPriorityConfig.color} text-xs px-2 py-0.5 rounded-full`}>
                                                                                <RelatedPriorityIcon className="h-3 w-3 mr-1" />
                                                                                {related.priority_label}
                                                                            </Badge>
                                                                            {related.has_attachments && (
                                                                                <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                                                                    <Paperclip className="h-3 w-3 mr-1" />
                                                                                    {related.attachments_count}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <h4 className="font-medium text-sm line-clamp-2">
                                                                            {related.title}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {formatRelativeTime(related.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}

                                                {relatedAnnouncements.length > 5 && (
                                                    <div className="text-center mt-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowAllRelated(!showAllRelated)}
                                                            className="gap-2 rounded-lg"
                                                            size="sm"
                                                        >
                                                            {showAllRelated ? 'Show Less' : `Show ${relatedAnnouncements.length - 5} More`}
                                                            {showAllRelated ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </ModernCard>
                                    ) : (
                                        <ModernEmptyState
                                            status="info"
                                            title="No Related Announcements"
                                            description="Check back later for updates"
                                            icon={Inbox}
                                            className="py-12"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Desktop Only */}
                    {!isMobile && (
                        <div className="space-y-4 lg:space-y-6">
                            {/* Quick Actions */}
                            <ModernCard title="Quick Actions">
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={handleShare}
                                    >
                                        {isShareCopied ? (
                                            <>
                                                <Check className="h-4 w-4 text-green-600" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Share2 className="h-4 w-4" />
                                                Share
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={handleBookmark}
                                    >
                                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                        {isBookmarked ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={handleLike}
                                    >
                                        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                        Helpful
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                        onClick={handlePrint}
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </Button>
                                </div>
                            </ModernCard>

                            {/* Resident Information */}
                            {resident && (
                                <ModernCard title="Your Information" icon={User} iconColor="from-blue-500 to-blue-600">
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium mt-1">{resident.full_name}</p>
                                        </div>
                                        {resident.household_number && (
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                <p className="text-xs text-gray-500">Household</p>
                                                <p className="font-medium mt-1">{resident.household_number}</p>
                                            </div>
                                        )}
                                        {resident.purok && (
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                <p className="text-xs text-gray-500">Purok</p>
                                                <p className="font-medium mt-1">{resident.purok}</p>
                                            </div>
                                        )}
                                    </div>
                                </ModernCard>
                            )}

                            {/* Attachments Summary */}
                            {announcement.has_attachments && (
                                <ModernCard title="Attachments" icon={Paperclip} iconColor="from-green-500 to-green-600">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <div className="flex items-center gap-2">
                                                <FileImage className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">Images</span>
                                            </div>
                                            <Badge>{imageAttachments.length}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">Documents</span>
                                            </div>
                                            <Badge>{documentAttachments.length}</Badge>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full mt-2"
                                            onClick={() => setActiveTab('attachments')}
                                        >
                                            View All Attachments
                                        </Button>
                                    </div>
                                </ModernCard>
                            )}

                            {/* Contact Information */}
                            <ModernCard title="Contact Information" icon={MessageSquare} iconColor="from-purple-500 to-purple-600">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Barangay Hall</p>
                                            <p className="text-xs text-gray-500">Mon-Fri, 8AM-5PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Emergency Hotline</p>
                                            <p className="text-xs text-gray-500">(02) 8888-9999</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Email</p>
                                            <p className="text-xs text-gray-500">barangay@example.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Location</p>
                                            <p className="text-xs text-gray-500">Barangay Hall, Main Street</p>
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            {isMobile && showStickyActions && (
                <ModernFloatingActionButton
                    icon={<Share2 className="h-6 w-6 text-white" />}
                    label="Share"
                    onClick={handleShare}
                    color="blue"
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