import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    History,
    Eye,
    FileDown,
} from 'lucide-react';
import { PaymentHistory } from '../types';

interface Props {
    paymentHistory: PaymentHistory[];
    onViewReceipt: (payment: PaymentHistory) => void;
    onDownloadReceipt: (payment: PaymentHistory) => void;
    formatDateTime: (date?: string) => string;
    formatCurrency: (amount: number | string | undefined) => string;
}

export const FeePaymentHistoryTab = ({
    paymentHistory,
    onViewReceipt,
    onDownloadReceipt,
    formatDateTime,
    formatCurrency
}: Props) => {
    return (
        <div>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <History className="h-5 w-5" />
                        Payment History
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Record of all payments made for this fee
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {paymentHistory && paymentHistory.length > 0 ? (
                        <div className="space-y-6">
                            {paymentHistory.map((payment) => (
                                <div key={payment.id} className="space-y-4">
                                    {/* Main Payment Entry */}
                                    <div className="flex gap-3 pb-4 border-l-2 border-gray-200 dark:border-gray-700">
                                        <div className="flex-shrink-0 w-6 h-6 -ml-3 mt-0.5 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium dark:text-gray-100">{payment.formatted_amount || formatCurrency(payment.amount)}</p>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => onViewReceipt(payment)}
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => onDownloadReceipt(payment)}
                                                        >
                                                            <FileDown className="h-3 w-3 mr-1" />
                                                            PDF
                                                        </Button>
                                                    </div>
                                                </div>
                                                {/* FIX: Used ?? undefined to satisfy string | undefined constraint */}
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDateTime((payment.payment_date ?? payment.created_at) ?? undefined)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{payment.description}</p>
                                            
                                            {/* Payment Details */}
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {payment.or_number && (
                                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                        OR#: {payment.or_number}
                                                    </Badge>
                                                )}
                                                {payment.payment_method && (
                                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                        {payment.payment_method.toUpperCase()}
                                                    </Badge>
                                                )}
                                                {payment.reference_number && (
                                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                        Ref: {payment.reference_number}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                    By {payment.received_by}
                                                </Badge>
                                            </div>

                                            {/* Discounts Section */}
                                            {payment.discounts && payment.discounts.length > 0 && (
                                                <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Applied Discounts</p>
                                                    <div className="space-y-2">
                                                        {payment.discounts.map((discount) => (
                                                            <div key={discount.id} className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-green-600 dark:text-green-400">●</span>
                                                                    <span className="text-gray-700 dark:text-gray-300">{discount.rule_name}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="font-medium text-green-700 dark:text-green-400">
                                                                        - {discount.formatted_amount || formatCurrency(discount.amount)}
                                                                    </span>
                                                                    {discount.id_number && (
                                                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                                            ID: {discount.id_number}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {payment.total_discount > 0 && (
                                                            <div className="pt-2 border-t border-green-200 dark:border-green-800 flex justify-between items-center">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Discount</span>
                                                                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                                                    - {payment.formatted_total_discount || formatCurrency(payment.total_discount)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Subtotal and Total Breakdown */}
                                            {payment.subtotal > 0 && (
                                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>Subtotal:</span>
                                                        <span>{payment.formatted_subtotal || formatCurrency(payment.subtotal)}</span>
                                                    </div>
                                                    {payment.total_discount > 0 && (
                                                        <div className="flex justify-between text-green-600 dark:text-green-400">
                                                            <span>Discounts:</span>
                                                            <span>- {payment.formatted_total_discount || formatCurrency(payment.total_discount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-700">
                                                        <span>Total Paid:</span>
                                                        <span>{payment.formatted_amount || formatCurrency(payment.amount)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <History className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold dark:text-gray-100">No payment history</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                No payments have been recorded for this fee yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};