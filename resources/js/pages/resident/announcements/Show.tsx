import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    FileArchive
} from 'lucide-react';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Type configuration
const TYPE_CONFIG = {
    important: { 
        label: 'Important', 
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: ShieldAlert,
        gradient: 'from-red-50/80 to-white',
        bgColor: 'bg-red-50'
    },
    event: { 
        label: 'Event', 
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: PartyPopper,
        gradient: 'from-green-50/80 to-white',
        bgColor: 'bg-green-50'
    },
    maintenance: { 
        label: 'Maintenance', 
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Wrench,
        gradient: 'from-blue-50/80 to-white',
        bgColor: 'bg-blue-50'
    },
    general: { 
        label: 'General', 
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: Megaphone,
        gradient: 'from-gray-50/80 to-white',
        bgColor: 'bg-gray-50'
    },
    other: { 
        label: 'Other', 
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Bell,
        gradient: 'from-purple-50/80 to-white',
        bgColor: 'bg-purple-50'
    },
};

// Priority configuration
const PRIORITY_CONFIG = {
    0: { label: 'Normal', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Bell },
    1: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Info },
    2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle },
    3: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertTriangle },
    4: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300', icon: Shield },
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
    mime_type: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface RelatedAnnouncement {
    id: number;
    title: string;
    type: string;
    priority: number;
    created_at: string;
    excerpt?: string;
}

