import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Bell, AlertCircle, Calendar, Clock, CheckCircle, XCircle, CalendarDays, Wrench, Tag, Megaphone } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: string;
    type_label: string;
    priority: number;
    priority_label: string;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    is_currently_active: boolean;
}

interface Props {
    announcement: Announcement;
    types: Record<string, string>;
    priorities: Record<string, string>;
}

export default function AnnouncementsShow({ announcement, types, priorities }: Props) {
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href={route('admin.announcements.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Announcements
                            </Button>
                        </Link>
                        <Link href={route('admin.announcements.edit', announcement.id)}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Announcement
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{announcement.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={announcement.is_active ? "default" : "secondary"} className="flex items-center gap-1">
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
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Announcement Content
                            </CardTitle>
                            <CardDescription>
                                This is what residents will see
                            </CardDescription>
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
                                        {announcement.start_date && new Date(announcement.start_date) > new Date() && (
                                            <Badge variant="outline" className="ml-2">
                                                Future Start
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-500">End Date</div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{formatDate(announcement.end_date)}</span>
                                        {announcement.end_date && new Date(announcement.end_date) < new Date() && (
                                            <Badge variant="outline" className="ml-2">
                                                Expired
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-500">Timeline</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Created:</span>
                                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Last Updated:</span>
                                            <span>{new Date(announcement.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>
                                How this announcement appears to residents
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
                                <div className="border-t pt-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                </div>
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
                </div>
            </div>
        </AppLayout>
    );
}