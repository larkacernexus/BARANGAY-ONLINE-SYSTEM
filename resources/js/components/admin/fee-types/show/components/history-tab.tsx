// resources/js/Pages/Admin/FeeTypes/components/history-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Card as CardUI } from '@/components/ui/card';
import {
    Clock,
    StickyNote,
} from 'lucide-react';

interface Props {
    feeType: any;
    statistics: any;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    formatCurrency: (amount: any) => string;
}

export const HistoryTab = ({ feeType, statistics, formatDateTime, formatTimeAgo, formatCurrency }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Clock className="h-5 w-5" />
                    History & Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Created On</div>
                            <div className="text-lg font-bold dark:text-gray-200">{formatDateTime(feeType.created_at)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(feeType.created_at)}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Updated</div>
                            <div className="text-lg font-bold dark:text-gray-200">{formatDateTime(feeType.updated_at)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(feeType.updated_at)}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Fees</div>
                            <div className="text-lg font-bold dark:text-gray-200">{feeType.fees_count || 0}</div>
                        </div>
                    </div>

                    {/* Statistics if available */}
                    {statistics && Object.keys(statistics).length > 0 && (
                        <CardUI className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="dark:text-gray-100">Financial Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    {statistics.total_collected !== undefined && (
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Collected</div>
                                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                {formatCurrency(statistics.total_collected)}
                                            </div>
                                        </div>
                                    )}
                                    {statistics.total_pending !== undefined && (
                                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Pending</div>
                                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                                {formatCurrency(statistics.total_pending)}
                                            </div>
                                        </div>
                                    )}
                                    {statistics.total_overdue !== undefined && (
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Overdue</div>
                                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                                {formatCurrency(statistics.total_overdue)}
                                            </div>
                                        </div>
                                    )}
                                    {statistics.average_amount !== undefined && (
                                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Average Amount</div>
                                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                {formatCurrency(statistics.average_amount)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </CardUI>
                    )}

                    {/* Notes if available */}
                    {feeType.notes && (
                        <CardUI className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <StickyNote className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg whitespace-pre-line dark:text-gray-300">
                                    {feeType.notes}
                                </div>
                            </CardContent>
                        </CardUI>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};