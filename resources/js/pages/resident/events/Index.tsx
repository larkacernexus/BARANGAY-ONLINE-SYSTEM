import ResidentLayout from '@/layouts/resident-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    Search,
    Filter,
    Users,
    MapPin,
    Clock,
    Ticket,
    CalendarDays,
    Star,
    TrendingUp,
    Bell,
    Share2,
    CheckCircle,
    XCircle,
    Plus
} from 'lucide-react';
import { useState } from 'react';

export default function Events() {
    const [registeredEvents, setRegisteredEvents] = useState<number[]>([1, 3]);

    const events = [
        {
            id: 1,
            title: 'Annual Christmas Party',
            description: 'Join us for our biggest community gathering of the year with food, games, and entertainment for all ages.',
            date: '2024-12-20',
            time: '6:00 PM - 10:00 PM',
            location: 'Barangay Hall Grounds',
            category: 'celebration',
            type: 'public',
            capacity: 500,
            registered: 342,
            status: 'upcoming',
            organizer: 'Barangay Social Committee',
            fee: 'Free',
            tags: ['Family', 'Food', 'Entertainment'],
            image: '/events/christmas.jpg'
        },
        {
            id: 2,
            title: 'Free Medical Mission',
            description: 'Free medical check-ups, basic consultations, and health education for all residents.',
            date: '2024-12-18',
            time: '8:00 AM - 4:00 PM',
            location: 'Barangay Health Center',
            category: 'health',
            type: 'public',
            capacity: 200,
            registered: 189,
            status: 'upcoming',
            organizer: 'Barangay Health Center',
            fee: 'Free',
            tags: ['Health', 'Free', 'Medical'],
            image: '/events/medical.jpg'
        },
        {
            id: 3,
            title: 'Clean-up Drive - Purok 1 & 2',
            description: 'Community clean-up drive to maintain cleanliness and environmental sustainability.',
            date: '2024-12-15',
            time: '7:00 AM - 11:00 AM',
            location: 'Purok 1 & 2 Main Streets',
            category: 'community',
            type: 'volunteer',
            capacity: 100,
            registered: 65,
            status: 'upcoming',
            organizer: 'Environmental Committee',
            fee: 'Free',
            tags: ['Environment', 'Volunteer', 'Clean-up'],
            image: '/events/cleanup.jpg'
        },
        {
            id: 4,
            title: 'Financial Literacy Seminar',
            description: 'Learn about budgeting, savings, and basic financial management for families.',
            date: '2024-12-10',
            time: '2:00 PM - 5:00 PM',
            location: 'Barangay Multi-purpose Hall',
            category: 'education',
            type: 'workshop',
            capacity: 80,
            registered: 80,
            status: 'full',
            organizer: 'Livelihood Committee',
            fee: '₱50',
            tags: ['Education', 'Finance', 'Seminar'],
            image: '/events/seminar.jpg'
        },
        {
            id: 5,
            title: 'Basketball Tournament Finals',
            description: 'Championship game of the barangay inter-purok basketball tournament.',
            date: '2024-12-08',
            time: '3:00 PM - 6:00 PM',
            location: 'Barangay Court',
            category: 'sports',
            type: 'public',
            capacity: 300,
            registered: 0,
            status: 'completed',
            organizer: 'Sports Committee',
            fee: 'Free',
            tags: ['Sports', 'Tournament', 'Basketball'],
            image: '/events/basketball.jpg'
        },
        {
            id: 6,
            title: 'Senior Citizens Thanksgiving',
            description: 'Special event honoring our senior citizens with program and gift-giving.',
            date: '2024-12-05',
            time: '9:00 AM - 12:00 PM',
            location: 'Barangay Hall',
            category: 'social',
            type: 'invitation',
            capacity: 150,
            registered: 142,
            status: 'completed',
            organizer: 'Senior Citizens Affairs',
            fee: 'Free',
            tags: ['Seniors', 'Social', 'Thanksgiving'],
            image: '/events/seniors.jpg'
        },
    ];

    const categories = [
        { id: 'all', name: 'All Events', count: events.length },
        { id: 'upcoming', name: 'Upcoming', count: events.filter(e => e.status === 'upcoming').length },
        { id: 'completed', name: 'Past Events', count: events.filter(e => e.status === 'completed').length },
        { id: 'registered', name: 'Registered', count: events.filter(e => registeredEvents.includes(e.id)).length },
    ];

    const eventTypes = [
        { id: 'public', name: 'Public Events', color: 'bg-blue-100 text-blue-800' },
        { id: 'workshop', name: 'Workshops', color: 'bg-green-100 text-green-800' },
        { id: 'volunteer', name: 'Volunteer', color: 'bg-purple-100 text-purple-800' },
        { id: 'invitation', name: 'By Invitation', color: 'bg-amber-100 text-amber-800' },
    ];

    const toggleRegistration = (eventId: number) => {
        if (registeredEvents.includes(eventId)) {
            setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
        } else {
            const event = events.find(e => e.id === eventId);
            if (event && event.status === 'upcoming' && event.registered < event.capacity) {
                setRegisteredEvents([...registeredEvents, eventId]);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'upcoming':
                return <Badge className="bg-green-100 text-green-800">Upcoming</Badge>;
            case 'completed':
                return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
            case 'full':
                return <Badge className="bg-red-100 text-red-800">Full</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        const typeInfo = eventTypes.find(t => t.id === type);
        return typeInfo ? (
            <Badge className={typeInfo.color}>{typeInfo.name}</Badge>
        ) : null;
    };

    return (
        <ResidentLayout
            title="Events"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'Events', href: '/resident/events' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Barangay Events</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Discover and participate in community events
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Calendar View
                        </Button>
                        <Button>
                            <Bell className="h-4 w-4 mr-2" />
                            Event Alerts
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                                    <p className="text-2xl font-bold mt-2">
                                        {events.filter(e => e.status === 'upcoming').length}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Registered</p>
                                    <p className="text-2xl font-bold mt-2">{registeredEvents.length}</p>
                                </div>
                                <Ticket className="h-8 w-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">This Month</p>
                                    <p className="text-2xl font-bold mt-2">6</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Participants</p>
                                    <p className="text-2xl font-bold mt-2">818</p>
                                </div>
                                <Users className="h-8 w-8 text-red-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="Search events by title, description, or location..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="outline">
                                    By Date
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Event Types */}
                <div className="flex flex-wrap gap-2">
                    {eventTypes.map((type) => (
                        <Badge key={type.id} variant="outline" className={type.color}>
                            {type.name}
                        </Badge>
                    ))}
                </div>

                {/* Events Tabs */}
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList>
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
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {events
                                    .filter(event => {
                                        if (category.id === 'all') return true;
                                        if (category.id === 'upcoming') return event.status === 'upcoming';
                                        if (category.id === 'completed') return event.status === 'completed';
                                        if (category.id === 'registered') return registeredEvents.includes(event.id);
                                        return true;
                                    })
                                    .map((event) => (
                                        <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
                                            <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
                                                <div className="absolute top-3 right-3">
                                                    {getStatusBadge(event.status)}
                                                </div>
                                                <div className="absolute bottom-3 left-3">
                                                    {getTypeBadge(event.type)}
                                                </div>
                                                <div className="absolute bottom-3 right-3">
                                                    <Badge variant="secondary" className="bg-white/20 text-white">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {event.registered}/{event.capacity}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{event.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <span>{event.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                            <span>{event.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-gray-400" />
                                                            <span>Organized by: {event.organizer}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {event.tags.map((tag, index) => (
                                                            <Badge key={index} variant="secondary">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t">
                                                        <div className="font-bold">{event.fee}</div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant={registeredEvents.includes(event.id) ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => toggleRegistration(event.id)}
                                                                disabled={event.status !== 'upcoming' || (event.registered >= event.capacity && !registeredEvents.includes(event.id))}
                                                            >
                                                                {registeredEvents.includes(event.id) ? (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Registered
                                                                    </>
                                                                ) : event.registered >= event.capacity ? (
                                                                    <>
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Full
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus className="h-4 w-4 mr-1" />
                                                                        Register
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Share2 className="h-4 w-4" />
                                                            </Button>
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

                {/* Upcoming Events Calendar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Event Calendar
                        </CardTitle>
                        <CardDescription>
                            View all upcoming events in calendar format
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-7 bg-gray-50 border-b">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="p-3 text-center font-medium text-gray-700">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {Array.from({ length: 35 }).map((_, index) => {
                                    const day = index + 1;
                                    const dayEvents = events.filter(event => {
                                        const eventDate = new Date(event.date).getDate();
                                        return eventDate === day && event.status === 'upcoming';
                                    });
                                    
                                    return (
                                        <div key={index} className="min-h-32 border p-2">
                                            <div className="text-right font-medium mb-2">{day <= 31 ? day : ''}</div>
                                            {dayEvents.map(event => (
                                                <div key={event.id} className="text-xs p-1 mb-1 bg-blue-50 rounded truncate">
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Featured Event */}
                <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                            <div className="lg:w-1/3">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-20 w-20 text-white/80" />
                                </div>
                            </div>
                            <div className="lg:w-2/3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-5 w-5 text-amber-500 fill-current" />
                                    <Badge className="bg-amber-100 text-amber-800">Featured Event</Badge>
                                </div>
                                <h2 className="text-2xl font-bold mb-3">Annual Christmas Party</h2>
                                <p className="text-gray-600 mb-4">
                                    Don't miss the biggest community gathering of the year! Join us for an evening of fun, food, and festivities. 
                                    Special performances, games for all ages, and amazing prizes await!
                                </p>
                                <div className="flex flex-wrap gap-3 items-center">
                                    <Badge variant="outline">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Dec 20, 2024
                                    </Badge>
                                    <Badge variant="outline">
                                        <Clock className="h-3 w-3 mr-1" />
                                        6:00 PM - 10:00 PM
                                    </Badge>
                                    <Badge variant="outline">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Barangay Hall Grounds
                                    </Badge>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button size="lg">
                                        <Ticket className="h-5 w-5 mr-2" />
                                        Register Now
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        <Share2 className="h-5 w-5 mr-2" />
                                        Share Event
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ResidentLayout>
    );
}