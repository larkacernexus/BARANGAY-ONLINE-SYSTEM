// resources/js/components/admin/blotters/BlottersFilters.tsx

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    ChevronUp,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import { BlotterFilters } from '@/types/admin/blotters/blotter';
import { BLOTTER_INCIDENT_TYPES, getCategories } from '@/data/blotterIncidentTypes';

interface BlottersFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
    filtersState: BlotterFilters;
    updateFilter: (key: keyof BlotterFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: React.RefObject<HTMLInputElement>;
    isLoading?: boolean;
    barangays: string[];
}

export default function BlottersFilters({
    search,
    setSearch,
    onSearchChange,
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
    isLoading = false,
    barangays = []
}: BlottersFiltersProps) {
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const selectionRef = useRef<HTMLDivElement>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handlePriorityFilter = (priority: string) => {
        updateFilter('priority', priority);
    };

    const handleIncidentTypeFilter = (type: string) => {
        updateFilter('incident_type', type);
    };

    const handleBarangayFilter = (barangay: string) => {
        updateFilter('barangay', barangay);
    };

    const handleSort = (column: string) => {
        if (filtersState.sort_by === column) {
            updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc');
        } else {
            updateFilter('sort_by', column);
            updateFilter('sort_order', 'asc');
        }
    };

    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const incidentCategories = getCategories();
    const incidentTypes = BLOTTER_INCIDENT_TYPES.filter(t => t.is_active);

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by blotter #, reporter, respondent, location... (Ctrl+F)"
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSearch('')}
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <select 
                                className="border rounded px-3 py-2 text-sm w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="investigating">Investigating</option>
                                <option value="resolved">Resolved</option>
                                <option value="archived">Archived</option>
                            </select>
                            
                            <select 
                                className="border rounded px-3 py-2 text-sm w-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.priority}
                                onChange={(e) => handlePriorityFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Priority</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            
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
                                onClick={() => {
                                    const exportUrl = new URL('/admin/blotters/export', window.location.origin);
                                    if (search) exportUrl.searchParams.append('search', search);
                                    if (filtersState.status !== 'all') exportUrl.searchParams.append('status', filtersState.status);
                                    if (filtersState.priority !== 'all') exportUrl.searchParams.append('priority', filtersState.priority);
                                    if (filtersState.incident_type !== 'all') exportUrl.searchParams.append('incident_type', filtersState.incident_type);
                                    window.open(exportUrl.toString(), '_blank');
                                }}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Incident Type Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Incident Type</Label>
                                    <select 
                                        className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.incident_type}
                                        onChange={(e) => handleIncidentTypeFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All Types</option>
                                        {incidentCategories.map(category => (
                                            <optgroup key={category} label={category}>
                                                {incidentTypes
                                                    .filter(t => t.category === category)
                                                    .map(type => (
                                                        <option key={type.code} value={type.code}>
                                                            {type.name}
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                {/* Barangay Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Barangay</Label>
                                    <select 
                                        className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={filtersState.barangay}
                                        onChange={(e) => handleBarangayFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All Barangays</option>
                                        {barangays.map(barangay => (
                                            <option key={barangay} value={barangay}>{barangay}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="date"
                                            placeholder="From"
                                            value={filtersState.date_from}
                                            onChange={(e) => updateFilter('date_from', e.target.value)}
                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            type="date"
                                            placeholder="To"
                                            value={filtersState.date_to}
                                            onChange={(e) => updateFilter('date_to', e.target.value)}
                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                            disabled={isLoading}
                                        />
                                    </div>
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
                                            filtersState.sort_by === 'incident_datetime' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('incident_datetime')}
                                        disabled={isLoading}
                                    >
                                        Date & Time
                                        <span className="ml-1">{getSortIcon('incident_datetime')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort_by === 'blotter_number' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('blotter_number')}
                                        disabled={isLoading}
                                    >
                                        Blotter #
                                        <span className="ml-1">{getSortIcon('blotter_number')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort_by === 'incident_type' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('incident_type')}
                                        disabled={isLoading}
                                    >
                                        Incident Type
                                        <span className="ml-1">{getSortIcon('incident_type')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort_by === 'reporter_name' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('reporter_name')}
                                        disabled={isLoading}
                                    >
                                        Reporter
                                        <span className="ml-1">{getSortIcon('reporter_name')}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.sort_by === 'status' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSort('status')}
                                        disabled={isLoading}
                                    >
                                        Status
                                        <span className="ml-1">{getSortIcon('status')}</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.priority === 'urgent' 
                                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handlePriorityFilter('urgent')}
                                        disabled={isLoading}
                                    >
                                        Urgent Only
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.status === 'pending' 
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleStatusFilter('pending')}
                                        disabled={isLoading}
                                    >
                                        Pending Only
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 ${
                                            filtersState.status === 'resolved' 
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleStatusFilter('resolved')}
                                        disabled={isLoading}
                                    >
                                        Resolved Only
                                    </Button>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {hasActiveFilters && (
                                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Active filters:</span>
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            Status: {filtersState.status}
                                        </span>
                                    )}
                                    {filtersState.priority && filtersState.priority !== 'all' && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            Priority: {filtersState.priority}
                                        </span>
                                    )}
                                    {filtersState.incident_type && filtersState.incident_type !== 'all' && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            Type: {filtersState.incident_type}
                                        </span>
                                    )}
                                    {filtersState.barangay && filtersState.barangay !== 'all' && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            Barangay: {filtersState.barangay}
                                        </span>
                                    )}
                                    {filtersState.date_from && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            From: {filtersState.date_from}
                                        </span>
                                    )}
                                    {filtersState.date_to && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            To: {filtersState.date_to}
                                        </span>
                                    )}
                                    {search && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full">
                                            Search: "{search.length > 15 ? search.substring(0, 15) + '...' : search}"
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results count */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} blotters
                            {search && ` matching "${search}"`}
                            {filtersState.status !== 'all' && ` • Status: ${filtersState.status}`}
                            {filtersState.priority !== 'all' && ` • Priority: ${filtersState.priority}`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 h-8"
                                    disabled={isLoading}
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