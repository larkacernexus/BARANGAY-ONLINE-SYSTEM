// resources/js/Pages/Admin/Users/components/recent-activity-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    History,
    KeyRound,
    LogOut,
    UserPlus,
    Edit,
    Trash2,
    Activity,
    ChevronRight,
} from 'lucide-react';

interface Props {
    activities: any[];
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const RecentActivityCard = ({ activities, formatDate }: Props) => {
    const getActivityIcon = (activity: any) => {
        const desc = activity.description.toLowerCase();
        if (desc.includes('login')) return <KeyRound className="h-4 w-4 text-blue-500" />;
        if (desc.includes('logout')) return <LogOut className="h-4 w-4 text-gray-500" />;
        if (desc.includes('create')) return <UserPlus className="h-4 w-4 text-green-500" />;
        if (desc.includes('update')) return <Edit className="h-4 w-4 text-amber-500" />;
        if (desc.includes('delete')) return <Trash2 className="h-4 w-4 text-red-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    if (activities.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <History className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Activity className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p>No activity recorded</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <History className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Last 10 user actions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium dark:text-gray-200">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{formatDate(activity.created_at, true)}</span>
                                    {activity.causer && activity.causer.id !== activity.subject_id && (
                                        <>
                                            <span>•</span>
                                            <span>by {activity.causer.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            {activities.length > 5 && (
                <CardFooter className="border-t dark:border-gray-700 pt-4">
                    <Link href={`/users/${activities[0].subject_id}/activity`} className="w-full">
                        <Button variant="ghost" size="sm" className="w-full">
                            View all activity
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </CardFooter>
            )}
        </Card>
    );
};