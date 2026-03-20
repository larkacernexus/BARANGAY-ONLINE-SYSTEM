// resources/js/Pages/Admin/ClearanceTypes/components/statistics-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    BarChart3,
    Award,
} from 'lucide-react';

interface Props {
    clearanceType: any;
    fee: number;
    processingDays: number;
    activeDiscounts: any[];
    formatCurrency: (amount: number | string) => string;
}

export const StatisticsCard = ({
    clearanceType,
    fee,
    processingDays,
    activeDiscounts,
    formatCurrency
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5" />
                    Statistics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {clearanceType.clearances_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clearances</p>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-xl font-bold dark:text-gray-200">{formatCurrency(fee)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Fee per Clearance</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-xl font-bold dark:text-gray-200">{processingDays}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Processing Days</p>
                    </div>
                </div>
                {activeDiscounts.length > 0 && (
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{activeDiscounts.length}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Eligible Discounts</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};