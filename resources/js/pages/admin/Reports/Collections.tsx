import AppLayout from '@/layouts/admin-app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    DollarSign, Calendar, Download, Filter, TrendingUp, 
    BarChart3, ChevronDown, AlertCircle, RefreshCw, 
    PieChart, Loader2
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export default function CollectionsReport() {
    const { collections, categories, stats, filters, errors } = usePage().props;
    const [period, setPeriod] = useState(filters?.period || 'month');
    const [dateRange, setDateRange] = useState({
        start: filters?.start_date || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: filters?.end_date || new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');

    // Calculate derived stats
    const derivedStats = useMemo(() => {
        if (!collections || collections.length === 0) return null;
        
        const daysWithCollections = collections.filter(item => item.amount > 0).length;
        const totalDays = collections.length;
        const collectionRate = totalDays > 0 ? (daysWithCollections / totalDays) * 100 : 0;
        
        // Find trends (increase/decrease from previous period)
        let trend = 0;
        if (collections.length >= 2) {
            const firstHalf = collections.slice(0, Math.floor(collections.length / 2));
            const secondHalf = collections.slice(Math.floor(collections.length / 2));
            
            const firstHalfTotal = firstHalf.reduce((sum, item) => sum + item.amount, 0);
            const secondHalfTotal = secondHalf.reduce((sum, item) => sum + item.amount, 0);
            
            if (firstHalfTotal > 0) {
                trend = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
            }
        }
        
        return {
            collectionRate: Math.round(collectionRate),
            trend: Math.round(trend),
            daysWithCollections
        };
    }, [collections]);

    // Handle period change
    const handlePeriodChange = (value) => {
        setPeriod(value);
        let newStartDate = dateRange.start;
        const end = new Date(dateRange.end);
        
        // Auto-adjust start date based on period
        switch(value) {
            case 'day':
                newStartDate = dateRange.end;
                break;
            case 'week':
                const weekAgo = new Date(end);
                weekAgo.setDate(end.getDate() - 7);
                newStartDate = weekAgo.toISOString().split('T')[0];
                break;
            case 'month':
                const monthAgo = new Date(end);
                monthAgo.setMonth(end.getMonth() - 1);
                newStartDate = monthAgo.toISOString().split('T')[0];
                break;
            case 'year':
                const yearAgo = new Date(end);
                yearAgo.setFullYear(end.getFullYear() - 1);
                newStartDate = yearAgo.toISOString().split('T')[0];
                break;
        }
        
        setDateRange(prev => ({ ...prev, start: newStartDate }));
        
        fetchData({
            period: value,
            start_date: newStartDate,
            end_date: dateRange.end
        });
    };

    // Handle date range change with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (dateRange.start && dateRange.end) {
                fetchData({
                    period: period,
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [dateRange.start, dateRange.end]);

    // Fetch data function
    const fetchData = async (params) => {
        setIsLoading(true);
        try {
            await router.get(route('admin.reports.collections'), params, {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
                onError: () => setIsLoading(false)
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data:', error);
        }
    };

    // Handle export functionality
    const handleExport = async () => {
        try {
            setIsLoading(true);
            const response = await router.post(route('admin.reports.export'), {
                format: exportFormat,
                start_date: dateRange.start,
                end_date: dateRange.end,
                period: period,
                type: 'collections'
            }, {
                onFinish: () => setIsLoading(false)
            });
            
            // If the backend returns a download URL
            if (response?.props?.downloadUrl) {
                window.open(response.props.downloadUrl, '_blank');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
            setIsLoading(false);
        }
    };

    // Quick period buttons
    const quickPeriods = [
        { label: 'Today', days: 0 },
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'This Month', days: null, type: 'month' },
        { label: 'Last Month', days: null, type: 'last-month' }
    ];

    const handleQuickPeriod = (quickPeriod) => {
        const end = new Date();
        let start = new Date();
        
        if (quickPeriod.type === 'month') {
            start = new Date(end.getFullYear(), end.getMonth(), 1);
        } else if (quickPeriod.type === 'last-month') {
            start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
            end.setDate(0); // Last day of previous month
        } else if (quickPeriod.days > 0) {
            start.setDate(end.getDate() - quickPeriod.days);
        } else {
            start = end;
        }
        
        const newDateRange = {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
        
        setDateRange(newDateRange);
        fetchData({
            period: period,
            start_date: newDateRange.start,
            end_date: newDateRange.end
        });
    };

    // Reset to default
    const handleReset = () => {
        const defaultStart = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
        const defaultEnd = new Date().toISOString().split('T')[0];
        
        setDateRange({
            start: defaultStart,
            end: defaultEnd
        });
        setPeriod('month');
        
        fetchData({
            period: 'month',
            start_date: defaultStart,
            end_date: defaultEnd
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Collections Report" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Collections Report
                            </h1>
                            {isLoading && (
                                <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track daily fee collections and payment trends
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button 
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset
                        </button>
                        <div className="relative">
                            <button 
                                onClick={handleExport}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="h-4 w-4" />
                                Export
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block">
                                <button 
                                    onClick={() => setExportFormat('csv')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Export as CSV
                                </button>
                                <button 
                                    onClick={() => setExportFormat('pdf')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Export as PDF
                                </button>
                                <button 
                                    onClick={() => setExportFormat('excel')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Export as Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Period Selector */}
                <div className="flex flex-wrap gap-2">
                    {quickPeriods.map((quickPeriod, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickPeriod(quickPeriod)}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {quickPeriod.label}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {errors?.message && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-700 dark:text-red-300">{errors.message}</p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collections</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {formatCurrency(stats?.totalCollections || 0)}
                                    </p>
                                </div>
                            </div>
                            {derivedStats?.trend !== 0 && (
                                <span className={`text-sm font-medium ${derivedStats.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {derivedStats.trend > 0 ? '↑' : '↓'} {Math.abs(derivedStats.trend)}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Daily</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(stats?.averageDaily || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {collections?.length || 0} days analyzed
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Day</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(stats?.highestDay || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Peak collection day
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.totalTransactions || 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {derivedStats?.collectionRate || 0}% collection rate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Period Selection and Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Collection Trends
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Visualize collection patterns over time
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <select
                                    value={period}
                                    onChange={(e) => handlePeriodChange(e.target.value)}
                                    disabled={isLoading}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50"
                                >
                                    <option value="day">Daily</option>
                                    <option value="week">Weekly</option>
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                </select>
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Calendar className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {showDatePicker && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowDatePicker(false)}
                                    className="mt-6 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chart Display */}
                    <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
                                </div>
                            </div>
                        ) : collections && collections.length > 0 ? (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-0 flex items-end">
                                        {/* Simple bar chart visualization */}
                                        <div className="w-full flex items-end justify-between space-x-1 px-2">
                                            {collections.map((item, index) => {
                                                const maxAmount = Math.max(...collections.map(c => c.amount));
                                                const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className="flex flex-col items-center flex-1 group"
                                                        title={`${new Date(item.date).toLocaleDateString()}: ${formatCurrency(item.amount)} (${item.count} transactions)`}
                                                    >
                                                        <div 
                                                            className={`w-8 rounded-t-lg transition-all duration-300 ${
                                                                item.amount > 0 
                                                                    ? 'bg-gradient-to-t from-primary-600 to-primary-400 dark:from-primary-500 dark:to-primary-300 hover:from-primary-700 hover:to-primary-500'
                                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                            }`}
                                                            style={{ 
                                                                height: `${height}%`,
                                                                minHeight: '4px'
                                                            }}
                                                        />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                                                            {new Date(item.date).getDate()}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-300 dark:border-gray-700"></div>
                                </div>
                                <div className="mt-6 flex items-center justify-between text-sm">
                                    <div className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">{collections.length}</span> days analyzed
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400">
                                        {dateRange.start} to {dateRange.end}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No collection data for selected period</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Try selecting a different date range
                                    </p>
                                    <button
                                        onClick={handleReset}
                                        className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                    >
                                        Reset to default period
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown and Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category Breakdown */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Collections by Category
                            </h2>
                            <PieChart className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        
                        <div className="space-y-4">
                            {categories && categories.length > 0 ? (
                                <>
                                    {categories.map((category, index) => (
                                        <div key={index} className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-900/30 p-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                    index === 0 ? 'bg-blue-50 dark:bg-blue-900/20' :
                                                    index === 1 ? 'bg-green-50 dark:bg-green-900/20' :
                                                    index === 2 ? 'bg-amber-50 dark:bg-amber-900/20' :
                                                    index === 3 ? 'bg-purple-50 dark:bg-purple-900/20' :
                                                    'bg-gray-50 dark:bg-gray-900/20'
                                                }`}>
                                                    <DollarSign className={`h-5 w-5 ${
                                                        index === 0 ? 'text-blue-600 dark:text-blue-400' :
                                                        index === 1 ? 'text-green-600 dark:text-green-400' :
                                                        index === 2 ? 'text-amber-600 dark:text-amber-400' :
                                                        index === 3 ? 'text-purple-600 dark:text-purple-400' :
                                                        'text-gray-600 dark:text-gray-400'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {category.percentage}% of total
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(category.total_amount || 0)}
                                                </p>
                                                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            index === 0 ? 'bg-blue-600 dark:bg-blue-500' :
                                                            index === 1 ? 'bg-green-600 dark:bg-green-500' :
                                                            index === 2 ? 'bg-amber-600 dark:bg-amber-500' :
                                                            index === 3 ? 'bg-purple-600 dark:bg-purple-500' :
                                                            'bg-gray-600 dark:bg-gray-500'
                                                        }`}
                                                        style={{ width: `${category.percentage || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <PieChart className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No category data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Report Summary
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Period</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {period === 'day' ? 'Daily' : 
                                     period === 'week' ? 'Weekly' : 
                                     period === 'month' ? 'Monthly' : 'Yearly'}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Date Range</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {dateRange.start} to {dateRange.end}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Days Analyzed</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {collections?.length || 0}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Collection Rate</span>
                                <span className={`font-medium ${derivedStats?.collectionRate > 70 ? 'text-green-600 dark:text-green-400' : derivedStats?.collectionRate > 30 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {derivedStats?.collectionRate || 0}%
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Trend</span>
                                <span className={`font-medium ${derivedStats?.trend > 0 ? 'text-green-600 dark:text-green-400' : derivedStats?.trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {derivedStats?.trend > 0 ? '↑' : derivedStats?.trend < 0 ? '↓' : '→'} 
                                    {derivedStats?.trend ? ` ${Math.abs(derivedStats.trend)}%` : ' Stable'}
                                </span>
                            </div>
                            
                            <div className="pt-4">
                                <button
                                    onClick={handleExport}
                                    disabled={isLoading || !collections || collections.length === 0}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="h-4 w-4" />
                                    Export Full Report
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                                    Includes all data for selected period
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Collections Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Daily Collections
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {collections?.length || 0} days
                        </span>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Loading collection data...</p>
                        </div>
                    ) : collections && collections.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount Collected
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Transactions
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Daily Average
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {collections.map((item, index) => {
                                        const dailyAvg = item.count > 0 ? item.amount / item.count : 0;
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(item.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(item.amount || 0)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {item.count} transaction{item.count !== 1 ? 's' : ''}
                                                        </span>
                                                        {item.count > 0 && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                                Avg: {formatCurrency(dailyAvg)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-gray-700 dark:text-gray-300">
                                                        {item.count > 0 ? formatCurrency(dailyAvg) : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        item.amount > (stats?.averageDaily || 0) 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : item.amount > 0 
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                    }`}>
                                                        {item.amount > (stats?.averageDaily || 0) 
                                                            ? 'Above Average'
                                                            : item.amount > 0 
                                                            ? 'Collected'
                                                            : 'No Collections'
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No collection data available for the selected period</p>
                            <button
                                onClick={handleReset}
                                className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                            >
                                Reset to default period
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}