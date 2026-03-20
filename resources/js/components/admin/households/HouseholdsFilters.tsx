// resources/js/components/admin/households/HouseholdsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { truncateText } from '../../../admin-utils/householdUtils';

interface HouseholdsFiltersProps {
    // Remove stats from props since we now have a separate Stats component
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    purokFilter: string;
    setPurokFilter: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    puroks: any[];
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    filteredHouseholds?: any[];
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
}

export default function HouseholdsFilters({
    // Remove stats from destructuring
    search,
    setSearch,
    onSearchChange,
    statusFilter,
    setStatusFilter,
    purokFilter,
    setPurokFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    puroks,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    filteredHouseholds, // Keep this if needed for other logic, but remove the stats calculation
    searchInputRef,
    isLoading = false
}: HouseholdsFiltersProps) {
    
    
    return (
        <>
            {/* Search and Filters - Stats have been moved to HouseholdsStats component */}
            <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 sm:pt-6">
                    <FilterBar
                        search={search}
                        onSearchChange={onSearchChange || setSearch}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        showAdvancedFilters={showAdvancedFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        searchPlaceholder="Search by household number, head of family, or address..."
                        resultsText={search ? `Showing results for "${search}"` : undefined}
                        showCount={true}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        isLoading={isLoading}
                        searchInputRef={searchInputRef}
                        className="bg-white dark:bg-gray-900"
                    >
                        {/* Basic Filters */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Status:</span>
                                <select 
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                    <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                    <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Purok:</span>
                                <select 
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={purokFilter}
                                    onChange={(e) => setPurokFilter(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-900">All Puroks</option>
                                    {puroks.map((purok) => (
                                        <option key={purok.id} value={purok.id} className="bg-white dark:bg-gray-900">
                                            {truncateText(purok.name, isMobile ? 12 : 15)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
                                <div className="flex items-center gap-1 w-full">
                                    <select 
                                        className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="household_number" className="bg-white dark:bg-gray-900">Household No.</option>
                                        <option value="head_of_family" className="bg-white dark:bg-gray-900">Head of Family</option>
                                        <option value="member_count" className="bg-white dark:bg-gray-900">Members</option>
                                        {!isMobile && <option value="purok" className="bg-white dark:bg-gray-900">Purok</option>}
                                        <option value="created_at" className="bg-white dark:bg-gray-900">Date Created</option>
                                        <option value="updated_at" className="bg-white dark:bg-gray-900">Last Updated</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        disabled={isLoading}
                                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <AlertCircle className="h-3 w-3" />
                                <span>Active filters:</span>
                                {statusFilter !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Status: {statusFilter}
                                    </span>
                                )}
                                {purokFilter !== 'all' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Purok: {puroks.find(p => p.id === Number(purokFilter))?.name || purokFilter}
                                    </span>
                                )}
                                {search && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Search: "{truncateText(search, 15)}"
                                    </span>
                                )}
                                {sortBy !== 'household_number' && (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                        Sort: {sortBy.replace('_', ' ')} ({sortOrder})
                                    </span>
                                )}
                            </div>
                        )}
                    </FilterBar>
                </CardContent>
            </Card>
        </>
    );
}