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
import { Download, Filter, X, Layers } from 'lucide-react';
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
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
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
    onSelectAll,
    searchInputRef,
    isLoading = false
}: ClearancesFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search by reference, name, clearance number... (Ctrl+F)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const exportUrl = new URL('/admin/clearances/export', window.location.origin);
                            if (search) exportUrl.searchParams.append('search', search);
                            if (filtersState.status && filtersState.status !== 'all') exportUrl.searchParams.append('status', filtersState.status);
                            if (filtersState.type && filtersState.type !== 'all') exportUrl.searchParams.append('type', filtersState.type);
                            if (filtersState.urgency && filtersState.urgency !== 'all') exportUrl.searchParams.append('urgency', filtersState.urgency);
                            window.open(exportUrl.toString(), '_blank');
                        }}
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-gray-200 dark:border-gray-700 h-9"
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
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            {/* FIX: Use a unique value for "All" option */}
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Status</SelectItem>
                            {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.type || ''}
                        onValueChange={(value) => updateFilter('type', value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            {/* FIX: Use a unique value for "All" option */}
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Types</SelectItem>
                            {clearanceTypes
                                .filter(type => type.is_active)
                                .map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                        {type.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.urgency || ''}
                        onValueChange={(value) => updateFilter('urgency', value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Urgency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            {/* FIX: Use a unique value for "All" option */}
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Urgency</SelectItem>
                            <SelectItem value="express" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Express</SelectItem>
                            <SelectItem value="rush" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Rush</SelectItem>
                            <SelectItem value="normal" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Normal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isBulkMode && selectedCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">
                            <span className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                {selectedCount} selected ({selectionMode})
                            </span>
                        </div>
                        {onClearSelection && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearSelection}
                                disabled={isLoading}
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {endIndex} of {totalItems} requests
                </div>
                {isBulkMode && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Select:</span>
                        <div className="flex gap-1">
                            {onSelectAllPage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSelectAllPage}
                                    disabled={isLoading}
                                    className={`h-7 text-xs ${
                                        selectionMode === 'page' 
                                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900'
                                    }`}
                                >
                                    Page ({endIndex - startIndex})
                                </Button>
                            )}
                            {onSelectAllFiltered && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSelectAllFiltered}
                                    disabled={isLoading}
                                    className={`h-7 text-xs ${
                                        selectionMode === 'filtered' 
                                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900'
                                    }`}
                                >
                                    Filtered ({totalItems})
                                </Button>
                            )}
                            {onSelectAll && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSelectAll}
                                    disabled={isLoading}
                                    className={`h-7 text-xs ${
                                        selectionMode === 'all' 
                                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900'
                                    }`}
                                >
                                    All
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}