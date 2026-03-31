// components/admin/officials/OfficialsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, FilterX, ChevronUp, ChevronDown } from 'lucide-react';
import { FilterOptions } from '@/admin-utils/officialsUtils';

interface OfficialsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterOptions;
    updateFilter: (key: keyof FilterOptions, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    statusOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    handleSort: (column: string) => void;
    exportData: () => void;
    isLoading?: boolean;
}

export default function OfficialsFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    positions,
    committees,
    statusOptions,
    typeOptions,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    handleSort,
    exportData,
    isLoading = false
}: OfficialsFiltersProps) {
    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search officials by name, position, committee... (Ctrl+F)"
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

                    {showAdvancedFilters && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.status}
                                        onChange={(e) => updateFilter('status', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value} className="bg-white dark:bg-gray-900">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.position}
                                        onChange={(e) => updateFilter('position', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all" className="bg-white dark:bg-gray-900">All Positions</option>
                                        {Object.entries(positions).map(([key, position]) => (
                                            <option key={key} value={key} className="bg-white dark:bg-gray-900">
                                                {position.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Committee</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.committee}
                                        onChange={(e) => updateFilter('committee', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all" className="bg-white dark:bg-gray-900">All Committees</option>
                                        {Object.entries(committees).map(([key, name]) => (
                                            <option key={key} value={key} className="bg-white dark:bg-gray-900">
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.type}
                                        onChange={(e) => updateFilter('type', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {typeOptions.map(option => (
                                            <option key={option.value} value={option.value} className="bg-white dark:bg-gray-900">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
                                <div className="flex flex-wrap gap-2">
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
                                            filtersState.sort_by === 'position' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('position')}
                                        disabled={isLoading}
                                    >
                                        Position
                                        <span className="ml-1">{getSortIcon('position')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort_by === 'committee' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('committee')}
                                        disabled={isLoading}
                                    >
                                        Committee
                                        <span className="ml-1">{getSortIcon('committee')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} officials
                            {search && ` matching "${search}"`}
                            {filtersState.status !== 'all' && ` • Status: ${statusOptions.find(s => s.value === filtersState.status)?.label || filtersState.status}`}
                            {filtersState.position !== 'all' && ` • Position: ${positions[filtersState.position]?.name || ''}`}
                            {filtersState.committee !== 'all' && ` • Committee: ${committees[filtersState.committee] || ''}`}
                            {filtersState.type !== 'all' && ` • Type: ${typeOptions.find(t => t.value === filtersState.type)?.label || ''}`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
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