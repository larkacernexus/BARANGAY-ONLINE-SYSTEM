// resources/js/Pages/Admin/DocumentTypes/components/quick-stats-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Zap, ListOrdered } from 'lucide-react';

interface Props {
    sortOrder: number;
    requiredCount: number;
    applicationsCount: number;
}

export const QuickStatsCard = ({ sortOrder, requiredCount, applicationsCount }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort Order</span>
                    <span className="font-semibold dark:text-gray-200">{sortOrder}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Required By</span>
                    <span className="font-semibold dark:text-gray-200">{requiredCount} clearance types</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Recent Applications</span>
                    <span className="font-semibold dark:text-gray-200">{applicationsCount}</span>
                </div>
            </CardContent>
        </Card>
    );
};