// resources/js/components/admin/positions/PositionsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    ChevronUp,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import { PositionFilters } from '@/types/admin/positions/position.types';

interface PositionsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange: (value: string) => void;
    filtersState: PositionFilters;
    updateFilter: (key: keyof PositionFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: React.RefObject<HTMLInputElement | null>; // ← FIX: Allow null
    isLoading?: boolean;
}

// Define the valid sort fields
type SortableField = NonNullable<PositionFilters['sort_by']>;

export default function PositionsFilters({
    search,
    setSearch,
    onSearchChange,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false
}: PositionsFiltersProps) {
    
    const handleSearch = (value: string) => {
        setSearch(value);
        onSearchChange(value);
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handleAccountFilter = (value: string) => {
        updateFilter('requires_account', value);
    };

    const handleSort = (column: SortableField) => {
        if (filtersState.sort_by === column) {
            const newOrder = filtersState.sort_order === 'asc' ? 'desc' : 'asc';
            updateFilter('sort_order', newOrder);
        } else {
            updateFilter('sort_by', column);
            updateFilter('sort_order', 'asc');
        }
    };

    const getSortIcon = (column: SortableField) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? 
            <ChevronUp className="h-4 w-4 ml-1" /> : 
            <ChevronDown className="h-4 w-4 ml-1" />;
    };

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status && filtersState.status !== 'all') {
            queryParams.append('status', filtersState.status);
        }
        if (filtersState.requires_account && filtersState.requires_account !== 'all') {
            queryParams.append('requires_account', filtersState.requires_account);
        }
        if (filtersState.sort_by) queryParams.append('sort_by', filtersState.sort_by);
        if (filtersState.sort_order) queryParams.append('sort_order', filtersState.sort_order);
        window.location.href = `/admin/positions/export?${queryParams.toString()}`;
    };

    // Safe access to filter values with fallbacks
    const currentStatus = filtersState.status ?? 'all';
    const currentRequiresAccount = filtersState.requires_account ?? 'all';
    const currentSortBy = filtersState.sort_by ?? 'order';
    const currentSortOrder = filtersState.sort_order ?? 'asc';

    // Helper to check if a sort field is active
    const isSortActive = (field: SortableField) => currentSortBy === field;

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
                                    placeholder="Search positions by name, code, or committee... (Ctrl+F)"
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
                                <Select
                                    value={currentStatus}
                                    onValueChange={handleStatusFilter}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active Only</SelectItem>
                                        <SelectItem value="inactive">Inactive Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                
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
                                    onClick={exportData}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Sort Options */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    isSortActive('name')
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('name')}
                                                disabled={isLoading}
                                            >
                                                Name
                                                {getSortIcon('name')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    isSortActive('order')
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('order')}
                                                disabled={isLoading}
                                            >
                                                Order
                                                {getSortIcon('order')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    isSortActive('officials_count')
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('officials_count')}
                                                disabled={isLoading}
                                            >
                                                Officials
                                                {getSortIcon('officials_count')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    isSortActive('code')
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('code')}
                                                disabled={isLoading}
                                            >
                                                Code
                                                {getSortIcon('code')}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Account Requirement Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Required</Label>
                                        <Select
                                            value={currentRequiresAccount}
                                            onValueChange={handleAccountFilter}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="yes">Requires Account</SelectItem>
                                                <SelectItem value="no">No Account Needed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Quick Filters */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentStatus === 'active' 
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleStatusFilter('active')}
                                                disabled={isLoading}
                                            >
                                                Active Only
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentStatus === 'inactive' 
                                                    ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleStatusFilter('inactive')}
                                                disabled={isLoading}
                                            >
                                                Inactive Only
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentRequiresAccount === 'yes' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleAccountFilter('yes')}
                                                disabled={isLoading}
                                            >
                                                Requires Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Filters Summary */}
                                {hasActiveFilters && (
                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Active filters:</span>
                                        {currentStatus !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Status: {currentStatus}
                                            </span>
                                        )}
                                        {currentRequiresAccount !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Account: {currentRequiresAccount === 'yes' ? 'Required' : 'Not Required'}
                                            </span>
                                        )}
                                        {search && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Search: "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
                                            </span>
                                        )}
                                        {currentSortBy !== 'order' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Sort: {currentSortBy.replace('_', ' ')} ({currentSortOrder})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Results info and clear filters */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} positions
                                {search && ` matching "${search}"`}
                                {currentStatus !== 'all' && ` • Status: ${currentStatus}`}
                                {currentRequiresAccount !== 'all' && ` • Account: ${currentRequiresAccount === 'yes' ? 'Required' : 'Not Required'}`}
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