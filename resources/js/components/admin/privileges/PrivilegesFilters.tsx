// resources/js/components/admin/privileges/PrivilegesFilters.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Search,
    Filter,
    Download,
    FilterX,
    X,
    Users,
    Shield,
    Fingerprint,
    Percent
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
                                placeholder="Search privileges by name, code, or description..."
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSearch('')}
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
                                disabled={isLoading}
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
                                onClick={exportData}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Info and Clear Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} privileges
                            {search && ` matching "${search}"`}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    disabled={isLoading}
                                >
                                    <FilterX className="h-3.5 w-3.5 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Basic Filters - Status + Discount Type + Assignments Range + Discount % Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Status
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentStatus}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Discount Type</Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentDiscountType}
                                onChange={(e) => handleDiscountTypeFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Types</option>
                                {discountTypes.map((type) => (
                                    <option key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Assignments
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={assignmentsRange}
                                onChange={(e) => setAssignmentsRange?.(e.target.value)}
                                disabled={isLoading}
                            >
                                {assignmentsRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                Discount %
                            </Label>
                            <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={discountPercentageRange}
                                onChange={(e) => setDiscountPercentageRange?.(e.target.value)}
                                disabled={isLoading}
                            >
                                {discountPercentageRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
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
                                {/* Requires Verification */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Fingerprint className="h-3 w-3" />
                                        Requires Verification
                                    </Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={currentRequiresVerification}
                                        onChange={(e) => handleRequiresVerificationFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All</option>
                                        <option value="yes">Requires Verification</option>
                                        <option value="no">No Verification</option>
                                    </select>
                                </div>

                                {/* Requires ID Number */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires ID Number</Label>
                                    <select
                                        className="w-full border rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        value={currentRequiresIdNumber}
                                        onChange={(e) => handleRequiresIdNumberFilter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="all">All</option>
                                        <option value="yes">Requires ID</option>
                                        <option value="no">No ID Required</option>
                                    </select>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleRequiresVerificationFilter('yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Needs Verification
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                handleRequiresIdNumberFilter('yes');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Requires ID
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setAssignmentsRange?.('0');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            No Assignments
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setDiscountPercentageRange?.('75+');
                                                setShowAdvancedFilters(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Highest Discounts
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Information Section */}
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Information</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <p>• <span className="font-medium">Assignments</span> - Number of residents with this privilege</p>
                                    <p>• <span className="font-medium">Requires verification</span> - Privileges that need approval</p>
                                    <p>• <span className="font-medium">Requires ID number</span> - Privileges needing ID validation</p>
                                    <p>• <span className="font-medium">Discount %</span> - Comes from the linked Discount Type</p>
                                    <p>• Use the table header to sort by any column</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}