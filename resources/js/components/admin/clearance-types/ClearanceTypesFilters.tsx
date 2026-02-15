// components/admin/clearance-types/ClearanceTypesFilters.tsx
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, FilterX, Layers, Search, X } from 'lucide-react';
import { route } from 'ziggy-js';

interface FilterState {
    search: string;
    status: string;
    requires_payment: string;
    sort: string;
    direction: string;
}

interface ClearanceTypesFiltersProps {
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

export default function ClearanceTypesFilters({
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
}: ClearanceTypesFiltersProps) {
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const selectionRef = useRef<HTMLDivElement>(null);

    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by name, code, or description... (Ctrl+F)"
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
                            <select
                                className="border rounded px-3 py-2 text-sm w-28"
                                value={filtersState.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            
                            <select
                                className="border rounded px-3 py-2 text-sm w-32"
                                value={filtersState.requires_payment}
                                onChange={(e) => updateFilter('requires_payment', e.target.value)}
                            >
                                <option value="all">All Payment</option>
                                <option value="yes">Paid</option>
                                <option value="no">Free</option>
                            </select>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = route('clearance-types.export', {
                                                search: search || undefined,
                                                status: filtersState.status !== 'all' ? filtersState.status : undefined,
                                                requires_payment: filtersState.requires_payment !== 'all' ? filtersState.requires_payment : undefined,
                                            });
                                            window.open(exportUrl, '_blank');
                                        }}
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
                            Showing {startIndex} to {endIndex} of {totalItems} types
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
                </div>
            </CardContent>
        </Card>
    );
}