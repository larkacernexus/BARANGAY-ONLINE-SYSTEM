// components/admin/payments/PaymentsFilters.tsx

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
    Rows,
    Hash,
    RotateCcw
} from 'lucide-react';
import { RefObject } from 'react';

// Import types from centralized location
import type { 
    PaymentMethod, 
    StatusOption, 
    PayerTypeOption,
    PaginationMeta 
} from '@/types/admin/payments/payments';

interface PaymentsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    methodFilter: string;
    setMethodFilter: (value: string) => void;
    payerTypeFilter: string;
    setPayerTypeFilter: (value: string) => void;
    dateFrom: string;
    setDateFrom: (value: string) => void;
    dateTo: string;
    setDateTo: (value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    handleExport: () => void;
    hasActiveFilters: boolean;
    isLoading: boolean;
    paymentMethods: PaymentMethod[];
    statusOptions: StatusOption[];
    payerTypeOptions: PayerTypeOption[];
    searchInputRef: RefObject<HTMLInputElement | null>;
    payments: {
        meta: PaginationMeta;
    };
    isBulkMode: boolean;
    selectedPayments: number[];
    handleSelectAllOnPage: () => void;
    handleSelectAllFiltered: () => void;
    handleSelectAll: () => void;
    selectionRef: RefObject<HTMLDivElement | null>;
    showSelectionOptions: boolean;
    setShowSelectionOptions: (value: boolean) => void;
    setSelectedPayments: (value: number[] | ((prev: number[]) => number[])) => void;
}

export default function PaymentsFilters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    payerTypeFilter,
    setPayerTypeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    handleExport,
    hasActiveFilters,
    isLoading,
    paymentMethods,
    statusOptions,
    payerTypeOptions,
    searchInputRef,
    payments,
    isBulkMode,
    selectedPayments,
    handleSelectAllOnPage,
    handleSelectAllFiltered,
    handleSelectAll,
    selectionRef,
    showSelectionOptions,
    setShowSelectionOptions,
    setSelectedPayments
}: PaymentsFiltersProps) {
    
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
                                placeholder="Search by OR number, payer name, reference number..."
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
                                onClick={handleExport}
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
                            Showing {payments.meta?.from || 1} to {payments.meta?.to || 0} of {payments.meta?.total || 0} payments
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
                            {isBulkMode && selectedPayments.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md text-xs">
                                        <Layers className="h-3 w-3" />
                                        <span>{selectedPayments.length} selected</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedPayments([])}
                                        className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )}
                            {isBulkMode && (
                                <div className="flex items-center gap-2 relative" ref={selectionRef}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                        disabled={isLoading}
                                        className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Layers className="h-3.5 w-3.5 mr-1" />
                                        Select
                                    </Button>
                                    
                                    {showSelectionOptions && (
                                        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                            <div className="p-2">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                    SELECTION OPTIONS
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={handleSelectAllOnPage}
                                                >
                                                    <Rows className="h-3.5 w-3.5 mr-2" />
                                                    Current Page
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={handleSelectAllFiltered}
                                                >
                                                    <Filter className="h-3.5 w-3.5 mr-2" />
                                                    All Filtered
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={handleSelectAll}
                                                >
                                                    <Hash className="h-3.5 w-3.5 mr-2" />
                                                    All ({payments.meta?.total || 0})
                                                </Button>
                                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    onClick={() => {
                                                        setSelectedPayments([]);
                                                        setShowSelectionOptions(false);
                                                    }}
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Payment Method</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Methods</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Payer Type</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={payerTypeFilter}
                                onChange={(e) => setPayerTypeFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Types</option>
                                {payerTypeOptions.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
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
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                setDateFrom(firstDay.toISOString().split('T')[0]);
                                                setDateTo(today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                const today = new Date();
                                                const thirtyDaysAgo = new Date(today);
                                                thirtyDaysAgo.setDate(today.getDate() - 30);
                                                setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
                                                setDateTo(today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Last 30 Days
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                        Loading payments...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}