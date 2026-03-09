import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    CheckCircle,
    Mail,
    ExternalLink,
    Receipt,
    AlertCircle
} from 'lucide-react';
import { PaymentStatusBadge } from '../PaymentStatusBadge';
import { ClearanceRequest, ClearanceType, Payment } from '@/types/clearance';

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
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment Information
                    </CardTitle>
                    <CardDescription>
                        Payment status and details for this clearance request
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Payment Status Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm font-medium text-blue-600">Fee Amount</p>
                            <p className="text-2xl font-bold text-blue-700">{formatCurrency(clearance.fee_amount)}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                            clearance.payment_status === 'paid' ? 'bg-green-50 border-green-100' :
                            clearance.payment_status === 'partially_paid' ? 'bg-amber-50 border-amber-100' :
                            'bg-gray-50 border-gray-200'
                        }`}>
                            <p className={`text-sm font-medium ${
                                clearance.payment_status === 'paid' ? 'text-green-600' :
                                clearance.payment_status === 'partially_paid' ? 'text-amber-600' :
                                'text-gray-600'
                            }`}>
                                Payment Status
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <PaymentStatusBadge status={clearance.payment_status || 'unpaid'} />
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <p className="text-sm font-medium text-purple-600">Amount Paid</p>
                            <p className="text-2xl font-bold text-purple-700">{formatCurrency(clearance.amount_paid || 0)}</p>
                            {clearance.balance !== undefined && clearance.balance > 0 && (
                                <p className="text-xs text-purple-500 mt-1">
                                    Balance: {formatCurrency(clearance.balance)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Check if payment is actually required based on clearance type */}
                    {clearanceType?.requires_payment === true ? (
                        payment ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Amount</p>
                                        <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Status</p>
                                        <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                                            {payment.status_display || payment.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                        <p className="text-sm capitalize">{payment.payment_method_display || payment.payment_method?.replace('_', ' ') || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Official Receipt (OR)</p>
                                        <p className="text-sm font-mono">{payment.or_number || 'N/A'}</p>
                                    </div>
                                    {payment.reference_number && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Reference Number</p>
                                            <p className="text-sm font-mono">{payment.reference_number}</p>
                                        </div>
                                    )}
                                    {payment.payment_date && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Payment Date</p>
                                            <p className="text-sm">{formatDateTime(payment.payment_date)}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Payment Actions */}
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Payment Actions</h4>
                                            <p className="text-sm text-gray-500">Manage payment for this clearance</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {canProcess && clearance.payment_status !== 'paid' && (
                                                <Button onClick={onVerifyPayment}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Verify Payment
                                                </Button>
                                            )}
                                            <Button variant="outline" onClick={onViewPaymentDetails}>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Payment Details
                                            </Button>
                                            {payment.or_number && (
                                                <Button variant="outline" onClick={onViewReceipt}>
                                                    <Receipt className="h-4 w-4 mr-2" />
                                                    View Receipt
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : clearance.status === 'pending_payment' ? (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-6">
                                    <DollarSign className="h-12 w-12 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pending Payment</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-6">
                                    Waiting for the resident to complete the payment of {formatCurrency(clearance.fee_amount)}.
                                </p>
                                {canProcess && (
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Button onClick={onVerifyPayment}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Paid
                                        </Button>
                                        <Button variant="outline" onClick={onSendReminder}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send Reminder
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                    <AlertCircle className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Submitted</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-6">
                                    Payment is required but not yet submitted. Required amount: {formatCurrency(clearance.fee_amount)}
                                </p>
                                {canProcess && clearance.status !== 'cancelled' && clearance.status !== 'rejected' && (
                                    <Button onClick={onRequestPayment}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Request Payment
                                    </Button>
                                )}
                            </div>
                        )
                    ) : payment ? (
                        // Payment exists but clearance type doesn't require payment (maybe refund or special case)
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    <p className="text-sm text-blue-600">
                                        Note: This clearance type does not normally require payment, but a payment record exists.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Amount</p>
                                    <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                                        {payment.status_display || payment.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                                    <p className="text-sm capitalize">{payment.payment_method_display || payment.payment_method?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Official Receipt (OR)</p>
                                    <p className="text-sm font-mono">{payment.or_number || 'N/A'}</p>
                                </div>
                                {payment.payment_date && (
                                    <div className="space-y-2 md:col-span-2">
                                        <p className="text-sm font-medium text-gray-500">Paid At</p>
                                        <p className="text-sm">{formatDateTime(payment.payment_date)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // No payment required and no payment exists
                        <div className="text-center py-8">
                            <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Required</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                This clearance type does not require payment.
                                {clearance.fee_amount && clearance.fee_amount > 0 && (
                                    <span className="block mt-2 text-sm">
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