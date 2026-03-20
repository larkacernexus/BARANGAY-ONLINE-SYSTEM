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

interface DiscountType {
    id: number;
    name: string;
    code: string;
}

interface PrivilegeFilters {
    status?: string;
    discount_type?: string;
    requires_verification?: string;
    requires_id_number?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface PrivilegesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
    filtersState: PrivilegeFilters;
    updateFilter: (key: keyof PrivilegeFilters, value: string) => void;
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
                                <select 
                                    className="border rounded px-3 py-2 text-sm w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={filtersState.status || 'all'}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all" className="bg-white dark:bg-gray-900">All Status</option>
                                    <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                    <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
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
                                        const exportUrl = new URL('/admin/privileges/export', window.location.origin);
                                        if (search) exportUrl.searchParams.append('search', search);
                                        if (filtersState.status && filtersState.status !== 'all') exportUrl.searchParams.append('status', filtersState.status);
                                        if (filtersState.discount_type && filtersState.discount_type !== 'all') exportUrl.searchParams.append('discount_type', filtersState.discount_type);
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
                                    {/* Discount Type Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</Label>
                                        <select 
                                            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.discount_type || 'all'}
                                            onChange={(e) => updateFilter('discount_type', e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="all">All Types</option>
                                            {discountTypes.map((type) => (
                                                <option key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Requires Verification Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires Verification</Label>
                                        <select 
                                            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.requires_verification || 'all'}
                                            onChange={(e) => updateFilter('requires_verification', e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="all">All</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>

                                    {/* Requires ID Number Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires ID Number</Label>
                                        <select 
                                            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={filtersState.requires_id_number || 'all'}
                                            onChange={(e) => updateFilter('requires_id_number', e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="all">All</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>

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
                                                    filtersState.sort_by === 'discount_percentage' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('discount_percentage')}
                                                disabled={isLoading}
                                            >
                                                Discount
                                                <span className="ml-1">{getSortIcon('discount_percentage')}</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    filtersState.sort_by === 'residents_count' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleSort('residents_count')}
                                                disabled={isLoading}
                                            >
                                                Assignments
                                                <span className="ml-1">{getSortIcon('residents_count')}</span>
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
                                                    filtersState.requires_verification === 'yes' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => updateFilter('requires_verification', 
                                                    filtersState.requires_verification === 'yes' ? 'all' : 'yes'
                                                )}
                                                disabled={isLoading}
                                            >
                                                Needs Verification
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    filtersState.requires_id_number === 'yes' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => updateFilter('requires_id_number', 
                                                    filtersState.requires_id_number === 'yes' ? 'all' : 'yes'
                                                )}
                                                disabled={isLoading}
                                            >
                                                Requires ID
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${
                                                    filtersState.sort_by === 'active_residents_count' && filtersState.sort_order === 'desc'
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => {
                                                    updateFilter('sort_by', 'active_residents_count');
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
                                        {filtersState.status && filtersState.status !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Status: {filtersState.status}
                                            </span>
                                        )}
                                        {filtersState.discount_type && filtersState.discount_type !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Type: {discountTypes.find(t => t.id.toString() === filtersState.discount_type)?.name || filtersState.discount_type}
                                            </span>
                                        )}
                                        {filtersState.requires_verification && filtersState.requires_verification !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Needs Verification: {filtersState.requires_verification}
                                            </span>
                                        )}
                                        {filtersState.requires_id_number && filtersState.requires_id_number !== 'all' && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                                Requires ID: {filtersState.requires_id_number}
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
                                {filtersState.status && filtersState.status !== 'all' && ` • Status: ${filtersState.status}`}
                                {filtersState.discount_type && filtersState.discount_type !== 'all' && ` • Type filtered`}
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