// resources/js/components/admin/receipts/ReceiptsFilters.tsx
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    ChevronUp,
    ChevronDown,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { ReceiptFilterOptions } from '@/components/admin/receipts/receipt';

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
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: React.RefObject<HTMLInputElement>;
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

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
    };

    return (
        <>
            <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Search receipts by receipt #, OR #, payer name... (Ctrl+F)"
                                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    disabled={isLoading}
                                />
                                {search && !isLoading && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => handleSearch('')}
                                        disabled={isLoading}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    className="border rounded px-3 py-2 text-sm w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="">All Status</option>
                                    {filterOptions.status_options.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                
                                <Button 
                                    variant="outline"
                                    className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                                        const exportUrl = new URL('/admin/receipts/export', window.location.origin);
                                        if (search) exportUrl.searchParams.append('search', search);
                                        if (statusFilter) exportUrl.searchParams.append('status', statusFilter);
                                        if (methodFilter) exportUrl.searchParams.append('payment_method', methodFilter);
                                        if (typeFilter) exportUrl.searchParams.append('receipt_type', typeFilter);
                                        if (dateFrom) exportUrl.searchParams.append('date_from', dateFrom);
                                        if (dateTo) exportUrl.searchParams.append('date_to', dateTo);
                                        window.open(exportUrl.toString(), '_blank');
                                    }}
                                    disabled={isLoading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</Label>
                                        <select
                                            value={methodFilter}
                                            onChange={(e) => setMethodFilter(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">All Methods</option>
                                            {filterOptions.payment_methods.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Type</Label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">All Types</option>
                                            {filterOptions.receipt_types.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date From</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date To</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active filters indicator and clear button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} receipts
                                {search && ` matching "${search}"`}
                                {statusFilter && ` • Status: ${statusFilter}`}
                                {methodFilter && ` • Method: ${methodFilter}`}
                                {typeFilter && ` • Type: ${typeFilter}`}
                                {(dateFrom || dateTo) && ` • Date: ${dateFrom || 'any'} - ${dateTo || 'any'}`}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                                        disabled={isLoading}
                                    >
                                        <FilterX className="h-3.5 w-3.5 mr-1" />
                                        Clear Filters
                                    </Button>
                                )}
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={onApplyFilters}
                                    className="h-8"
                                    disabled={isLoading}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                                Updating...
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}