// components/admin/dashboard/FloatingFilterBar.tsx
import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, Maximize2, X } from 'lucide-react';

interface FloatingFilterBarProps {
    selectedTimeRange: 'today' | 'week' | 'month' | 'year';
    setSelectedTimeRange: (range: 'today' | 'week' | 'month' | 'year') => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    activeUsers?: number;
}

export function FloatingFilterBar({ 
    selectedTimeRange, 
    setSelectedTimeRange, 
    onRefresh, 
    isRefreshing,
    isFullscreen,
    onToggleFullscreen,
    activeUsers = 0
}: FloatingFilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        
        checkDarkMode();
        
        // Watch for dark mode changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
        
        return () => observer.disconnect();
    }, []);
    
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = currentDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const timeRangeOptions = [
        { value: 'today', label: 'Today', icon: Calendar },
        { value: 'week', label: 'This Week', icon: Calendar },
        { value: 'month', label: 'This Month', icon: Calendar },
        { value: 'year', label: 'This Year', icon: Calendar },
    ] as const;

    const getBadgeNumber = () => {
        switch (selectedTimeRange) {
            case 'today': return '1';
            case 'week': return '7';
            case 'month': return '30';
            case 'year': return '365';
            default: return '7';
        }
    };

    const getRangeLabel = () => {
        switch (selectedTimeRange) {
            case 'today': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            default: return 'This Week';
        }
    };

    return (
        <>
            {/* Collapsed floating button */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl dark:shadow-blue-900/20 transition-all duration-300 hover:scale-110 group"
                    aria-label="Open filters"
                >
                    <Filter className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                        {getBadgeNumber()}
                    </span>
                </button>
            )}

            {/* Expanded floating filter bar */}
            {isExpanded && (
                <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 w-[480px] max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-2 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-lg p-2 shadow-md">
                                <Filter className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Dashboard Filters</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate} • {formattedTime}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Close filters"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Time Range Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                            Time Range
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                            {timeRangeOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedTimeRange(option.value)}
                                        className={`
                                            flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                                            ${selectedTimeRange === option.value 
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-md scale-105' 
                                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Users & Stats */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                                    <div className="absolute inset-0 w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-ping opacity-75" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-200">
                                    <span className="font-semibold">{activeUsers}</span> active users
                                </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                                {getRangeLabel()}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                onRefresh();
                            }}
                            disabled={isRefreshing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">
                                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                            </span>
                        </button>
                        
                        <button
                            onClick={onToggleFullscreen}
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow"
                            aria-label="Toggle fullscreen"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm hover:shadow"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Auto-refresh: 5 min
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}