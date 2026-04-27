// components/admin/committees/CommitteesFilters.tsx

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
import { Search, Filter, Download, X, FilterX, Users, Layers, Shield, TrendingUp, Building } from 'lucide-react';
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

    // Positions range options - FIXED: Use 'all' instead of empty string
    const positionsRanges = [
        { value: 'all', label: 'All Committees', color: 'gray' },
        { value: '0', label: 'No Positions (0)', color: 'red' },
        { value: '1-3', label: 'Few Positions (1-3)', color: 'blue' },
        { value: '4-6', label: 'Moderate Positions (4-6)', color: 'emerald' },
        { value: '7-10', label: 'Many Positions (7-10)', color: 'amber' },
        { value: '10+', label: 'Large Committee (10+)', color: 'purple' }
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

    // Helper to get active filter count - FIXED: Check for 'all' instead of empty string
    const getActiveFilterCount = () => {
        let count = 0;
        if (status && status !== 'all') count++;
        if (positionsRange && positionsRange !== 'all') count++;
        if (localSearch && localSearch !== '') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get status color
    const getStatusColor = (statusValue: string) => {
        switch (statusValue) {
            case 'active': return 'emerald';
            case 'inactive': return 'gray';
            default: return 'gray';
        }
    };

    // Get positions range label
    const getPositionsRangeLabel = (value: string) => {
        const range = positionsRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get positions range color
    const getPositionsRangeColor = (value: string) => {
        const range = positionsRanges.find(r => r.value === value);
        return range?.color || 'gray';
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
                                placeholder="Search committees by name, code, or description... (Ctrl+F)"
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {localSearch && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={handleClearSearch}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={onToggleAdvancedFilters}
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
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                onClick={onExport}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button - FIXED: Check for 'all' instead of empty string */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            {activeFilters ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-gray-500 dark:text-gray-400">Active filters:</span>
                                    {localSearch && (
                                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs font-normal">
                                            Search: "{localSearch.length > 20 ? localSearch.substring(0, 20) + '...' : localSearch}"
                                            <button
                                                onClick={handleClearSearch}
                                                className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                                            >
                                                <X className="h-2.5 w-2.5 inline" />
                                            </button>
                                        </Badge>
                                    )}
                                    {status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(status) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } rounded-full px-2 py-0.5 text-xs font-medium`}>
                                            <Shield className="h-2.5 w-2.5 mr-1 inline" />
                                            Status: {status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                    {positionsRange && positionsRange !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getPositionsRangeColor(positionsRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getPositionsRangeColor(positionsRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getPositionsRangeColor(positionsRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getPositionsRangeColor(positionsRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        } rounded-full px-2 py-0.5 text-xs font-medium`}>
                                            <Users className="h-2.5 w-2.5 mr-1 inline" />
                                            {getPositionsRangeLabel(positionsRange)}
                                        </Badge>
                                    )}
                                    {selectedCount > 0 && (
                                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5 text-xs font-medium">
                                            <Layers className="h-2.5 w-2.5 mr-1 inline" />
                                            {selectedCount} selected
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <span>No active filters</span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onReset}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={status || 'all'}
                                onValueChange={handleStatusChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Positions Count Filter - FIXED: Use 'all' instead of empty string */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Positions Count
                            </Label>
                            <Select
                                value={positionsRange || 'all'}
                                onValueChange={handlePositionsRangeChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Committees" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positionsRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    range.color === 'red' ? 'bg-red-500' :
                                                    range.color === 'blue' ? 'bg-blue-500' :
                                                    range.color === 'emerald' ? 'bg-emerald-500' :
                                                    range.color === 'amber' ? 'bg-amber-500' :
                                                    range.color === 'purple' ? 'bg-purple-500' :
                                                    'bg-gray-400'
                                                }`} />
                                                {range.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Quick Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quick Status Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-emerald-500" />
                                        Quick Status
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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

                                {/* Quick Positions Filters - FIXED: Use 'all' for reset */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-purple-500" />
                                        Quick Positions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Building className="h-3 w-3" />
                                    Committee Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Active committees</span> - Currently active and available for assignments</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Positions count</span> - Number of positions under this committee</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Search</span> - Searches by name, code, or description</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Keyboard shortcuts</span> - Ctrl+F to focus search, Esc to clear</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator - Modern */}
                {isLoading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}