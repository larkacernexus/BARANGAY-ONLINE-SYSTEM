// components/admin/fees/FeesFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
    Search, 
    Filter, 
    Download, 
    X, 
    FilterX,
    Layers,
    Calendar,
    DollarSign,
    Users,
    AlertCircle,
    MapPin,
    CreditCard,
    Building,
    Home,
    User
} from 'lucide-react';
import { Filters } from '@/types/admin/fees/fees';
import { RefObject } from 'react';

interface FeesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: Filters;
    updateFilter: (key: keyof Filters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    statuses: Record<string, string>;
    puroks: string[];
    payerTypes?: Record<string, string>;
    startIndex: number;
    endIndex: number;
    totalItems: number;
    isBulkMode: boolean;
    selectedFees: number[];
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    searchInputRef?: RefObject<HTMLInputElement>;
    isLoading?: boolean;
    onClearSelection?: () => void;
    // New filters
    dateRangePreset?: string;
    setDateRangePreset?: (value: string) => void;
    payerTypeFilter?: string;
    setPayerTypeFilter?: (value: string) => void;
    amountRange?: string;
    setAmountRange?: (value: string) => void;
    dueDateRange?: string;
    setDueDateRange?: (value: string) => void;
}

export default function FeesFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    statuses,
    puroks,
    payerTypes = {},
    startIndex,
    endIndex,
    totalItems,
    isBulkMode,
    selectedFees,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    searchInputRef,
    isLoading = false,
    onClearSelection,
    dateRangePreset = '',
    setDateRangePreset,
    payerTypeFilter = 'all',
    setPayerTypeFilter,
    amountRange = '',
    setAmountRange,
    dueDateRange = '',
    setDueDateRange
}: FeesFiltersProps) {
    
    // Date range presets
    const dateRangePresets = [
        { value: '', label: 'Custom Range' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_3_months', label: 'Last 3 Months' }
    ];

    // Amount range options
    const amountRangeOptions = [
        { value: '', label: 'All Amounts' },
        { value: '0-100', label: '₱0 - ₱100' },
        { value: '101-500', label: '₱101 - ₱500' },
        { value: '501-1000', label: '₱501 - ₱1,000' },
        { value: '1001-5000', label: '₱1,001 - ₱5,000' },
        { value: '5000+', label: '₱5,000+' }
    ];

    // Due date range options
    const dueDateRangeOptions = [
        { value: '', label: 'All Due Dates' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'due_today', label: 'Due Today' },
        { value: 'due_this_week', label: 'Due This Week' },
        { value: 'due_next_week', label: 'Due Next Week' },
        { value: 'due_this_month', label: 'Due This Month' }
    ];

    // Handle date range preset change
    const handleDateRangePresetChange = (preset: string) => {
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
    };

    // Handle amount range change
    const handleAmountRangeChange = (range: string) => {
        setAmountRange?.(range);
        if (range) {
            const [min, max] = range.split('-');
            if (min && max && max !== '+') {
                updateFilter('min_amount', min);
                updateFilter('max_amount', max);
            } else if (range === '5000+') {
                updateFilter('min_amount', '5000');
                updateFilter('max_amount', '');
            }
        } else {
            updateFilter('min_amount', '');
            updateFilter('max_amount', '');
        }
    };

    // Handle due date range change
    const handleDueDateRangeChange = (range: string) => {
        setDueDateRange?.(range);
        updateFilter('due_date_range', range);
    };

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Get icon for payer type
    const getPayerTypeIcon = (type: string) => {
        switch (type) {
            case 'resident': return <User className="h-3 w-3 mr-1" />;
            case 'business': return <Building className="h-3 w-3 mr-1" />;
            case 'household': return <Home className="h-3 w-3 mr-1" />;
            default: return <Users className="h-3 w-3 mr-1" />;
        }
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
                                placeholder="Search by fee code, payer name, OR number, certificate #..."
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
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
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
                            <Button 
                                variant="outline"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                    const exportUrl = new URL('/admin/fees/export', window.location.origin);
                                    if (search) exportUrl.searchParams.append('search', search);
                                    if (filtersState.status && filtersState.status !== 'all') exportUrl.searchParams.append('status', filtersState.status);
                                    if (filtersState.purok && filtersState.purok !== 'all') exportUrl.searchParams.append('purok', filtersState.purok);
                                    if (filtersState.from_date) exportUrl.searchParams.append('from_date', filtersState.from_date);
                                    if (filtersState.to_date) exportUrl.searchParams.append('to_date', filtersState.to_date);
                                    if (payerTypeFilter && payerTypeFilter !== 'all') exportUrl.searchParams.append('payer_type', payerTypeFilter);
                                    if (amountRange) exportUrl.searchParams.append('amount_range', amountRange);
                                    if (dueDateRange) exportUrl.searchParams.append('due_date_range', dueDateRange);
                                    window.open(exportUrl.toString(), '_blank');
                                }}
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
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fees
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                            {isBulkMode && selectedFees.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md text-xs">
                                        <Layers className="h-3 w-3" />
                                        <span>{selectedFees.length} selected</span>
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

                    {/* Basic Filters - Status + Purok + Payer Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Status
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                {Object.entries(statuses).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Purok
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.purok || 'all'}
                                onChange={(e) => updateFilter('purok', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Puroks</option>
                                {puroks.map((purok) => (
                                    <option key={purok} value={purok}>
                                        {purok}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Payer Type
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={payerTypeFilter}
                                onChange={(e) => setPayerTypeFilter?.(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Types</option>
                                {Object.entries(payerTypes).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        <div className="flex items-center">
                                            {getPayerTypeIcon(value)}
                                            {label}
                                        </div>
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date Range with Presets */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Date Range (Created At)
                                    </Label>
                                    
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
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Amount Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Amount Range
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={amountRange}
                                        onChange={(e) => handleAmountRangeChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {amountRangeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Due Date Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Due Date Range
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={dueDateRange}
                                        onChange={(e) => handleDueDateRangeChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {dueDateRangeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => updateFilter('status', 'overdue')}
                                            disabled={isLoading}
                                        >
                                            Overdue Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => updateFilter('status', 'pending')}
                                            disabled={isLoading}
                                        >
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setAmountRange?.('0-100')}
                                            disabled={isLoading}
                                        >
                                            Low Amount (₱0-100)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setDueDateRange?.('overdue')}
                                            disabled={isLoading}
                                        >
                                            Overdue Fees
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setPayerTypeFilter?.('business')}
                                            disabled={isLoading}
                                        >
                                            Business Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                const today = new Date();
                                                updateFilter('from_date', today.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Today's Fees
                                        </Button>
                                    </div>
                                </div>

                                {/* Bulk Selection Controls */}
                                {isBulkMode && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bulk Selection</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={onSelectAllOnPage}
                                                disabled={isLoading}
                                            >
                                                Select Page
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={onSelectAllFiltered}
                                                disabled={isLoading}
                                            >
                                                Select All Filtered
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={onSelectAll}
                                                disabled={isLoading}
                                            >
                                                Select All ({totalItems})
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Search</span> - Searches by fee code, payer name, OR number, certificate number</p>
                                    <p>• <span className="font-medium">Payer Type</span> - Filter by Resident, Business, or Household</p>
                                    <p>• <span className="font-medium">Amount Range</span> - Filter fees by amount</p>
                                    <p>• <span className="font-medium">Due Date</span> - Find overdue or upcoming fees</p>
                                    <p>• <span className="font-medium">Date Range</span> - Filter by creation date</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}