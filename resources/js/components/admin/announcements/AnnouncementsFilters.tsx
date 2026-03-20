// resources/js/components/admin/announcements/AnnouncementsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/adminui/filter-bar';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AnnouncementsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: any;
    updateFilter: (key: string, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    types: Record<string, string>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
}

export default function AnnouncementsFilters({
    // Remove stats from props
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    types,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false
}: AnnouncementsFiltersProps) {
    
    // Format type options for select
    const typeOptions = Object.entries(types).map(([key, value]) => ({
        id: key,
        name: value
    }));

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 sm:pt-6">
                <FilterBar
                    search={search}
                    onSearchChange={setSearch}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                    showAdvancedFilters={showAdvancedFilters}
                    onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    searchPlaceholder="Search announcements by title, content, type..."
                    resultsText={search ? `Showing results for "${search}"` : undefined}
                    showCount={true}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    isLoading={isLoading}
                    searchInputRef={searchInputRef}
                >
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Type:</span>
                            <select
                                className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.type || 'all'}
                                onChange={(e) => updateFilter('type', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Types</option>
                                {typeOptions.map((type) => (
                                    <option key={type.id} value={type.id} className="bg-white dark:bg-gray-900">{type.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
                            <select
                                className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
                                <option value="expired" className="bg-white dark:bg-gray-900">Expired</option>
                                <option value="upcoming" className="bg-white dark:bg-gray-900">Upcoming</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
                            <div className="flex items-center gap-1 w-full">
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.sort_by || 'created_at'}
                                    onChange={(e) => updateFilter('sort_by', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="created_at" className="bg-white dark:bg-gray-900">Date Created</option>
                                    <option value="title" className="bg-white dark:bg-gray-900">Title</option>
                                    <option value="type" className="bg-white dark:bg-gray-900">Type</option>
                                    <option value="start_date" className="bg-white dark:bg-gray-900">Start Date</option>
                                    <option value="end_date" className="bg-white dark:bg-gray-900">End Date</option>
                                </select>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            {filtersState.type && filtersState.type !== 'all' && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                    Type: {types[filtersState.type] || filtersState.type}
                                </span>
                            )}
                            {filtersState.status && filtersState.status !== 'all' && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                    Status: {filtersState.status}
                                </span>
                            )}
                            {search && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                    Search: "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
                                </span>
                            )}
                            {filtersState.from_date && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                    From: {filtersState.from_date}
                                </span>
                            )}
                            {filtersState.to_date && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                    To: {filtersState.to_date}
                                </span>
                            )}
                            {filtersState.sort_by && filtersState.sort_by !== 'created_at' && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                    Sort: {filtersState.sort_by.replace('_', ' ')} ({filtersState.sort_order})
                                </span>
                            )}
                        </div>
                    )}

                    {showAdvancedFilters && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Date Range */}
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            className="w-full text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <span className="self-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">to</span>
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            className="w-full text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</label>
                                    <div className="flex flex-wrap gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-6 text-xs ${
                                                filtersState.status === 'active' 
                                                ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
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
                                            className={`h-6 text-xs ${
                                                filtersState.status === 'expired' 
                                                ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
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
                                            className={`h-6 text-xs ${
                                                filtersState.status === 'upcoming' 
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => {
                                                updateFilter('status', 'upcoming');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Upcoming
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </FilterBar>
            </CardContent>
        </Card>
    );
}