import { Search, X, Filter, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernSelect } from '@/components/residentui/modern-select';

interface TabCounts {
    all: number;
    paid: number;
    partial: number;
    pending: number;
    cancelled: number;
}

interface FilterOption {
    value: string;
    label: string;
}

interface ModernReceiptFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    receiptTypeFilter: string;
    handleReceiptTypeChange: (type: string) => void;
    paymentMethodFilter: string;
    handlePaymentMethodChange: (method: string) => void;
    loading: boolean;
    receiptTypes: Array<{ value: string; label: string }>;
    paymentMethods: Array<{ value: string; label: string }>;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    onPrint: () => void;
    onExport: () => void;
    isExporting: boolean;
    tabCounts?: TabCounts;
    statusFilter?: string;
}

export function ModernReceiptFilters({
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    receiptTypeFilter,
    handleReceiptTypeChange,
    paymentMethodFilter,
    handlePaymentMethodChange,
    loading,
    receiptTypes,
    paymentMethods,
    hasActiveFilters,
    handleClearFilters,
    onPrint,
    onExport,
    isExporting,
    tabCounts,
    statusFilter = 'all',
}: ModernReceiptFiltersProps) {
    const receiptTypeOptions: FilterOption[] = [
        { value: 'all', label: 'All receipt types' },
        ...(receiptTypes ?? []),
    ];

    const paymentMethodOptions: FilterOption[] = [
        { value: 'all', label: 'All payment methods' },
        ...(paymentMethods ?? []),
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by receipt number, OR number, or payer name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 bg-white dark:bg-gray-800"
                            disabled={loading}
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
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onPrint} className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExport}
                        disabled={isExporting}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="w-40">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="From"
                        className="bg-white dark:bg-gray-800"
                        disabled={loading}
                    />
                </div>
                <div className="w-40">
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To"
                        className="bg-white dark:bg-gray-800"
                        disabled={loading}
                    />
                </div>

                <div className="w-48">
                    <ModernSelect
                        value={receiptTypeFilter}
                        onValueChange={handleReceiptTypeChange}
                        placeholder="All receipt types"
                        options={receiptTypeOptions}
                        disabled={loading}
                    />
                </div>

                <div className="w-48">
                    <ModernSelect
                        value={paymentMethodFilter}
                        onValueChange={handlePaymentMethodChange}
                        placeholder="All payment methods"
                        options={paymentMethodOptions}
                        disabled={loading}
                    />
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
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
                            <span className="capitalize font-medium">{key}</span>
                            <span className="font-bold">{count}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}