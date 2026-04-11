// pages/admin/Announcements/Edit.tsx

import { useState, useEffect, useCallback } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
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
import AudienceTarget from '@/components/admin/announcements/AudienceTarget';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    ArrowLeft,
    Save,
    Bell,
    AlertCircle,
    Calendar,
    Clock,
    Megaphone,
    Eye,
    Settings,
    Wrench,
    Tag,
    CalendarClock,
    Users,
    MapPin,
    Home,
    Briefcase,
    UserCog,
    Globe,
    Trash2,
    Copy,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { route } from 'ziggy-js';

// Import types from centralized types file
import type {
    AnnouncementType,
    PriorityLevel,
    AudienceType,
    Role,
    Purok,
    Household,
    Business,
    User,
    Announcement
} from '@/types/admin/announcements/announcement.types';

// Extend Announcement type for edit page specific fields
interface EditAnnouncement extends Announcement {
    start_time: string | null;
    end_time: string | null;
}

// Flash message interface
interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

// Props interface using imported types
interface EditAnnouncementProps {
    announcement: EditAnnouncement;
    types: Record<AnnouncementType, string>;
    priorities: Record<PriorityLevel, string>;
    audience_types: Record<AudienceType, string>;
    roles: Role[];
    puroks: Purok[];
    households: Household[];
    businesses: Business[];
    users: User[];
}

// Form data interface
interface FormData {
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
}

