import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Receipt, 
    ArrowLeft, 
    Printer, 
    Download, 
    Mail, 
    Smartphone,
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText,
    User,
    Calendar,
    CreditCard,
    Hash,
    Tag,
    Percent,
    Edit,
    Trash2,
    Send
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface ReceiptItem {
    fee_id?: number;
    fee_name: string;
    fee_code?: string;
    category?: string;
    base_amount: number;
    surcharge?: number;
    penalty?: number;
    discount?: number;
    total_amount: number;
    clearance_request_id?: number | null;
}

interface DiscountBreakdown {
    rule_id?: number;
    rule_name?: string;
    discount_type?: string;
    discount_amount: number;
    id_number?: string;
}

interface ClearanceData {
    id: number;
    control_number: string;
    resident_name: string;
    clearance_type: string;
    purpose?: string;
    issued_date?: string;
    valid_until?: string;
}

interface ReceiptData {
    id: number;
    receipt_number: string;
    payment_id: number | null;
    clearance_request_id: number | null;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    
    // Financial breakdown
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    amount_paid: number;
    change_due: number;
    
    // Formatted financials
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    
    // Payment details
    payment_method: string;
    payment_method_label: string;
    reference_number: string | null;
    payment_date: string;
    formatted_payment_date: string;
    
    // Issuance details
    issued_date: string;
    formatted_issued_date: string;
    issued_by: string;
    issued_by_id: number;
    
    // Status
    is_voided: boolean;
    status: string;
    status_badge: string;
    
    // Void details
    void_reason: string | null;
    voided_by: string | null;
    voided_at: string | null;
    
    // Printing
    printed_count: number;
    last_printed_at: string | null;
    
    // Breakdowns
    fee_breakdown: ReceiptItem[];
    discount_breakdown: DiscountBreakdown[] | null;
    
    // Notes
    notes: string | null;
    
    // Timestamps
    created_at: string;
    updated_at: string;
}

interface Props {
    receipt: ReceiptData;
    clearance: ClearanceData | null;
}

