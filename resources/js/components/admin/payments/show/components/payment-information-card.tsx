// resources/js/Pages/Admin/Payments/components/payment-information-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Receipt,
    Calendar,
    Percent,
    AlertTriangle,
    Tag,
} from 'lucide-react';
import { Payment } from '../types';

interface Props {
    payment: Payment;
    paymentBreakdown: {
        formatted_subtotal: string;
        formatted_surcharge: string;
        formatted_penalty: string;
        formatted_discount: string;
        formatted_total: string;
        surcharge: number;
        penalty: number;
        discount: number;
    };
    formatDate: (date: string | undefined, includeTime?: boolean) => string;
    getMethodIcon: (method: string) => React.ReactNode;
    getCertificateIcon: (type?: string) => React.ReactNode;
}

export const PaymentInformationCard = ({
    payment,
    paymentBreakdown,
    formatDate,
    getMethodIcon,
    getCertificateIcon
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="dark:text-gray-100">Payment Information</CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Transaction details and payment breakdown
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">OR Number</p>
                        <p className="font-semibold flex items-center gap-2 dark:text-gray-100">
                            <Receipt className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {payment.or_number}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Date</p>
                        <p className="font-semibold flex items-center gap-2 dark:text-gray-100">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {payment.formatted_date || formatDate(payment.payment_date)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                        <div className="flex items-center gap-2">
                            {getMethodIcon(payment.payment_method)}
                            <span className="font-semibold dark:text-gray-100">{payment.payment_method_display}</span>
                        </div>
                        {payment.reference_number && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reference: {payment.reference_number}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collection Type</p>
                        <p className="font-semibold dark:text-gray-100">{payment.collection_type_display}</p>
                    </div>
                    {payment.period_covered && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Period Covered</p>
                            <p className="font-semibold dark:text-gray-100">{payment.period_covered}</p>
                        </div>
                    )}
                    {payment.purpose && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                            <p className="font-semibold dark:text-gray-100">{payment.purpose}</p>
                        </div>
                    )}
                </div>

                {/* Payment Breakdown */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                    <h4 className="font-semibold text-lg mb-3 dark:text-gray-100">Payment Breakdown</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                            <span className="font-medium dark:text-gray-100">{paymentBreakdown.formatted_subtotal}</span>
                        </div>
                        
                        {paymentBreakdown.surcharge > 0 && (
                            <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                <span className="flex items-center gap-1">
                                    <Percent className="h-3 w-3" />
                                    Surcharge
                                </span>
                                <span className="font-medium">{paymentBreakdown.formatted_surcharge}</span>
                            </div>
                        )}
                        
                        {paymentBreakdown.penalty > 0 && (
                            <div className="flex justify-between text-red-600 dark:text-red-400">
                                <span className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Penalty
                                </span>
                                <span className="font-medium">{paymentBreakdown.formatted_penalty}</span>
                            </div>
                        )}
                        
                        {paymentBreakdown.discount > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    Discount
                                </span>
                                <span className="font-medium">- {paymentBreakdown.formatted_discount}</span>
                            </div>
                        )}
                        
                        <div className="border-t dark:border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between text-lg font-bold dark:text-gray-100">
                                <span>Total Amount</span>
                                <span>{paymentBreakdown.formatted_total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificate Information (if applicable) */}
                {payment.certificate_type && (
                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                            {getCertificateIcon(payment.certificate_type)}
                            <h4 className="font-semibold text-blue-800 dark:text-blue-400">Certificate Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Certificate Type</p>
                                <p className="font-semibold dark:text-gray-100">{payment.certificate_type_display || payment.certificate_type}</p>
                            </div>
                            {payment.validity_date && (
                                <div>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Validity Date</p>
                                    <p className="font-semibold dark:text-gray-100">{payment.formatted_validity_date || formatDate(payment.validity_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Remarks */}
                {payment.remarks && (
                    <div>
                        <h4 className="font-semibold mb-2 dark:text-gray-100">Remarks</h4>
                        <div className="bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700 rounded p-4">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{payment.remarks}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};