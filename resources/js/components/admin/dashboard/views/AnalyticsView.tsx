import { TrendingUp, Clock, Activity, Users } from 'lucide-react';
import type { PageProps } from '@/components/admin/dashboard/types/dashboard';

interface AnalyticsViewProps {
    collectionStats: PageProps['collectionStats'];
    activityStats: PageProps['activityStats'];
    recentActivities: PageProps['recentActivities'];
}

export function AnalyticsView({ collectionStats, activityStats, recentActivities }: AnalyticsViewProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Collection Analytics
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Daily Average</p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">₱{collectionStats.dailyAvg}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <p className="text-xs text-blue-600 dark:text-blue-400">Weekly Average</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₱{collectionStats.weeklyAvg}</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                        <p className="text-xs text-purple-600 dark:text-purple-400">Monthly Average</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">₱{collectionStats.monthlyAvg}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400">Growth Rate</p>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{collectionStats.growthRate}</p>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Projected Monthly Total</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₱{collectionStats.projectedMonthly}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>+12.5% vs last month</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Peak Activity Hours
                    </h3>
                </div>
                <div className="space-y-3">
                    {activityStats?.peakHours && Array.isArray(activityStats.peakHours) && activityStats.peakHours.length > 0 ? (
                        activityStats.peakHours.map((hour, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900/30">
                                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div 
                                            className="h-2 rounded-full bg-amber-500"
                                            style={{ width: `${Math.random() * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {hour}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No peak hours data available
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        System Performance
                    </h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                            <span className="font-medium text-gray-900 dark:text-white">65 ms</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className="h-2 rounded-full bg-emerald-500" style={{ width: '35%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Database Load</span>
                            <span className="font-medium text-gray-900 dark:text-white">23%</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className="h-2 rounded-full bg-blue-500" style={{ width: '23%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                            <span className="font-medium text-gray-900 dark:text-white">1.2 GB / 4 GB</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className="h-2 rounded-full bg-purple-500" style={{ width: '30%' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-rose-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        User Engagement
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {activityStats?.activeUsers || 0}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {activityStats?.totalActivitiesThisWeek || 0}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Weekly Activities</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {recentActivities.newResidents.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">New Today</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {recentActivities.recentPayments.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Payments Today</div>
                    </div>
                </div>
            </div>
        </div>
    );
}