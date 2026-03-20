// resources/js/components/admin/positions/PositionsFilters.tsx
import { useState, useRef } from 'react';
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
import { PositionFilters } from '@/types/position';

interface PositionsFiltersProps {
    // Remove stats from props
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
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
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
}

export default function PositionsFilters({
    // Remove stats from destructuring
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
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handleAccountFilter = (value: string) => {
        updateFilter('requires_account', value);
    };

    const handleSort = (column: string) => {
        if (filtersState.sort_by === column) {
            updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc');
        } else {
            updateFilter('sort_by', column);
            updateFilter('sort_order', 'asc');
        }
    };

    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status !== 'all') queryParams.append('status', filtersState.status);
        if (filtersState.requires_account !== 'all') queryParams.append('requires_account', filtersState.requires_account);
        if (filtersState.sort_by) queryParams.append('sort_by', filtersState.sort_by);
        if (filtersState.sort_order) queryParams.append('sort_order', filtersState.sort_order);
        window.location.href = `/admin/positions/export?${queryParams.toString()}`;
    };

    return (
        <>
            {/* Stats have been moved to PositionsStats component */}
            
            {/* Search and Filters */}
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
                                    value={filtersState.status}
                                    onValueChange={handleStatusFilter}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Statuses</SelectItem>
                                        <SelectItem value="active" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Active Only</SelectItem>
                                        <SelectItem value="inactive" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Inactive Only</SelectItem>
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
                                                    filtersState.sort_by === 'name' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('name')}
                                                disabled={isLoading}
                                            >
                                                Name
                                                <span className="ml-1">{getSortIcon('name')}</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    filtersState.sort_by === 'order' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('order')}
                                                disabled={isLoading}
                                            >
                                                Order
                                                <span className="ml-1">{getSortIcon('order')}</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    filtersState.sort_by === 'officials_count' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('officials_count')}
                                                disabled={isLoading}
                                            >
                                                Officials
                                                <span className="ml-1">{getSortIcon('officials_count')}</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    filtersState.sort_by === 'code' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('code')}
                                                disabled={isLoading}
                                            >
                                                Code
                                                <span className="ml-1">{getSortIcon('code')}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Account Requirement Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Required</Label>
                                        <Select
                                            value={filtersState.requires_account}
                                            onValueChange={handleAccountFilter}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Types</SelectItem>
                                                <SelectItem value="yes" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Requires Account</SelectItem>
                                                <SelectItem value="no" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">No Account Needed</SelectItem>
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
                                                    filtersState.status === 'active' 
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
                                                    filtersState.status === 'inactive' 
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
                                                    filtersState.requires_account === 'yes' 
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

                                {/* Active Filters Summary (inside advanced) */}
                                {hasActiveFilters && (
                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Active filters:</span>
                                        {filtersState.status && filtersState.status !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Status: {filtersState.status}
                                            </span>
                                        )}
                                        {filtersState.requires_account && filtersState.requires_account !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Account: {filtersState.requires_account === 'yes' ? 'Required' : 'Not Required'}
                                            </span>
                                        )}
                                        {search && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Search: "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
                                            </span>
                                        )}
                                        {filtersState.sort_by && filtersState.sort_by !== 'order' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Sort: {filtersState.sort_by.replace('_', ' ')} ({filtersState.sort_order})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active filters indicator and clear button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} positions
                                {search && ` matching "${search}"`}
                                {filtersState.status !== 'all' && ` • Status: ${filtersState.status}`}
                                {filtersState.requires_account !== 'all' && ` • Account: ${filtersState.requires_account === 'yes' ? 'Required' : 'Not Required'}`}
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