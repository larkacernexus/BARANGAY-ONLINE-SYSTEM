// components/admin/roles/RolesFilters.tsx

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
import { Search, Filter, Download, X, FilterX, Users, Shield, Lock, Unlock, TrendingUp, Key, Briefcase } from 'lucide-react';
import { FilterState } from '@/types/admin/roles/roles';
import { RefObject } from 'react';

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
    searchInputRef: RefObject<HTMLInputElement | null>;
    handleExport: () => void;
    isLoading?: boolean;
    // New filters
    usersRange?: string;
    setUsersRange?: (value: string) => void;
    permissionsRange?: string;
    setPermissionsRange?: (value: string) => void;
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
    isLoading = false,
    usersRange = '',
    setUsersRange,
    permissionsRange = '',
    setPermissionsRange
}: RolesFiltersProps) {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const clearSearch = () => {
        setSearch('');
    };

    // Users count range options
    const usersRanges = [
        { value: '', label: 'All Roles', color: 'gray' },
        { value: '0', label: 'No Users Assigned (0)', color: 'red' },
        { value: '1-5', label: 'Few Users (1-5)', color: 'blue' },
        { value: '6-10', label: 'Moderate Users (6-10)', color: 'emerald' },
        { value: '11-20', label: 'Many Users (11-20)', color: 'amber' },
        { value: '20+', label: 'Popular Role (20+)', color: 'purple' }
    ];

    // Permissions count range options
    const permissionsRanges = [
        { value: '', label: 'All Roles', color: 'gray' },
        { value: '0', label: 'No Permissions (0)', color: 'red' },
        { value: '1-5', label: 'Limited Access (1-5)', color: 'blue' },
        { value: '6-10', label: 'Standard Access (6-10)', color: 'emerald' },
        { value: '11-20', label: 'Extended Access (11-20)', color: 'amber' },
        { value: '20+', label: 'Full Access (20+)', color: 'purple' }
    ];

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.type && filtersState.type !== 'all') count++;
        if (usersRange && usersRange !== '') count++;
        if (permissionsRange && permissionsRange !== '') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get type label and color
    const getTypeInfo = (value: string) => {
        switch (value) {
            case 'custom': return { label: 'Custom Roles', color: 'blue' };
            case 'system': return { label: 'System Roles', color: 'purple' };
            default: return { label: value, color: 'gray' };
        }
    };

    // Get users range label
    const getUsersRangeLabel = (value: string) => {
        const range = usersRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get users range color
    const getUsersRangeColor = (value: string) => {
        const range = usersRanges.find(r => r.value === value);
        return range?.color || 'gray';
    };

    // Get permissions range label
    const getPermissionsRangeLabel = (value: string) => {
        const range = permissionsRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get permissions range color
    const getPermissionsRangeColor = (value: string) => {
        const range = permissionsRanges.find(r => r.value === value);
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
                                placeholder="Search roles by name or description... (Ctrl+F)"
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={handleSearchChange}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={clearSearch}
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
                                onClick={handleExport}
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
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex}-{endIndex}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">roles</span>
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
                                    {filtersState.type && filtersState.type !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getTypeInfo(filtersState.type).color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Shield className="h-3 w-3 mr-1 inline" />
                                            {getTypeInfo(filtersState.type).label}
                                        </Badge>
                                    )}
                                    {usersRange && usersRange !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getUsersRangeColor(usersRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getUsersRangeColor(usersRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getUsersRangeColor(usersRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getUsersRangeColor(usersRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            {getUsersRangeLabel(usersRange)}
                                        </Badge>
                                    )}
                                    {permissionsRange && permissionsRange !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getPermissionsRangeColor(permissionsRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getPermissionsRangeColor(permissionsRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getPermissionsRangeColor(permissionsRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getPermissionsRangeColor(permissionsRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Lock className="h-3 w-3 mr-1 inline" />
                                            {getPermissionsRangeLabel(permissionsRange)}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        {/* Role Type Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Role Type
                            </Label>
                            <Select
                                value={filtersState.type || 'all'}
                                onValueChange={(value) => updateFilter('type', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="custom">Custom Roles</SelectItem>
                                    <SelectItem value="system">System Roles</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Users Count Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Users Count
                            </Label>
                            <Select
                                value={usersRange}
                                onValueChange={(value) => setUsersRange?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    {usersRanges.map(range => (
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

                        {/* Permissions Count Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Permissions Count
                            </Label>
                            <Select
                                value={permissionsRange}
                                onValueChange={(value) => setPermissionsRange?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    {permissionsRanges.map(range => (
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quick Type Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-indigo-500" />
                                        Quick Type
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('type', 'all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            All Roles
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('type', 'custom');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Custom Roles
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('type', 'system');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            System Roles
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Users Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        Quick Users
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setUsersRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Unassigned Roles
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setUsersRange?.('1-5');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Light Usage
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setUsersRange?.('20+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Popular Roles
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Permissions Filters */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Key className="h-4 w-4 text-purple-500" />
                                        Quick Permissions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setPermissionsRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            No Permissions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setPermissionsRange?.('1-5');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Limited Access
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setPermissionsRange?.('20+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Full Access
                                        </Button>
                                    </div>
                                </div>

                                {/* Reset Options */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FilterX className="h-4 w-4 text-amber-500" />
                                        Reset Options
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setUsersRange?.('');
                                                setPermissionsRange?.('');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Clear Ranges
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleClearFilters();
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    Role Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">System roles</span> - Built-in roles that cannot be deleted</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Custom roles</span> - User-created roles that can be modified</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Users count</span> - Number of users assigned to this role</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Permissions count</span> - Number of permissions this role has</p>
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