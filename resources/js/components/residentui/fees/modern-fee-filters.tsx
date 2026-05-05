import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, DownloadCloud, ChevronDown, Receipt, User, Calendar, FileText, Printer, Share2 } from 'lucide-react';
import { ModernSelect } from '../modern-select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterOption {
    value: string;
    label: string;
}

interface TabCounts {
    all: number;
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
}

interface ModernFeeFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    feeTypeFilter: string;
    handleFeeTypeChange: (type: string) => void;
    residentFilter: string;
    handleResidentChange: (resident: string) => void;
    yearFilter: string;
    handleYearChange: (year: string) => void;
    loading: boolean;
    availableFeeTypes: Array<{ id: number; name: string }>;
    availableYears: number[];
    householdResidents: Array<{ id: number; first_name: string; last_name: string }>;
    printFees: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    tabCounts?: TabCounts;
    statusFilter?: string;
    onCopySummary?: () => void;
}

export function ModernFeeFilters({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    feeTypeFilter,
    handleFeeTypeChange,
    residentFilter,
    handleResidentChange,
    yearFilter,
    handleYearChange,
    loading,
    availableFeeTypes,
    availableYears,
    householdResidents,
    printFees,
    exportToCSV,
    isExporting,
    hasActiveFilters,
    handleClearFilters,
    tabCounts,
    statusFilter = 'all',
    onCopySummary,
}: ModernFeeFiltersProps) {
    const feeTypeOptions: FilterOption[] = (availableFeeTypes ?? []).map((type) => ({
        value: type.id.toString(),
        label: type.name,
    }));

    const residentOptions: FilterOption[] = (householdResidents ?? []).map((resident) => ({
        value: resident.id.toString(),
        label: `${resident.first_name} ${resident.last_name}`,
    }));

    const yearOptions: FilterOption[] = (availableYears ?? []).map((year) => ({
        value: year.toString(),
        label: year.toString(),
    }));

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search by fee code, purpose..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleSearchClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <ModernSelect
                            value={feeTypeFilter}
                            onValueChange={handleFeeTypeChange}
                            placeholder="All fee types"
                            options={feeTypeOptions}
                            disabled={loading}
                            icon={Receipt}
                        />

                        {householdResidents.length > 0 && (
                            <ModernSelect
                                value={residentFilter}
                                onValueChange={handleResidentChange}
                                placeholder="All residents"
                                options={residentOptions}
                                disabled={loading}
                                icon={User}
                            />
                        )}

                        <ModernSelect
                            value={yearFilter}
                            onValueChange={handleYearChange}
                            placeholder="All years"
                            options={yearOptions}
                            disabled={loading}
                            icon={Calendar}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    <DownloadCloud className="h-4 w-4 mr-2" />
                                    Export
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    {isExporting ? 'Exporting...' : 'Export CSV'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={printFees}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print List
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onCopySummary}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Copy Summary
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {tabCounts && (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(tabCounts).map(([key, count]) => (
                                <div
                                    key={key}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                        statusFilter === key || (statusFilter === 'all' && key === 'all')
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    <span className="capitalize font-medium">
                                        {key.replace('_', ' ')}
                                    </span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasActiveFilters && (
                        <div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Filters are active
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-8 px-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear all
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}