// resources/js/pages/resident/Receipts/Index.tsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ResidentAppLayout from '@/layouts/resident-app-layout';
import {
    Receipt,
    Search,
    Calendar,
    Download,
    Eye,
    Filter,
    X,
    ChevronDown,
    FileText,
    CreditCard,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { route } from 'ziggy-js';

interface ReceiptItem {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    formatted_total: string;
    formatted_amount_paid: string;
    payment_method: string;
    formatted_payment_date: string;
    formatted_issued_date: string;
    issued_by: string;
    status: string;
    status_badge: string;
    items_count: number;
    has_discount: boolean;
}

interface HouseholdData {
    id: number;
    household_number: string;
    head_name: string;
    address: string;
    contact_number: string | null;
    email: string | null;
    member_count: number;
    has_user_account: boolean;
}

interface StatsData {
    total_count: number;
    total_amount: string;
    this_month_count: number;
    this_month_amount: string;
    latest_receipt: string | null;
    clearance_count: number;
    fee_count: number;
    official_count: number;
}

interface Props {
    receipts: {
        data: ReceiptItem[];
        links: any[];
        meta: any;
    };
    household: HouseholdData;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        receipt_type?: string;
    };
    stats: StatsData;
    receiptTypes: Array<{ value: string; label: string }>;
}

export default function Index({ receipts, household, filters, stats, receiptTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedType, setSelectedType] = useState(filters.receipt_type || '');

    const handleSearch = () => {
        router.get(route('receipts.index'), {
            search: searchTerm,
            date_from: dateFrom,
            date_to: dateTo,
            receipt_type: selectedType,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setSelectedType('');
        router.get(route('receipts.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilters(false);
    };

    const handleViewReceipt = (id: number) => {
        router.get(route('resident.receipts.show', id));
    };

    const handleDownloadReceipt = (id: number) => {
        window.open(route('resident.receipts.download', id), '_blank');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'partial':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getReceiptTypeIcon = (type: string) => {
        switch (type) {
            case 'clearance':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'fee':
                return <CreditCard className="h-4 w-4 text-purple-500" />;
            default:
                return <Receipt className="h-4 w-4 text-green-500" />;
        }
    };

    return (
        <ResidentAppLayout>
            <Head title="My Receipts" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            My Receipts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and download your payment receipts
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {(filters.search || filters.date_from || filters.date_to || filters.receipt_type) && (
                                <span className="ml-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receipts</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total_count}
                                </p>
                            </div>
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                <Receipt className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Total Amount: {stats.total_amount}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.this_month_count}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Amount: {stats.this_month_amount}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clearances</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.clearance_count}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Clearance receipts
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Latest</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]">
                                    {stats.latest_receipt || '—'}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Most recent receipt
                        </p>
                    </div>
                </div>

                {/* Household Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <Receipt className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {household.head_name}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {household.household_number} • {household.address}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{household.contact_number || 'No contact'}</span>
                                    <span>•</span>
                                    <span>{household.member_count} members</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Email:</span> {household.email || 'Not provided'}
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Filter Receipts</h3>
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                            >
                                <X className="h-4 w-4" />
                                Clear all
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Receipt #, OR #, Name..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Receipt Type
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Types</option>
                                    {receiptTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Receipts List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Receipt #
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        OR Number
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="py-3 px-6 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="py-3 px-6 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {receipts.data.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {getReceiptTypeIcon(receipt.receipt_type)}
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {receipt.receipt_number}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {receipt.receipt_type_label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {receipt.or_number || '—'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm">
                                                <div className="text-gray-900 dark:text-white">
                                                    {receipt.formatted_payment_date}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Issued: {receipt.formatted_issued_date}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {receipt.formatted_total}
                                            </div>
                                            {receipt.has_discount && (
                                                <div className="text-xs text-green-600 dark:text-green-400">
                                                    w/ discount
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {receipt.payment_method}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(receipt.status)}
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {receipt.status === 'paid' ? 'Paid' : 
                                                     receipt.status === 'partial' ? 'Partial' : 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewReceipt(receipt.id)}
                                                    className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="View Receipt"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReceipt(receipt.id)}
                                                    className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {receipts.data.length === 0 && (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No receipts found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {filters.search || filters.date_from || filters.date_to || filters.receipt_type
                                    ? 'Try adjusting your filters'
                                    : 'You don\'t have any receipts yet'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {receipts.meta && receipts.meta.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {receipts.meta.from} to {receipts.meta.to} of {receipts.meta.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    {receipts.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => router.get(link.url)}
                                            disabled={!link.url || link.active}
                                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                link.active
                                                    ? 'bg-primary-600 text-white'
                                                    : link.url
                                                    ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ResidentAppLayout>
    );
}