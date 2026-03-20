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

export const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};