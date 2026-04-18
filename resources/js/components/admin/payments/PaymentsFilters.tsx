import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Search, 
    Filter, 
    Download, 
    X, 
    FilterX, 
    Layers,
    Rows,
    Hash,
    RotateCcw,
    Calendar,
    CreditCard,
    Users,
    AlertCircle,
    TrendingUp,
    Wallet,
    FileText
} from 'lucide-react';
import { RefObject } from 'react';

interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface PayerTypeOption {
    value: string;
    label: string;
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number;
}

interface PaymentsFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    methodFilter: string;
    setMethodFilter: (value: string) => void;
    payerTypeFilter: string;
    setPayerTypeFilter: (value: string) => void;
    clearanceTypeFilter?: string;
    setClearanceTypeFilter?: (value: string) => void;
    dateFrom: string;
    setDateFrom: (value: string) => void;
    dateTo: string;
    setDateTo: (value: string) => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (value: boolean) => void;
    handleClearFilters: () => void;
    handleExport: () => void;
    hasActiveFilters: boolean;
    isLoading: boolean;
    paymentMethods: PaymentMethod[];
    statusOptions: StatusOption[];
    payerTypeOptions: PayerTypeOption[];
    clearanceTypes?: ClearanceType[];
    searchInputRef: RefObject<HTMLInputElement | null>;
    payments: {
        meta: {
            current_page: number;
            from: number;
            to: number;
            total: number;
            per_page: number;
            last_page: number;
        };
    };
    isBulkMode: boolean;
    selectedPayments: number[];
    handleSelectAllOnPage: () => void;
    handleSelectAllFiltered: () => void;
    handleSelectAll: () => void;
    selectionRef?: RefObject<HTMLDivElement | null>;
    showSelectionOptions?: boolean;
    setShowSelectionOptions?: (value: boolean) => void;
    setSelectedPayments: (value: number[] | ((prev: number[]) => number[])) => void;
}

