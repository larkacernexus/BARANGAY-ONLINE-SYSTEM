// pages/admin/Announcements/Create.tsx

import { useState, useEffect } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AudienceTarget from '@/components/admin/announcements/AudienceTarget';
import { 
    ArrowLeft,
    Save,
    Bell,
    AlertCircle,
    Calendar,
    Clock,
    Megaphone,
    Zap,
    Eye,
    Settings,
    Wrench,
    Tag,
    CalendarClock,
    Users,
    Home,
    MapPin,
    Briefcase,
    UserCog,
    Globe,
    Paperclip,
    X,
    Upload,
    File,
    FileImage,
    FileText,
    FileSpreadsheet,
    FileArchive,
    Loader2,
    Trash2,
    Maximize2,
    Info,
} from 'lucide-react';
import { route } from 'ziggy-js';
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

// Import types from centralized types file
import type {
    AnnouncementType,
    PriorityLevel,
    AudienceType,
    Role,
    Purok,
    Household,
    Business,
    User
} from '@/types/admin/announcements/announcement.types';

// Props interface using imported types
interface CreateAnnouncementProps {
    types: Record<AnnouncementType, string>;
    priorities: Record<PriorityLevel, string>;
    audience_types: Record<AudienceType, string>;
    roles: Role[];
    puroks: Purok[];
    households: Household[];
    businesses: Business[];
    users: User[];
    maxFileSize?: number;
    allowedFileTypes?: string[];
}

// Attachment interface
interface Attachment {
    id?: number;
    file: File;
    preview?: string;
    name: string;
    size: number;
    type: string;
    progress?: number;
    error?: string;
    isUploading?: boolean;
    isImage?: boolean;
}

