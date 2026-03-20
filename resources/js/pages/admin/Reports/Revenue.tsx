import AppLayout from '@/layouts/admin-app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    DollarSign, 
    Calendar, 
    Download, 
    Filter, 
    TrendingUp, 
    BarChart3, 
    RefreshCw,
    CreditCard,
    Wallet,
    Landmark,
    Receipt,
    ChevronDown,
    ChevronUp,
    Activity,
    PieChart,
    Users,
    ShoppingBag,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    TrendingDown,
    LineChart,
    Target,
    X,
    Loader2,
    Search,
    Eye,
    EyeOff,
    AlertCircle,
    Info,
    Zap,
    CheckCircle
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

// Helper function to format currency with optional decimals
const formatCurrency = (amount, withDecimals = true) => {
    if (amount === null || amount === undefined) return '₱0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '₱0.00';
    
    return `₱${num.toLocaleString('en-PH', {
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0
    })}`;
};

// Helper function to format date with optional time
const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        };
        
        return date.toLocaleDateString('en-PH', options);
    } catch {
        return '';
    }
};

// Helper function to get relative time
const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
};

// Get payment method icon with fallback
const getPaymentMethodIcon = (method) => {
    const iconMap = {
        'cash': DollarSign,
        'credit_card': CreditCard,
        'gcash': Wallet,
        'maya': Wallet,
        'bank_transfer': Landmark,
        'check': Receipt,
        'online': Wallet,
        'mobile': Wallet,
        'paypal': Wallet,
        'stripe': CreditCard,
        'other': DollarSign,
    };
    
    const IconComponent = iconMap[method?.toLowerCase()] || DollarSign;
    return <IconComponent className="h-4 w-4" />;
};

// Get payment method display name
const getPaymentMethodName = (method) => {
    const nameMap = {
        'cash': 'Cash',
        'credit_card': 'Credit Card',
        'gcash': 'GCash',
        'maya': 'Maya',
        'bank_transfer': 'Bank Transfer',
        'check': 'Check',
        'online': 'Online Payment',
        'mobile': 'Mobile Wallet',
        'paypal': 'PayPal',
        'stripe': 'Stripe',
        'other': 'Other',
    };
    
    return nameMap[method?.toLowerCase()] || method || 'Unknown';
};

// Get color based on value (for heat maps)
const getColorIntensity = (value, max) => {
    if (max === 0) return 'from-blue-100 to-blue-200';
    const percentage = (value / max) * 100;
    
    if (percentage > 75) return 'from-blue-600 to-blue-700';
    if (percentage > 50) return 'from-blue-400 to-blue-500';
    if (percentage > 25) return 'from-blue-300 to-blue-400';
    return 'from-blue-200 to-blue-300';
};

// Calculate percentage change
const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
};

// Calculate chart max safely
const calculateChartMax = (data) => {
    if (!data || data.length === 0) return 1;
    const max = Math.max(...data.map(item => item.total_revenue || 0));
    return max > 0 ? max : 1;
};

