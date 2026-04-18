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
    Layers,
    Hash,
    Rows,
    RotateCcw
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
    searchInputRef?: React.RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
    barangays: string[];
    // Bulk selection props (optional, for consistency with CommunityReports)
    isBulkMode?: boolean;
    selectedBlotters?: number[];
    showSelectionOptions?: boolean;
    setShowSelectionOptions?: (value: boolean) => void;
    handleSelectAllOnPage?: () => void;
    handleSelectAllFiltered?: () => void;
    handleSelectAll?: () => void;
    handleExport?: () => void;
    selectionRef?: React.RefObject<HTMLDivElement | null>;
    windowWidth?: number;
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
    barangays = [],
    // Bulk selection props with defaults
    isBulkMode = false,
    selectedBlotters = [],
    showSelectionOptions = false,
    setShowSelectionOptions = () => {},
    handleSelectAllOnPage = () => {},
    handleSelectAllFiltered = () => {},
    handleSelectAll = () => {},
    handleExport = () => {},
    selectionRef,
    windowWidth = 1024
}: BlottersFiltersProps) {
    
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

    const handleDateFromFilter = (date: string) => {
        updateFilter('date_from', date);
    };

    const handleDateToFilter = (date: string) => {
        updateFilter('date_to', date);
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

    // Status options for display
    const statusOptions = {
        pending: 'Pending',
        investigating: 'Investigating',
        resolved: 'Resolved',
        archived: 'Archived'
    };

    // Priority options for display
    const priorityOptions = {
        urgent: 'Urgent',
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    {/* Search Bar */}
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

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} blotters
                            {search && ` matching "${search}"`}
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
                            {isBulkMode && (
                                <div className="flex items-center gap-2 relative" ref={selectionRef}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                        className="h-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Layers className="h-3.5 w-3.5 mr-1" />
                                        Select
                                    </Button>
                                    {showSelectionOptions && (
                                        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                            <div className="p-2">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                    SELECTION OPTIONS
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={handleSelectAllOnPage}
                                                >
                                                    <Rows className="h-3.5 w-3.5 mr-2" />
                                                    Current Page
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={handleSelectAllFiltered}
                                                >
                                                    <Filter className="h-3.5 w-3.5 mr-2" />
                                                    All Filtered
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={handleSelectAll}
                                                >
                                                    <Hash className="h-3.5 w-3.5 mr-2" />
                                                    All ({totalItems})
                                                </Button>
                                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    onClick={() => setShowSelectionOptions(false)}
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                {Object.entries(statusOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Priority</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.priority}
                                onChange={(e) => handlePriorityFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Priority</option>
                                {Object.entries(priorityOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Incident Type</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Barangay</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4 border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Incident Date Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="From Date"
                                            type="date"
                                            value={filtersState.date_from}
                                            onChange={(e) => handleDateFromFilter(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={filtersState.date_to}
                                            onChange={(e) => handleDateToFilter(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Sort Options */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 justify-start ${
                                                filtersState.sort_by === 'incident_datetime' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSort('incident_datetime')}
                                            disabled={isLoading}
                                        >
                                            Date & Time
                                            <span className="ml-auto">{getSortIcon('incident_datetime')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 justify-start ${
                                                filtersState.sort_by === 'blotter_number' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSort('blotter_number')}
                                            disabled={isLoading}
                                        >
                                            Blotter #
                                            <span className="ml-auto">{getSortIcon('blotter_number')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 justify-start ${
                                                filtersState.sort_by === 'incident_type' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSort('incident_type')}
                                            disabled={isLoading}
                                        >
                                            Incident Type
                                            <span className="ml-auto">{getSortIcon('incident_type')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 justify-start ${
                                                filtersState.sort_by === 'reporter_name' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSort('reporter_name')}
                                            disabled={isLoading}
                                        >
                                            Reporter
                                            <span className="ml-auto">{getSortIcon('reporter_name')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 justify-start ${
                                                filtersState.sort_by === 'status' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => handleSort('status')}
                                            disabled={isLoading}
                                        >
                                            Status
                                            <span className="ml-auto">{getSortIcon('status')}</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</Label>
                                    <div className="grid grid-cols-2 gap-2">
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
                            </div>
                        </div>
                    )}

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