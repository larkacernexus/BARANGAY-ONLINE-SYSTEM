// /components/residentui/dashboard/ActivityFeed.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { formatDate, getStatusBadge } from '@/utils/portal/dashboard/dashboard-utils';
import { Activity } from '@/types/portal/dashboard/dashboard-types';

interface ActivityFeedProps {
    activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
    return (
        <GlassCard className="divide-y divide-gray-100 dark:divide-gray-700">
            {activities.map((activity) => (
                <div key={activity.id} className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="rounded-lg p-2 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                <activity.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formatDate(activity.date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={cn(
                                "px-2.5 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap",
                                getStatusBadge(activity.status)
                            )}>
                                {activity.status}
                            </span>
                            {activity.amount && (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                    {activity.amount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </GlassCard>
    );
};