// Form data interface
interface AnnouncementFormData {
    title: string;
    content: string;
    type: AnnouncementType;
    priority: PriorityLevel;
    is_active: boolean;
    audience_type: AudienceType;
    target_roles: number[];
    target_puroks: number[];
    target_households: number[];
    target_businesses: number[];
    target_users: number[];
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    attachments: File[];
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file icon
const getFileIcon = (file: File | Attachment) => {
    const type = file.type;
    const name = file.name;
    
    if (type.includes('image')) return FileImage;
    if (type.includes('pdf')) return FileText;
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return FileText;
    if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return FileSpreadsheet;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return FileArchive;
    return File;
};

export default function CreateAnnouncement({ 
    types, 
    priorities,
    audience_types,
    roles,
    puroks,
    households,
    businesses,
    users,
    maxFileSize = 10,
    allowedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv']
}: CreateAnnouncementProps) {
    const { flash } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<string>('content');
    const [showStartTime, setShowStartTime] = useState<boolean>(false);
    const [showEndTime, setShowEndTime] = useState<boolean>(false);
    
    // Attachment state
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<Attachment | null>(null);

    // Form state with proper typing
    const { data, setData, post, processing, errors, reset } = useForm<AnnouncementFormData>({
        title: '',
        content: '',
        type: 'general',
        priority: 1,
        is_active: true,
        audience_type: 'all',
        target_roles: [],
        target_puroks: [],
        target_households: [],
        target_businesses: [],
        target_users: [],
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        attachments: [],
    });

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Auto-set end date to 30 days from start date
    useEffect(() => {
        if (data.start_date && !data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);
            
            const formattedEndDate = endDate.toISOString().split('T')[0];
            setData('end_date', formattedEndDate);
        }
    }, [data.start_date, setData]);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            if (attachments.length > 0) {
                attachments.forEach(att => {
                    if (att?.preview) {
                        URL.revokeObjectURL(att.preview);
                    }
                });
            }
        };
    }, [attachments]);

    // Validate file before adding
    const validateFile = (file: File): string | null => {
        // Check file size (convert MB to bytes)
        const maxSizeBytes = maxFileSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxFileSize}MB limit`;
        }

        // Check file type if allowed types are specified
        if (allowedFileTypes.length > 0) {
            const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
            const isAllowed = allowedFileTypes.some(type => {
                if (type.includes('/*')) {
                    const mainType = type.split('/')[0];
                    return file.type.startsWith(mainType);
                }
                return type === fileExt || type === file.type;
            });
            
            if (!isAllowed) {
                return `File type not allowed. Allowed: ${allowedFileTypes.join(', ')}`;
            }
        }

        return null;
    };

    // Handle file selection
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newAttachments: Attachment[] = [];
        const newFiles: File[] = [];

        Array.from(files).forEach(file => {
            // Check for duplicates
            if (attachments.some(att => att.name === file.name && att.size === file.size)) {
                toast.error(`${file.name} is already added`);
                return;
            }

            const error = validateFile(file);
            
            const attachment: Attachment = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                isImage: file.type.startsWith('image/'),
                error: error || undefined
            };

            if (file.type.startsWith('image/')) {
                attachment.preview = URL.createObjectURL(file);
            }

            if (!error) {
                newFiles.push(file);
            }

            newAttachments.push(attachment);
        });

        setAttachments([...attachments, ...newAttachments]);
        setData('attachments', [...data.attachments, ...newFiles]);
    };

    // Handle file drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Handle drag events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        // Clean up preview URL if exists
        if (attachments[index]?.preview) {
            URL.revokeObjectURL(attachments[index].preview!);
        }
        
        // Update attachments state
        setAttachments(prev => prev.filter((_, i) => i !== index));
        
        // Update form data - use direct assignment instead of updater function
        const updatedAttachments = data.attachments.filter((_, i) => i !== index);
        setData('attachments', updatedAttachments);
    };

    // Clear all attachments
    const clearAttachments = () => {
        // Clean up all preview URLs
        attachments.forEach(att => {
            if (att?.preview) {
                URL.revokeObjectURL(att.preview);
            }
        });
        setAttachments([]);
        setData('attachments', []);
    };

    // Validate form before submit
    const validateForm = (): boolean => {
        if (!data.title.trim()) {
            toast.error('Title is required');
            setActiveTab('content');
            return false;
        }
        if (!data.content.trim()) {
            toast.error('Content is required');
            setActiveTab('content');
            return false;
        }
        
        // Check for attachment errors
        const hasErrors = attachments.some(att => att.error);
        if (hasErrors) {
            toast.error('Please fix attachment errors before publishing');
            setActiveTab('attachments');
            return false;
        }

        // Validate audience selections
        switch (data.audience_type) {
            case 'roles':
                if (data.target_roles.length === 0) {
                    toast.error('Please select at least one role');
                    setActiveTab('audience');
                    return false;
                }
                break;
            case 'puroks':
                if (data.target_puroks.length === 0) {
                    toast.error('Please select at least one purok');
                    setActiveTab('audience');
                    return false;
                }
                break;
            case 'households':
            case 'household_members':
                if (data.target_households.length === 0) {
                    toast.error('Please select at least one household');
                    setActiveTab('audience');
                    return false;
                }
                break;
            case 'businesses':
                if (data.target_businesses.length === 0) {
                    toast.error('Please select at least one business');
                    setActiveTab('audience');
                    return false;
                }
                break;
            case 'specific_users':
                if (data.target_users.length === 0) {
                    toast.error('Please select at least one user');
                    setActiveTab('audience');
                    return false;
                }
                break;
        }
        
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Prepare FormData for submission with files
        const formData = new FormData();
        
        // Add all form fields
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('type', data.type);
        formData.append('priority', data.priority.toString());
        formData.append('is_active', data.is_active.toString());
        formData.append('audience_type', data.audience_type);
        
        // Add array fields
        if (data.target_roles.length > 0) {
            data.target_roles.forEach(id => formData.append('target_roles[]', id.toString()));
        }
        
        if (data.target_puroks.length > 0) {
            data.target_puroks.forEach(id => formData.append('target_puroks[]', id.toString()));
        }
        
        if (data.target_households.length > 0) {
            data.target_households.forEach(id => formData.append('target_households[]', id.toString()));
        }
        
        if (data.target_businesses.length > 0) {
            data.target_businesses.forEach(id => formData.append('target_businesses[]', id.toString()));
        }
        
        if (data.target_users.length > 0) {
            data.target_users.forEach(id => formData.append('target_users[]', id.toString()));
        }
        
        // Add dates
        if (data.start_date) formData.append('start_date', data.start_date);
        if (showStartTime && data.start_time) formData.append('start_time', data.start_time);
        if (data.end_date) formData.append('end_date', data.end_date);
        if (showEndTime && data.end_time) formData.append('end_time', data.end_time);
        
        // Add attachments
        data.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        // Submit using FormData
        post(route('admin.announcements.store'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearAttachments();
                setShowStartTime(false);
                setShowEndTime(false);
                setActiveTab('content');
                toast.success('Announcement created successfully');
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Please check the form for errors');
            }
        });
    };

    const handleAutoFillDate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!data.start_date) {
            const today = new Date().toISOString().split('T')[0];
            setData('start_date', today);
        }
        
        if (!data.end_date) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            const formattedEndDate = endDate.toISOString().split('T')[0];
            setData('end_date', formattedEndDate);
        }
        
        if (showStartTime && !data.start_time) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setData('start_time', `${hours}:${minutes}`);
        }
        
        toast.success('Dates auto-filled');
    };

    const clearForm = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        reset();
        clearAttachments();
        setShowStartTime(false);
        setShowEndTime(false);
        setActiveTab('content');
        toast.info('Form cleared');
    };

    const handleToggleTime = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setShowStartTime(!showStartTime);
        setShowEndTime(!showEndTime);
    };

    // Format date and time for preview
    const formatDateTimePreview = (date: string, time: string, showTime: boolean): string => {
        if (!date) return 'Not set';
        
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (showTime && time) {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${formattedDate} at ${displayHour}:${minutes} ${ampm}`;
        }
        
        return formattedDate;
    };

    // Get priority color
    const getPriorityColor = (priority: PriorityLevel): string => {
        switch (priority) {
            case 4: return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 3: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 1: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        }
    };

    // Get type color
    const getTypeColor = (type: AnnouncementType): string => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'event': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'other': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
            default: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        }
    };

    // Get type icon
    const getTypeIcon = (type: AnnouncementType) => {
        switch (type) {
            case 'important': return AlertCircle;
            case 'event': return Calendar;
            case 'maintenance': return Wrench;
            case 'other': return Tag;
            default: return Bell;
        }
    };

    // Get audience icon
    const getAudienceIcon = (type: AudienceType) => {
        switch (type) {
            case 'roles': return Users;
            case 'puroks': return MapPin;
            case 'households': return Home;
            case 'household_members': return Users;
            case 'businesses': return Briefcase;
            case 'specific_users': return UserCog;
            default: return Globe;
        }
    };

    const typeOptions = Object.entries(types).map(([value, label]) => ({ 
        value: value as AnnouncementType, 
        label 
    }));
    
    const priorityOptions = Object.entries(priorities).map(([value, label]) => ({ 
        value: parseInt(value) as PriorityLevel, 
        label 
    }));

    // Safe check for attachments count
    const attachmentsCount = attachments.length;

    return (
        <AppLayout
            title="Create Announcement"
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Announcements', href: route('admin.announcements.index') },
                { title: 'Create', href: route('admin.announcements.create') }
            ]}
        >
            {/* Using div instead of form to prevent accidental submissions */}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.announcements.index')}>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Megaphone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                    Create New Announcement
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Create and publish announcements with attachments and targeted audience
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={processing} 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-700 dark:to-pink-700"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {processing ? 'Publishing...' : 'Publish Announcement'}
                        </Button>
                    </div>
                </div>

                {/* Error Summary */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        {Object.entries(errors).map(([field, error]) => (
                                            <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {error as string}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                        <TabsTrigger value="content" type="button" className="dark:text-gray-400 dark:data-[state=active]:text-white">
                            Content
                        </TabsTrigger>
                        <TabsTrigger value="attachments" type="button" className="dark:text-gray-400 dark:data-[state=active]:text-white">
                            Attachments
                            {attachmentsCount > 0 && (
                                <Badge variant="secondary" className="ml-2 dark:bg-gray-700 dark:text-gray-300">
                                    {attachmentsCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="settings" type="button" className="dark:text-gray-400 dark:data-[state=active]:text-white">
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="audience" type="button" className="dark:text-gray-400 dark:data-[state=active]:text-white">
                            Audience
                        </TabsTrigger>
                    </TabsList>

                    {/* Content Tab */}
                    <TabsContent value="content" className="space-y-6">
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <Megaphone className="h-5 w-5" />
                                    Announcement Content
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    What residents will see
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="dark:text-gray-300">Title <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="title" 
                                        placeholder="e.g., Important: Water Service Interruption" 
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="text-lg font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        maxLength={255}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Make the title clear and attention-grabbing. {data.title.length}/255 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content" className="dark:text-gray-300">Content <span className="text-red-500">*</span></Label>
                                    <Textarea 
                                        id="content" 
                                        placeholder="Enter the full announcement details here..."
                                        rows={8}
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="min-h-[200px] font-mono dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                                    )}
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Supports plain text. Keep it clear and concise.</span>
                                        <span>{data.content.length} characters</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Attachments Tab */}
                    <TabsContent value="attachments" className="space-y-6">
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <Paperclip className="h-5 w-5" />
                                    Attachments (Optional)
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Upload files, images, or documents to support your announcement
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Upload Area */}
                                <div
                                    className={`
                                        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                                        ${isDragging 
                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
                                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                                        }
                                    `}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                        accept={allowedFileTypes.join(',')}
                                    />
                                    
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="font-semibold text-lg dark:text-gray-100">
                                            Drop files here or click to upload
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                                            Drag and drop your files here, or click to browse
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">Max size: {maxFileSize}MB</span>
                                            {allowedFileTypes.slice(0, 3).map((type, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">{type}</span>
                                            ))}
                                            {allowedFileTypes.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">+{allowedFileTypes.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* File List */}
                                {attachments.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold dark:text-gray-100">
                                                Selected Files ({attachments.length})
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAttachments}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Clear All
                                            </Button>
                                        </div>

                                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                            {attachments.map((attachment, index) => {
                                                if (!attachment) return null;
                                                
                                                const FileIcon = getFileIcon(attachment);
                                                
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`
                                                            flex items-center gap-3 p-3 border rounded-lg
                                                            ${attachment.error 
                                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                                                            }
                                                            transition-colors
                                                        `}
                                                    >
                                                        {/* Thumbnail for images */}
                                                        {attachment.isImage && attachment.preview ? (
                                                            <div className="relative group flex-shrink-0">
                                                                <img
                                                                    src={attachment.preview}
                                                                    alt={attachment.name}
                                                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPreviewImage(attachment);
                                                                    }}
                                                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Maximize2 className="h-4 w-4 text-white" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                                                <FileIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                            </div>
                                                        )}

                                                        {/* File Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-sm truncate dark:text-gray-100">
                                                                    {attachment.name}
                                                                </p>
                                                                {attachment.error && (
                                                                    <Badge variant="destructive" className="text-xs flex-shrink-0 dark:bg-red-900/30 dark:text-red-400">
                                                                        Error
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{formatFileSize(attachment.size)}</span>
                                                                <span>•</span>
                                                                <span className="truncate">
                                                                    {attachment.type || 'Unknown type'}
                                                                </span>
                                                            </div>
                                                            {attachment.error && (
                                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                                    {attachment.error}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            {attachment.isImage && attachment.preview && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setPreviewImage(attachment);
                                                                                }}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Preview</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                removeAttachment(index);
                                                                            }}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Remove</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Tips */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        Tips for attachments
                                    </h4>
                                    <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                                        <li>• Upload images to make announcements more visual</li>
                                        <li>• Include PDF forms or documents residents might need</li>
                                        <li>• Keep file sizes under {maxFileSize}MB for faster loading</li>
                                        <li>• Use descriptive filenames (e.g., "meeting-minutes-2024.pdf")</li>
                                        <li>• Attachments are optional - you can publish without them</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <Settings className="h-5 w-5" />
                                    Announcement Settings
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Configure how and when the announcement appears
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="dark:text-gray-300">Type *</Label>
                                        <Select 
                                            value={data.type}
                                            onValueChange={(value: AnnouncementType) => setData('type', value)}
                                        >
                                            <SelectTrigger id="type" className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {typeOptions.map((type) => {
                                                    const IconComponent = getTypeIcon(type.value);
                                                    return (
                                                        <SelectItem key={type.value} value={type.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <IconComponent className="h-4 w-4" />
                                                                {type.label}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="dark:text-gray-300">Priority Level *</Label>
                                        <Select 
                                            value={data.priority.toString()}
                                            onValueChange={(value) => setData('priority', parseInt(value) as PriorityLevel)}
                                        >
                                            <SelectTrigger id="priority" className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {priorityOptions.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(priority.value)}`}>
                                                                {priority.label}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.priority && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.priority}</p>
                                        )}
                                    </div>
                                </div>

                                <Separator className="dark:bg-gray-700" />

                                <div className="space-y-4">
                                    <Label className="dark:text-gray-300">Schedule</Label>
                                    
                                    {/* Start Date & Time */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium dark:text-gray-300">Start Date & Time</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="show-start-time"
                                                    checked={showStartTime}
                                                    onCheckedChange={setShowStartTime}
                                                    className="dark:data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor="show-start-time" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                                                    Add specific time
                                                </Label>
                                            </div>
                                        </div>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Input 
                                                    id="start_date" 
                                                    type="date" 
                                                    value={data.start_date}
                                                    onChange={(e) => setData('start_date', e.target.value)}
                                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Leave empty to start immediately
                                                </p>
                                            </div>
                                            
                                            {showStartTime && (
                                                <div className="space-y-2">
                                                    <Input 
                                                        id="start_time" 
                                                        type="time" 
                                                        value={data.start_time}
                                                        onChange={(e) => setData('start_time', e.target.value)}
                                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* End Date & Time */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium dark:text-gray-300">End Date & Time</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="show-end-time"
                                                    checked={showEndTime}
                                                    onCheckedChange={setShowEndTime}
                                                    className="dark:data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor="show-end-time" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                                                    Add specific time
                                                </Label>
                                            </div>
                                        </div>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Input 
                                                    id="end_date" 
                                                    type="date" 
                                                    value={data.end_date}
                                                    onChange={(e) => setData('end_date', e.target.value)}
                                                    min={data.start_date}
                                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Leave empty for indefinite display
                                                </p>
                                            </div>
                                            
                                            {showEndTime && (
                                                <div className="space-y-2">
                                                    <Input 
                                                        id="end_time" 
                                                        type="time" 
                                                        value={data.end_time}
                                                        onChange={(e) => setData('end_time', e.target.value)}
                                                        disabled={!data.end_date}
                                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleAutoFillDate}
                                            className="flex-1 dark:border-gray-600 dark:text-gray-300"
                                        >
                                            <Zap className="h-3 w-3 mr-1" />
                                            Auto-fill Dates
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleToggleTime}
                                            className="flex-1 dark:border-gray-600 dark:text-gray-300"
                                        >
                                            <CalendarClock className="h-3 w-3 mr-1" />
                                            Toggle Time
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="dark:bg-gray-700" />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active" className="dark:text-gray-300">Active Status</Label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Announcement will be visible to residents when active
                                        </p>
                                    </div>
                                    <Switch 
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                        className="dark:data-[state=checked]:bg-green-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audience Tab */}
                    <TabsContent value="audience" className="space-y-6">
                        <AudienceTarget
                            value={{
                                audience_type: data.audience_type,
                                target_roles: data.target_roles,
                                target_puroks: data.target_puroks,
                                target_households: data.target_households,
                                target_businesses: data.target_businesses,
                                target_users: data.target_users,
                            }}
                            onChange={(field, value) => setData(field as any, value)}
                            roles={roles}
                            puroks={puroks}
                            households={households}
                            businesses={businesses}
                            users={users}
                            errors={errors}
                        />
                    </TabsContent>
                </Tabs>

                {/* Live Preview */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Eye className="h-5 w-5" />
                            Live Preview
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            How the announcement will appear to targeted users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg ${getTypeColor(data.type)}`}>
                                        {(() => {
                                            const IconComponent = getTypeIcon(data.type);
                                            return <IconComponent className="h-5 w-5" />;
                                        })()}
                                    </div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-gray-100">
                                        {data.title || "Announcement Title"}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>Posted: {new Date().toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${getPriorityColor(data.priority)}`}>
                                            {priorities[data.priority] || 'Normal'} Priority
                                        </span>
                                    </div>
                                </div>
                                </div>
                                {data.is_active && (
                                    <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                                        Active
                                    </div>
                                )}
                            </div>

                            {/* Audience Badge */}
                            <div className="mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                    {(() => {
                                        const IconComponent = getAudienceIcon(data.audience_type);
                                        return <IconComponent className="h-3 w-3" />;
                                    })()}
                                    {audience_types[data.audience_type] || 'All Users'}
                                </Badge>
                                {data.audience_type !== 'all' && (
                                    <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                        {data.audience_type === 'roles' && data.target_roles.length} roles selected
                                        {data.audience_type === 'puroks' && data.target_puroks.length} puroks selected
                                        {data.audience_type === 'households' && data.target_households.length} households selected
                                        {data.audience_type === 'household_members' && data.target_households.length} households selected
                                        {data.audience_type === 'businesses' && data.target_businesses.length} businesses selected
                                        {data.audience_type === 'specific_users' && data.target_users.length} users selected
                                    </Badge>
                                )}
                            </div>

                            <div className="border-t dark:border-gray-700 pt-4">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {data.content || "Announcement content will appear here..."}
                                </p>
                            </div>

                            {/* Attachments Preview */}
                            {attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Paperclip className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <span className="text-sm font-medium dark:text-gray-300">Attachments ({attachments.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.slice(0, 5).map((attachment, index) => {
                                            if (!attachment) return null;
                                            const FileIcon = getFileIcon(attachment);
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-xs dark:text-gray-300"
                                                >
                                                    <FileIcon className="h-3 w-3" />
                                                    <span className="max-w-[100px] truncate">{attachment.name}</span>
                                                </div>
                                            );
                                        })}
                                        {attachments.length > 5 && (
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-xs dark:text-gray-300">
                                                +{attachments.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(data.start_date || data.end_date) && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {data.start_date && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <div className="font-medium dark:text-gray-300">Starts</div>
                                                    <div className="text-gray-500 dark:text-gray-400">
                                                        {formatDateTimePreview(data.start_date, data.start_time, showStartTime)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {data.end_date && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <div className="font-medium dark:text-gray-300">Ends</div>
                                                    <div className="text-gray-500 dark:text-gray-400">
                                                        {formatDateTimePreview(data.end_date, data.end_time, showEndTime)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                    <div>
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={clearForm}
                            className="dark:text-gray-400 dark:hover:text-white"
                        >
                            Clear Form
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.announcements.index')}>
                            <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                Cancel
                            </Button>
                        </Link>
                        <Button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={processing} 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:from-purple-700 dark:to-pink-700"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {processing ? 'Publishing...' : 'Publish Announcement'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">{previewImage?.name || 'Image Preview'}</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            {previewImage && formatFileSize(previewImage.size)}
                        </DialogDescription>
                    </DialogHeader>
                    {previewImage?.preview && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={previewImage.preview}
                                alt={previewImage.name}
                                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}