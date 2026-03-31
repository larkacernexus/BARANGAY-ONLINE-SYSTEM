// components/residentui/receipts/receipt-stats-cards.tsx (Fixed)

import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ReceiptStats } from '@/types/portal/receipts/receipt.types';
import { Receipt, DollarSign, CreditCard, Clock } from 'lucide-react';

interface ReceiptStatsCardsProps {
    stats: ReceiptStats;
    loading?: boolean;
    formatCurrency: (amount: string | number) => string;
}

export function ReceiptStatsCards({ stats, loading, formatCurrency }: ReceiptStatsCardsProps) {
    // Helper function to determine if trend is positive
    const getTrendPositive = (value: number) => value > 0;
    
    const cards = [
        {
            title: 'Total Receipts',
            value: stats.total_count?.toString() || '0',
            icon: Receipt,
            trend: stats.this_month_count ? {
                value: stats.this_month_count,
                positive: getTrendPositive(stats.this_month_count)
            } : undefined,
            color: 'blue' as const
        },
        {
            title: 'Total Amount',
            value: formatCurrency(stats.total_amount_raw || 0),
            icon: DollarSign,
            trend: stats.this_month_amount_raw ? {
                value: formatCurrency(stats.this_month_amount_raw),
                positive: getTrendPositive(stats.this_month_amount_raw)
            } : undefined,
            color: 'green' as const
        },
        {
            title: 'Paid',
            value: stats.paid_count?.toString() || '0',
            icon: CreditCard,
            color: 'emerald' as const
        },
        {
            title: 'Pending',
            value: stats.pending_count?.toString() || '0',
            icon: Clock,
            color: 'orange' as const
        }
    ];

    return <ModernStatsCards cards={cards} loading={loading} />;
}