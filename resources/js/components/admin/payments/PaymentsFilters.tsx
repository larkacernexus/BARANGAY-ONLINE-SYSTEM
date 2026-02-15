// components/admin/payments/PaymentsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface PayerTypeOption {
    value: string;
    label: string;
}

interface PaginationMeta {
    from: number;
    to: number;
    total: number;
}

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
    searchInputRef: RefObject<HTMLInputElement>;
    payments: {
        meta: PaginationMeta;
    };
    isBulkMode: boolean;
    selectedPayments: number[];
    handleSelectAllOnPage: () => void;
    handleSelectAllFiltered: () => void;
    handleSelectAll: () => void;
    selectionRef: RefObject<HTMLDivElement>;
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
    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by OR number, payer name, reference number... (Ctrl+F)"
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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
                                className="h-9"
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
                                className="h-9"
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active filters indicator and clear button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {payments.meta?.from || 1} to {payments.meta?.to || 0} of {payments.meta?.total || 0} payments
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 h-8"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                            {isBulkMode && (
                                <div className="flex items-center gap-2" ref={selectionRef}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                        className="h-8"
                                    >
                                        <Layers className="h-3.5 w-3.5 mr-1" />
                                        Select
                                    </Button>
                                    {showSelectionOptions && (
                                        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                            <div className="p-2">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                    SELECTION OPTIONS
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm"
                                                    onClick={handleSelectAllOnPage}
                                                >
                                                    <Rows className="h-3.5 w-3.5 mr-2" />
                                                    Current Page ({payments.meta?.total || 0})
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm"
                                                    onClick={handleSelectAllFiltered}
                                                >
                                                    <Filter className="h-3.5 w-3.5 mr-2" />
                                                    All Filtered
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm"
                                                    onClick={handleSelectAll}
                                                >
                                                    <Hash className="h-3.5 w-3.5 mr-2" />
                                                    All ({payments.meta?.total || 0})
                                                </Button>
                                                <div className="border-t my-1"></div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                    onClick={() => setSelectedPayments([])}
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
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
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

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Method:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
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

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Payer:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
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
                        <div className="border-t pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="From date"
                                            type="date"
                                            className="flex-1"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <span className="self-center text-sm">to</span>
                                        <Input
                                            placeholder="To date"
                                            type="date"
                                            className="flex-1"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {isLoading && (
                    <div className="mt-3 text-sm text-blue-500 flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                        Loading payments...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}