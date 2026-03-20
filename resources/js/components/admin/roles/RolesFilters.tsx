// components/admin/roles/RolesFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, FilterX, Shield, Edit, AlertCircle } from 'lucide-react';
import { FilterState } from '@/admin-utils/rolesUtils';

interface RolesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement>;
    handleExport: () => void;
    isLoading?: boolean;
}

export default function RolesFilters({
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
    searchInputRef,
    handleExport,
    isLoading = false
}: RolesFiltersProps) {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const clearSearch = () => {
        setSearch('');
    };

    const quickFilterActions = [
        {
            label: 'System Roles',
            icon: <Shield className="h-4 w-4" />,
            action: () => updateFilter('type', 'system'),
            active: filtersState.type === 'system',
            lightColor: 'text-purple-700 bg-purple-50 border-purple-200',
            darkColor: 'dark:text-purple-400 dark:bg-purple-950/50 dark:border-purple-800'
        },
        {
            label: 'Custom Roles',
            icon: <Edit className="h-4 w-4" />,
            action: () => updateFilter('type', 'custom'),
            active: filtersState.type === 'custom',
            lightColor: 'text-green-700 bg-green-50 border-green-200',
            darkColor: 'dark:text-green-400 dark:bg-green-950/50 dark:border-green-800'
        },
        {
            label: 'All Roles',
            icon: <Shield className="h-4 w-4" />,
            action: () => updateFilter('type', 'all'),
            active: filtersState.type === 'all',
            lightColor: 'text-blue-700 bg-blue-50 border-blue-200',
            darkColor: 'dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800'
        },
    ];

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search roles by name or description... (Ctrl+F)"
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={handleSearchChange}
                                disabled={isLoading}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        // Search is debounced, so no action needed here
                                    }
                                }}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={clearSearch}
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
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
                                onClick={handleExport}
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
                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role Type</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.type}
                                        onChange={(e) => updateFilter('type', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all" className="bg-white dark:bg-gray-900">All Types</option>
                                        <option value="custom" className="bg-white dark:bg-gray-900">Custom Roles</option>
                                        <option value="system" className="bg-white dark:bg-gray-900">System Roles</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {quickFilterActions.map((filter, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={filter.action}
                                disabled={isLoading}
                                className={`
                                    h-7 text-xs
                                    bg-white dark:bg-gray-900
                                    border-gray-200 dark:border-gray-700
                                    text-gray-700 dark:text-gray-300
                                    hover:bg-gray-100 dark:hover:bg-gray-700
                                    ${filter.active ? `${filter.lightColor} ${filter.darkColor}` : ''}
                                `}
                            >
                                {filter.icon}
                                <span className="ml-1">{filter.label}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">
                                Active filters applied.
                                {search && ` Search: "${search}"`}
                                {filtersState.type !== 'all' && ` Type: ${filtersState.type} roles`}
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

                    {/* Active filters indicator and clear button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex} to {endIndex} of {totalItems} roles
                            {search && ` matching "${search}"`}
                            {filtersState.type !== 'all' && ` (${filtersState.type} roles)`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && !showAdvancedFilters && (
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