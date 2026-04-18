// resources/js/components/admin/households/HouseholdsFilters.tsx

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
import { Search, X, Filter, Download, FilterX, Home, MapPin, Calendar, Users, ArrowUpDown } from 'lucide-react';
import { RefObject } from 'react';
import { FilterState } from '@/types/admin/households/household.types';

interface HouseholdsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    puroks: any[];
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    filteredHouseholds?: any[];
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    globalStats?: any;
    filteredStats?: any;
    handleExport?: () => void;
}

export default function HouseholdsFilters({
    search,
    setSearch,
    onSearchChange,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    puroks,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    filteredHouseholds,
    searchInputRef,
    isLoading = false,
    globalStats,
    filteredStats,
    handleExport
}: HouseholdsFiltersProps) {
    
    // Handle search change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        if (onSearchChange) {
            onSearchChange(e);
        }
    };

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count for advanced filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (filtersState.purok_id && filtersState.purok_id !== 'all') count++;
        if (filtersState.from_date) count++;
        if (filtersState.to_date) count++;
        if (filtersState.min_members && filtersState.min_members !== '') count++;
        if (filtersState.max_members && filtersState.max_members !== '') count++;
        // sort_by and sort_order are not counted as "filters" per se
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
            case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
            default: return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
        }
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    {/* Search Bar - Enhanced */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by household number, head of family, or address..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={handleSearchChange}
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
                            <span className="ml-1">households</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{search}”</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active filter badges */}
                            {activeFilters && (
                                <>
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${getStatusColor(filtersState.status)} border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            Status: {filtersState.status}
                                        </Badge>
                                    )}
                                    {filtersState.purok_id && filtersState.purok_id !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <MapPin className="h-3 w-3 mr-1 inline" />
                                            {puroks.find(p => String(p.id) === filtersState.purok_id)?.name}
                                        </Badge>
                                    )}
                                    {(filtersState.from_date || filtersState.to_date) && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {filtersState.from_date && filtersState.to_date 
                                                ? `${filtersState.from_date} → ${filtersState.to_date}`
                                                : filtersState.from_date 
                                                    ? `From ${filtersState.from_date}`
                                                    : `Until ${filtersState.to_date}`}
                                        </Badge>
                                    )}
                                    {(filtersState.min_members || filtersState.max_members) && (
                                        <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            Members: {filtersState.min_members || '0'} - {filtersState.max_members || '∞'}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
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

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</Label>
                            <Select
                                value={filtersState.status || 'all'}
                                onValueChange={(value) => updateFilter('status', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Purok Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purok</Label>
                            <Select
                                value={filtersState.purok_id || 'all'}
                                onValueChange={(value) => updateFilter('purok_id', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Puroks" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Puroks</SelectItem>
                                    {puroks.map((purok) => (
                                        <SelectItem key={purok.id} value={String(purok.id)}>
                                            {purok.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort By Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <ArrowUpDown className="h-3 w-3" />
                                Sort By
                            </Label>
                            <Select
                                value={filtersState.sort_by || 'household_number'}
                                onValueChange={(value) => updateFilter('sort_by', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="household_number">Household No.</SelectItem>
                                    <SelectItem value="head_of_family">Head of Family</SelectItem>
                                    <SelectItem value="member_count">Members</SelectItem>
                                    <SelectItem value="purok">Purok</SelectItem>
                                    <SelectItem value="created_at">Date Created</SelectItem>
                                    <SelectItem value="updated_at">Last Updated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Order Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</Label>
                            <Select
                                value={filtersState.sort_order || 'asc'}
                                onValueChange={(value) => updateFilter('sort_order', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="Sort Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Ascending ↑</SelectItem>
                                    <SelectItem value="desc">Descending ↓</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Date Created Range */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Date Created Range
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
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
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                updateFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                const thirtyDaysAgo = new Date(today);
                                                thirtyDaysAgo.setDate(today.getDate() - 30);
                                                updateFilter('from_date', thirtyDaysAgo.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Last 30 Days
                                        </Button>
                                    </div>
                                </div>

                                {/* Member Count Range */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-emerald-500" />
                                        Member Count
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">Minimum</Label>
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                value={filtersState.min_members || ''}
                                                onChange={(e) => updateFilter('min_members', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">Maximum</Label>
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                value={filtersState.max_members || ''}
                                                onChange={(e) => updateFilter('max_members', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('min_members', '1');
                                                updateFilter('max_members', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Has Members
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('min_members', '5');
                                                updateFilter('max_members', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            5+ Members
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('min_members', '10');
                                                updateFilter('max_members', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            10+ Members
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Home className="h-4 w-4 text-purple-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs justify-start rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('status', 'active');
                                                updateFilter('purok_id', 'all');
                                                updateFilter('from_date', '');
                                                updateFilter('to_date', '');
                                                updateFilter('min_members', '');
                                                updateFilter('max_members', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Show Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs justify-start rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('sort_by', 'member_count');
                                                updateFilter('sort_order', 'desc');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Largest Households
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs justify-start rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('sort_by', 'created_at');
                                                updateFilter('sort_order', 'desc');
                                                updateFilter('from_date', '');
                                                updateFilter('to_date', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Newest First
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}