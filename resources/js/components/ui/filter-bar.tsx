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
    children?: React.ReactNode; // Add this line
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
    children // Add this here
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
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={localSearch}
                        onChange={handleSearchChange}
                        className="pl-9 pr-10"
                    />
                    {localSearch && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
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
                            className="flex items-center gap-2"
                        >
                            <FilterX className="h-4 w-4" />
                            Clear All
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
                            {showingTotal === 1 ? ' household' : ' households'}
                        </div>
                    )}
                    
                    {showCount && safeTotalItems === 0 && (
                        <div className="text-gray-500 dark:text-gray-400">
                            No households found
                        </div>
                    )}
                </div>
            )}

            {/* Advanced Filters Content */}
            {showAdvancedFilters && children && (
                <div className="border-t pt-4">
                    {children}
                </div>
            )}
        </div>
    );
}