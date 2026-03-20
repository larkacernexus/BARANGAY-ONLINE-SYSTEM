// resources/js/components/admin/forms/FormsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, FilterX, Filter, Download, AlertCircle } from 'lucide-react';
import { FilterBar } from '@/components/adminui/filter-bar';
// Remove StatsCards import

interface FormsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filtersState: any;
    updateFilter: (key: string, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    categories: string[];
    agencies: string[];
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
}

export default function FormsFilters({
    // Remove stats from props
    search,
    setSearch,
    onSearchChange,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    categories = [], // Add default for categories
    agencies = [], // Add default for agencies
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false
}: FormsFiltersProps) {
    
    // Remove the formStats array and StatsCards component
    
    return (
        <>
            {/* Stats have been moved to a separate FormsStats component */}
            
            <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 sm:pt-6">
                    <FilterBar
                        search={search}
                        onSearchChange={onSearchChange || setSearch}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        showAdvancedFilters={showAdvancedFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        searchPlaceholder="Search forms by title, description, category..."
                        resultsText={search ? `Showing results for "${search}"` : undefined}
                        showCount={true}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        isLoading={isLoading}
                        searchInputRef={searchInputRef}
                    >
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Category:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.category || 'all'}
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-900">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category} className="bg-white dark:bg-gray-900">{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Agency:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.agency || 'all'}
                                    onChange={(e) => updateFilter('agency', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-900">All Agencies</option>
                                    {agencies.map((agency) => (
                                        <option key={agency} value={agency} className="bg-white dark:bg-gray-900">{agency}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.status || 'all'}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                    <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                    <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
                                <div className="flex items-center gap-1 w-full">
                                    <select
                                        className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.sort_by || 'created_at'}
                                        onChange={(e) => updateFilter('sort_by', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="created_at" className="bg-white dark:bg-gray-900">Date Created</option>
                                        <option value="title" className="bg-white dark:bg-gray-900">Title</option>
                                        <option value="category" className="bg-white dark:bg-gray-900">Category</option>
                                        <option value="downloads" className="bg-white dark:bg-gray-900">Downloads</option>
                                        <option value="updated_at" className="bg-white dark:bg-gray-900">Last Updated</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc')}
                                        disabled={isLoading}
                                        title={filtersState.sort_order === 'asc' ? 'Ascending' : 'Descending'}
                                    >
                                        {filtersState.sort_order === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <AlertCircle className="h-3 w-3" />
                                <span>Active filters:</span>
                                {filtersState.category && filtersState.category !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Category: {filtersState.category}
                                    </span>
                                )}
                                {filtersState.agency && filtersState.agency !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Agency: {filtersState.agency}
                                    </span>
                                )}
                                {filtersState.status && filtersState.status !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Status: {filtersState.status}
                                    </span>
                                )}
                                {search && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Search: "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
                                    </span>
                                )}
                                {filtersState.from_date && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        From: {filtersState.from_date}
                                    </span>
                                )}
                                {filtersState.to_date && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        To: {filtersState.to_date}
                                    </span>
                                )}
                                {filtersState.sort_by && filtersState.sort_by !== 'created_at' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Sort: {filtersState.sort_by.replace('_', ' ')} ({filtersState.sort_order})
                                    </span>
                                )}
                            </div>
                        )}

                        {showAdvancedFilters && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Date Range */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="From Date"
                                                type="date"
                                                className="w-full text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                                disabled={isLoading}
                                            />
                                            <span className="self-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">to</span>
                                            <Input
                                                placeholder="To Date"
                                                type="date"
                                                className="w-full text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                                className="h-6 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => {
                                                    updateFilter('sort_by', 'downloads');
                                                    updateFilter('sort_order', 'desc');
                                                }}
                                                disabled={isLoading}
                                            >
                                                Most Downloaded
                                            </Button>
                                        </div>
                                    </div>

                                    {/* File Type Filters */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">File Types</label>
                                        <div className="flex flex-wrap gap-1">
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-xs px-2 py-0.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                onClick={() => {
                                                    setSearch('pdf');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                PDF
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-xs px-2 py-0.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                onClick={() => {
                                                    setSearch('doc');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                Word
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-xs px-2 py-0.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                onClick={() => {
                                                    setSearch('excel');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                Excel
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-xs px-2 py-0.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                onClick={() => {
                                                    setSearch('image');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                Images
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-6 text-xs ${
                                                    filtersState.status === 'active' 
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => updateFilter('status', 'active')}
                                                disabled={isLoading}
                                            >
                                                Active Only
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => {
                                                    setShowAdvancedFilters(false);
                                                    // Handle export
                                                }}
                                                disabled={isLoading}
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FilterBar>
                </CardContent>
            </Card>
        </>
    );
}