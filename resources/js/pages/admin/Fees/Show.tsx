import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Home,
    Building,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Printer,
    CreditCard,
    Receipt,
    Edit,
    Trash2,
    Share2,
    Copy,
    Hash,
    Tag,
    MapPin,
    Phone,
    Mail,
    Globe,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Percent,
    ChevronRight,
    ExternalLink,
    History,
    CalendarDays,
    Clock4,
    FileBarChart
} from 'lucide-react';
import { useState } from 'react';
import { format, formatDistance } from 'date-fns';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';

interface Fee {
    id: number;
    fee_type_id: number;
    payer_type: string;
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    email?: string;
    address?: string;
    purok?: string;
    issue_date: string;
    due_date: string;
    payment_deadline?: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    fee_code: string;
    description?: string;
    notes?: string;
    issued_by_id: number;
    issued_by_name: string;
    payment_method?: string;
    payment_reference?: string;
    payment_date?: string;
    waiver_reason?: string;
    written_off_reason?: string;
    created_at: string;
    updated_at: string;
    
    fee_type?: {
        id: number;
        name: string;
        code: string;
        category: string;
        description?: string;
        base_amount: number;
        validity_days?: number;
    };
    
    resident?: {
        id: number;
        name: string;
        birth_date?: string;
        gender: string;
        occupation?: string;
        is_head: boolean;
        contact_number?: string;
    };
    
    household?: {
        id: number;
        name: string;
        address: string;
        household_head_name: string;
        contact_number?: string;
    };
    
    issued_by?: {
        id: number;
        name: string;
        role: string;
        email?: string;
    };
    
    payment_history?: Array<{
        id: number;
        amount: string;
        description: string;
        payment_date: string | null;
        or_number: string | null;
        payment_method: string | null;
        reference_number: string | null;
        status: string;
        notes: string | null;
        received_by: string;
        created_at: string;
    }>;
    
