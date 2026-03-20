// components/admin/dashboard/RecentPayments.tsx
import { Link } from '@inertiajs/react';
import { ArrowRight, CreditCard } from 'lucide-react';

interface Payment {
    id: number;
    payer_name: string;
    total_amount: number;
    payment_date: string;
    payment_method: string;
    certificate_type?: string;
}

interface RecentPaymentsProps {
    payments: Payment[];
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
    if (!payments || payments.length === 0) {
        return (
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
                </div>
                <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent payments</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
                <Link 
                    href="/admin/payments"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                    View all
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            
            <div className="space-y-3">
                {payments.map((payment) => (
                    <Link
                        key={payment.id}
                        href={`/admin/payments/${payment.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                                <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {payment.payer_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {payment.payment_method} • {new Date(payment.payment_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                ₱{payment.total_amount.toLocaleString()}
                            </p>
                            {payment.certificate_type && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {payment.certificate_type}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}