// components/admin/residents/ResidentsFilters.tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Filter, X, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { useState } from 'react';
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
    searchInputRef?: React.RefObject<HTMLInputElement | null>;
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

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search by name, contact, address..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {showAdvancedToggle && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            {showAdvancedFilters ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
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
                        value={filtersState.status || 'all'}
                        onValueChange={(value) => updateFilter('status', value)}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Status</SelectItem>
                            <SelectItem value="active" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Active</SelectItem>
                            <SelectItem value="inactive" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Inactive</SelectItem>
                            <SelectItem value="pending" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Pending</SelectItem>
                            <SelectItem value="suspended" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Suspended</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.gender || 'all'}
                        onValueChange={(value) => updateFilter('gender', value)}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Genders</SelectItem>
                            <SelectItem value="male" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Male</SelectItem>
                            <SelectItem value="female" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Female</SelectItem>
                            <SelectItem value="other" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.purok_id?.toString() || 'all'}
                        onValueChange={(value) => updateFilter('purok_id', value)}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Puroks" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Puroks</SelectItem>
                            {puroks.map((purok) => (
                                <SelectItem key={purok.id} value={purok.id.toString()} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                    {purok.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Select
                        value={filtersState.civil_status || 'all'}
                        onValueChange={(value) => updateFilter('civil_status', value)}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Civil Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Civil Status</SelectItem>
                            {civilStatusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.is_voter || 'all'}
                        onValueChange={(value) => updateFilter('is_voter', value)}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Voter Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Voter Status</SelectItem>
                            <SelectItem value="true" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Voters Only</SelectItem>
                            <SelectItem value="false" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Non-Voters Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.is_head || 'all'}
                        onValueChange={(value) => updateFilter('is_head', value)}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Head Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Head Status</SelectItem>
                            <SelectItem value="true" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Heads Only</SelectItem>
                            <SelectItem value="false" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Non-Heads Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Privilege Filter */}
                    <Select
                        value={filtersState.privilege_id?.toString() || 'all'}
                        onValueChange={(value) => updateFilter('privilege_id', value)}
                    >
                        <SelectTrigger 
                            className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                                filtersState.privilege_id && filtersState.privilege_id !== 'all' 
                                ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30' 
                                : ''
                            }`}
                        >
                            <SelectValue placeholder="Filter by Privilege">
                                {filtersState.privilege_id && filtersState.privilege_id !== 'all' ? (
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                        <span>
                                            {privileges.find(p => p.id.toString() === filtersState.privilege_id?.toString())?.name || 'Privilege'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <span>All Privileges</span>
                                    </div>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span>All Privileges</span>
                                </div>
                            </SelectItem>
                            
                            {/* Group privileges by category if available */}
                            {Object.keys(groupedPrivileges).length > 0 ? (
                                Object.entries(groupedPrivileges).map(([category, categoryPrivileges]) => (
                                    <div key={category}>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                                            {category}
                                        </div>
                                        {categoryPrivileges.map((privilege) => (
                                            <SelectItem 
                                                key={privilege.id} 
                                                value={privilege.id.toString()}
                                                className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700"
                                            >
                                                <div className="flex items-center gap-2 py-1">
                                                    <Award className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{privilege.name}</span>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{privilege.code}</span>
                                                            {privilege.description && (
                                                                <span className="truncate max-w-[150px]">{privilege.description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                // Fallback to simple list if no categories
                                privileges.map((privilege) => (
                                    <SelectItem 
                                        key={privilege.id} 
                                        value={privilege.id.toString()}
                                        className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                            <div className="flex flex-col">
                                                <span>{privilege.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{privilege.code}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    {/* Age Range Filter */}
                    <Select
                        value={getCurrentAgeRangeValue()}
                        onValueChange={handleAgeRangeChange}
                    >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Age Range" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">All Ages</SelectItem>
                            {ageRanges.map((range) => (
                                <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} residents
                </div>
                {filtersState.privilege_id && filtersState.privilege_id !== 'all' && (
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-md">
                        <Award className="h-3 w-3" />
                        <span>Filtered by: {privileges.find(p => p.id.toString() === filtersState.privilege_id?.toString())?.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}