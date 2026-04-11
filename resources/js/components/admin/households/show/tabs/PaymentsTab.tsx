// resources/js/Pages/Admin/Households/Show/tabs/PaymentsTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    CreditCard, 
    Plus, 
    Eye, 
    Download,
    Banknote,
    Smartphone,
    Loader2,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useMemo } from 'react';

// Import types from shared types file
import { Payment, PaymentMethod, PaymentStatus } from '@/types/admin/households/household.types';
import { formatDate, formatDateTime } from '@/types/admin/households/household.types';

interface PaymentsTabProps {
    householdId: number;
    payments: Payment[];
    totalPayments: number;
    totalAmount: number;
    cashPayments: number;
    onlinePayments: number;
}

export const PaymentsTab = ({ 
    householdId, 
    payments, 
    totalPayments, 
    totalAmount,
    cashPayments,
    onlinePayments
}: PaymentsTabProps) => {
    // Helper to safely convert to number
    const toNumber = (value: number | string | undefined | null): number => {
        if (value === undefined || value === null) return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Group payments by status for better organization
    const paymentsByStatus = useMemo(() => {
        return {
            completed: payments.filter(p => p.status === 'completed'),
            pending: payments.filter(p => p.status === 'pending'),
            failed: payments.filter(p => p.status === 'failed'),
            refunded: payments.filter(p => p.status === 'refunded')
        };
    }, [payments]);

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case 'cash':
                return <Banknote className="h-4 w-4 text-green-500" />;
            case 'gcash':
            case 'maya':
                return <Smartphone className="h-4 w-4 text-blue-500" />;
            case 'online':
                return <CreditCard className="h-4 w-4 text-purple-500" />;
            case 'bank':
                return <Banknote className="h-4 w-4 text-indigo-500" />;
            case 'other':
                return <CreditCard className="h-4 w-4 text-gray-500" />;
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPaymentMethodBadge = (method: PaymentMethod) => {
        const methods: Record<PaymentMethod, string> = {
            cash: 'Cash',
            gcash: 'GCash',
            maya: 'Maya',
            online: 'Online Payment',
            bank: 'Bank Transfer',
            other: 'Other'
        };
        return methods[method] || method;
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                </Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                </Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Failed
                </Badge>;
            case 'refunded':
                return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400 flex items-center gap-1">
                    Refunded
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatAmount = (amount: number | string | undefined | null): string => {
        const num = toNumber(amount);
        return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDateSafe = (date?: string): string => {
        if (!date) return 'N/A';
        return formatDate(date);
    };

    const renderPaymentList = (paymentsList: Payment[]) => {
        if (!paymentsList || paymentsList.length === 0) return null;
        
        return (
            <div className="space-y-3">
                {paymentsList.map((payment) => {
                    const amount = toNumber(payment.amount);
                    const totalAmountValue = toNumber(payment.total_amount);
                    const displayTotalAmount = totalAmountValue > 0 ? totalAmountValue : amount;
                    
                    return (
                        <div key={payment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <div className="flex items-center gap-2">
                                            {getPaymentMethodIcon(payment.payment_method)}
                                            <h3 className="font-semibold dark:text-gray-100">
                                                {payment.receipt_number ? `Receipt #${payment.receipt_number}` : `Payment #${payment.id}`}
                                            </h3>
                                        </div>
                                        {getPaymentStatusBadge(payment.status)}
                                        <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600">
                                            {getPaymentMethodIcon(payment.payment_method)}
                                            {getPaymentMethodBadge(payment.payment_method)}
                                        </Badge>
                                    </div>
                                    
                                    {payment.notes && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            {payment.notes}
                                        </p>
                                    )}
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                            <p className="font-medium dark:text-gray-200">{formatAmount(amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Total Amount</p>
                                            <p className="font-medium dark:text-gray-200">{formatAmount(displayTotalAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Payment Date</p>
                                            <p className="font-medium dark:text-gray-200">
                                                {formatDateSafe(payment.payment_date)}
                                            </p>
                                        </div>
                                        {payment.reference_number && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Reference #</p>
                                                <p className="font-mono text-xs dark:text-gray-300 break-all">{payment.reference_number}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {payment.receipt_number && (
                                        <p className="text-xs text-gray-400 mt-2">Receipt #: {payment.receipt_number}</p>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Link href={route('admin.payments.show', payment.id)}>
                                        <Button variant="ghost" size="sm" title="View Details">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {payment.status === 'completed' && (
                                        <Button variant="ghost" size="sm" title="Download Receipt">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Calculate total amount safely
    const safeTotalAmount = toNumber(totalAmount);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <CreditCard className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{toNumber(totalPayments)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Banknote className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{formatAmount(safeTotalAmount)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Banknote className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{toNumber(cashPayments)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cash Payments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Smartphone className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{toNumber(onlinePayments)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Online Payments</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="dark:text-gray-100">Payment History</CardTitle>
                        <Link href={route('admin.payments.create', { household_id: householdId })}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {!payments || payments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No payments found</h3>
                            <p className="text-gray-500 dark:text-gray-400">This household has no payment records yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Completed Payments Section */}
                            {paymentsByStatus.completed.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Completed Payments ({paymentsByStatus.completed.length})
                                    </h4>
                                    {renderPaymentList(paymentsByStatus.completed)}
                                </div>
                            )}

                            {/* Pending Payments Section */}
                            {paymentsByStatus.pending.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Pending Payments ({paymentsByStatus.pending.length})
                                    </h4>
                                    {renderPaymentList(paymentsByStatus.pending)}
                                </div>
                            )}

                            {/* Failed Payments Section */}
                            {paymentsByStatus.failed.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Failed Payments ({paymentsByStatus.failed.length})
                                    </h4>
                                    {renderPaymentList(paymentsByStatus.failed)}
                                </div>
                            )}

                            {/* Refunded Payments Section */}
                            {paymentsByStatus.refunded.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                                        Refunded Payments ({paymentsByStatus.refunded.length})
                                    </h4>
                                    {renderPaymentList(paymentsByStatus.refunded)}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};