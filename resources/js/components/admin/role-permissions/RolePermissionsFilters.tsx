// components/admin/role-permissions/RolePermissionsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, ChevronUp, ChevronDown } from 'lucide-react';
import { FilterState } from '@/admin-utils/rolePermissionsUtils';

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
    searchInputRef: React.RefObject<HTMLInputElement>;
    handleExport: () => void;
    handleSort: (column: string) => void;
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
    handleSort
}: RolePermissionsFiltersProps) {
    
    const getSortIcon = (column: string) => {
        if (filtersState.sort !== column) return null;
        return filtersState.order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by permission name or role..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
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
                                onClick={handleExport}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Role Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Role</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.role}
                                        onChange={(e) => updateFilter('role', e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Module Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Module</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.module}
                                        onChange={(e) => updateFilter('module', e.target.value)}
                                    >
                                        <option value="all">All Modules</option>
                                        {modules.map((module) => (
                                            <option key={module} value={module}>
                                                {module}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Granter Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Granted By</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.granter}
                                        onChange={(e) => updateFilter('granter', e.target.value)}
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

                            {/* Sort Options */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${filtersState.sort === 'role_id' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                        onClick={() => handleSort('role_id')}
                                    >
                                        Role
                                        {getSortIcon('role_id')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${filtersState.sort === 'permission_id' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                        onClick={() => handleSort('permission_id')}
                                    >
                                        Permission
                                        {getSortIcon('permission_id')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${filtersState.sort === 'granted_at' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                        onClick={() => handleSort('granted_at')}
                                    >
                                        Granted Date
                                        {getSortIcon('granted_at')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active filters indicator and clear button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {startIndex} to {endIndex} of {totalItems} assignments
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
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}