    or_number?: string;
    certificate_number?: string;
    purpose?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
    valid_from?: string;
    valid_until?: string;
    discount_amount?: number;
    discount_type?: string;
    surcharge_amount?: number;
    penalty_amount?: number;
    base_amount?: number;
    status_label?: string;
    issued_by_user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface RelatedFee {
    id: number;
    fee_code: string;
    fee_type_name: string;
    total_amount: string;
    status: string;
    status_label?: string;
    issue_date: string;
}

interface Permissions {
    can_edit: boolean;
    can_delete: boolean;
    can_record_payment: boolean;
    can_cancel: boolean;
    can_waive: boolean;
    can_print: boolean;
}

export default function FeesShow({
    fee,
    related_fees,
    permissions = {
        can_edit: fee.status === 'pending' || fee.status === 'issued',
        can_delete: fee.status === 'pending',
        can_record_payment: fee.balance > 0 && !['paid', 'cancelled', 'waived'].includes(fee.status),
        can_cancel: ['pending', 'issued', 'partially_paid'].includes(fee.status),
        can_waive: fee.balance > 0 && !['paid', 'cancelled', 'waived'].includes(fee.status),
        can_print: true,
    }
}: {
    fee: Fee;
    related_fees?: RelatedFee[];
    permissions?: Permissions;
}) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const formatCurrency = (amount: number | string) => {
        if (typeof amount === 'string' && amount.startsWith('₱')) {
            return amount; // Already formatted
        }
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(numAmount);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            partially_paid: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            waived: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            written_off: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'overdue':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'partially_paid':
                return <Percent className="h-5 w-5 text-indigo-500" />;
            case 'issued':
                return <FileText className="h-5 w-5 text-blue-500" />;
            case 'waived':
                return <CheckCircle className="h-5 w-5 text-purple-500" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-gray-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident':
                return <User className="h-5 w-5" />;
            case 'household':
                return <Home className="h-5 w-5" />;
            case 'business':
                return <Building className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    const getDaysOverdue = () => {
        if (fee.status !== 'overdue' && fee.status !== 'partially_paid') return 0;
        try {
            const due = new Date(fee.due_date);
            const today = new Date();
            const diffTime = today.getTime() - due.getTime();
            return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        } catch (error) {
            return 0;
        }
    };

    const handleDelete = () => {
        router.delete(route('fees.destroy', fee.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('fees.index'));
            },
        });
    };

    const handlePrint = (type = 'receipt') => {
        // Open in a new tab for preview
        window.open(route('fees.print', { fee: fee.id, type }), '_blank');
    };

    // FIXED: Record Payment function
    const handleRecordPayment = () => {
        // Navigate to record payment page for this fee
        router.get(route('payments.create'), {
            fee_id: fee.id,
            payer_type: fee.payer_type,
            payer_id: getPayerId(),
            payer_name: fee.payer_name,
            contact_number: getContactNumber() || '',
            address: fee.address || '',
            purok: fee.purok || '',
            email: fee.email || '',
            pre_filled_fee: {
                id: fee.id,
                fee_type_id: fee.fee_type_id,
                fee_name: fee.fee_type?.name || 'Fee',
                fee_code: fee.fee_code,
                description: fee.description || fee.fee_type?.description || '',
                base_amount: fee.balance, // Remaining balance
                surcharge: 0,
                penalty: 0,
                total_amount: fee.balance,
                category: fee.fee_type?.category || 'service',
                period_covered: formatDate(fee.issue_date)
            }
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        // You could use a toast notification instead of alert
        alert('Link copied to clipboard!');
    };

    // Fixed: Use correct payer ID based on payer_type
    const getPayerId = () => {
        if (fee.payer_type === 'resident' && fee.resident) return fee.resident.id;
        if (fee.payer_type === 'household' && fee.household) return fee.household.id;
        return fee.payer_id; // Fallback to payer_id if available
    };

    // Fixed: Use correct contact number based on payer_type
    const getContactNumber = () => {
        if (fee.payer_type === 'resident' && fee.resident?.contact_number) return fee.resident.contact_number;
        if (fee.payer_type === 'household' && fee.household?.contact_number) return fee.household.contact_number;
        return fee.contact_number;
    };

    // FIXED: Calculate payment progress - handle NaN and zero division
    const getPaymentProgress = () => {
        if (!fee.total_amount || fee.total_amount === 0) return 0;
        const progress = (fee.amount_paid / fee.total_amount) * 100;
        // Ensure we return a valid number
        return Math.min(100, Math.max(0, Math.round(progress) || 0));
    };

    // Fixed: Check if fee is overdue
    const isOverdue = () => {
        try {
            return new Date(fee.due_date) < new Date() && fee.status !== 'paid';
        } catch (error) {
            return false;
        }
    };

    // Helper to get payer name with fallback
    const getPayerName = () => {
        if (fee.payer_type === 'resident' && fee.resident?.name) return fee.resident.name;
        if (fee.payer_type === 'household' && fee.household?.name) return fee.household.name;
        return fee.payer_name || 'Unknown';
    };

    return (
        <AppLayout>
            <Head title={`Fee #${fee.fee_code}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('fees.index')}
                            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Fees
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Fee #{fee.fee_code}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {fee.fee_type?.name || 'Fee Details'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Copy className="h-4 w-4" />
                            Copy Link
                        </Button>
                        <Button
                            onClick={() => handlePrint()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                        {permissions.can_record_payment && (
                            <Button
                                onClick={handleRecordPayment}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                <CreditCard className="h-4 w-4" />
                                Record Payment
                            </Button>
                        )}
                        {permissions.can_edit && (
                            <Link
                                href={route('fees.edit', fee.id)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                        )}
                        {permissions.can_delete && (
                            <Button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`rounded-xl p-6 ${getStatusColor(fee.status)} border ${getStatusColor(fee.status).includes('dark:') ? 'border-gray-200 dark:border-gray-700' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getStatusIcon(fee.status)}
                            <div>
                                <h2 className="text-xl font-bold capitalize">
                                    {fee.status_label || fee.status.replace('_', ' ')}
                                </h2>
                                <p className="text-sm opacity-80 mt-1">
                                    Last updated {formatDistance(new Date(fee.updated_at), new Date(), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">
                                {formatCurrency(fee.total_amount)}
                            </div>
                            <div className="text-sm opacity-80">
                                Total Amount
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Fee Details & Payer Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Fee Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Fee Details
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee Type</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                                {fee.fee_type?.name || 'N/A'}
                                            </p>
                                            {fee.fee_type?.category && (
                                                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                                                    {fee.fee_type.category.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee Code</label>
                                            <p className="mt-1 font-mono font-semibold text-gray-900 dark:text-white">
                                                {fee.fee_code}
                                            </p>
                                            {fee.fee_type?.code && fee.fee_type.code !== fee.fee_code && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Type Code: {fee.fee_type.code}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                                            <p className="mt-1 text-gray-700 dark:text-gray-300">
                                                {fee.description || fee.fee_type?.description || 'No description provided'}
                                            </p>
                                        </div>
                                        {/* Certificate Number Display */}
                                        {fee.certificate_number && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate Number</label>
                                                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                                                    {fee.certificate_number}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-900 dark:text-white">
                                                    {formatDate(fee.issue_date)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className={`font-semibold ${isOverdue() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {formatDate(fee.due_date)}
                                                </span>
                                                {isOverdue() && (
                                                    <span className="text-xs text-red-500 dark:text-red-400">
                                                        ({getDaysOverdue()} days overdue)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {fee.payment_deadline && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Deadline</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock4 className="h-4 w-4 text-yellow-500" />
                                                    <span className="text-yellow-700 dark:text-yellow-400 font-semibold">
                                                        {formatDate(fee.payment_deadline)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Billing Period Display */}
                                        {fee.billing_period && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Period</label>
                                                <p className="mt-1 text-gray-900 dark:text-white">
                                                    {fee.billing_period}
                                                    {fee.period_start && fee.period_end && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                                            ({formatDate(fee.period_start)} - {formatDate(fee.period_end)})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued By</label>
                                            <p className="mt-1 text-gray-900 dark:text-white">
                                                {fee.issued_by_user?.name || fee.issued_by_name || 'Unknown'}
                                            </p>
                                            {fee.issued_by_user?.email && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {fee.issued_by_user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Validity Dates for Certificates */}
                                {fee.valid_from && fee.valid_until && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Validity Period</label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    From {formatDate(fee.valid_from)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Until {formatDate(fee.valid_until)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {fee.notes && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Notes</label>
                                        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {fee.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payer Information Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {getPayerIcon(fee.payer_type)}
                                    Payer Information
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                        {getPayerIcon(fee.payer_type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {getPayerName()}
                                        </h4>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-gray-500 dark:text-gray-400">Type:</span>
                                                    <span className="capitalize text-gray-700 dark:text-gray-300">
                                                        {fee.payer_type}
                                                    </span>
                                                </div>
                                                {getContactNumber() && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                                                        <a 
                                                            href={`tel:${getContactNumber()}`}
                                                            className="text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            {getContactNumber()}
                                                        </a>
                                                    </div>
                                                )}
                                                {fee.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-500 dark:text-gray-400">Email:</span>
                                                        <a 
                                                            href={`mailto:${fee.email}`}
                                                            className="text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            {fee.email}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {fee.address && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                        <div>
                                                            <span className="font-medium text-gray-500 dark:text-gray-400">Address:</span>
                                                            <p className="text-gray-700 dark:text-gray-300">
                                                                {fee.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {fee.purok && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Home className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-500 dark:text-gray-400">Purok:</span>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {fee.purok}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* View Payer Profile Button */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    {fee.payer_type === 'resident' && fee.resident && (
                                        <Link
                                            href={route('residents.show', fee.resident.id)}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        >
                                            View Resident Profile
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    )}
                                    {fee.payer_type === 'household' && fee.household && (
                                        <Link
                                            href={route('households.show', fee.household.id)}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        >
                                            View Household Profile
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment History - Updated to use payment_history */}
                        {fee.payment_history && fee.payment_history.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        Payment History
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {fee.payment_history.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                            <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {formatCurrency(payment.amount)}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {payment.payment_method?.toUpperCase() || 'CASH'} 
                                                                {payment.or_number && ` • OR#: ${payment.or_number}`}
                                                                {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                                                            </p>
                                                            {payment.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                                    {payment.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {payment.payment_date && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(payment.payment_date)}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        By {payment.received_by}
                                                    </p>
                                                    {payment.notes && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {payment.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Amount & Actions */}
                    <div className="space-y-6">
                        {/* Amount Summary Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Amount Summary
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(fee.base_amount || fee.fee_type?.base_amount || 0)}
                                        </span>
                                    </div>
                                    
                                    {fee.surcharge_amount && fee.surcharge_amount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-600 dark:text-orange-400">
                                                Surcharge
                                            </span>
                                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                + {formatCurrency(fee.surcharge_amount)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {fee.penalty_amount && fee.penalty_amount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-red-600 dark:text-red-400">
                                                Penalty
                                            </span>
                                            <span className="font-semibold text-red-600 dark:text-red-400">
                                                + {formatCurrency(fee.penalty_amount)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {fee.discount_amount && fee.discount_amount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600 dark:text-green-400">
                                                Discount
                                            </span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                - {formatCurrency(fee.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Total Amount
                                            </span>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(fee.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600 dark:text-green-400">Amount Paid</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(fee.amount_paid)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-red-600 dark:text-red-400">Remaining Balance</span>
                                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(fee.balance)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* FIXED: Payment Progress */}
                                    <div className="pt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Payment Progress
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {getPaymentProgress()}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                                style={{ width: `${getPaymentProgress()}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>₱0</span>
                                            <span>{formatCurrency(fee.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                   <Link
                                        onClick={() => handlePrint('receipt')}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors" href={''}                                    >
                                        <div className="flex items-center gap-3">
                                            <Printer className="h-4 w-4" />
                                            <span>Print Official Receipt</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    
                                    {/* FIXED: Record Payment button in Quick Actions */}
                                    <Link
                                        onClick={handleRecordPayment}
                                        disabled={!permissions.can_record_payment}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" href={''}                                    >
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="h-4 w-4" />
                                            <span>Record Payment</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    
                                    {fee.certificate_number && (
                                        <Link
                                            onClick={() => handlePrint('certificate')}
                                            className="w-full flex items-center justify-between px-4 py-3 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" href={''}                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4" />
                                                <span>Print Certificate</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                    
                                                    <Link
                                        href={route('fees.create', {
                                            duplicate_from: fee.id
                                        })}
                                        className="block w-full flex items-center justify-between px-4 py-3 text-left text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Copy className="h-4 w-4" />
                                            <span>Duplicate Fee</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    
                                    <a
                                        href={`mailto:${fee.email || ''}?subject=Fee%20${fee.fee_code}&body=Dear%20${encodeURIComponent(getPayerName())}%2C%0A%0AThis%20is%20regarding%20Fee%20${fee.fee_code}%20(${formatCurrency(fee.total_amount)}).%0A%0APlease%20make%20payment%20by%20${formatDate(fee.due_date)}.%0A%0ARegards%2C%0ABarangay%20Office`}
                                        className="block w-full flex items-center justify-between px-4 py-3 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4" />
                                            <span>Send Reminder</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Related Fees */}
                        {related_fees && related_fees.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileBarChart className="h-5 w-5" />
                                        Related Fees
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {related_fees.map((relatedFee) => (
                                            <Link
                                                key={relatedFee.id}
                                                href={route('fees.show', relatedFee.id)}
                                                className="block p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {relatedFee.fee_code}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {relatedFee.fee_type_name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {formatCurrency(relatedFee.total_amount)}
                                                        </p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(relatedFee.status)}`}>
                                                            {relatedFee.status_label || relatedFee.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Delete Fee
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Are you sure you want to delete fee <strong>#{fee.fee_code}</strong>? This will permanently remove the fee and all associated data.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                Delete Fee
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}