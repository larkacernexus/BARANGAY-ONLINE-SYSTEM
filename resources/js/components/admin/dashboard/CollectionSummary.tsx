import { CreditCard } from 'lucide-react';

interface CollectionSummaryProps {
    collectionStats: {
        today: string;
        yesterday: string;
        weekly: string;
        monthly: string;
        yearly: string;
        dailyAvg: string;
        monthlyAvg: string;
    };
}

export function CollectionSummary({ collectionStats }: CollectionSummaryProps) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Collection Summary
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Today's financial overview
                </p>
            </div>
            <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Today's Collection
                            </p>
                            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                                ₱{collectionStats.today}
                            </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Yesterday
                        </p>
                        <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                            ₱{collectionStats.yesterday}
                        </p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            This Week
                        </p>
                        <p className="mt-1 text-lg font-bold text-purple-800 dark:text-purple-200">
                            ₱{collectionStats.weekly}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            This Month
                        </p>
                        <p className="mt-1 text-lg font-bold text-amber-800 dark:text-amber-200">
                            ₱{collectionStats.monthly}
                        </p>
                    </div>
                    <div className="rounded-lg bg-cyan-50 p-4 dark:bg-cyan-900/20">
                        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                            This Year
                        </p>
                        <p className="mt-1 text-lg font-bold text-cyan-800 dark:text-cyan-200">
                            ₱{collectionStats.yearly}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            Daily Avg
                        </p>
                        <p className="mt-1 text-lg font-bold text-indigo-800 dark:text-indigo-200">
                            ₱{collectionStats.dailyAvg}
                        </p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-4 dark:bg-rose-900/20">
                        <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                            Monthly Avg
                        </p>
                        <p className="mt-1 text-lg font-bold text-rose-800 dark:text-rose-200">
                            ₱{collectionStats.monthlyAvg}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}