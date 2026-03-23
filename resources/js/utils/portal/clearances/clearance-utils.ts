// clearance-show/utils/clearance-utils.ts
import { STATUS_CONFIG } from '@/components/residentui/constants/resident-ui';
import { PaymentItem, ClearanceStatus, ClearanceRequest } from '@/types/portal/clearances/clearance.types';

export const getStatusConfig = (status: ClearanceStatus | string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
};

export const calculateTotalPaid = (paymentItems: PaymentItem[]): number => {
    let total = 0;
    paymentItems.forEach(item => {
        const amount = typeof item.total_amount === 'string' 
            ? parseFloat(item.total_amount) 
            : item.total_amount;
        if (!isNaN(amount)) {
            total += amount;
        }
    });
    return total;
};

export const calculateBalance = (feeAmount: number | string, totalPaid: number): number => {
    const fee = typeof feeAmount === 'string' ? parseFloat(feeAmount) : feeAmount;
    return fee - totalPaid;
};

export const isPaymentRequired = (clearance: ClearanceRequest): boolean => {
    if (!clearance.clearance_type?.requires_payment) return false;
    const totalPaid = calculateTotalPaid(clearance.payment_items || []);
    const feeAmount = typeof clearance.fee_amount === 'string' ? parseFloat(clearance.fee_amount) : clearance.fee_amount;
    const balance = calculateBalance(feeAmount, totalPaid);
    return balance > 0;
};

export const formatDateWithFormat = (dateString: string | null | undefined, format: string = 'MMM D, YYYY'): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export const getUrgencyConfig = (urgency: string) => {
    const urgencyConfig = {
        normal: { label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-50' },
        rush: { label: 'Rush', color: 'text-amber-600', bgColor: 'bg-amber-50' },
        express: { label: 'Express', color: 'text-red-600', bgColor: 'bg-red-50' }
    };
    return urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.normal;
};