// /components/residentui/dashboard/ActivityFeed.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { formatDate, getStatusBadge } from '@/utils/portal/dashboard/dashboard-utils';
import { Activity } from  '@/types/portal/dashboard/dashboard-types';


interface ActivityFeedProps {
    activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
    return (
        <div className="space-y-1">
            {activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                    {index < activities.length - 1 && (
                        <div className="absolute left-5 sm:left-6 top-12 sm:top-14 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700" />
                    )}
                    <GlassCard className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
                                    <activity.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white break-words">{activity.description}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {formatDate(activity.date)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {activity.amount && (
                                            <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white whitespace-nowrap">
                                                {activity.amount}
                                            </span>
                                        )}
                                        <span className={cn(`px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)} whitespace-nowrap`)}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            ))}
        </div>
    );
};