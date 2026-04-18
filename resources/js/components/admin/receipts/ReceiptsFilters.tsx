// resources/js/components/admin/receipts/ReceiptsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    Calendar,
    DollarSign,
    CreditCard,
    Receipt,
    AlertCircle,
    Printer,
    TrendingUp,
    Clock
} from 'lucide-react';
import { ReceiptFilterOptions } from '@/components/admin/receipts/receipt';
import { RefObject } from 'react';

interface ReceiptsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    methodFilter: string;
    setMethodFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    dateFrom: string;
    setDateFrom: (value: string) => void;
    dateTo: string;
    setDateTo: (value: string) => void;
    amountRange: string;
    setAmountRange: (value: string) => void;
    printedStatusFilter: string;
    setPrintedStatusFilter: (value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    filterOptions: ReceiptFilterOptions;
    onApplyFilters: () => void;
}

export default function ReceiptsFilters({
    search,
    setSearch,
    onSearchChange,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    typeFilter,
    setTypeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    amountRange,
    setAmountRange,
    printedStatusFilter,
    setPrintedStatusFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false,
    filterOptions,
    onApplyFilters
}: ReceiptsFiltersProps) {
    
    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    // Amount range options
    const amountRangeOptions = [
        { value: '', label: 'All Amounts' },
        { value: '0-100', label: '₱0 - ₱100' },
        { value: '101-500', label: '₱101 - ₱500' },
        { value: '501-1000', label: '₱501 - ₱1,000' },
        { value: '1001-5000', label: '₱1,001 - ₱5,000' },
        { value: '5000+', label: '₱5,000+' }
    ];

    // Printed status options
    const printedStatusOptions = [
        { value: '', label: 'All Receipts' },
        { value: 'printed', label: 'Printed', color: 'emerald' },
        { value: 'unprinted', label: 'Not Printed', color: 'amber' }
    ];

    // Date range presets
    const dateRangePresets = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'this_year', label: 'This Year' }
    ];

    // Handle date range preset
    const handleDateRangePreset = (preset: string) => {
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
            case 'this_quarter':
                const currentQuarter = Math.floor(today.getMonth() / 3);
                const firstDayOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
                const lastDayOfQuarter = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0);
                fromDate = firstDayOfQuarter.toISOString().split('T')[0];
                toDate = lastDayOfQuarter.toISOString().split('T')[0];
                break;
            case 'this_year':
                fromDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                toDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
                break;
            default:
                return;
        }
        
        setDateFrom(fromDate);
        setDateTo(toDate);
    };

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (statusFilter && statusFilter !== '') count++;
        if (methodFilter && methodFilter !== '') count++;
        if (typeFilter && typeFilter !== '') count++;
        if (printedStatusFilter && printedStatusFilter !== '') count++;
        if (dateFrom) count++;
        if (dateTo) count++;
        if (amountRange && amountRange !== '') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'emerald';
            case 'pending': return 'amber';
            case 'failed': return 'red';
            case 'refunded': return 'purple';
            default: return 'gray';
        }
    };

    // Get status label
    const getStatusLabel = (value: string) => {
        const option = filterOptions.status_options.find(o => o.value === value);
        return option?.label || value;
    };

    // Get method label
    const getMethodLabel = (value: string) => {
        const method = filterOptions.payment_methods.find(m => m.value === value);
        return method?.label || value;
    };

    // Get receipt type label
    const getReceiptTypeLabel = (value: string) => {
        const type = filterOptions.receipt_types.find(t => t.value === value);
        return type?.label || value;
    };

    // Get printed status info
    const getPrintedStatusInfo = (value: string) => {
        const option = printedStatusOptions.find(o => o.value === value);
        return { label: option?.label || value, color: option?.color || 'gray' };
    };

    // Get amount range label
    const getAmountRangeLabel = (value: string) => {
        const option = amountRangeOptions.find(o => o.value === value);
        return option?.label || value;
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
                                placeholder="Search receipts by receipt number, OR number, payer name, or transaction ID..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => handleSearch('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
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
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                onClick={() => {
                                    const exportUrl = new URL('/admin/receipts/export', window.location.origin);
                                    if (search) exportUrl.searchParams.append('search', search);
                                    if (statusFilter) exportUrl.searchParams.append('status', statusFilter);
                                    if (methodFilter) exportUrl.searchParams.append('payment_method', methodFilter);
                                    if (typeFilter) exportUrl.searchParams.append('receipt_type', typeFilter);
                                    if (dateFrom) exportUrl.searchParams.append('date_from', dateFrom);
                                    if (dateTo) exportUrl.searchParams.append('date_to', dateTo);
                                    if (amountRange) exportUrl.searchParams.append('amount_range', amountRange);
                                    if (printedStatusFilter) exportUrl.searchParams.append('printed_status', printedStatusFilter);
                                    window.open(exportUrl.toString(), '_blank');
                                }}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">receipts</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{search}”</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active filter badges */}
                            {activeFilters && (
                                <>
                                    {statusFilter && statusFilter !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(statusFilter) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getStatusColor(statusFilter) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            getStatusColor(statusFilter) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <AlertCircle className="h-3 w-3 mr-1 inline" />
                                            {getStatusLabel(statusFilter)}
                                        </Badge>
                                    )}
                                    {methodFilter && methodFilter !== '' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <CreditCard className="h-3 w-3 mr-1 inline" />
                                            {getMethodLabel(methodFilter)}
                                        </Badge>
                                    )}
                                    {typeFilter && typeFilter !== '' && (
                                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Receipt className="h-3 w-3 mr-1 inline" />
                                            {getReceiptTypeLabel(typeFilter)}
                                        </Badge>
                                    )}
                                    {printedStatusFilter && printedStatusFilter !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getPrintedStatusInfo(printedStatusFilter).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Printer className="h-3 w-3 mr-1 inline" />
                                            {getPrintedStatusInfo(printedStatusFilter).label}
                                        </Badge>
                                    )}
                                    {amountRange && amountRange !== '' && (
                                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <DollarSign className="h-3 w-3 mr-1 inline" />
                                            {getAmountRangeLabel(amountRange)}
                                        </Badge>
                                    )}
                                    {(dateFrom || dateTo) && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {dateFrom && dateTo 
                                                ? `${dateFrom} → ${dateTo}`
                                                : dateFrom 
                                                    ? `From ${dateFrom}`
                                                    : `Until ${dateTo}`}
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
                            <Button
                                variant="default"
                                size="sm"
                                onClick={onApplyFilters}
                                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm"
                                disabled={isLoading}
                            >
                                Apply Filters
                            </Button>
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
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Status</SelectItem>
                                    {filterOptions.status_options.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Method Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                Payment Method
                            </Label>
                            <Select
                                value={methodFilter}
                                onValueChange={setMethodFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Methods</SelectItem>
                                    {filterOptions.payment_methods.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Receipt Type Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                Receipt Type
                            </Label>
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    {filterOptions.receipt_types.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Printed Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Printer className="h-3 w-3" />
                                Printed Status
                            </Label>
                            <Select
                                value={printedStatusFilter}
                                onValueChange={setPrintedStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Receipts" />
                                </SelectTrigger>
                                <SelectContent>
                                    {printedStatusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
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
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Date Range with Presets */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Date Range
                                    </Label>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {dateRangePresets.map(preset => (
                                            <Button
                                                key={preset.value}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                                onClick={() => handleDateRangePreset(preset.value)}
                                                disabled={isLoading}
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Range */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-emerald-500" />
                                        Amount Range
                                    </Label>
                                    <Select
                                        value={amountRange}
                                        onValueChange={setAmountRange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Amounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {amountRangeOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {amountRange && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                            Filtering by amount range
                                        </p>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
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
                                                setStatusFilter('paid');
                                                setMethodFilter('');
                                                setTypeFilter('');
                                                setDateFrom('');
                                                setDateTo('');
                                                setAmountRange('');
                                                setPrintedStatusFilter('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Receipt className="h-3 w-3 mr-1" />
                                            Paid Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setStatusFilter('pending');
                                                setMethodFilter('');
                                                setTypeFilter('');
                                                setDateFrom('');
                                                setDateTo('');
                                                setAmountRange('');
                                                setPrintedStatusFilter('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setPrintedStatusFilter('unprinted');
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Printer className="h-3 w-3 mr-1" />
                                            Not Printed
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setAmountRange('5000+');
                                            }}
                                            disabled={isLoading}
                                        >
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            High Amount (₱5000+)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                setDateFrom(today.toISOString().split('T')[0]);
                                                setDateTo(today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Today's Receipts
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Receipt className="h-3 w-3" />
                                    Receipt Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Search</span> - Searches by receipt number, OR number, payer name, transaction ID</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Printed Status</span> - Filter by whether receipt has been printed</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Amount Range</span> - Filter receipts by amount</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Date Range</span> - Filter by date with presets</p>
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