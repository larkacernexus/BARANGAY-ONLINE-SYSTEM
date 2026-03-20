// components/ui/filter-bar.tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, FilterX, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface FilterBarProps {
    search: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    showAdvancedFilters: boolean;
    onToggleAdvancedFilters: () => void;
    searchPlaceholder?: string;
    resultsText?: string;
    showCount?: boolean;
    totalItems?: number;
    startIndex?: number;
    endIndex?: number;
    isLoading?: boolean;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    children?: ReactNode;
    className?: string;
}

export function FilterBar({
    search,
    onSearchChange,
    onClearFilters,
    hasActiveFilters,
    showAdvancedFilters,
    onToggleAdvancedFilters,
    searchPlaceholder = "Search...",
    resultsText,
    showCount = false,
    totalItems = 0,
    startIndex = 0,
    endIndex = 0,
    isLoading = false,
    searchInputRef,
    children,
    className = ""
}: FilterBarProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <Input
                        ref={searchInputRef}
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={onSearchChange}
                        className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        disabled={isLoading}
                    />
                    {search && !isLoading && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                                // Clear search
                                onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 animate-spin" />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleAdvancedFilters}
                        className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={isLoading}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-9 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-gray-200 dark:border-gray-700"
                            disabled={isLoading}
                        >
                            <FilterX className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Count */}
            {showCount && totalItems > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {resultsText ? (
                        resultsText
                    ) : (
                        <>Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</>
                    )}
                </div>
            )}

            {/* Filter Children */}
            {children}
        </div>
    );
}