export default function PaymentsFilters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    payerTypeFilter,
    setPayerTypeFilter,
    clearanceTypeFilter = 'all',
    setClearanceTypeFilter = () => {},
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    showAdvancedFilters,
    setShowAdvancedFilters,
    handleClearFilters,
    handleExport,
    hasActiveFilters,
    isLoading,
    paymentMethods,
    statusOptions,
    payerTypeOptions,
    clearanceTypes = [],
    searchInputRef,
    payments,
    isBulkMode,
    selectedPayments,
    handleSelectAllOnPage,
    handleSelectAllFiltered,
    handleSelectAll,
    selectionRef = { current: null },
    showSelectionOptions = false,
    setShowSelectionOptions = () => {},
    setSelectedPayments
}: PaymentsFiltersProps) {
    
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);

    const getActiveFilterCount = () => {
        let count = 0;
        if (statusFilter && statusFilter !== 'all') count++;
        if (methodFilter && methodFilter !== 'all') count++;
        if (payerTypeFilter && payerTypeFilter !== 'all') count++;
        if (clearanceTypeFilter && clearanceTypeFilter !== 'all') count++;
        if (dateFrom) count++;
        if (dateTo) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'emerald';
            case 'pending': return 'amber';
            case 'failed': return 'red';
            case 'refunded': return 'purple';
            default: return 'gray';
        }
    };

    const getStatusLabel = (value: string) => {
        const option = statusOptions.find(o => o.value === value);
        return option?.label || value;
    };

    const getMethodLabel = (value: string) => {
        const method = paymentMethods.find(m => m.value === value);
        return method?.label || value;
    };

    const getPayerTypeLabel = (value: string) => {
        const type = payerTypeOptions.find(t => t.value === value);
        return type?.label || value;
    };

    const getClearanceTypeLabel = (value: string) => {
        const type = clearanceTypes.find(t => t.id.toString() === value);
        return type?.name || value;
    };

    const getPayerTypeIcon = (value: string) => {
        if (value === 'resident') return '👤';
        if (value === 'business') return '🏢';
        if (value === 'household') return '🏠';
        return '👥';
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
            <CardContent className="p-5 md:p-6">
                <div className="flex flex-col space-y-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search by OR number, payer name, reference number, or transaction ID..."
                                className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={isLoading}
                            />
                            {search && !isLoading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                disabled={isLoading}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">
                                    {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                </span>
                                <span className="sm:hidden">
                                    {showAdvancedFilters ? 'Hide' : 'Filters'}
                                </span>
                                {!showAdvancedFilters && activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0 text-xs">
                                        +{activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline font-medium">Export</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{payments.meta?.from || 1}-{payments.meta?.to || 0}</span>
                            <span className="mx-1">of</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{payments.meta?.total || 0}</span>
                            <span className="ml-1">payments</span>
                            {search && (
                                <span className="ml-1">
                                    matching <span className="font-medium text-indigo-600 dark:text-indigo-400">"{search}"</span>
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {activeFilters && (
                                <>
                                    {statusFilter && statusFilter !== 'all' && (
                                        <Badge variant="secondary" className={`${
                                            getStatusColor(statusFilter) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            getStatusColor(statusFilter) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                            getStatusColor(statusFilter) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                            <AlertCircle className="h-3 w-3 mr-1 inline" />
                                            {getStatusLabel(statusFilter)}
                                        </Badge>
                                    )}
                                    {methodFilter && methodFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <CreditCard className="h-3 w-3 mr-1 inline" />
                                            {getMethodLabel(methodFilter)}
                                        </Badge>
                                    )}
                                    {payerTypeFilter && payerTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <span className="mr-1">{getPayerTypeIcon(payerTypeFilter)}</span>
                                            {getPayerTypeLabel(payerTypeFilter)}
                                        </Badge>
                                    )}
                                    {clearanceTypeFilter && clearanceTypeFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <FileText className="h-3 w-3 mr-1 inline" />
                                            {getClearanceTypeLabel(clearanceTypeFilter)}
                                        </Badge>
                                    )}
                                    {(dateFrom || dateTo) && (
                                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                            <Calendar className="h-3 w-3 mr-1 inline" />
                                            {dateFrom && dateTo 
                                                ? `${dateFrom} → ${dateTo}`
                                                : dateFrom 
                                                    ? `From ${dateFrom}`
                                                    : `Until ${dateTo}`}
                                        </Badge>
                                    )}
                                </>
                            )}
                            
                            {activeFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                >
                                    <FilterX className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                            {isBulkMode && selectedPayments.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                    <Layers className="h-3 w-3 mr-1 inline" />
                                    {selectedPayments.length} selected
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedPayments([])}
                                        className="h-5 px-1 ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {isBulkMode && (
                                <div className="relative" ref={selectionRef}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                        disabled={isLoading}
                                        className="h-8 px-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-xs"
                                    >
                                        <Layers className="h-3.5 w-3.5 mr-1" />
                                        Select
                                    </Button>
                                    
                                    {showSelectionOptions && (
                                        <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                                            <div className="p-2">
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1.5 uppercase tracking-wider">
                                                    SELECTION OPTIONS
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    onClick={handleSelectAllOnPage}
                                                >
                                                    <Rows className="h-3.5 w-3.5 mr-2" />
                                                    Current Page
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    onClick={handleSelectAllFiltered}
                                                >
                                                    <Filter className="h-3.5 w-3.5 mr-2" />
                                                    All Filtered
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    onClick={handleSelectAll}
                                                >
                                                    <Hash className="h-3.5 w-3.5 mr-2" />
                                                    All ({payments.meta?.total || 0})
                                                </Button>
                                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                                                    onClick={() => {
                                                        setSelectedPayments([]);
                                                        setShowSelectionOptions(false);
                                                    }}
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Status
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                Payment Method
                            </Label>
                            <Select
                                value={methodFilter}
                                onValueChange={setMethodFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Payer Type
                            </Label>
                            <Select
                                value={payerTypeFilter}
                                onValueChange={setPayerTypeFilter}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {payerTypeOptions.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <span className="flex items-center gap-2">
                                                <span>{getPayerTypeIcon(type.value)}</span>
                                                {type.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {clearanceTypes.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Clearance Type
                                </Label>
                                <Select
                                    value={clearanceTypeFilter}
                                    onValueChange={setClearanceTypeFilter}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Clearance Types</SelectItem>
                                        {clearanceTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Advanced Filters</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        Date Range (Payment Date)
                                    </Label>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">From</Label>
                                            <Input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">To</Label>
                                            <Input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                setDateFrom(firstDay.toISOString().split('T')[0]);
                                                setDateTo(today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            This Month
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                const today = new Date();
                                                const thirtyDaysAgo = new Date(today);
                                                thirtyDaysAgo.setDate(today.getDate() - 30);
                                                setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
                                                setDateTo(today.toISOString().split('T')[0]);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Last 30 Days
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7 rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => {
                                                setDateFrom('');
                                                setDateTo('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        Quick Actions
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setStatusFilter('completed')}
                                            disabled={isLoading}
                                        >
                                            <Wallet className="h-3 w-3 mr-1" />
                                            Completed Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setStatusFilter('pending')}
                                            disabled={isLoading}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Pending Only
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setMethodFilter('cash')}
                                            disabled={isLoading}
                                        >
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            Cash Payments
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                            onClick={() => setPayerTypeFilter('business')}
                                            disabled={isLoading}
                                        >
                                            <span className="mr-1">🏢</span>
                                            Business Only
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Wallet className="h-3 w-3" />
                                    Payment Information
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Search</span> - Searches by OR number, payer name, reference number, transaction ID</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Status</span> - Completed, pending, failed, or refunded payments</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Payment Method</span> - Cash, bank transfer, GCash, PayMaya, etc.</p>
                                    <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Payer Type</span> - Resident, Business, or Household</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {isLoading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading payments...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}