// Get payment method color
const getPaymentMethodColor = (method) => {
    const colorMap = {
        'cash': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'credit_card': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'gcash': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'maya': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
        'bank_transfer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'check': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        'online': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
        'mobile': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
        'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    
    return colorMap[method?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

// Helper to check if date is within range
const isDateInRange = (dateString, startDate, endDate) => {
    if (!dateString) return false;
    try {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end day
        
        return date >= start && date <= end;
    } catch {
        return false;
    }
};

// Helper to parse period string to date (adjust based on your data format)
const parsePeriodToDate = (period, periodType) => {
    // This function needs to be adjusted based on your actual period format
    // Example: "Jan 2024", "Week 1 2024", "2024-01-01", etc.
    try {
        // Try to parse as date first
        const date = new Date(period);
        if (!isNaN(date.getTime())) return date;
        
        // Try common formats
        if (periodType === 'month') {
            // Handle "January 2024" format
            return new Date(period);
        } else if (periodType === 'week') {
            // Handle "Week 1, 2024" format
            const match = period.match(/Week (\d+), (\d+)/);
            if (match) {
                const week = parseInt(match[1]);
                const year = parseInt(match[2]);
                // Approximate: first week starts Jan 1
                return new Date(year, 0, (week - 1) * 7 + 1);
            }
        } else if (periodType === 'day') {
            // Handle "Mon, Jan 1, 2024" format
            return new Date(period);
        }
        
        // Default fallback
        return new Date();
    } catch {
        return new Date();
    }
};

export default function RevenueReport() {
    const { props } = usePage();
    const { 
        revenueData: initialRevenueData = [], 
        revenueByMethod: initialRevenueByMethod = [], 
        stats: initialStats = {}, 
        filters: initialFilters = {}
    } = props;
    
    // State management
    const [period, setPeriod] = useState(initialFilters.period || 'month');
    const [dateRange, setDateRange] = useState({
        start: initialFilters.start_date || new Date().toISOString().split('T')[0],
        end: initialFilters.end_date || new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'period', direction: 'asc' });
    const [expandedPeriods, setExpandedPeriods] = useState(new Set());
    const [visiblePaymentMethods, setVisiblePaymentMethods] = useState(new Set());
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
    const [currencyDisplay, setCurrencyDisplay] = useState('full'); // 'full', 'short', 'compact'
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Auto-refresh effect - only refresh data from server
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            fetchData();
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Fetch data from server (only for manual refresh or auto-refresh)
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
                onError: () => {
                    toast.error('Failed to refresh data');
                }
            });
        } finally {
            setIsLoading(false);
        }
    }, [period, dateRange]);

    // Calculate filtered data - ALL FILTERING DONE CLIENT-SIDE
    const filteredRevenueData = useMemo(() => {
        if (!initialRevenueData || initialRevenueData.length === 0) return [];
        
        let filtered = [...initialRevenueData];
        
        // Filter by period type (simplified based on period string)
        if (period === 'day') {
            // For daily view, show all data (since we don't have date in period string)
            // In real implementation, you'd filter based on actual dates
            filtered = filtered;
        } else if (period === 'week') {
            // For weekly view
            filtered = filtered;
        } else if (period === 'month') {
            // For monthly view
            filtered = filtered;
        } else if (period === 'year') {
            // For yearly view
            filtered = filtered;
        } else if (period === 'custom') {
            // For custom date range - filter based on period date
            filtered = filtered.filter(item => {
                try {
                    const periodDate = parsePeriodToDate(item.period, 'month'); // Adjust based on your data
                    return isDateInRange(periodDate, dateRange.start, dateRange.end);
                } catch {
                    return true; // If we can't parse, include it
                }
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
            
            if (sortConfig.key === 'period') {
                // Try to sort by date if possible
                try {
                    const aDate = parsePeriodToDate(a.period, period);
                    const bDate = parsePeriodToDate(b.period, period);
                    return sortConfig.direction === 'asc' 
                        ? aDate - bDate
                        : bDate - aDate;
                } catch {
                    // Fallback to string comparison
                    return sortConfig.direction === 'asc' 
                        ? a.period?.localeCompare(b.period || '') || 0
                        : b.period?.localeCompare(a.period || '') || 0;
                }
            }
            
            return sortConfig.direction === 'asc' 
                ? aValue - bValue
                : bValue - aValue;
        });
        
        return filtered;
    }, [initialRevenueData, period, dateRange, searchQuery, sortConfig]);

    // Filter payment methods based on date range
    const filteredRevenueByMethod = useMemo(() => {
        // Since we don't have date info for each payment method in the sample data,
        // we'll just return all methods for now
        // In real implementation, you'd filter based on transactions within date range
        return initialRevenueByMethod;
    }, [initialRevenueByMethod, dateRange]);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Toggle period expansion
    const togglePeriodExpansion = (period) => {
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

    // Calculate comprehensive stats
    const stats = useMemo(() => {
        if (!filteredRevenueData || filteredRevenueData.length === 0) {
            return {
                totalRevenue: 0,
                growthPercentage: 0,
                averageTransaction: 0,
                totalTransactions: 0,
                peakRevenue: 0,
                peakPeriod: '',
                lowestRevenue: 0,
                lowestPeriod: '',
                revenuePerDay: 0,
                transactionGrowth: 0,
                revenueVariance: 0,
                forecastNextPeriod: 0,
                bestDayOfWeek: '',
                bestDayRevenue: 0
            };
        }

        const totalRevenue = filteredRevenueData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
        const totalTransactions = filteredRevenueData.reduce((sum, item) => sum + (item.transaction_count || 0), 0);
        const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        
        // Find peak and lowest periods
        let peakRevenue = 0;
        let peakPeriod = '';
        let lowestRevenue = Infinity;
        let lowestPeriod = '';
        
        filteredRevenueData.forEach(item => {
            const revenue = item.total_revenue || 0;
            if (revenue > peakRevenue) {
                peakRevenue = revenue;
                peakPeriod = item.period;
            }
            if (revenue < lowestRevenue && revenue > 0) {
                lowestRevenue = revenue;
                lowestPeriod = item.period;
            }
        });
        
        // Calculate growth percentage based on first and last period
        let growthPercentage = 0;
        if (filteredRevenueData.length >= 2) {
            const firstPeriodRevenue = filteredRevenueData[0].total_revenue || 0;
            const lastPeriodRevenue = filteredRevenueData[filteredRevenueData.length - 1].total_revenue || 0;
            growthPercentage = calculatePercentageChange(lastPeriodRevenue, firstPeriodRevenue);
        }

        // Calculate transaction growth
        let transactionGrowth = 0;
        if (filteredRevenueData.length >= 2) {
            const firstTransactions = filteredRevenueData[0].transaction_count || 0;
            const lastTransactions = filteredRevenueData[filteredRevenueData.length - 1].transaction_count || 0;
            transactionGrowth = calculatePercentageChange(lastTransactions, firstTransactions);
        }

        // Calculate revenue per day (if we have date range)
        const daysInRange = Math.max(1, Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)));
        const revenuePerDay = totalRevenue / daysInRange;

        // Calculate variance
        const revenues = filteredRevenueData.map(item => item.total_revenue || 0);
        const mean = totalRevenue / revenues.length;
        const variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - mean, 2), 0) / revenues.length;

        // Simple forecast (moving average of last 3 periods)
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
            lowestRevenue: lowestRevenue === Infinity ? 0 : lowestRevenue,
            lowestPeriod,
            revenuePerDay: Math.round(revenuePerDay * 100) / 100,
            transactionGrowth: Math.round(transactionGrowth * 10) / 10,
            revenueVariance: Math.round(variance),
            forecastNextPeriod: Math.round(forecastNextPeriod * 100) / 100,
            bestDayOfWeek: 'Friday', // This would need actual calculation
            bestDayRevenue: peakRevenue
        };
    }, [filteredRevenueData, dateRange]);

    // Payment methods analysis
    const paymentMethodsAnalysis = useMemo(() => {
        const methods = filteredRevenueByMethod || [];
        const totalRevenue = methods.reduce((sum, method) => sum + (method.total_revenue || 0), 0);
        
        const withMetrics = methods.map(method => {
            const percentage = totalRevenue > 0 ? (method.total_revenue / totalRevenue) * 100 : 0;
            const transactionsPerMethod = method.transaction_count || 0;
            const averageValue = transactionsPerMethod > 0 ? method.total_revenue / transactionsPerMethod : 0;
            
            return {
                ...method,
                percentage: Math.round(percentage * 10) / 10,
                averageValue: Math.round(averageValue * 100) / 100,
                displayName: getPaymentMethodName(method.payment_method),
                isVisible: visiblePaymentMethods.has(method.payment_method) || visiblePaymentMethods.size === 0
            };
        });
        
        // Sort by revenue descending
        return withMetrics.sort((a, b) => b.total_revenue - a.total_revenue);
    }, [filteredRevenueByMethod, visiblePaymentMethods]);

    // Chart data preparation
    const chartData = useMemo(() => {
        if (!filteredRevenueData || filteredRevenueData.length === 0) return [];
        
        return filteredRevenueData.map((item, index) => {
            const avgPerTransaction = (item.transaction_count || 0) > 0 
                ? (item.total_revenue || 0) / item.transaction_count 
                : 0;
            
            // Calculate trend (compared to previous period)
            let trend = 0;
            if (index > 0) {
                const prevRevenue = filteredRevenueData[index - 1].total_revenue || 0;
                const currentRevenue = item.total_revenue || 0;
                trend = calculatePercentageChange(currentRevenue, prevRevenue);
            }
            
            return {
                ...item,
                formattedRevenue: formatCurrency(item.total_revenue),
                displayPeriod: item.period,
                avgPerTransaction: Math.round(avgPerTransaction * 100) / 100,
                trend: Math.round(trend * 10) / 10,
                isExpanded: expandedPeriods.has(item.period)
            };
        });
    }, [filteredRevenueData, expandedPeriods]);

    // Calculate chart max revenue
    const chartMaxRevenue = useMemo(() => {
        return calculateChartMax(chartData);
    }, [chartData]);

    // Calculate average transaction max for scaling
    const avgTransactionMax = useMemo(() => {
        if (!chartData || chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(item => item.avgPerTransaction || 0));
        return max > 0 ? max : 1;
    }, [chartData]);

    // Handle export with current filters
    const handleExport = (format = 'csv', includeCharts = false) => {
        setIsLoading(true);
        
        const exportData = {
            period,
            start_date: dateRange.start,
            end_date: dateRange.end,
            format,
            include_charts: includeCharts,
            include_details: true
        };
        
        router.get('/admin/reports/revenue/export', exportData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                toast.success(`${format.toUpperCase()} export started`);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to export');
            }
        });
    };

    // Handle period change - NO API CALL, just update state
    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        
        // Auto-adjust date range based on period
        const today = new Date();
        let startDate, endDate;
        
        if (newPeriod === 'day') {
            startDate = today;
            endDate = today;
        } else if (newPeriod === 'week') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(today.getFullYear(), today.getMonth(), diff);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
        } else if (newPeriod === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (newPeriod === 'year') {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
        }
        
        setDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });
    };

    // Handle custom date range - NO API CALL
    const handleCustomDateRange = () => {
        if (dateRange.start > dateRange.end) {
            toast.error('Start date cannot be after end date');
            return;
        }
        setPeriod('custom');
        toast.success('Date range applied');
        setShowDatePicker(false);
    };

    // Handle reset filters
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

    // Quick actions - NO API CALLS
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

    // Get insights based on data
    const insights = useMemo(() => {
        if (!filteredRevenueData || filteredRevenueData.length === 0) return [];
        
        const insightsList = [];
        
        // Revenue growth insight
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
                description: `Revenue decreased by ${Math.abs(stats.growthPercentage)}% in selected period`,
                action: 'Review recent changes and customer feedback'
            });
        }
        
        // Average transaction value insight
        if (stats.averageTransaction > 5000) {
            insightsList.push({
                type: 'positive',
                icon: DollarSign,
                title: 'High Average Transaction Value',
                description: `Average transaction is ${formatCurrency(stats.averageTransaction)}`,
                action: 'Focus on high-value customer retention'
            });
        }
        
        // Payment method concentration insight
        const topMethod = paymentMethodsAnalysis[0];
        if (topMethod && topMethod.percentage > 50) {
            insightsList.push({
                type: 'info',
                icon: AlertCircle,
                title: 'Payment Method Concentration',
                description: `${topMethod.displayName} accounts for ${topMethod.percentage}% of revenue`,
                action: 'Consider diversifying payment options'
            });
        }
        
        // Revenue consistency insight
        if (stats.revenueVariance < (stats.totalRevenue * 0.1)) {
            insightsList.push({
                type: 'positive',
                icon: CheckCircle,
                title: 'Stable Revenue Stream',
                description: 'Revenue shows consistent performance',
                action: 'Maintain current business operations'
            });
        }
        
        return insightsList.slice(0, 3); // Limit to 3 insights
    }, [stats, paymentMethodsAnalysis]);

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Get period label
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

    // Check if we have active filters
    const hasActiveFilters = period !== 'month' || 
        searchQuery || 
        sortConfig.key !== 'period' || 
        sortConfig.direction !== 'asc' ||
        dateRange.start !== new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] ||
        dateRange.end !== new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    if (isLoading && !filteredRevenueData.length) {
        return (
            <AppLayout
                title="Revenue Analytics"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Reports', href: '/admin/reports' },
                    { title: 'Revenue Analytics', href: '/admin/reports/revenue' }
                ]}
            >
                <Head title="Revenue Analytics" />
                <LoadingSkeleton />
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Revenue Analytics"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Reports', href: '/admin/reports' },
                { title: 'Revenue Analytics', href: '/admin/reports/revenue' }
            ]}
        >
            <Head title="Revenue Analytics" />

            <div className="space-y-6">
                {/* Header with quick stats */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Revenue Analytics
                            </h1>
                            {isLoading && (
                                <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Real-time revenue tracking and analysis
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                {getRelativeTime(lastUpdated.toISOString())}
                            </span>
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Auto-refresh toggle */}
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                autoRefresh
                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                            {autoRefresh ? 'Auto On' : 'Auto Refresh'}
                        </button>
                        
                        {/* Export button */}
                        <button 
                            onClick={() => handleExport('csv')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.action}
                            className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search periods, amounts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <Calendar className="h-4 w-4" />
                                Date Range
                            </button>
                            
                            <button
                                onClick={fetchData}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </button>
                        </div>
                    </div>
                    
                    {/* Period Selection */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Period
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['day', 'week', 'month', 'year', 'custom'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        if (p === 'custom') {
                                            setShowDatePicker(!showDatePicker);
                                        } else {
                                            handlePeriodChange(p);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === p 
                                        ? 'bg-primary-600 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900'
                                    } disabled:opacity-50 disabled:cursor-not-allowed capitalize`}
                                >
                                    {p === 'custom' ? 'Custom Range' : p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Custom Date Range Picker */}
                    {showDatePicker && (
                        <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Custom Date Range
                                </label>
                                <button
                                    onClick={() => setShowDatePicker(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowDatePicker(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCustomDateRange}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Range
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Active filters display */}
                    {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-gray-500">Active filters:</span>
                                    
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                                            Search: "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')} className="ml-1">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    
                                    {period !== 'month' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                                            Period: {getPeriodLabel()}
                                            <button onClick={() => setPeriod('month')} className="ml-1">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    
                                    {sortConfig.key !== 'period' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-sm">
                                            Sorted by: {sortConfig.key}
                                            <button onClick={() => setSortConfig({ key: 'period', direction: 'asc' })} className="ml-1">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                                
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Grid with Enhanced Metrics */}
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

                {/* Insights & Recommendations */}
                {insights.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insights & Recommendations</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Automated insights based on your data</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-3">
                            {insights.map((insight, index) => {
                                const Icon = insight.icon;
                                return (
                                    <div key={index} className={`p-4 rounded-lg border ${
                                        insight.type === 'positive' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
                                        insight.type === 'warning' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' :
                                        'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                                    }`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded ${
                                                insight.type === 'positive' ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400' :
                                                insight.type === 'warning' ? 'bg-amber-100 dark:bg-amber-800/30 text-amber-600 dark:text-amber-400' :
                                                'bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                                                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    💡 {insight.action}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Revenue Chart Section - Enhanced */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Revenue Trends
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {getPeriodLabel()} analysis of revenue performance
                                {filteredRevenueData.length > 0 && (
                                    <span className="ml-2">
                                        ({formatDate(dateRange.start)} to {formatDate(dateRange.end)})
                                    </span>
                                )}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
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
                                <span className="font-medium">{filteredRevenueData.length}</span> of <span className="font-medium">{initialRevenueData.length}</span> periods shown
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Chart Visualization */}
                    {chartData.length > 0 ? (
                        <div className="space-y-6">
                            {/* Chart Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
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
                                        className="px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-900 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
                                    >
                                        {currencyDisplay === 'full' ? '₱1,234.56' :
                                         currencyDisplay === 'short' ? '₱1.2K' : '1.2K'}
                                    </button>
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="relative h-80 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-6">
                                {/* Chart Grid */}
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

                                {/* Chart Bars/Lines */}
                                <div className="relative h-full flex items-end gap-4 pt-8">
                                    {chartData.map((item, index) => {
                                        // Use the pre-calculated chartMaxRevenue
                                        const heightPercent = (item.total_revenue / chartMaxRevenue) * 100;
                                        const avgHeightPercent = (item.avgPerTransaction / avgTransactionMax) * 50;
                                        
                                        return (
                                            <div key={index} className="flex-1 group">
                                                <div className="relative h-full flex items-end justify-center">
                                                    {/* Bar Chart */}
                                                    {chartType === 'bar' ? (
                                                        <div className="w-full max-w-16 flex flex-col items-center">
                                                            <div 
                                                                className={`w-full rounded-t-sm bg-gradient-to-t ${getColorIntensity(item.total_revenue, chartMaxRevenue)} transition-all duration-300 group-hover:opacity-90`}
                                                                style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                            >
                                                                {/* Hover tooltip */}
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
                                                        /* Line Chart */
                                                        <div className="relative w-full">
                                                            {/* Line segment would be drawn here */}
                                                            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 shadow-md"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* X-axis labels */}
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

                            {/* Detailed Data Table with Expandable Rows */}
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer"
                                                onClick={() => handleSort('period')}>
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
                                                onClick={() => handleSort('total_revenue')}>
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
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                    <td className="py-4 px-6">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {item.period}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.transaction_count} transactions
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(item.total_revenue)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Avg: {formatCurrency(item.avgPerTransaction)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            {item.trend !== 0 ? (
                                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                                    item.trend >= 0 
                                                                        ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                                                                        : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                                                                }`}>
                                                                    {item.trend >= 0 ? 
                                                                        <ArrowUpRight className="h-3 w-3" /> : 
                                                                        <ArrowDownRight className="h-3 w-3" />
                                                                    }
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
                                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
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
                    ) : (
                        <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center p-6">
                            <LineChart className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                                No revenue data available for the selected filters
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Try adjusting your filters or check back later
                            </p>
                            <button
                                onClick={handleResetFilters}
                                className="mt-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Payment Methods Breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Payment Methods Breakdown
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Revenue distribution across different payment methods
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {paymentMethodsAnalysis.map(method => (
                                <button
                                    key={method.payment_method}
                                    onClick={() => {
                                        setVisiblePaymentMethods(prev => {
                                            const next = new Set(prev);
                                            if (next.has(method.payment_method)) {
                                                next.delete(method.payment_method);
                                            } else {
                                                next.add(method.payment_method);
                                            }
                                            return next;
                                        });
                                    }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                        visiblePaymentMethods.has(method.payment_method) || visiblePaymentMethods.size === 0
                                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                            : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 line-through'
                                    }`}
                                >
                                    {method.displayName}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paymentMethodsAnalysis.map((method, index) => (
                            <div key={method.payment_method} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getPaymentMethodColor(method.payment_method)}`}>
                                            {getPaymentMethodIcon(method.payment_method)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {method.displayName}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {method.transaction_count} transactions
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(method.total_revenue)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {method.percentage}% of total
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Share of revenue</span>
                                        <span>{method.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${method.percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>Avg. transaction: {formatCurrency(method.averageValue)}</span>
                                        <span>#{index + 1} by revenue</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Total revenue of {formatCurrency(stats.totalRevenue)} from {stats.totalTransactions} transactions
                                across {filteredRevenueData.length} periods.
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
                            onClick={fetchData}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Updating...' : 'Update Report'}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}