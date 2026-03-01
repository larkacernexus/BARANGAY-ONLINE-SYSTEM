// resources/js/pages/resident/Receipts/Show.tsx

import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ResidentAppLayout from '@/layouts/resident-app-layout';
import {
    Receipt,
    ArrowLeft,
    Download,
    Printer,
    Calendar,
    User,
    CreditCard,
    FileText,
    Hash,
    CheckCircle,
    AlertTriangle,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface ReceiptItem {
    name: string;
    amount: string;
    category: string;
}

interface ReceiptData {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    total_amount: number;
    amount_paid: number;
    change_due: number;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    payment_method: string;
    payment_date: string;
    formatted_payment_date: string;
    issued_date: string;
    formatted_issued_date: string;
    issued_by: string;
    items_count: number;
    items: ReceiptItem[];
    has_discount: boolean;
    discount_amount: number;
    formatted_discount: string;
    status: string;
    status_badge: string;
    notes: string | null;
    created_at: string;
}

interface Props {
    receipt: ReceiptData;
}

export default function Show({ receipt }: Props) {
    const handleDownload = () => {
        window.open(route('resident.receipts.download', receipt.id), '_blank');
    };

    const handlePrint = () => {
        router.post(route('resident.receipts.print', receipt.id), {}, {
            preserveScroll: true,
        });
    };

    const getStatusIcon = () => {
        switch (receipt.status) {
            case 'paid':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'partial':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'voided':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Receipt className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = () => {
        switch (receipt.status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800';
            case 'voided':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ResidentAppLayout>
            <Head title={`Receipt #${receipt.receipt_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('resident.receipts.index')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    Receipt #{receipt.receipt_number}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                                    {receipt.status === 'paid' ? 'Paid' : 
                                     receipt.status === 'partial' ? 'Partial' : 
                                     receipt.status === 'voided' ? 'Voided' : 'Pending'}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {receipt.receipt_type_label} • Issued on {receipt.formatted_issued_date}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Receipt Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Receipt Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Receipt Details
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Number</p>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {receipt.receipt_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">OR Number</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {receipt.or_number || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Receipt className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Type</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {receipt.receipt_type_label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Date</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {receipt.formatted_payment_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued By</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {receipt.issued_by}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {receipt.payment_method}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {receipt.notes && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</p>
                                        <p className="text-gray-900 dark:text-white">{receipt.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Items Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Items ({receipt.items_count})
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {receipt.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {item.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Payer Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Payer Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {receipt.payer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Number</p>
                                        <p className="text-base text-gray-900 dark:text-white">
                                            {receipt.receipt_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Issued</p>
                                        <p className="text-base text-gray-900 dark:text-white">
                                            {receipt.formatted_issued_date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Payment Summary
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                                            {receipt.formatted_total}
                                        </span>
                                    </div>
                                    {receipt.has_discount && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                -{receipt.formatted_discount}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                            {receipt.formatted_amount_paid}
                                        </span>
                                    </div>
                                    {receipt.change_due > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Change Due:</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                                {receipt.formatted_change}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {receipt.payment_method}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Actions
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <button
                                        onClick={handlePrint}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Printer className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium text-gray-900 dark:text-white">Print Receipt</span>
                                        </div>
                                        <span className="text-sm text-gray-500">→</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Download className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium text-gray-900 dark:text-white">Download PDF</span>
                                        </div>
                                        <span className="text-sm text-gray-500">→</span>
                                    </button>
                                    <Link
                                        href={route('resident.receipts.index')}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium text-gray-900 dark:text-white">View All Receipts</span>
                                        </div>
                                        <span className="text-sm text-gray-500">→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ResidentAppLayout>
    );
}