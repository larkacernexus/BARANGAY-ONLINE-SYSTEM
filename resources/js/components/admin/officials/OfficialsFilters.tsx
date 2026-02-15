// components/admin/officials/OfficialsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, ChevronUp, ChevronDown } from 'lucide-react';
import { FilterState } from '@/admin-utils/officialsUtils';

interface OfficialsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
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
    searchInputRef: React.RefObject<HTMLInputElement>;
    handleSort: (column: string) => void;
    exportData: () => void;
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
    exportData
}: OfficialsFiltersProps) {
    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search officials by name, position, committee... (Ctrl+F)"
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.status}
                                        onChange={(e) => updateFilter('status', e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Position Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Position</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.position}
                                        onChange={(e) => updateFilter('position', e.target.value)}
                                    >
                                        <option value="all">All Positions</option>
                                        {Object.entries(positions).map(([key, position]) => (
                                            <option key={key} value={key}>
                                                {position.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Committee Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Committee</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.committee}
                                        onChange={(e) => updateFilter('committee', e.target.value)}
                                    >
                                        <option value="all">All Committees</option>
                                        {Object.entries(committees).map(([key, name]) => (
                                            <option key={key} value={key}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Type</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.type}
                                        onChange={(e) => updateFilter('type', e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        {typeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                                <div className="flex flex-wrap gap-2">
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
                                        className={`h-8 ${filtersState.sort_by === 'name' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                        onClick={() => handleSort('name')}
                                    >
                                        Name
                                        {getSortIcon('name')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${filtersState.sort_by === 'position' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                        onClick={() => handleSort('position')}
                                    >
                                        Position
                                        {getSortIcon('position')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${filtersState.sort_by === 'committee' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                        onClick={() => handleSort('committee')}
                                    >
                                        Committee
                                        {getSortIcon('committee')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active filters indicator and clear button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} officials
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
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}