interface PageProps {
    announcement: {
        id: number;
        title: string;
        content: string;
        type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
        priority: number;
        is_active: boolean;
        start_date: string | null;
        end_date: string | null;
        created_at: string;
        updated_at: string;
        author?: {
            id: number;
            name: string;
            role?: string;
            avatar?: string;
        };
        attachments?: AnnouncementAttachment[];
        views_count?: number;
    };
    relatedAnnouncements: RelatedAnnouncement[];
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

export default function AnnouncementShow({ announcement, relatedAnnouncements, priorityOptions, types }: PageProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [expandedAttachments, setExpandedAttachments] = useState(false);
    const [showAllRelated, setShowAllRelated] = useState(false);

    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const PriorityIcon = priorityConfig.icon;
    
    // Set client state
    useEffect(() => {
        setIsClient(true);
        // Mark announcement as read
        if (announcement.views_count !== undefined) {
            // You can add analytics tracking here
        }
    }, []);

    // Set document title
    useEffect(() => {
        if (isClient) {
            document.title = `${announcement.title} | Barangay Announcements`;
        }
    }, [announcement.title, isClient]);

    // Format date
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format relative time
    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInHours < 168) { // 7 days
            const days = Math.floor(diffInHours / 24);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return formatDate(dateString);
        }
    };

    // Check if announcement is upcoming
    const isUpcoming = announcement.start_date && new Date(announcement.start_date) > new Date();
    
    // Check if announcement is expired
    const isExpired = announcement.end_date && new Date(announcement.end_date) < new Date();
    
    // Check if announcement is currently active
    const isActive = !isExpired && (!isUpcoming || announcement.start_date === null);

    // Handle download attachment
    const handleDownloadAttachment = async (attachment: AnnouncementAttachment) => {
        if (!isClient) return;
        
        try {
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = `/storage/${attachment.file_path}`;
            link.download = attachment.original_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download attachment. Please try again.');
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
            .catch(err => {
                console.error('Failed to copy:', err);
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
                    console.error('Fallback copy failed:', err);
                }
                document.body.removeChild(textArea);
            });
    };

    // Handle print
    const handlePrint = () => {
        if (!isClient) return;
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${announcement.title}</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        line-height: 1.6; 
                        padding: 20px; 
                        max-width: 800px; 
                        margin: 0 auto;
                        color: #333;
                    }
                    .header { 
                        border-bottom: 3px solid #2c5282; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px; 
                    }
                    .title { 
                        font-size: 24px; 
                        font-weight: bold; 
                        margin-bottom: 10px;
                        color: #2c5282;
                    }
                    .meta { 
                        color: #666; 
                        font-size: 14px; 
                        margin-bottom: 5px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    .meta-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 10px;
                        margin-top: 15px;
                        padding: 15px;
                        background: #f7fafc;
                        border-radius: 8px;
                    }
                    .content { 
                        margin-top: 30px; 
                        font-size: 16px;
                    }
                    .content img {
                        max-width: 100%;
                        height: auto;
                    }
                    .footer { 
                        margin-top: 50px; 
                        padding-top: 20px; 
                        border-top: 1px solid #ccc; 
                        font-size: 12px; 
                        color: #666; 
                        text-align: center; 
                    }
                    @page {
                        margin: 20mm;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">${announcement.title}</div>
                    <div class="meta-container">
                        <div class="meta">
                            📅 Posted: ${formatDateTime(announcement.created_at)}
                        </div>
                        <div class="meta">
                            📋 Type: ${typeConfig.label}
                        </div>
                        <div class="meta">
                            ⚡ Priority: ${priorityConfig.label}
                        </div>
                        ${announcement.author ? `<div class="meta">👤 Author: ${announcement.author.name}</div>` : ''}
                        ${announcement.start_date ? `<div class="meta">🚀 Starts: ${formatDate(announcement.start_date)}</div>` : ''}
                        ${announcement.end_date ? `<div class="meta">⏰ Ends: ${formatDate(announcement.end_date)}</div>` : ''}
                    </div>
                </div>
                <div class="content">
                    ${announcement.content}
                </div>
                <div class="footer">
                    <p>Barangay Announcement System | Printed on ${new Date().toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    <p>For verification, visit: ${window.location.href}</p>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    // Filter attachments by type
    const imageAttachments = announcement.attachments?.filter(a => a.mime_type.includes('image')) || [];
    const documentAttachments = announcement.attachments?.filter(a => !a.mime_type.includes('image')) || [];

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'Announcements', href: '/resident-announcements' },
                { title: announcement.title, href: '#' }
            ]}
        >
            <div className="pb-24 lg:pb-6">
                {/* Mobile Header */}
                <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b pb-3 pt-2 px-4 -mx-4 mb-4 lg:hidden">
                    <div className="flex items-center gap-3">
                        <Link href="/resident-announcements">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold truncate pr-2">
                                Announcement
                            </h1>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleShare}
                        >
                            {isShareCopied ? (
                                <Check className="h-5 w-5 text-green-600" />
                            ) : (
                                <Share2 className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/resident-announcements">
                            <Button variant="ghost" size="sm" className="gap-2 rounded-lg">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Announcements
                            </Button>
                        </Link>
                        <div className="h-4 w-px bg-gray-300" />
                        <div className="text-sm text-gray-500">
                            Last updated: {formatRelativeTime(announcement.updated_at)}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-lg"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-lg"
                            onClick={handleShare}
                        >
                            {isShareCopied ? (
                                <>
                                    <Check className="h-4 w-4" />
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
                            className="gap-2 rounded-lg"
                            onClick={() => setIsBookmarked(!isBookmarked)}
                        >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            {isBookmarked ? 'Saved' : 'Save'}
                        </Button>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="space-y-6">
                    {/* Improved Priority Alert Banner */}
                    {announcement.priority >= 3 && (
                        <div className={`rounded-xl p-4 mb-4 ${announcement.priority === 4 ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500'}`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {announcement.priority === 4 ? (
                                        <div className="h-10 w-10 rounded-full bg-white border-2 border-red-200 flex items-center justify-center shadow-sm">
                                            <Shield className="h-5 w-5 text-red-600" />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center shadow-sm">
                                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-gray-900">
                                            {announcement.priority === 4 ? 'Urgent Announcement' : 'High Priority Notice'}
                                        </h3>
                                        <Badge variant={announcement.priority === 4 ? "destructive" : "secondary"} className="text-xs">
                                            {announcement.priority === 4 ? 'URGENT' : 'HIGH'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">
                                        {announcement.priority === 4 
                                            ? '🚨 Immediate action required. This announcement contains critical information that needs your urgent attention.'
                                            : '⚠️ Please review carefully. This announcement contains important information that requires your attention.'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            <span>Read carefully</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{announcement.priority === 4 ? 'Action needed ASAP' : 'Review promptly'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Share2 className="h-3 w-3" />
                                            <span>Share if relevant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Announcement Header Card */}
                    <Card className={`border-0 shadow-lg rounded-2xl overflow-hidden ${typeConfig.bgColor}`}>
                        <div className={`p-6 ${typeConfig.gradient} bg-gradient-to-br`}>
                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className={`${typeConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                    <typeConfig.icon className="h-3.5 w-3.5" />
                                    {typeConfig.label}
                                </Badge>
                                <Badge className={`${priorityConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                    <PriorityIcon className="h-3.5 w-3.5" />
                                    {priorityConfig.label}
                                </Badge>
                                <Badge className={`gap-1.5 px-3 py-1.5 border rounded-full ${
                                    isExpired ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                    isUpcoming ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                    'bg-green-100 text-green-700 border-green-300'
                                }`}>
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

                            {/* Title */}
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {announcement.title}
                            </h1>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Posted {formatRelativeTime(announcement.created_at)}</span>
                                </div>
                                
                                {announcement.author && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200">
                                            <User className="h-3 w-3 text-gray-600" />
                                        </div>
                                        <span>By {announcement.author.name}</span>
                                        {announcement.author.role && (
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                {announcement.author.role}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {announcement.views_count !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        <span>{announcement.views_count.toLocaleString()} views</span>
                                    </div>
                                )}
                            </div>

                            {/* Validity Period */}
                            {(announcement.start_date || announcement.end_date) && (
                                <div className="mt-6 p-4 bg-white/60 rounded-xl border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock4 className="h-5 w-5 text-gray-600" />
                                        <span className="font-bold text-gray-700">Validity Period</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {announcement.start_date && (
                                            <div className="bg-white p-3 rounded-lg border">
                                                <div className="text-xs text-gray-500 mb-1">Starts</div>
                                                <div className="font-semibold text-gray-900">{formatDate(announcement.start_date)}</div>
                                            </div>
                                        )}
                                        {announcement.end_date && (
                                            <div className="bg-white p-3 rounded-lg border">
                                                <div className="text-xs text-gray-500 mb-1">Ends</div>
                                                <div className="font-semibold text-gray-900">{formatDate(announcement.end_date)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Content Section */}
                    <Card className="border shadow-lg rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-6 lg:p-8">
                                <div 
                                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-800"
                                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attachments Section */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="space-y-4">
                            {/* Image Attachments */}
                            {imageAttachments.length > 0 && (
                                <Card className="border rounded-2xl overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2">
                                            <FileImage className="h-5 w-5" />
                                            Photos ({imageAttachments.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {imageAttachments.map((attachment) => (
                                                <div 
                                                    key={attachment.id}
                                                    className="group relative rounded-lg overflow-hidden border cursor-pointer"
                                                    onClick={() => window.open(`/storage/${attachment.file_path}`, '_blank')}
                                                >
                                                    <img
                                                        src={`/storage/${attachment.file_path}`}
                                                        alt={attachment.original_name}
                                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                                        <p className="text-xs text-white truncate">
                                                            {attachment.original_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Document Attachments */}
                            {documentAttachments.length > 0 && (
                                <Card className="border rounded-2xl overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Paperclip className="h-5 w-5" />
                                                Documents ({documentAttachments.length})
                                            </CardTitle>
                                            {documentAttachments.length > 3 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedAttachments(!expandedAttachments)}
                                                    className="gap-1"
                                                >
                                                    {expandedAttachments ? (
                                                        <>
                                                            <ChevronUp className="h-4 w-4" />
                                                            Show Less
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-4 w-4" />
                                                            Show All
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {documentAttachments
                                                .slice(0, expandedAttachments ? documentAttachments.length : 3)
                                                .map((attachment) => {
                                                    const FileIcon = getFileIcon(attachment.mime_type, attachment.file_name);
                                                    
                                                    return (
                                                        <div 
                                                            key={attachment.id}
                                                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                                                        >
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                <FileIcon className="h-6 w-6 text-gray-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium truncate text-sm">
                                                                    {attachment.original_name}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <span>{formatFileSize(attachment.file_size)}</span>
                                                                    <span>•</span>
                                                                    <span className="truncate">{attachment.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                                    {attachment.description && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-gray-400">{attachment.description}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => window.open(`/storage/${attachment.file_path}`, '_blank')}
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleDownloadAttachment(attachment)}
                                                                    title="Download"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Quick Actions Card - Mobile */}
                    <div className="lg:hidden">
                        <Card className="border rounded-2xl">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-4 gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-col gap-1 h-auto py-3 rounded-lg"
                                        onClick={handleShare}
                                    >
                                        {isShareCopied ? (
                                            <Check className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Share2 className="h-5 w-5" />
                                        )}
                                        <span className="text-xs font-medium">
                                            {isShareCopied ? 'Copied' : 'Share'}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-col gap-1 h-auto py-3 rounded-lg"
                                        onClick={() => setIsBookmarked(!isBookmarked)}
                                    >
                                        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current text-blue-600' : ''}`} />
                                        <span className="text-xs font-medium">
                                            {isBookmarked ? 'Saved' : 'Save'}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-col gap-1 h-auto py-3 rounded-lg"
                                        onClick={handlePrint}
                                    >
                                        <Printer className="h-5 w-5" />
                                        <span className="text-xs font-medium">Print</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-col gap-1 h-auto py-3 rounded-lg"
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    >
                                        <ArrowLeft className="h-5 w-5 rotate-90" />
                                        <span className="text-xs font-medium">Top</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Related Announcements */}
                    {relatedAnnouncements.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Related Announcements</h2>
                                    <p className="text-sm text-gray-500 mt-1">You might also be interested in these</p>
                                </div>
                                <Link href="/resident-announcements">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(showAllRelated ? relatedAnnouncements : relatedAnnouncements.slice(0, 4)).map((related) => {
                                    const relatedTypeConfig = getTypeConfig(related.type);
                                    const relatedPriorityConfig = getPriorityConfig(related.priority);
                                    const RelatedPriorityIcon = relatedPriorityConfig.icon;
                                    
                                    return (
                                        <Link 
                                            key={related.id} 
                                            href={`/resident-announcements/${related.id}`}
                                            className="block"
                                        >
                                            <Card className="h-full border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                                <CardContent className="p-4">
                                                    <div className="flex gap-3">
                                                        <div className={`h-12 w-12 rounded-lg ${relatedTypeConfig.color} flex items-center justify-center flex-shrink-0`}>
                                                            <relatedTypeConfig.icon className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className={`${relatedTypeConfig.color} text-xs px-2 py-0.5 rounded-full`}>
                                                                    {relatedTypeConfig.label}
                                                                </Badge>
                                                                <Badge className={`${relatedPriorityConfig.color} text-xs px-2 py-0.5 rounded-full`}>
                                                                    <RelatedPriorityIcon className="h-3 w-3 mr-1" />
                                                                    {relatedPriorityConfig.label}
                                                                </Badge>
                                                            </div>
                                                            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1">
                                                                {related.title}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">
                                                                {formatRelativeTime(related.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                            
                            {relatedAnnouncements.length > 4 && (
                                <div className="text-center mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAllRelated(!showAllRelated)}
                                        className="gap-2"
                                    >
                                        {showAllRelated ? 'Show Less' : `Show ${relatedAnnouncements.length - 4} More`}
                                        {showAllRelated ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Section */}
                    <Card className="border rounded-2xl mt-8 bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                <span>Need Help or Have Questions?</span>
                            </CardTitle>
                            <CardDescription>
                                Contact our barangay office for any clarifications or assistance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Building className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Office Hours</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Monday - Friday
                                        <br />
                                        8:00 AM - 5:00 PM
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Emergency Hotline</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        (02) 8888-9999
                                        <br />
                                        0917-123-4567 (Globe)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Mail className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Email</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        barangay@example.com
                                        <br />
                                        support@barangay.ph
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Location</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Barangay Hall
                                        <br />
                                        123 Main Street, City
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center">
                                    For urgent matters outside office hours, please use the emergency hotline.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Floating Share Button (Mobile) */}
                <div className="lg:hidden fixed bottom-20 right-4 z-40">
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700"
                        onClick={handleShare}
                    >
                        {isShareCopied ? (
                            <Check className="h-6 w-6 text-white" />
                        ) : (
                            <Share2 className="h-6 w-6 text-white" />
                        )}
                    </Button>
                </div>

                {/* Mobile Footer */}
                <div className="lg:hidden">
                    <ResidentMobileFooter />
                </div>
            </div>
        </ResidentLayout>
    );
}