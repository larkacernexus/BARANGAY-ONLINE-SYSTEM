// components/admin/clearances/ClearancesFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Filter, Download, FilterX, Layers, Calendar, Clock, FileText, DollarSign, UserCheck, AlertCircle, CreditCard } from 'lucide-react';
import { ClearanceType, StatusOption } from '@/types/admin/clearances/clearance';
import { useMemo, useCallback, memo, useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

// Define a simpler filter state type for the component
interface FilterState {
    status?: string;
    type?: string;
    urgency?: string;
    payment_status?: string;
    from_date?: string;
    to_date?: string;
}

interface ClearancesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: string, value: string) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
    paymentStatusOptions?: StatusOption[];
    startIndex: number;
    endIndex: number;
    totalItems: number;
    totalFilteredItems?: number;
    isBulkMode?: boolean;
    selectionMode?: 'page' | 'filtered' | 'all';
    selectedCount?: number;
    onClearSelection?: () => void;
    onSelectAllPage?: () => void;
    onSelectAllFiltered?: () => void;
    onSelectAll?: () => void;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
    isExporting?: boolean;
    showAdvancedFilters?: boolean;
    setShowAdvancedFilters?: (value: boolean) => void;
    dateRangePreset?: string;
    setDateRangePreset?: (value: string) => void;
    applicantTypeFilter?: string;
    setApplicantTypeFilter?: (value: string) => void;
    amountRange?: string;
    setAmountRange?: (value: string) => void;
}

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
    isExporting = false,
    showAdvancedFilters = false,
    setShowAdvancedFilters,
    dateRangePreset = '',
    setDateRangePreset,
    applicantTypeFilter = 'all',
    setApplicantTypeFilter,
    amountRange = '',
    setAmountRange
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
        { value: 'express', label: 'Express (1-2 days)' },
        { value: 'rush', label: 'Rush (3-5 days)' },
        { value: 'normal', label: 'Normal (7-14 days)' }
    ], []);
    
    // Applicant type options
    const applicantTypeOptions = useMemo(() => [
        { value: 'all', label: 'All Applicants' },
        { value: 'resident', label: 'Resident' },
        { value: 'business', label: 'Business Owner' },
        { value: 'senior', label: 'Senior Citizen' },
        { value: 'pwd', label: 'PWD' }
    ], []);

    // Amount range options
    const amountRangeOptions = useMemo(() => [
        { value: '', label: 'All Amounts' },
        { value: '0-100', label: '₱0 - ₱100' },
        { value: '101-500', label: '₱101 - ₱500' },
        { value: '501-1000', label: '₱501 - ₱1,000' },
        { value: '1001-5000', label: '₱1,001 - ₱5,000' },
        { value: '5000+', label: '₱5,000+' }
    ], []);

    // Date range presets
    const dateRangePresets = useMemo(() => [
        { value: '', label: 'Custom Range' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_3_months', label: 'Last 3 Months' }
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
        searchInputRef.current?.focus();
    }, [setSearch, searchInputRef]);
    
    // Handle date range preset change
    const handleDateRangePresetChange = useCallback((preset: string) => {
        setDateRangePreset?.(preset);
        
        const today = new Date();
        let fromDate = '';
        let toDate = '';
        
        switch (preset) {
            case 'today':
                fromDate = today.toISOString().split('T')[0];
                toDate = today.toISOString().split('T')[0];
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                fromDate = yesterday.toISOString().split('T')[0];
                toDate = yesterday.toISOString().split('T')[0];
                break;
            case 'this_week':
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay());
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                fromDate = firstDayOfWeek.toISOString().split('T')[0];
                toDate = lastDayOfWeek.toISOString().split('T')[0];
                break;
            case 'last_week':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                fromDate = lastWeekStart.toISOString().split('T')[0];
                toDate = lastWeekEnd.toISOString().split('T')[0];
                break;
            case 'this_month':
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                fromDate = firstDay.toISOString().split('T')[0];
                toDate = lastDay.toISOString().split('T')[0];
                break;
            case 'last_month':
                const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0);
                fromDate = lastMonthFirstDay.toISOString().split('T')[0];
                toDate = lastMonthLastDay.toISOString().split('T')[0];
                break;
            case 'last_3_months':
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(today.getMonth() - 3);
                fromDate = threeMonthsAgo.toISOString().split('T')[0];
                toDate = today.toISOString().split('T')[0];
                break;
            default:
                return;
        }
        
        if (fromDate) updateFilter('from_date', fromDate);
        if (toDate) updateFilter('to_date', toDate);
    }, [setDateRangePreset, updateFilter]);
    
    // Handle export
    const handleExport = useCallback(async () => {
        try {
            const exportUrl = new URL('/admin/clearances/export', window.location.origin);
            const params = new URLSearchParams();
            if (localSearch) params.append('search', localSearch);
            if (filtersState.status && filtersState.status !== 'all') params.append('status', filtersState.status);
            if (filtersState.type && filtersState.type !== 'all') params.append('type', filtersState.type);
            if (filtersState.urgency && filtersState.urgency !== 'all') params.append('urgency', filtersState.urgency);
            if (filtersState.payment_status && filtersState.payment_status !== 'all') params.append('payment_status', filtersState.payment_status);
            if (filtersState.from_date) params.append('from_date', filtersState.from_date);
            if (filtersState.to_date) params.append('to_date', filtersState.to_date);
            if (applicantTypeFilter !== 'all') params.append('applicant_type', applicantTypeFilter);
            if (amountRange) params.append('amount_range', amountRange);
            
            exportUrl.search = params.toString();
            window.open(exportUrl.toString(), '_blank');
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [localSearch, filtersState, applicantTypeFilter, amountRange]);
    
    // Handle filter change
    const handleFilterChange = useCallback((key: string, value: string) => {
        updateFilter(key, value);
    }, [updateFilter]);
    
    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);
    
    // Get display text for items count
    const itemsDisplayText = useMemo(() => {
        if (totalFilteredItems !== undefined && totalFilteredItems !== totalItems) {
            return `Showing ${startIndex + 1} to ${Math.min(endIndex, totalFilteredItems)} of ${totalFilteredItems} filtered results (${totalItems} total)`;
        }
        return `Showing ${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems} requests`;
    }, [startIndex, endIndex, totalItems, totalFilteredItems]);
    
    const showAdvancedToggle = setShowAdvancedFilters !== undefined;
    
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
                                placeholder="Search by reference, name, or purpose..."
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={localSearch}
                                onChange={handleSearchChange}
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
                            {showAdvancedToggle && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                            )}
                            <Button 
                                variant="outline"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={handleExport}
                                disabled={isLoading || isExporting || totalItems === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {itemsDisplayText}
                            {localSearch && ` matching "${localSearch}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                            {isBulkMode && selectedCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md text-xs">
                                        <Layers className="h-3 w-3" />
                                        <span>{selectedCount} selected</span>
                                        {selectionMode !== 'page' && ` (${selectionMode})`}
                                    </div>
                                    {onClearSelection && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClearSelection}
                                            className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Status + Type + Urgency + Payment Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Status
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? '' : e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Clearance Type
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.type || 'all'}
                                onChange={(e) => handleFilterChange('type', e.target.value === 'all' ? '' : e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Types</option>
                                {activeClearanceTypes.map((type) => (
                                    <option key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Urgency
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.urgency || 'all'}
                                onChange={(e) => handleFilterChange('urgency', e.target.value === 'all' ? '' : e.target.value)}
                                disabled={isLoading}
                            >
                                {urgencyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {paymentStatusOptions.length > 0 && (
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    Payment Status
                                </Label>
                                <select
                                    className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.payment_status || 'all'}
                                    onChange={(e) => handleFilterChange('payment_status', e.target.value === 'all' ? '' : e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all">All Payment Status</option>
                                    {paymentStatusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && showAdvancedToggle && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Applicant Type Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <UserCheck className="h-3 w-3" />
                                        Applicant Type
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={applicantTypeFilter}
                                        onChange={(e) => setApplicantTypeFilter?.(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {applicantTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount Range Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Amount Range
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={amountRange}
                                        onChange={(e) => setAmountRange?.(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {amountRangeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range with Presets */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Date Range (Created At)
                                    </Label>
                                    
                                    {/* Date Presets */}
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 mb-2"
                                        value={dateRangePreset}
                                        onChange={(e) => handleDateRangePresetChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {dateRangePresets.map(preset => (
                                            <option key={preset.value} value={preset.value}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Custom Date Range */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleFilterChange('status', 'pending');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleFilterChange('status', 'approved');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Approved Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleFilterChange('urgency', 'express');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Express Requests
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleFilterChange('payment_status', 'paid');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Paid Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setAmountRange?.('0-100');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Low Amount (₱0-100)
                                        </Button>
                                    </div>
                                </div>

                                {/* Bulk Selection Controls */}
                                {isBulkMode && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bulk Selection</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {onSelectAllPage && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={onSelectAllPage}
                                                    disabled={isLoading}
                                                    className="text-xs"
                                                >
                                                    Select Page ({Math.min(endIndex, totalItems) - startIndex})
                                                </Button>
                                            )}
                                            {onSelectAllFiltered && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={onSelectAllFiltered}
                                                    disabled={isLoading}
                                                    className="text-xs"
                                                >
                                                    Select Filtered ({totalFilteredItems || totalItems})
                                                </Button>
                                            )}
                                            {onSelectAll && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={onSelectAll}
                                                    disabled={isLoading}
                                                    className="text-xs"
                                                >
                                                    Select All
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Applicant Type</span> - Filter by resident, business, senior, or PWD</p>
                                    <p>• <span className="font-medium">Amount Range</span> - Filter by payment amount</p>
                                    <p>• <span className="font-medium">Date Range</span> - Filter by creation date using presets or custom range</p>
                                    <p>• <span className="font-medium">Urgency</span> - Express (1-2 days), Rush (3-5 days), Normal (7-14 days)</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

ClearancesFilters.displayName = 'ClearancesFilters';

export default ClearancesFilters;