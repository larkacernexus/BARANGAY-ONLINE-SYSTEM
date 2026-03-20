// components/admin/clearance-types/ClearanceTypesFilters.tsx
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, FilterX, Layers, Search, X, AlertCircle } from 'lucide-react';
import { route } from 'ziggy-js';

interface FilterState {
    search: string;
    status: string;
    requires_payment: string;
    sort: string;
    direction: string;
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
    searchInputRef: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
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
    isLoading = false
}: ClearanceTypesFiltersProps) {
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const selectionRef = useRef<HTMLDivElement>(null);

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by name, code, or description... (Ctrl+F)"
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
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="border rounded px-3 py-2 text-sm w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
                            </select>
                            
                            <select
                                className="border rounded px-3 py-2 text-sm w-32 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.requires_payment}
                                onChange={(e) => updateFilter('requires_payment', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all" className="bg-white dark:bg-gray-900">All Payment</option>
                                <option value="yes" className="bg-white dark:bg-gray-900">Paid</option>
                                <option value="no" className="bg-white dark:bg-gray-900">Free</option>
                            </select>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline"
                                        className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            const exportUrl = route('clearance-types.export', {
                                                search: search || undefined,
                                                status: filtersState.status !== 'all' ? filtersState.status : undefined,
                                                requires_payment: filtersState.requires_payment !== 'all' ? filtersState.requires_payment : undefined,
                                            });
                                            window.open(exportUrl, '_blank');
                                        }}
                                        disabled={isLoading}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                    <p>Export filtered results</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">
                                Active filters applied.
                                {search && ` Search: "${search}"`}
                                {filtersState.status !== 'all' && ` Status: ${filtersState.status}`}
                                {filtersState.requires_payment !== 'all' && ` Payment: ${filtersState.requires_payment === 'yes' ? 'Paid' : 'Free'}`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                disabled={isLoading}
                                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-7 px-2"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}

                    {/* Results and Clear Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex} to {endIndex} of {totalItems} types
                            {search && ` matching "${search}"`}
                            {filtersState.status !== 'all' && ` • Status: ${filtersState.status}`}
                            {filtersState.requires_payment !== 'all' && ` • Payment: ${filtersState.requires_payment === 'yes' ? 'Paid' : 'Free'}`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && !showSelectionOptions && (
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
    );
}