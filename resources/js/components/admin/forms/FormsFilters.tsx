// resources/js/components/admin/forms/FormsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Filter, Download, FilterX, FileText, Calendar, Star, HardDrive } from 'lucide-react';
import { RefObject } from 'react';
import { Filters } from '@/types/admin/forms/forms.types';

interface FormsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filtersState: Filters;
    updateFilter: (key: keyof Filters, value: string) => void;
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
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    handleExport?: () => void;
    // New filters
    featuredFilter?: string;
    setFeaturedFilter?: (value: string) => void;
    fileTypeFilter?: string;
    setFileTypeFilter?: (value: string) => void;
    minSize?: string;
    setMinSize?: (value: string) => void;
    maxSize?: string;
    setMaxSize?: (value: string) => void;
}

export default function FormsFilters({
    search,
    setSearch,
    onSearchChange,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    categories = [],
    agencies = [],
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    isLoading = false,
    handleExport,
    featuredFilter = 'all',
    setFeaturedFilter,
    fileTypeFilter = 'all',
    setFileTypeFilter,
    minSize = '',
    setMinSize,
    maxSize = '',
    setMaxSize
}: FormsFiltersProps) {
    
    // File type options
    const fileTypes = [
        { value: '', label: 'All Files' },
        { value: 'pdf', label: 'PDF Documents' },
        { value: 'doc', label: 'Word Documents' },
        { value: 'docx', label: 'Word Documents' },
        { value: 'xls', label: 'Excel Spreadsheets' },
        { value: 'xlsx', label: 'Excel Spreadsheets' },
        { value: 'jpg', label: 'Images' },
        { value: 'png', label: 'Images' }
    ];

    // Featured options
    const featuredOptions = [
        { value: 'all', label: 'All Forms' },
        { value: 'yes', label: 'Featured Only' },
        { value: 'no', label: 'Not Featured' }
    ];

    // Download count range options
    const downloadRanges = [
        { value: '', label: 'All Downloads' },
        { value: '0', label: 'No Downloads (0)' },
        { value: '1-10', label: 'Low Traffic (1-10)' },
        { value: '11-50', label: 'Moderate Traffic (11-50)' },
        { value: '51-100', label: 'High Traffic (51-100)' },
        { value: '100+', label: 'Very Popular (100+)' }
    ];

    // Handle search change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        onSearchChange(e);
    };

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

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
                                placeholder="Search forms by title, description, category..."
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={handleSearchChange}
                                disabled={isLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setSearch('');
                                        const fakeEvent = {
                                            target: { value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>;
                                        onSearchChange(fakeEvent);
                                    }}
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
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">
                                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                </span>
                                <span className="sm:hidden">
                                    {showAdvancedFilters ? 'Hide' : 'Filters'}
                                </span>
                            </Button>
                            {handleExport && (
                                <Button 
                                    variant="outline"
                                    className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={handleExport}
                                    disabled={isLoading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} forms
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

                    {/* Basic Filters - Category + Agency + Status + Featured */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Category
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.category || 'all'}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Agency</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.agency || 'all'}
                                onChange={(e) => updateFilter('agency', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Agencies</option>
                                {agencies.map((agency) => (
                                    <option key={agency} value={agency}>
                                        {agency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Featured
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={featuredFilter}
                                onChange={(e) => setFeaturedFilter?.(e.target.value)}
                                disabled={isLoading}
                            >
                                {featuredOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* File Type Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        File Type
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={fileTypeFilter}
                                        onChange={(e) => setFileTypeFilter?.(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {fileTypes.map(type => (
                                            <option key={type.value || 'all'} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* File Size Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <HardDrive className="h-3 w-3" />
                                        File Size (MB)
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min MB"
                                            value={minSize}
                                            onChange={(e) => setMinSize?.(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max MB"
                                            value={maxSize}
                                            onChange={(e) => setMaxSize?.(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                setMinSize?.('0');
                                                setMaxSize?.('1');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Small (&lt;1MB)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                setMinSize?.('1');
                                                setMaxSize?.('5');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Medium (1-5MB)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                setMinSize?.('5');
                                                setMaxSize?.('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Large (&gt;5MB)
                                        </Button>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Date Range
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={filtersState.from_date || ''}
                                            onChange={(e) => updateFilter('from_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={filtersState.to_date || ''}
                                            onChange={(e) => updateFilter('to_date', e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                updateFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                const today = new Date();
                                                const thirtyDaysAgo = new Date(today);
                                                thirtyDaysAgo.setDate(today.getDate() - 30);
                                                updateFilter('from_date', thirtyDaysAgo.toISOString().split('T')[0]);
                                                updateFilter('to_date', today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Last 30 Days
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => {
                                                updateFilter('from_date', '');
                                                updateFilter('to_date', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Clear Dates
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`text-xs ${
                                                filtersState.status === 'active' 
                                                ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-800' 
                                                : ''
                                            }`}
                                            onClick={() => updateFilter('status', 'active')}
                                            disabled={isLoading}
                                        >
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setFeaturedFilter?.('yes')}
                                            disabled={isLoading}
                                        >
                                            Featured Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setFileTypeFilter?.('pdf');
                                            }}
                                            disabled={isLoading}
                                        >
                                            PDF Files
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Featured forms</span> - Highlighted on the front page</p>
                                    <p>• <span className="font-medium">File size</span> - Filter by document size for faster downloads</p>
                                    <p>• <span className="font-medium">Date range</span> - Find recently added or updated forms</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}