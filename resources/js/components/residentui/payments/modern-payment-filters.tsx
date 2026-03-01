import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, ChevronDown, CreditCard, Calendar, FileText, Printer, Share2 } from 'lucide-react';
import { ModernSelect } from '../modern-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernPaymentFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleSearchClear: () => void;
  paymentMethodFilter: string;
  handlePaymentMethodChange: (method: string) => void;
  yearFilter: string;
  handleYearChange: (year: string) => void;
  loading: boolean;
  availablePaymentMethods: Array<{ type: string; display_name: string }>;
  availableYears: number[];
  printPayments: () => void;
  exportToCSV: () => void;
  isExporting: boolean;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
  onCopySummary: () => void;
}

export const ModernPaymentFilters = ({
  search,
  setSearch,
  handleSearchSubmit,
  handleSearchClear,
  paymentMethodFilter,
  handlePaymentMethodChange,
  yearFilter,
  handleYearChange,
  loading,
  availablePaymentMethods,
  availableYears,
  printPayments,
  exportToCSV,
  isExporting,
  hasActiveFilters,
  handleClearFilters,
  onCopySummary,
}: ModernPaymentFiltersProps) => {
  const paymentMethodOptions = availablePaymentMethods.map(method => ({
    value: method.type,
    label: method.display_name
  }));

  const yearOptions = availableYears.map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

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
                placeholder="Search by OR#, purpose, reference..."
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <ModernSelect
              value={paymentMethodFilter}
              onValueChange={handlePaymentMethodChange}
              placeholder="All payment methods"
              options={paymentMethodOptions}
              disabled={loading}
              icon={CreditCard}
            />

            <ModernSelect
              value={yearFilter}
              onValueChange={handleYearChange}
              placeholder="All years"
              options={yearOptions}
              disabled={loading}
              icon={Calendar}
            />

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
                <DropdownMenuItem onClick={printPayments}>
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

            <Button onClick={printPayments} variant="outline" className="h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
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