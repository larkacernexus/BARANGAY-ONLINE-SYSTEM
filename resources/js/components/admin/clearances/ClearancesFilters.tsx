// components/admin/clearances/ClearancesFilters.tsx - Updated Select components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Filter, X } from 'lucide-react';
import { ClearanceType, StatusOption } from '@/types/clearances';

interface ClearancesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    filtersState: any;
    updateFilter: (key: string, value: string) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
    startIndex: number;
    endIndex: number;
    totalItems: number;
    isBulkMode?: boolean;
    selectionMode?: 'page' | 'filtered' | 'all';
    selectedCount?: number;
    onClearSelection?: () => void;
    onSelectAllPage?: () => void;
    onSelectAllFiltered?: () => void;
    onSelectAll?: () => void;
}

export default function ClearancesFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    handleClearFilters,
    hasActiveFilters,
    clearanceTypes,
    statusOptions,
    startIndex,
    endIndex,
    totalItems,
    isBulkMode = false,
    selectionMode = 'page',
    selectedCount = 0,
    onClearSelection,
    onSelectAllPage,
    onSelectAllFiltered,
    onSelectAll
}: ClearancesFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search by reference, name, clearance number... (Ctrl+F)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const exportUrl = new URL('/admin/clearances/export', window.location.origin);
                            if (search) exportUrl.searchParams.append('search', search);
                            if (filtersState.status) exportUrl.searchParams.append('status', filtersState.status);
                            if (filtersState.type) exportUrl.searchParams.append('type', filtersState.type);
                            if (filtersState.urgency) exportUrl.searchParams.append('urgency', filtersState.urgency);
                            window.open(exportUrl.toString(), '_blank');
                        }}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                        value={filtersState.status || ''}
                        onValueChange={(value) => updateFilter('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* FIX: Use a unique value for "All" option */}
                            <SelectItem value="all">All Status</SelectItem>
                            {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.type || ''}
                        onValueChange={(value) => updateFilter('type', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* FIX: Use a unique value for "All" option */}
                            <SelectItem value="all">All Types</SelectItem>
                            {clearanceTypes
                                .filter(type => type.is_active)
                                .map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.urgency || ''}
                        onValueChange={(value) => updateFilter('urgency', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* FIX: Use a unique value for "All" option */}
                            <SelectItem value="all">All Urgency</SelectItem>
                            <SelectItem value="express">Express</SelectItem>
                            <SelectItem value="rush">Rush</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isBulkMode && selectedCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-medium px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md">
                            {selectedCount} selected ({selectionMode})
                        </div>
                        {onClearSelection && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearSelection}
                                className="h-9"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                    Showing {startIndex + 1} to {endIndex} of {totalItems} requests
                </div>
                {isBulkMode && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Select:</span>
                        {onSelectAllPage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSelectAllPage}
                                className="h-7 text-xs"
                            >
                                Page ({endIndex - startIndex})
                            </Button>
                        )}
                        {onSelectAllFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSelectAllFiltered}
                                className="h-7 text-xs"
                            >
                                Filtered ({totalItems})
                            </Button>
                        )}
                        {onSelectAll && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSelectAll}
                                className="h-7 text-xs"
                            >
                                All
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}