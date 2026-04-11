import { 
    DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, 
    ShoppingBag, Target, Zap, Activity 
} from 'lucide-react';

interface RevenueStats {
    totalRevenue: number;
    growthPercentage: number;
    revenuePerDay: number;
    forecastNextPeriod: number;
    totalTransactions: number;
    transactionGrowth: number;
    averageTransaction: number;
    bestDayOfWeek: string;
    peakRevenue: number;
    peakPeriod: string;
    lowestRevenue: number;
    revenueVariance: number;
}

interface RevenueStatsCardsProps {
    stats: RevenueStats;
    formatCurrency: (amount: number, withDecimals?: boolean) => string;
}

export function RevenueStatsCards({ stats, formatCurrency }: RevenueStatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                        <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium ${
                            stats.growthPercentage >= 0 
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                                : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                        }`}>
                            {stats.growthPercentage >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(stats.growthPercentage).toFixed(1)}%
                        </div>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                    <div className="flex justify-between">
                        <span>Daily avg:</span>
                        <span className="font-medium">{formatCurrency(stats.revenuePerDay)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Forecast next:</span>
                        <span className="font-medium">{formatCurrency(stats.forecastNextPeriod)}</span>
                    </div>
                </div>
            </div>

            {/* Transactions Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.totalTransactions.toLocaleString()}
                        </p>
                        <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium ${
                            stats.transactionGrowth >= 0 
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                                : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                        }`}>
                            {stats.transactionGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(stats.transactionGrowth).toFixed(1)}%
                        </div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                    <div className="flex justify-between">
                        <span>Avg. value:</span>
                        <span className="font-medium">{formatCurrency(stats.averageTransaction)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Best day:</span>
                        <span className="font-medium">{stats.bestDayOfWeek}</span>
                    </div>
                </div>
            </div>

            {/* Peak Performance Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak Period</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(stats.peakRevenue)}
                        </p>
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md text-xs font-medium">
                            <Target className="h-3 w-3" />
                            Highest
                        </div>
                    </div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-xs text-gray-500 truncate" title={stats.peakPeriod}>
                        {stats.peakPeriod || 'No data'}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Lowest:</span>
                        <span className="font-medium">{formatCurrency(stats.lowestRevenue)}</span>
                    </div>
                </div>
            </div>

            {/* Consistency Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consistency</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.revenueVariance < 1000 ? 'High' : stats.revenueVariance < 5000 ? 'Medium' : 'Low'}
                        </p>
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded-md text-xs font-medium">
                            <Activity className="h-3 w-3" />
                            Variance: {formatCurrency(stats.revenueVariance, false)}
                        </div>
                    </div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                    <div className="flex justify-between">
                        <span>Stability:</span>
                        <span className={`font-medium ${
                            stats.revenueVariance < 1000 ? 'text-green-600' : 
                            stats.revenueVariance < 5000 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                            {stats.revenueVariance < 1000 ? 'Excellent' : 
                             stats.revenueVariance < 5000 ? 'Good' : 'Needs Attention'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}