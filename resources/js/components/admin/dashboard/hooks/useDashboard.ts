import { useState, useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types/admin/dashboard/dashboard';

export const DASHBOARD_URL = '/admin/dashboard';

export function useDashboard() {
    const { props } = usePage<PageProps>();
    const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'analytics' | 'demographics'>('overview');
    const [loading, setLoading] = useState(false);
    const [dateTime, setDateTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Auto-refresh data every 5 minutes if enabled
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            handleRefresh();
        }, 300000); // 5 minutes
        
        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Format time for display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    // Format date relative to now
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        if (diffInMinutes < 10080) {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            only: ['stats', 'recentActivities', 'paymentStats', 'clearanceRequestStats', 'collectionStats', 'activityStats', 'storageStats', 'demographicStats'],
            onSuccess: () => {
                setTimeout(() => setRefreshing(false), 500);
            },
            onError: () => {
                setRefreshing(false);
            }
        });
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Helper function to calculate change percentage
    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Calculate yesterday's data for comparison
    const getYesterdayStats = () => {
        const todayResidents = props.stats.totalResidents;
        const newResidentsToday = props.activityStats?.newResidentsToday ?? 0;
        const yesterdayResidents = Math.max(0, todayResidents - newResidentsToday);
        
        const yesterdayPayments = parseFloat(props.collectionStats.yesterday.replace(/,/g, '')) || 0;
        const todayPayments = parseFloat(props.collectionStats.today.replace(/,/g, '')) || 0;
        
        const pendingClearances = props.stats.pendingClearances;
        const clearanceRequestsToday = props.activityStats?.clearanceRequestsToday ?? 0;
        const yesterdayClearances = Math.max(0, pendingClearances - clearanceRequestsToday);
        
        return {
            residents: yesterdayResidents,
            payments: yesterdayPayments,
            clearances: yesterdayClearances
        };
    };

    return {
        props,
        activeView,
        setActiveView,
        loading,
        dateTime,
        isFullscreen,
        refreshing,
        selectedTimeRange,
        setSelectedTimeRange,
        autoRefresh,
        setAutoRefresh,
        formatDate,
        formatTime,
        formatRelativeTime,
        handleRefresh,
        toggleFullscreen,
        calculateChange,
        getYesterdayStats: getYesterdayStats(),
    };
}