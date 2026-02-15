// components/admin/committees/CommitteesFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronUp, ChevronDown, Search, Filter, Download, X, FilterX, ArrowUpDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface CommitteesFiltersProps {
    search: string;
    status: string;
    sortBy: string;
    sortOrder: string;
    showAdvancedFilters: boolean;
    isMobile: boolean;
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSortChange: (column: string) => void;
    onExport: () => void;
    onReset: () => void;
    onToggleAdvancedFilters: () => void;
}

export function CommitteesFilters({
    search,
    status,
    sortBy,
    sortOrder,
    showAdvancedFilters,
    isMobile,
    hasActiveFilters,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onExport,
    onReset,
    onToggleAdvancedFilters
}: CommitteesFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [localSearch, setLocalSearch] = useState(search);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== search) {
                onSearchChange(localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, search, onSearchChange]);

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1" />;
        return sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />;
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onSearchChange('');
    };

    // Keyboard shortcut for search focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Card className="overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search committees by name, code, or description... (Ctrl+F)"
                                className="pl-10"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                            {localSearch && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={handleClearSearch}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={status}
                                onValueChange={onStatusChange}
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="inactive">Inactive Only</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button 
                                variant="outline"
                                className="h-9"
                                onClick={onToggleAdvancedFilters}
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
                                onClick={onExport}
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
                                {/* Sort Options */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${sortBy === 'name' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                            onClick={() => onSortChange('name')}
                                        >
                                            Name
                                            {getSortIcon('name')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${sortBy === 'order' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                            onClick={() => onSortChange('order')}
                                        >
                                            Order
                                            {getSortIcon('order')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${sortBy === 'positions_count' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                            onClick={() => onSortChange('positions_count')}
                                        >
                                            Positions
                                            {getSortIcon('positions_count')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Quick Filters</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${status === 'active' ? 'bg-green-50 text-green-700' : ''}`}
                                            onClick={() => onStatusChange('active')}
                                        >
                                            Active
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${status === 'inactive' ? 'bg-gray-50 text-gray-700' : ''}`}
                                            onClick={() => onStatusChange('inactive')}
                                        >
                                            Inactive
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => toast.info('Filter by positions functionality')}
                                                >
                                                    With Positions
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Coming soon: Filter committees with positions
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Order Selection */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Sort Order</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${sortOrder === 'asc' ? 'bg-blue-50 text-blue-700' : ''}`}
                                            onClick={() => onSortChange(sortBy)}
                                        >
                                            Ascending
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 ${sortOrder === 'desc' ? 'bg-blue-50 text-blue-700' : ''}`}
                                            onClick={() => onSortChange(sortBy)}
                                        >
                                            Descending
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active filters indicator */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {hasActiveFilters && (
                                <div className="flex items-center gap-2">
                                    <span>Active filters:</span>
                                    {search && (
                                        <Badge variant="secondary" className="text-xs">
                                            Search: "{search}"
                                        </Badge>
                                    )}
                                    {status !== 'all' && (
                                        <Badge variant="secondary" className="text-xs">
                                            Status: {status}
                                        </Badge>
                                    )}
                                    {sortBy !== 'order' && (
                                        <Badge variant="secondary" className="text-xs">
                                            Sorted by: {sortBy}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onReset}
                                className="text-red-600 hover:text-red-700 h-8"
                            >
                                <FilterX className="h-3.5 w-3.5 mr-1" />
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}