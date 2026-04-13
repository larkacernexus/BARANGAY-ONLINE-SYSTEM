// /components/residentui/receipts/constants.ts
import { ReceiptItem } from '@/types/portal/receipts/receipt.types';

// Helper function to parse amount to number
const parseAmount = (amount: string | number | undefined | null): number => {
    if (amount === undefined || amount === null || amount === '') return 0;
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
        const cleanAmount = amount.replace(/[₱,]/g, '');
        const parsed = parseFloat(cleanAmount);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

// Helper function to format currency
const formatCurrencyValue = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

// Main stats cards for receipts
export const getReceiptStatsCards = (
    stats: any, 
    receiptsData?: ReceiptItem[],
    formatCurrency?: (amount: string | number | undefined | null) => string
) => {
    const currencyFormatter = formatCurrency || formatCurrencyValue;
    
    // If we have receipts data, calculate accurate amounts from the actual receipts
    if (receiptsData && receiptsData.length > 0) {
        // Calculate total amount
        const totalAmount = receiptsData.reduce((sum, receipt) => {
            return sum + parseAmount(receipt?.amount);
        }, 0);
        
        // Calculate counts by status
        const totalCount = receiptsData.length;
        const paidCount = receiptsData.filter(r => r?.status === 'paid').length;
        const partialCount = receiptsData.filter(r => r?.status === 'partial').length;
        const cancelledCount = receiptsData.filter(r => r?.status === 'cancelled').length;
        
        // Calculate this month's receipts
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthReceipts = receiptsData.filter(r => {
            if (!r?.payment_date) return false;
            const paymentDate = new Date(r.payment_date);
            return paymentDate >= thisMonthStart;
        });
        
        const thisMonthAmount = thisMonthReceipts.reduce((sum, receipt) => {
            return sum + parseAmount(receipt?.amount);
        }, 0);
        
        // Calculate paid amount
        const paidAmount = receiptsData.reduce((sum, receipt) => {
            if (receipt?.status === 'paid') {
                return sum + parseAmount(receipt?.amount);
            }
            return sum;
        }, 0);
        
        return [
            {
                title: 'Total Receipts',
                value: totalCount.toString(),
                iconColor: 'text-blue-600 dark:text-blue-400',
                iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
                trend: {
                    value: `${thisMonthReceipts.length} this month`,
                    positive: true
                },
                footer: `${paidCount} paid, ${partialCount} partial`
            },
            {
                title: 'Total Amount',
                value: currencyFormatter(totalAmount),
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                iconBgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                trend: {
                    value: thisMonthAmount > 0 ? currencyFormatter(thisMonthAmount) : '₱0.00',
                    positive: true
                },
                footer: 'This month'
            },
            {
                title: 'Paid',
                value: currencyFormatter(paidAmount),
                iconColor: 'text-green-600 dark:text-green-400',
                iconBgColor: 'bg-green-50 dark:bg-green-900/20',
                trend: {
                    value: `${paidCount} receipts`,
                    positive: true
                },
                footer: totalAmount > 0 ? `${Math.round((paidAmount / totalAmount) * 100)}% paid` : '0% paid'
            },
            {
                title: 'Partial',
                value: partialCount.toString(),
                iconColor: 'text-yellow-600 dark:text-yellow-400',
                iconBgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                trend: {
                    value: `${partialCount} partial`,
                    positive: false
                },
                footer: 'In progress'
            }
        ];
    }
    
    // Fallback to stats object if receiptsData not provided
    const totalAmount = parseAmount(stats?.total_amount || 0);
    const paidAmount = parseAmount(stats?.paid_amount || 0);
    const thisMonthAmount = parseAmount(stats?.this_month_amount || 0);
    const totalCount = stats?.total_count || 0;
    const paidCount = stats?.paid_count || 0;
    const partialCount = stats?.partial_count || 0;
    const thisMonthCount = stats?.this_month_count || 0;

    return [
        {
            title: 'Total Receipts',
            value: totalCount.toString(),
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: {
                value: `${thisMonthCount} this month`,
                positive: true
            },
            footer: `${paidCount} paid, ${partialCount} partial`
        },
        {
            title: 'Total Amount',
            value: currencyFormatter(totalAmount),
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            trend: {
                value: currencyFormatter(thisMonthAmount),
                positive: true
            },
            footer: 'This month'
        },
        {
            title: 'Paid',
            value: currencyFormatter(paidAmount),
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            trend: {
                value: `${paidCount} receipts`,
                positive: true
            },
            footer: totalAmount > 0 ? `${Math.round((paidAmount / totalAmount) * 100)}% paid` : '0% paid'
        },
        {
            title: 'Partial',
            value: partialCount.toString(),
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            iconBgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            trend: {
                value: `${partialCount} partial`,
                positive: false
            },
            footer: 'In progress'
        }
    ];
};

// Alternative stats cards for receipts (detailed breakdown)
export const getAlternativeReceiptStatsCards = (
    stats: any, 
    receiptsData?: ReceiptItem[],
    formatCurrency?: (amount: string | number | undefined | null) => string
) => {
    const currencyFormatter = formatCurrency || formatCurrencyValue;
    
    if (receiptsData && receiptsData.length > 0) {
        const totalCount = receiptsData.length;
        const paidCount = receiptsData.filter(r => r?.status === 'paid').length;
        const partialCount = receiptsData.filter(r => r?.status === 'partial').length;
        const cancelledCount = receiptsData.filter(r => r?.status === 'cancelled').length;
        
        const totalAmount = receiptsData.reduce((sum, r) => sum + parseAmount(r?.amount), 0);
        const paidAmount = receiptsData.filter(r => r?.status === 'paid')
            .reduce((sum, r) => sum + parseAmount(r?.amount), 0);
        const partialAmount = receiptsData.filter(r => r?.status === 'partial')
            .reduce((sum, r) => sum + parseAmount(r?.amount), 0);
        
        // Get unique months for this year
        const currentYear = new Date().getFullYear();
        const thisYearReceipts = receiptsData.filter(r => {
            if (!r?.payment_date) return false;
            return new Date(r.payment_date).getFullYear() === currentYear;
        });
        
        const thisYearAmount = thisYearReceipts.reduce((sum, r) => sum + parseAmount(r?.amount), 0);
        
        return [
            {
                title: 'All Receipts',
                value: totalCount.toString(),
                iconColor: 'text-purple-600 dark:text-purple-400',
                iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
                trend: {
                    value: `${thisYearReceipts.length} this year`,
                    positive: true
                },
                footer: `${paidCount} paid, ${partialCount} partial`
            },
            {
                title: 'Total Value',
                value: currencyFormatter(totalAmount),
                iconColor: 'text-blue-600 dark:text-blue-400',
                iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
                trend: {
                    value: currencyFormatter(thisYearAmount),
                    positive: true
                },
                footer: 'This year'
            },
            {
                title: 'Paid',
                value: currencyFormatter(paidAmount),
                iconColor: 'text-green-600 dark:text-green-400',
                iconBgColor: 'bg-green-50 dark:bg-green-900/20',
                trend: {
                    value: `${paidCount} receipts`,
                    positive: true
                },
                footer: `${Math.round((paidCount / totalCount) * 100)}% of total`
            },
            {
                title: 'Unpaid',
                value: currencyFormatter(partialAmount),
                iconColor: 'text-orange-600 dark:text-orange-400',
                iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
                trend: {
                    value: `${partialCount} partial`,
                    positive: false
                },
                footer: `${cancelledCount} cancelled`
            }
        ];
    }
    
    // Fallback to stats object
    const totalCount = stats?.total_count || 0;
    const paidCount = stats?.paid_count || 0;
    const partialCount = stats?.partial_count || 0;
    const cancelledCount = stats?.cancelled_count || 0;
    const totalAmount = parseAmount(stats?.total_amount || 0);
    const paidAmount = parseAmount(stats?.paid_amount || 0);
    const partialAmount = parseAmount(stats?.partial_amount || 0);
    const thisYearAmount = parseAmount(stats?.current_year_total || 0);
    const thisYearCount = stats?.current_year_count || 0;

    return [
        {
            title: 'All Receipts',
            value: totalCount.toString(),
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
            trend: {
                value: `${thisYearCount} this year`,
                positive: true
            },
            footer: `${paidCount} paid, ${partialCount} partial`
        },
        {
            title: 'Total Value',
            value: currencyFormatter(totalAmount),
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: {
                value: currencyFormatter(thisYearAmount),
                positive: true
            },
            footer: 'This year'
        },
        {
            title: 'Paid',
            value: currencyFormatter(paidAmount),
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            trend: {
                value: `${paidCount} receipts`,
                positive: true
            },
            footer: totalCount > 0 ? `${Math.round((paidCount / totalCount) * 100)}% of total` : '0% of total'
        },
        {
            title: 'Unpaid',
            value: currencyFormatter(partialAmount),
            iconColor: 'text-orange-600 dark:text-orange-400',
            iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
            trend: {
                value: `${partialCount} partial`,
                positive: false
            },
            footer: `${cancelledCount} cancelled`
        }
    ];
};

// Simple stats cards for receipt summary (2-card layout)
export const getSimpleReceiptStatsCards = (
    stats: any, 
    receiptsData?: ReceiptItem[],
    formatCurrency?: (amount: string | number | undefined | null) => string
) => {
    const currencyFormatter = formatCurrency || formatCurrencyValue;
    
    if (receiptsData && receiptsData.length > 0) {
        const totalCount = receiptsData.length;
        const totalAmount = receiptsData.reduce((sum, r) => sum + parseAmount(r?.amount), 0);
        const paidCount = receiptsData.filter(r => r?.status === 'paid').length;
        const partialCount = receiptsData.filter(r => r?.status === 'partial').length;
        
        return [
            {
                title: 'Receipts',
                value: totalCount.toString(),
                iconColor: 'text-blue-600 dark:text-blue-400',
                iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
                trend: {
                    value: `${paidCount} paid`,
                    positive: true
                },
                footer: `${partialCount} partial`
            },
            {
                title: 'Total Value',
                value: currencyFormatter(totalAmount),
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                iconBgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                trend: {
                    value: `${totalCount} items`,
                    positive: true
                },
                footer: 'All time'
            }
        ];
    }
    
    // Fallback to stats object
    const totalCount = stats?.total_count || 0;
    const totalAmount = parseAmount(stats?.total_amount || 0);
    const paidCount = stats?.paid_count || 0;
    const partialCount = stats?.partial_count || 0;

    return [
        {
            title: 'Receipts',
            value: totalCount.toString(),
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: {
                value: `${paidCount} paid`,
                positive: true
            },
            footer: `${partialCount} partial`
        },
        {
            title: 'Total Value',
            value: currencyFormatter(totalAmount),
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            trend: {
                value: `${totalCount} items`,
                positive: true
            },
            footer: 'All time'
        }
    ];
};