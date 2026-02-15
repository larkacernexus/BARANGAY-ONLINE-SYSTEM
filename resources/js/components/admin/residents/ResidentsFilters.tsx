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
import { Download, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CivilStatusOption, Purok } from '@/types';

interface ResidentsFiltersProps {
    stats?: any;
    search: string;
    setSearch: (value: string) => void;
    filtersState: any;
    updateFilter: (key: string, value: string) => void;
    showAdvancedFilters?: boolean;
    setShowAdvancedFilters?: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    puroks: Purok[];
    ageRanges?: string[];
    civilStatusOptions: CivilStatusOption[];
    isMobile?: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
}

export default function ResidentsFilters({
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters = false,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    puroks,
    ageRanges = [],
    civilStatusOptions,
    isMobile = false,
    totalItems,
    startIndex,
    endIndex
}: ResidentsFiltersProps) {
    const showAdvancedToggle = setShowAdvancedFilters !== undefined;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search by name, contact, address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {showAdvancedToggle && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                            const exportUrl = new URL('/residents/export', window.location.origin);
                            if (search) exportUrl.searchParams.append('search', search);
                            Object.keys(filtersState).forEach(key => {
                                if (filtersState[key] && filtersState[key] !== 'all') {
                                    exportUrl.searchParams.append(key, filtersState[key]);
                                }
                            });
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
                        value={filtersState.status || 'all'}
                        onValueChange={(value) => updateFilter('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.gender || 'all'}
                        onValueChange={(value) => updateFilter('gender', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.purok_id || 'all'}
                        onValueChange={(value) => updateFilter('purok_id', value)}
                    >
                        <SelectTrigger>
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
            </div>

            {showAdvancedFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Select
                        value={filtersState.civil_status || 'all'}
                        onValueChange={(value) => updateFilter('civil_status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Civil Status" />
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

                    <Select
                        value={filtersState.is_voter || 'all'}
                        onValueChange={(value) => updateFilter('is_voter', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Voter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Voter Status</SelectItem>
                            <SelectItem value="yes">Voters Only</SelectItem>
                            <SelectItem value="no">Non-Voters Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filtersState.is_head || 'all'}
                        onValueChange={(value) => updateFilter('is_head', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Head Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Head Status</SelectItem>
                            <SelectItem value="yes">Heads Only</SelectItem>
                            <SelectItem value="no">Non-Heads Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} residents
                </div>
            </div>
        </div>
    );
}