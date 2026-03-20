// resources/js/Pages/Admin/Announcements/components/details-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    Bell, 
    Users, 
    Info, 
    Calendar, 
    Clock,
    CheckCircle,
    XCircle,
    Archive,
    AlertCircle,
    CalendarDays,
    Wrench,
    Tag,
    Megaphone,
    Home,
    MapPin,
    Briefcase,
    UserCircle,
    Globe
} from 'lucide-react';

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
    start_date: string | null;
    end_date: string | null;
    formatted_date_range: string;
    created_at: string;
    updated_at: string;
    status: string;
    is_currently_active: boolean;
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
    AudienceIcon: React.ElementType;
    formatDate: (date: string | null) => string;
    formatDateTime: (date: string | null) => string;
    getTypeColor: (type: string) => string;
    getPriorityColor: (priority: number) => string;
    getStatusIcon: (status: string, isActive: boolean) => React.ReactNode;
}

export const DetailsTab = ({
    announcement,
    audience_details,
    AudienceIcon,
    formatDate,
    formatDateTime,
    getTypeColor,
    getPriorityColor,
    getStatusIcon
}: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="md:col-span-2 space-y-6">
                {/* Announcement Content Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Bell className="h-5 w-5" />
                            Announcement Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg dark:text-gray-300">
                                {announcement.content}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Audience Summary Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <AudienceIcon className="h-5 w-5" />
                            Audience Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Reach</p>
                                    <p className="text-2xl font-bold dark:text-gray-100">{announcement.estimated_reach.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {announcement.audience_type_label}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                {announcement.audience_summary}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
                {/* Status Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-sm dark:text-gray-100 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Status Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                                <Badge variant="outline" className={getTypeColor(announcement.type)}>
                                    {announcement.type_label}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                                <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                                    {announcement.priority_label}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                <Badge variant={announcement.is_active ? "default" : "secondary"} className={announcement.is_active ? '' : 'dark:bg-gray-700 dark:text-gray-300'}>
                                    {announcement.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Currently Displayed</span>
                                <Badge variant={announcement.is_currently_active ? "default" : "secondary"} className={announcement.is_currently_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'dark:bg-gray-700 dark:text-gray-300'}>
                                    {announcement.is_currently_active ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-sm dark:text-gray-100 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                                <div className="flex items-center gap-1 text-sm dark:text-gray-300">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(announcement.start_date)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
                                <div className="flex items-center gap-1 text-sm dark:text-gray-300">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(announcement.end_date)}
                                </div>
                            </div>
                            <Separator className="dark:bg-gray-700" />
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                {announcement.formatted_date_range}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Info Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-sm dark:text-gray-100">Quick Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Created</span>
                            <span className="dark:text-gray-300">{formatDateTime(announcement.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                            <span className="dark:text-gray-300">{formatDateTime(announcement.updated_at)}</span>
                        </div>
                        {announcement.creator && (
                            <div className="pt-2 mt-2 border-t dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">Created By</p>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 dark:bg-gray-700">
                                        <AvatarFallback className="text-xs dark:bg-gray-600 dark:text-gray-200">
                                            {announcement.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="dark:text-gray-300">{announcement.creator.name}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};