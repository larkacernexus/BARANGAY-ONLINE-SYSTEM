// components/admin/report-types/ReportTypesFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, FilterX, Search, X } from 'lucide-react';
import { route } from 'ziggy-js';

interface FilterState {
    search: string;
    status: string;
    priority: string;
    requires_action: string;
}

interface ReportTypesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef: React.RefObject<HTMLInputElement>;
}

export default function ReportTypesFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    handleClearFilters,
    hasActiveFilters,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef
}: ReportTypesFiltersProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search report types by name, code, or description... (Ctrl+F)"
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = route('report-types.export', {
                                                search: search || undefined,
                                                status: filtersState.status !== 'all' ? filtersState.status : undefined,
                                                priority: filtersState.priority !== 'all' ? filtersState.priority : undefined,
                                                requires_action: filtersState.requires_action !== 'all' ? filtersState.requires_action : undefined,
                                            });
                                            window.open(exportUrl, '_blank');
                                        }}
                                        disabled={totalItems === 0}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Export filtered results</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} report types
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
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Priority:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.priority}
                                onChange={(e) => updateFilter('priority', e.target.value)}
                            >
                                <option value="all">All Priority</option>
                                <option value="1">Critical</option>
                                <option value="2">High</option>
                                <option value="3">Medium</option>
                                <option value="4">Low</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Action Required:</span>
                            <select
                                className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                value={filtersState.requires_action}
                                onChange={(e) => updateFilter('requires_action', e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="yes">Urgent Action</option>
                                <option value="no">Non-urgent</option>
                            </select>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}