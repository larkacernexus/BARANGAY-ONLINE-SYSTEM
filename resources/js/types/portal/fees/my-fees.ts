// types/fee.ts

// Define FeeTypeObject separately to avoid index signature issues
export interface FeeTypeObject {
    id: number;
    name: string;
    description?: string;
    amount?: number;
}

// For dynamic properties, create a more flexible type if needed
export interface FlexibleFeeTypeObject extends FeeTypeObject {
    [key: string]: any;
}

/**
 * Core Fee interface - single source of truth for all fee-related types
 */
export interface Fee {
    id: number;
    fee_code?: string;
    fee_type?: FeeTypeObject | string | null;
    name?: any;
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
    
    // Additional properties from your component
    purpose?: string;
    is_own_fee?: boolean;
    resident_info?: {
        full_name: string;
        contact_number?: string;
        [key: string]: any;
    };
    balance?: number;
    base_amount?: number;
    surcharge_amount?: number;
    penalty_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    amount_paid?: number;
    issue_date?: string;
    billing_period?: string;
    remarks?: string;
    payer_name?: string;
    payer_type?: string;
    address?: string;
    purok?: string;
    zone?: string;
    business_name?: string;
    business_type?: string;
    property_description?: string;
    area?: number;
    valid_from?: string;
    valid_until?: string;
    certificate_number?: string;
    or_number?: string;
    requirements_submitted?: string[] | string;
    
    [key: string]: any;
}

// Helper function to safely get fee type name
export const getFeeTypeName = (fee: Fee): string => {
    if (!fee.fee_type) {
        return fee.fee_type_name || 'N/A';
    }
    
    // Check if fee_type is an object (has name property)
    if (typeof fee.fee_type === 'object' && fee.fee_type !== null && 'name' in fee.fee_type) {
        return fee.fee_type.name;
    }
    
    // If it's a string
    if (typeof fee.fee_type === 'string') {
        return fee.fee_type;
    }
    
    return fee.fee_type_name || 'N/A';
};

// Helper function to get fee type as string for grouping
export const getFeeTypeString = (fee: Fee): string => {
    if (!fee) return 'other';
    
    // Handle object case
    if (fee.fee_type && typeof fee.fee_type === 'object' && 'name' in fee.fee_type) {
        return fee.fee_type.name || 'other';
    }
    
    // Handle string case
    if (typeof fee.fee_type === 'string') {
        return fee.fee_type;
    }
    
    // Fallback to fee_type_name
    if (fee.fee_type_name) {
        return fee.fee_type_name;
    }
    
    // Default
    return 'other';
};

// Type guard to check if fee_type is an object
export const isFeeTypeObject = (feeType: any): feeType is FeeTypeObject => {
    return feeType && typeof feeType === 'object' && 'id' in feeType && 'name' in feeType;
};

// Rest of your interfaces
export interface FeeAttachment {
    id: number;
    name: string;
    url: string;
    size: number;
    type: string;
    fee_id?: number;
    created_at?: string;
    uploaded_by?: string;
    mime_type?: string;
    file_path?: string;
    original_name?: string;
    [key: string]: any;
}

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

export interface FeeSummaryCard {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    description?: string;
    color?: string;
}

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

export interface FeeNotificationSettings {
    email_notifications: boolean;
    sms_notifications: boolean;
    reminder_days: number;
    overdue_reminders: boolean;
}

export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded';
export type FeeFrequency = 'one-time' | 'monthly' | 'quarterly' | 'yearly';
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'online_payment' | 'gcash' | 'paymaya';

// Helper functions
export const isFeeOverdue = (fee: Fee): boolean => {
    if (!fee.due_date || fee.status === 'paid') return false;
    const dueDate = new Date(fee.due_date);
    const today = new Date();
    return dueDate < today;
};

export const isFeePaid = (fee: Fee): boolean => {
    return fee.status === 'paid';
};

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

export const formatFeeAmount = (amount?: number): string => {
    if (!amount && amount !== 0) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const calculateTotalAmount = (fees: Fee[]): number => {
    return fees.reduce((total, fee) => total + (fee.amount || 0), 0);
};

export const calculatePaidAmount = (fees: Fee[]): number => {
    return fees
        .filter(fee => fee.status === 'paid')
        .reduce((total, fee) => total + (fee.amount || 0), 0);
};

export const calculatePendingAmount = (fees: Fee[]): number => {
    return fees
        .filter(fee => fee.status === 'pending')
        .reduce((total, fee) => total + (fee.amount || 0), 0);
};

export const calculateOverdueAmount = (fees: Fee[]): number => {
    return fees
        .filter(fee => fee.status === 'overdue')
        .reduce((total, fee) => total + (fee.amount || 0), 0);
};

export const groupFeesByStatus = (fees: Fee[]): Record<string, Fee[]> => {
    if (!fees || !Array.isArray(fees)) return {};
    
    return fees.reduce((groups, fee) => {
        const status = fee.status || 'unknown';
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(fee);
        return groups;
    }, {} as Record<string, Fee[]>);
};

export const groupFeesByType = (fees: Fee[]): Record<string, Fee[]> => {
    if (!fees || !Array.isArray(fees)) return {};
    
    return fees.reduce((groups, fee) => {
        const type = getFeeTypeString(fee);
        
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(fee);
        return groups;
    }, {} as Record<string, Fee[]>);
};

export const filterFeesByStatus = (fees: Fee[], status?: string): Fee[] => {
    if (!status || status === 'all') return fees;
    return fees.filter(fee => fee.status === status);
};

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

export const sortFees = (fees: Fee[], sortBy: keyof Fee, sortOrder: 'asc' | 'desc' = 'desc'): Fee[] => {
    if (!fees || !Array.isArray(fees)) return [];
    
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