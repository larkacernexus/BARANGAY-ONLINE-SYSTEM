// components/residentui/payments/modern-payment-filters.tsx
import { Search, Filter, X, Copy, Printer, Download, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernSelect } from '@/components/residentui/modern-select';
import { PaymentMethodType } from '@/types/portal/payments/payment.types';

interface ModernPaymentFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    paymentMethodFilter: string;
    handlePaymentMethodChange: (value: string) => void;
    yearFilter: string;
    handleYearChange: (value: string) => void;
    loading: boolean;
    availablePaymentMethods: PaymentMethodType[];
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
    onCopySummary
}: ModernPaymentFiltersProps) => {
    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by OR number, reference, or purpose..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={handleSearchClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </form>
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={printPayments}
                        className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        disabled={isExporting}
                        className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCopySummary}
                        className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Copy className="h-4 w-4" />
                        Copy Summary
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
                <div className="w-48">
                    <ModernSelect
                        value={paymentMethodFilter}
                        onValueChange={handlePaymentMethodChange}
                        placeholder="Payment method"
                        options={[
                            { value: 'all', label: 'All payment methods' },
                            ...availablePaymentMethods.map(method => ({
                                value: method.type,
                                label: method.display_name
                            }))
                        ]}
                        disabled={loading}
                        icon={CreditCard}
                    />
                </div>
                
                <div className="w-32">
                    <ModernSelect
                        value={yearFilter}
                        onValueChange={handleYearChange}
                        placeholder="Year"
                        options={[
                            { value: 'all', label: 'All years' },
                            ...availableYears.map(year => ({
                                value: year.toString(),
                                label: year.toString()
                            }))
                        ]}
                        disabled={loading}
                        icon={Calendar}
                    />
                </div>
            </div>
        </div>
    );
};