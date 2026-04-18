// resources/js/components/admin/forms/FormsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, Download, FilterX, FileText, Calendar, Star, HardDrive, Globe, Clock, TrendingUp } from 'lucide-react';
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

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.category && filtersState.category !== 'all') count++;
        if (filtersState.agency && filtersState.agency !== 'all') count++;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (featuredFilter && featuredFilter !== 'all') count++;
        if (fileTypeFilter && fileTypeFilter !== 'all' && fileTypeFilter !== '') count++;
        if (minSize && minSize !== '') count++;
        if (maxSize && maxSize !== '') count++;
        if (filtersState.from_date) count++;
        if (filtersState.to_date) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
            case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
            default: return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
        }
    };

    // Get file type icon
    const getFileTypeIcon = (type: string) => {
        if (type === 'pdf') return '📄';
        if (type === 'doc' || type === 'docx') return '📝';
        if (type === 'xls' || type === 'xlsx') return '📊';
        if (type === 'jpg' || type === 'png') return '🖼️';
        return '📁';
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    {/* Search Bar - Enhanced */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search forms by title, description, category, or agency..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={handleSearchChange}
                                disabled={isLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setSearch('');
                                        const fakeEvent = {
                                            target: { value: '' }
                                        } as React.ChangeEvent<HTMLInputElement>;
                                        onSearchChange(fakeEvent);
                                    }}
                                    disabled={isLoading}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                disabled={isLoading}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">
                                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                </span>
                                <span className="sm:hidden">
                                    {showAdvancedFilters ? 'Hide' : 'Filters'}
                                </span>
                                {!showAdvancedFilters && activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0 text-xs">
                                        +{activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                            {handleExport && (
                                <Button 
                                    variant="outline"
                                    className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                    onClick={handleExport}
                                    disabled={isLoading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline font-medium">Export</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">forms</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{search}”</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active filter badges */}
                            {activeFilters && (
                                <>
                                    {filtersState.category && filtersState.category !== 'all' && (
                                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <FileText className="h-3 w-3 mr-1 inline" />
                                            {filtersState.category}
                                        </Badge>
                                    )}
                                    {filtersState.agency && filtersState.agency !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Globe className="h-3 w-3 mr-1 inline" />
                                            {filtersState.agency}
                                        </Badge>
                                    )}
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${getStatusColor(filtersState.status)} border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            Status: {filtersState.status}
                                        </Badge>
                                    )}
                                    {featuredFilter && featuredFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Star className="h-3 w-3 mr-1 inline" />
                                            {featuredFilter === 'yes' ? 'Featured' : 'Not Featured'}
                                        </Badge>
                                    )}
                                    {fileTypeFilter && fileTypeFilter !== 'all' && fileTypeFilter !== '' && (
                                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <span className="mr-1">{getFileTypeIcon(fileTypeFilter)}</span>
                                            {fileTypeFilter.toUpperCase()}
                                        </Badge>
                                    )}
                                    {(minSize || maxSize) && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <HardDrive className="h-3 w-3 mr-1 inline" />
                                            Size: {minSize || '0'} - {maxSize || '∞'} MB
                                        </Badge>
                                    )}
                                    {(filtersState.from_date || filtersState.to_date) && (
                                        <Badge variant="secondary" className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {filtersState.from_date && filtersState.to_date 
                                                ? `${filtersState.from_date} → ${filtersState.to_date}`
                                                : filtersState.from_date 
                                                    ? `From ${filtersState.from_date}`
                                                    : `Until ${filtersState.to_date}`}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {/* Category Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Category
                            </Label>
                            <Select
                                value={filtersState.category || 'all'}
                                onValueChange={(value) => updateFilter('category', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Agency Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agency</Label>
                            <Select
                                value={filtersState.agency || 'all'}
                                onValueChange={(value) => updateFilter('agency', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Agencies" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Agencies</SelectItem>
                                    {agencies.map((agency) => (
                                        <SelectItem key={agency} value={agency}>
                                            {agency}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</Label>
                            <Select
                                value={filtersState.status || 'all'}
                                onValueChange={(value) => updateFilter('status', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Featured Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500" />
                                Featured
                            </Label>
                            <Select
                                value={featuredFilter || 'all'}
                                onValueChange={(value) => setFeaturedFilter?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Forms" />
                                </SelectTrigger>
                                <SelectContent>
                                    {featuredOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* File Type Filter */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-indigo-500" />
                                        File Type
                                    </Label>
                                    <Select
                                        value={fileTypeFilter || 'all'}
                                        onValueChange={(value) => setFileTypeFilter?.(value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Files" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fileTypes.map(type => (
                                                <SelectItem key={type.value || 'all'} value={type.value || 'all'}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{getFileTypeIcon(type.value)}</span>
                                                        <span>{type.label}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fileTypeFilter && fileTypeFilter !== 'all' && fileTypeFilter !== '' && (
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                            Filtering by {fileTypeFilter.toUpperCase()} files
                                        </p>
                                    )}
                                </div>

                                {/* File Size Range */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <HardDrive className="h-4 w-4 text-emerald-500" />
                                        File Size (MB)
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">Minimum</Label>
                                            <Input
                                                type="number"
                                                placeholder="Min MB"
                                                value={minSize}
                                                onChange={(e) => setMinSize?.(e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">Maximum</Label>
                                            <Input
                                                type="number"
                                                placeholder="Max MB"
                                                value={maxSize}
                                                onChange={(e) => setMaxSize?.(e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
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
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-purple-500" />
                                        Date Created Range
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input
                                                type="date"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
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
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('from_date', '');
                                                updateFilter('to_date', '');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl lg:col-span-3">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-amber-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`text-xs rounded-lg border-gray-200 dark:border-gray-700 ${
                                                filtersState.status === 'active' 
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
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
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setFeaturedFilter?.('yes')}
                                            disabled={isLoading}
                                        >
                                            <Star className="h-3 w-3 mr-1" />
                                            Featured Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setFileTypeFilter?.('pdf');
                                            }}
                                            disabled={isLoading}
                                        >
                                            📄 PDF Files
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('from_date', '');
                                                updateFilter('to_date', '');
                                                setMinSize?.('');
                                                setMaxSize?.('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            Reset Advanced
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    Filter Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Featured forms</span> - Highlighted on the front page</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">File size</span> - Filter by document size for faster downloads</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Date range</span> - Find recently added or updated forms</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Category/Agency</span> - Narrow down by issuing body</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}