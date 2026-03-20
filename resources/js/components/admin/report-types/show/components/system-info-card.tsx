// resources/js/Pages/Admin/Reports/ReportTypes/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

interface Props {
    reportType: any;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}

export const SystemInfoCard = ({ reportType, formatDateTime, formatTimeAgo }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-sm font-medium dark:text-gray-100 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Report Type ID</span>
                    <code className="text-xs dark:text-gray-300">#{reportType.id}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Code</span>
                    <code className="text-xs dark:text-gray-300">{reportType.code}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                    <p className="mt-1 dark:text-gray-300">{formatDateTime(reportType.created_at)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(reportType.created_at)}</p>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                    <p className="mt-1 dark:text-gray-300">{formatDateTime(reportType.updated_at)}</p>
                </div>
            </CardContent>
        </Card>
    );
};