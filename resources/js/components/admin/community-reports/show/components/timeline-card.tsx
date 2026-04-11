// resources/js/components/admin/community-reports/show/components/timeline-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { CommunityReport } from '@/types/admin/reports/community-report';

interface TimelineCardProps {
    report: CommunityReport;
    formatDateTime: (date: string | null | undefined) => string;
    getTimeAgo: (date: string | null | undefined) => string;
    calculateResponseTime: () => string;
}

export function TimelineCard({ report, formatDateTime, getTimeAgo, calculateResponseTime }: TimelineCardProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <Clock className="h-3 w-3 text-white" />
                    </div>
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Report Created</p>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.created_at)}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getTimeAgo(report.created_at)}
                    </p>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.updated_at)}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getTimeAgo(report.updated_at)}
                    </p>
                </div>

                <Separator className="dark:bg-gray-700" />

                {report.acknowledged_at && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Acknowledged</p>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 dark:text-green-500" />
                            <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.acknowledged_at)}</p>
                        </div>
                    </div>
                )}

                {report.resolved_at && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Resolved</p>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 dark:text-green-500" />
                            <p className="text-xs sm:text-sm dark:text-gray-300">{formatDateTime(report.resolved_at)}</p>
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Response Time</p>
                    <p className="text-sm font-semibold dark:text-gray-200">{calculateResponseTime()}</p>
                </div>
            </CardContent>
        </Card>
    );
}