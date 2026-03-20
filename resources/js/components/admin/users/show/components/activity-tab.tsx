// resources/js/Pages/Admin/Users/components/activity-tab.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    LogOut,
    RefreshCw,
} from 'lucide-react';
import { RecentActivityCard } from './recent-activity-card';
import { TimelineCard } from './timeline-card';

interface Props {
    user: any;
    activityLogs: any[];
    stats: any;
    onLogoutAll: () => void;
    isLoggingOutAll: boolean;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const ActivityTab = ({
    user,
    activityLogs,
    stats,
    onLogoutAll,
    isLoggingOutAll,
    formatDate
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Log */}
            <div className="lg:col-span-2">
                <RecentActivityCard activities={activityLogs} formatDate={formatDate} />
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                <TimelineCard user={user} formatDate={formatDate} />
                
                {/* Session Info */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <LogOut className="h-5 w-5" />
                            Session Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
                            <span className="font-medium dark:text-gray-200">{stats?.session_count || 0}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Login IP</span>
                            <span className="font-mono text-xs dark:text-gray-300">{user.last_login_ip || 'N/A'}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Logins</span>
                            <span className="font-medium dark:text-gray-200">{stats?.login_count || 0}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={onLogoutAll}
                            disabled={isLoggingOutAll || !user.last_login_at}
                        >
                            {isLoggingOutAll ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Logging out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout All Sessions
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};