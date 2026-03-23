// payment-show/utils/payment-utils.ts
import { PaymentStatus, PaymentMethod, Payment, PaymentAttachment, PaymentAuditLog, PaymentNote, PaymentItem } from '@/types/portal/payments/payment.types';
import { CheckCircle, Clock, AlertCircle, XCircle, RefreshCw, Wallet, Banknote, Smartphone, Landmark, FileText, Globe, CreditCard } from 'lucide-react';

export const getPaymentStatusConfig = (status: PaymentStatus) => {
    const configs: Record<PaymentStatus, { label: string; color: string; icon: any; gradient: string; bgColor: string }> = {
        completed: {
            label: 'Completed',
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            gradient: 'from-emerald-500 to-teal-500'
        },
        paid: {
            label: 'Paid',
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            gradient: 'from-emerald-500 to-teal-500'
        },
        pending: {
            label: 'Pending',
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            gradient: 'from-amber-500 to-orange-500'
        },
        overdue: {
            label: 'Overdue',
            icon: AlertCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            gradient: 'from-red-500 to-pink-500'
        },
        cancelled: {
            label: 'Cancelled',
            icon: XCircle,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-900',
            gradient: 'from-gray-500 to-slate-500'
        },
        refunded: {
            label: 'Refunded',
            icon: RefreshCw,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            gradient: 'from-purple-500 to-pink-500'
        },
        partially_paid: {
            label: 'Partially Paid',
            icon: Wallet,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            gradient: 'from-blue-500 to-indigo-500'
        },
    };
    return configs[status] || configs.pending;
};

export const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons: Record<PaymentMethod, any> = {
        cash: Banknote,
        gcash: Smartphone,
        maya: Smartphone,
        bank: Landmark,
        check: FileText,
        online: Globe,
        card: CreditCard,
    };
    return icons[method] || CreditCard;
};

export const getPaymentMethodColor = (method: PaymentMethod): string => {
    const colors: Record<PaymentMethod, string> = {
        cash: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        gcash: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        maya: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        bank: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        check: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        online: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        card: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return colors[method] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
};

export const calculateProgress = (payment: Payment): number => {
    if (payment.status === 'completed' || payment.status === 'paid') return 100;
    if (payment.status === 'partially_paid') {
        const paid = payment.total_amount - (payment.subtotal || 0);
        return Math.min(Math.round((paid / payment.total_amount) * 100), 100);
    }
    return 0;
};

export const numberToWords = (num: number | string): string => {
    const numericValue = typeof num === 'number' ? num : parseFloat(num) || 0;
    if (numericValue === 0) return 'Zero Pesos Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convert = (n: number): string => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        return '';
    };

    const whole = Math.floor(numericValue);
    const cents = Math.round((numericValue - whole) * 100);

    if (cents === 0) {
        return convert(whole) + ' Pesos Only';
    }
    return convert(whole) + ' Pesos and ' + convert(cents) + ' Centavos Only';
};

export const getStringValue = (value: string | { name?: string } | null | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.name || '';
};

export const toNumber = (value: number | string | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export type { Payment };
export type { PaymentMethod };
export type { PaymentAttachment };
export type { PaymentAuditLog };
export type { PaymentItem };
export type { PaymentNote
 };








