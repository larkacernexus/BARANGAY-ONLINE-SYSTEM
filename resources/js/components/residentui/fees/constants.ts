import { Receipt, Wallet, AlertTriangle, Clock } from 'lucide-react';

export const getFeeStatsCards = (stats: any) => [
    {
        title: 'Total Fees',
        value: stats?.total_fees || 0,
        icon: Receipt,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        trend: '+12.5%',
        trendUp: true,
    },
    {
        title: 'Total Paid',
        value: `₱${(stats?.total_paid || 0).toLocaleString()}`,
        icon: Wallet,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        trend: '+8.2%',
        trendUp: true,
    },
    {
        title: 'Balance Due',
        value: `₱${(stats?.total_balance || 0).toLocaleString()}`,
        icon: AlertTriangle,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        trend: stats?.total_balance > 0 ? 'Needs attention' : 'All paid',
        trendUp: false,
    },
    {
        title: 'Pending',
        value: stats?.pending_fees || 0,
        icon: Clock,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        badge: stats?.overdue_fees ? `${stats.overdue_fees} overdue` : null,
    },
];