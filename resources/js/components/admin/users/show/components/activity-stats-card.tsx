// resources/js/Pages/Admin/Users/components/activity-stats-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface Props {
    user: any;
    stats?: any;
}

export const ActivityStatsCard = ({ user, stats }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Activity className="h-5 w-5" />
                    Activity Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats?.login_count || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Logins</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats?.session_count || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats?.residents_managed || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Residents</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {stats?.payments_processed || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Payments</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};