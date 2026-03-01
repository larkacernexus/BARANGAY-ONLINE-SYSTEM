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
    Rows,
    Hash
} from 'lucide-react';
import { PurokFilters } from '@/types/purok';

interface PuroksFiltersProps {
    stats: Array<{label: string, value: number | string}>;
    search: string;
    setSearch: (value: string) => void;
    filtersState: PurokFilters;
    updateFilter: (key: keyof PurokFilters, value: string) => void;
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

export default function PuroksFilters({
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
}: PuroksFiltersProps) {
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const selectionRef = useRef<HTMLDivElement>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
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
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className="pb-2 px-6 pt-6">
                            <div className="text-sm font-medium text-gray-500">
                                {stat.label}
                            </div>
                        </div>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
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
                                    placeholder="Search puroks by name, leader, or description... (Ctrl+F)"
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
                                <select 
                                    className="border rounded px-3 py-2 text-sm w-28"
                                    value={filtersState.status}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                
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
                                    onClick={() => {
                                        const exportUrl = new URL('/admin/puroks/export', window.location.origin);
                                        if (search) exportUrl.searchParams.append('search', search);
                                        if (filtersState.status !== 'all') exportUrl.searchParams.append('status', filtersState.status);
                                        window.open(exportUrl.toString(), '_blank');
                                    }}
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
                                                className={`h-8 ${filtersState.sort_by === 'total_households' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                onClick={() => handleSort('total_households')}
                                            >
                                                Households
                                                {getSortIcon('total_households')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-8 ${filtersState.sort_by === 'total_residents' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                onClick={() => handleSort('total_residents')}
                                            >
                                                Residents
                                                {getSortIcon('total_residents')}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Size Filters */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Size Filters</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                onClick={() => {
                                                    updateFilter('sort_by', 'total_households');
                                                    updateFilter('sort_order', 'desc');
                                                }}
                                            >
                                                Largest Households
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                onClick={() => {
                                                    updateFilter('sort_by', 'total_residents');
                                                    updateFilter('sort_order', 'desc');
                                                }}
                                            >
                                                Most Residents
                                            </Button>
                                        </div>
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
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} puroks
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