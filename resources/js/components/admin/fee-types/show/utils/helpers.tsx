// resources/js/Pages/Admin/FeeTypes/utils/helpers.tsx
import React from 'react';
import { 
    CheckCircle, 
    XCircle, 
    FileText, 
    DollarSign, 
    CalendarDays, 
    Users,
    Tag,
    Award,
    PersonStanding,
    Percent,
    AlertTriangle,
    AlertCircle,
    Check,
    X
} from 'lucide-react';

// Format currency
export const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount)) {
        return '₱0.00';
    }
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Format date
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

// Format date with time
export const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid date';
    }
};

// Format time ago
export const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return formatDate(dateString);
    } catch {
        return 'Invalid date';
    }
};

// Get category icon
export const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
        tax: DollarSign,
        clearance: FileText,
        certificate: FileText,
        service: FileText,
        rental: CalendarDays,
        fine: AlertTriangle,
        contribution: Users,
        other: Tag,
    };
    return icons[category] || Tag;
};

// Get category color
export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        tax: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        clearance: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        certificate: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        service: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        rental: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        fine: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        contribution: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        other: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};

// Get category label
export const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        tax: 'Taxes',
        clearance: 'Clearances',
        certificate: 'Certificates',
        service: 'Services',
        rental: 'Rentals',
        fine: 'Fines',
        contribution: 'Contributions',
        other: 'Other',
    };
    return labels[category] || category;
};

// Get amount type label
export const getAmountTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        fixed: 'Fixed Amount',
        per_unit: 'Per Unit',
        computed: 'Computed',
    };
    return labels[type] || type;
};

// Get applicable to label
export const getApplicableToLabel = (type: string): string => {
    const labels: Record<string, string> = {
        all_residents: 'All Residents',
        property_owners: 'Property Owners',
        business_owners: 'Business Owners',
        households: 'Households',
        specific_purok: 'Specific Purok',
        specific_zone: 'Specific Zone',
        visitors: 'Visitors',
        other: 'Other',
    };
    return labels[type] || type;
};

// Get frequency label
export const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
        one_time: 'One Time',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        semi_annual: 'Semi-Annual',
        annual: 'Annual',
        bi_annual: 'Bi-Annual',
        custom: 'Custom',
        as_needed: 'As Needed',
    };
    return labels[frequency] || frequency.replace('_', ' ');
};

// Get status icon
export const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" /> : 
        <XCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
};

// Get status variant
export const getStatusVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
};

// Helper function to safely convert field to array
export const getArrayFromField = <T,>(field: any): T[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // If it's a comma-separated string
            if (field.includes(',')) {
                return field.split(',').map(item => item.trim()).filter(Boolean) as T[];
            }
            // If it's a single value
            return [field] as T[];
        }
    }
    return [];
};

// Helper function to safely get discount percentage
export const getDiscountPercentage = (specific: any, general: any): string => {
    if (specific !== null && specific !== undefined && specific !== '') {
        return `${specific}%`;
    }
    if (general !== null && general !== undefined && general !== '') {
        return `${general}%`;
    }
    return '0%';
};

// Get color class for stats
export const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

// Get icon component from string name
export const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
        DollarSign,
        FileText,
        CalendarDays,
        Users,
        Percent,
        Award,
        PersonStanding,
        AlertTriangle,
        AlertCircle,
        Check,
        X,
        Tag,
    };
    return icons[iconName] || FileText;
};

// Check if fee type is new (created within last 7 days)
export const isNew = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
};

// Check if fee type is expired
export const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    return new Date() > expiry;
};

// Check if any discount is enabled
export const hasAnyDiscount = (feeType: any): boolean => {
    // Check direct discount properties
    if (feeType.has_senior_discount || feeType.has_pwd_discount || 
        feeType.has_solo_parent_discount || feeType.has_indigent_discount) {
        return true;
    }
    
    // Check discount_fee_types relationship
    if (feeType.discount_fee_types && feeType.discount_fee_types.some((dft: any) => dft.is_active)) {
        return true;
    }
    
    // Check general discount
    if (feeType.discount_percentage && parseFloat(feeType.discount_percentage as string) > 0) {
        return true;
    }
    
    return false;
};

// Get active discount fee types
export const getActiveDiscountFeeTypes = (discountFeeTypes: any[] = []) => {
    return discountFeeTypes.filter(dft => 
        dft.is_active && dft.discount_type
    );
};

// Get fee status class
export const getFeeStatusClass = (status: string): string => {
    const classes: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};