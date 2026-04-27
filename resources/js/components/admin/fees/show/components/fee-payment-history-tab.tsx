// resources/js/Pages/Admin/Fees/components/fee-payment-history-tab.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    History,
    Eye,
    FileDown,
    CreditCard,
    Receipt,
    Hash,
    User,
    Tag,
} from 'lucide-react';
import { PaymentHistory } from '@/types/admin/fees/fees';

// ========== TYPES ==========
interface PaymentDiscount {
    id: number;
    rule_name: string;
    rule_id?: number;
    amount: number;
    formatted_amount?: string;
    discount_type?: string;
    percentage?: number;
    id_number?: string;
    verified_at?: string;
}

// Extended PaymentHistory type with additional fields used in this component
interface ExtendedPaymentHistory extends PaymentHistory {
    discounts?: PaymentDiscount[];
    total_discount?: number;
    formatted_total_discount?: string;
    subtotal?: number;
    formatted_subtotal?: string;
}

interface FeePaymentHistoryTabProps {
    paymentHistory: ExtendedPaymentHistory[];
    onViewReceipt: (payment: ExtendedPaymentHistory) => void;
    onDownloadReceipt: (payment: ExtendedPaymentHistory) => void;
    formatDateTime: (date: string | null | undefined) => string;
    formatCurrency: (amount: number | string | undefined) => string;
}

export const FeePaymentHistoryTab: React.FC<FeePaymentHistoryTabProps> = ({
    paymentHistory,
    onViewReceipt,
    onDownloadReceipt,
    formatDateTime,
    formatCurrency
}) => {
    // Get payment method icon
    const getPaymentMethodIcon = (method?: string): React.ReactNode => {
        if (!method) return <CreditCard className="h-3 w-3" />;
        
        switch (method.toLowerCase()) {
            case 'cash':
                return <span className="text-green-600">💰</span>;
            case 'gcash':
            case 'maya':
            case 'online':
                return <span className="text-blue-600">📱</span>;
            case 'bank':
            case 'bank_transfer':
                return <span className="text-indigo-600">🏦</span>;
            case 'check':
                return <span className="text-amber-600">📝</span>;
            default:
                return <CreditCard className="h-3 w-3" />;
        }
    };

    // Format payment method for display
    const formatPaymentMethod = (method?: string): string => {
        if (!method) return 'Unknown';
        return method.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Get payment date (fallback to created_at)
    const getPaymentDate = (payment: ExtendedPaymentHistory): string => {
        return payment.payment_date || payment.created_at;
    };

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
                            {paymentHistory.map((payment) => {
                                const paymentDate = getPaymentDate(payment);
                                const hasDiscounts = payment.discounts && payment.discounts.length > 0;
                                const hasBreakdown = payment.subtotal !== undefined && payment.subtotal > 0;
                                
                                return (
                                    <div key={payment.id} className="space-y-4">
                                        {/* Main Payment Entry */}
                                        <div className="flex gap-3 pb-4 border-l-2 border-gray-200 dark:border-gray-700">
                                            {/* Timeline Dot */}
                                            <div className="flex-shrink-0 w-6 h-6 -ml-3 mt-0.5 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            </div>
                                            
                                            {/* Payment Content */}
                                            <div className="flex-1 space-y-3">
                                                {/* Header Row */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <p className="font-medium text-lg dark:text-gray-100">
                                                            {payment.formatted_amount || formatCurrency(payment.amount)}
                                                        </p>
                                                        
                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => onViewReceipt(payment)}
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View Receipt
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => onDownloadReceipt(payment)}
                                                            >
                                                                <FileDown className="h-3 w-3 mr-1" />
                                                                Download PDF
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDateTime(paymentDate)}
                                                    </p>
                                                </div>
                                                
                                                {/* Description */}
                                                {payment.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {payment.description}
                                                    </p>
                                                )}
                                                
                                                {payment.notes && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        Note: {payment.notes}
                                                    </p>
                                                )}
                                                
                                                {/* Payment Details Badges */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* OR Number */}
                                                    {payment.or_number && (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="text-xs dark:border-gray-600 dark:text-gray-300 flex items-center gap-1"
                                                        >
                                                            <Receipt className="h-3 w-3" />
                                                            OR# {payment.or_number}
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Payment Method */}
                                                    {payment.payment_method && (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="text-xs dark:border-gray-600 dark:text-gray-300 flex items-center gap-1"
                                                        >
                                                            {getPaymentMethodIcon(payment.payment_method)}
                                                            {formatPaymentMethod(payment.payment_method)}
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Reference Number */}
                                                    {payment.reference_number && (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="text-xs dark:border-gray-600 dark:text-gray-300 flex items-center gap-1"
                                                        >
                                                            <Hash className="h-3 w-3" />
                                                            Ref: {payment.reference_number}
                                                        </Badge>
                                                    )}
                                                    
                                                    {/* Received By */}
                                                    {payment.received_by && (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="text-xs dark:border-gray-600 dark:text-gray-300 flex items-center gap-1"
                                                        >
                                                            <User className="h-3 w-3" />
                                                            Received by: {payment.received_by}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Discounts Section */}
                                                {hasDiscounts && (
                                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-1">
                                                            <Tag className="h-3 w-3" />
                                                            Applied Discounts
                                                        </p>
                                                        <div className="space-y-2">
                                                            {payment.discounts!.map((discount) => (
                                                                <div key={discount.id} className="flex justify-between items-center text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-green-600 dark:text-green-400">●</span>
                                                                        <span className="text-gray-700 dark:text-gray-300">
                                                                            {discount.rule_name}
                                                                            {discount.percentage && (
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                                                    ({discount.percentage}%)
                                                                                </span>
                                                                            )}
                                                                        </span>
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
                                                            
                                                            {payment.total_discount !== undefined && payment.total_discount > 0 && (
                                                                <div className="pt-2 mt-2 border-t border-green-200 dark:border-green-800 flex justify-between items-center">
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Total Discount
                                                                    </span>
                                                                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                                                        - {payment.formatted_total_discount || formatCurrency(payment.total_discount)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Subtotal and Total Breakdown */}
                                                {hasBreakdown && (
                                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-xs space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                {payment.formatted_subtotal || formatCurrency(payment.subtotal)}
                                                            </span>
                                                        </div>
                                                        
                                                        {payment.total_discount !== undefined && payment.total_discount > 0 && (
                                                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                                                <span>Discounts:</span>
                                                                <span>
                                                                    - {payment.formatted_total_discount || formatCurrency(payment.total_discount)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300 pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
                                                            <span>Total Paid:</span>
                                                            <span className="text-base">
                                                                {payment.formatted_amount || formatCurrency(payment.amount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <History className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold dark:text-gray-100">
                                No payment history
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                                No payments have been recorded for this fee yet. 
                                Use the "Record Payment" button in the sidebar to add a payment.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};