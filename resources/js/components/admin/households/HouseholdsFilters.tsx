import { Card, CardContent } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/adminui/stats-cards';
import { Home, Users, CheckCircle } from 'lucide-react';
import { truncateText } from '../../../admin-utils/householdUtils';

interface HouseholdsFiltersProps {
    stats: any[];
    search: string;
    setSearch: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    purokFilter: string;
    setPurokFilter: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    puroks: any[];
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    filteredHouseholds: any[];
}

export default function HouseholdsFilters({
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    purokFilter,
    setPurokFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    puroks,
    isMobile,
    totalItems,
    startIndex,
    endIndex,
    filteredHouseholds
}: HouseholdsFiltersProps) {
    // Calculate filtered stats
    const filteredStats = filteredHouseholds.length > 0 ? [
        { 
            label: 'Total Households', 
            value: filteredHouseholds.length,
            icon: <Home className="h-3 w-3 sm:h-4 sm:w-4" />
        },
        { 
            label: 'Active Households', 
            value: filteredHouseholds.filter(h => h.status === 'active').length,
            icon: <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        },
        { 
            label: 'Total Members', 
            value: filteredHouseholds.reduce((sum, h) => sum + h.member_count, 0),
            icon: <Users className="h-3 w-3 sm:h-4 sm:w-4" />
        },
        { 
            label: 'Average Members', 
            value: filteredHouseholds.length > 0 
                ? (filteredHouseholds.reduce((sum, h) => sum + h.member_count, 0) / filteredHouseholds.length).toFixed(1)
                : '0.0',
            icon: <Users className="h-3 w-3 sm:h-4 sm:w-4" />
        }
    ] : [];

    return (
        <>
            {/* Stats Cards using reusable component */}
            <StatsCards stats={filteredStats} columns={4} />

            {/* Search and Filters */}
            <Card className="overflow-hidden">
                <CardContent className="p-4 sm:pt-6">
                    <FilterBar
                        search={search}
                        onSearchChange={setSearch}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        showAdvancedFilters={showAdvancedFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        searchPlaceholder="Search households..."
                        resultsText={search ? `Showing results for "${search}"` : undefined}
                        showCount={true}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    >
                        {/* Basic Filters */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Status:</span>
                                <select 
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Purok:</span>
                                <select 
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={purokFilter}
                                    onChange={(e) => setPurokFilter(e.target.value)}
                                >
                                    <option value="all">All Puroks</option>
                                    {puroks.map((purok) => (
                                        <option key={purok.id} value={purok.id}>
                                            {truncateText(purok.name, isMobile ? 12 : 15)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                                <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
                                <div className="flex items-center gap-1 w-full">
                                    <select 
                                        className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="household_number">Household No.</option>
                                        <option value="head_of_family">Head of Family</option>
                                        <option value="member_count">Members</option>
                                        {!isMobile && <option value="purok">Purok</option>}
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FilterBar>
                </CardContent>
            </Card>
        </>
    );
}