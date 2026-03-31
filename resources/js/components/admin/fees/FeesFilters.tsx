// components/admin/fees/FeesFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Search, 
    Filter, 
    Download, 
    X, 
    FilterX,
    RotateCcw,
    Layers,
    Hash,
    List as ListIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    categories: Record<string, string>;
    puroks: string[];
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
    onClearSelection?: () => void;  // Added missing prop
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
    categories,
    puroks,
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
    onClearSelection
}: FeesFiltersProps) {
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
                                placeholder="Search fees by code, payer, certificate #... (Ctrl+F)"
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
                                    if (filtersState.category && filtersState.category !== 'all') exportUrl.searchParams.append('category', filtersState.category);
                                    if (filtersState.purok && filtersState.purok !== 'all') exportUrl.searchParams.append('purok', filtersState.purok);
                                    if (filtersState.from_date) exportUrl.searchParams.append('from_date', filtersState.from_date);
                                    if (filtersState.to_date) exportUrl.searchParams.append('to_date', filtersState.to_date);
                                    window.open(exportUrl.toString(), '_blank');
                                }}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Count and Selection Options */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fees
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                            {isBulkMode && selectedFees.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={onSelectAllOnPage}
                                                disabled={isLoading}
                                                className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <ListIcon className="h-3.5 w-3.5 mr-1" />
                                                Select Page
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                            Select all on current page
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={onSelectAllFiltered}
                                                disabled={isLoading}
                                                className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Layers className="h-3.5 w-3.5 mr-1" />
                                                Select All
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                            Select all filtered fees ({totalItems})
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onClearSelection?.()}
                                                disabled={isLoading}
                                                className="h-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                            Clear Selection ({selectedFees.length} selected)
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                {Object.entries(statuses).map(([value, label]) => (
                                    <option key={value} value={value} className="bg-white dark:bg-gray-900">
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Category:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.category || 'all'}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Categories</option>
                                {Object.entries(categories).map(([value, label]) => (
                                    <option key={value} value={value} className="bg-white dark:bg-gray-900">
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Purok Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Purok:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.purok || 'all'}
                                onChange={(e) => updateFilter('purok', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Puroks</option>
                                {puroks.map((purok) => (
                                    <option key={purok} value={purok} className="bg-white dark:bg-gray-900">
                                        {purok}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.sort_by || 'created_at'}
                                onChange={(e) => updateFilter('sort_by', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="created_at" className="bg-white dark:bg-gray-900">Date Added</option>
                                <option value="fee_code" className="bg-white dark:bg-gray-900">Fee Code</option>
                                <option value="payer_name" className="bg-white dark:bg-gray-900">Payer Name</option>
                                <option value="total_amount" className="bg-white dark:bg-gray-900">Amount</option>
                                <option value="due_date" className="bg-white dark:bg-gray-900">Due Date</option>
                                <option value="status" className="bg-white dark:bg-gray-900">Status</option>
                            </select>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc')}
                                disabled={isLoading}
                            >
                                {filtersState.sort_order === 'asc' ? '↑' : '↓'}
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <span className="self-center text-sm text-gray-500 dark:text-gray-400">to</span>
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Amount Range - Fixed field names */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Min amount"
                                            type="number"
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            value={filtersState.amount_min || ''}
                                            onChange={(e) => updateFilter('amount_min', e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <span className="self-center text-sm text-gray-500 dark:text-gray-400">to</span>
                                        <Input
                                            placeholder="Max amount"
                                            type="number"
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            value={filtersState.amount_max || ''}
                                            onChange={(e) => updateFilter('amount_max', e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                filtersState.status === 'overdue' 
                                                ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => updateFilter('status', 'overdue')}
                                            disabled={isLoading}
                                        >
                                            Overdue Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${
                                                filtersState.status === 'pending' 
                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => updateFilter('status', 'pending')}
                                            disabled={isLoading}
                                        >
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                updateFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                const thirtyDaysAgo = new Date(today);
                                                thirtyDaysAgo.setDate(today.getDate() - 30);
                                                updateFilter('from_date', thirtyDaysAgo.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
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
            </CardContent>
        </Card>
    );
}