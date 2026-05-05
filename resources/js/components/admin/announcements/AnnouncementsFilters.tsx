// resources/js/components/admin/announcements/AnnouncementsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, Download, FilterX, Calendar, Flag, Clock, Users, Megaphone, TrendingUp, AlertCircle } from 'lucide-react';
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
    priorityFilter: string;
    setPriorityFilter: (value: string) => void;
    audienceTypeFilter: string;
    setAudienceTypeFilter: (value: string) => void;
    dateRangePreset: string;
    setDateRangePreset: (value: string) => void;
    perPage?: string;
    onPerPageChange?: (value: string) => void;
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
    priorityFilter,
    setPriorityFilter,
    audienceTypeFilter,
    setAudienceTypeFilter,
    dateRangePreset,
    setDateRangePreset,
    perPage,
    onPerPageChange,
}: AnnouncementsFiltersProps) {
    
    const typeOptions = Object.entries(types).map(([key, value]) => ({
        id: key,
        name: value
    }));

    const statusOptions = [
        { value: 'all', label: 'All Status', color: 'gray' },
        { value: 'active', label: 'Active', color: 'emerald' },
        { value: 'inactive', label: 'Inactive', color: 'gray' },
        { value: 'expired', label: 'Expired', color: 'rose' },
        { value: 'upcoming', label: 'Upcoming', color: 'blue' }
    ];

    const priorityOptions = [
        { value: 'all', label: 'All Priorities', color: 'gray' },
        { value: '0', label: 'Normal', color: 'gray' },
        { value: '1', label: 'Low', color: 'blue' },
        { value: '2', label: 'Medium', color: 'amber' },
        { value: '3', label: 'High', color: 'orange' },
        { value: '4', label: 'Urgent', color: 'red' }
    ];

    const audienceTypeOptions = Object.entries(audienceTypes).map(([key, value]) => ({
        id: key,
        name: value
    }));

    const dateRangePresets = [
        { value: '', label: 'Custom Range' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' }
    ];

    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.type && filtersState.type !== 'all') count++;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (priorityFilter && priorityFilter !== 'all') count++;
        if (audienceTypeFilter && audienceTypeFilter !== 'all') count++;
        if (filtersState.from_date) count++;
        if (filtersState.to_date) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    const handleDateRangePresetChange = (preset: string) => {
        setDateRangePreset(preset);
        
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

    const getPriorityInfo = (value: string) => {
        const option = priorityOptions.find(o => o.value === value);
        return { label: option?.label || value, color: option?.color || 'gray' };
    };

    const getStatusInfo = (value: string) => {
        const option = statusOptions.find(o => o.value === value);
        return { label: option?.label || value, color: option?.color || 'gray' };
    };

    const getAudienceTypeLabel = (value: string) => {
        const type = audienceTypeOptions.find(t => t.id === value);
        return type?.name || value;
    };

    const getTypeLabel = (value: string) => {
        const type = typeOptions.find(t => t.id === value);
        return type?.name || value;
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search announcements by title, content, type, or audience..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
                                    disabled={isLoading}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                disabled={isLoading}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">
                                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                </span>
                                <span className="sm:hidden">
                                    {showAdvancedFilters ? 'Hide' : 'Filters'}
                                </span>
                                {!showAdvancedFilters && activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0 text-xs">
                                        +{activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                            {handleExport && (
                                <Button 
                                    variant="outline"
                                    className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                    onClick={handleExport}
                                    disabled={isLoading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline font-medium">Export</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">announcements</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">"{search}"</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {hasActiveFilters && (
                                <>
                                    {filtersState.type && filtersState.type !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Flag className="h-3 w-3 mr-1 inline" />
                                            {getTypeLabel(filtersState.type)}
                                        </Badge>
                                    )}
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusInfo(filtersState.status).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getStatusInfo(filtersState.status).color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                                            getStatusInfo(filtersState.status).color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Clock className="h-3 w-3 mr-1 inline" />
                                            {getStatusInfo(filtersState.status).label}
                                        </Badge>
                                    )}
                                    {priorityFilter && priorityFilter !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            priorityFilter === '4' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            priorityFilter === '3' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                            priorityFilter === '2' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <AlertCircle className="h-3 w-3 mr-1 inline" />
                                            Priority: {getPriorityInfo(priorityFilter).label}
                                        </Badge>
                                    )}
                                    {audienceTypeFilter && audienceTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            Audience: {getAudienceTypeLabel(audienceTypeFilter)}
                                        </Badge>
                                    )}
                                    {(filtersState.from_date || filtersState.to_date) && (
                                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {filtersState.from_date && filtersState.to_date 
                                                ? `${filtersState.from_date} → ${filtersState.to_date}`
                                                : filtersState.from_date 
                                                    ? `From ${filtersState.from_date}`
                                                    : `Until ${filtersState.to_date}`}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {/* Type Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Type
                            </Label>
                            <Select
                                value={filtersState.type || 'all'}
                                onValueChange={(value) => updateFilter('type', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {typeOptions.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={filtersState.status || 'all'}
                                onValueChange={(value) => updateFilter('status', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Priority
                            </Label>
                            <Select
                                value={priorityFilter}
                                onValueChange={setPriorityFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <span className="flex items-center gap-2">
                                                {option.value !== 'all' && (
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        option.value === '4' ? 'bg-red-500' :
                                                        option.value === '3' ? 'bg-orange-500' :
                                                        option.value === '2' ? 'bg-amber-500' :
                                                        option.value === '1' ? 'bg-blue-500' :
                                                        'bg-gray-400'
                                                    }`} />
                                                )}
                                                {option.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Audience Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Audience
                            </Label>
                            <Select
                                value={audienceTypeFilter}
                                onValueChange={setAudienceTypeFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Audiences" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Audiences</SelectItem>
                                    {audienceTypeOptions.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date Range with Presets */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Date Range (Created At)
                                    </Label>
                                    
                                    <Select
                                        value={dateRangePreset}
                                        onValueChange={handleDateRangePresetChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="Custom Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dateRangePresets.map(preset => (
                                                <SelectItem key={preset.value} value={preset.value}>
                                                    {preset.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setPriorityFilter('4');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Urgent Priority
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setAudienceTypeFilter('all');
                                                setPriorityFilter('all');
                                                updateFilter('from_date', '');
                                                updateFilter('to_date', '');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <FilterX className="h-3 w-3 mr-1" />
                                            Reset Advanced
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Megaphone className="h-3 w-3" />
                                    Announcement Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Priority</span> - Urgent (4), High (3), Medium (2), Low (1), Normal (0)</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Date range</span> - Filters by creation date</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Status</span> - Active, expired, upcoming, or inactive announcements</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Audience</span> - Who this announcement targets</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}