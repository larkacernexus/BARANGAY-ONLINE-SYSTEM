// resources/js/components/admin/households/HouseholdsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Filter, Download, FilterX } from 'lucide-react';
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
                                placeholder="Search by household number, head of family, or address..."
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={handleSearchChange}
                                disabled={isLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
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
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} households
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

                    {/* Basic Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Purok</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.purok_id}
                                onChange={(e) => updateFilter('purok_id', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Puroks</option>
                                {puroks.map((purok) => (
                                    <option key={purok.id} value={String(purok.id)}>
                                        {purok.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Sort By</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.sort_by}
                                onChange={(e) => updateFilter('sort_by', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="household_number">Household No.</option>
                                <option value="head_of_family">Head of Family</option>
                                <option value="member_count">Members</option>
                                <option value="purok">Purok</option>
                                <option value="created_at">Date Created</option>
                                <option value="updated_at">Last Updated</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Sort Order</Label>
                            <div className="flex gap-1">
                                <select
                                    className="flex-1 border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.sort_order}
                                    onChange={(e) => updateFilter('sort_order', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="asc">Ascending ↑</option>
                                    <option value="desc">Descending ↓</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Created Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={filtersState.from_date}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={filtersState.to_date}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
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
                                            className="text-xs h-7"
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
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Count</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Min"
                                            type="number"
                                            value={filtersState.min_members}
                                            onChange={(e) => updateFilter('min_members', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="Max"
                                            type="number"
                                            value={filtersState.max_members}
                                            onChange={(e) => updateFilter('max_members', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
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
                                            className="text-xs h-7"
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
                                            className="text-xs h-7"
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
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
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
                                            className="text-xs"
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
                                            className="text-xs"
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