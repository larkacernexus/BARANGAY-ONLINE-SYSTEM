// resources/js/components/admin/community-reports/show/components/activity-log-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, CheckCircle, UserCheck, Eye, HistoryIcon } from 'lucide-react';
import { ActivityLog } from './types';

interface ActivityLogCardProps {
    activityLogs: ActivityLog[];
    formatDateTime: (date: string | null | undefined) => string;
    getTimeAgo: (date: string | null | undefined) => string;
    safeIncludes: (str: string | null | undefined, searchString: string) => boolean;
}

export function ActivityLogCard({ activityLogs, formatDateTime, getTimeAgo, safeIncludes }: ActivityLogCardProps) {
    const hasLogs = activityLogs && activityLogs.length > 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                        <HistoryIcon className="h-3 w-3 text-white" />
                    </div>
                    Activity Log
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Timeline of all actions taken on this report
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasLogs ? (
                    <div className="space-y-4">
                        {activityLogs.map((log, index) => {
                            const logId = log?.id || index;
                            const action = log?.action || '';
                            const userName = log?.user_name || 'Unknown User';
                            const details = log?.details || 'No details provided';
                            const createdAt = log?.created_at || '';
                            const ipAddress = log?.ip_address;

                            return (
                                <div key={logId} className="flex gap-3 sm:gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                            safeIncludes(action, 'created') ? 'bg-green-100 dark:bg-green-900/30' :
                                            safeIncludes(action, 'updated') ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            safeIncludes(action, 'deleted') ? 'bg-red-100 dark:bg-red-900/30' :
                                            safeIncludes(action, 'resolved') ? 'bg-green-100 dark:bg-green-900/30' :
                                            safeIncludes(action, 'assigned') ? 'bg-purple-100 dark:bg-purple-900/30' :
                                            safeIncludes(action, 'viewed') ? 'bg-gray-100 dark:bg-gray-700' :
                                            'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                            {safeIncludes(action, 'created') ? <Plus className="h-4 w-4" /> :
                                             safeIncludes(action, 'updated') ? <Edit className="h-4 w-4" /> :
                                             safeIncludes(action, 'deleted') ? <Trash2 className="h-4 w-4" /> :
                                             safeIncludes(action, 'resolved') ? <CheckCircle className="h-4 w-4" /> :
                                             safeIncludes(action, 'assigned') ? <UserCheck className="h-4 w-4" /> :
                                             safeIncludes(action, 'viewed') ? <Eye className="h-4 w-4" /> :
                                             <HistoryIcon className="h-4 w-4" />}
                                        </div>
                                        {index < activityLogs.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                            <p className="font-medium text-sm sm:text-base dark:text-gray-200">{userName}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 shrink-0">{getTimeAgo(createdAt)}</p>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">{details}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{formatDateTime(createdAt)}</span>
                                            {ipAddress && (
                                                <span>IP: {ipAddress}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <HistoryIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No Activity Logs
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            No activity has been recorded for this report yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}