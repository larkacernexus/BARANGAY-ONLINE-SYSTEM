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
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Download, FilterX, Award, ChevronDown, ChevronUp, Users, UserCheck, UserX, MapPin, Heart, Calendar, Briefcase } from 'lucide-react';
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

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filtersState.status && filtersState.status !== 'all') count++;
        if (filtersState.gender && filtersState.gender !== 'all') count++;
        if (filtersState.purok_id && filtersState.purok_id !== 'all') count++;
        if (filtersState.civil_status && filtersState.civil_status !== 'all') count++;
        if (filtersState.is_voter === 'true') count++;
        if (filtersState.is_head === 'true') count++;
        if (filtersState.privilege_id && filtersState.privilege_id !== 'all') count++;
        if (filtersState.min_age || filtersState.max_age) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    {/* Search Bar - Enhanced */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by name, ID number, contact, or address..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={handleSearchChange}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {showAdvancedToggle && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
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
                            )}
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
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
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">residents</span>
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
                                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Status: {filtersState.status}
                                        </Badge>
                                    )}
                                    {filtersState.gender && filtersState.gender !== 'all' && (
                                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Gender: {filtersState.gender}
                                        </Badge>
                                    )}
                                    {filtersState.purok_id && filtersState.purok_id !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Purok: {puroks.find(p => p.id.toString() === filtersState.purok_id?.toString())?.name}
                                        </Badge>
                                    )}
                                    {filtersState.civil_status && filtersState.civil_status !== 'all' && (
                                        <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Civil: {civilStatusOptions.find(s => s.value === filtersState.civil_status)?.label}
                                        </Badge>
                                    )}
                                    {filtersState.privilege_id && filtersState.privilege_id !== 'all' && (
                                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Award className="h-3 w-3 mr-1 inline" />
                                            {privileges.find(p => p.id.toString() === filtersState.privilege_id?.toString())?.name}
                                        </Badge>
                                    )}
                                    {filtersState.is_voter === 'true' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Voters Only
                                        </Badge>
                                    )}
                                    {filtersState.is_head === 'true' && (
                                        <Badge variant="secondary" className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Heads Only
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</Label>
                            <Select
                                value={filtersState.status || 'all'}
                                onValueChange={(value) => updateFilter('status', value)}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Gender Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</Label>
                            <Select
                                value={filtersState.gender || 'all'}
                                onValueChange={(value) => updateFilter('gender', value)}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Genders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Genders</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Purok Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purok</Label>
                            <Select
                                value={filtersState.purok_id?.toString() || 'all'}
                                onValueChange={(value) => updateFilter('purok_id', value)}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Puroks" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Puroks</SelectItem>
                                    {puroks.map((purok) => (
                                        <SelectItem key={purok.id} value={purok.id.toString()}>
                                            {purok.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Civil Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Civil Status</Label>
                            <Select
                                value={filtersState.civil_status || 'all'}
                                onValueChange={(value) => updateFilter('civil_status', value)}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Civil Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Civil Status</SelectItem>
                                    {civilStatusOptions.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters - Modern Accordion Style */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Status Flags */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-indigo-500" />
                                        Resident Status
                                    </Label>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="voter"
                                                checked={filtersState.is_voter === 'true'}
                                                onCheckedChange={(checked) => updateFilter('is_voter', checked ? 'true' : 'false')}
                                                className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                            />
                                            <Label htmlFor="voter" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-normal">
                                                Voters Only
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="head"
                                                checked={filtersState.is_head === 'true'}
                                                onCheckedChange={(checked) => updateFilter('is_head', checked ? 'true' : 'false')}
                                                className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                            />
                                            <Label htmlFor="head" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-normal">
                                                Heads of Household Only
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Privilege Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-amber-500" />
                                        Privilege
                                    </Label>
                                    <Select
                                        value={filtersState.privilege_id?.toString() || 'all'}
                                        onValueChange={(value) => updateFilter('privilege_id', value)}
                                    >
                                        <SelectTrigger className={`w-full bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm ${
                                            filtersState.privilege_id && filtersState.privilege_id !== 'all' 
                                            ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20' 
                                            : ''
                                        }`}>
                                            <SelectValue placeholder="All Privileges" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Privileges</SelectItem>
                                            {privileges.map((privilege) => (
                                                <SelectItem key={privilege.id} value={privilege.id.toString()}>
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-medium">{privilege.name}</span>
                                                        <span className="text-xs text-gray-400">({privilege.code})</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {filtersState.privilege_id && filtersState.privilege_id !== 'all' && (
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                            Filtering by specific privilege
                                        </p>
                                    )}
                                </div>

                                {/* Age Range */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        Age Range
                                    </Label>
                                    <Select
                                        value={getCurrentAgeRangeValue()}
                                        onValueChange={(value) => handleAgeRangeChange(value)}
                                    >
                                        <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Ages" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Ages</SelectItem>
                                            {ageRanges.map((range) => (
                                                <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                                                    {range.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}