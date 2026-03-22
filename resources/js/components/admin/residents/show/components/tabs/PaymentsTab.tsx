// resources/js/Components/Admin/Residents/Show/Components/Tabs/PaymentsTab.tsx

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
    Calendar,
    CheckCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Payment {
    id: number;
    or_number: string;
    total_amount: number;
    amount_paid: number;
    payment_method: string;
    payment_date: string;
    status: string;
    payer_name: string;
    purpose: string;
    formatted_total?: string;
    formatted_amount_paid?: string;
}

interface PaymentsTabProps {
    residentId: number;
    payments: Payment[];
    totalPayments: number;
    totalAmount: number;
}

export const PaymentsTab = ({ 
    residentId, 
    payments, 
    totalPayments, 
    totalAmount 
}: PaymentsTabProps) => {
    const toNumber = (value: number | string | undefined): number => {
        if (value === undefined || value === null) return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    const formatAmount = (amount: number | string): string => {
        const num = toNumber(amount);
        return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'cash':
                return <Banknote className="h-4 w-4 text-green-500" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <Smartphone className="h-4 w-4 text-blue-500" />;
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPaymentMethodBadge = (method: string) => {
        const methods: Record<string, string> = {
            cash: 'Cash',
            gcash: 'GCash',
            maya: 'Maya',
            online: 'Online Payment',
            bank: 'Bank Transfer',
            check: 'Check'
        };
        return methods[method] || method;
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <CreditCard className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{totalPayments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Banknote className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{formatAmount(totalAmount)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="dark:text-gray-100">Payment History</CardTitle>
                        <Link href={route('admin.payments.create', { resident_id: residentId })}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No payments found</h3>
                            <p className="text-gray-500 dark:text-gray-400">This resident has no payment records yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div key={payment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <h3 className="font-semibold dark:text-gray-100">OR# {payment.or_number}</h3>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    {getPaymentMethodIcon(payment.payment_method)}
                                                    {getPaymentMethodBadge(payment.payment_method)}
                                                </Badge>
                                                <Badge className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                    {payment.status === 'completed' ? 'Completed' : 'Pending'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                {payment.purpose || 'Payment transaction'}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                                    <p className="font-medium dark:text-gray-200">{formatAmount(payment.total_amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Paid</p>
                                                    <p className="font-medium text-green-600">{formatAmount(payment.amount_paid)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Payment Date</p>
                                                    <p className="font-medium dark:text-gray-200 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={route('admin.payments.show', payment.id)}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};