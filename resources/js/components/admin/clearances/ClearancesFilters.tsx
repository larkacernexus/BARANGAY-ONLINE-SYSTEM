// components/admin/clearances/ClearancesFilters.tsx

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
import { Search, X, Filter, Download, FilterX, Layers, Calendar, Clock, FileText, DollarSign, UserCheck, AlertCircle, CreditCard, TrendingUp, Zap, Hash } from 'lucide-react';
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
    // Add missing props
    clearanceNumberFilter?: string;
    setClearanceNumberFilter?: (value: string) => void;
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
    setAmountRange,
    clearanceNumberFilter = '',
    setClearanceNumberFilter
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
        { value: 'all', label: 'All Urgency', color: 'gray' },
        { value: 'express', label: 'Express (1-2 days)', color: 'red' },
        { value: 'rush', label: 'Rush (3-5 days)', color: 'orange' },
        { value: 'normal', label: 'Normal (7-14 days)', color: 'green' }
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
            if (clearanceNumberFilter) params.append('clearance_number', clearanceNumberFilter);
            
            exportUrl.search = params.toString();
            window.open(exportUrl.toString(), '_blank');
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [localSearch, filtersState, applicantTypeFilter, amountRange, clearanceNumberFilter]);
    
    // Handle filter change
    const handleFilterChange = useCallback((key: string, value: string) => {
        updateFilter(key, value);
    }, [updateFilter]);
    
    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);
    
    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (filtersState.type && filtersState.type !== 'all') count++;
        if (filtersState.urgency && filtersState.urgency !== 'all') count++;
        if (filtersState.payment_status && filtersState.payment_status !== 'all') count++;
        if (applicantTypeFilter && applicantTypeFilter !== 'all') count++;
        if (amountRange && amountRange !== '') count++;
        if (clearanceNumberFilter) count++;
        if (filtersState.from_date) count++;
        if (filtersState.to_date) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();
    
    // Get display text for items count
    const itemsDisplayText = useMemo(() => {
        if (totalFilteredItems !== undefined && totalFilteredItems !== totalItems) {
            return `Showing ${startIndex + 1} to ${Math.min(endIndex, totalFilteredItems)} of ${totalFilteredItems} filtered results (${totalItems} total)`;
        }
        return `Showing ${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems} requests`;
    }, [startIndex, endIndex, totalItems, totalFilteredItems]);
    
    const showAdvancedToggle = setShowAdvancedFilters !== undefined;

    // Get status label and color
    const getStatusInfo = (value: string) => {
        const option = statusOptions.find(o => o.value === value);
        let color = 'gray';
        if (value === 'pending') color = 'amber';
        if (value === 'approved') color = 'emerald';
        if (value === 'rejected') color = 'rose';
        if (value === 'processing') color = 'blue';
        return { label: option?.label || value, color };
    };

    // Get urgency info
    const getUrgencyInfo = (value: string) => {
        const option = urgencyOptions.find(o => o.value === value);
        let color = 'gray';
        if (value === 'express') color = 'red';
        if (value === 'rush') color = 'orange';
        if (value === 'normal') color = 'green';
        return { label: option?.label || value, color };
    };

    // Get payment status info
    const getPaymentStatusInfo = (value: string) => {
        const option = paymentStatusOptions.find(o => o.value === value);
        let color = 'gray';
        if (value === 'paid') color = 'emerald';
        if (value === 'unpaid') color = 'rose';
        if (value === 'partial') color = 'amber';
        return { label: option?.label || value, color };
    };

    // Get clearance type label
    const getClearanceTypeLabel = (value: string) => {
        const type = activeClearanceTypes.find(t => t.id.toString() === value);
        return type?.name || value;
    };

    // Get applicant type label
    const getApplicantTypeLabel = (value: string) => {
        const type = applicantTypeOptions.find(t => t.value === value);
        return type?.label || value;
    };

    // Get amount range label
    const getAmountRangeLabel = (value: string) => {
        const range = amountRangeOptions.find(r => r.value === value);
        return range?.label || value;
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
                                placeholder="Search by reference number, applicant name, or purpose..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={localSearch}
                                onChange={handleSearchChange}
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
                            {showAdvancedToggle && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                            )}
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                onClick={handleExport}
                                disabled={isLoading || isExporting || totalItems === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalFilteredItems || totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalFilteredItems || totalItems}</span>
                            <span className="ml-1">clearance requests</span>
                            {localSearch && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{localSearch}”</span>
                                </span>
                            )}
                            {totalFilteredItems !== undefined && totalFilteredItems !== totalItems && (
                                <span className="ml-1 text-gray-400">
                                    ({totalItems} total)
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active filter badges */}
                            {activeFilters && (
                                <>
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusInfo(filtersState.status).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getStatusInfo(filtersState.status).color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            getStatusInfo(filtersState.status).color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <AlertCircle className="h-3 w-3 mr-1 inline" />
                                            {getStatusInfo(filtersState.status).label}
                                        </Badge>
                                    )}
                                    {filtersState.type && filtersState.type !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <FileText className="h-3 w-3 mr-1 inline" />
                                            {getClearanceTypeLabel(filtersState.type)}
                                        </Badge>
                                    )}
                                    {filtersState.urgency && filtersState.urgency !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getUrgencyInfo(filtersState.urgency).color === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getUrgencyInfo(filtersState.urgency).color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                            'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Zap className="h-3 w-3 mr-1 inline" />
                                            {getUrgencyInfo(filtersState.urgency).label}
                                        </Badge>
                                    )}
                                    {filtersState.payment_status && filtersState.payment_status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getPaymentStatusInfo(filtersState.payment_status).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getPaymentStatusInfo(filtersState.payment_status).color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <CreditCard className="h-3 w-3 mr-1 inline" />
                                            Payment: {getPaymentStatusInfo(filtersState.payment_status).label}
                                        </Badge>
                                    )}
                                    {applicantTypeFilter && applicantTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <UserCheck className="h-3 w-3 mr-1 inline" />
                                            {getApplicantTypeLabel(applicantTypeFilter)}
                                        </Badge>
                                    )}
                                    {amountRange && amountRange !== '' && (
                                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <DollarSign className="h-3 w-3 mr-1 inline" />
                                            {getAmountRangeLabel(amountRange)}
                                        </Badge>
                                    )}
                                    {clearanceNumberFilter && (
                                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Hash className="h-3 w-3 mr-1 inline" />
                                            #{clearanceNumberFilter}
                                        </Badge>
                                    )}
                                    {(filtersState.from_date || filtersState.to_date) && (
                                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {filtersState.from_date && filtersState.to_date 
                                                ? `${filtersState.from_date} → ${filtersState.to_date}`
                                                : filtersState.from_date 
                                                    ? `From ${filtersState.from_date}`
                                                    : `Until ${filtersState.to_date}`}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                            {isBulkMode && selectedCount > 0 && (
                                <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                    <Layers className="h-3 w-3 mr-1 inline" />
                                    {selectedCount} selected {selectionMode !== 'page' && `(${selectionMode})`}
                                    {onClearSelection && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClearSelection}
                                            className="h-5 px-1 ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={filtersState.status || 'all'}
                                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clearance Type Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Clearance Type
                            </Label>
                            <Select
                                value={filtersState.type || 'all'}
                                onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {activeClearanceTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Urgency Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Urgency
                            </Label>
                            <Select
                                value={filtersState.urgency || 'all'}
                                onValueChange={(value) => handleFilterChange('urgency', value === 'all' ? '' : value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Urgency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {urgencyOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    option.color === 'red' ? 'bg-red-500' :
                                                    option.color === 'orange' ? 'bg-orange-500' :
                                                    'bg-green-500'
                                                }`} />
                                                {option.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Status Filter */}
                        {paymentStatusOptions.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    Payment Status
                                </Label>
                                <Select
                                    value={filtersState.payment_status || 'all'}
                                    onValueChange={(value) => handleFilterChange('payment_status', value === 'all' ? '' : value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                        <SelectValue placeholder="All Payment Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment Status</SelectItem>
                                        {paymentStatusOptions.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && showAdvancedToggle && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Clearance Number Filter */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-indigo-500" />
                                        Clearance Number
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Search by clearance number..."
                                        value={clearanceNumberFilter}
                                        onChange={(e) => setClearanceNumberFilter?.(e.target.value)}
                                        className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Applicant Type Filter */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-indigo-500" />
                                        Applicant Type
                                    </Label>
                                    <Select
                                        value={applicantTypeFilter}
                                        onValueChange={(value) => setApplicantTypeFilter?.(value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Applicants" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {applicantTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Amount Range Filter */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-emerald-500" />
                                        Amount Range
                                    </Label>
                                    <Select
                                        value={amountRange}
                                        onValueChange={(value) => setAmountRange?.(value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Amounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {amountRangeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range with Presets */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-purple-500" />
                                        Date Created Range
                                    </Label>
                                    
                                    {/* Date Presets */}
                                    <Select
                                        value={dateRangePreset}
                                        onValueChange={handleDateRangePresetChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="Custom Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dateRangePresets.map(preset => (
                                                <SelectItem key={preset.value} value={preset.value}>
                                                    {preset.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Custom Date Range */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl lg:col-span-4">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-amber-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleFilterChange('urgency', 'express');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Zap className="h-3 w-3 mr-1" />
                                            Express Requests
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleFilterChange('payment_status', 'paid');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            Paid Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setAmountRange?.('0-100');
                                                setShowAdvancedFilters?.(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            Low Amount (₱0-100)
                                        </Button>
                                    </div>
                                </div>

                                {/* Bulk Selection Controls */}
                                {isBulkMode && (
                                    <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl lg:col-span-4">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-blue-500" />
                                            Bulk Selection
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {onSelectAllPage && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={onSelectAllPage}
                                                    disabled={isLoading}
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
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
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                >
                                                    Select All
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    Clearance Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Clearance Number</span> - Search by specific clearance number</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Applicant Type</span> - Filter by resident, business, senior, or PWD</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Amount Range</span> - Filter by payment amount</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Date Range</span> - Filter by creation date using presets or custom range</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Urgency</span> - Express (1-2 days), Rush (3-5 days), Normal (7-14 days)</p>
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