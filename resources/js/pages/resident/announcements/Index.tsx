import ResidentLayout from '@/layouts/resident-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell,
    Search,
    Filter,
    Calendar,
    AlertTriangle,
    Info,
    Megaphone,
    Volume2,
    Pin,
    Bookmark,
    Share2,
    Eye,
    Clock,
    Users
} from 'lucide-react';
import { useState } from 'react';

export default function Announcements() {
    const [bookmarked, setBookmarked] = useState<number[]>([1, 3]);

    const announcements = [
        {
            id: 1,
            title: 'Water Interruption Schedule - December 15',
            content: 'There will be scheduled water interruption in Purok 1 & 2 on December 15, 2024 from 8:00 AM to 5:00 PM. Please store enough water for your daily needs.',
            type: 'important',
            category: 'utility',
            date: '2024-12-13',
            author: 'Barangay Council',
            priority: 'high',
            read: true,
            attachments: 2,
            comments: 12,
            views: 245
        },
        {
            id: 2,
            title: 'Annual Christmas Party Invitation',
            content: 'Join us for our Annual Barangay Christmas Party on December 20, 2024 at 6:00 PM at the Barangay Hall Grounds. Free food, games, and prizes for everyone!',
            type: 'event',
            category: 'community',
            date: '2024-12-10',
            author: 'Barangay Social Committee',
            priority: 'medium',
            read: false,
            attachments: 1,
            comments: 45,
            views: 312
        },
        {
            id: 3,
            title: 'Medical Mission - Free Check-up',
            content: 'Free medical check-up and consultation on December 18, 2024 from 8:00 AM to 4:00 PM. Services include BP check, blood sugar test, and basic consultation.',
            type: 'health',
            category: 'service',
            date: '2024-12-08',
            author: 'Barangay Health Center',
            priority: 'high',
            read: true,
            attachments: 3,
            comments: 28,
            views: 189
        },
        {
            id: 4,
            title: 'New Barangay Ordinance on Waste Segregation',
            content: 'Starting January 1, 2025, strict implementation of waste segregation policy. Violators will be fined. Please separate biodegradable, non-biodegradable, and recyclable waste.',
            type: 'ordinance',
            category: 'policy',
            date: '2024-12-05',
            author: 'Barangay Council',
            priority: 'medium',
            read: false,
            attachments: 4,
            comments: 56,
            views: 421
        },
        {
            id: 5,
            title: 'Road Repair Schedule - Purok 3 Main Road',
            content: 'Road repair will commence on December 17-20, 2024. Affected residents please park vehicles elsewhere. We apologize for the inconvenience.',
            type: 'infrastructure',
            category: 'utility',
            date: '2024-12-03',
            author: 'Public Works Committee',
            priority: 'medium',
            read: true,
            attachments: 2,
            comments: 18,
            views: 156
        },
        {
            id: 6,
            title: 'Scholarship Program Applications Now Open',
            content: 'Barangay scholarship program for college students is now accepting applications. Submit requirements at the barangay office until December 31, 2024.',
            type: 'education',
            category: 'opportunity',
            date: '2024-12-01',
            author: 'Education Committee',
            priority: 'low',
            read: true,
            attachments: 5,
            comments: 32,
            views: 278
        },
    ];

    const categories = [
        { id: 'all', name: 'All', count: announcements.length },
        { id: 'important', name: 'Important', count: announcements.filter(a => a.priority === 'high').length },
        { id: 'event', name: 'Events', count: announcements.filter(a => a.type === 'event').length },
        { id: 'utility', name: 'Utilities', count: announcements.filter(a => a.category === 'utility').length },
        { id: 'service', name: 'Services', count: announcements.filter(a => a.category === 'service').length },
        { id: 'policy', name: 'Policies', count: announcements.filter(a => a.category === 'policy').length },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'important':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'event':
                return <Calendar className="h-5 w-5 text-green-500" />;
            case 'health':
                return <Info className="h-5 w-5 text-blue-500" />;
            case 'ordinance':
                return <Megaphone className="h-5 w-5 text-purple-500" />;
            case 'infrastructure':
                return <Volume2 className="h-5 w-5 text-amber-500" />;
            case 'education':
                return <Info className="h-5 w-5 text-indigo-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Priority</Badge>;
            case 'medium':
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Priority</Badge>;
            case 'low':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Priority</Badge>;
            default:
                return null;
        }
    };

    const toggleBookmark = (id: number) => {
        if (bookmarked.includes(id)) {
            setBookmarked(bookmarked.filter(item => item !== id));
        } else {
            setBookmarked([...bookmarked, id]);
        }
    };

    return (
        <ResidentLayout
            title="Announcements"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'Announcements', href: '/resident/announcements' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Stay updated with barangay news and announcements
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button>
                            <Bell className="h-4 w-4 mr-2" />
                            Notification Settings
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="Search announcements..." className="pl-10" />
                            </div>
                            <Button variant="outline">
                                Subscribe to RSS
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full md:w-auto">
                        {categories.map((category) => (
                            <TabsTrigger key={category.id} value={category.id} className="relative">
                                {category.name}
                                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                                    {category.count}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {categories.map((category) => (
                        <TabsContent key={category.id} value={category.id} className="mt-6">
                            <div className="space-y-4">
                                {announcements
                                    .filter(announcement => 
                                        category.id === 'all' ? true : 
                                        category.id === 'important' ? announcement.priority === 'high' :
                                        announcement.category === category.id || announcement.type === category.id
                                    )
                                    .map((announcement) => (
                                        <Card key={announcement.id} className={`hover:shadow-md transition-shadow ${!announcement.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    {/* Icon Section */}
                                                    <div className="flex-shrink-0">
                                                        <div className="p-3 rounded-full bg-gray-100">
                                                            {getTypeIcon(announcement.type)}
                                                        </div>
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="flex-1">
                                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-bold">{announcement.title}</h3>
                                                                    {announcement.priority === 'high' && (
                                                                        <Pin className="h-4 w-4 text-red-500" />
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {announcement.date}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>By: {announcement.author}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getPriorityBadge(announcement.priority)}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleBookmark(announcement.id)}
                                                                >
                                                                    <Bookmark className={`h-4 w-4 ${bookmarked.includes(announcement.id) ? 'fill-current' : ''}`} />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <p className="text-gray-600 mb-4">{announcement.content}</p>

                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Eye className="h-3 w-3" />
                                                                    {announcement.views} views
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-3 w-3" />
                                                                    {announcement.comments} comments
                                                                </span>
                                                                {announcement.attachments > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        {announcement.attachments} attachments
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Button size="sm" variant="outline">
                                                                    Read More
                                                                </Button>
                                                                <Button size="sm" variant="outline">
                                                                    <Share2 className="h-4 w-4 mr-1" />
                                                                    Share
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Important Announcements */}
                <Card className="border-2 border-red-300 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Urgent Announcements
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            High priority information requiring immediate attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {announcements
                                .filter(a => a.priority === 'high')
                                .map((announcement) => (
                                    <div key={announcement.id} className="p-4 bg-white rounded-lg border">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold">{announcement.title}</h4>
                                            <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{announcement.content.substring(0, 150)}...</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">{announcement.date}</span>
                                            <Button size="sm" variant="outline">
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Upcoming Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {announcements
                                .filter(a => a.type === 'event')
                                .map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-bold">{event.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {event.date}
                                                </span>
                                                <span>•</span>
                                                <span>Organized by: {event.author}</span>
                                            </div>
                                        </div>
                                        <Button>Register</Button>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Announcement Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Announcement Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">24</div>
                                <div className="text-sm text-gray-500">This Month</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">8</div>
                                <div className="text-sm text-gray-500">Unread</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{bookmarked.length}</div>
                                <div className="text-sm text-gray-500">Bookmarked</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">156</div>
                                <div className="text-sm text-gray-500">Total Views</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ResidentLayout>
    );
}