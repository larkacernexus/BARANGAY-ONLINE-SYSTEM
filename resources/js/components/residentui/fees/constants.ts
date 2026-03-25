// /components/residentui/fees/constants.ts
import { Receipt, DollarSign, Clock, AlertCircle, CheckCircle, Calendar, FileText } from 'lucide-react';

export const getFeeStatsCards = (stats: any) => {
    const totalAmount = stats.total_amount || 0;
    const paidAmount = stats.paid_amount || 0;
    const pendingAmount = stats.pending_amount || 0;
    const overdueAmount = stats.overdue_amount || 0;
    const paymentRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return [
        {
            title: 'Total Fees',
            value: `₱${totalAmount.toLocaleString()}`,
            icon: Receipt,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: {
                value: `${stats.total_count || 0} items`,
                positive: true
            },
            footer: 'Total assessments'
        },
        {
            title: 'Paid Amount',
            value: `₱${paidAmount.toLocaleString()}`,
            icon: CheckCircle,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            trend: {
                value: `${Math.round(paymentRate)}%`,
                positive: true
            },
            footer: 'Payment rate'
        },
        {
            title: 'Pending',
            value: `₱${pendingAmount.toLocaleString()}`,
            icon: Clock,
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            iconBgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            trend: {
                value: `${stats.pending_count || 0} pending`,
                positive: false
            },
            footer: 'Awaiting payment'
        },
        {
            title: 'Overdue',
            value: `₱${overdueAmount.toLocaleString()}`,
            icon: AlertCircle,
            iconColor: 'text-red-600 dark:text-red-400',
            iconBgColor: 'bg-red-50 dark:bg-red-900/20',
            trend: {
                value: `${stats.overdue_count || 0} overdue`,
                positive: false
            },
            footer: 'Past due date'
        }
    ];
};

// Alternative if you want to show different stats
export const getAlternativeFeeStatsCards = (stats: any) => {
    return [
        {
            title: 'Total Assessments',
            value: stats.total_count || 0,
            icon: FileText,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
            footer: 'Total fee items'
        },
        {
            title: 'Total Amount',
            value: `₱${(stats.total_amount || 0).toLocaleString()}`,
            icon: DollarSign,
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            footer: 'Total assessments'
        },
        {
            title: 'Paid',
            value: `₱${(stats.paid_amount || 0).toLocaleString()}`,
            icon: CheckCircle,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            trend: {
                value: `${stats.paid_count || 0} payments`,
                positive: true
            },
            footer: 'Successfully paid'
        },
        {
            title: 'Balance',
            value: `₱${(stats.balance_amount || 0).toLocaleString()}`,
            icon: AlertCircle,
            iconColor: 'text-orange-600 dark:text-orange-400',
            iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
            trend: {
                value: `${stats.unpaid_count || 0} unpaid`,
                positive: false
            },
            footer: 'Remaining balance'
        }
    ];
};