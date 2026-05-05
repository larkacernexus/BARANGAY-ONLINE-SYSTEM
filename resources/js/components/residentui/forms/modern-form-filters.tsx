import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, ChevronDown, FileText, Printer, Share2, Mail, ArrowUpDown, Tag, Building } from 'lucide-react';
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

interface ModernFormFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    categoryFilter: string;
    handleCategoryChange: (category: string) => void;
    agencyFilter: string;
    handleAgencyChange: (agency: string) => void;
    sortBy: string;
    handleSortChange: (sort: string) => void;
    sortOrder: string;
    handleSortOrderToggle: () => void;
    loading: boolean;
    categories: string[];
    agencies: string[];
    sortOptions: Array<{ value: string; label: string }>;
    printForms: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    onCopySummary: () => void;
    onEmailSummary: () => void;
}

export function ModernFormFilters({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    categoryFilter,
    handleCategoryChange,
    agencyFilter,
    handleAgencyChange,
    sortBy,
    handleSortChange,
    sortOrder,
    handleSortOrderToggle,
    loading,
    categories,
    agencies,
    sortOptions,
    printForms,
    exportToCSV,
    isExporting,
    hasActiveFilters,
    handleClearFilters,
    onCopySummary,
    onEmailSummary,
}: ModernFormFiltersProps) {
    const categoryOptions: FilterOption[] = [
        { value: 'all', label: 'All categories' },
        ...(categories ?? []).map((category) => ({
            value: category,
            label: category,
        })),
    ];

    const agencyOptions: FilterOption[] = [
        { value: 'all', label: 'All agencies' },
        ...(agencies ?? []).map((agency) => ({
            value: agency,
            label: agency,
        })),
    ];

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search by title, description, category, or agency..."
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
                            value={categoryFilter}
                            onValueChange={handleCategoryChange}
                            placeholder="All categories"
                            options={categoryOptions}
                            disabled={loading}
                            icon={Tag}
                        />

                        <ModernSelect
                            value={agencyFilter}
                            onValueChange={handleAgencyChange}
                            placeholder="All agencies"
                            options={agencyOptions}
                            disabled={loading}
                            icon={Building}
                        />

                        <ModernSelect
                            value={sortBy}
                            onValueChange={handleSortChange}
                            placeholder="Sort by"
                            options={sortOptions}
                            disabled={loading}
                            icon={ArrowUpDown}
                        />

                        <Button
                            variant="outline"
                            onClick={handleSortOrderToggle}
                            className="h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                            {sortOrder === 'asc' ? (
                                <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
                            ) : (
                                <ChevronDown className="h-4 w-4 mr-2" />
                            )}
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>

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
                                <DropdownMenuItem onClick={printForms}>
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