export default function EditAnnouncement({ 
    announcement,
    types, 
    priorities,
    audience_types,
    roles,
    puroks,
    households,
    businesses,
    users
}: EditAnnouncementProps) {
    const { flash } = usePage().props as unknown as { flash: FlashMessage };
    const [activeTab, setActiveTab] = useState<string>('content');
    const [showStartTime, setShowStartTime] = useState<boolean>(!!announcement.start_time);
    const [showEndTime, setShowEndTime] = useState<boolean>(!!announcement.end_time);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type as AnnouncementType,
        priority: announcement.priority as PriorityLevel,
        is_active: announcement.is_active,
        audience_type: announcement.audience_type as AudienceType,
        target_roles: announcement.target_roles || [],
        target_puroks: announcement.target_puroks || [],
        target_households: announcement.target_households || [],
        target_businesses: announcement.target_businesses || [],
        target_users: announcement.target_users || [],
        start_date: announcement.start_date || '',
        start_time: announcement.start_time || '',
        end_date: announcement.end_date || '',
        end_time: announcement.end_time || '',
    });

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    // Auto-set end date if not set
    useEffect(() => {
        if (data.start_date && !data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);
            
            const formattedEndDate = endDate.toISOString().split('T')[0];
            setData('end_date', formattedEndDate);
            
            toast.info('End date auto-set to 30 days from start date');
        }
    }, [data.start_date, setData]);

    // Validate end date is after start date
    useEffect(() => {
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            
            if (end < start) {
                toast.error('End date cannot be before start date');
                setData('end_date', data.start_date);
            }
        }
    }, [data.start_date, data.end_date, setData]);

    const validateForm = useCallback((): boolean => {
        if (!data.title.trim()) {
            toast.error('Title is required');
            setActiveTab('content');
            return false;
        }

        if (data.title.length < 3) {
            toast.error('Title must be at least 3 characters');
            setActiveTab('content');
            return false;
        }

        if (!data.content.trim()) {
            toast.error('Content is required');
            setActiveTab('content');
            return false;
        }

        if (data.content.length < 10) {
            toast.error('Content must be at least 10 characters');
            setActiveTab('content');
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

        // Validate dates if provided
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            
            if (end < start) {
                toast.error('End date must be after start date');
                setActiveTab('settings');
                return false;
            }
        }
        
        return true;
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        const submissionData = {
            ...data,
            start_time: showStartTime ? data.start_time : null,
            end_time: showEndTime ? data.end_time : null,
            target_roles: data.target_roles.map(Number),
            target_puroks: data.target_puroks.map(Number),
            target_households: data.target_households.map(Number),
            target_businesses: data.target_businesses.map(Number),
            target_users: data.target_users.map(Number),
        };
        
        try {
            await put(route('admin.announcements.update', announcement.id), {
                data: submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Announcement updated successfully');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);
                    
                    if (errors.title) {
                        setActiveTab('content');
                    } else if (errors.content) {
                        setActiveTab('content');
                    } else if (errors.audience_type || Object.keys(errors).some(key => key.startsWith('target_'))) {
                        setActiveTab('audience');
                    }
                    
                    toast.error('Please check the form for errors');
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    const handleDuplicate = () => {
        setShowDuplicateDialog(true);
    };

    const confirmDuplicate = () => {
        router.post(route('admin.announcements.duplicate', announcement.id), {}, {
            onSuccess: () => {
                toast.success('Announcement duplicated successfully');
                setShowDuplicateDialog(false);
            },
            onError: () => {
                toast.error('Failed to duplicate announcement');
                setShowDuplicateDialog(false);
            }
        });
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.announcements.destroy', announcement.id), {
            onSuccess: () => {
                toast.success('Announcement deleted successfully');
                router.visit(route('admin.announcements.index'));
            },
            onError: () => {
                toast.error('Failed to delete announcement');
                setShowDeleteDialog(false);
            }
        });
    };

    const handleReset = () => {
        if (confirm('Reset all changes to the original values?')) {
            reset();
            setShowStartTime(!!announcement.start_time);
            setShowEndTime(!!announcement.end_time);
            toast.info('Form has been reset');
        }
    };

    const handleToggleTimes = () => {
        setShowStartTime(!showStartTime);
        setShowEndTime(!showEndTime);
        
        if (!showStartTime && !showEndTime) {
            toast.info('Time fields enabled');
        } else if (showStartTime && showEndTime) {
            toast.info('Time fields disabled');
        }
    };

    const formatDateTimePreview = (date: string, time: string, showTime: boolean): string => {
        if (!date) return 'Not set';
        
        try {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (showTime && time) {
                const [hours, minutes] = time.split(':');
                const hour = parseInt(hours, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${formattedDate} at ${displayHour}:${minutes} ${ampm}`;
            }
            
            return formattedDate;
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid date';
        }
    };

    const getPriorityColor = (priority: PriorityLevel): string => {
        switch (priority) {
            case 4: return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
            case 3: return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800';
            case 2: return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800';
            case 1: return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800';
            default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getTypeColor = (type: AnnouncementType): string => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'event': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
            case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
    };

    const getTypeIcon = (type: AnnouncementType) => {
        switch (type) {
            case 'important': return AlertCircle;
            case 'event': return Calendar;
            case 'maintenance': return Wrench;
            case 'other': return Tag;
            default: return Bell;
        }
    };

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

    const getAudienceCount = (): number => {
        switch (data.audience_type) {
            case 'roles': return data.target_roles.length;
            case 'puroks': return data.target_puroks.length;
            case 'households':
            case 'household_members': return data.target_households.length;
            case 'businesses': return data.target_businesses.length;
            case 'specific_users': return data.target_users.length;
            default: return 0;
        }
    };

    const typeOptions = Object.entries(types).map(([value, label]) => ({ 
        value: value as AnnouncementType, 
        label 
    }));
    
    const priorityOptions = Object.entries(priorities).map(([value, label]) => ({ 
        value: parseInt(value, 10) as PriorityLevel, 
        label 
    }));

    const isProcessing = processing || isSubmitting;

    return (
        <>
            <AppLayout
                title={`Edit: ${announcement.title}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: route('admin.dashboard') },
                    { title: 'Announcements', href: route('admin.announcements.index') },
                    { title: announcement.title, href: route('admin.announcements.show', announcement.id) },
                    { title: 'Edit', href: route('admin.announcements.edit', announcement.id) }
                ]}
            >
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.announcements.show', announcement.id)}>
                                <Button variant="ghost" size="sm" type="button" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight dark:text-white">Edit Announcement</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update announcement details and audience targeting
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleDuplicate}
                                disabled={isProcessing}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </Button>
                            <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={handleDelete}
                                disabled={isProcessing}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isProcessing}
                                className="bg-blue-600 hover:bg-blue-700 min-w-[140px] dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-950 dark:border-red-800 dark:text-red-400">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="font-bold">Please fix the following errors:</p>
                            </div>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field} className="text-sm">
                                        <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                                        {error as string}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Unsaved Changes Warning */}
                    {!isProcessing && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400">
                            <p>You have unsaved changes. Don't forget to save your updates.</p>
                        </div>
                    )}

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid grid-cols-3 w-full max-w-md">
                            <TabsTrigger value="content" type="button">Content</TabsTrigger>
                            <TabsTrigger value="settings" type="button">Settings</TabsTrigger>
                            <TabsTrigger value="audience" type="button">Audience</TabsTrigger>
                        </TabsList>

                        {/* Content Tab */}
                        <TabsContent value="content" className="space-y-6">
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Megaphone className="h-5 w-5" />
                                        Announcement Content
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        What residents will see when viewing this announcement
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="dark:text-gray-300">
                                            Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="title" 
                                            placeholder="e.g., Important: Water Service Interruption" 
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className={`text-lg font-medium ${errors.title ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                            maxLength={255}
                                            disabled={isProcessing}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Make the title clear and attention-grabbing
                                            </span>
                                            <span className={data.title.length > 200 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}>
                                                {data.title.length}/255 characters
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="dark:text-gray-300">
                                            Content <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea 
                                            id="content" 
                                            placeholder="Enter the full announcement details here..."
                                            rows={8}
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            className={`min-h-[200px] font-mono ${errors.content ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                            disabled={isProcessing}
                                        />
                                        {errors.content && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Supports plain text. Keep it clear and concise.
                                            </span>
                                            <span className={data.content.length > 1000 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}>
                                                {data.content.length} characters
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-6">
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Settings className="h-5 w-5" />
                                        Announcement Settings
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Configure how and when the announcement appears to users
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="dark:text-gray-300">
                                                Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select 
                                                value={data.type}
                                                onValueChange={(value: AnnouncementType) => setData('type', value)}
                                                disabled={isProcessing}
                                            >
                                                <SelectTrigger id="type" className={`${errors.type ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {typeOptions.map((type) => {
                                                        const IconComponent = getTypeIcon(type.value);
                                                        return (
                                                            <SelectItem key={type.value} value={type.value} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
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
                                            <Label htmlFor="priority" className="dark:text-gray-300">
                                                Priority Level <span className="text-red-500">*</span>
                                            </Label>
                                            <Select 
                                                value={data.priority.toString()}
                                                onValueChange={(value) => setData('priority', parseInt(value, 10) as PriorityLevel)}
                                                disabled={isProcessing}
                                            >
                                                <SelectTrigger id="priority" className={`${errors.priority ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {priorityOptions.map((priority) => (
                                                        <SelectItem key={priority.value} value={priority.value.toString()} className="dark:text-white dark:focus:bg-gray-700 dark:hover:bg-gray-700">
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
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-medium dark:text-gray-300">Schedule Settings</Label>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={handleToggleTimes}
                                                disabled={isProcessing}
                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                            >
                                                <CalendarClock className="h-4 w-4 mr-2" />
                                                {showStartTime || showEndTime ? 'Disable Times' : 'Enable Times'}
                                            </Button>
                                        </div>
                                        
                                        {/* Start Date & Time */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-medium dark:text-gray-300">Start Date & Time</Label>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        id="show-start-time"
                                                        checked={showStartTime}
                                                        onCheckedChange={setShowStartTime}
                                                        disabled={isProcessing}
                                                        className="dark:data-[state=checked]:bg-blue-600"
                                                    />
                                                    <Label htmlFor="show-start-time" className="text-sm text-gray-500 cursor-pointer dark:text-gray-400">
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
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className={`${errors.start_date ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.start_date && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
                                                    )}
                                                </div>
                                                
                                                {showStartTime && (
                                                    <div className="space-y-2">
                                                        <Input 
                                                            id="start_time" 
                                                            type="time" 
                                                            value={data.start_time}
                                                            onChange={(e) => setData('start_time', e.target.value)}
                                                            className={`${errors.start_time ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                            disabled={isProcessing || !data.start_date}
                                                        />
                                                        {errors.start_time && (
                                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.start_time}</p>
                                                        )}
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
                                                        disabled={isProcessing}
                                                        className="dark:data-[state=checked]:bg-blue-600"
                                                    />
                                                    <Label htmlFor="show-end-time" className="text-sm text-gray-500 cursor-pointer dark:text-gray-400">
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
                                                        min={data.start_date || new Date().toISOString().split('T')[0]}
                                                        className={`${errors.end_date ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.end_date && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
                                                    )}
                                                </div>
                                                
                                                {showEndTime && (
                                                    <div className="space-y-2">
                                                        <Input 
                                                            id="end_time" 
                                                            type="time" 
                                                            value={data.end_time}
                                                            onChange={(e) => setData('end_time', e.target.value)}
                                                            className={`${errors.end_time ? 'border-red-500' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                            disabled={isProcessing || !data.end_date}
                                                        />
                                                        {errors.end_time && (
                                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.end_time}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {!data.start_date && !data.end_date && 'Leave dates empty for immediate and indefinite display'}
                                            {data.start_date && !data.end_date && 'Announcement will start on selected date and continue indefinitely'}
                                            {!data.start_date && data.end_date && 'Announcement will start immediately and end on selected date'}
                                            {data.start_date && data.end_date && 'Announcement will be active between selected dates'}
                                        </p>
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
                                            disabled={isProcessing}
                                            className="dark:data-[state=checked]:bg-blue-600"
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
                                onChange={(field, value) => setData(field as keyof FormData, value)}
                                roles={roles}
                                puroks={puroks}
                                households={households}
                                businesses={businesses}
                                users={users}
                                errors={errors}
                                disabled={isProcessing}
                            />
                        </TabsContent>
                    </Tabs>

                    {/* Live Preview */}
                    <Card className="dark:bg-gray-900 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                <Eye className="h-5 w-5" />
                                Live Preview
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                How the announcement will appear to targeted users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg p-6 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-3 rounded-lg ${getTypeColor(data.type)}`}>
                                            {(() => {
                                                const IconComponent = getTypeIcon(data.type);
                                                return <IconComponent className="h-5 w-5" />;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">
                                                {data.title || "Announcement Title"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1 dark:text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                <span>Posted: {new Date().toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`font-medium ${getPriorityColor(data.priority)} px-2 py-1 rounded-full text-xs`}>
                                                    {priorities[data.priority] || 'Normal'} Priority
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {data.is_active ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">Inactive</Badge>
                                    )}
                                </div>

                                {/* Audience Badge */}
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-700 dark:text-gray-300">
                                        {(() => {
                                            const IconComponent = getAudienceIcon(data.audience_type);
                                            return <IconComponent className="h-3 w-3" />;
                                        })()}
                                        {audience_types[data.audience_type] || 'All Users'}
                                    </Badge>
                                    {data.audience_type !== 'all' && (
                                        <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                            {getAudienceCount()} {data.audience_type.replace(/_/g, ' ')} selected
                                        </Badge>
                                    )}
                                </div>

                                <div className="border-t dark:border-gray-700 pt-4">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {data.content || "Announcement content will appear here..."}
                                    </p>
                                </div>

                                {(data.start_date || data.end_date) && (
                                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                        <div className="grid gap-4 md:grid-cols-2 text-sm">
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
                                onClick={handleReset}
                                disabled={isProcessing}
                                className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                                Reset Changes
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route('admin.announcements.show', announcement.id)}>
                                <Button variant="outline" type="button" disabled={isProcessing} className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={isProcessing}
                                className="bg-blue-600 hover:bg-blue-700 min-w-[140px] dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Announcement
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </AppLayout>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Announcement
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete this announcement? This action cannot be undone.
                            This will permanently delete:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="bg-gray-50 p-4 rounded dark:bg-gray-900">
                            <p className="font-medium dark:text-white">{announcement.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Created: {new Date(announcement.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Announcement'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Duplicate Confirmation Dialog */}
            <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 dark:text-white">
                            <Copy className="h-5 w-5" />
                            Duplicate Announcement
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Create a copy of this announcement? The duplicate will be created with "(Copy)" appended to the title.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="bg-gray-50 p-4 rounded dark:bg-gray-900">
                            <p className="font-medium dark:text-white">{announcement.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Will be copied to: {announcement.title} (Copy)
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDuplicate}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Duplicating...
                                </>
                            ) : (
                                'Create Duplicate'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}