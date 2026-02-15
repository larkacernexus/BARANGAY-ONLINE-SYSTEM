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
import { Filters } from '@/types/fees.types';
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
    searchInputRef
}: FeesFiltersProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search fees by code, payer, certificate #... (Ctrl+F)"
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                                onClick={() => {
                                    const exportUrl = new URL('/fees/export', window.location.origin);
                                    if (search) exportUrl.searchParams.append('search', search);
                                    if (filtersState.status !== 'all') exportUrl.searchParams.append('status', filtersState.status);
                                    if (filtersState.category !== 'all') exportUrl.searchParams.append('category', filtersState.category);
                                    window.open(exportUrl.toString(), '_blank');
                                }}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Count and Selection Options */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fees
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
                            {isBulkMode && selectedFees.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onSelectAllOnPage}
                                        className="h-8"
                                    >
                                        <ListIcon className="h-3.5 w-3.5 mr-1" />
                                        {selectedFees.length === totalItems ? 'Deselect Page' : 'Select Page'}
                                    </Button>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (selectedFees.length > 0) {
                                                        // Clear selection
                                                    }
                                                }}
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Clear Selection
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
                            <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                {Object.entries(statuses).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Category:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.category || 'all'}
                                onChange={(e) => updateFilter('category', e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(categories).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Purok Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Purok:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.purok || 'all'}
                                onChange={(e) => updateFilter('purok', e.target.value)}
                            >
                                <option value="all">All Puroks</option>
                                {puroks.map((purok) => (
                                    <option key={purok} value={purok}>
                                        {purok}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.sort_by || 'created_at'}
                                onChange={(e) => updateFilter('sort_by', e.target.value)}
                            >
                                <option value="created_at">Date Added</option>
                                <option value="fee_code">Fee Code</option>
                                <option value="payer_name">Payer Name</option>
                                <option value="total_amount">Amount</option>
                                <option value="due_date">Due Date</option>
                                <option value="status">Status</option>
                            </select>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc')}
                            >
                                {filtersState.sort_order === 'asc' ? '↑' : '↓'}
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            className="w-full"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                        />
                                        <span className="self-center text-sm">to</span>
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            className="w-full"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Amount Range */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Amount Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Min amount"
                                            type="number"
                                            className="w-full"
                                            value={filtersState.min_amount || ''}
                                            onChange={(e) => updateFilter('min_amount', e.target.value)}
                                        />
                                        <span className="self-center text-sm">to</span>
                                        <Input
                                            placeholder="Max amount"
                                            type="number"
                                            className="w-full"
                                            value={filtersState.max_amount || ''}
                                            onChange={(e) => updateFilter('max_amount', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${filtersState.status === 'overdue' ? 'bg-red-50 text-red-700' : ''}`}
                                            onClick={() => updateFilter('status', 'overdue')}
                                        >
                                            Overdue Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${filtersState.status === 'pending' ? 'bg-amber-50 text-amber-700' : ''}`}
                                            onClick={() => updateFilter('status', 'pending')}
                                        >
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                updateFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                        >
                                            This Month
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