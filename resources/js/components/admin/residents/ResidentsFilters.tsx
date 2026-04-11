// components/admin/residents/ResidentsFilters.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, Download, FilterX, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, RefObject } from 'react';
import { FilterState } from '@/types/admin/residents/residents-types';

// Import types from the main types file
interface Purok {
    id: number;
    name: string;
    code?: string;
    description?: string;
}

interface Privilege {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    is_active: boolean;
    requires_verification: boolean;
}

interface AgeRange {
    min: number;
    max: number;
    label: string;
}

interface CivilStatusOption {
    value: string;
    label: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    male: number;
    female: number;
    voters: number;
    heads_of_household: number;
    with_privileges: number;
}

interface ResidentsFiltersProps {
    stats?: Stats;
    search: string;
    setSearch: (value: string) => void;
    filtersState: FilterState;
    updateFilter: (key: keyof FilterState, value: string) => void;
    showAdvancedFilters?: boolean;
    setShowAdvancedFilters?: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    puroks: Purok[];
    privileges?: Privilege[];
    ageRanges?: AgeRange[];
    civilStatusOptions: CivilStatusOption[];
    isMobile?: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: RefObject<HTMLInputElement | null>;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ResidentsFilters({
    stats,
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters = false,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    puroks,
    privileges = [],
    ageRanges = [],
    civilStatusOptions,
    isMobile = false,
    totalItems,
    startIndex,
    endIndex,
    searchInputRef,
    onSearchChange
}: ResidentsFiltersProps) {
    const showAdvancedToggle = setShowAdvancedFilters !== undefined;

    // Handle search change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        if (onSearchChange) {
            onSearchChange(e);
        }
    };

    // Group privileges by category if available
    const groupedPrivileges = privileges.reduce((acc, privilege) => {
        const category = privilege.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(privilege);
        return acc;
    }, {} as Record<string, Privilege[]>);

    // Handle age range change
    const handleAgeRangeChange = (value: string) => {
        if (value === 'all') {
            updateFilter('min_age', '');
            updateFilter('max_age', '');
        } else {
            const range = ageRanges.find(r => `${r.min}-${r.max}` === value || r.label === value);
            if (range) {
                updateFilter('min_age', range.min.toString());
                updateFilter('max_age', range.max.toString());
            }
        }
    };

    // Get current age range value for display
    const getCurrentAgeRangeValue = () => {
        if (!filtersState.min_age && !filtersState.max_age) return 'all';
        const minAge = filtersState.min_age?.toString();
        const maxAge = filtersState.max_age?.toString();
        const range = ageRanges.find(r => 
            r.min.toString() === minAge && r.max.toString() === maxAge
        );
        return range ? `${range.min}-${range.max}` : 'custom';
    };

    // Convert hasActiveFilters to boolean (if it comes as string)
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
                                placeholder="Search by name, contact, address, or ID number..."
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={handleSearchChange}
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
                            {showAdvancedToggle && (
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
                            )}
                            <Button 
                                variant="outline"
                                className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                    const exportUrl = new URL('/admin/residents/export', window.location.origin);
                                    if (search) exportUrl.searchParams.append('search', search);
                                    Object.keys(filtersState).forEach(key => {
                                        const value = filtersState[key as keyof FilterState];
                                        if (value && value !== 'all' && value !== '') {
                                            exportUrl.searchParams.append(key, String(value));
                                        }
                                    });
                                    window.open(exportUrl.toString(), '_blank');
                                }}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} residents
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
                            {filtersState.privilege_id && filtersState.privilege_id !== 'all' && (
                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-md text-xs">
                                    <Award className="h-3 w-3" />
                                    <span>Filtered by: {privileges.find(p => p.id.toString() === filtersState.privilege_id?.toString())?.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.status || 'all'}
                                onChange={(e) => updateFilter('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Gender</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.gender || 'all'}
                                onChange={(e) => updateFilter('gender', e.target.value)}
                            >
                                <option value="all">All Genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Purok</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.purok_id?.toString() || 'all'}
                                onChange={(e) => updateFilter('purok_id', e.target.value)}
                            >
                                <option value="all">All Puroks</option>
                                {puroks.map((purok) => (
                                    <option key={purok.id} value={purok.id.toString()}>
                                        {purok.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Civil Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={filtersState.civil_status || 'all'}
                                onChange={(e) => updateFilter('civil_status', e.target.value)}
                            >
                                <option value="all">All Civil Status</option>
                                {civilStatusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
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
                                {/* Voter & Head Status */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Flags</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="voter"
                                                checked={filtersState.is_voter === 'true'}
                                                onChange={(e) => updateFilter('is_voter', e.target.checked ? 'true' : 'false')}
                                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="voter" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Voters Only
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="head"
                                                checked={filtersState.is_head === 'true'}
                                                onChange={(e) => updateFilter('is_head', e.target.checked ? 'true' : 'false')}
                                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="head" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Heads of Household Only
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Privilege Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Privilege</Label>
                                    <select
                                        className={`w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                                            filtersState.privilege_id && filtersState.privilege_id !== 'all' 
                                            ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30' 
                                            : ''
                                        }`}
                                        value={filtersState.privilege_id?.toString() || 'all'}
                                        onChange={(e) => updateFilter('privilege_id', e.target.value)}
                                    >
                                        <option value="all">All Privileges</option>
                                        {privileges.map((privilege) => (
                                            <option key={privilege.id} value={privilege.id.toString()}>
                                                {privilege.name} ({privilege.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Age Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age Range</Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={getCurrentAgeRangeValue()}
                                        onChange={(e) => handleAgeRangeChange(e.target.value)}
                                    >
                                        <option value="all">All Ages</option>
                                        {ageRanges.map((range) => (
                                            <option key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                                                {range.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}