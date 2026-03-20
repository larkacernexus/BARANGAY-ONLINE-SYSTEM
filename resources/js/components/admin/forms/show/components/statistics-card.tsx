// resources/js/Pages/Admin/Forms/components/statistics-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    BarChart3,
    Eye,
    Download,
    TrendingUp,
} from 'lucide-react';
import { Form } from '../types';

interface Props {
    form: Form;
    download_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
    };
    view_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
    };
    formatDateTime: (date?: string) => string;
}

export const StatisticsCard = ({
    form,
    download_stats,
    view_stats,
    formatDateTime,
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5" />
                    Usage Statistics
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    View and download statistics for this form
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="dark:bg-gray-900">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold dark:text-gray-100">{view_stats?.total || 0}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-gray-900">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold dark:text-gray-100">{download_stats?.total || 0}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Downloads</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-gray-900">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold dark:text-gray-100">{download_stats?.this_month || 0}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Downloads This Month</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-gray-900">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold dark:text-gray-100">{view_stats?.this_month || 0}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Views This Month</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Activity</h3>
                        <div className="space-y-3">
                            {form.last_viewed_at && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-gray-300">Last Viewed</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {form.last_viewed_by?.name ? `by ${form.last_viewed_by.name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(form.last_viewed_at)}
                                    </span>
                                </div>
                            )}
                            {form.last_downloaded_at && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                            <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-gray-300">Last Downloaded</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {form.last_downloaded_by?.name ? `by ${form.last_downloaded_by.name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(form.last_downloaded_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};