// components/admin/committees/CommitteesFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, FilterX, Users, Layers } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

// Import types from the correct path
import type { BulkOperation } from '@/types/admin/committees/committees';

interface CommitteesFiltersProps {
    search: string;
    status: string;
    positionsRange: string;
    showAdvancedFilters: boolean;
    isMobile: boolean;
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPositionsRangeChange: (value: string) => void;
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
    positionsRange,
    showAdvancedFilters,
    isMobile,
    hasActiveFilters,
    onSearchChange,
    onStatusChange,
    onPositionsRangeChange,
    onExport,
    onReset,
    onToggleAdvancedFilters,
    isLoading = false,
    onBulkOperation,
    selectedCount = 0
}: CommitteesFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [localSearch, setLocalSearch] = useState<string>(search);

    // Positions range options
    const positionsRanges = [
        { value: '', label: 'All Committees' },
        { value: '0', label: 'No Positions (0)' },
        { value: '1-3', label: 'Few Positions (1-3)' },
        { value: '4-6', label: 'Moderate Positions (4-6)' },
        { value: '7-10', label: 'Many Positions (7-10)' },
        { value: '10+', label: 'Large Committee (10+)' }
    ];

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
            if (e.key === 'Escape' && localSearch) {
                e.preventDefault();
                handleClearSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [localSearch, handleClearSearch]);

    // Handle status change
    const handleStatusChange = useCallback((value: string) => {
        if (!isLoading) {
            onStatusChange(value);
        }
    }, [isLoading, onStatusChange]);

    // Handle positions range change
    const handlePositionsRangeChange = useCallback((value: string) => {
        if (!isLoading) {
            onPositionsRangeChange(value);
        }
    }, [isLoading, onPositionsRangeChange]);

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
                                placeholder="Search committees by name, code, or description... (Ctrl+F)"
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={onToggleAdvancedFilters}
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {activeFilters ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span>Active filters:</span>
                                    {localSearch && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                            Search: "{localSearch.length > 20 ? localSearch.substring(0, 20) + '...' : localSearch}"
                                        </span>
                                    )}
                                    {status !== 'all' && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                            Status: {status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    )}
                                    {positionsRange && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                            Positions: {positionsRanges.find(r => r.value === positionsRange)?.label}
                                        </span>
                                    )}
                                    {selectedCount > 0 && (
                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                                            {selectedCount} selected
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span>No active filters</span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onReset}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Status + Positions Range (removed sort) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                Status
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Positions Count
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={positionsRange}
                                onChange={(e) => handlePositionsRangeChange(e.target.value)}
                                disabled={isLoading}
                            >
                                {positionsRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Quick Status Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Status</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onStatusChange('active');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onStatusChange('inactive');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Inactive Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onStatusChange('all');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset Status
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Positions Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Positions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onPositionsRangeChange('0');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            No Positions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onPositionsRangeChange('1-3');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Small (1-3)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onPositionsRangeChange('4-6');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Medium (4-6)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onPositionsRangeChange('7-10');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Large (7-10)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                onPositionsRangeChange('10+');
                                                onToggleAdvancedFilters();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Extra Large (10+)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Active committees</span> - Currently active and available for assignments</p>
                                    <p>• <span className="font-medium">Positions count</span> - Number of positions under this committee</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}