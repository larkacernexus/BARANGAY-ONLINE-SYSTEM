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
    Loader2
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
}

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <p className="text-2xl font-bold dark:text-gray-100">₱{totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Banknote className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{cashPayments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cash Payments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Smartphone className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{onlinePayments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Online Payments</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
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
                    {payments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No payments found</h3>
                            <p className="text-gray-500 dark:text-gray-400">This household has no payment records yet.</p>
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
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                                    <p className="font-medium dark:text-gray-200">₱{payment.total_amount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Paid</p>
                                                    <p className="font-medium text-green-600">₱{payment.amount_paid.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Payment Date</p>
                                                    <p className="font-medium dark:text-gray-200">
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Payer</p>
                                                    <p className="font-medium dark:text-gray-200">{payment.payer_name}</p>
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