// components/admin/committees/CommitteesFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronUp, ChevronDown, Search, Filter, Download, X, FilterX, ArrowUpDown, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Import types from the correct path
import type { BulkOperation } from '@/types/admin/committees/committees';

interface CommitteesFiltersProps {
    search: string;
    status: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    showAdvancedFilters: boolean;
    isMobile: boolean;
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSortChange: (column: string) => void;
    onExport: () => void;
    onReset: () => void;
    onToggleAdvancedFilters: () => void;
    isLoading?: boolean;
    onBulkOperation?: (operation: BulkOperation) => void;
    selectedCount?: number;
}

export function CommitteesFilters({
    search,
    status,
    sortBy,
    sortOrder,
    showAdvancedFilters,
    isMobile,
    hasActiveFilters,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onExport,
    onReset,
    onToggleAdvancedFilters,
    isLoading = false,
    onBulkOperation,
    selectedCount = 0
}: CommitteesFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [localSearch, setLocalSearch] = useState<string>(search);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== search) {
                onSearchChange(localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, search, onSearchChange]);

    // Sync local search with prop when search changes externally
    useEffect(() => {
        if (search !== localSearch) {
            setLocalSearch(search);
        }
    }, [search]);

    const getSortIcon = useCallback((column: string): React.ReactNode => {
        if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1" />;
        return sortOrder === 'asc' 
            ? <ChevronUp className="h-3 w-3 ml-1" /> 
            : <ChevronDown className="h-3 w-3 ml-1" />;
    }, [sortBy, sortOrder]);

    const handleClearSearch = useCallback((): void => {
        setLocalSearch('');
        onSearchChange('');
        searchInputRef.current?.focus();
    }, [onSearchChange]);

    // Keyboard shortcut for search focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Escape key to clear search
            if (e.key === 'Escape' && localSearch) {
                e.preventDefault();
                handleClearSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [localSearch, handleClearSearch]);

    // Get status label for display
    const getStatusLabel = useCallback((statusValue: string): string => {
        switch (statusValue) {
            case 'active': return 'Active Only';
            case 'inactive': return 'Inactive Only';
            default: return 'All Statuses';
        }
    }, []);

    // Get sort by label for display
    const getSortByLabel = useCallback((sortByValue: string): string => {
        const labels: Record<string, string> = {
            'name': 'Name',
            'order': 'Order',
            'positions_count': 'Positions',
            'created_at': 'Created Date',
            'updated_at': 'Updated Date'
        };
        return labels[sortByValue] || 'Order';
    }, []);

    // Handle sort with proper type
    const handleSortClick = useCallback((column: string) => {
        if (!isLoading) {
            onSortChange(column);
        }
    }, [isLoading, onSortChange]);

    // Handle status change with proper type
    const handleStatusChange = useCallback((value: string) => {
        if (!isLoading) {
            onStatusChange(value);
        }
    }, [isLoading, onStatusChange]);

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search committees by name, code, or description... (Ctrl+F)"
                                className="pl-10 pr-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {localSearch && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={handleClearSearch}
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-32 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="active" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                        Active Only
                                    </SelectItem>
                                    <SelectItem value="inactive" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                        Inactive Only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button 
                                variant="outline"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={onToggleAdvancedFilters}
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
                            <Button 
                                variant="outline"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={onExport}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Sort Options */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                sortBy === 'name' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSortClick('name')}
                                            disabled={isLoading}
                                        >
                                            Name
                                            <span className="ml-1">{getSortIcon('name')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                sortBy === 'order' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSortClick('order')}
                                            disabled={isLoading}
                                        >
                                            Order
                                            <span className="ml-1">{getSortIcon('order')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                sortBy === 'positions_count' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSortClick('positions_count')}
                                            disabled={isLoading}
                                        >
                                            Positions
                                            <span className="ml-1">{getSortIcon('positions_count')}</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                status === 'active' 
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleStatusChange('active')}
                                            disabled={isLoading}
                                        >
                                            Active
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                status === 'inactive' 
                                                ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleStatusChange('inactive')}
                                            disabled={isLoading}
                                        >
                                            Inactive
                                        </Button>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        onClick={() => toast.info('Filter by positions functionality coming soon')}
                                                        disabled={isLoading}
                                                    >
                                                        With Positions
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                    Coming soon: Filter committees with positions
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>

                                {/* Sort Order Selection */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                sortOrder === 'asc' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSortClick(sortBy)}
                                            disabled={isLoading}
                                        >
                                            Ascending
                                            <ChevronUp className="h-3 w-3 ml-1" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                sortOrder === 'desc' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSortClick(sortBy)}
                                            disabled={isLoading}
                                        >
                                            Descending
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active filters indicator */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {hasActiveFilters && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span>Active filters:</span>
                                    {search && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                            Search: "{search.length > 20 ? search.substring(0, 20) + '...' : search}"
                                        </Badge>
                                    )}
                                    {status !== 'all' && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                            Status: {getStatusLabel(status)}
                                        </Badge>
                                    )}
                                    {sortBy !== 'order' && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                            Sorted by: {getSortByLabel(sortBy)} ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
                                        </Badge>
                                    )}
                                    {selectedCount > 0 && (
                                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                                            {selectedCount} selected
                                        </Badge>
                                    )}
                                </div>
                            )}
                            {!hasActiveFilters && selectedCount === 0 && (
                                <span>No active filters</span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onReset}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}