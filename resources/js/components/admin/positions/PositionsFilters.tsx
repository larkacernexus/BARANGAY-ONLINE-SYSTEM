// resources/js/components/admin/positions/PositionsFilters.tsx

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
    Users,
    BadgeCheck,
    Clock
} from 'lucide-react';
import { PositionFilters } from '@/types/admin/positions/position.types';
import { RefObject } from 'react';

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
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
}

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

    const handleOfficialsRange = (range: string) => {
        updateFilter('officials_range', range);
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
        if (filtersState.officials_range) {
            queryParams.append('officials_range', filtersState.officials_range);
        }
        window.location.href = `/admin/positions/export?${queryParams.toString()}`;
    };

    // Safe access to filter values with fallbacks
    const currentStatus = filtersState.status ?? 'all';
    const currentRequiresAccount = filtersState.requires_account ?? 'all';
    const currentOfficialsRange = filtersState.officials_range ?? '';

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Officials count range options
    const officialsRanges = [
        { value: '', label: 'All Positions' },
        { value: '0', label: 'Vacant (0 officials)' },
        { value: '1', label: '1 official' },
        { value: '2-3', label: '2-3 officials' },
        { value: '4-5', label: '4-5 officials' },
        { value: '6+', label: '6+ officials' }
    ];

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
                                placeholder="Search positions by name, code, or committee..."
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
                                onClick={exportData}
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
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} positions
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Status + Account Required + Officials Count */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <BadgeCheck className="h-3 w-3" />
                                Status
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentStatus}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Account Required
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentRequiresAccount}
                                onChange={(e) => handleAccountFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Types</option>
                                <option value="yes">Requires Account</option>
                                <option value="no">No Account Needed</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Officials Count
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentOfficialsRange}
                                onChange={(e) => handleOfficialsRange(e.target.value)}
                                disabled={isLoading}
                            >
                                {officialsRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Quick Status Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Status</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleStatusFilter('active');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleStatusFilter('inactive');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Inactive Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleStatusFilter('all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset Status
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Account Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Account Type</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleAccountFilter('yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Requires Account
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleAccountFilter('no');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            No Account Needed
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleAccountFilter('all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset Account Filter
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Officials Count Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Officials Count</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleOfficialsRange('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Vacant Positions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleOfficialsRange('1');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Single Official
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleOfficialsRange('2-3');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Multiple (2-3)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleOfficialsRange('6+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Large Teams (6+)
                                        </Button>
                                    </div>
                                </div>

                                {/* Reset All Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reset Options</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleOfficialsRange('');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Clear Count Filter
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={handleClearFilters}
                                            disabled={isLoading}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Vacant positions</span> - No current officials assigned</p>
                                    <p>• <span className="font-medium">Account required</span> - Positions that need system access</p>
                                    <p>• <span className="font-medium">Officials count</span> - Number of people holding this position</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}