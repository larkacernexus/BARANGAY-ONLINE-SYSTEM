// resources/js/components/admin/puroks/PuroksFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    Users,
    Home,
    MapPin,
    TrendingUp,
    Shield
} from 'lucide-react';
import { PurokFilters } from '@/types/admin/puroks/purok';
import { RefObject } from 'react';

interface PuroksFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
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
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
}

export default function PuroksFilters({
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
    isLoading = false
}: PuroksFiltersProps) {
    
    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handlePopulationRange = (range: string) => {
        updateFilter('population_range', range);
    };

    const handleHouseholdRange = (range: string) => {
        updateFilter('household_range', range);
    };

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status && filtersState.status !== 'all') queryParams.append('status', filtersState.status);
        if (filtersState.population_range && filtersState.population_range !== 'all') queryParams.append('population_range', filtersState.population_range);
        if (filtersState.household_range && filtersState.household_range !== 'all') queryParams.append('household_range', filtersState.household_range);
        window.location.href = `/admin/puroks/export?${queryParams.toString()}`;
    };

    // Safe access to filter values with fallbacks
    const currentStatus = filtersState.status ?? 'all';
    const currentPopulationRange = filtersState.population_range ?? 'all';
    const currentHouseholdRange = filtersState.household_range ?? 'all';

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count - FIXED: Check for 'all' instead of empty string
    const getActiveFilterCount = () => {
        let count = 0;
        if (currentStatus !== 'all') count++;
        if (currentPopulationRange && currentPopulationRange !== 'all') count++;
        if (currentHouseholdRange && currentHouseholdRange !== 'all') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Range options - FIXED: Use 'all' instead of empty string for default
    const populationRanges = [
        { value: 'all', label: 'All Populations', color: 'gray' },
        { value: '0-50', label: '0 - 50 residents', color: 'emerald' },
        { value: '51-100', label: '51 - 100 residents', color: 'blue' },
        { value: '101-200', label: '101 - 200 residents', color: 'amber' },
        { value: '201-500', label: '201 - 500 residents', color: 'orange' },
        { value: '500+', label: '500+ residents', color: 'red' }
    ];

    // FIXED: Use 'all' instead of empty string for default
    const householdRanges = [
        { value: 'all', label: 'All Households', color: 'gray' },
        { value: '0-10', label: '0 - 10 households', color: 'emerald' },
        { value: '11-20', label: '11 - 20 households', color: 'blue' },
        { value: '21-50', label: '21 - 50 households', color: 'amber' },
        { value: '51-100', label: '51 - 100 households', color: 'orange' },
        { value: '100+', label: '100+ households', color: 'red' }
    ];

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'emerald';
            case 'inactive': return 'gray';
            default: return 'gray';
        }
    };

    // Get population range label
    const getPopulationRangeLabel = (value: string) => {
        const range = populationRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get population range color
    const getPopulationRangeColor = (value: string) => {
        const range = populationRanges.find(r => r.value === value);
        return range?.color || 'gray';
    };

    // Get household range label
    const getHouseholdRangeLabel = (value: string) => {
        const range = householdRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get household range color
    const getHouseholdRangeColor = (value: string) => {
        const range = householdRanges.find(r => r.value === value);
        return range?.color || 'gray';
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
                                placeholder="Search puroks by name, leader, code, or description... (Ctrl+F)"
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => handleSearch('')}
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
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                onClick={exportData}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">puroks</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">"{search}"</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active filter badges - FIXED: Check for 'all' instead of empty string */}
                            {activeFilters && (
                                <>
                                    {currentStatus !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(currentStatus) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Shield className="h-3 w-3 mr-1 inline" />
                                            Status: {currentStatus === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                    {currentPopulationRange && currentPopulationRange !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getPopulationRangeColor(currentPopulationRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getPopulationRangeColor(currentPopulationRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getPopulationRangeColor(currentPopulationRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            getPopulationRangeColor(currentPopulationRange) === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                            getPopulationRangeColor(currentPopulationRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            {getPopulationRangeLabel(currentPopulationRange)}
                                        </Badge>
                                    )}
                                    {currentHouseholdRange && currentHouseholdRange !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getHouseholdRangeColor(currentHouseholdRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getHouseholdRangeColor(currentHouseholdRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getHouseholdRangeColor(currentHouseholdRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            getHouseholdRangeColor(currentHouseholdRange) === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                            getHouseholdRangeColor(currentHouseholdRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Home className="h-3 w-3 mr-1 inline" />
                                            {getHouseholdRangeLabel(currentHouseholdRange)}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={currentStatus}
                                onValueChange={handleStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Population Range Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Population Range
                            </Label>
                            <Select
                                value={currentPopulationRange}
                                onValueChange={handlePopulationRange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Populations" />
                                </SelectTrigger>
                                <SelectContent>
                                    {populationRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    range.color === 'emerald' ? 'bg-emerald-500' :
                                                    range.color === 'blue' ? 'bg-blue-500' :
                                                    range.color === 'amber' ? 'bg-amber-500' :
                                                    range.color === 'orange' ? 'bg-orange-500' :
                                                    range.color === 'red' ? 'bg-red-500' :
                                                    'bg-gray-400'
                                                }`} />
                                                {range.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Household Range Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                Household Range
                            </Label>
                            <Select
                                value={currentHouseholdRange}
                                onValueChange={handleHouseholdRange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Households" />
                                </SelectTrigger>
                                <SelectContent>
                                    {householdRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    range.color === 'emerald' ? 'bg-emerald-500' :
                                                    range.color === 'blue' ? 'bg-blue-500' :
                                                    range.color === 'amber' ? 'bg-amber-500' :
                                                    range.color === 'orange' ? 'bg-orange-500' :
                                                    range.color === 'red' ? 'bg-red-500' :
                                                    'bg-gray-400'
                                                }`} />
                                                {range.label}
                                            </span>
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
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Quick Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quick Population Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Quick Population
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handlePopulationRange('0-50');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Small (&lt;50)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handlePopulationRange('51-100');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Medium (51-100)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handlePopulationRange('101-200');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Large (101-200)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handlePopulationRange('500+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Very Large (500+)
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Household Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Home className="h-4 w-4 text-purple-500" />
                                        Quick Households
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleHouseholdRange('0-10');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Few (&lt;10)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleHouseholdRange('11-20');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Moderate (11-20)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleHouseholdRange('21-50');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Many (21-50)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleHouseholdRange('100+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Dense (100+)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Actions */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    Purok Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Search</span> - Searches by purok name, leader name, code, or description</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Population Range</span> - Filter puroks by number of residents</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Household Range</span> - Filter puroks by number of households</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Status</span> - Active or inactive puroks</p>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                        onClick={() => {
                                            handlePopulationRange('all');
                                            handleHouseholdRange('all');
                                            setShowAdvancedFilters(false);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <FilterX className="h-3 w-3 mr-1" />
                                        Clear All Range Filters
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                        onClick={() => {
                                            handleStatusFilter('active');
                                            setShowAdvancedFilters(false);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <Shield className="h-3 w-3 mr-1" />
                                        Show Active Only
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator - Modern */}
                {isLoading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}