// components/admin/fee-types/FeeTypesFilters.tsx

import { useState, useRef, RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, FilterX, Layers, Search, X, Rows, Filter, Hash, RotateCcw, AlertCircle } from 'lucide-react';
import { route } from 'ziggy-js';

// Import types from centralized location
import type { FilterState } from '@/types/admin/fee-types/fee.types';

interface FeeTypesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: RefObject<HTMLInputElement | null>;
    categories: Record<string, string>;
    categoryCounts: Record<string, number>;
    isLoading?: boolean;
}

export default function FeeTypesFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    handleClearFilters,
    hasActiveFilters,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    categories,
    categoryCounts,
    isLoading = false
}: FeeTypesFiltersProps) {
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const selectionRef = useRef<HTMLDivElement>(null);

    // Handler for category change
    const handleCategoryChange = (value: string) => {
        updateFilter('category', value);
    };

    // Handler for status change
    const handleStatusChange = (value: string) => {
        updateFilter('status', value);
    };

    // Get category display name
    const getCategoryDisplayName = (categoryId: string): string => {
        if (categoryId === 'all') return '';
        return categories[categoryId] || categoryId;
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
                                placeholder="Search fee types by code, name, description, or category... (Ctrl+F)"
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            const exportUrl = route('fee-types.export', {
                                                search: search || undefined,
                                                category: filtersState.category !== 'all' ? filtersState.category : undefined,
                                                status: filtersState.status !== 'all' ? filtersState.status : undefined,
                                            });
                                            window.open(exportUrl, '_blank');
                                        }}
                                        disabled={totalItems === 0 || isLoading}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">
                                    <p>Export filtered results</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Results and Clear Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fee types
                            {search && ` matching "${search}"`}
                            {filtersState.category !== 'all' && ` • Category: ${getCategoryDisplayName(filtersState.category)}`}
                            {filtersState.status !== 'all' && ` • Status: ${filtersState.status}`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">
                                Active filters applied.
                                {search && ` Search: "${search}"`}
                                {filtersState.category !== 'all' && ` Category: ${getCategoryDisplayName(filtersState.category)}`}
                                {filtersState.status !== 'all' && ` Status: ${filtersState.status}`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                disabled={isLoading}
                                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-7 px-2"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}

                    {/* Basic Filters */}
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Category:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Categories</option>
                                {Object.entries(categories).map(([id, name]) => (
                                    <option key={id} value={id} className="bg-white dark:bg-gray-900">
                                        {name} ({categoryCounts[id] || 0})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                            Updating...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}