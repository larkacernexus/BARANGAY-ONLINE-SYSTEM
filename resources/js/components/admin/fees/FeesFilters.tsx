// components/admin/fees/FeesFilters.tsx - COMPLETE REVISED FILE

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
    User,
    TrendingUp,
    Clock
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
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    onClearSelection?: () => void;
    dateRangePreset?: string;
    setDateRangePreset?: (value: string) => void;
    payerTypeFilter?: string;
    setPayerTypeFilter?: (value: string) => void;
    amountRange?: string;
    setAmountRange?: (value: string) => void;
    dueDateRange?: string;
    setDueDateRange?: (value: string) => void;
    categoryFilter?: string;
    setCategoryFilter?: (value: string) => void;
    categories?: Record<string, string>;
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
    setDueDateRange,
    categoryFilter = 'all',
    setCategoryFilter,
    categories = {}
}: FeesFiltersProps) {
    
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

    const amountRangeOptions = [
        { value: '', label: 'All Amounts' },
        { value: '0-100', label: '₱0 - ₱100' },
        { value: '101-500', label: '₱101 - ₱500' },
        { value: '501-1000', label: '₱501 - ₱1,000' },
        { value: '1001-5000', label: '₱1,001 - ₱5,000' },
        { value: '5000+', label: '₱5,000+' }
    ];

    const dueDateRangeOptions = [
        { value: '', label: 'All Due Dates' },
        { value: 'overdue', label: 'Overdue', color: 'red' },
        { value: 'due_today', label: 'Due Today', color: 'orange' },
        { value: 'due_this_week', label: 'Due This Week', color: 'amber' },
        { value: 'due_next_week', label: 'Due Next Week', color: 'blue' },
        { value: 'due_this_month', label: 'Due This Month', color: 'green' }
    ];

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

    const handleDueDateRangeChange = (range: string) => {
        setDueDateRange?.(range);
        updateFilter('due_date_range', range);
    };

    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (filtersState.purok && filtersState.purok !== 'all') count++;
        if (payerTypeFilter && payerTypeFilter !== 'all') count++;
        if (categoryFilter && categoryFilter !== 'all') count++;
        if (amountRange && amountRange !== '') count++;
        if (dueDateRange && dueDateRange !== '') count++;
        if (filtersState.from_date) count++;
        if (filtersState.to_date) count++;
        if (filtersState.min_amount) count++;
        if (filtersState.max_amount) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    const getPayerTypeIcon = (type: string) => {
        switch (type) {
            case 'resident': return <User className="h-3 w-3" />;
            case 'business': return <Building className="h-3 w-3" />;
            case 'household': return <Home className="h-3 w-3" />;
            default: return <Users className="h-3 w-3" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'emerald';
            case 'overdue': return 'red';
            case 'pending': return 'amber';
            case 'partial': return 'blue';
            default: return 'gray';
        }
    };

    const getStatusLabel = (value: string) => {
        return statuses[value] || value;
    };

    const getDueDateRangeInfo = (value: string) => {
        const option = dueDateRangeOptions.find(o => o.value === value);
        return { label: option?.label || value, color: option?.color || 'gray' };
    };

    const getAmountRangeLabel = (value: string) => {
        const option = amountRangeOptions.find(o => o.value === value);
        return option?.label || value;
    };

    const getPayerTypeLabel = (value: string) => {
        return payerTypes[value] || value;
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef as any}
                                placeholder="Search by fee code, payer name, OR number, certificate number..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
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
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">fee records</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">"{search}"</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {activeFilters && (
                                <>
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(filtersState.status) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getStatusColor(filtersState.status) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getStatusColor(filtersState.status) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <AlertCircle className="h-3 w-3 mr-1 inline" />
                                            {getStatusLabel(filtersState.status)}
                                        </Badge>
                                    )}
                                    {filtersState.purok && filtersState.purok !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <MapPin className="h-3 w-3 mr-1 inline" />
                                            {filtersState.purok}
                                        </Badge>
                                    )}
                                    {payerTypeFilter && payerTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            {getPayerTypeIcon(payerTypeFilter)}
                                            <span className="ml-1">{getPayerTypeLabel(payerTypeFilter)}</span>
                                        </Badge>
                                    )}
                                    {amountRange && amountRange !== '' && (
                                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <DollarSign className="h-3 w-3 mr-1 inline" />
                                            {getAmountRangeLabel(amountRange)}
                                        </Badge>
                                    )}
                                    {dueDateRange && dueDateRange !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getDueDateRangeInfo(dueDateRange).color === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getDueDateRangeInfo(dueDateRange).color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                            'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <CreditCard className="h-3 w-3 mr-1 inline" />
                                            {getDueDateRangeInfo(dueDateRange).label}
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
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                            {isBulkMode && selectedFees.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                    <Layers className="h-3 w-3 mr-1 inline" />
                                    {selectedFees.length} selected
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={filtersState.status || 'all'}
                                onValueChange={(value) => updateFilter('status', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Purok
                            </Label>
                            <Select
                                value={filtersState.purok || 'all'}
                                onValueChange={(value) => updateFilter('purok', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Puroks" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Puroks</SelectItem>
                                    {puroks.map((purok) => (
                                        <SelectItem key={purok} value={purok}>
                                            {purok}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Payer Type
                            </Label>
                            <Select
                                value={payerTypeFilter}
                                onValueChange={(value) => setPayerTypeFilter?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.entries(payerTypes).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2">
                                                {getPayerTypeIcon(value)}
                                                {label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                Category
                            </Label>
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => setCategoryFilter?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {Object.entries(categories).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Date Created Range
                                    </Label>
                                    
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
                                    
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-emerald-500" />
                                        Amount Range
                                    </Label>
                                    <Select
                                        value={amountRange}
                                        onValueChange={handleAmountRangeChange}
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

                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-purple-500" />
                                        Due Date Range
                                    </Label>
                                    <Select
                                        value={dueDateRange}
                                        onValueChange={handleDueDateRangeChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Due Dates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dueDateRangeOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            option.color === 'red' ? 'bg-red-500' :
                                                            option.color === 'orange' ? 'bg-orange-500' :
                                                            option.color === 'amber' ? 'bg-amber-500' :
                                                            option.color === 'blue' ? 'bg-blue-500' :
                                                            'bg-green-500'
                                                        }`} />
                                                        {option.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl lg:col-span-3">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-amber-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => updateFilter('status', 'overdue')}
                                            disabled={isLoading}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Overdue Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => updateFilter('status', 'pending')}
                                            disabled={isLoading}
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setAmountRange?.('0-100')}
                                            disabled={isLoading}
                                        >
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            Low Amount (₱0-100)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setDueDateRange?.('overdue')}
                                            disabled={isLoading}
                                        >
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            Overdue Fees
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setPayerTypeFilter?.('business')}
                                            disabled={isLoading}
                                        >
                                            <Building className="h-3 w-3 mr-1" />
                                            Business Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                updateFilter('from_date', today.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Today's Fees
                                        </Button>
                                    </div>
                                </div>

                                {isBulkMode && (
                                    <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-blue-500" />
                                            Bulk Selection
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                onClick={onSelectAllOnPage}
                                                disabled={isLoading}
                                            >
                                                Select Page ({Math.min(endIndex, totalItems) - startIndex})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                onClick={onSelectAllFiltered}
                                                disabled={isLoading}
                                            >
                                                Select Filtered
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                onClick={onSelectAll}
                                                disabled={isLoading}
                                            >
                                                Select All ({totalItems})
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" />
                                    Fee Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Search</span> - Searches by fee code, payer name, OR number, certificate number</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Payer Type</span> - Filter by Resident, Business, or Household</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Amount Range</span> - Filter fees by amount</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Due Date</span> - Find overdue or upcoming fees</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}