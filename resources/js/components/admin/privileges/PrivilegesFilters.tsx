// resources/js/components/admin/privileges/PrivilegesFilters.tsx

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
    AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiscountType, PrivilegeFilters } from '@/types/admin/privileges/privilege.types';

interface PrivilegesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
    filtersState: PrivilegeFilters;
    updateFilter: (key: keyof PrivilegeFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean; // Already boolean
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: React.RefObject<HTMLInputElement | null>; // ← FIX: Allow null
    isLoading?: boolean;
    discountTypes: DiscountType[];
}

export default function PrivilegesFilters({
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
    isLoading = false,
    discountTypes
}: PrivilegesFiltersProps) {
    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handleDiscountTypeFilter = (value: string) => {
        updateFilter('discount_type', value);
    };

    const handleRequiresVerificationFilter = (value: string) => {
        updateFilter('requires_verification', value);
    };

    const handleRequiresIdNumberFilter = (value: string) => {
        updateFilter('requires_id_number', value);
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
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
    };

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status && filtersState.status !== 'all') queryParams.append('status', filtersState.status);
        if (filtersState.discount_type && filtersState.discount_type !== 'all') queryParams.append('discount_type', filtersState.discount_type);
        if (filtersState.requires_verification && filtersState.requires_verification !== 'all') queryParams.append('requires_verification', filtersState.requires_verification);
        if (filtersState.requires_id_number && filtersState.requires_id_number !== 'all') queryParams.append('requires_id_number', filtersState.requires_id_number);
        if (filtersState.sort_by) queryParams.append('sort_by', filtersState.sort_by);
        if (filtersState.sort_order) queryParams.append('sort_order', filtersState.sort_order);
        window.location.href = `/admin/privileges/export?${queryParams.toString()}`;
    };

    // Safe access to filter values with fallbacks
    const currentStatus = filtersState.status ?? 'all';
    const currentDiscountType = filtersState.discount_type ?? 'all';
    const currentRequiresVerification = filtersState.requires_verification ?? 'all';
    const currentRequiresIdNumber = filtersState.requires_id_number ?? 'all';
    const currentSortBy = filtersState.sort_by ?? 'name';
    const currentSortOrder = filtersState.sort_order ?? 'asc';

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
                                    placeholder="Search privileges by name, code, or description... (Ctrl+F)"
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
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Status</SelectItem>
                                        <SelectItem value="active" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Active</SelectItem>
                                        <SelectItem value="inactive" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Inactive</SelectItem>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Discount Type Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</Label>
                                        <Select
                                            value={currentDiscountType}
                                            onValueChange={handleDiscountTypeFilter}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Types</SelectItem>
                                                {discountTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Requires Verification Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires Verification</Label>
                                        <Select
                                            value={currentRequiresVerification}
                                            onValueChange={handleRequiresVerificationFilter}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All</SelectItem>
                                                <SelectItem value="yes" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Yes</SelectItem>
                                                <SelectItem value="no" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Requires ID Number Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires ID Number</Label>
                                        <Select
                                            value={currentRequiresIdNumber}
                                            onValueChange={handleRequiresIdNumberFilter}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All</SelectItem>
                                                <SelectItem value="yes" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Yes</SelectItem>
                                                <SelectItem value="no" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sort Options */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentSortBy === 'name' 
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
                                                    currentSortBy === 'discount_percentage' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('discount_percentage')}
                                                disabled={isLoading}
                                            >
                                                Discount
                                                {getSortIcon('discount_percentage')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentSortBy === 'residents_count' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('residents_count')}
                                                disabled={isLoading}
                                            >
                                                Assignments
                                                {getSortIcon('residents_count')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentRequiresVerification === 'yes' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleRequiresVerificationFilter(
                                                    currentRequiresVerification === 'yes' ? 'all' : 'yes'
                                                )}
                                                disabled={isLoading}
                                            >
                                                Needs Verification
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentRequiresIdNumber === 'yes' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleRequiresIdNumberFilter(
                                                    currentRequiresIdNumber === 'yes' ? 'all' : 'yes'
                                                )}
                                                disabled={isLoading}
                                            >
                                                Requires ID
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    currentSortBy === 'active_residents_count' && currentSortOrder === 'desc'
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => {
                                                    handleSort('active_residents_count');
                                                    updateFilter('sort_order', 'desc');
                                                }}
                                                disabled={isLoading}
                                            >
                                                Most Active
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
                                        {currentDiscountType !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Type: {discountTypes.find(t => t.id.toString() === currentDiscountType)?.name || currentDiscountType}
                                            </span>
                                        )}
                                        {currentRequiresVerification !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Needs Verification: {currentRequiresVerification === 'yes' ? 'Yes' : 'No'}
                                            </span>
                                        )}
                                        {currentRequiresIdNumber !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Requires ID: {currentRequiresIdNumber === 'yes' ? 'Yes' : 'No'}
                                            </span>
                                        )}
                                        {search && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Search: "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active filters indicator and clear button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} privileges
                                {search && ` matching "${search}"`}
                                {currentStatus !== 'all' && ` • Status: ${currentStatus}`}
                                {currentDiscountType !== 'all' && ` • Type filtered`}
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