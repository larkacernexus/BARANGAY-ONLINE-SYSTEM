import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    ArrowLeft,
    Save,
    Bell,
    AlertCircle,
    Calendar,
    Clock,
    Megaphone,
    FileText,
    Zap,
    Eye,
    Settings,
    Wrench,
    Tag,
    CalendarClock
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';

interface AnnouncementFormData {
    title: string;
    content: string;
    type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
    priority: number;
    is_active: boolean;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
}

interface CreateAnnouncementProps extends PageProps {
    types: Record<string, string>;
    priorities: Record<string, string>;
}

export default function CreateAnnouncement({ 
    types, 
    priorities 
}: CreateAnnouncementProps) {
    const { data, setData, post, processing, errors, reset } = useForm<AnnouncementFormData>({
        title: '',
        content: '',
        type: 'general',
        priority: 0,
        is_active: true,
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
    });

    // State for showing time fields
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);

    // Auto-set end date to 30 days from start date
    useEffect(() => {
        if (data.start_date && !data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);
            
            const formattedEndDate = endDate.toISOString().split('T')[0];
            setData('end_date', formattedEndDate);
        }
    }, [data.start_date]);

    // Auto-fill today's date if no start date
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
        
        // Auto-set time to current time if showing time
        if (showStartTime && !data.start_time) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setData('start_time', `${hours}:${minutes}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data for submission
        const submissionData = {
            ...data,
            // If time is not enabled, set to null
            start_time: showStartTime ? data.start_time : null,
            end_time: showEndTime ? data.end_time : null,
        };
        
        post('/admin/announcements/store', {
            data: submissionData,
            preserveScroll: true,
            onSuccess: () => {
                reset();
            }
        });
    };

    const clearForm = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        reset({
            title: '',
            content: '',
            type: 'general',
            priority: 0,
            is_active: true,
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: '',
        });
        setShowStartTime(false);
        setShowEndTime(false);
    };

    const handleToggleTime = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setShowStartTime(!showStartTime);
        setShowEndTime(!showEndTime);
    };

    // Convert Record to array for Select component
    const typeOptions = Object.entries(types || {}).map(([value, label]) => ({
        value,
        label
    }));

    const priorityOptions = Object.entries(priorities || {}).map(([value, label]) => ({
        value: parseInt(value),
        label
    }));

    // Calculate form completion percentage
    const requiredFields = ['title', 'content', 'type', 'priority'];
    const optionalFields = ['start_date', 'end_date'];

    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof AnnouncementFormData];
        if (field === 'priority') {
            return value !== null && value !== undefined;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field as keyof AnnouncementFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalProgress = Math.round(
        ((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length)) * 100
    );

    // Get priority color
    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 4: return 'text-red-600 bg-red-50 border-red-200';
            case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
            case 2: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 1: return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Get type color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800';
            case 'event': return 'bg-blue-100 text-blue-800';
            case 'maintenance': return 'bg-amber-100 text-amber-800';
            case 'other': return 'bg-gray-100 text-gray-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    // Get type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'important': return AlertCircle;
            case 'event': return Calendar;
            case 'maintenance': return Wrench;
            case 'other': return Tag;
            default: return Bell;
        }
    };

    // Format date and time for preview
    const formatDateTimePreview = (date: string, time: string, showTime: boolean) => {
        if (!date) return '';
        
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

    return (
        <AppLayout
            title="Create Announcement"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Announcements', href: '/admin/announcements' },
                { title: 'Create Announcement', href: '/admin/announcements/create' }
            ]}
        >
            {/* Use a regular div instead of form for the wrapper */}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/announcements">
                            <Button variant="ghost" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create New Announcement</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Publish a new announcement for barangay residents
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={handleSubmit} disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Publishing...' : 'Publish Announcement'}
                        </Button>
                    </div>
                </div>

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <p className="font-bold">Please fix the following errors:</p>
                        <ul className="list-disc list-inside mt-2">
                            {Object.entries(errors).map(([field, error]) => (
                                <li key={field}><strong>{field.replace('_', ' ')}:</strong> {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Announcement Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Announcement Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Megaphone className="h-5 w-5" />
                                    Announcement Content
                                </CardTitle>
                                <CardDescription>
                                    What residents will see
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="e.g., Important: Water Service Interruption" 
                                        required 
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="text-lg font-medium"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Make the title clear and attention-grabbing
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content *</Label>
                                    <Textarea 
                                        id="content" 
                                        placeholder="Enter the full announcement details here..."
                                        required 
                                        rows={8}
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="min-h-[200px]"
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600">{errors.content}</p>
                                    )}
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Supports basic formatting. Keep it clear and concise.</span>
                                        <span>{data.content.length}/2000 characters</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Announcement Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Announcement Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure how and when the announcement appears
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type *</Label>
                                        <Select 
                                            value={data.type}
                                            onValueChange={(value: AnnouncementFormData['type']) => setData('type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeOptions.map((type) => {
                                                    const IconComponent = getTypeIcon(type.value);
                                                    return (
                                                        <SelectItem key={type.value} value={type.value}>
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
                                            <p className="text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority Level *</Label>
                                        <Select 
                                            value={data.priority.toString()}
                                            onValueChange={(value) => setData('priority', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorityOptions.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value.toString()}>
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
                                            <p className="text-sm text-red-600">{errors.priority}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Schedule</Label>
                                    
                                    {/* Start Date & Time */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Start Date & Time</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="show-start-time"
                                                    checked={showStartTime}
                                                    onCheckedChange={(checked) => {
                                                        setShowStartTime(checked);
                                                    }}
                                                    className="h-4 w-8"
                                                />
                                                <Label htmlFor="show-start-time" className="text-sm text-gray-500 cursor-pointer">
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
                                                    placeholder="Start date"
                                                />
                                                <p className="text-sm text-gray-500">
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
                                                    />
                                                    <p className="text-sm text-gray-500">
                                                        Announcement start time
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* End Date & Time */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">End Date & Time</Label>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id="show-end-time"
                                                    checked={showEndTime}
                                                    onCheckedChange={(checked) => {
                                                        setShowEndTime(checked);
                                                    }}
                                                    className="h-4 w-8"
                                                />
                                                <Label htmlFor="show-end-time" className="text-sm text-gray-500 cursor-pointer">
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
                                                    placeholder="End date"
                                                />
                                                <p className="text-sm text-gray-500">
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
                                                    />
                                                    <p className="text-sm text-gray-500">
                                                        Announcement end time
                                                    </p>
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
                                            className="flex-1"
                                        >
                                            <Zap className="h-3 w-3 mr-1" />
                                            Auto-fill Dates
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleToggleTime}
                                            className="flex-1"
                                        >
                                            <CalendarClock className="h-3 w-3 mr-1" />
                                            Toggle Time
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Active Status</Label>
                                        <p className="text-sm text-gray-500">
                                            Announcement will be visible to residents when active
                                        </p>
                                    </div>
                                    <Switch 
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => {
                                            setData('is_active', checked);
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Preview & Actions */}
                    <div className="space-y-6">
                        {/* Preview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Live Preview
                                </CardTitle>
                                <CardDescription>
                                    How the announcement will appear to residents
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-6 bg-white shadow-sm dark:bg-gray-900">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${getTypeColor(data.type)}`}>
                                                <Bell className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">
                                                    {data.title || "Announcement Title"}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Posted: {new Date().toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className={`font-medium ${getPriorityColor(data.priority)} px-2 py-1 rounded-full text-xs`}>
                                                        {priorities[data.priority.toString()] || 'Normal'} Priority
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {data.is_active && (
                                            <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                Active
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {data.content || "Announcement content will appear here..."}
                                        </p>
                                    </div>
                                    {(data.start_date || data.end_date) && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {data.start_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium">Starts</div>
                                                            <div className="text-gray-500">
                                                                {formatDateTimePreview(data.start_date, data.start_time, showStartTime)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {data.end_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium">Ends</div>
                                                            <div className="text-gray-500">
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

                        {/* Form Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Required Fields:</span>
                                        <span className={`font-medium ${completedRequired === requiredFields.length ? 'text-green-600' : 'text-amber-600'}`}>
                                            {completedRequired}/{requiredFields.length} completed
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Optional Fields:</span>
                                        <span className="font-medium">
                                            {completedOptional}/{optionalFields.length} completed
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="flex items-center justify-between font-medium">
                                            <span>Total Progress</span>
                                            <span>{totalProgress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    totalProgress === 100 ? 'bg-green-500' : 
                                                    totalProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                                }`} 
                                                style={{ width: `${totalProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span>Required fields completed</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <span>Optional fields completed</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    type="button"
                                    onClick={handleAutoFillDate}
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Auto-fill Dates & Time
                                </Button>
                                <Link href="/admin/announcements">
                                    <Button variant="outline" className="w-full justify-start" type="button">
                                        View All Announcements
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start" 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Save as Template
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Time Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4" />
                                    Time Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Start Time:</span>
                                    <span className={`font-medium ${showStartTime ? 'text-green-600' : 'text-gray-400'}`}>
                                        {showStartTime ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">End Time:</span>
                                    <span className={`font-medium ${showEndTime ? 'text-green-600' : 'text-gray-400'}`}>
                                        {showEndTime ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="pt-2 border-t text-xs text-gray-500">
                                    <p>• Time fields are optional</p>
                                    <p>• Useful for event announcements</p>
                                    <p>• Disabled by default</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Priority Guide */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Priority Guide</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    {Object.entries(priorities || {}).map(([value, label]) => (
                                        <div key={value} className="flex items-center justify-between">
                                            <span className={`font-medium ${getPriorityColor(parseInt(value))}`}>
                                                {label} ({value})
                                            </span>
                                            <span className="text-gray-500">
                                                {parseInt(value) === 4 && 'Emergency alerts'}
                                                {parseInt(value) === 3 && 'Important notices'}
                                                {parseInt(value) === 2 && 'Regular updates'}
                                                {parseInt(value) === 1 && 'Informational'}
                                                {parseInt(value) === 0 && 'General news'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <div>
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={clearForm}
                        >
                            Clear Form
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/announcements">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="button" onClick={handleSubmit} disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Publishing...' : 'Publish Announcement'}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}