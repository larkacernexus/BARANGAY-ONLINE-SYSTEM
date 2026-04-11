import { ChevronUp, ChevronDown, Eye, EyeOff, ArrowUpRight, ArrowDownRight, LineChart } from 'lucide-react';
import { useState } from 'react';

interface ChartDataItem {
    period: string;
    total_revenue: number;
    transaction_count: number;
    avgPerTransaction: number;
    trend: number;
    displayPeriod: string;
    formattedRevenue: string;
}

interface RevenueChartProps {
    chartData: ChartDataItem[];
    period: string;
    dateRange: { start: string; end: string };
    initialRevenueDataLength: number;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
}

export default function RevenueChart({
    chartData,
    period,
    dateRange,
    initialRevenueDataLength,
    formatCurrency,
    formatDate,
    onSort,
    sortConfig
}: RevenueChartProps) {
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
    const [currencyDisplay, setCurrencyDisplay] = useState<'full' | 'short' | 'compact'>('full');
    const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());

    const getPeriodLabel = () => {
        switch (period) {
            case 'day': return 'Daily';
            case 'week': return 'Weekly';
            case 'month': return 'Monthly';
            case 'year': return 'Yearly';
            case 'custom': return 'Custom';
            default: return 'Monthly';
        }
    };

    const togglePeriodExpansion = (period: string) => {
        setExpandedPeriods(prev => {
            const next = new Set(prev);
            if (next.has(period)) {
                next.delete(period);
            } else {
                next.add(period);
            }
            return next;
        });
    };

    const getColorIntensity = (value: number, max: number) => {
        if (max === 0) return 'from-blue-100 to-blue-200';
        const percentage = (value / max) * 100;
        
        if (percentage > 75) return 'from-blue-600 to-blue-700';
        if (percentage > 50) return 'from-blue-400 to-blue-500';
        if (percentage > 25) return 'from-blue-300 to-blue-400';
        return 'from-blue-200 to-blue-300';
    };

    const chartMaxRevenue = Math.max(...chartData.map(item => item.total_revenue), 1);
    const avgTransactionMax = Math.max(...chartData.map(item => item.avgPerTransaction), 1);

    if (chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {getPeriodLabel()} analysis of revenue performance
                        </p>
                    </div>
                </div>
                <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex flex-col items-center justify-center p-6">
                    <LineChart className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-center">No revenue data available for the selected filters</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters or check back later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {getPeriodLabel()} analysis of revenue performance
                        {chartData.length > 0 && (
                            <span className="ml-2">
                                ({formatDate(dateRange.start)} to {formatDate(dateRange.end)})
                            </span>
                        )}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                chartType === 'bar'
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Bar
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                chartType === 'line'
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Line
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">{chartData.length}</span> of <span className="font-medium">{initialRevenueDataLength}</span> periods shown
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Chart Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Transaction</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrencyDisplay(prev => 
                                prev === 'full' ? 'short' : 
                                prev === 'short' ? 'compact' : 'full'
                            )}
                            className="px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
                        >
                            {currencyDisplay === 'full' ? '₱1,234.56' :
                             currencyDisplay === 'short' ? '₱1.2K' : '1.2K'}
                        </button>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="relative h-80 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6">
                    <div className="absolute inset-0 flex flex-col justify-between p-6">
                        {[0, 25, 50, 75, 100].map((percent, i) => (
                            <div key={i} className="flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                <div className="ml-4 text-xs text-gray-500 whitespace-nowrap">
                                    {formatCurrency((chartMaxRevenue * percent) / 100)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative h-full flex items-end gap-4 pt-8">
                        {chartData.map((item, index) => {
                            const heightPercent = (item.total_revenue / chartMaxRevenue) * 100;
                            
                            return (
                                <div key={index} className="flex-1 group">
                                    <div className="relative h-full flex items-end justify-center">
                                        {chartType === 'bar' ? (
                                            <div className="w-full max-w-16 flex flex-col items-center">
                                                <div 
                                                    className={`w-full rounded-t-sm bg-gradient-to-t ${getColorIntensity(item.total_revenue, chartMaxRevenue)} transition-all duration-300 group-hover:opacity-90`}
                                                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                >
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                        <div className="font-semibold">{item.displayPeriod}</div>
                                                        <div className="text-blue-300 mt-1">{formatCurrency(item.total_revenue)}</div>
                                                        <div className="text-gray-300 text-xs mt-1">
                                                            {item.transaction_count} transactions
                                                            {item.trend !== 0 && (
                                                                <span className={`ml-2 ${item.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                    ({item.trend >= 0 ? '+' : ''}{item.trend}%)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full">
                                                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 shadow-md"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-2 text-center">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {item.period.split(' ')[0]}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {item.period.split(' ').slice(1).join(' ')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                                    onClick={() => onSort('period')}>
                                    <div className="flex items-center gap-1">
                                        Period
                                        {sortConfig.key === 'period' && (
                                            sortConfig.direction === 'asc' ? 
                                            <ChevronUp className="h-4 w-4" /> : 
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                                    onClick={() => onSort('total_revenue')}>
                                    <div className="flex items-center gap-1">
                                        Revenue
                                        {sortConfig.key === 'total_revenue' && (
                                            sortConfig.direction === 'asc' ? 
                                            <ChevronUp className="h-4 w-4" /> : 
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Performance
                                </th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {chartData.map((item, index) => (
                                <>
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900 dark:text-white">{item.period}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.transaction_count} transactions</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.total_revenue)}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Avg: {formatCurrency(item.avgPerTransaction)}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {item.trend !== 0 ? (
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                        item.trend >= 0 
                                                            ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                                                            : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                                                    }`}>
                                                        {item.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                        {Math.abs(item.trend).toFixed(1)}%
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">No change</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => togglePeriodExpansion(item.period)}
                                                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                            >
                                                {expandedPeriods.has(item.period) ? (
                                                    <>
                                                        <EyeOff className="h-4 w-4" />
                                                        Hide details
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-4 w-4" />
                                                        View details
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedPeriods.has(item.period) && (
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <td colSpan={4} className="py-4 px-6">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <div className="font-medium">Transaction Details</div>
                                                            <div className="mt-1">{item.transaction_count} total transactions</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Average Value</div>
                                                            <div className="mt-1">{formatCurrency(item.avgPerTransaction)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Trend Analysis</div>
                                                            <div className={`mt-1 ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {item.trend >= 0 ? 'Growth' : 'Decline'} of {Math.abs(item.trend).toFixed(1)}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Period Rank</div>
                                                            <div className="mt-1">#{index + 1} of {chartData.length}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}