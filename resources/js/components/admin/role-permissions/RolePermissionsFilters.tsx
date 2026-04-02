// components/admin/role-permissions/RolePermissionsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, FilterX, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

import { FilterState } from '@/types/admin/rolepermissions/rolePermissions.types';

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
    searchInputRef: React.RefObject<HTMLInputElement | null>; // Update to accept nullable
    handleExport: () => void;
    handleSort: (column: string) => void;
    isLoading?: boolean;
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
    handleSort,
    isLoading = false
}: RolePermissionsFiltersProps) {
    
    const getSortIcon = (column: string) => {
        if (filtersState.sort !== column) return null;
        return filtersState.order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
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
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Role Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.role}
                                        onChange={(e) => updateFilter('role', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all" className="bg-white dark:bg-gray-900">All Roles</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id.toString()} className="bg-white dark:bg-gray-900">
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Module Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Module</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.module}
                                        onChange={(e) => updateFilter('module', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all" className="bg-white dark:bg-gray-900">All Modules</option>
                                        {modules.map((module) => (
                                            <option key={module} value={module} className="bg-white dark:bg-gray-900">
                                                {module}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Granter Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Granted By</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.granter}
                                        onChange={(e) => updateFilter('granter', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all" className="bg-white dark:bg-gray-900">All Granters</option>
                                        {granters.map((granter) => (
                                            <option key={granter.id} value={granter.id.toString()} className="bg-white dark:bg-gray-900">
                                                {granter.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort === 'role_id' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('role_id')}
                                        disabled={isLoading}
                                    >
                                        Role
                                        <span className="ml-1">{getSortIcon('role_id')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort === 'permission_id' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('permission_id')}
                                        disabled={isLoading}
                                    >
                                        Permission
                                        <span className="ml-1">{getSortIcon('permission_id')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort === 'granted_at' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('granted_at')}
                                        disabled={isLoading}
                                    >
                                        Granted Date
                                        <span className="ml-1">{getSortIcon('granted_at')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">
                                Active filters applied.
                                {search && ` Search: "${search}"`}
                                {filtersState.role !== 'all' && ` Role: ${roles.find(r => r.id.toString() === filtersState.role)?.name}`}
                                {filtersState.module !== 'all' && ` Module: ${filtersState.module}`}
                                {filtersState.granter !== 'all' && ` Granted by: ${granters.find(g => g.id.toString() === filtersState.granter)?.name}`}
                                {filtersState.sort !== 'role_id' && ` Sorted by: ${filtersState.sort} (${filtersState.order})`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                disabled={isLoading}
                                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-7 px-2"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}

                    {/* Active filters indicator and clear button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex} to {endIndex} of {totalItems} assignments
                            {search && ` matching "${search}"`}
                            {filtersState.role !== 'all' && ` • Role: ${roles.find(r => r.id.toString() === filtersState.role)?.name}`}
                            {filtersState.module !== 'all' && ` • Module: ${filtersState.module}`}
                            {filtersState.granter !== 'all' && ` • Granted by: ${granters.find(g => g.id.toString() === filtersState.granter)?.name}`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && !showAdvancedFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                            Updating...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}