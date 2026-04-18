// components/admin/role-permissions/RolePermissionsFilters.tsx

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
import { Search, Filter, Download, X, FilterX, Calendar, Users, Layers, UserCheck, Shield, TrendingUp, Clock } from 'lucide-react';
import { FilterState } from '@/types/admin/rolepermissions/rolePermissions.types';
import { RefObject } from 'react';

interface RolePermissionsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    roles: Array<{ id: number; name: string }>;
    modules: Array<string>;
    granters: Array<{ id: number; name: string }>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: RefObject<HTMLInputElement | null>;
    handleExport: () => void;
    isLoading?: boolean;
    // New filters
    dateRangePreset?: string;
    setDateRangePreset?: (value: string) => void;
    rolesCountRange?: string;
    setRolesCountRange?: (value: string) => void;
}

export default function RolePermissionsFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    roles,
    modules,
    granters,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    handleExport,
    isLoading = false,
    dateRangePreset = '',
    setDateRangePreset,
    rolesCountRange = '',
    setRolesCountRange
}: RolePermissionsFiltersProps) {
    
    // Date range presets
    const dateRangePresets = [
        { value: '', label: 'All Time', color: 'gray' },
        { value: 'today', label: 'Today', color: 'blue' },
        { value: 'yesterday', label: 'Yesterday', color: 'blue' },
        { value: 'this_week', label: 'This Week', color: 'emerald' },
        { value: 'last_week', label: 'Last Week', color: 'emerald' },
        { value: 'this_month', label: 'This Month', color: 'purple' },
        { value: 'last_month', label: 'Last Month', color: 'purple' },
        { value: 'this_quarter', label: 'This Quarter', color: 'amber' },
        { value: 'this_year', label: 'This Year', color: 'orange' }
    ];

    // Roles count range options
    const rolesCountRanges = [
        { value: '', label: 'All Permissions', color: 'gray' },
        { value: '0', label: 'No Role Assigned (0)', color: 'red' },
        { value: '1', label: 'Single Role (1)', color: 'blue' },
        { value: '2-5', label: 'Few Roles (2-5)', color: 'emerald' },
        { value: '6-10', label: 'Many Roles (6-10)', color: 'amber' },
        { value: '10+', label: 'Widely Used (10+)', color: 'purple' }
    ];

    // Handle date range preset change
    const handleDateRangePresetChange = (preset: string) => {
        setDateRangePreset?.(preset);
        updateFilter('date_range', preset);
    };

    // Handle roles count range change
    const handleRolesCountRangeChange = (range: string) => {
        setRolesCountRange?.(range);
        updateFilter('roles_count_range', range);
    };

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.role && filtersState.role !== 'all') count++;
        if (filtersState.module && filtersState.module !== 'all') count++;
        if (filtersState.granter && filtersState.granter !== 'all') count++;
        if (dateRangePreset && dateRangePreset !== '') count++;
        if (rolesCountRange && rolesCountRange !== '') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get role label
    const getRoleLabel = (value: string) => {
        const role = roles.find(r => r.id.toString() === value);
        return role?.name || value;
    };

    // Get granter label
    const getGranterLabel = (value: string) => {
        const granter = granters.find(g => g.id.toString() === value);
        return granter?.name || value;
    };

    // Get date range label
    const getDateRangeLabel = (value: string) => {
        const preset = dateRangePresets.find(p => p.value === value);
        return preset?.label || value;
    };

    // Get date range color
    const getDateRangeColor = (value: string) => {
        const preset = dateRangePresets.find(p => p.value === value);
        return preset?.color || 'gray';
    };

    // Get roles count label
    const getRolesCountLabel = (value: string) => {
        const range = rolesCountRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get roles count color
    const getRolesCountColor = (value: string) => {
        const range = rolesCountRanges.find(r => r.value === value);
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
                                placeholder="Search permissions by name, role, module, or description..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
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
                            <span className="ml-1">permission assignments</span>
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
                                    {filtersState.role && filtersState.role !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Shield className="h-3 w-3 mr-1 inline" />
                                            Role: {getRoleLabel(filtersState.role)}
                                        </Badge>
                                    )}
                                    {filtersState.module && filtersState.module !== 'all' && (
                                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Layers className="h-3 w-3 mr-1 inline" />
                                            Module: {filtersState.module}
                                        </Badge>
                                    )}
                                    {filtersState.granter && filtersState.granter !== 'all' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <UserCheck className="h-3 w-3 mr-1 inline" />
                                            Granted by: {getGranterLabel(filtersState.granter)}
                                        </Badge>
                                    )}
                                    {dateRangePreset && dateRangePreset !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getDateRangeColor(dateRangePreset) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getDateRangeColor(dateRangePreset) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getDateRangeColor(dateRangePreset) === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                            getDateRangeColor(dateRangePreset) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {getDateRangeLabel(dateRangePreset)}
                                        </Badge>
                                    )}
                                    {rolesCountRange && rolesCountRange !== '' && (
                                        <Badge variant="secondary" className={`${
                                            getRolesCountColor(rolesCountRange) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            getRolesCountColor(rolesCountRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            getRolesCountColor(rolesCountRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getRolesCountColor(rolesCountRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            {getRolesCountLabel(rolesCountRange)}
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
                        {/* Role Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Role
                            </Label>
                            <Select
                                value={filtersState.role || 'all'}
                                onValueChange={(value) => updateFilter('role', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Module Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                Module
                            </Label>
                            <Select
                                value={filtersState.module || 'all'}
                                onValueChange={(value) => updateFilter('module', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    {modules.map((module) => (
                                        <SelectItem key={module} value={module}>
                                            {module}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Granted By Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Granted By
                            </Label>
                            <Select
                                value={filtersState.granter || 'all'}
                                onValueChange={(value) => updateFilter('granter', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Granters" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Granters</SelectItem>
                                    {granters.map((granter) => (
                                        <SelectItem key={granter.id} value={granter.id.toString()}>
                                            {granter.name}
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
                                {/* Date Range with Presets */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Granted Date
                                    </Label>
                                    <Select
                                        value={dateRangePreset}
                                        onValueChange={handleDateRangePresetChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dateRangePresets.map(preset => (
                                                <SelectItem key={preset.value} value={preset.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            preset.color === 'blue' ? 'bg-blue-500' :
                                                            preset.color === 'emerald' ? 'bg-emerald-500' :
                                                            preset.color === 'purple' ? 'bg-purple-500' :
                                                            preset.color === 'amber' ? 'bg-amber-500' :
                                                            preset.color === 'orange' ? 'bg-orange-500' :
                                                            'bg-gray-400'
                                                        }`} />
                                                        {preset.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {dateRangePreset && dateRangePreset !== '' && (
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                            Filtering by granted date range
                                        </p>
                                    )}
                                </div>

                                {/* Roles Count Range */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        Usage (Roles Count)
                                    </Label>
                                    <Select
                                        value={rolesCountRange}
                                        onValueChange={handleRolesCountRangeChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Permissions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rolesCountRanges.map(range => (
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
                                    {rolesCountRange && rolesCountRange !== '' && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                            Filtering by role usage count
                                        </p>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                updateFilter('role', 'all');
                                                updateFilter('module', 'all');
                                                updateFilter('granter', 'all');
                                                setRolesCountRange?.('');
                                                setDateRangePreset?.('');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <FilterX className="h-3 w-3 mr-1" />
                                            Reset All Filters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setDateRangePreset?.('this_month');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Calendar className="h-3 w-3 mr-1" />
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setRolesCountRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Users className="h-3 w-3 mr-1" />
                                            Unused Permissions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setRolesCountRange?.('10+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Widely Used
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    Permission Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Granted Date</span> - When the permission was assigned</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Usage</span> - Number of roles using this permission</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Role</span> - Filter by specific role assignments</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Module</span> - Group permissions by module/category</p>
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