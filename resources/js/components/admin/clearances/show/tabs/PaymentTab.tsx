import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    DollarSign,
    CheckCircle,
    Mail,
    ExternalLink,
    Receipt,
    AlertCircle,
    Clock,
    XCircle,
    RefreshCw,
    CreditCard,
    FileText,
    Calendar,
    User,
    Phone,
    MapPin,
    Copy,
    Eye
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClearanceRequest, ClearanceType, Payment } from '@/types/admin/clearances/clearance'; // Fix import
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentTabProps {
    clearance: ClearanceRequest;
    clearanceType?: ClearanceType;
    payment?: Payment;
    canProcess: boolean;
    onVerifyPayment: () => void;
    onSendReminder: () => void;
    onRequestPayment: () => void;
    onViewPaymentDetails: () => void;
    onViewReceipt: () => void;
    formatCurrency: (amount?: number) => string;
    formatDateTime: (date?: string) => string;
}

export function PaymentTab({
    clearance,
    clearanceType,
    payment,
    canProcess,
    onVerifyPayment,
    onSendReminder,
    onRequestPayment,
    onViewPaymentDetails,
    onViewReceipt,
    formatCurrency,
    formatDateTime
}: PaymentTabProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('OR number copied');
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper function to get payment status
    const getPaymentStatus = () => {
        if (payment?.status) return payment.status;
        if (clearance.payment_status) return clearance.payment_status;
        return 'unpaid';
    };

    const getPaymentStatusDisplay = () => {
        const status = getPaymentStatus();
        const statusMap: Record<string, string> = {
            'completed': 'Paid',
            'paid': 'Paid',
            'pending': 'Pending',
            'pending_payment': 'Pending',
            'failed': 'Failed',
            'refunded': 'Refunded',
            'unpaid': 'Unpaid',
            'partially_paid': 'Partially Paid'
        };
        return statusMap[status] || status;
    };

    const isPaid = () => {
        const status = getPaymentStatus();
        return status === 'completed' || status === 'paid';
    };

    const getAmountPaid = () => {
        return payment?.total_amount || 0;
    };

    const getBalance = () => {
        if (clearance.balance !== undefined && clearance.balance !== null) {
            return clearance.balance;
        }
        if (clearance.fee_amount && getAmountPaid()) {
            return clearance.fee_amount - getAmountPaid();
        }
        return 0;
    };

    return (
        <div>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                            <DollarSign className="h-3 w-3 text-white" />
                        </div>
                        Payment Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Payment status and details for this clearance request
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Payment Status Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Fee Amount
                            </p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(clearance.fee_amount)}</p>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                            isPaid() 
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                                : getPaymentStatus() === 'partially_paid'
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
                                : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-gray-200 dark:border-gray-700'
                        }`}>
                            <p className={`text-sm font-medium ${
                                isPaid() ? 'text-green-600 dark:text-green-400' :
                                getPaymentStatus() === 'partially_paid' ? 'text-amber-600 dark:text-amber-400' :
                                'text-gray-600 dark:text-gray-400'
                            }`}>
                                Payment Status
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={
                                    isPaid() ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                    getPaymentStatus() === 'pending' || getPaymentStatus() === 'pending_payment' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                }>
                                    {getPaymentStatusDisplay()}
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Amount Paid</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency(getAmountPaid())}</p>
                            {getBalance() > 0 && (
                                <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                                    Balance: {formatCurrency(getBalance())}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Check if payment is actually required based on clearance type */}
                    {clearanceType?.requires_payment === true ? (
                        payment ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">OR Number</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-mono font-bold dark:text-gray-100">{payment.or_number || 'N/A'}</p>
                                                {payment.or_number && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => copyToClipboard(payment.or_number!)}
                                                                >
                                                                    {copied ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Copy OR number</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.total_amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                                <Badge variant="outline" className={
                                                    payment.status === 'completed'
                                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                        : payment.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                                }>
                                                    {payment.status_display || payment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <p className="font-medium capitalize dark:text-gray-200">
                                                    {payment.payment_method_display || payment.payment_method?.replace('_', ' ') || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {payment.reference_number && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Reference #</p>
                                                    <p className="text-sm font-mono dark:text-gray-300">{payment.reference_number}</p>
                                                </div>
                                            )}
                                            {payment.payment_date && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <p className="text-sm dark:text-gray-300">{formatDateTime(payment.payment_date)}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Payer Information */}
                                {payment.payer_name && (
                                    <>
                                        <Separator className="dark:bg-gray-700" />
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Payer Information</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm dark:text-gray-300">{payment.payer_name}</span>
                                                </div>
                                                {payment.payer_email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-sm dark:text-gray-300">{payment.payer_email}</span>
                                                    </div>
                                                )}
                                                {payment.payer_contact && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-sm dark:text-gray-300">{payment.payer_contact}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                {/* Payment Actions */}
                                <Separator className="dark:bg-gray-700" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Payment Actions</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage payment for this clearance</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canProcess && !isPaid() && (
                                            <Button
                                                onClick={onVerifyPayment}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Verify Payment
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={onViewPaymentDetails} className="dark:border-gray-600 dark:text-gray-300">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                        {payment.or_number && (
                                            <Button variant="outline" onClick={onViewReceipt} className="dark:border-gray-600 dark:text-gray-300">
                                                <Receipt className="h-4 w-4 mr-2" />
                                                View Receipt
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : clearance.status === 'pending_payment' ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-6 border-4 border-amber-200 dark:border-amber-800">
                                    <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Pending Payment</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                    Waiting for the resident to complete the payment of {formatCurrency(clearance.fee_amount)}.
                                </p>
                                {canProcess && (
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Button
                                            onClick={onVerifyPayment}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Paid
                                        </Button>
                                        <Button variant="outline" onClick={onSendReminder} className="dark:border-gray-600 dark:text-gray-300">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send Reminder
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6 border-4 border-gray-200 dark:border-gray-700">
                                    <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Payment Not Submitted</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                    Payment is required but not yet submitted. Required amount: {formatCurrency(clearance.fee_amount)}
                                </p>
                                {canProcess && clearance.status !== 'cancelled' && clearance.status !== 'rejected' && (
                                    <Button
                                        onClick={onRequestPayment}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Request Payment
                                    </Button>
                                )}
                            </div>
                        )
                    ) : payment ? (
                        // Payment exists but clearance type doesn't require payment
                        <div className="space-y-6">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Note: This clearance type does not normally require payment, but a payment record exists.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.total_amount)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                    <Badge variant="outline" className={
                                        payment.status === 'completed'
                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                    }>
                                        {payment.status_display || payment.status}
                                    </Badge>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                                    <p className="font-medium capitalize dark:text-gray-200">
                                        {payment.payment_method_display || payment.payment_method?.replace('_', ' ') || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">OR Number</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-sm dark:text-gray-300">{payment.or_number || 'N/A'}</p>
                                        {payment.or_number && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5"
                                                onClick={() => copyToClipboard(payment.or_number!)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {payment.payment_date && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Paid At</p>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <p className="text-sm dark:text-gray-300">{formatDateTime(payment.payment_date)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // No payment required and no payment exists
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-6 border-4 border-green-200 dark:border-green-800">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Payment Required</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                This clearance type does not require payment.
                                {clearance.fee_amount && clearance.fee_amount > 0 && (
                                    <span className="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                                        Note: Although fee is listed as {formatCurrency(clearance.fee_amount)}, 
                                        this clearance type is marked as free.
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}