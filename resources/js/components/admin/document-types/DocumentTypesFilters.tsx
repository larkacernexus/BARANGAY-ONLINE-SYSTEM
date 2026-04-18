// components/admin/document-types/DocumentTypesFilters.tsx

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, FilterX, Search, X, Filter, AlertCircle, FolderOpen, FileText, TrendingUp, Layers } from 'lucide-react';
import { route } from 'ziggy-js';
import { RefObject } from 'react';

import type { CategoryOption, FilterState } from '@/types/admin/document-types/document-types';

interface DocumentTypesFiltersProps {
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
    searchInputRef: RefObject<HTMLInputElement | null>;
    categories: CategoryOption[];
    isLoading?: boolean;
}

export default function DocumentTypesFilters({
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
    searchInputRef,
    categories,
    isLoading = false
}: DocumentTypesFiltersProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (filtersState.category && filtersState.category !== 'all') count++;
        if (filtersState.required && filtersState.required !== 'all') count++;
        if (search) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    const getCategoryName = (categoryId: string) => {
        if (categoryId === 'all') return '';
        const category = categories.find(c => c.id.toString() === categoryId);
        return category?.name || categoryId;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'emerald';
            case 'inactive': return 'gray';
            default: return 'gray';
        }
    };

    // Get requirement info
    const getRequirementInfo = (value: string) => {
        switch (value) {
            case 'required': return { label: 'Required', color: 'red' };
            case 'optional': return { label: 'Optional', color: 'blue' };
            default: return { label: value, color: 'gray' };
        }
    };

    return (
        <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-900 rounded-2xl">
            <CardContent className="p-6 md:p-7">
                <div className="flex flex-col space-y-6">
                    {/* Search Bar - Enhanced */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search document types by name, code, or description... (Ctrl+F)"
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2.5">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all shadow-sm"
                                disabled={isLoading}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">
                                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                </span>
                                <span className="sm:hidden">
                                    {showAdvancedFilters ? 'Hide' : 'Filters'}
                                </span>
                                {!showAdvancedFilters && activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0 text-xs">
                                        +{activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all shadow-sm"
                                onClick={() => {
                                    const exportUrl = route('document-types.export', {
                                        search: search || undefined,
                                        status: filtersState.status !== 'all' ? filtersState.status : undefined,
                                        category: filtersState.category !== 'all' ? filtersState.category : undefined,
                                        required: filtersState.required !== 'all' ? filtersState.required : undefined,
                                    });
                                    window.open(exportUrl, '_blank');
                                }}
                                disabled={totalItems === 0 || isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3.5 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">document types</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">“{search}”</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active filter badges */}
                            {activeFilters && (
                                <>
                                    {filtersState.status && filtersState.status !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(filtersState.status) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <AlertCircle className="h-3 w-3 mr-1.5 inline" />
                                            Status: {filtersState.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                    {filtersState.category && filtersState.category !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                                            <FolderOpen className="h-3 w-3 mr-1.5 inline" />
                                            Category: {getCategoryName(filtersState.category)}
                                        </Badge>
                                    )}
                                    {filtersState.required && filtersState.required !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getRequirementInfo(filtersState.required).color === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        } border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                            <FileText className="h-3 w-3 mr-1.5 inline" />
                                            {getRequirementInfo(filtersState.required).label}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium"
                                >
                                    <FilterX className="h-3 w-3 mr-1.5" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={filtersState.status}
                                onValueChange={(value) => updateFilter('status', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500 focus:ring-2 transition-all">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FolderOpen className="h-3 w-3" />
                                Category
                            </Label>
                            <Select
                                value={filtersState.category}
                                onValueChange={(value) => updateFilter('category', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-all">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Requirement Filter */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="h-3 w-3" />
                                Requirement
                            </Label>
                            <Select
                                value={filtersState.required}
                                onValueChange={(value) => updateFilter('required', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-all">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="required">Required</SelectItem>
                                    <SelectItem value="optional">Optional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-2 space-y-6">
                            <div className="flex items-center gap-2.5">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-4 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-amber-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                updateFilter('status', 'active');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Active Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                updateFilter('required', 'required');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Required Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => {
                                                updateFilter('category', 'all');
                                                updateFilter('status', 'all');
                                                updateFilter('required', 'all');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Information Section */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-4 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-indigo-500" />
                                        Document Type Information
                                    </Label>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
                                        <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Required documents</span> must be submitted</p>
                                        <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Categories</span> help organize document types</p>
                                        <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Inactive types</span> won't appear in selections</p>
                                        <p>• Use the table header to sort by any column</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Loading indicator - Modern */}
                {isLoading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}