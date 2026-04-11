// resources/js/components/admin/announcements/AnnouncementsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Filter, Download, FilterX, Calendar, Flag, Clock, Users } from 'lucide-react';
import { AnnouncementFilters } from '@/types/admin/announcements/announcement.types';
import { RefObject } from 'react';

interface AnnouncementsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: AnnouncementFilters;
    updateFilter: (key: keyof AnnouncementFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    types: Record<string, string>;
    priorities: Record<string, string>;
    audienceTypes?: Record<string, string>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    handleExport?: () => void;
    // Separate filter states (not in filtersState)
    priorityFilter?: string;
    setPriorityFilter?: (value: string) => void;
    audienceTypeFilter?: string;
    setAudienceTypeFilter?: (value: string) => void;
    dateRangePreset?: string;
    setDateRangePreset?: (value: string) => void;
}

export default function AnnouncementsFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    types,
    priorities,
    audienceTypes = {},
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false,
    handleExport,
    priorityFilter = 'all',
    setPriorityFilter,
    audienceTypeFilter = 'all',
    setAudienceTypeFilter,
    dateRangePreset = '',
    setDateRangePreset
}: AnnouncementsFiltersProps) {
    
    // Format type options for select
    const typeOptions = Object.entries(types).map(([key, value]) => ({
        id: key,
        name: value
    }));

    // Status options
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'expired', label: 'Expired' },
        { value: 'upcoming', label: 'Upcoming' }
    ];

    // Priority options - matching database values (0-4)
    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: '0', label: 'Normal' },
        { value: '1', label: 'Low' },
        { value: '2', label: 'Medium' },
        { value: '3', label: 'High' },
        { value: '4', label: 'Urgent' }
    ];

    // Audience type options
    const audienceTypeOptions = Object.entries(audienceTypes).map(([key, value]) => ({
        id: key,
        name: value
    }));

    // Date range presets
    const dateRangePresets = [
        { value: '', label: 'Custom Range' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' }
    ];

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Handle date range preset change
    const handleDateRangePresetChange = (preset: string) => {
        setDateRangePreset?.(preset);
        
        const today = new Date();
        let fromDate = '';
        let toDate = '';
        
        switch (preset) {
            case 'today':
                fromDate = today.toISOString().split('T')[0];
                toDate = today.toISOString().split('T')[0];
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                fromDate = yesterday.toISOString().split('T')[0];
                toDate = yesterday.toISOString().split('T')[0];
                break;
            case 'this_week':
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay());
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                fromDate = firstDayOfWeek.toISOString().split('T')[0];
                toDate = lastDayOfWeek.toISOString().split('T')[0];
                break;
            case 'last_week':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                fromDate = lastWeekStart.toISOString().split('T')[0];
                toDate = lastWeekEnd.toISOString().split('T')[0];
                break;
            case 'this_month':
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                fromDate = firstDay.toISOString().split('T')[0];
                toDate = lastDay.toISOString().split('T')[0];
                break;
            case 'last_month':
                const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0);
                fromDate = lastMonthFirstDay.toISOString().split('T')[0];
                toDate = lastMonthLastDay.toISOString().split('T')[0];
                break;
            default:
                return;
        }
        
        if (fromDate) updateFilter('from_date', fromDate);
        if (toDate) updateFilter('to_date', toDate);
    };

    // Handle priority filter change - converts to string for parent
    const handlePriorityChange = (value: string) => {
        setPriorityFilter?.(value);
    };

    // Handle audience type filter change
    const handleAudienceTypeChange = (value: string) => {
        setAudienceTypeFilter?.(value);
    };

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search announcements by title, content, type..."
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={isLoading}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">
                                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                </span>
                                <span className="sm:hidden">
                                    {showAdvancedFilters ? 'Hide' : 'Filters'}
                                </span>
                            </Button>
                            {handleExport && (
                                <Button 
                                    variant="outline"
                                    className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={handleExport}
                                    disabled={isLoading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} announcements
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Type + Status + Priority + Audience Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Type
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.type || 'all'}
                                onChange={(e) => updateFilter('type', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Types</option>
                                {typeOptions.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Status
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Priority
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={priorityFilter}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                disabled={isLoading}
                            >
                                {priorityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Audience
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={audienceTypeFilter}
                                onChange={(e) => handleAudienceTypeChange(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Audiences</option>
                                {audienceTypeOptions.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Date Range with Presets */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Date Range (Created At)
                                    </Label>
                                    
                                    {/* Date Presets */}
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 mb-2"
                                        value={dateRangePreset}
                                        onChange={(e) => handleDateRangePresetChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {dateRangePresets.map(preset => (
                                            <option key={preset.value} value={preset.value}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Custom Date Range */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                updateFilter('status', 'active');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                updateFilter('status', 'expired');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Expired
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                updateFilter('status', 'upcoming');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Upcoming
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setPriorityFilter?.('4');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Urgent Priority
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setAudienceTypeFilter?.('all');
                                                setPriorityFilter?.('all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset All Filters
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Priority</span> - Urgent (4), High (3), Medium (2), Low (1), Normal (0)</p>
                                    <p>• <span className="font-medium">Date range</span> - Filters by creation date</p>
                                    <p>• <span className="font-medium">Status</span> - Active, expired, upcoming, or inactive announcements</p>
                                    <p>• <span className="font-medium">Audience</span> - Who this announcement targets</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}