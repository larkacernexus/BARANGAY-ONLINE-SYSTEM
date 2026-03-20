import { Link } from '@inertiajs/react';
import { BarChart3, PieChart, FileText } from 'lucide-react';
import { DailyCollectionsChart } from '../charts/DailyCollectionsChart';
import type { PageProps } from '@/components/admin/dashboard/types/dashboard';

interface DetailedViewProps {
    paymentStats: PageProps['paymentStats'];
    clearanceRequestStats: PageProps['clearanceRequestStats'];
    clearanceTypeStats: PageProps['clearanceTypeStats'];
}

export function DetailedView({ paymentStats, clearanceRequestStats, clearanceTypeStats }: DetailedViewProps) {
    const getClearanceTypeColor = (index: number) => {
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
            'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
            'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Weekly Collections Trend
                        </h3>
                    </div>
                    <select className="rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                    </select>
                </div>
                <DailyCollectionsChart dailyCollections={paymentStats.dailyCollections} />
            </div>
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Payment Methods
                        </h3>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        View details
                    </button>
                </div>
            </div>
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Clearance Request Status
                        </h3>
                    </div>
                    <Link href="/admin/clearance-requests" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        View all
                    </Link>
                </div>
                <div className="space-y-4">
                    {clearanceRequestStats.byStatus.map((status, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`rounded-full px-3 py-1 text-xs font-medium ${getClearanceTypeColor(index)}`}>
                                    {status.status}
                                </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {status.count}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Popular Clearance Types
                        </h3>
                    </div>
                    <Link href="/admin/clearance-types" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Manage types
                    </Link>
                </div>
                <div className="space-y-3">
                    {clearanceTypeStats
                        .sort((a, b) => b.monthly_requests - a.monthly_requests)
                        .slice(0, 5)
                        .map((type, index) => (
                            <div key={type.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {type.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {type.fee} • {type.processing_days} days processing
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {type.monthly_requests}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        this month
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}