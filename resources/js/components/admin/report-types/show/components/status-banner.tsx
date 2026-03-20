// resources/js/Pages/Admin/Reports/ReportTypes/components/status-banner.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { ReportType } from '../types';

interface Props {
    reportType: ReportType;
}

export const StatusBanner = ({ reportType }: Props) => {
    return (
        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-red-500 dark:text-red-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">Immediate Action Required</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                This report type requires immediate attention when filed.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};