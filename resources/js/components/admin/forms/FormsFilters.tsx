import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, FilterX, Filter, Download } from 'lucide-react';
import { FilterBar } from '@/components/adminui/filter-bar';
import { StatsCards } from '@/components/adminui/stats-cards';

interface FormsFiltersProps {
    stats?: any; // Make optional
    search: string;
    setSearch: (value: string) => void;
    filtersState: any;
    updateFilter: (key: string, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    categories: string[];
    agencies: string[];
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
}

// Default stats object
const defaultStats = {
    total: 0,
    active: 0,
    downloads: 0,
    categories_count: 0,
    agencies_count: 0
};

export default function FormsFilters({
    stats = defaultStats, // Provide default value
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    categories = [], // Add default for categories
    agencies = [], // Add default for agencies
    isMobile,
    totalItems,
    startIndex,
    endIndex
}: FormsFiltersProps) {
    const formStats = [
        {
            title: 'Total Forms',
            value: stats.total.toLocaleString(),
            description: `${stats.categories_count} categories`
        },
        {
            title: 'Active Forms',
            value: stats.active.toLocaleString(),
            description: 'Available for download'
        },
        {
            title: 'Downloads',
            value: stats.downloads.toLocaleString(),
            className: 'hidden sm:block',
            description: 'All time downloads'
        },
        {
            title: 'Agencies',
            value: stats.agencies_count.toLocaleString(), // Use toLocaleString here too
            className: 'hidden sm:block',
            description: 'Issuing agencies'
        }
    ];

    return (
        <>
            <StatsCards stats={formStats} columns={4} />
            
            <Card className="overflow-hidden">
                <CardContent className="p-4 sm:pt-6">
                    <FilterBar
                        search={search}
                        onSearchChange={setSearch}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        showAdvancedFilters={showAdvancedFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        searchPlaceholder="Search forms by title, description, category..."
                        resultsText={search ? `Showing results for "${search}"` : undefined}
                        showCount={true}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    >
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Category:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={filtersState.category || 'all'}
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Agency:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={filtersState.agency || 'all'}
                                    onChange={(e) => updateFilter('agency', e.target.value)}
                                >
                                    <option value="all">All Agencies</option>
                                    {agencies.map((agency) => (
                                        <option key={agency} value={agency}>{agency}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Status:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={filtersState.status || 'all'}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                                <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
                                <div className="flex items-center gap-1 w-full">
                                    <select
                                        className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1"
                                        value={filtersState.sort_by || 'created_at'}
                                        onChange={(e) => updateFilter('sort_by', e.target.value)}
                                    >
                                        <option value="created_at">Date Created</option>
                                        <option value="title">Title</option>
                                        <option value="category">Category</option>
                                        <option value="downloads">Downloads</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                        onClick={() => updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {filtersState.sort_order === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showAdvancedFilters && (
                            <div className="border-t pt-3 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Date Range */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Date Range</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="From Date"
                                                type="date"
                                                className="w-full text-sm"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                            />
                                            <span className="self-center text-xs sm:text-sm">to</span>
                                            <Input
                                                placeholder="To Date"
                                                type="date"
                                                className="w-full text-sm"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    const today = new Date();
                                                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                    updateFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                    updateFilter('to_date', today.toISOString().split('T')[0]);
                                                }}
                                            >
                                                This Month
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    updateFilter('sort_by', 'downloads');
                                                    updateFilter('sort_order', 'desc');
                                                }}
                                            >
                                                Most Downloaded
                                            </Button>
                                        </div>
                                    </div>

                                    {/* File Type Filters */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">File Types</label>
                                        <div className="flex flex-wrap gap-1">
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => {
                                                    setSearch('pdf');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                PDF
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => {
                                                    setSearch('doc');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                Word
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => {
                                                    setSearch('excel');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                Excel
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => {
                                                    setSearch('image');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                Images
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Quick Actions</label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-6 text-xs ${filtersState.status === 'active' ? 'bg-green-50 text-green-700' : ''}`}
                                                onClick={() => updateFilter('status', 'active')}
                                            >
                                                Active Only
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    setShowAdvancedFilters(false);
                                                    // Handle export
                                                }}
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FilterBar>
                </CardContent>
            </Card>
        </>
    );
}