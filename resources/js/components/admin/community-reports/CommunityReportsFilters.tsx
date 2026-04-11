// resources/js/components/admin/community-reports/CommunityReportsFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Search, 
    X, 
    Filter, 
    Download, 
    FilterX,
    Layers,
    Hash,
    Rows,
    RotateCcw 
} from 'lucide-react';
import { RefObject } from 'react';

interface CommunityReportsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    priorityFilter: string;
    setPriorityFilter: (value: string) => void;
    urgencyFilter: string;
    setUrgencyFilter: (value: string) => void;
    reportTypeFilter: string;
    setReportTypeFilter: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    impactFilter: string;
    setImpactFilter: (value: string) => void;
    purokFilter: string;
    setPurokFilter: (value: string) => void;
    assignedFilter: string;
    setAssignedFilter: (value: string) => void;
    sourceFilter: string;
    setSourceFilter: (value: string) => void;
    fromDateFilter: string;
    setFromDateFilter: (value: string) => void;
    toDateFilter: string;
    setToDateFilter: (value: string) => void;
    hasEvidencesFilter: boolean;
    setHasEvidencesFilter: (value: boolean) => void;
    safetyConcernFilter: boolean;
    setSafetyConcernFilter: (value: boolean) => void;
    environmentalFilter: boolean;
    setEnvironmentalFilter: (value: boolean) => void;
    recurringFilter: boolean;
    setRecurringFilter: (value: boolean) => void;
    anonymousFilter: boolean;
    setAnonymousFilter: (value: boolean) => void;
    affectedPeopleFilter: string;
    setAffectedPeopleFilter: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    safeReportTypes: Array<{id: number, name: string, category: string}>;
    safeCategories: string[];
    safePuroks: string[];
    safeStaff: Array<{id: number, name: string}>;
    isBulkMode: boolean;
    selectedReports: number[];
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasActiveFilters: boolean | string; // Allow string or boolean
    showSelectionOptions: boolean;
    setShowSelectionOptions: (value: boolean) => void;
    handleClearFilters: () => void;
    handleSelectAllOnPage: () => void;
    handleSelectAllFiltered: () => void;
    handleSelectAll: () => void;
    handleExport: () => void;
    searchInputRef: RefObject<HTMLInputElement | null>;
    selectionRef: RefObject<HTMLDivElement | null>;
    windowWidth: number;
}

export default function CommunityReportsFilters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    urgencyFilter,
    setUrgencyFilter,
    reportTypeFilter,
    setReportTypeFilter,
    categoryFilter,
    setCategoryFilter,
    impactFilter,
    setImpactFilter,
    purokFilter,
    setPurokFilter,
    assignedFilter,
    setAssignedFilter,
    sourceFilter,
    setSourceFilter,
    fromDateFilter,
    setFromDateFilter,
    toDateFilter,
    setToDateFilter,
    hasEvidencesFilter,
    setHasEvidencesFilter,
    safetyConcernFilter,
    setSafetyConcernFilter,
    environmentalFilter,
    setEnvironmentalFilter,
    recurringFilter,
    setRecurringFilter,
    anonymousFilter,
    setAnonymousFilter,
    affectedPeopleFilter,
    setAffectedPeopleFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showAdvancedFilters,
    setShowAdvancedFilters,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    safeReportTypes,
    safeCategories,
    safePuroks,
    safeStaff,
    isBulkMode,
    selectedReports,
    totalItems,
    startIndex,
    endIndex,
    hasActiveFilters,
    showSelectionOptions,
    setShowSelectionOptions,
    handleClearFilters,
    handleSelectAllOnPage,
    handleSelectAllFiltered,
    handleSelectAll,
    handleExport,
    searchInputRef,
    selectionRef,
    windowWidth
}: CommunityReportsFiltersProps) {
    
    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);
    
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
                                placeholder="Search reports by ID, title, description, location, resident name, or contact... (Ctrl+F)"
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
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
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} reports
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
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
                                                    onClick={() => {
                                                        setShowSelectionOptions(false);
                                                    }}
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

                    {/* Basic Filters - Removed Sort By */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                {Object.entries(safeStatuses).map(([value, label]) => (
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
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="all">All Priorities</option>
                                {Object.entries(safePriorities).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Urgency</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value)}
                            >
                                <option value="all">All Urgency</option>
                                {Object.entries(safeUrgencies).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Report Type</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={reportTypeFilter}
                                onChange={(e) => setReportTypeFilter(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                {safeReportTypes.map((type) => (
                                    <option key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Assigned To</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={assignedFilter}
                                onChange={(e) => setAssignedFilter(e.target.value)}
                            >
                                <option value="all">All Assignees</option>
                                <option value="unassigned">Unassigned</option>
                                {safeStaff.map((person) => (
                                    <option key={person.id} value={person.id.toString()}>
                                        {person.name}
                                    </option>
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
                                            value={fromDateFilter}
                                            onChange={(e) => setFromDateFilter(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                        <Input
                                            placeholder="To Date"
                                            type="date"
                                            value={toDateFilter}
                                            onChange={(e) => setToDateFilter(e.target.value)}
                                            className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Additional Filters */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Special Flags</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has-evidences"
                                                checked={hasEvidencesFilter}
                                                onCheckedChange={(checked) => setHasEvidencesFilter(checked as boolean)}
                                                className="border-gray-300 dark:border-gray-600"
                                            />
                                            <Label htmlFor="has-evidences" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Has Evidence/Photos
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="safety-concern"
                                                checked={safetyConcernFilter}
                                                onCheckedChange={(checked) => setSafetyConcernFilter(checked as boolean)}
                                                className="border-gray-300 dark:border-gray-600"
                                            />
                                            <Label htmlFor="safety-concern" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Safety Concern
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="environmental-impact"
                                                checked={environmentalFilter}
                                                onCheckedChange={(checked) => setEnvironmentalFilter(checked as boolean)}
                                                className="border-gray-300 dark:border-gray-600"
                                            />
                                            <Label htmlFor="environmental-impact" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Environmental Impact
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="recurring-issue"
                                                checked={recurringFilter}
                                                onCheckedChange={(checked) => setRecurringFilter(checked as boolean)}
                                                className="border-gray-300 dark:border-gray-600"
                                            />
                                            <Label htmlFor="recurring-issue" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Recurring Issue
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="anonymous"
                                                checked={anonymousFilter}
                                                onCheckedChange={(checked) => setAnonymousFilter(checked as boolean)}
                                                className="border-gray-300 dark:border-gray-600"
                                            />
                                            <Label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Anonymous Only
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Impact and Category */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Impact & Category</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={impactFilter}
                                            onChange={(e) => setImpactFilter(e.target.value)}
                                        >
                                            <option value="all">All Impact Levels</option>
                                            <option value="minor">Minor</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="major">Major</option>
                                            <option value="severe">Severe</option>
                                        </select>
                                        <select
                                            className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
                                            {safeCategories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={affectedPeopleFilter}
                                            onChange={(e) => setAffectedPeopleFilter(e.target.value)}
                                        >
                                            <option value="all">All Affected</option>
                                            <option value="individual">Individual</option>
                                            <option value="family">Family</option>
                                            <option value="group">Group</option>
                                            <option value="community">Community</option>
                                            <option value="multiple">Multiple Groups</option>
                                        </select>
                                        <select
                                            className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                            value={purokFilter}
                                            onChange={(e) => setPurokFilter(e.target.value)}
                                        >
                                            <option value="all">All Puroks</option>
                                            {safePuroks.map((purok) => (
                                                <option key={purok} value={purok}>
                                                    Purok {purok}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}