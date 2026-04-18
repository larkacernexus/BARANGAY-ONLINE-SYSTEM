// resources/js/components/admin/positions/PositionsFilters.tsx

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
    BadgeCheck,
    Clock,
    Shield,
    TrendingUp,
    UserPlus
} from 'lucide-react';
import { PositionFilters } from '@/types/admin/positions/position.types';
import { RefObject } from 'react';

interface PositionsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange: (value: string) => void;
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
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
}

export default function PositionsFilters({
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
}: PositionsFiltersProps) {
    
    const handleSearch = (value: string) => {
        setSearch(value);
        onSearchChange(value);
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handleAccountFilter = (value: string) => {
        updateFilter('requires_account', value);
    };

    const handleOfficialsRange = (range: string) => {
        updateFilter('officials_range', range);
    };

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status && filtersState.status !== 'all') {
            queryParams.append('status', filtersState.status);
        }
        if (filtersState.requires_account && filtersState.requires_account !== 'all') {
            queryParams.append('requires_account', filtersState.requires_account);
        }
        if (filtersState.officials_range) {
            queryParams.append('officials_range', filtersState.officials_range);
        }
        window.location.href = `/admin/positions/export?${queryParams.toString()}`;
    };

    // Safe access to filter values with fallbacks
    const currentStatus = filtersState.status ?? 'all';
    const currentRequiresAccount = filtersState.requires_account ?? 'all';
    const currentOfficialsRange = filtersState.officials_range ?? '';

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (currentStatus !== 'all') count++;
        if (currentRequiresAccount !== 'all') count++;
        if (currentOfficialsRange && currentOfficialsRange !== '') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Officials count range options
    const officialsRanges = [
        { value: '', label: 'All Positions', color: 'gray' },
        { value: '0', label: 'Vacant (0 officials)', color: 'red' },
        { value: '1', label: '1 official', color: 'blue' },
        { value: '2-3', label: '2-3 officials', color: 'emerald' },
        { value: '4-5', label: '4-5 officials', color: 'amber' },
        { value: '6+', label: '6+ officials', color: 'purple' }
    ];

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'emerald';
            case 'inactive': return 'gray';
            default: return 'gray';
        }
    };

    // Get account requirement label
    const getAccountRequirementLabel = (value: string) => {
        switch (value) {
            case 'yes': return 'Requires Account';
            case 'no': return 'No Account Needed';
            default: return value;
        }
    };

    // Get officials range label
    const getOfficialsRangeLabel = (value: string) => {
        const range = officialsRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get officials range color
    const getOfficialsRangeColor = (value: string) => {
        const range = officialsRanges.find(r => r.value === value);
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
                                placeholder="Search positions by name, code, committee, or description..."
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
                            <span className="ml-1">positions</span>
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
                                    {currentStatus !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(currentStatus) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Shield className="h-3 w-3 mr-1 inline" />
                                            Status: {currentStatus === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                    {currentRequiresAccount !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            currentRequiresAccount === 'yes' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                            'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <UserPlus className="h-3 w-3 mr-1 inline" />
                                            {getAccountRequirementLabel(currentRequiresAccount)}
                                        </Badge>
                                    )}
                                    {currentOfficialsRange && currentOfficialsRange !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getOfficialsRangeColor(currentOfficialsRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getOfficialsRangeColor(currentOfficialsRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getOfficialsRangeColor(currentOfficialsRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getOfficialsRangeColor(currentOfficialsRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            {getOfficialsRangeLabel(currentOfficialsRange)}
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
                                <BadgeCheck className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={currentStatus}
                                onValueChange={handleStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Account Required Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <UserPlus className="h-3 w-3" />
                                Account Required
                            </Label>
                            <Select
                                value={currentRequiresAccount}
                                onValueChange={handleAccountFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="yes">Requires Account</SelectItem>
                                    <SelectItem value="no">No Account Needed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Officials Count Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Officials Count
                            </Label>
                            <Select
                                value={currentOfficialsRange}
                                onValueChange={handleOfficialsRange}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Positions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {officialsRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    range.color === 'red' ? 'bg-red-500' :
                                                    range.color === 'blue' ? 'bg-blue-500' :
                                                    range.color === 'emerald' ? 'bg-emerald-500' :
                                                    range.color === 'amber' ? 'bg-amber-500' :
                                                    range.color === 'purple' ? 'bg-purple-500' :
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Quick Status Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-emerald-500" />
                                        Quick Status
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
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
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleStatusFilter('inactive');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Inactive Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleStatusFilter('all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset Status
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Account Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <UserPlus className="h-4 w-4 text-purple-500" />
                                        Quick Account Type
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleAccountFilter('yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Requires Account
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleAccountFilter('no');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            No Account Needed
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleAccountFilter('all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset Account Filter
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Officials Count Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Quick Officials Count
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleOfficialsRange('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Vacant Positions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleOfficialsRange('1');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Single Official
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleOfficialsRange('2-3');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Multiple (2-3)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleOfficialsRange('6+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Large Teams (6+)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <BadgeCheck className="h-3 w-3" />
                                    Position Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Vacant positions</span> - No current officials assigned</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Account required</span> - Positions that need system access</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Officials count</span> - Number of people holding this position</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Search</span> - Searches by name, code, committee, or description</p>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                        onClick={() => {
                                            handleOfficialsRange('');
                                            setShowAdvancedFilters(false);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <FilterX className="h-3 w-3 mr-1" />
                                        Clear Count Filter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                        onClick={handleClearFilters}
                                        disabled={isLoading}
                                    >
                                        <FilterX className="h-3 w-3 mr-1" />
                                        Clear All Filters
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