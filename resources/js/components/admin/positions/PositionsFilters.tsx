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
    Shield
} from 'lucide-react';
import { PositionFilters, PositionStats } from '@/types/position';

interface PositionsFiltersProps {
    stats: PositionStats;
    search: string;
    setSearch: (value: string) => void;
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
    searchInputRef: React.RefObject<HTMLInputElement>;
}

export default function PositionsFilters({
    stats,
    search,
    setSearch,
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
    searchInputRef
}: PositionsFiltersProps) {
    const handleSearch = (value: string) => {
        setSearch(value);
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
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Positions</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <ChevronUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Require Account</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.requires_account}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <X className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Kagawad Positions</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.kagawad_count}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                <ChevronUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="overflow-hidden">
                <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Search positions by name, code, or committee... (Ctrl+F)"
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {search && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        onClick={() => handleSearch('')}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={filtersState.status}
                                    onValueChange={handleStatusFilter}
                                >
                                    <SelectTrigger className="w-28">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active Only</SelectItem>
                                        <SelectItem value="inactive">Inactive Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <Button 
                                    variant="outline"
                                    className="h-9"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                                    onClick={exportData}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="border-t pt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Sort Options */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${filtersState.sort_by === 'name' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                onClick={() => handleSort('name')}
                                            >
                                                Name
                                                {getSortIcon('name')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${filtersState.sort_by === 'order' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                onClick={() => handleSort('order')}
                                            >
                                                Order
                                                {getSortIcon('order')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${filtersState.sort_by === 'officials_count' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                onClick={() => handleSort('officials_count')}
                                            >
                                                Officials
                                                {getSortIcon('officials_count')}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Account Requirement Filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Account Required</Label>
                                        <Select
                                            value={filtersState.requires_account}
                                            onValueChange={handleAccountFilter}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="yes">Requires Account</SelectItem>
                                                <SelectItem value="no">No Account Needed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Quick Filters */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Quick Filters</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${filtersState.status === 'active' ? 'bg-green-50 text-green-700' : ''}`}
                                                onClick={() => handleStatusFilter('active')}
                                            >
                                                Active
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${filtersState.status === 'inactive' ? 'bg-gray-50 text-gray-700' : ''}`}
                                                onClick={() => handleStatusFilter('inactive')}
                                            >
                                                Inactive
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active filters indicator and clear button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} positions
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
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}