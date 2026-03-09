// resources/js/components/residentui/receipts/modern-receipt-filters.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, ChevronDown, FileText, Printer, Share2, Mail, Filter, Calendar, Receipt, CreditCard, Info, Badge } from 'lucide-react';
import { ModernSelect } from '../modern-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernReceiptFiltersProps {
  // Search
  search: string;
  setSearch: (value: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleSearchClear: () => void;
  
  // Date filters
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  
  // Select filters
  selectedType: string;
  setSelectedType: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (value: string) => void;
  
  // Loading state
  loading: boolean;
  
  // Options
  receiptTypes: Array<{ value: string; label: string }>;
  paymentMethods: Array<{ value: string; label: string }>;
  
  // Filter actions
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
  handleApplyFilters: () => void;
  
  // Export/Print actions
  onPrint: () => void;
  onExport: () => void;
  isExporting: boolean;
  onEmailSummary: () => void;
}

export const ModernReceiptFilters = ({
  search,
  setSearch,
  handleSearchSubmit,
  handleSearchClear,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  selectedType,
  setSelectedType,
  statusFilter,
  setStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  loading,
  receiptTypes,
  paymentMethods,
  hasActiveFilters,
  handleClearFilters,
  handleApplyFilters,
  onPrint,
  onExport,
  isExporting,
  onEmailSummary,
}: ModernReceiptFiltersProps) => {
  const receiptTypeOptions = [
    { value: 'all', label: 'All Types' },
    ...receiptTypes.map(type => ({
      value: type.value,
      label: type.label
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    ...paymentMethods.map(method => ({
      value: method.value,
      label: method.label
    }))
  ];

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
                placeholder="Search by receipt #, OR #, payer name..."
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
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {/* Date From */}
            <div className="md:col-span-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 rounded-xl border-gray-200 dark:border-gray-700"
                icon={Calendar}
                placeholder="From"
              />
            </div>

            {/* Date To */}
            <div className="md:col-span-1">
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 rounded-xl border-gray-200 dark:border-gray-700"
                icon={Calendar}
                placeholder="To"
              />
            </div>

            {/* Receipt Type Filter */}
            <div className="md:col-span-1">
              <ModernSelect
                value={selectedType}
                onValueChange={setSelectedType}
                placeholder="Type"
                options={receiptTypeOptions}
                disabled={loading}
                icon={Receipt}
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-1">
              <ModernSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Status"
                options={statusOptions}
                disabled={loading}
                icon={Info}
              />
            </div>

            {/* Payment Method Filter */}
            <div className="md:col-span-1">
              <ModernSelect
                value={paymentMethodFilter}
                onValueChange={setPaymentMethodFilter}
                placeholder="Method"
                options={paymentMethodOptions}
                disabled={loading}
                icon={CreditCard}
              />
            </div>

            {/* Apply Filters Button */}
            <div className="md:col-span-1">
              <Button
                onClick={handleApplyFilters}
                disabled={loading}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>

            {/* Actions Dropdown */}
            <div className="md:col-span-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full h-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onExport} disabled={isExporting}>
                    <FileText className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print List
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEmailSummary}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Summary
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

          {/* Filter Summary */}
          {(dateFrom || dateTo || selectedType !== 'all' || statusFilter !== 'all' || paymentMethodFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2">
              {dateFrom && (
                <Badge variant="secondary" className="px-2 py-1">
                  From: {new Date(dateFrom).toLocaleDateString()}
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="px-2 py-1">
                  To: {new Date(dateTo).toLocaleDateString()}
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="px-2 py-1">
                  Type: {receiptTypes.find(t => t.value === selectedType)?.label}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="px-2 py-1">
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Badge>
              )}
              {paymentMethodFilter !== 'all' && (
                <Badge variant="secondary" className="px-2 py-1">
                  Method: {paymentMethods.find(m => m.value === paymentMethodFilter)?.label}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};