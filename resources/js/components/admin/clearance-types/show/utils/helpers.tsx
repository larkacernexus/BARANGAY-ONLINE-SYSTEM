// resources/js/Pages/Admin/ClearanceTypes/utils/helpers.tsx

import React from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {
    CheckCircle,
    XCircle,
    Award,
    HeartHandshake,
    Home,
    Briefcase,
    Users,
    Heart,
    User,
} from 'lucide-react';

// ========== DATE FORMATTING ==========

export const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch {
        return 'Invalid date';
    }
};

export const formatRelativeTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
        return 'Invalid date';
    }
};

// ========== CURRENCY & NUMBER FORMATTING ==========

export const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

export const getNumberValue = (value: number | string): number => {
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// ========== STATUS HELPERS ==========

export const getStatusColor = (isActive: boolean) => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};

export const getStatusIcon = (isActive: boolean) => {
    return isActive
        ? <CheckCircle className="h-3 w-3" />
        : <XCircle className="h-3 w-3" />;
};

export const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
};

export const getDiscountableBadgeVariant = (isDiscountable: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isDiscountable ? 'default' : 'secondary';
};

export const getPaymentBadgeVariant = (requiresPayment: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return requiresPayment ? 'destructive' : 'secondary';
};

export const getApprovalBadgeVariant = (requiresApproval: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return requiresApproval ? 'destructive' : 'secondary';
};

export const getOnlineOnlyBadgeVariant = (isOnlineOnly: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isOnlineOnly ? 'default' : 'secondary';
};

// ========== FIELD LABELS ==========

export const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
        'age': 'Age',
        'civil_status': 'Civil Status',
        'educational_attainment': 'Educational Attainment',
        'occupation': 'Occupation',
        'monthly_income': 'Monthly Income',
        'is_registered_voter': 'Registered Voter',
        'years_in_barangay': 'Years in Barangay',
        'has_pending_case': 'Has Pending Case',
    };
    
    if (field.startsWith('has_')) {
        return field.replace('has_', '').toUpperCase();
    }
    
    return fieldLabels[field] || field;
};

export const getOperatorLabel = (operator: string) => {
    const operatorLabels: Record<string, string> = {
        'equals': '=',
        'not_equals': '≠',
        'greater_than': '>',
        'less_than': '<',
        'greater_than_or_equal': '≥',
        'less_than_or_equal': '≤',
        'in': 'in',
        'not_in': 'not in',
        'contains': 'contains',
    };
    return operatorLabels[operator] || operator;
};

// ========== PRIVILEGE HELPERS ==========

export const getPrivilegeIcon = (code: string) => {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, React.ReactNode> = {
        'S': <Award className="h-4 w-4" />,
        'P': <HeartHandshake className="h-4 w-4" />,
        'I': <Home className="h-4 w-4" />,
        'F': <Briefcase className="h-4 w-4" />,
        'O': <Users className="h-4 w-4" />,
        '4': <Heart className="h-4 w-4" />,
        'U': <User className="h-4 w-4" />,
        'A': <Award className="h-4 w-4" />,
        'B': <Award className="h-4 w-4" />,
        'C': <Award className="h-4 w-4" />,
        'D': <Award className="h-4 w-4" />,
        'E': <Award className="h-4 w-4" />,
    };
    
    return iconMap[firstChar] || <Award className="h-4 w-4" />;
};

export const getPrivilegeColor = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};

// ========== ELIGIBILITY CRITERIA HELPERS ==========

export const parseEligibilityCriteria = (criteria: any): Array<{
    field: string;
    operator: string;
    value: string;
}> => {
    try {
        if (Array.isArray(criteria)) return criteria;
        if (typeof criteria === 'string') {
            const parsed = JSON.parse(criteria);
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    } catch {
        return [];
    }
};

export const getPurposeOptions = (purposeOptions: string): string[] => {
    if (!purposeOptions) return [];
    try {
        if (typeof purposeOptions === 'string') {
            try {
                const parsed = JSON.parse(purposeOptions);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return purposeOptions.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
            }
        }
        if (Array.isArray(purposeOptions)) return purposeOptions;
        return [];
    } catch {
        return [];
    }
};

// ========== DOCUMENT HELPERS ==========

export const formatAcceptedFormats = (formats: any): string => {
    if (!formats) return 'None specified';
    if (Array.isArray(formats)) {
        return formats.length > 0 ? formats.join(', ') : 'None specified';
    }
    if (typeof formats === 'string') {
        return formats.split(',').map(f => f.trim()).filter(f => f).join(', ') || 'None specified';
    }
    return 'None specified';
};

export const formatFileSize = (size: any): string => {
    const num = Number(size);
    if (isNaN(num) || num <= 0) return 'Not specified';
    return `${(num / 1024).toFixed(1)} MB`;
};

export const numbersEqual = (a: number, b: number, tolerance = 0.001): boolean => {
    return Math.abs(a - b) < tolerance;
};

// ========== COLOR HELPERS ==========

export const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

// ========== SELECTION STATS ==========

export const calculateSelectionStats = (selectedTypes: any[]) => {
    const totalValue = selectedTypes.reduce((sum, t) => sum + safeNumber(t.fee, 0), 0);
    
    let avgProcessingDays = 0;
    if (selectedTypes.length > 0) {
        const totalProcessingDays = selectedTypes.reduce((sum, t) => sum + safeNumber(t.processing_days, 0), 0);
        avgProcessingDays = totalProcessingDays / selectedTypes.length;
    }
    
    return {
        active: selectedTypes.filter(t => Boolean(t.is_active)).length,
        inactive: selectedTypes.filter(t => !t.is_active).length,
        discountable: selectedTypes.filter(t => Boolean(t.is_discountable)).length,
        non_discountable: selectedTypes.filter(t => !t.is_discountable).length,
        paid: selectedTypes.filter(t => Boolean(t.requires_payment)).length,
        free: selectedTypes.filter(t => !t.requires_payment).length,
        needsApproval: selectedTypes.filter(t => Boolean(t.requires_approval)).length,
        onlineOnly: selectedTypes.filter(t => Boolean(t.is_online_only)).length,
        totalValue: safeNumber(totalValue, 0),
        avgProcessingDays: safeNumber(avgProcessingDays, 0),
    };
};

// ========== CLIPBOARD EXPORT ==========

export const formatForClipboard = (types: any[]): string => {
    if (types.length === 0) return '';
    
    const data = types.map(type => ({
        Name: type.name,
        Code: type.code,
        Fee: formatCurrency(type.fee),
        Discountable: type.is_discountable ? 'Yes' : 'No',
        Status: type.is_active ? 'Active' : 'Inactive',
        'Processing Days': `${type.processing_days} days`,
        'Validity Days': `${type.validity_days} days`,
        'Requires Payment': type.requires_payment ? 'Yes' : 'No',
        'Requires Approval': type.requires_approval ? 'Yes' : 'No',
        'Online Only': type.is_online_only ? 'Yes' : 'No',
        'Clearances Count': type.clearances_count || 0,
        'Created At': formatDate(type.created_at),
        'Updated At': formatDate(type.updated_at),
    }));
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => 
            Object.values(row).map(value => 
                typeof value === 'string' && (value.includes(',') || value.includes('"'))
                    ? `"${value.replace(/"/g, '""')}"`
                    : value
            ).join(',')
        )
    ].join('\n');
};

// ========== TEXT UTILITIES ==========

export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getPurposeOptionsCount = (type: any): number => {
    if (!type.purpose_options) return 0;
    return type.purpose_options.split(',').filter((opt: string) => opt.trim() !== '').length;
};