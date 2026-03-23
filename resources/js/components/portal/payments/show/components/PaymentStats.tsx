// payment-show/components/PaymentStats.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { Progress } from '@/components/ui/progress';
import { Receipt, Wallet, TrendingUp, Gift, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Payment } from '@/utils/portal/payments/payment-utils';

interface PaymentStatsProps {
    payment: Payment;
    progress: number;
}

export function PaymentStats({ payment, progress }: PaymentStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {payment.formatted_total}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {payment.formatted_subtotal}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Base Amount</p>
            </ModernCard>

            {(payment.surcharge > 0 || payment.penalty > 0) && (
                <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(payment.surcharge + payment.penalty)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Surcharge + Penalty</p>
                </ModernCard>
            )}

            {payment.discount > 0 && (
                <ModernCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="flex items-center justify-between mb-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {payment.formatted_discount}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Discount</p>
                </ModernCard>
            )}

            <ModernCard className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                <div className="flex items-center justify-between mb-2">
                    <PieChart className="h-5 w-5 text-rose-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {progress}%
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Progress</p>
                <Progress value={progress} className="h-1.5 mt-2 bg-rose-200 dark:bg-rose-900" />
            </ModernCard>
        </div>
    );
}