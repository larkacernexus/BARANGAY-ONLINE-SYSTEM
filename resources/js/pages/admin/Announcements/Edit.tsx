import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Bell, AlertCircle, Calendar, Clock, Eye } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: string;
    priority: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    announcement: Announcement;
    types: Record<string, string>;
    priorities: Record<string, string>;
}

export default function AnnouncementsEdit({ announcement, types, priorities }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        is_active: announcement.is_active,
        start_date: announcement.start_date || '',
        end_date: announcement.end_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.announcements.update', announcement.id));
    };

    const getPriorityColor = (priority: number): string => {
        switch (priority) {
            case 4: return 'text-red-600 bg-red-50 border-red-200';
            case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
            case 2: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 1: return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    return (
        <AppLayout
            title={`Edit Announcement: ${announcement.title}`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Announcements', href: route('admin.announcements.index') },
                { title: 'Edit', href: route('admin.announcements.edit', announcement.id) }
            ]}
        >
            <Head title={`Edit Announcement: ${announcement.title}`} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href={route('admin.announcements.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Announcements
                            </Button>
                        </Link>
                        <Link href={route('admin.announcements.show', announcement.id)}>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Announcement</h1>
                    <p className="text-gray-500 mt-2">
                        Last updated: {new Date(announcement.updated_at).toLocaleDateString()}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Update the announcement details that will be displayed to residents
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter announcement title"
                                        className={errors.title ? 'border-red-300' : ''}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content *</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Enter announcement content..."
                                        rows={6}
                                        className={errors.content ? 'border-red-300' : ''}
                                    />
                                    {errors.content && (
                                        <p className="text-red-500 text-sm">{errors.content}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Supports basic HTML formatting. Keep content clear and concise.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Type & Priority
                                    </CardTitle>
                                    <CardDescription>
                                        Categorize and prioritize your announcement
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Announcement Type</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) => setData('type', value)}
                                        >
                                            <SelectTrigger className={errors.type ? 'border-red-300' : ''}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(types).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-red-500 text-sm">{errors.type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority Level</Label>
                                        <Select
                                            value={data.priority.toString()}
                                            onValueChange={(value) => setData('priority', parseInt(value))}
                                        >
                                            <SelectTrigger className={errors.priority ? 'border-red-300' : ''}>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(priorities).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(parseInt(value))}`}>
                                                                {label}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.priority && (
                                            <p className="text-red-500 text-sm">{errors.priority}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Active Status</Label>
                                            <p className="text-sm text-gray-500">
                                                Set announcement as active/inactive
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Schedule & Duration
                                    </CardTitle>
                                    <CardDescription>
                                        Set when the announcement should be displayed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date (Optional)</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className={errors.start_date ? 'border-red-300' : ''}
                                        />
                                        {errors.start_date && (
                                            <p className="text-red-500 text-sm">{errors.start_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date (Optional)</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className={errors.end_date ? 'border-red-300' : ''}
                                            min={data.start_date}
                                        />
                                        {errors.end_date && (
                                            <p className="text-red-500 text-sm">{errors.end_date}</p>
                                        )}
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <h4 className="font-medium text-blue-800">Current Status</h4>
                                        </div>
                                        <div className="text-sm text-blue-700 space-y-1">
                                            <p>• Created: {new Date(announcement.created_at).toLocaleDateString()}</p>
                                            <p>• Last Updated: {new Date(announcement.updated_at).toLocaleDateString()}</p>
                                            <p>• Current Status: {announcement.is_active ? 'Active' : 'Inactive'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href={route('admin.announcements.index')}>
                                <Button type="button" variant="outline" disabled={processing}>
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
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
            </div>
        </AppLayout>
    );
}