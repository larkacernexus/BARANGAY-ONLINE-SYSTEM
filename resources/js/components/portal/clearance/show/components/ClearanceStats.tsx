// clearance-show/components/ClearanceStats.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { ClearanceRequest } from '@/types/portal/clearances/clearance.types';
import { formatCurrency } from '@/components/residentui/lib/resident-ui-utils';
import { DollarSign, Receipt, Wallet, TrendingUp } from 'lucide-react';

interface ClearanceStatsProps {
    clearance: ClearanceRequest;
    feeAmount: number;
    totalPaid: number;
    balance: number;
}

export function ClearanceStats({ clearance, feeAmount, totalPaid, balance }: ClearanceStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(feeAmount)}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Fee</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalPaid)}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(balance)}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Balance</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {clearance.clearance_type?.processing_days || 0} days
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Processing Time</p>
            </ModernCard>
        </div>
    );
}