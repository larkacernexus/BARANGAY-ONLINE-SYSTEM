// resources/js/Pages/Admin/Households/Show/tabs/ActivityLogTab.tsx

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
    Filter,
    Calendar,
    Users,
    Building2,
    Receipt,
    AlertCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';

// Import types from shared types file
import { ActivityLog } from '@/types/admin/households/household.types';
import { formatDateTime, getRelativeTime } from '@/types/admin/households/household.types';

// Extended activity type for display
interface ExtendedActivity extends ActivityLog {
    event?: string;
    causer?: {
        id: number;
        name: string;
    };
    properties?: {
        old?: Record<string, any>;
        attributes?: Record<string, any>;
    };
}

interface ActivityLogTabProps {
    householdId: number;
    activities: ExtendedActivity[];
    totalActivities: number;
}

export const ActivityLogTab = ({ householdId, activities, totalActivities }: ActivityLogTabProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEvent, setFilterEvent] = useState('all');

    const getEventIcon = (action: string) => {
        const actionLower = action?.toLowerCase() || '';
        if (actionLower.includes('created') || actionLower.includes('added')) 
            return <Home className="h-4 w-4 text-green-500" />;
        if (actionLower.includes('updated') || actionLower.includes('edited')) 
            return <FileText className="h-4 w-4 text-blue-500" />;
        if (actionLower.includes('deleted') || actionLower.includes('removed')) 
            return <FileText className="h-4 w-4 text-red-500" />;
        if (actionLower.includes('payment')) 
            return <CreditCard className="h-4 w-4 text-purple-500" />;
        if (actionLower.includes('privilege') || actionLower.includes('benefit')) 
            return <Award className="h-4 w-4 text-yellow-500" />;
        if (actionLower.includes('member')) 
            return <Users className="h-4 w-4 text-indigo-500" />;
        if (actionLower.includes('household')) 
            return <Building2 className="h-4 w-4 text-gray-500" />;
        if (actionLower.includes('fee') || actionLower.includes('payment')) 
            return <Receipt className="h-4 w-4 text-orange-500" />;
        return <History className="h-4 w-4 text-gray-500" />;
    };

    const getEventBadge = (action: string) => {
        const actionLower = action?.toLowerCase() || '';
        if (actionLower.includes('created') || actionLower.includes('added')) 
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Created</Badge>;
        if (actionLower.includes('updated') || actionLower.includes('edited')) 
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Updated</Badge>;
        if (actionLower.includes('deleted') || actionLower.includes('removed')) 
            return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Deleted</Badge>;
        if (actionLower.includes('payment')) 
            return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Payment</Badge>;
        if (actionLower.includes('privilege') || actionLower.includes('benefit')) 
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Privilege</Badge>;
        if (actionLower.includes('member')) 
            return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">Member</Badge>;
        return <Badge variant="outline" className="dark:border-gray-600">{action || 'Activity'}</Badge>;
    };

    const getActionDisplay = (action: string): string => {
        // Format action for display (e.g., "household.created" -> "Household Created")
        const parts = action?.split('.') || [];
        const lastPart = parts[parts.length - 1] || action;
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/_/g, ' ');
    };

    // Get unique event types for filter
    const uniqueEvents = useMemo(() => {
        const events = new Set<string>();
        activities.forEach(a => {
            if (a.action) {
                const mainAction = a.action.split('.')[0];
                events.add(mainAction);
            }
        });
        return Array.from(events);
    }, [activities]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const matchesSearch = searchQuery === '' || 
                activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                activity.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                activity.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesEvent = filterEvent === 'all' || 
                (activity.action && activity.action.includes(filterEvent));
            
            return matchesSearch && matchesEvent;
        });
    }, [activities, searchQuery, filterEvent]);

    const renderChanges = (activity: ExtendedActivity) => {
        const oldValues = activity.properties?.old;
        const newValues = activity.properties?.attributes;
        
        if (!oldValues || !newValues) return null;
        
        const changedKeys = Object.keys(newValues).filter(key => 
            oldValues[key] !== newValues[key]
        );
        
        if (changedKeys.length === 0) return null;
        
        return (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                <p className="font-medium mb-2 dark:text-gray-200">Changes:</p>
                <div className="space-y-1">
                    {changedKeys.slice(0, 5).map(key => {
                        const oldValue = oldValues[key];
                        const newValue = newValues[key];
                        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        
                        return (
                            <div key={key} className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                                    {formattedKey}:
                                </span>
                                <span className="text-red-500 line-through text-xs">
                                    {oldValue === null || oldValue === '' ? 'empty' : String(oldValue).substring(0, 50)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-500 text-xs">
                                    {newValue === null || newValue === '' ? 'empty' : String(newValue).substring(0, 50)}
                                </span>
                            </div>
                        );
                    })}
                    {changedKeys.length > 5 && (
                        <p className="text-gray-400 text-xs mt-1">
                            + {changedKeys.length - 5} more changes
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <History className="h-5 w-5" />
                            Activity History
                        </CardTitle>
                        <Badge variant="secondary" className="text-sm dark:bg-gray-800 dark:text-gray-300">
                            {totalActivities} activities
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 relative min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search activities by description, action, or user..."
                                className="pl-9 dark:bg-gray-900 dark:border-gray-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {uniqueEvents.length > 0 && (
                            <select
                                className="px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                value={filterEvent}
                                onChange={(e) => setFilterEvent(e.target.value)}
                            >
                                <option value="all">All Activities</option>
                                {uniqueEvents.map(event => (
                                    <option key={event} value={event}>
                                        {event.charAt(0).toUpperCase() + event.slice(1)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Activities List */}
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No activities found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No activities match your search.' : 'No activity records for this household yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredActivities.map((activity) => (
                                <div key={activity.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getEventIcon(activity.action || activity.description || '')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between flex-wrap gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        {getEventBadge(activity.action || activity.description || '')}
                                                        <span className="text-sm font-medium dark:text-gray-200">
                                                            {activity.description || getActionDisplay(activity.action || '')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        {activity.user_name && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                <span>By: {activity.user_name}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatDateTime(activity.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <History className="h-3 w-3" />
                                                            <span>{getRelativeTime(activity.created_at)}</span>
                                                        </div>
                                                        {activity.model_type && (
                                                            <div className="flex items-center gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                <span className="capitalize">
                                                                    {activity.model_type.split('\\').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Show changes if available */}
                                            {renderChanges(activity)}
                                            
                                            {/* Show IP address if available */}
                                            {activity.ip_address && (
                                                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                                    IP: {activity.ip_address}
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