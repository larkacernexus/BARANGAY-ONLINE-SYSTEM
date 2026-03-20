import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Grid, List, Users } from 'lucide-react';
import { ModernSelect } from '../modern-select';
import { cn } from '@/lib/utils';

interface ModernRecordFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    activeTab: string;
    handleTabChange: (tab: string) => void;
    residentFilter: string;
    handleResidentChange: (resident: string) => void;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    loading: boolean;
    allCategories: any[];
    householdResidents?: any[];
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    getIconComponent: (iconName: string) => any;
}

export const ModernRecordFilters = ({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    activeTab,
    handleTabChange,
    residentFilter,
    handleResidentChange,
    viewMode,
    setViewMode,
    loading,
    allCategories,
    householdResidents,
    hasActiveFilters,
    handleClearFilters,
    getIconComponent,
}: ModernRecordFiltersProps) => {
    const residentOptions = householdResidents?.map(resident => ({
        value: resident.id.toString(),
        label: `${resident.first_name} ${resident.last_name}`
    })) || [];

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search by document name, description, reference..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleSearchClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Category Tabs - Added custom-scrollbar class */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {allCategories.map((category) => {
                            const IconComponent = getIconComponent(category.iconName);
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap",
                                        activeTab === category.id
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                                    )}
                                    onClick={() => handleTabChange(category.id)}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    {category.name}
                                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                        {category.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {householdResidents && householdResidents.length > 1 && (
                            <ModernSelect
                                value={residentFilter}
                                onValueChange={handleResidentChange}
                                placeholder="All residents"
                                options={[{ value: 'all', label: 'All residents' }, ...residentOptions]}
                                disabled={loading}
                                icon={Users}
                            />
                        )}

                        {/* View Toggle */}
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "h-9 flex-1",
                                    viewMode === 'grid' && "bg-white dark:bg-gray-700 shadow-sm"
                                )}
                            >
                                <Grid className="h-4 w-4 mr-2" />
                                Grid
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "h-9 flex-1",
                                    viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm"
                                )}
                            >
                                <List className="h-4 w-4 mr-2" />
                                List
                            </Button>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-9 gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <div className="overflow-hidden">
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Filters are active
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-8 px-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear all
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};