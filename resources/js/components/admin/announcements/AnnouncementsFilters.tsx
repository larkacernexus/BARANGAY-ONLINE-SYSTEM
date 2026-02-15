import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, FilterX, Filter, Download, Calendar, AlertTriangle } from 'lucide-react';
import { FilterBar } from '@/components/adminui/filter-bar';
import { StatsCards } from '@/components/adminui/stats-cards';
import { AnnouncementFilters, AnnouncementStats } from '@/types';

interface AnnouncementsFiltersProps {
    stats: AnnouncementStats;
    search: string;
    setSearch: (value: string) => void;
    filtersState: AnnouncementFilters;
    updateFilter: (key: keyof AnnouncementFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    types: Record<string, string>;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
}

export default function AnnouncementsFilters({
    stats = { total: 0, active: 0, expired: 0, upcoming: 0 },
    search,
    setSearch,
    filtersState,
    updateFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    hasActiveFilters,
    types = {},
    isMobile,
    totalItems,
    startIndex,
    endIndex
}: AnnouncementsFiltersProps) {
    const announcementStats = [
        {
            title: 'Total Announcements',
            value: stats.total.toLocaleString(),
            description: `${stats.active} active • ${stats.upcoming} upcoming`
        },
        {
            title: 'Currently Active',
            value: stats.active.toLocaleString(),
            description: 'Displayed to residents'
        },
        {
            title: 'Upcoming',
            value: stats.upcoming.toLocaleString(),
            className: 'hidden sm:block',
            description: 'Scheduled for future'
        },
        {
            title: 'Expired',
            value: stats.expired.toLocaleString(),
            className: 'hidden sm:block',
            description: 'Past end date'
        }
    ];

    return (
        <>
            <StatsCards stats={announcementStats} columns={4} />
            
            <Card className="overflow-hidden">
                <CardContent className="p-4 sm:pt-6">
                    <FilterBar
                        search={search}
                        onSearchChange={setSearch}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        showAdvancedFilters={showAdvancedFilters}
                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        searchPlaceholder="Search announcements by title or content..."
                        resultsText={search ? `Showing results for "${search}"` : undefined}
                        showCount={true}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    >
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Type:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={filtersState.type || 'all'}
                                    onChange={(e) => updateFilter('type', e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    {Object.entries(types).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">Status:</span>
                                <select
                                    className="border rounded px-2 py-1.5 text-xs sm:text-sm w-full"
                                    value={filtersState.status || 'all'}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="currently_active">Currently Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="upcoming">Upcoming</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                                <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
                                <div className="flex items-center gap-1 w-full">
                                    <select
                                        className="border rounded px-2 py-1.5 text-xs sm:text-sm flex-1"
                                        value={filtersState.sort_by || 'created_at'}
                                        onChange={(e) => updateFilter('sort_by', e.target.value)}
                                    >
                                        <option value="created_at">Date Created</option>
                                        <option value="title">Title</option>
                                        <option value="type">Type</option>
                                        <option value="priority">Priority</option>
                                        <option value="start_date">Start Date</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                        onClick={() => updateFilter('sort_order', filtersState.sort_order === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {filtersState.sort_order === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showAdvancedFilters && (
                            <div className="border-t pt-3 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Date Range */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Date Range</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="From Date"
                                                type="date"
                                                className="w-full text-sm"
                                                value={filtersState.from_date || ''}
                                                onChange={(e) => updateFilter('from_date', e.target.value)}
                                            />
                                            <span className="self-center text-xs sm:text-sm">to</span>
                                            <Input
                                                placeholder="To Date"
                                                type="date"
                                                className="w-full text-sm"
                                                value={filtersState.to_date || ''}
                                                onChange={(e) => updateFilter('to_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    const today = new Date();
                                                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                    updateFilter('from_date', firstDay.toISOString().split('T')[0]);
                                                    updateFilter('to_date', today.toISOString().split('T')[0]);
                                                }}
                                            >
                                                <Calendar className="h-3 w-3 mr-1" />
                                                This Month
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Quick Filters */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Quick Filters</label>
                                        <div className="flex flex-wrap gap-1">
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => updateFilter('status', 'currently_active')}
                                            >
                                                Active Now
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => updateFilter('status', 'expired')}
                                            >
                                                Expired
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100 text-xs px-2 py-0.5"
                                                onClick={() => {
                                                    updateFilter('sort_by', 'priority');
                                                    updateFilter('sort_order', 'desc');
                                                }}
                                            >
                                                High Priority
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Quick Actions</label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    setShowAdvancedFilters(false);
                                                    // Handle export
                                                }}
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Export
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    updateFilter('type', 'important');
                                                    setShowAdvancedFilters(false);
                                                }}
                                            >
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Important Only
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FilterBar>
                </CardContent>
            </Card>
        </>
    );
}