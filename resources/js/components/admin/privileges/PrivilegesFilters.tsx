// resources/js/components/admin/privileges/PrivilegesFilters.tsx

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
    Shield,
    Fingerprint,
    Percent,
    Award,
    TrendingUp,
    Clock
} from 'lucide-react';
import { DiscountType, PrivilegeFilters } from '@/types/admin/privileges/privilege.types';

interface PrivilegesFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    onSearchChange?: (value: string) => void;
    filtersState: PrivilegeFilters;
    updateFilter: (key: keyof PrivilegeFilters, value: string) => void;
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
    discountTypes: DiscountType[];
    assignmentsRange?: string;
    setAssignmentsRange?: (value: string) => void;
    discountPercentageRange?: string;
    setDiscountPercentageRange?: (value: string) => void;
}

export default function PrivilegesFilters({
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
    discountTypes,
    assignmentsRange = '',
    setAssignmentsRange,
    discountPercentageRange = '',
    setDiscountPercentageRange
}: PrivilegesFiltersProps) {
    
    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleStatusFilter = (status: string) => {
        updateFilter('status', status);
    };

    const handleDiscountTypeFilter = (value: string) => {
        updateFilter('discount_type', value);
    };

    const handleRequiresVerificationFilter = (value: string) => {
        updateFilter('requires_verification', value);
    };

    const handleRequiresIdNumberFilter = (value: string) => {
        updateFilter('requires_id_number', value);
    };

    // Assignments range options
    const assignmentsRanges = [
        { value: '', label: 'All Privileges' },
        { value: '0', label: 'No Assignments (0)' },
        { value: '1-10', label: 'Low Usage (1-10)' },
        { value: '11-50', label: 'Moderate Usage (11-50)' },
        { value: '51-100', label: 'High Usage (51-100)' },
        { value: '100+', label: 'Very Popular (100+)' }
    ];

    // Discount percentage range options
    const discountPercentageRanges = [
        { value: '', label: 'All Discounts' },
        { value: '0-10', label: 'Low Discount (0-10%)' },
        { value: '11-25', label: 'Moderate Discount (11-25%)' },
        { value: '26-50', label: 'High Discount (26-50%)' },
        { value: '51-75', label: 'Very High Discount (51-75%)' },
        { value: '75+', label: 'Maximum Discount (75%+)' }
    ];

    const exportData = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filtersState.status && filtersState.status !== 'all') queryParams.append('status', filtersState.status);
        if (filtersState.discount_type && filtersState.discount_type !== 'all') queryParams.append('discount_type', filtersState.discount_type);
        if (filtersState.requires_verification && filtersState.requires_verification !== 'all') queryParams.append('requires_verification', filtersState.requires_verification);
        if (filtersState.requires_id_number && filtersState.requires_id_number !== 'all') queryParams.append('requires_id_number', filtersState.requires_id_number);
        if (assignmentsRange) queryParams.append('assignments_range', assignmentsRange);
        if (discountPercentageRange) queryParams.append('discount_percentage_range', discountPercentageRange);
        window.location.href = `/admin/privileges/export?${queryParams.toString()}`;
    };

    // Safe access to filter values with fallbacks
    const currentStatus = filtersState.status ?? 'all';
    const currentDiscountType = filtersState.discount_type ?? 'all';
    const currentRequiresVerification = filtersState.requires_verification ?? 'all';
    const currentRequiresIdNumber = filtersState.requires_id_number ?? 'all';

    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    // Helper to get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (currentStatus !== 'all') count++;
        if (currentDiscountType !== 'all') count++;
        if (assignmentsRange && assignmentsRange !== '') count++;
        if (discountPercentageRange && discountPercentageRange !== '') count++;
        if (currentRequiresVerification !== 'all') count++;
        if (currentRequiresIdNumber !== 'all') count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
            case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
            default: return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
        }
    };

    // Get discount type name
    const getDiscountTypeName = (id: string) => {
        const type = discountTypes.find(t => t.id.toString() === id);
        return type?.name || id;
    };

    // Get assignments range label
    const getAssignmentsRangeLabel = (value: string) => {
        const range = assignmentsRanges.find(r => r.value === value);
        return range?.label || value;
    };

    // Get discount percentage range label
    const getDiscountPercentageRangeLabel = (value: string) => {
        const range = discountPercentageRanges.find(r => r.value === value);
        return range?.label || value;
    };

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
                                placeholder="Search privileges by name, code, or description..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
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
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
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
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                            <span className="ml-1">privileges</span>
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
                                    {currentStatus !== 'all' && (
                                        <Badge variant="secondary" className={`${getStatusColor(currentStatus)} border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <Shield className="h-3 w-3 mr-1 inline" />
                                            Status: {currentStatus}
                                        </Badge>
                                    )}
                                    {currentDiscountType !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Percent className="h-3 w-3 mr-1 inline" />
                                            Type: {getDiscountTypeName(currentDiscountType)}
                                        </Badge>
                                    )}
                                    {assignmentsRange && assignmentsRange !== '' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Users className="h-3 w-3 mr-1 inline" />
                                            {getAssignmentsRangeLabel(assignmentsRange)}
                                        </Badge>
                                    )}
                                    {discountPercentageRange && discountPercentageRange !== '' && (
                                        <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <TrendingUp className="h-3 w-3 mr-1 inline" />
                                            {getDiscountPercentageRangeLabel(discountPercentageRange)}
                                        </Badge>
                                    )}
                                    {currentRequiresVerification !== 'all' && (
                                        <Badge variant="secondary" className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Fingerprint className="h-3 w-3 mr-1 inline" />
                                            {currentRequiresVerification === 'yes' ? 'Needs Verification' : 'No Verification'}
                                        </Badge>
                                    )}
                                    {currentRequiresIdNumber !== 'all' && (
                                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            Requires ID: {currentRequiresIdNumber === 'yes' ? 'Yes' : 'No'}
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
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Modern Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={currentStatus}
                                onValueChange={handleStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Discount Type Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount Type</Label>
                            <Select
                                value={currentDiscountType}
                                onValueChange={handleDiscountTypeFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {discountTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignments Range */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Assignments
                            </Label>
                            <Select
                                value={assignmentsRange}
                                onValueChange={(value) => setAssignmentsRange?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Privileges" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignmentsRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Discount % Range */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                Discount %
                            </Label>
                            <Select
                                value={discountPercentageRange}
                                onValueChange={(value) => setDiscountPercentageRange?.(value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Discounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    {discountPercentageRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            {range.label}
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Requires Verification */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Fingerprint className="h-4 w-4 text-indigo-500" />
                                        Requires Verification
                                    </Label>
                                    <Select
                                        value={currentRequiresVerification}
                                        onValueChange={handleRequiresVerificationFilter}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="yes">Requires Verification</SelectItem>
                                            <SelectItem value="no">No Verification</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {currentRequiresVerification === 'yes' && (
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                            Showing privileges that need approval
                                        </p>
                                    )}
                                </div>

                                {/* Requires ID Number */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-emerald-500" />
                                        Requires ID Number
                                    </Label>
                                    <Select
                                        value={currentRequiresIdNumber}
                                        onValueChange={handleRequiresIdNumberFilter}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="yes">Requires ID</SelectItem>
                                            <SelectItem value="no">No ID Required</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {currentRequiresIdNumber === 'yes' && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                            Privileges requiring ID validation
                                        </p>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-purple-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleRequiresVerificationFilter('yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Fingerprint className="h-3 w-3 mr-1" />
                                            Needs Verification
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                handleRequiresIdNumberFilter('yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Award className="h-3 w-3 mr-1" />
                                            Requires ID
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setAssignmentsRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <Users className="h-3 w-3 mr-1" />
                                            No Assignments
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setDiscountPercentageRange?.('75+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Highest Discounts
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section - Modern */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Award className="h-3 w-3" />
                                    Privilege Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Assignments</span> - Number of residents with this privilege</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Requires verification</span> - Privileges that need approval</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Requires ID number</span> - Privileges needing ID validation</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Discount %</span> - Comes from the linked Discount Type</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}