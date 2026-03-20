// resources/js/Pages/Admin/Reports/ReportTypes/components/requirement-stats-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListChecks } from 'lucide-react';

interface Props {
    reportStats: any;
}

export const RequirementStatsCard = ({ reportStats }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <ListChecks className="h-5 w-5" />
                    Requirement Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">With Evidence</span>
                    <span className="font-semibold dark:text-gray-200">{reportStats?.with_evidence || 0}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Anonymous Reports</span>
                    <span className="font-semibold dark:text-gray-200">{reportStats?.anonymous || 0}</span>
                </div>
            </CardContent>
        </Card>
    );
};