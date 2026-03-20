// resources/js/Pages/Admin/Reports/ReportTypes/components/priority-timeline-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Zap } from 'lucide-react';

interface Props {
    reportType: any;
    getPriorityIcon: (level: number) => React.ReactNode;
}

export const PriorityTimelineCard = ({ reportType, getPriorityIcon }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Priority & Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority Level</span>
                    <div className="flex items-center gap-2">
                        {getPriorityIcon(reportType.priority_level)}
                        <span className="font-semibold dark:text-gray-200">{reportType.priority_label}</span>
                    </div>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Time</span>
                    <span className="font-semibold dark:text-gray-200">{reportType.resolution_days} days</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expected Resolution</span>
                    <span className="font-semibold dark:text-gray-200">{reportType.expected_resolution_date}</span>
                </div>
            </CardContent>
        </Card>
    );
};