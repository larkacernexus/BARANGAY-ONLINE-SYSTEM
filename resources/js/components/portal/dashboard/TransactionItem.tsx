// /components/residentui/dashboard/TransactionItem.tsx
import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatCurrency, getStatusBadge } from '@/utils/portal/dashboard/dashboard-utils';
import { useMobile } from '@/components/residentui/hooks/use-mobile'; 

interface TransactionItemProps {
    transaction: {
        id: string;
        fee_type?: string;
        created_at: string;
        amount: number;
        status: string;
    };
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const isMobile = useMobile();
    
    const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        completed: CheckCircle2,
        paid: CheckCircle2,
        pending: Clock,
        overdue: AlertTriangle,
        rejected: XCircle,
    };

    const StatusIcon = statusIcons[transaction.status?.toLowerCase()] || Info;

    return (
        <div className="flex items-center justify-between py-2 sm:py-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl transition-colors">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{transaction.fee_type || 'Payment'}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.created_at)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(transaction.amount)}</p>
                {!isMobile ? (
                    <div className={cn(`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getStatusBadge(transaction.status)}`)}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium capitalize whitespace-nowrap">{transaction.status}</span>
                    </div>
                ) : (
                    <span className={cn(`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(transaction.status)} whitespace-nowrap`)}>
                        {transaction.status}
                    </span>
                )}
            </div>
        </div>
    );
};