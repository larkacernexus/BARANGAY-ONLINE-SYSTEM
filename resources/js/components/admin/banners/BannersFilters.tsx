// resources/js/components/admin/banners/BannersFilters.tsx

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
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    Users,
    Calendar,
    Image,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { BannerFilters } from '@/types/admin/banners/banner';
import { RefObject } from 'react';

interface BannersFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
    filtersState: BannerFilters;
    updateFilter: (key: keyof BannerFilters, value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    hasActiveFilters: boolean;
    isMobile: boolean;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    searchInputRef?: RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
}

export default function BannersFilters({
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
    isLoading = false
}: BannersFiltersProps) {
    
    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handleAudienceFilter = (audience: string) => {
        updateFilter('audience', audience);
    };

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status && filtersState.status !== 'all') queryParams.append('status', filtersState.status);
        if (filtersState.audience && filtersState.audience !== 'all') queryParams.append('audience', filtersState.audience);
        if (filtersState.date_from) queryParams.append('date_from', filtersState.date_from);
        if (filtersState.date_to) queryParams.append('date_to', filtersState.date_to);
        window.location.href = `/admin/banners/export?${queryParams.toString()}`;
    };

    // Safe access to filter values
    const currentStatus = filtersState.status ?? 'all';
    const currentAudience = filtersState.audience ?? 'all';

    const activeFilters = Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (currentStatus !== 'all') count++;
        if (currentAudience !== 'all') count++;
        if (filtersState.date_from) count++;
        if (filtersState.date_to) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Status options
    const statusOptions = [
        { value: 'all', label: 'All Statuses', color: 'gray' },
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'scheduled', label: 'Scheduled', color: 'blue' },
        { value: 'expired', label: 'Expired', color: 'gray' },
        { value: 'inactive', label: 'Inactive', color: 'red' }
    ];

    // Audience options
    const audienceOptions = [
        { value: 'all', label: 'All Audiences', color: 'gray' },
        { value: 'all', label: 'All Users', color: 'blue' },
        { value: 'residents', label: 'All Residents', color: 'green' },
        { value: 'puroks', label: 'Specific Puroks', color: 'purple' }
    ];

    const getStatusColor = (status: string) => {
        const option = statusOptions.find(o => o.value === status);
        return option?.color || 'gray';
    };

    const getAudienceColor = (audience: string) => {
        const option = audienceOptions.find(o => o.value === audience);
        return option?.color || 'gray';
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search banners by title, description, or button text... (Ctrl+F)"
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                                    onClick={() => handleSearch('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 rounded-xl transition-all"
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
                                    <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 rounded-full px-1.5 py-0 text-xs">
                                        +{activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                                onClick={exportData}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Info & Active Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700">{totalItems}</span>
                            <span className="ml-1">banners</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600">"{search}"</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {activeFilters && (
                                <>
                                    {currentStatus !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(currentStatus) === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                                            getStatusColor(currentStatus) === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            getStatusColor(currentStatus) === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-gray-100 text-gray-600 border-gray-200'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <CheckCircle className="h-3 w-3 mr-1 inline" />
                                            Status: {currentStatus === 'active' ? 'Active' : 
                                                     currentStatus === 'scheduled' ? 'Scheduled' :
                                                     currentStatus === 'expired' ? 'Expired' : 'Inactive'}
                                        </Badge>
                                    )}
                                    {currentAudience !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getAudienceColor(currentAudience) === 'blue' ? 'bg-blue-50 text-blue-700' :
                                            getAudienceColor(currentAudience) === 'green' ? 'bg-green-50 text-green-700' :
                                            getAudienceColor(currentAudience) === 'purple' ? 'bg-purple-50 text-purple-700' :
                                            'bg-gray-100 text-gray-600'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            Audience: {currentAudience === 'all' ? 'All Users' :
                                                       currentAudience === 'residents' ? 'All Residents' :
                                                       currentAudience === 'puroks' ? 'Specific Puroks' : currentAudience}
                                        </Badge>
                                    )}
                                    {filtersState.date_from && (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 rounded-full px-2.5 py-1 text-xs">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            From: {new Date(filtersState.date_from).toLocaleDateString()}
                                        </Badge>
                                    )}
                                    {filtersState.date_to && (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 rounded-full px-2.5 py-1 text-xs">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            To: {new Date(filtersState.date_to).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 h-7 px-2 rounded-lg hover:bg-red-50 text-xs"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={currentStatus}
                                onValueChange={handleStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 rounded-lg text-sm">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Audience Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Target Audience
                            </Label>
                            <Select
                                value={currentAudience}
                                onValueChange={handleAudienceFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 rounded-lg text-sm">
                                    <SelectValue placeholder="All Audiences" />
                                </SelectTrigger>
                                <SelectContent>
                                    {audienceOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Date Range Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        Start Date From
                                    </Label>
                                    <Input
                                        type="date"
                                        value={filtersState.date_from || ''}
                                        onChange={(e) => updateFilter('date_from', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-200"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-purple-500" />
                                        End Date To
                                    </Label>
                                    <Input
                                        type="date"
                                        value={filtersState.date_to || ''}
                                        onChange={(e) => updateFilter('date_to', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border-gray-200"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Image className="h-3 w-3" />
                                    Banner Information
                                </h4>
                                <div className="text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700">Search</span> - Searches by title, description, or button text</p>
                                    <p>• <span className="font-medium text-gray-700">Status</span> - Active, Scheduled, Expired, or Inactive banners</p>
                                    <p>• <span className="font-medium text-gray-700">Audience</span> - Filter by target audience (All, Residents, Puroks)</p>
                                    <p>• <span className="font-medium text-gray-700">Date Range</span> - Filter by start or end dates</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {isLoading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}