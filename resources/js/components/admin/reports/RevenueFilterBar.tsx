import { toast } from '@/hooks/use-toast';
import { Calendar, RefreshCw, Search, X } from 'lucide-react';
import { useState } from 'react';

interface RevenueFilterBarProps {
    period: string;
    dateRange: { start: string; end: string };
    searchQuery: string;
    sortConfig: { key: string; direction: string };
    isLoading: boolean;
    hasActiveFilters: boolean;
    onPeriodChange: (period: string) => void;
    onDateRangeChange: (range: { start: string; end: string }) => void;
    onSearchChange: (query: string) => void;
    onSortChange: (config: { key: string; direction: string }) => void;
    onResetFilters: () => void;
    onRefreshData: () => void;
}

export default function RevenueFilterBar({
    period,
    dateRange,
    searchQuery,
    sortConfig,
    isLoading,
    hasActiveFilters,
    onPeriodChange,
    onDateRangeChange,
    onSearchChange,
    onSortChange,
    onResetFilters,
    onRefreshData
}: RevenueFilterBarProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    const handleCustomDateRange = () => {
        if (dateRange.start > dateRange.end) {
            toast.error('Start date cannot be after end date');
            return;
        }
        onPeriodChange('custom');
        setShowDatePicker(false);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search periods, amounts..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Calendar className="h-4 w-4" />
                        Date Range
                    </button>
                    
                    <button
                        onClick={onRefreshData}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
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
                                    onPeriodChange(p);
                                }
                            }}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === p 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                            } disabled:opacity-50 disabled:cursor-not-allowed capitalize`}
                        >
                            {p === 'custom' ? 'Custom Range' : p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Custom Date Range Picker */}
            {showDatePicker && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                onChange={(e) => onDateRangeChange({...dateRange, start: e.target.value})}
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
                                onChange={(e) => onDateRangeChange({...dateRange, end: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setShowDatePicker(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm">
                                    Search: "{searchQuery}"
                                    <button onClick={() => onSearchChange('')} className="ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            
                            {period !== 'month' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm">
                                    Period: {getPeriodLabel()}
                                    <button onClick={() => onPeriodChange('month')} className="ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            
                            {sortConfig.key !== 'period' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded text-sm">
                                    Sorted by: {sortConfig.key}
                                    <button onClick={() => onSortChange({ key: 'period', direction: 'asc' })} className="ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                        
                        <button
                            onClick={onResetFilters}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Clear all filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}