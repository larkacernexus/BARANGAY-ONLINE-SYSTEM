// resources/js/components/admin/households/HouseholdsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { truncateText } from '../../../admin-utils/householdUtils';
import { RefObject } from 'react';
import { FilterState } from '@/types/admin/households/household.types'; // Use the global FilterState

interface HouseholdsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filtersState: FilterState; // Use the global FilterState
    updateFilter: (key: keyof FilterState, value: string) => void; // Use the global FilterState
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
    filteredStats
}: HouseholdsFiltersProps) {
    
    return (
        <>
            {/* Search and Filters */}
            <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 sm:pt-6">
                    <FilterBar
                        search={search}
                        onSearchChange={onSearchChange || ((e) => setSearch(e.target.value))}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        showAdvancedFilters={showAdvancedFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        searchPlaceholder="Search by household number, head of family, or address..."
                        resultsText={search ? `Showing results for "${search}"` : undefined}
                        showCount={true}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        isLoading={isLoading}
                        searchInputRef={searchInputRef}
                        className="bg-white dark:bg-gray-900"
                    >
                        {/* Basic Filters */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
                                <select 
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.status}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-800">All Status</option>
                                    <option value="active" className="bg-white dark:bg-gray-800">Active</option>
                                    <option value="inactive" className="bg-white dark:bg-gray-800">Inactive</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Purok:</span>
                                <select 
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.purok_id}
                                    onChange={(e) => updateFilter('purok_id', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-800">All Puroks</option>
                                    {puroks.map((purok) => (
                                        <option key={purok.id} value={String(purok.id)} className="bg-white dark:bg-gray-800">
                                            {truncateText(purok.name, isMobile ? 12 : 15)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
                                <div className="flex items-center gap-1 w-full">
                                    <select 
                                        className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.sort_by}
                                        onChange={(e) => updateFilter('sort_by', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="household_number" className="bg-white dark:bg-gray-800">Household No.</option>
                                        <option value="head_of_family" className="bg-white dark:bg-gray-800">Head of Family</option>
                                        <option value="member_count" className="bg-white dark:bg-gray-800">Members</option>
                                        {!isMobile && <option value="purok" className="bg-white dark:bg-gray-800">Purok</option>}
                                        <option value="created_at" className="bg-white dark:bg-gray-800">Date Created</option>
                                        <option value="updated_at" className="bg-white dark:bg-gray-800">Last Updated</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc')}
                                        disabled={isLoading}
                                        title={filtersState.sort_order === 'asc' ? 'Ascending' : 'Descending'}
                                    >
                                        {filtersState.sort_order === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <AlertCircle className="h-3 w-3" />
                                <span>Active filters:</span>
                                {filtersState.status !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        Status: {filtersState.status}
                                    </span>
                                )}
                                {filtersState.purok_id !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        Purok: {puroks.find(p => p.id === Number(filtersState.purok_id))?.name || filtersState.purok_id}
                                    </span>
                                )}
                                {search && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        Search: "{truncateText(search, 15)}"
                                    </span>
                                )}
                                {filtersState.sort_by !== 'household_number' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        Sort: {filtersState.sort_by.replace('_', ' ')} ({filtersState.sort_order})
                                    </span>
                                )}
                                {filtersState.from_date && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        From: {filtersState.from_date}
                                    </span>
                                )}
                                {filtersState.to_date && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        To: {filtersState.to_date}
                                    </span>
                                )}
                                {(filtersState.min_members || filtersState.max_members) && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                        Members: {filtersState.min_members || '0'} - {filtersState.max_members || '∞'}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Advanced Filters Section */}
                        {showAdvancedFilters && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-3 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Date Range Filters */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Created Range</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                placeholder="From"
                                                className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                value={filtersState.from_date}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                            />
                                            <input
                                                type="date"
                                                placeholder="To"
                                                className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                value={filtersState.to_date}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
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
                                            >
                                                Last 30 Days
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Member Count Range */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Count</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                value={filtersState.min_members}
                                                onChange={(e) => updateFilter('min_members', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                value={filtersState.max_members}
                                                onChange={(e) => updateFilter('max_members', e.target.value)}
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
                                            >
                                                10+ Members
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</label>
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
                                            >
                                                Newest First
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FilterBar>
                </CardContent>
            </Card>
        </>
    );
}