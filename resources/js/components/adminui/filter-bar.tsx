// components/ui/filter-bar.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, FilterX, ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterBarProps {
    search?: string;
    onSearchChange?: (value: string) => void;
    onClearFilters?: () => void;
    hasActiveFilters?: boolean;
    showAdvancedFilters?: boolean;
    onToggleAdvancedFilters?: () => void;
    searchPlaceholder?: string;
    resultsText?: string;
    showCount?: boolean;
    totalItems?: number;
    startIndex?: number;
    endIndex?: number;
    isLoading?: boolean;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    children?: React.ReactNode;
    className?: string;
}

export function FilterBar({
    search = '',
    onSearchChange = () => {},
    onClearFilters = () => {},
    hasActiveFilters = false,
    showAdvancedFilters = false,
    onToggleAdvancedFilters = () => {},
    searchPlaceholder = 'Search...',
    resultsText,
    showCount = false,
    totalItems = 0,
    startIndex = 0,
    endIndex = 0,
    isLoading = false,
    searchInputRef,
    children,
    className = ''
}: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(search);

    // Update local search when prop changes
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearch(value);
        onSearchChange(value);
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onSearchChange('');
    };

    const handleClearAllFilters = () => {
        setLocalSearch('');
        onSearchChange('');
        onClearFilters();
    };

    // Safely calculate display values
    const safeTotalItems = totalItems || 0;
    const safeStartIndex = Math.max(startIndex || 0, 0);
    const safeEndIndex = Math.min(endIndex || 0, safeTotalItems);
    
    // Calculate showing range
    const showingFrom = safeTotalItems > 0 ? safeStartIndex + 1 : 0;
    const showingTo = safeEndIndex;
    const showingTotal = safeTotalItems;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                        ref={searchInputRef}
                        placeholder={searchPlaceholder}
                        value={localSearch}
                        onChange={handleSearchChange}
                        disabled={isLoading}
                        className="pl-9 pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                    {localSearch && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleAdvancedFilters}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                    >
                        <Filter className="h-4 w-4" />
                        {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                        {showAdvancedFilters ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                    
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAllFilters}
                            disabled={isLoading}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-gray-200 dark:border-gray-700 h-9"
                        >
                            <FilterX className="h-4 w-4" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Info */}
            {(resultsText || showCount) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div className="text-gray-700 dark:text-gray-300">
                        {resultsText && (
                            <span className="font-medium">{resultsText}</span>
                        )}
                    </div>
                    
                    {showCount && safeTotalItems > 0 && (
                        <div className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">
                                Showing {showingFrom}-{showingTo} of {showingTotal}
                            </span>
                            {showingTotal === 1 ? ' result' : ' results'}
                        </div>
                    )}
                    
                    {showCount && safeTotalItems === 0 && (
                        <div className="text-gray-500 dark:text-gray-400">
                            No results found
                        </div>
                    )}
                </div>
            )}

            {/* Advanced Filters Content */}
            {showAdvancedFilters && children && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
}