import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, ChevronDown, FileText, Printer, Share2, Mail, Filter } from 'lucide-react';
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

interface ModernClearanceFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    clearanceTypeFilter: string;
    handleClearanceTypeChange: (type: string) => void;
    residentFilter: string;
    handleResidentChange: (resident: string) => void;
    urgencyFilter: string;
    handleUrgencyChange: (urgency: string) => void;
    yearFilter: string;
    handleYearChange: (year: string) => void;
    loading: boolean;
    availableClearanceTypes: Array<{ id: number; name: string }>;
    householdResidents: Array<{ id: number; first_name: string; last_name: string }>;
    availableYears: number[];
    printClearances: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    onCopySummary: () => void;
    onEmailSummary: () => void;
    currentResident?: { id: number; first_name: string; last_name: string };
    tabCounts?: Record<string, number>;
    statusFilter?: string;
}

const URGENCY_OPTIONS: FilterOption[] = [
    { value: 'all', label: 'All urgency' },
    { value: 'normal', label: 'Normal' },
    { value: 'rush', label: 'Rush' },
    { value: 'express', label: 'Express' },
];

export function ModernClearanceFilters({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    clearanceTypeFilter,
    handleClearanceTypeChange,
    residentFilter,
    handleResidentChange,
    urgencyFilter,
    handleUrgencyChange,
    yearFilter,
    handleYearChange,
    loading,
    availableClearanceTypes,
    householdResidents,
    availableYears,
    printClearances,
    exportToCSV,
    isExporting,
    hasActiveFilters,
    handleClearFilters,
    onCopySummary,
    onEmailSummary,
    currentResident,
    tabCounts,
    statusFilter = 'all',
}: ModernClearanceFiltersProps) {
    const clearanceTypeOptions: FilterOption[] = [
        { value: 'all', label: 'All types' },
        ...(availableClearanceTypes ?? []).map((type) => ({
            value: type.id.toString(),
            label: type.name,
        })),
    ];

    const residentOptions: FilterOption[] = (householdResidents ?? []).map((resident) => ({
        value: resident.id.toString(),
        label: `${resident.first_name} ${resident.last_name}${resident.id === currentResident?.id ? ' (You)' : ''}`,
    }));

    const yearOptions: FilterOption[] = [
        { value: 'all', label: 'All years' },
        ...(availableYears ?? []).map((year) => ({
            value: year.toString(),
            label: year.toString(),
        })),
    ];

    const formatTabLabel = (key: string): string => {
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search by reference, purpose, clearance type..."
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

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <ModernSelect
                            value={clearanceTypeFilter}
                            onValueChange={handleClearanceTypeChange}
                            placeholder="All types"
                            options={clearanceTypeOptions}
                            disabled={loading}
                            icon={FileText}
                        />

                        {householdResidents.length > 0 && (
                            <ModernSelect
                                value={residentFilter}
                                onValueChange={handleResidentChange}
                                placeholder="All residents"
                                options={[{ value: 'all', label: 'All residents' }, ...residentOptions]}
                                disabled={loading}
                                icon={Filter}
                            />
                        )}

                        <ModernSelect
                            value={urgencyFilter}
                            onValueChange={handleUrgencyChange}
                            placeholder="All urgency"
                            options={URGENCY_OPTIONS}
                            disabled={loading}
                        />

                        <ModernSelect
                            value={yearFilter}
                            onValueChange={handleYearChange}
                            placeholder="All years"
                            options={yearOptions}
                            disabled={loading}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    {isExporting ? 'Exporting...' : 'Export CSV'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={printClearances}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print List
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onCopySummary}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Copy Summary
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onEmailSummary}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email Summary
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {tabCounts && Object.keys(tabCounts).length > 0 && (
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
                                    <span className="capitalize font-medium">{formatTabLabel(key)}</span>
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