// components/admin/clearances/ClearancesFilters.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Filter, X, Layers, Search, Loader2 } from 'lucide-react';
import { ClearanceType, StatusOption, Filters } from '@/types/admin/clearances/clearance-types';
import { useMemo, useCallback, memo, useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // Create this hook

interface ClearancesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: Filters;
    updateFilter: (key: keyof Filters, value: string) => void; // Use keyof for better type safety
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
    paymentStatusOptions?: StatusOption[];
    startIndex: number;
    endIndex: number;
    totalItems: number;
    totalFilteredItems?: number; // Add for filtered totals
    isBulkMode?: boolean;
    selectionMode?: 'page' | 'filtered' | 'all';
    selectedCount?: number;
    onClearSelection?: () => void;
    onSelectAllPage?: () => void;
    onSelectAllFiltered?: () => void;
    onSelectAll?: () => void;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
    isExporting?: boolean; // Separate loading state for export
}

// Use memo to prevent unnecessary re-renders
const ClearancesFilters = memo(({
    search,
    setSearch,
    filtersState,
    updateFilter,
    handleClearFilters,
    hasActiveFilters,
    clearanceTypes,
    statusOptions,
    paymentStatusOptions = [],
    startIndex,
    endIndex,
    totalItems,
    totalFilteredItems,
    isBulkMode = false,
    selectionMode = 'page',
    selectedCount = 0,
    onClearSelection,
    onSelectAllPage,
    onSelectAllFiltered,
    onSelectAll,
    searchInputRef: externalSearchInputRef,
    isLoading = false,
    isExporting = false
}: ClearancesFiltersProps) => {
    // Create internal ref if not provided externally
    const internalSearchRef = useRef<HTMLInputElement>(null);
    const searchInputRef = externalSearchInputRef || internalSearchRef;
    
    // Local search state for immediate UI updates with debounced server updates
    const [localSearch, setLocalSearch] = useState(search);
    const debouncedSearch = useDebounce(localSearch, 300);
    
    // Sync local search with prop when it changes externally
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);
    
    // Update parent when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== search) {
            setSearch(debouncedSearch);
        }
    }, [debouncedSearch, search, setSearch]);
    
    // Memoized filter options
    const urgencyOptions = useMemo(() => [
        { value: 'all', label: 'All Urgency' },
        { value: 'express', label: 'Express', className: 'text-orange-600 dark:text-orange-400' },
        { value: 'rush', label: 'Rush', className: 'text-red-600 dark:text-red-400' },
        { value: 'normal', label: 'Normal', className: 'text-green-600 dark:text-green-400' }
    ], []);
    
    // Memoized active clearance types
    const activeClearanceTypes = useMemo(() => 
        clearanceTypes.filter(type => type.is_active),
        [clearanceTypes]
    );
    
    // Handle search input change
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
    }, []);
    
    // Handle clear search
    const handleClearSearch = useCallback(() => {
        setLocalSearch('');
        setSearch('');
        // Focus back on search input
        searchInputRef.current?.focus();
    }, [setSearch, searchInputRef]);
    
    // Handle export with loading state
    const handleExport = useCallback(async () => {
        try {
            const exportUrl = new URL('/admin/clearances/export', window.location.origin);
            
            // Add filters to URL
            const params = new URLSearchParams();
            if (localSearch) params.append('search', localSearch);
            if (filtersState.status && filtersState.status !== 'all') params.append('status', filtersState.status);
            if (filtersState.type && filtersState.type !== 'all') params.append('type', filtersState.type);
            if (filtersState.urgency && filtersState.urgency !== 'all') params.append('urgency', filtersState.urgency);
            if (filtersState.payment_status && filtersState.payment_status !== 'all') params.append('payment_status', filtersState.payment_status);
            
            exportUrl.search = params.toString();
            
            // Open in new tab or trigger download
            window.open(exportUrl.toString(), '_blank');
            
            // Optional: Show success toast
            // toast.success('Export started');
        } catch (error) {
            console.error('Export failed:', error);
            // toast.error('Export failed');
        }
    }, [localSearch, filtersState]);
    
    // Handle filter change with keyboard shortcuts
    const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
        updateFilter(key, value);
        // Optional: Announce filter change for screen readers
        const announcement = `${key} filter changed to ${value || 'all'}`;
        const liveRegion = document.getElementById('filter-announcement');
        if (liveRegion) {
            liveRegion.textContent = announcement;
        }
    }, [updateFilter]);
    
    // Check if any filters are active
    const hasAnyFilters = useMemo(() => {
        return hasActiveFilters || localSearch !== '';
    }, [hasActiveFilters, localSearch]);
    
    // Get display text for items count
    const itemsDisplayText = useMemo(() => {
        if (totalFilteredItems !== undefined && totalFilteredItems !== totalItems) {
            return `Showing ${startIndex + 1} to ${endIndex} of ${totalFilteredItems} filtered results (${totalItems} total)`;
        }
        return `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} requests`;
    }, [startIndex, endIndex, totalItems, totalFilteredItems]);
    
    return (
        <div className="space-y-4">
            {/* Screen reader live region for filter announcements */}
            <div 
                id="filter-announcement" 
                className="sr-only" 
                aria-live="polite" 
                aria-atomic="true"
            />
            
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            ref={searchInputRef}
                            type="search"
                            placeholder="Search by reference, name, clearance number... (Ctrl+F)"
                            value={localSearch}
                            onChange={handleSearchChange}
                            disabled={isLoading}
                            aria-label="Search clearance requests"
                            className="w-full pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        {localSearch && !isLoading && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isLoading || isExporting || totalItems === 0}
                        aria-label="Export clearance requests"
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export
                    </Button>
                    
                    {hasAnyFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            disabled={isLoading}
                            aria-label="Clear all filters"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-gray-200 dark:border-gray-700 h-9"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Filter Selects */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <Select
                        value={filtersState.status || 'all'}
                        onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger 
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            aria-label="Filter by status"
                        >
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">
                                All Status
                            </SelectItem>
                            {statusOptions.map((status) => (
                                <SelectItem 
                                    key={status.value} 
                                    value={status.value}
                                    className="text-gray-900 dark:text-gray-100"
                                >
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* Type Filter */}
                    <Select
                        value={filtersState.type || 'all'}
                        onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger 
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            aria-label="Filter by clearance type"
                        >
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">
                                All Types
                            </SelectItem>
                            {activeClearanceTypes.map((type) => (
                                <SelectItem 
                                    key={type.id} 
                                    value={type.id.toString()}
                                    className="text-gray-900 dark:text-gray-100"
                                >
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* Urgency Filter */}
                    <Select
                        value={filtersState.urgency || 'all'}
                        onValueChange={(value) => handleFilterChange('urgency', value === 'all' ? '' : value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger 
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            aria-label="Filter by urgency"
                        >
                            <SelectValue placeholder="All Urgency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">
                                All Urgency
                            </SelectItem>
                            {urgencyOptions.slice(1).map((option) => ( // Skip the 'all' option
                                <SelectItem 
                                    key={option.value} 
                                    value={option.value}
                                    className={`text-gray-900 dark:text-gray-100 ${option.className || ''}`}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* Payment Status Filter - Only show if paymentStatusOptions is provided */}
                    {paymentStatusOptions.length > 0 && (
                        <Select
                            value={filtersState.payment_status || 'all'}
                            onValueChange={(value) => handleFilterChange('payment_status', value === 'all' ? '' : value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger 
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                aria-label="Filter by payment status"
                            >
                                <SelectValue placeholder="All Payment Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">
                                    All Payment Status
                                </SelectItem>
                                {paymentStatusOptions.map((status) => (
                                    <SelectItem 
                                        key={status.value} 
                                        value={status.value}
                                        className="text-gray-900 dark:text-gray-100"
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                
                {/* Bulk Mode Selection Info */}
                {isBulkMode && selectedCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">
                            <span className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                {selectedCount} selected 
                                {selectionMode !== 'page' && ` (${selectionMode})`}
                            </span>
                        </div>
                        {onClearSelection && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearSelection}
                                disabled={isLoading}
                                aria-label="Clear selection"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                )}
            </div>
            
            {/* Results Info and Bulk Selection Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                    {itemsDisplayText}
                </div>
                
                {isBulkMode && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Select:</span>
                        <div className="flex gap-1" role="group" aria-label="Bulk selection options">
                            {onSelectAllPage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSelectAllPage}
                                    disabled={isLoading}
                                    aria-pressed={selectionMode === 'page'}
                                    className={`h-7 text-xs ${
                                        selectionMode === 'page' 
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    Page ({endIndex - startIndex})
                                </Button>
                            )}
                            {onSelectAllFiltered && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSelectAllFiltered}
                                    disabled={isLoading}
                                    aria-pressed={selectionMode === 'filtered'}
                                    className={`h-7 text-xs ${
                                        selectionMode === 'filtered' 
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    Filtered ({totalFilteredItems || totalItems})
                                </Button>
                            )}
                            {onSelectAll && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSelectAll}
                                    disabled={isLoading}
                                    aria-pressed={selectionMode === 'all'}
                                    className={`h-7 text-xs ${
                                        selectionMode === 'all' 
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    All
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

// Add display name for better debugging
ClearancesFilters.displayName = 'ClearancesFilters';

export default ClearancesFilters;