import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, ChevronDown, FileText, Printer, Share2, Filter } from 'lucide-react';
import { ModernSelect } from '../modern-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernReportFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    statusFilter: string;
    handleStatusChange: (status: string) => void;
    urgencyFilter: string;
    handleUrgencyChange: (urgency: string) => void;
    typeFilter: string;
    handleTypeChange: (type: string) => void;
    categoryFilter: string;
    handleCategoryChange: (category: string) => void;
    loading: boolean;
    filterOptions: {
        reportTypes: any[];
        categories: string[];
    };
    printReports: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    onCopySummary: () => void;
}

export const ModernReportFilters = ({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    statusFilter,
    handleStatusChange,
    urgencyFilter,
    handleUrgencyChange,
    typeFilter,
    handleTypeChange,
    categoryFilter,
    handleCategoryChange,
    loading,
    filterOptions,
    printReports,
    exportToCSV,
    isExporting,
    hasActiveFilters,
    handleClearFilters,
    onCopySummary,
}: ModernReportFiltersProps) => {
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const urgencyOptions = [
        { value: 'all', label: 'All Urgency' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    const categoryOptions = filterOptions?.categories?.map(cat => ({
        value: cat,
        label: cat
    })) || [];

    const typeOptions = filterOptions?.reportTypes?.map(type => ({
        value: type.id.toString(),
        label: type.name
    })) || [];

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search by report number, title, description..."
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

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <ModernSelect
                            value={statusFilter}
                            onValueChange={handleStatusChange}
                            placeholder="All status"
                            options={statusOptions}
                            disabled={loading}
                            icon={Filter}
                        />

                        <ModernSelect
                            value={urgencyFilter}
                            onValueChange={handleUrgencyChange}
                            placeholder="All urgency"
                            options={urgencyOptions}
                            disabled={loading}
                        />

                        {categoryOptions.length > 0 && (
                            <ModernSelect
                                value={categoryFilter}
                                onValueChange={handleCategoryChange}
                                placeholder="All categories"
                                options={[{ value: 'all', label: 'All Categories' }, ...categoryOptions]}
                                disabled={loading}
                            />
                        )}

                        {typeOptions.length > 0 && (
                            <ModernSelect
                                value={typeFilter}
                                onValueChange={handleTypeChange}
                                placeholder="All types"
                                options={[{ value: 'all', label: 'All Types' }, ...typeOptions]}
                                disabled={loading}
                            />
                        )}

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
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
                                <DropdownMenuItem onClick={printReports}>
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

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <div className="overflow-hidden">
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
};