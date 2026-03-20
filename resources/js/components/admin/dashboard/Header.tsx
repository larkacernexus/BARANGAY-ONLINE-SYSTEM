import { Calendar, Clock, Activity, RefreshCw, Maximize2, Minimize2, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface HeaderProps {
    activeView: 'overview' | 'detailed' | 'analytics' | 'demographics';
    setActiveView: (view: 'overview' | 'detailed' | 'analytics' | 'demographics') => void;
    selectedTimeRange: 'today' | 'week' | 'month' | 'year';
    setSelectedTimeRange: (range: 'today' | 'week' | 'month' | 'year') => void;
    activeUsers: number;
    onRefresh: () => void;
    isRefreshing: boolean;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    isMobile?: boolean;
}

export function Header({ 
    activeView, 
    setActiveView, 
    selectedTimeRange, 
    setSelectedTimeRange,
    activeUsers,
    onRefresh,
    isRefreshing,
    isFullscreen,
    onToggleFullscreen,
    isMobile = false
}: HeaderProps) {
    const [dateTime, setDateTime] = useState(new Date());
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: isMobile ? 'short' : 'long', 
            year: 'numeric', 
            month: isMobile ? 'short' : 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    };

    const handleTimeRangeChange = (range: 'today' | 'week' | 'month' | 'year') => {
        setSelectedTimeRange(range);
        
        router.get(
            '/admin/dashboard',
            { dateRange: range },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );

        if (isMobile) {
            setShowMobileMenu(false);
        }
    };

    const handleViewChange = (view: 'overview' | 'detailed' | 'analytics' | 'demographics') => {
        setActiveView(view);
        if (isMobile) {
            setShowMobileMenu(false);
        }
    };

    // Mobile view
    if (isMobile) {
        return (
            <>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Barangay Dashboard
                        </h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {formatDate(dateTime)} • {formatTime(dateTime)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onToggleFullscreen}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                        >
                            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                        >
                            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 pt-16">
                        <div className="p-4 space-y-6">
                            {/* Views */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Views</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['overview', 'detailed', 'analytics', 'demographics'] as const).map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => handleViewChange(view)}
                                            className={`rounded-lg px-4 py-3 text-sm font-medium capitalize transition-all ${
                                                activeView === view
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                            }`}
                                        >
                                            {view}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Range */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Range</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['today', 'week', 'month', 'year'] as const).map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => handleTimeRangeChange(range)}
                                            className={`rounded-lg px-4 py-3 text-sm font-medium capitalize transition-all ${
                                                selectedTimeRange === range
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                            }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</h3>
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {activeUsers} Active Users
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Last updated: {formatTime(dateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={() => {
                                    onRefresh();
                                    setShowMobileMenu(false);
                                }}
                                disabled={isRefreshing}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom Stats Bar */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(dateTime)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {activeUsers} active
                        </span>
                    </div>
                </div>
            </>
        );
    }

    // Desktop view (original)
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                        Barangay Kibawe Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Welcome back! Here's what's happening in your barangay today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onToggleFullscreen}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                    >
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
                        <button 
                            onClick={() => setActiveView('overview')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                activeView === 'overview' 
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveView('detailed')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                activeView === 'detailed' 
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            Detailed
                        </button>
                        <button 
                            onClick={() => setActiveView('analytics')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                activeView === 'analytics' 
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            Analytics
                        </button>
                        <button 
                            onClick={() => setActiveView('demographics')}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                activeView === 'demographics' 
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            Demographics
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>{activeUsers} active users</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                        <button 
                            onClick={() => handleTimeRangeChange('today')}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                selectedTimeRange === 'today' 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                            }`}
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => handleTimeRangeChange('week')}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                selectedTimeRange === 'week' 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                            }`}
                        >
                            Week
                        </button>
                        <button 
                            onClick={() => handleTimeRangeChange('month')}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                selectedTimeRange === 'month' 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                            }`}
                        >
                            Month
                        </button>
                        <button 
                            onClick={() => handleTimeRangeChange('year')}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                selectedTimeRange === 'year' 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                            }`}
                        >
                            Year
                        </button>
                    </div>
                    <button 
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </div>
        </div>
    );
}