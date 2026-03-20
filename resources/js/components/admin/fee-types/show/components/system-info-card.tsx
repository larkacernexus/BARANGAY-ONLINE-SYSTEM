// resources/js/Pages/Admin/FeeTypes/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

interface Props {
    feeType: any;
    formatTimeAgo: (date: string) => string;
}

export const SystemInfoCard = ({ feeType, formatTimeAgo }: Props) => {
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
                    <span className="text-gray-500 dark:text-gray-400">Fee Type ID</span>
                    <code className="text-xs dark:text-gray-300">#{feeType.id}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Code</span>
                    <code className="text-xs dark:text-gray-300">{feeType.code}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                    <span className="dark:text-gray-300">{formatTimeAgo(feeType.created_at)}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="dark:text-gray-300">{formatTimeAgo(feeType.updated_at)}</span>
                </div>
            </CardContent>
        </Card>
    );
};