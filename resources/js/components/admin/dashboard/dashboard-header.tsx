// components/dashboard/dashboard-header.tsx
import { Calendar, Clock, Activity, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardHeaderProps {
    activeView: 'overview' | 'detailed' | 'analytics' | 'demographics';
    setActiveView: (view: 'overview' | 'detailed' | 'analytics' | 'demographics') => void;
    activeUsers: number;
    onRefresh: () => void;
    isRefreshing: boolean;
    selectedTimeRange: 'today' | 'week' | 'month' | 'year';
    setSelectedTimeRange: (range: 'today' | 'week' | 'month' | 'year') => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
}

export function DashboardHeader({
    activeView,
    setActiveView,
    activeUsers,
    onRefresh,
    isRefreshing,
    selectedTimeRange,
    setSelectedTimeRange,
    isFullscreen,
    toggleFullscreen
}: DashboardHeaderProps) {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
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

    const views: Array<{ id: typeof activeView; label: string }> = [
        { id: 'overview', label: 'Overview' },
        { id: 'detailed', label: 'Detailed' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'demographics', label: 'Demographics' }
    ];

    const timeRanges: Array<{ id: typeof selectedTimeRange; label: string }> = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'year', label: 'Year' }
    ];

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
                        onClick={toggleFullscreen}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                    >
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
                        {views.map((view) => (
                            <button
                                key={view.id}
                                onClick={() => setActiveView(view.id)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                    activeView === view.id 
                                        ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' 
                                        : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {view.label}
                            </button>
                        ))}
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
                        {timeRanges.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setSelectedTimeRange(range.id)}
                                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                    selectedTimeRange === range.id 
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
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