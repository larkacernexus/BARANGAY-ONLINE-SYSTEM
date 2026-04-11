// /components/residentui/fees/constants.ts
import { Receipt, DollarSign, Clock, AlertCircle, CheckCircle, Calendar, FileText } from 'lucide-react';
import { Fee } from '@/types/portal/fees/my-fees';

// Helper function to calculate actual fee amount from fee data
const calculateActualFeeAmount = (fee: Fee): number => {
    // If balance exists and is > 0, use that (this seems to be the actual fee amount)
    if (fee.balance && fee.balance > 0) {
        return fee.balance;
    }
    
    // If total_amount exists and is > 0, use that
    if (fee.total_amount && fee.total_amount > 0) {
        return fee.total_amount;
    }
    
    // If amount exists and is > 0, use that
    if (fee.amount && fee.amount > 0) {
        return fee.amount;
    }
    
    // If amount_paid is negative, the absolute value might be the actual fee
    if (fee.amount_paid && fee.amount_paid < 0) {
        return Math.abs(fee.amount_paid);
    }
    
    return 0;
};

// Helper to calculate paid amount correctly
const calculatePaidAmount = (fee: Fee): number => {
    // For paid status, the actual fee amount should be considered paid
    if (fee.status === 'Paid') {
        return calculateActualFeeAmount(fee);
    }
    
    // If amount_paid is positive, use that
    if (fee.amount_paid && fee.amount_paid > 0) {
        return fee.amount_paid;
    }
    
    return 0;
};

// Updated stats cards that accepts fees array for accurate calculation
export const getFeeStatsCards = (stats: any, feesData?: Fee[]) => {
    // If we have fees data, calculate accurate amounts from the actual fees
    if (feesData && feesData.length > 0) {
        // Calculate total fees amount
        const totalAmount = feesData.reduce((sum, fee) => {
            return sum + calculateActualFeeAmount(fee);
        }, 0);
        
        // Calculate paid amount
        const paidAmount = feesData.reduce((sum, fee) => {
            if (fee.status === 'Paid') {
                return sum + calculateActualFeeAmount(fee);
            }
            return sum + calculatePaidAmount(fee);
        }, 0);
        
        // Calculate pending amount
        const pendingAmount = feesData.reduce((sum, fee) => {
            if (fee.status === 'Issued' || fee.status === 'Pending') {
                return sum + calculateActualFeeAmount(fee);
            }
            return sum;
        }, 0);
        
        // Calculate overdue amount
        const overdueAmount = feesData.reduce((sum, fee) => {
            if (fee.status === 'Overdue') {
                return sum + calculateActualFeeAmount(fee);
            }
            return sum;
        }, 0);
        
        // Calculate counts
        const totalCount = feesData.length;
        const paidCount = feesData.filter(fee => fee.status === 'Paid').length;
        const pendingCount = feesData.filter(fee => fee.status === 'Pending' || fee.status === 'Issued').length;
        const overdueCount = feesData.filter(fee => fee.status === 'Overdue').length;
        
        // Calculate payment rate
        const paymentRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        
        return [
            {
                title: 'Total Fees',
                value: `₱${totalAmount.toLocaleString()}`,
                icon: Receipt,
                iconColor: 'text-blue-600 dark:text-blue-400',
                iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
                trend: {
                    value: `${totalCount} items`,
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
                    value: `${pendingCount} pending`,
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
                    value: `${overdueCount} overdue`,
                    positive: false
                },
                footer: 'Past due date'
            }
        ];
    }
    
    // Fallback to stats object if feesData not provided
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

// Alternative stats cards that show balance instead of pending
export const getAlternativeFeeStatsCards = (stats: any, feesData?: Fee[]) => {
    if (feesData && feesData.length > 0) {
        const totalAmount = feesData.reduce((sum, fee) => sum + calculateActualFeeAmount(fee), 0);
        const paidAmount = feesData.reduce((sum, fee) => {
            if (fee.status === 'Paid') {
                return sum + calculateActualFeeAmount(fee);
            }
            return sum + calculatePaidAmount(fee);
        }, 0);
        const balanceAmount = totalAmount - paidAmount;
        const totalCount = feesData.length;
        const paidCount = feesData.filter(fee => fee.status === 'Paid').length;
        const unpaidCount = totalCount - paidCount;
        
        return [
            {
                title: 'Total Assessments',
                value: totalCount.toString(),
                icon: FileText,
                iconColor: 'text-purple-600 dark:text-purple-400',
                iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
                footer: 'Total fee items'
            },
            {
                title: 'Total Amount',
                value: `₱${totalAmount.toLocaleString()}`,
                icon: DollarSign,
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                iconBgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                footer: 'Total assessments'
            },
            {
                title: 'Paid',
                value: `₱${paidAmount.toLocaleString()}`,
                icon: CheckCircle,
                iconColor: 'text-green-600 dark:text-green-400',
                iconBgColor: 'bg-green-50 dark:bg-green-900/20',
                trend: {
                    value: `${paidCount} payments`,
                    positive: true
                },
                footer: 'Successfully paid'
            },
            {
                title: 'Balance',
                value: `₱${balanceAmount.toLocaleString()}`,
                icon: AlertCircle,
                iconColor: 'text-orange-600 dark:text-orange-400',
                iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
                trend: {
                    value: `${unpaidCount} unpaid`,
                    positive: false
                },
                footer: 'Remaining balance'
            }
        ];
    }
    
    // Fallback to stats object
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