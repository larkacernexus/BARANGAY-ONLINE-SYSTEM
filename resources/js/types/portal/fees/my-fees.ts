// types/fee.ts

/**
 * Core Fee interface - single source of truth for all fee-related types
 */
export interface Fee {
    id: number;
    fee_code?: string;
    fee_type?: string;
    fee_type_name?: string;
    category?: string;
    amount?: number;
    status?: 'paid' | 'pending' | 'overdue' | string;
    due_date?: string;
    created_at?: string;
    paid_at?: string;
    resident_name?: string;
    resident_id?: number;
    description?: string;
    reference_number?: string;
    notes?: string;
    is_image?: boolean;
    mime_type?: string;
    file_url?: string;
    file_path?: string;
    file_name?: string;
    original_name?: string;
    file_size?: number;
    formatted_size?: string;
    [key: string]: any; // Allow for additional properties
}

/**
 * Paginated response structure for fees
 */
export interface FeesPaginatedResponse {
    data: Fee[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}


export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name: string;
    purok?: string;
    purok_id?: number;
    contact_number?: string;
    email?: string;
    birth_date?: string;
    age?: number;
    gender?: string;
    civil_status?: string;
    occupation?: string;
    address?: string;
    is_voter?: boolean;
    status?: string;
    
}


/**
 * Fee statistics structure
 */
export interface FeeStats {
    total_fees?: number;
    paid_fees?: number;
    pending_fees?: number;
    overdue_fees?: number;
    total_amount?: number;
    paid_amount?: number;
    pending_amount?: number;
    overdue_amount?: number;
    collection_rate?: number;
    [key: string]: any;
}

/**
 * Fee type structure
 */
export interface FeeType {
    id: number;
    name: string;
    code?: string;
    description?: string;
    amount?: number;
    is_required?: boolean;
    frequency?: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
    [key: string]: any;
}

/**
 * Fee payment structure
 */
export interface FeePayment {
    id: number;
    fee_id: number;
    amount_paid: number;
    payment_date: string;
    payment_method?: string;
    reference_number?: string;
    received_by?: string;
    notes?: string;
    [key: string]: any;
}

/**
 * Fee filter structure
 */
export interface FeeFilters {
    search?: string;
    status?: string;
    fee_type?: string;
    resident?: string;
    year?: string;
    month?: string;
    page?: string;
    per_page?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    [key: string]: any;
}

/**
 * Fee form data structure for create/update
 */
export interface FeeFormData {
    resident_id?: number;
    fee_type_id?: number;
    amount?: number;
    due_date?: string;
    description?: string;
    status?: string;
    notes?: string;
    [key: string]: any;
}

/**
 * Fee summary card data
 */
export interface FeeSummaryCard {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    description?: string;
    color?: string;
}

/**
 * Fee export options
 */
export interface FeeExportOptions {
    format: 'csv' | 'pdf' | 'excel';
    includeHeaders?: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    statuses?: string[];
    feeTypes?: number[];
}

/**
 * Fee notification settings
 */
export interface FeeNotificationSettings {
    email_notifications: boolean;
    sms_notifications: boolean;
    reminder_days: number;
    overdue_reminders: boolean;
}

/**
 * Utility type for fee status
 */
export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded';

/**
 * Utility type for fee frequency
 */
export type FeeFrequency = 'one-time' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Utility type for payment method
 */
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'online_payment' | 'gcash' | 'paymaya';

/**
 * Helper function to check if a fee is overdue
 */
export const isFeeOverdue = (fee: Fee): boolean => {
    if (!fee.due_date || fee.status === 'paid') return false;
    const dueDate = new Date(fee.due_date);
    const today = new Date();
    return dueDate < today;
};

/**
 * Helper function to check if a fee is paid
 */
export const isFeePaid = (fee: Fee): boolean => {
    return fee.status === 'paid';
};

/**
 * Helper function to get fee status label
 */
export const getFeeStatusLabel = (status?: string): string => {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'pending':
            return 'Pending';
        case 'overdue':
            return 'Overdue';
        case 'cancelled':
            return 'Cancelled';
        case 'refunded':
            return 'Refunded';
        default:
            return status || 'Unknown';
    }
};

/**
 * Helper function to get fee status color
 */
export const getFeeStatusColor = (status?: string): string => {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'cancelled':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        case 'refunded':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

/**
 * Helper function to format fee amount
 */
export const formatFeeAmount = (amount?: number): string => {
    if (!amount && amount !== 0) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Helper function to calculate total amount from fees
 */
export const calculateTotalAmount = (fees: Fee[]): number => {
    return fees.reduce((total, fee) => total + (fee.amount || 0), 0);
};

/**
 * Helper function to calculate paid amount from fees
 */
export const calculatePaidAmount = (fees: Fee[]): number => {
    return fees
        .filter(fee => fee.status === 'paid')
        .reduce((total, fee) => total + (fee.amount || 0), 0);
};

/**
 * Helper function to calculate pending amount from fees
 */
export const calculatePendingAmount = (fees: Fee[]): number => {
    return fees
        .filter(fee => fee.status === 'pending')
        .reduce((total, fee) => total + (fee.amount || 0), 0);
};

/**
 * Helper function to calculate overdue amount from fees
 */
export const calculateOverdueAmount = (fees: Fee[]): number => {
    return fees
        .filter(fee => fee.status === 'overdue')
        .reduce((total, fee) => total + (fee.amount || 0), 0);
};

/**
 * Helper function to group fees by status
 */
export const groupFeesByStatus = (fees: Fee[]): Record<string, Fee[]> => {
    return fees.reduce((groups, fee) => {
        const status = fee.status || 'unknown';
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(fee);
        return groups;
    }, {} as Record<string, Fee[]>);
};

/**
 * Helper function to group fees by fee type
 */
export const groupFeesByType = (fees: Fee[]): Record<string, Fee[]> => {
    return fees.reduce((groups, fee) => {
        const type = fee.fee_type || fee.fee_type_name || 'other';
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(fee);
        return groups;
    }, {} as Record<string, Fee[]>);
};

/**
 * Helper function to filter fees by status
 */
export const filterFeesByStatus = (fees: Fee[], status?: string): Fee[] => {
    if (!status || status === 'all') return fees;
    return fees.filter(fee => fee.status === status);
};

/**
 * Helper function to filter fees by date range
 */
export const filterFeesByDateRange = (fees: Fee[], startDate?: string, endDate?: string): Fee[] => {
    if (!startDate && !endDate) return fees;
    
    return fees.filter(fee => {
        if (!fee.due_date) return false;
        const dueDate = new Date(fee.due_date);
        
        if (startDate && endDate) {
            return dueDate >= new Date(startDate) && dueDate <= new Date(endDate);
        } else if (startDate) {
            return dueDate >= new Date(startDate);
        } else if (endDate) {
            return dueDate <= new Date(endDate);
        }
        
        return true;
    });
};

/**
 * Helper function to sort fees
 */
export const sortFees = (fees: Fee[], sortBy: keyof Fee, sortOrder: 'asc' | 'desc' = 'desc'): Fee[] => {
    return [...fees].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
    });
};