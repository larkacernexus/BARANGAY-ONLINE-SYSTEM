import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Printer, Download, Loader2 } from 'lucide-react';

interface FilterspaymentSectionProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleSearchClear: () => void;
    paymentMethodFilter: string;
    handlePaymentMethodChange: (type: string) => void;
    yearFilter: string;
    handleYearChange: (year: string) => void;
    loading: boolean;
    availablePaymentMethods: Array<{
        type: string;
        display_name: string;
    }> | null;
    availableYears: number[] | null;
    printPayments: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    getCurrentTabPayments: () => any[]; // Changed from getCurrentTabFees
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    isMobile: boolean;
    setShowFilters?: (show: boolean) => void;
}

export function FilterspaymentSection({
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
    getCurrentTabPayments, // Changed from getCurrentTabFees
    hasActiveFilters,
    handleClearFilters,
    isMobile,
    setShowFilters
}: FilterspaymentSectionProps) {
    // Safely handle potentially undefined arrays
    const paymentMethods = availablePaymentMethods || [];
    const years = availableYears || [];
    
    return (
        <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
                <div className="space-y-4">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                                placeholder="Search by OR number, purpose, reference..." 
                                className="pl-10 pr-10 text-sm border-gray-300 dark:border-gray-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={loading}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleSearchClear}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="hidden">Search</button>
                    </form>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                            <Select value={paymentMethodFilter} onValueChange={handlePaymentMethodChange} disabled={loading}>
                                <SelectTrigger className="w-full text-sm border-gray-300 dark:border-gray-600">
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.type} value={method.type}>
                                            {method.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Year</label>
                            <Select value={yearFilter} onValueChange={handleYearChange} disabled={loading}>
                                <SelectTrigger className="w-full text-sm border-gray-300 dark:border-gray-600">
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Actions</label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={printPayments}
                                    className="flex-1"
                                    disabled={!getCurrentTabPayments().length} // Fixed here
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToCSV}
                                    disabled={isExporting || !getCurrentTabPayments().length} // Fixed here
                                    className="flex-1"
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                        {hasActiveFilters && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleClearFilters} 
                                disabled={loading}
                                className="text-xs"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                        {isMobile && setShowFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowFilters(false)}
                                className="text-xs"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}