import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link } from '@inertiajs/react';
import { Receipt, Search, Filter, Download, Printer, Eye, Plus, FileText } from 'lucide-react';
import { useState } from 'react';

export default function ReceiptsIndex() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock data - replace with real data from backend
    const receipts = [
        {
            id: 1,
            receipt_number: 'OR-2024-001',
            fee_code: 'CLR-2024-001',
            payer_name: 'Juan Dela Cruz',
            amount: 1500,
            payment_date: '2024-01-15',
            issued_by: 'Admin User',
            status: 'issued',
            print_count: 1
        },
        {
            id: 2,
            receipt_number: 'OR-2024-002',
            fee_code: 'CERT-2024-005',
            payer_name: 'Maria Santos',
            amount: 800,
            payment_date: '2024-01-15',
            issued_by: 'Admin User',
            status: 'issued',
            print_count: 2
        },
        {
            id: 3,
            receipt_number: 'OR-2024-003',
            fee_code: 'TAX-2024-012',
            payer_name: 'Pedro Reyes',
            amount: 2500,
            payment_date: '2024-01-14',
            issued_by: 'Staff User',
            status: 'voided',
            print_count: 1
        },
    ];

    const stats = {
        totalReceipts: 245,
        totalAmount: 185500,
        todayIssued: 12,
        voided: 3
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title="Receipts Management" />

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
                            href="/receipts/generate"
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
                                    {stats.totalReceipts}
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(stats.totalAmount)}
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today Issued</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.todayIssued}
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative flex-1 max-w-lg">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search by receipt number, payer name..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="issued">Issued</option>
                                <option value="voided">Voided</option>
                                <option value="reprinted">Reprinted</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                                <Filter className="h-4 w-4" />
                                More Filters
                            </button>
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Receipts Table */}
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
                                        Date & Status
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {receipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {receipt.receipt_number}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Fee: {receipt.fee_code}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    Printed: {receipt.print_count} time(s)
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
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-lg text-gray-900 dark:text-white">
                                                {formatCurrency(receipt.amount)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(receipt.payment_date)}
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    receipt.status === 'issued'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {receipt.status === 'issued' ? 'Issued' : 'Voided'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    title="View Receipt"
                                                    className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    title="Print Receipt"
                                                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                                {receipt.status === 'issued' && (
                                                    <button
                                                        title="Void Receipt"
                                                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    >
                                                        Void
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing 1 to {receipts.length} of {receipts.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
                                Previous
                            </button>
                            <button className="px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg">
                                1
                            </button>
                            <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                2
                            </button>
                            <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href="/receipts/generate"
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

                        <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/20 transition-all group">
                            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Printer className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Bulk Print
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Print multiple receipts
                            </span>
                        </button>

                        <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/10 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/30 dark:hover:to-violet-900/20 transition-all group">
                            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Receipt Series
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Manage receipt number series
                            </span>
                        </button>

                        <button className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/20 transition-all group">
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