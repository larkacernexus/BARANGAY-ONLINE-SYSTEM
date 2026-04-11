// components/admin/role-permissions/RolePermissionsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, FilterX, Calendar, Users, Layers, UserCheck } from 'lucide-react';
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
        { value: '', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'this_year', label: 'This Year' }
    ];

    // Roles count range options
    const rolesCountRanges = [
        { value: '', label: 'All Permissions' },
        { value: '0', label: 'No Role Assigned (0)' },
        { value: '1', label: 'Single Role (1)' },
        { value: '2-5', label: 'Few Roles (2-5)' },
        { value: '6-10', label: 'Many Roles (6-10)' },
        { value: '10+', label: 'Widely Used (10+)' }
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
                                placeholder="Search by permission name or role..."
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
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex} to {endIndex} of {totalItems} assignments
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Role + Module + Granter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Role
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.role || 'all'}
                                onChange={(e) => updateFilter('role', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id.toString()}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                Module
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.module || 'all'}
                                onChange={(e) => updateFilter('module', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Modules</option>
                                {modules.map((module) => (
                                    <option key={module} value={module}>
                                        {module}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Granted By
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.granter || 'all'}
                                onChange={(e) => updateFilter('granter', e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Granters</option>
                                {granters.map((granter) => (
                                    <option key={granter.id} value={granter.id.toString()}>
                                        {granter.name}
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
                                {/* Date Range with Presets */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Granted Date
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={dateRangePreset}
                                        onChange={(e) => handleDateRangePresetChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {dateRangePresets.map(preset => (
                                            <option key={preset.value} value={preset.value}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Roles Count Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Usage (Roles Count)
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={rolesCountRange}
                                        onChange={(e) => handleRolesCountRangeChange(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {rolesCountRanges.map(range => (
                                            <option key={range.value} value={range.value}>
                                                {range.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
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
                                            Reset All Filters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setDateRangePreset?.('this_month');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setRolesCountRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Unused Permissions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setRolesCountRange?.('10+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Widely Used
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Granted Date</span> - When the permission was assigned</p>
                                    <p>• <span className="font-medium">Usage</span> - Number of roles using this permission</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}