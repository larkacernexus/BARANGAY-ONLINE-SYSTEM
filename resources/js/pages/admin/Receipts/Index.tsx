// resources/js/pages/admin/Receipts/Index.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Receipt, Search, Filter, Download, Printer, Eye, Plus, FileText, X, Calendar } from 'lucide-react';
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';
import { route } from 'ziggy-js';

interface Receipt {
    id: number;
    receipt_number: string;
    payment_id: number | null;
    clearance_request_id: number | null;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    amount_paid: number;
    change_due: number;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    payment_method: string;
    payment_method_label: string;
    reference_number: string | null;
    payment_date: string;
    formatted_payment_date: string;
    issued_date: string;
    formatted_issued_date: string;
    issued_by: string;
    status: string;
    status_badge: string;
    is_voided: boolean;
    void_reason: string | null;
    printed_count: number;
    last_printed_at: string | null;
    fee_breakdown: Array<{
        fee_name: string;
        fee_code?: string;
        base_amount: number;
        total_amount: number;
    }>;
    notes: string | null;
}

interface Props {
    receipts: {
        data: Receipt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        receipt_type?: string;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    stats: {
        total: {
            count: number;
            amount: number;
            formatted_amount: string;
        };
        today: {
            count: number;
            amount: number;
            formatted_amount: string;
        };
        this_month: {
            count: number;
            amount: number;
            formatted_amount: string;
        };
        voided: number;
        by_method: Array<{
            method: string;
            method_label: string;
            count: number;
            total: number;
            formatted_total: string;
        }>;
        by_type: Array<{
            type: string;
            type_label: string;
            count: number;
        }>;
    };
    pendingClearances?: Array<{
        id: number;
        control_number: string;
        resident_name: string;
        clearance_type: string;
        fee: number;
        formatted_fee: string;
    }>;
    filterOptions: {
        payment_methods: Array<{ value: string; label: string }>;
        receipt_types: Array<{ value: string; label: string }>;
        status_options: Array<{ value: string; label: string }>;
    };
}

export default function ReceiptsIndex({ 
    receipts, 
    filters: initialFilters, 
    stats, 
    pendingClearances = [],
    filterOptions 
}: Props) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
    const [methodFilter, setMethodFilter] = useState(initialFilters.payment_method || '');
    const [typeFilter, setTypeFilter] = useState(initialFilters.receipt_type || '');
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef, // Use contentRef instead of content
        documentTitle: `receipt-${selectedReceipt?.receipt_number || 'document'}`,
        onAfterPrint: () => {
            setSelectedReceipt(null);
        },
    });

    // Apply filters
    const applyFilters = () => {
        router.get(route('receipts.index'), {
            search: search || undefined,
            status: statusFilter || undefined,
            payment_method: methodFilter || undefined,
            receipt_type: typeFilter || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    // Clear filters
    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setMethodFilter('');
        setTypeFilter('');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('receipts.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // View receipt
    const viewReceipt = (id: number) => {
        router.get(route('receipts.show', id));
    };

    // Print receipt
    const printReceipt = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
        // Small delay to ensure the printable component is rendered
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    // Void receipt
    const voidReceipt = (id: number, receiptNumber: string) => {
        const reason = prompt(`Enter reason for voiding receipt #${receiptNumber}:`);
        if (reason && reason.trim().length >= 10) {
            router.post(route('receipts.void', id), {
                void_reason: reason
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Optionally show success message
                },
            });
        } else if (reason) {
            alert('Void reason must be at least 10 characters long.');
        }
    };

    // Generate receipt from clearance
    const generateFromClearance = (clearanceId: number) => {
        router.post(route('receipts.generate-from-clearance', clearanceId), {
            receipt_type: 'clearance'
        }, {
            preserveScroll: true,
        });
    };

    // Check if filters are active
    const hasActiveFilters = !!(search || statusFilter || methodFilter || typeFilter || dateFrom || dateTo);

    // Handle page change
    const handlePageChange = (page: number) => {
        router.get(route('receipts.index'), {
            ...initialFilters,
            page
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle per page change
    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('receipts.index'), {
            ...initialFilters,
            per_page: e.target.value,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Receipts Management" />

            {/* Hidden Print Preview - Only render when a receipt is selected */}
            {selectedReceipt && (
                <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                    <PrintableReceipt 
                        ref={printRef} 
                        receipt={selectedReceipt}
                        copyType="original"
                    />
                </div>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Receipts Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and track official receipts
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('receipts.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Generate Receipt
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Receipts</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total.count}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.total.formatted_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.today.count}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.today.formatted_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Printer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.this_month.count}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.this_month.formatted_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <Receipt className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Voided</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.voided}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.total.count > 0 
                                        ? ((stats.voided / stats.total.count) * 100).toFixed(1) 
                                        : 0}% of total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Clearances Alert */}
                {pendingClearances.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-800 dark:text-amber-400">
                                    Pending Receipt Generation
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                    {pendingClearances.length} approved clearance(s) need receipts
                                </p>
                                <div className="mt-3 space-y-2">
                                    {pendingClearances.map((clearance) => (
                                        <div key={clearance.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {clearance.resident_name}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {clearance.clearance_type} • {clearance.control_number}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {clearance.formatted_fee}
                                                </span>
                                                <button
                                                    onClick={() => generateFromClearance(clearance.id)}
                                                    className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col gap-4">
                            {/* Basic Search */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="search"
                                        placeholder="Search by receipt #, OR #, payer name..."
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                >
                                    Search
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-flex items-center gap-2"
                                >
                                    <Filter className="h-5 w-5" />
                                    {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                                </button>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Status</option>
                                            {filterOptions.status_options.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            value={methodFilter}
                                            onChange={(e) => setMethodFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Methods</option>
                                            {filterOptions.payment_methods.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Receipt Type
                                        </label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Types</option>
                                            {filterOptions.receipt_types.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Per Page
                                        </label>
                                        <select
                                            value={initialFilters.per_page || 15}
                                            onChange={handlePerPageChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="15">15 per page</option>
                                            <option value="30">30 per page</option>
                                            <option value="50">50 per page</option>
                                            <option value="100">100 per page</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date Range
                                        </label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <div className="flex-1 relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active Filters and Actions */}
                            {hasActiveFilters && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Active filters:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            Clear all
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Receipts Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Receipt Details
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Payer Information
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Amount
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Payment Method
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Date & Status
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {receipts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                            <p className="text-lg font-medium">No receipts found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    Clear all filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    receipts.data.map((receipt) => (
                                        <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {receipt.receipt_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        OR: {receipt.or_number || '—'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        Type: {receipt.receipt_type_label}
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        Printed: {receipt.printed_count} time(s)
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {receipt.payer_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Issued by: {receipt.issued_by}
                                                </div>
                                                {receipt.payer_address && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {receipt.payer_address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {receipt.formatted_total}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Paid: {receipt.formatted_amount_paid}
                                                </div>
                                                {receipt.change_due > 0 && (
                                                    <div className="text-xs text-green-600 dark:text-green-400">
                                                        Change: {receipt.formatted_change}
                                                    </div>
                                                )}
                                                {receipt.discount > 0 && (
                                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                                        Discount: {receipt.formatted_discount}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {receipt.payment_method_label}
                                                </div>
                                                {receipt.reference_number && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Ref: {receipt.reference_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {receipt.formatted_issued_date}
                                                    </div>
                                                    <div dangerouslySetInnerHTML={{ __html: receipt.status_badge }} />
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => viewReceipt(receipt.id)}
                                                        title="View Receipt"
                                                        className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => printReceipt(receipt)}
                                                        title="Print Receipt"
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </button>
                                                    {!receipt.is_voided && (
                                                        <button
                                                            onClick={() => voidReceipt(receipt.id, receipt.receipt_number)}
                                                            title="Void Receipt"
                                                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                                                        >
                                                            Void
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {receipts.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {receipts.from} to {receipts.to} of {receipts.total} results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(receipts.current_page - 1)}
                                    disabled={receipts.current_page === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                {Array.from({ length: Math.min(5, receipts.last_page) }, (_, i) => {
                                    let pageNum;
                                    if (receipts.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (receipts.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (receipts.current_page >= receipts.last_page - 2) {
                                        pageNum = receipts.last_page - 4 + i;
                                    } else {
                                        pageNum = receipts.current_page - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                receipts.current_page === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => handlePageChange(receipts.current_page + 1)}
                                    disabled={receipts.current_page === receipts.last_page}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Method Breakdown */}
                {stats.by_method && stats.by_method.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Payment Method Breakdown
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {stats.by_method.map((method) => (
                                <div key={method.method} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {method.method_label}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {method.count} receipt(s)
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {method.formatted_total}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Receipt Type Breakdown */}
                {stats.by_type && stats.by_type.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Receipt Type Breakdown
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {stats.by_type.map((type) => (
                                <div key={type.type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {type.type_label}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {type.count} receipt(s)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href={route('receipts.create')}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Receipt className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Generate Receipt
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Create new official receipt
                            </span>
                        </Link>

                        <Link
                            href={route('admin.payments.index')}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                View Payments
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Go to payments management
                            </span>
                        </Link>

                        <Link
                            href={route('admin.clearances.index')}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/10 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/30 dark:hover:to-violet-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Clearance Requests
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                View pending clearances
                            </span>
                        </Link>

                        <button
                            onClick={() => router.post(route('receipts.export'), {
                                format: 'csv',
                                date_from: dateFrom,
                                date_to: dateTo,
                            })}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Export Reports
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Export receipt data
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}