import { RefreshCw } from 'lucide-react';

interface RevenueSummaryProps {
    stats: {
        totalRevenue: number;
        totalTransactions: number;
        peakPeriod: string;
        revenuePerDay: number;
        growthPercentage: number;
    };
    filteredDataLength: number;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
    onRefresh: () => void;
}

export default function RevenueSummary({
    stats,
    filteredDataLength,
    isLoading,
    formatCurrency,
    onRefresh
}: RevenueSummaryProps) {
    return (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Total revenue of {formatCurrency(stats.totalRevenue)} from {stats.totalTransactions} transactions
                        across {filteredDataLength} periods.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3">
                        <div className="text-sm">
                            <div className="text-gray-500">Best period:</div>
                            <div className="font-medium">{stats.peakPeriod}</div>
                        </div>
                        <div className="text-sm">
                            <div className="text-gray-500">Revenue per day:</div>
                            <div className="font-medium">{formatCurrency(stats.revenuePerDay)}</div>
                        </div>
                        <div className="text-sm">
                            <div className="text-gray-500">Growth rate:</div>
                            <div className={`font-medium ${stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage}%
                            </div>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Updating...' : 'Update Report'}
                </button>
            </div>
        </div>
    );
}