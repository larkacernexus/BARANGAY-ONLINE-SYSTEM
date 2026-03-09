// pages/admin/Announcements/Show.tsx

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
import { 
    ArrowLeft, 
    Edit, 
    Bell, 
    AlertCircle, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    CalendarDays, 
    Wrench, 
    Tag, 
    Megaphone,
    Users,
    MapPin,
    Home,
    Briefcase,
    UserCircle,
    Globe,
    Copy,
    Trash2,
    Mail,
    Phone,
    MapPinned,
    Paperclip,
    Download,
    Eye,
    FileText,
    FileImage,
    FileSpreadsheet,
    FileArchive,
    File,
    Maximize2,
    Loader2,
    Info
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
    announcement: Announcement;
    audience_details: AudienceDetails;
    types: Record<string, string>;
    priorities: Record<string, string>;
    audience_types: Record<string, string>;
}

export default function AnnouncementsShow({ announcement, audience_details, types, priorities, audience_types }: Props) {
    const [activeTab, setActiveTab] = useState('details');
    const [viewingAttachment, setViewingAttachment] = useState<AnnouncementAttachment | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'important': return <AlertCircle className="h-5 w-5" />;
            case 'event': return <CalendarDays className="h-5 w-5" />;
            case 'maintenance': return <Wrench className="h-5 w-5" />;
            case 'other': return <Tag className="h-5 w-5" />;
            default: return <Megaphone className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string): string => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800';
            case 'event': return 'bg-blue-100 text-blue-800';
            case 'maintenance': return 'bg-amber-100 text-amber-800';
            case 'other': return 'bg-gray-100 text-gray-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getPriorityIcon = (priority: number) => {
        switch (priority) {
            case 4: return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 3: return <Bell className="h-4 w-4 text-orange-500" />;
            case 2: return <Bell className="h-4 w-4 text-yellow-500" />;
            case 1: return <Bell className="h-4 w-4 text-blue-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: number): string => {
        switch (priority) {
            case 4: return 'bg-red-50 text-red-700 border-red-200';
            case 3: return 'bg-orange-50 text-orange-700 border-orange-200';
            case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 1: return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getAudienceIcon = (type: string) => {
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

    const getFileIcon = (attachment: AnnouncementAttachment) => {
        const mimeType = attachment.mime_type;
        const fileName = attachment.file_name;
        
        if (mimeType.includes('image')) return FileImage;
        if (mimeType.includes('pdf')) return FileText;
        if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return FileText;
        if (mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return FileSpreadsheet;
        if (mimeType.includes('zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return FileArchive;
        return File;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleDownload = async (attachment: AnnouncementAttachment) => {
        setIsDownloading(true);
        try {
            const response = await fetch(route('admin.announcements.attachments.download', attachment.id));
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.original_name || attachment.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download file');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;
        
        try {
            await router.delete(route('admin.announcements.attachments.destroy', attachmentId), {
                onSuccess: () => {
                    toast.success('Attachment deleted successfully');
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

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.announcements.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{announcement.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                    variant={announcement.is_active ? "default" : "secondary"}
                                    className="flex items-center gap-1"
                                >
                                    {announcement.is_active ? (
                                        <CheckCircle className="h-3 w-3" />
                                    ) : (
                                        <XCircle className="h-3 w-3" />
                                    )}
                                    {announcement.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {announcement.is_currently_active && (
                                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                        Currently Displayed
                                    </Badge>
                                )}
                                <Badge variant="outline" className={getTypeColor(announcement.type)}>
                                    {getTypeIcon(announcement.type)}
                                    <span className="ml-1">{announcement.type_label}</span>
                                </Badge>
                                {announcement.has_attachments && (
                                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                                        <Paperclip className="h-3 w-3" />
                                        {announcement.attachments_count}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleToggleStatus}>
                            {announcement.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" onClick={handleDuplicate}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                        </Button>
                        <Link href={route('admin.announcements.edit', announcement.id)}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="attachments">
                            Attachments
                            {announcement.attachments_count > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {announcement.attachments_count}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="audience">Audience</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Announcement Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none dark:prose-invert">
                                    <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        {announcement.content}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Announcement Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Type</div>
                                        <Badge 
                                            variant="outline" 
                                            className={`flex items-center gap-2 w-fit ${getTypeColor(announcement.type)}`}
                                        >
                                            {getTypeIcon(announcement.type)}
                                            {announcement.type_label}
                                        </Badge>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Priority</div>
                                        <Badge 
                                            variant="outline" 
                                            className={`flex items-center gap-2 w-fit ${getPriorityColor(announcement.priority)}`}
                                        >
                                            {getPriorityIcon(announcement.priority)}
                                            {announcement.priority_label}
                                        </Badge>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Status</div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Active:</span>
                                                <Badge variant={announcement.is_active ? "default" : "secondary"}>
                                                    {announcement.is_active ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Currently Displayed:</span>
                                                <Badge variant={announcement.is_currently_active ? "default" : "secondary"}>
                                                    {announcement.is_currently_active ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Created By</div>
                                        {announcement.creator ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {announcement.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{announcement.creator.name}</p>
                                                    <p className="text-sm text-gray-500">{announcement.creator.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">System</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Schedule Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Start Date</div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{formatDate(announcement.start_date)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">End Date</div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{formatDate(announcement.end_date)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Date Range</div>
                                        <p className="text-sm">{announcement.formatted_date_range}</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-500">Timeline</div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Created:</span>
                                                <span>{new Date(announcement.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Last Updated:</span>
                                                <span>{new Date(announcement.updated_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Attachments Tab */}
                    <TabsContent value="attachments" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Paperclip className="h-5 w-5" />
                                    Attachments
                                </CardTitle>
                                <CardDescription>
                                    Files attached to this announcement
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {announcement.attachments && announcement.attachments.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Image Attachments */}
                                        {announcement.attachments.filter(a => a.is_image).length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
                                                    <FileImage className="h-4 w-4" />
                                                    Images ({announcement.attachments.filter(a => a.is_image).length})
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {announcement.attachments
                                                        .filter(a => a.is_image)
                                                        .map((attachment) => (
                                                            <div
                                                                key={attachment.id}
                                                                className="group relative rounded-lg overflow-hidden border cursor-pointer aspect-square"
                                                                onClick={() => setViewingAttachment(attachment)}
                                                            >
                                                                <img
                                                                    src={`/storage/${attachment.file_path}`}
                                                                    alt={attachment.original_name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-white hover:text-white"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setViewingAttachment(attachment);
                                                                        }}
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
                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-sm text-gray-500 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Documents ({announcement.attachments.filter(a => !a.is_image).length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {announcement.attachments
                                                        .filter(a => !a.is_image)
                                                        .map((attachment) => {
                                                            const FileIcon = getFileIcon(attachment);
                                                            return (
                                                                <div
                                                                    key={attachment.id}
                                                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                        <FileIcon className="h-6 w-6 text-gray-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium truncate">
                                                                            {attachment.original_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
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
                                                                                        className="h-8 w-8"
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
                                                                                        className="h-8 w-8"
                                                                                        onClick={() => handleDownload(attachment)}
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
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                        onClick={() => handleDeleteAttachment(attachment.id)}
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
                                        <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No attachments for this announcement</p>
                                        <Link href={route('admin.announcements.edit', announcement.id)}>
                                            <Button variant="outline" className="mt-4">
                                                Add Attachments
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audience Tab */}
                    <TabsContent value="audience" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AudienceIcon className="h-5 w-5" />
                                    Audience Targeting
                                </CardTitle>
                                <CardDescription>
                                    Who will see this announcement
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Audience Type</p>
                                        <p className="text-lg font-semibold">{announcement.audience_type_label}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Estimated Reach</p>
                                        <p className="text-lg font-semibold">{announcement.estimated_reach.toLocaleString()} people</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Roles */}
                                {audience_details.roles && audience_details.roles.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-gray-500" />
                                            <h3 className="font-medium">Target Roles ({audience_details.roles.length})</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {audience_details.roles.map((role) => (
                                                <Badge key={role.id} variant="outline" className="justify-start">
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Puroks */}
                                {audience_details.puroks && audience_details.puroks.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-gray-500" />
                                            <h3 className="font-medium">Target Puroks ({audience_details.puroks.length})</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {audience_details.puroks.map((purok) => (
                                                <Badge key={purok.id} variant="outline" className="justify-start">
                                                    {purok.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Households */}
                                {audience_details.households && audience_details.households.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Home className="h-5 w-5 text-gray-500" />
                                            <h3 className="font-medium">
                                                Target {announcement.audience_type === 'household_members' ? 'Households (All Members)' : 'Households'} 
                                                ({audience_details.households.length})
                                            </h3>
                                        </div>
                                        <div className="grid gap-2">
                                            {audience_details.households.map((household) => (
                                                <Card key={household.id}>
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{household.household_number}</p>
                                                                {household.purok && (
                                                                    <p className="text-sm text-gray-500">{household.purok.name}</p>
                                                                )}
                                                            </div>
                                                            <MapPinned className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Businesses */}
                                {audience_details.businesses && audience_details.businesses.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-gray-500" />
                                            <h3 className="font-medium">Target Businesses ({audience_details.businesses.length})</h3>
                                        </div>
                                        <div className="grid gap-2">
                                            {audience_details.businesses.map((business) => (
                                                <Card key={business.id}>
                                                    <CardContent className="p-3">
                                                        <p className="font-medium">{business.business_name}</p>
                                                        {business.owner_name && (
                                                            <p className="text-sm text-gray-500">Owner: {business.owner_name}</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Users */}
                                {audience_details.users && audience_details.users.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <UserCircle className="h-5 w-5 text-gray-500" />
                                            <h3 className="font-medium">Target Users ({audience_details.users.length})</h3>
                                        </div>
                                        <div className="grid gap-2">
                                            {audience_details.users.map((user) => (
                                                <Card key={user.id}>
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {user.first_name} {user.last_name}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <Mail className="h-3 w-3" />
                                                                    {user.email}
                                                                    {user.role && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {user.role.name}
                                                                            </Badge>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* All Users */}
                                {announcement.audience_type === 'all' && (
                                    <div className="text-center py-8">
                                        <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">This announcement is visible to all users</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preview Tab */}
                    <TabsContent value="preview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>
                                    How this announcement appears to targeted users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-6 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)}`}>
                                                {getTypeIcon(announcement.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{announcement.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Posted: {new Date(announcement.created_at).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{announcement.priority_label} Priority</span>
                                                </div>
                                            </div>
                                        </div>
                                        {announcement.is_currently_active && (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                Active
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Audience Badge */}
                                    <div className="mb-3 flex items-center gap-2">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <AudienceIcon className="h-3 w-3" />
                                            {announcement.audience_type_label}
                                        </Badge>
                                        {announcement.has_attachments && (
                                            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                                                <Paperclip className="h-3 w-3" />
                                                {announcement.attachments_count}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                    </div>

                                    {/* Attachments Preview */}
                                    {announcement.attachments && announcement.attachments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Paperclip className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium">Attachments ({announcement.attachments.length})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {announcement.attachments.slice(0, 5).map((attachment) => {
                                                    const FileIcon = getFileIcon(attachment);
                                                    return (
                                                        <div
                                                            key={attachment.id}
                                                            className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full text-xs"
                                                        >
                                                            <FileIcon className="h-3 w-3" />
                                                            <span className="max-w-[100px] truncate">{attachment.original_name}</span>
                                                        </div>
                                                    );
                                                })}
                                                {announcement.attachments.length > 5 && (
                                                    <div className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                        +{announcement.attachments.length - 5} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {announcement.end_date && (
                                        <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>Valid until: {formatDate(announcement.end_date)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={!!viewingAttachment} onOpenChange={() => setViewingAttachment(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{viewingAttachment?.original_name}</DialogTitle>
                        <DialogDescription>
                            {viewingAttachment?.formatted_size} • Uploaded on {viewingAttachment && new Date(viewingAttachment.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingAttachment?.is_image && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={`/storage/${viewingAttachment.file_path}`}
                                alt={viewingAttachment.original_name}
                                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => window.open(`/storage/${viewingAttachment?.file_path}`, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Open in New Tab
                        </Button>
                        <Button onClick={() => viewingAttachment && handleDownload(viewingAttachment)} disabled={isDownloading}>
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
        </AppLayout>
    );
}