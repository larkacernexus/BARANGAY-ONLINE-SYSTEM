// resources/js/Components/Admin/Residents/Show/Components/Tabs/ActivityLogTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    History, 
    User, 
    FileText, 
    CreditCard, 
    Award, 
    Home,
    Search,
    Calendar,
    Clock
} from 'lucide-react';
import { useState } from 'react';
import { formatDateTime, formatTimeAgo } from '@/admin-utils/date';

interface Activity {
    id: number;
    description: string;
    event: string;
    causer?: {
        id: number;
        name: string;
    };
    properties?: any;
    created_at: string;
    subject_type: string;
}

interface ActivityLogTabProps {
    residentId: number;
    activities: Activity[];
    totalActivities: number;
}

export const ActivityLogTab = ({ residentId, activities, totalActivities }: ActivityLogTabProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEvent, setFilterEvent] = useState('all');

    const getEventIcon = (event: string) => {
        if (event.includes('created')) return <Home className="h-4 w-4 text-green-500" />;
        if (event.includes('updated')) return <FileText className="h-4 w-4 text-blue-500" />;
        if (event.includes('deleted')) return <FileText className="h-4 w-4 text-red-500" />;
        if (event.includes('payment')) return <CreditCard className="h-4 w-4 text-purple-500" />;
        if (event.includes('privilege')) return <Award className="h-4 w-4 text-yellow-500" />;
        return <History className="h-4 w-4 text-gray-500" />;
    };

    const getEventBadge = (event: string) => {
        if (event.includes('created')) return <Badge className="bg-green-100 text-green-800">Created</Badge>;
        if (event.includes('updated')) return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
        if (event.includes('deleted')) return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
        if (event.includes('payment')) return <Badge className="bg-purple-100 text-purple-800">Payment</Badge>;
        if (event.includes('privilege')) return <Badge className="bg-yellow-100 text-yellow-800">Privilege</Badge>;
        return <Badge variant="outline">{event}</Badge>;
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = searchQuery === '' || 
            activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.causer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesEvent = filterEvent === 'all' || activity.event.includes(filterEvent);
        
        return matchesSearch && matchesEvent;
    });

    // Get unique events for filter
    const uniqueEvents = [...new Set(activities.map(a => a.event.split(':')[0]))];

    return (
        <div className="space-y-6">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <History className="h-5 w-5" />
                            Activity History
                        </CardTitle>
                        <Badge variant="secondary" className="text-sm">
                            {totalActivities} activities
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search activities..."
                                className="pl-9 dark:bg-gray-900 dark:border-gray-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
                            value={filterEvent}
                            onChange={(e) => setFilterEvent(e.target.value)}
                        >
                            <option value="all">All Activities</option>
                            {uniqueEvents.map(event => (
                                <option key={event} value={event}>{event}</option>
                            ))}
                        </select>
                    </div>

                    {/* Activities List */}
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No activities found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No activities match your search.' : 'No activity records for this resident yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredActivities.map((activity) => (
                                <div key={activity.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {getEventIcon(activity.event)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        {getEventBadge(activity.event)}
                                                        <span className="text-sm font-medium dark:text-gray-200">
                                                            {activity.description}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        {activity.causer && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                <span>By: {activity.causer.name}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatDateTime(activity.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTimeAgo(activity.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Show changes if available */}
                                            {activity.properties?.old && activity.properties?.attributes && (
                                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                                                    <p className="font-medium mb-2 dark:text-gray-200">Changes:</p>
                                                    <div className="space-y-1">
                                                        {Object.keys(activity.properties.attributes).map(key => {
                                                            const oldValue = activity.properties.old?.[key];
                                                            const newValue = activity.properties.attributes[key];
                                                            if (oldValue !== newValue) {
                                                                return (
                                                                    <div key={key} className="flex items-center gap-2">
                                                                        <span className="font-medium capitalize">{key}:</span>
                                                                        <span className="text-red-500 line-through">{oldValue || 'empty'}</span>
                                                                        <span>→</span>
                                                                        <span className="text-green-500">{newValue || 'empty'}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};