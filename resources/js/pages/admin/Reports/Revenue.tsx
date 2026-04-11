import AppLayout from '@/layouts/admin-app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Import components
import RevenueHeader from '@/components/admin/reports/RevenueHeader';
import QuickActions from '@/components/admin/reports/QuickActions';
import RevenueFilterBar from '@/components/admin/reports/RevenueFilterBar';
import { RevenueStatsCards } from '@/components/admin/reports/RevenueStatsCards';
import RevenueInsights from '@/components/admin/reports/RevenueInsights';
import RevenueChart from '@/components/admin/reports/RevenueChart';
import PaymentMethodsBreakdown from '@/components/admin/reports/PaymentMethodsBreakdown';
import RevenueSummary from '@/components/admin/reports/RevenueSummary';

// Import helpers
import { 
    formatCurrency, 
    formatDate, 
    calculatePercentageChange,
    parsePeriodToDate,
    isDateInRange
} from '@/lib/report-helpers';

export default function RevenueReport() {
    const { props } = usePage();
    const { 
        revenueData: initialRevenueData = [], 
        revenueByMethod: initialRevenueByMethod = [], 
        filters: initialFilters = {}
    } = props;
    
    // State management
    const [period, setPeriod] = useState(initialFilters.period || 'month');
    const [dateRange, setDateRange] = useState({
        start: initialFilters.start_date || new Date().toISOString().split('T')[0],
        end: initialFilters.end_date || new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'period', direction: 'asc' });
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchData(), 30000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Fetch data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            await router.get('/admin/reports/revenue', {
                period,
                start_date: dateRange.start,
                end_date: dateRange.end
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLastUpdated(new Date());
                    toast.success('Data refreshed');
                },
                onError: () => toast.error('Failed to refresh data')
            });
        } finally {
            setIsLoading(false);
        }
    }, [period, dateRange]);

    // Calculate filtered data
    const filteredRevenueData = useMemo(() => {
        if (!initialRevenueData.length) return [];
        
        let filtered = [...initialRevenueData];
        
        // Filter by custom date range
        if (period === 'custom') {
            filtered = filtered.filter(item => {
                const periodDate = parsePeriodToDate(item.period, 'month');
                return isDateInRange(periodDate, dateRange.start, dateRange.end);
            });
        }
        
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.period?.toLowerCase().includes(query) ||
                formatCurrency(item.total_revenue).toLowerCase().includes(query) ||
                item.transaction_count?.toString().includes(query)
            );
        }
        
        // Sort data
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key] || 0;
            const bValue = b[sortConfig.key] || 0;
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        });
        
        return filtered;
    }, [initialRevenueData, period, dateRange, searchQuery, sortConfig]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!filteredRevenueData.length) {
            return {
                totalRevenue: 0,
                growthPercentage: 0,
                averageTransaction: 0,
                totalTransactions: 0,
                peakRevenue: 0,
                peakPeriod: '',
                lowestRevenue: 0,
                revenuePerDay: 0,
                transactionGrowth: 0,
                revenueVariance: 0,
                forecastNextPeriod: 0,
                bestDayOfWeek: 'Friday'
            };
        }

        const totalRevenue = filteredRevenueData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
        const totalTransactions = filteredRevenueData.reduce((sum, item) => sum + (item.transaction_count || 0), 0);
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        let peakRevenue = 0;
        let peakPeriod = '';
        filteredRevenueData.forEach(item => {
            if ((item.total_revenue || 0) > peakRevenue) {
                peakRevenue = item.total_revenue;
                peakPeriod = item.period;
            }
        });
        
        let growthPercentage = 0;
        if (filteredRevenueData.length >= 2) {
            const firstRevenue = filteredRevenueData[0].total_revenue || 0;
            const lastRevenue = filteredRevenueData[filteredRevenueData.length - 1].total_revenue || 0;
            growthPercentage = calculatePercentageChange(lastRevenue, firstRevenue);
        }
        
        const daysInRange = Math.max(1, Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)));
        const revenuePerDay = totalRevenue / daysInRange;
        
        const revenues = filteredRevenueData.map(item => item.total_revenue || 0);
        const mean = totalRevenue / revenues.length;
        const variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - mean, 2), 0) / revenues.length;
        
        let forecastNextPeriod = 0;
        if (revenues.length >= 3) {
            const lastThree = revenues.slice(-3);
            forecastNextPeriod = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
        }
        
        return {
            totalRevenue,
            growthPercentage: Math.round(growthPercentage * 10) / 10,
            averageTransaction: Math.round(averageTransaction * 100) / 100,
            totalTransactions,
            peakRevenue,
            peakPeriod,
            lowestRevenue: 0,
            revenuePerDay: Math.round(revenuePerDay * 100) / 100,
            transactionGrowth: 0,
            revenueVariance: Math.round(variance),
            forecastNextPeriod: Math.round(forecastNextPeriod * 100) / 100,
            bestDayOfWeek: 'Friday'
        };
    }, [filteredRevenueData, dateRange]);

    // Payment methods analysis
    const paymentMethodsAnalysis = useMemo(() => {
        const methods = initialRevenueByMethod || [];
        const totalRevenue = methods.reduce((sum, method) => sum + (method.total_revenue || 0), 0);
        
        return methods.map(method => ({
            ...method,
            percentage: totalRevenue > 0 ? Math.round((method.total_revenue / totalRevenue) * 100 * 10) / 10 : 0,
            averageValue: method.transaction_count > 0 ? method.total_revenue / method.transaction_count : 0,
            displayName: method.payment_method?.charAt(0).toUpperCase() + method.payment_method?.slice(1) || 'Unknown'
        })).sort((a, b) => b.total_revenue - a.total_revenue);
    }, [initialRevenueByMethod]);

    // Chart data
    const chartData = useMemo(() => {
        return filteredRevenueData.map((item, index) => {
            const avgPerTransaction = (item.transaction_count || 0) > 0 
                ? (item.total_revenue || 0) / item.transaction_count : 0;
            
            let trend = 0;
            if (index > 0) {
                const prevRevenue = filteredRevenueData[index - 1].total_revenue || 0;
                const currentRevenue = item.total_revenue || 0;
                trend = calculatePercentageChange(currentRevenue, prevRevenue);
            }
            
            return {
                ...item,
                avgPerTransaction: Math.round(avgPerTransaction * 100) / 100,
                trend: Math.round(trend * 10) / 10,
                displayPeriod: item.period
            };
        });
    }, [filteredRevenueData]);

    // Insights
    const insights = useMemo(() => {
        const insightsList = [];
        
        if (stats.growthPercentage > 20) {
            insightsList.push({
                type: 'positive',
                icon: TrendingUp,
                title: 'Strong Revenue Growth',
                description: `Revenue increased by ${stats.growthPercentage}% in selected period`,
                action: 'Consider increasing marketing budget'
            });
        } else if (stats.growthPercentage < -10) {
            insightsList.push({
                type: 'warning',
                icon: TrendingDown,
                title: 'Revenue Decline Detected',
                description: `Revenue decreased by ${Math.abs(stats.growthPercentage)}%`,
                action: 'Review recent changes and customer feedback'
            });
        }
        
        return insightsList.slice(0, 3);
    }, [stats]);

    // Quick actions
    const quickActions = [
        {
            label: 'Today',
            action: () => {
                const today = new Date();
                setPeriod('day');
                setDateRange({
                    start: today.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                });
            }
        },
        {
            label: 'This Week',
            action: () => {
                const today = new Date();
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                const startDate = new Date(today.getFullYear(), today.getMonth(), diff);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                setPeriod('week');
                setDateRange({
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                });
            }
        },
        {
            label: 'Last 30 Days',
            action: () => {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - 29);
                setPeriod('custom');
                setDateRange({
                    start: startDate.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                });
            }
        },
        {
            label: 'Year to Date',
            action: () => {
                const today = new Date();
                const startDate = new Date(today.getFullYear(), 0, 1);
                setPeriod('year');
                setDateRange({
                    start: startDate.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                });
            }
        }
    ];

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        const today = new Date();
        let startDate, endDate;
        
        if (newPeriod === 'day') {
            startDate = endDate = today;
        } else if (newPeriod === 'week') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(today.getFullYear(), today.getMonth(), diff);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
        } else if (newPeriod === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
        }
        
        setDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });
    };

    const handleResetFilters = () => {
        setPeriod('month');
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });
        setSearchQuery('');
        setSortConfig({ key: 'period', direction: 'asc' });
        toast.success('Filters reset to default');
    };

    const handleExport = () => {
        router.get('/admin/reports/revenue/export', {
            period,
            start_date: dateRange.start,
            end_date: dateRange.end,
            format: 'csv'
        });
        toast.success('Export started');
    };

    const hasActiveFilters = period !== 'month' || searchQuery || sortConfig.key !== 'period';

    return (
        <AppLayout title="Revenue Analytics" breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Reports', href: '/admin/reports' },
            { title: 'Revenue Analytics', href: '/admin/reports/revenue' }
        ]}>
            <Head title="Revenue Analytics" />

            <div className="space-y-6">
                <RevenueHeader
                    autoRefresh={autoRefresh}
                    isLoading={isLoading}
                    onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
                    onExport={handleExport}
                />

                <QuickActions actions={quickActions} />

                <RevenueFilterBar
                    period={period}
                    dateRange={dateRange}
                    searchQuery={searchQuery}
                    sortConfig={sortConfig}
                    isLoading={isLoading}
                    hasActiveFilters={hasActiveFilters}
                    onPeriodChange={handlePeriodChange}
                    onDateRangeChange={setDateRange}
                    onSearchChange={setSearchQuery}
                    onSortChange={setSortConfig}
                    onResetFilters={handleResetFilters}
                    onRefreshData={fetchData}
                />

                <RevenueStatsCards stats={stats} formatCurrency={formatCurrency} />

                <RevenueInsights insights={insights} />

                <RevenueChart
                    chartData={chartData}
                    period={period}
                    dateRange={dateRange}
                    initialRevenueDataLength={initialRevenueData.length}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    onSort={(key) => setSortConfig({
                        key,
                        direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                    sortConfig={sortConfig}
                />

                <PaymentMethodsBreakdown methods={paymentMethodsAnalysis} formatCurrency={formatCurrency} />

                <RevenueSummary
                    stats={stats}
                    filteredDataLength={filteredRevenueData.length}
                    isLoading={isLoading}
                    formatCurrency={formatCurrency}
                    onRefresh={fetchData}
                />
            </div>
        </AppLayout>
    );
}