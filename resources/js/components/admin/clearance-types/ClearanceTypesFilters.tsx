// components/admin/clearance-types/ClearanceTypesFilters.tsx

import { useState, useRef } from 'react';
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
import { Download, FilterX, Search, X, Filter, Calendar, DollarSign, Tag, Layers, Hash, TrendingUp, Clock } from 'lucide-react';
import { route } from 'ziggy-js';

interface FilterState {
    search: string;
    status: string;
    requires_payment: string;
    discountable: string;
    fee_range?: string;
    date_range?: string;
}

interface ClearanceTypesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    // New filters
    feeRange?: string;
    setFeeRange?: (value: string) => void;
    dateRangePreset?: string;
    setDateRangePreset?: (value: string) => void;
}

export default function ClearanceTypesFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    handleClearFilters,
    hasActiveFilters,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false,
    feeRange = '',
    setFeeRange,
    dateRangePreset = '',
    setDateRangePreset
}: ClearanceTypesFiltersProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Fee range options
    const feeRangeOptions = [
        { value: '', label: 'All Fees', color: 'gray' },
        { value: '0', label: 'Free (₱0)', color: 'emerald' },
        { value: '1-50', label: '₱1 - ₱50', color: 'blue' },
        { value: '51-100', label: '₱51 - ₱100', color: 'amber' },
        { value: '101-200', label: '₱101 - ₱200', color: 'orange' },
        { value: '200+', label: '₱200+', color: 'red' }
    ];

    // Date range presets
    const dateRangePresets = [
        { value: '', label: 'All Time', color: 'gray' },
        { value: 'today', label: 'Today', color: 'blue' },
        { value: 'yesterday', label: 'Yesterday', color: 'blue' },
        { value: 'this_week', label: 'This Week', color: 'emerald' },
        { value: 'last_week', label: 'Last Week', color: 'emerald' },
        { value: 'this_month', label: 'This Month', color: 'purple' },
        { value: 'last_month', label: 'Last Month', color: 'purple' },
        { value: 'this_quarter', label: 'This Quarter', color: 'amber' },
        { value: 'this_year', label: 'This Year', color: 'orange' }
    ];

    // Handle fee range change
    const handleFeeRangeChange = (range: string) => {
        setFeeRange?.(range);
        updateFilter('fee_range', range);
    };

    // Handle date range preset change
    const handleDateRangePresetChange = (preset: string) => {
        setDateRangePreset?.(preset);
        updateFilter('date_range', preset);
    };

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (filtersState.requires_payment && filtersState.requires_payment !== 'all') count++;
        if (filtersState.discountable && filtersState.discountable !== 'all') count++;
        if (feeRange && feeRange !== '') count++;
        if (dateRangePreset && dateRangePreset !== '') count++;
        if (search) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'emerald';
            case 'inactive': return 'gray';
            default: return 'gray';
        }
    };

    // Get payment type label and color
    const getPaymentTypeInfo = (value: string) => {
        switch (value) {
            case 'yes': return { label: 'Paid', color: 'amber' };
            case 'no': return { label: 'Free', color: 'emerald' };
            default: return { label: value, color: 'gray' };
        }
    };

    // Get discountable info
    const getDiscountableInfo = (value: string) => {
        switch (value) {
            case 'yes': return { label: 'Discountable', color: 'purple' };
            case 'no': return { label: 'Non-Discountable', color: 'gray' };
            default: return { label: value, color: 'gray' };
        }
    };

    // Get fee range label and color
    const getFeeRangeInfo = (value: string) => {
        const option = feeRangeOptions.find(o => o.value === value);
        return { label: option?.label || value, color: option?.color || 'gray' };
    };

    // Get date range label
    const getDateRangeLabel = (value: string) => {
        const preset = dateRangePresets.find(p => p.value === value);
        return preset?.label || value;
    };

    return (
        <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-2xl">
            <CardContent className="p-6 md:p-7">
                <div className="flex flex-col space-y-6">
                    {/* Search Bar - Enhanced */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by name, code, or description... (Ctrl+F)"
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2.5">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all shadow-sm"
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
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all shadow-sm"
                                onClick={() => {
                                    const exportUrl = route('clearance-types.export', {
                                        search: search || undefined,
                                        status: filtersState.status !== 'all' ? filtersState.status : undefined,
                                        requires_payment: filtersState.requires_payment !== 'all' ? filtersState.requires_payment : undefined,
                                        discountable: filtersState.discountable !== 'all' ? filtersState.discountable : undefined,
                                        fee_range: feeRange || undefined,
                                        date_range: dateRangePreset || undefined,
                                    });
                                    window.open(exportUrl, '_blank');
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
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3.5 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">clearance types</span>
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
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(filtersState.status) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <Layers className="h-3 w-3 mr-1.5 inline" />
                                            Status: {filtersState.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                    {filtersState.requires_payment && filtersState.requires_payment !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getPaymentTypeInfo(filtersState.requires_payment).color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <DollarSign className="h-3 w-3 mr-1.5 inline" />
                                            {getPaymentTypeInfo(filtersState.requires_payment).label}
                                        </Badge>
                                    )}
                                    {filtersState.discountable && filtersState.discountable !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getDiscountableInfo(filtersState.discountable).color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <Tag className="h-3 w-3 mr-1.5 inline" />
                                            {getDiscountableInfo(filtersState.discountable).label}
                                        </Badge>
                                    )}
                                    {feeRange && feeRange !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getFeeRangeInfo(feeRange).color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getFeeRangeInfo(feeRange).color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getFeeRangeInfo(feeRange).color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            getFeeRangeInfo(feeRange).color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <Hash className="h-3 w-3 mr-1.5 inline" />
                                            {getFeeRangeInfo(feeRange).label}
                                        </Badge>
                                    )}
                                    {dateRangePreset && dateRangePreset !== '' && (
                                        <Badge variant="secondary" className={`${
                                            dateRangePreset === 'today' || dateRangePreset === 'yesterday' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            dateRangePreset === 'this_week' || dateRangePreset === 'last_week' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            dateRangePreset === 'this_month' || dateRangePreset === 'last_month' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <Calendar className="h-3 w-3 mr-1.5 inline" />
                                            {getDateRangeLabel(dateRangePreset)}
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
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium"
                                >
                                    <FilterX className="h-3 w-3 mr-1.5" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={filtersState.status}
                                onValueChange={(value) => updateFilter('status', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500 focus:ring-2 transition-all">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Type Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign className="h-3 w-3" />
                                Payment Type
                            </Label>
                            <Select
                                value={filtersState.requires_payment}
                                onValueChange={(value) => updateFilter('requires_payment', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-all">
                                    <SelectValue placeholder="All Payment" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Payment</SelectItem>
                                    <SelectItem value="yes">Paid</SelectItem>
                                    <SelectItem value="no">Free</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Discountable Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="h-3 w-3" />
                                Discountable
                            </Label>
                            <Select
                                value={filtersState.discountable}
                                onValueChange={(value) => updateFilter('discountable', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-all">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">Discountable</SelectItem>
                                    <SelectItem value="no">Non-Discountable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fee Range Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Hash className="h-3 w-3" />
                                Fee Range
                            </Label>
                            <Select
                                value={feeRange}
                                onValueChange={handleFeeRangeChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-all">
                                    <SelectValue placeholder="All Fees" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {feeRangeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    option.color === 'emerald' ? 'bg-emerald-500' :
                                                    option.color === 'blue' ? 'bg-blue-500' :
                                                    option.color === 'amber' ? 'bg-amber-500' :
                                                    option.color === 'orange' ? 'bg-orange-500' :
                                                    option.color === 'red' ? 'bg-red-500' :
                                                    'bg-gray-400'
                                                }`} />
                                                {option.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-2 space-y-6">
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date Range with Presets */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-4 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Created Date
                                    </Label>
                                    <Select
                                        value={dateRangePreset}
                                        onValueChange={handleDateRangePresetChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-all">
                                            <SelectValue placeholder="All Time" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {dateRangePresets.map(preset => (
                                                <SelectItem key={preset.value} value={preset.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            preset.color === 'blue' ? 'bg-blue-500' :
                                                            preset.color === 'emerald' ? 'bg-emerald-500' :
                                                            preset.color === 'purple' ? 'bg-purple-500' :
                                                            preset.color === 'amber' ? 'bg-amber-500' :
                                                            preset.color === 'orange' ? 'bg-orange-500' :
                                                            'bg-gray-400'
                                                        }`} />
                                                        {preset.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-4 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-amber-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                updateFilter('status', 'active');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                updateFilter('requires_payment', 'no');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Free Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                updateFilter('discountable', 'yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Discountable
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                setFeeRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Free Types
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                setDateRangePreset?.('this_month');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Calendar className="h-3 w-3 mr-1" />
                                            This Month
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2.5 uppercase tracking-wide flex items-center gap-2">
                                    <Tag className="h-3.5 w-3.5" />
                                    Clearance Type Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Fee Range</span> - Filter clearance types by fee amount</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Created Date</span> - Filter by creation date</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Discountable</span> - Whether discounts can be applied</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Payment Type</span> - Paid or free clearance types</p>
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