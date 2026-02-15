// components/admin/roles/RolesFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, Download, X, Shield, Edit } from 'lucide-react';
import { FilterState } from '@/admin-utils/rolesUtils';

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
    searchInputRef: React.RefObject<HTMLInputElement>;
    handleExport: () => void;
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
    handleExport
}: RolesFiltersProps) {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const clearSearch = () => {
        setSearch('');
    };

    const quickFilterActions = [
        {
            label: 'System Roles',
            icon: <Shield className="h-4 w-4" />,
            action: () => updateFilter('type', 'system'),
            active: filtersState.type === 'system',
            color: 'text-purple-700 bg-purple-50 border-purple-200'
        },
        {
            label: 'Custom Roles',
            icon: <Edit className="h-4 w-4" />,
            action: () => updateFilter('type', 'custom'),
            active: filtersState.type === 'custom',
            color: 'text-green-700 bg-green-50 border-green-200'
        },
        {
            label: 'All Roles',
            icon: <Shield className="h-4 w-4" />,
            action: () => updateFilter('type', 'all'),
            active: filtersState.type === 'all',
            color: 'text-blue-700 bg-blue-50 border-blue-200'
        },
    ];

    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search roles by name or description... (Ctrl+F)"
                                className="pl-10"
                                value={search}
                                onChange={handleSearchChange}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        // Search is debounced, so no action needed here
                                    }
                                }}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={clearSearch}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Role Type</Label>
                                    <select
                                        className="w-full border rounded px-2 py-2 text-sm"
                                        value={filtersState.type}
                                        onChange={(e) => updateFilter('type', e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="custom">Custom Roles</option>
                                        <option value="system">System Roles</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {quickFilterActions.map((filter, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={filter.action}
                                className={`h-7 text-xs ${filter.active ? filter.color : ''}`}
                            >
                                {filter.icon}
                                <span className="ml-1">{filter.label}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Active filters indicator and clear button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {startIndex} to {endIndex} of {totalItems} roles
                            {search && ` matching "${search}"`}
                            {filtersState.type !== 'all' && ` (${filtersState.type} roles)`}
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