export default function Show({ receipt, clearance }: Props) {
    const [showVoidModal, setShowVoidModal] = useState(false);
    const [voidReason, setVoidReason] = useState('');
    const [isVoiding, setIsVoiding] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    const handlePrint = () => {
        router.post(route('receipts.print', receipt.id), {}, {
            preserveScroll: true,
        });
    };

    const handleVoid = () => {
        if (!voidReason || voidReason.length < 10) {
            alert('Please provide a void reason (minimum 10 characters)');
            return;
        }

        setIsVoiding(true);
        router.post(route('receipts.void', receipt.id), {
            void_reason: voidReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowVoidModal(false);
                setVoidReason('');
                setIsVoiding(false);
            },
            onError: () => {
                setIsVoiding(false);
            }
        });
    };

    const handleSendEmail = () => {
        if (!emailAddress) {
            alert('Please enter an email address');
            return;
        }

        router.post(route('receipts.send-email', receipt.id), {
            email: emailAddress,
            message: emailMessage
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEmailModal(false);
                setEmailAddress('');
                setEmailMessage('');
            }
        });
    };

    const handleDownload = () => {
        window.open(route('receipts.download', receipt.id), '_blank');
    };

    const handleSendSms = () => {
        const phone = prompt('Enter phone number:');
        if (phone) {
            router.post(route('receipts.send-sms', receipt.id), {
                phone: phone
            }, {
                preserveScroll: true,
            });
        }
    };

    const getStatusColor = () => {
        if (receipt.is_voided) return 'text-red-600 bg-red-100';
        if (receipt.status === 'paid') return 'text-green-600 bg-green-100';
        if (receipt.status === 'partial') return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getStatusIcon = () => {
        if (receipt.is_voided) return <XCircle className="h-5 w-5" />;
        if (receipt.status === 'paid') return <CheckCircle className="h-5 w-5" />;
        if (receipt.status === 'partial') return <AlertTriangle className="h-5 w-5" />;
        return <Receipt className="h-5 w-5" />;
    };

    return (
        <AppLayout>
            <Head title={`Receipt #${receipt.receipt_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('receipts.index')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Receipt #{receipt.receipt_number}
                                </h1>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                                    {getStatusIcon()}
                                    {receipt.is_voided ? 'Voided' : receipt.receipt_type_label}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Issued on {receipt.formatted_issued_date} • {receipt.payment_method_label}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!receipt.is_voided && (
                            <>
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </button>
                                <div className="relative group">
                                    <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                                        <Send className="h-4 w-4" />
                                        Send
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-50">
                                        <button
                                            onClick={() => setShowEmailModal(true)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg"
                                        >
                                            <Mail className="h-4 w-4 inline mr-2" />
                                            Send via Email
                                        </button>
                                        <button
                                            onClick={handleSendSms}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
                                        >
                                            <Smartphone className="h-4 w-4 inline mr-2" />
                                            Send via SMS
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        {!receipt.is_voided && (
                            <button
                                onClick={() => setShowVoidModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                <XCircle className="h-4 w-4" />
                                Void Receipt
                            </button>
                        )}
                    </div>
                </div>

                {/* Void Alert */}
                {receipt.is_voided && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 dark:text-red-400">
                                    This receipt has been voided
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                                    Reason: {receipt.void_reason}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Voided by {receipt.voided_by} on {receipt.voided_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Receipt Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Receipt Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Receipt Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Number</p>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">{receipt.receipt_number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">OR Number</p>
                                                <p className="text-base text-gray-900 dark:text-white">{receipt.or_number || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Type</p>
                                                <p className="text-base text-gray-900 dark:text-white">{receipt.receipt_type_label}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Printer className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Print History</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    Printed {receipt.printed_count} time(s)
                                                </p>
                                                {receipt.last_printed_at && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Last printed: {receipt.last_printed_at}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued Date</p>
                                                <p className="text-base text-gray-900 dark:text-white">{receipt.formatted_issued_date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Date</p>
                                                <p className="text-base text-gray-900 dark:text-white">{receipt.formatted_payment_date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued By</p>
                                                <p className="text-base text-gray-900 dark:text-white">{receipt.issued_by}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                                                <p className="text-base text-gray-900 dark:text-white">{receipt.payment_method_label}</p>
                                                {receipt.reference_number && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Ref: {receipt.reference_number}
                                                    </p>
                                                )}
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

                        {/* Fee Breakdown Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Fee Breakdown
                                </h2>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Fee Name</th>
                                            <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Base Amount</th>
                                            <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Surcharge</th>
                                            <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Penalty</th>
                                            <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Discount</th>
                                            <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {receipt.fee_breakdown.map((fee, index) => (
                                            <tr key={index}>
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                    {fee.fee_name}
                                                    {fee.category && (
                                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                            ({fee.category})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                                                    ₱{fee.base_amount.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                                                    {fee.surcharge ? `₱${fee.surcharge.toFixed(2)}` : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                                                    {fee.penalty ? `₱${fee.penalty.toFixed(2)}` : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                                                    {fee.discount ? `₱${fee.discount.toFixed(2)}` : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                                                    ₱{fee.total_amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-semibold">
                                        <tr>
                                            <td colSpan={5} className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                                Subtotal:
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                                                {receipt.formatted_subtotal}
                                            </td>
                                        </tr>
                                        {receipt.surcharge > 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">
                                                    Surcharge:
                                                </td>
                                                <td className="py-2 px-4 text-right text-gray-900 dark:text-white">
                                                    {receipt.formatted_surcharge}
                                                </td>
                                            </tr>
                                        )}
                                        {receipt.penalty > 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">
                                                    Penalty:
                                                </td>
                                                <td className="py-2 px-4 text-right text-gray-900 dark:text-white">
                                                    {receipt.formatted_penalty}
                                                </td>
                                            </tr>
                                        )}
                                        {receipt.discount > 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-2 px-4 text-right text-gray-700 dark:text-gray-300">
                                                    Discount:
                                                </td>
                                                <td className="py-2 px-4 text-right text-green-600 dark:text-green-400">
                                                    -{receipt.formatted_discount}
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                                            <td colSpan={5} className="py-3 px-4 text-right text-lg font-bold text-gray-900 dark:text-white">
                                                Total Amount:
                                            </td>
                                            <td className="py-3 px-4 text-right text-lg font-bold text-gray-900 dark:text-white">
                                                {receipt.formatted_total}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Discount Breakdown (if any) */}
                        {receipt.discount_breakdown && receipt.discount_breakdown.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Discount Details
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Discount Type</th>
                                                <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Rule Name</th>
                                                <th className="py-2 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                                                <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">ID Number</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {receipt.discount_breakdown.map((discount, index) => (
                                                <tr key={index}>
                                                    <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">
                                                        {discount.discount_type || 'Fixed'}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                        {discount.rule_name || 'General Discount'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">
                                                        -₱{discount.discount_amount.toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                        {discount.id_number || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Payer & Payment Summary */}
                    <div className="space-y-6">
                        {/* Payer Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Payer Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">{receipt.payer_name}</p>
                                    </div>
                                    {receipt.payer_address && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                                            <p className="text-base text-gray-900 dark:text-white">{receipt.payer_address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Clearance Information (if applicable) */}
                        {clearance && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Clearance Information
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Control Number</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{clearance.control_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                                            <p className="text-base text-gray-900 dark:text-white">{clearance.clearance_type}</p>
                                        </div>
                                        {clearance.purpose && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                                                <p className="text-base text-gray-900 dark:text-white">{clearance.purpose}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            {clearance.issued_date && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued Date</p>
                                                    <p className="text-base text-gray-900 dark:text-white">{clearance.issued_date}</p>
                                                </div>
                                            )}
                                            {clearance.valid_until && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid Until</p>
                                                    <p className="text-base text-gray-900 dark:text-white">{clearance.valid_until}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Payment Summary
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{receipt.formatted_subtotal}</span>
                                    </div>
                                    {receipt.surcharge > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Surcharge:</span>
                                            <span className="text-gray-900 dark:text-white">{receipt.formatted_surcharge}</span>
                                        </div>
                                    )}
                                    {receipt.penalty > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Penalty:</span>
                                            <span className="text-gray-900 dark:text-white">{receipt.formatted_penalty}</span>
                                        </div>
                                    )}
                                    {receipt.discount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                                            <span>Discount:</span>
                                            <span>-{receipt.formatted_discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 text-lg font-bold">
                                        <span className="text-gray-900 dark:text-white">Total:</span>
                                        <span className="text-gray-900 dark:text-white">{receipt.formatted_total}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{receipt.formatted_amount_paid}</span>
                                    </div>
                                    {receipt.change_due > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Change Due:</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400">{receipt.formatted_change}</span>
                                        </div>
                                    )}
                                    {receipt.amount_paid < receipt.total_amount && (
                                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                                Balance: ₱{(receipt.total_amount - receipt.amount_paid).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Related Links */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Related Links
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    {receipt.payment_id && (
                                        <Link
                                            href={route('admin.payments.show', receipt.payment_id)}
                                            className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <p className="font-medium text-gray-900 dark:text-white">View Payment</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">View the associated payment</p>
                                        </Link>
                                    )}
                                    {clearance && (
                                        <Link
                                            href={route('admin.clearances.show', clearance.id)}
                                            className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <p className="font-medium text-gray-900 dark:text-white">View Clearance Request</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">View the associated clearance</p>
                                        </Link>
                                    )}
                                    <Link
                                        href={route('receipts.index')}
                                        className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <p className="font-medium text-gray-900 dark:text-white">All Receipts</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Back to receipts list</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Void Modal */}
            {showVoidModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Void Receipt</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Are you sure you want to void receipt <span className="font-semibold">#{receipt.receipt_number}</span>? This action cannot be undone.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reason for voiding <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={voidReason}
                                onChange={(e) => setVoidReason(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Please provide a detailed reason..."
                                minLength={10}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Minimum 10 characters. {voidReason.length}/10
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowVoidModal(false);
                                    setVoidReason('');
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                disabled={isVoiding}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVoid}
                                disabled={voidReason.length < 10 || isVoiding}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isVoiding ? 'Processing...' : 'Void Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send Receipt via Email</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="recipient@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Add a personal message..."
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setEmailAddress('');
                                    setEmailMessage('');
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={!emailAddress}
                                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}