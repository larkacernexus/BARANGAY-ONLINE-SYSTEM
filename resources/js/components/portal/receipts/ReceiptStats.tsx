// components/residentui/receipts/ReceiptStats.tsx

import { Receipt, Calendar, FileText, CreditCard } from 'lucide-react';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ReceiptStats as ReceiptStatsType } from '@/types/portal/receipts/receipt.types';

interface ReceiptStatsProps {
    stats: ReceiptStatsType;
    formatCurrency: (amount: string | number) => string;
    loading?: boolean;
}

export const ReceiptStats = ({ stats, formatCurrency, loading = false }: ReceiptStatsProps) => {
    const totalItems = (stats.clearance_count || 0) + (stats.fee_count || 0) + (stats.official_count || 0);
    
    const cards = [
        {
            title: 'Total Receipts',
            value: (stats.total_count || 0).toString(),
            icon: Receipt,
            iconColor: 'text-blue-500',
            iconBgColor: 'bg-blue-100 dark:bg-blue-900/20',
            trend: { 
                value: `${totalItems} total items`, 
                positive: true 
            },
            footer: `Total Amount: ${formatCurrency(stats.total_amount_raw || 0)}`,
        },
        {
            title: 'This Month',
            value: (stats.this_month_count || 0).toString(),
            icon: Calendar,
            iconColor: 'text-green-500',
            iconBgColor: 'bg-green-100 dark:bg-green-900/20',
            trend: { 
                value: `${stats.this_month_count || 0} receipts`, 
                positive: true 
            },
            footer: `Amount: ${formatCurrency(stats.this_month_amount_raw || 0)}`,
        },
        {
            title: 'Clearance Fees',
            value: (stats.clearance_count || 0).toString(),
            icon: FileText,
            iconColor: 'text-purple-500',
            iconBgColor: 'bg-purple-100 dark:bg-purple-900/20',
            trend: { 
                value: `${stats.clearance_count || 0} receipts`, 
                positive: true 
            },
            footer: 'Paid clearance receipts',
        },
        {
            title: 'Other Fees',
            value: (stats.fee_count || 0).toString(),
            icon: CreditCard,
            iconColor: 'text-orange-500',
            iconBgColor: 'bg-orange-100 dark:bg-orange-900/20',
            trend: { 
                value: `${stats.fee_count || 0} receipts`, 
                positive: true 
            },
            footer: 'Barangay fees & charges',
        },
    ];

    return <ModernStatsCards cards={cards} loading={loading} />;
};