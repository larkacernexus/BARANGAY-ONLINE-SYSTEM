// resources/js/Pages/Admin/Fees/utils/formatters.tsx
import React from 'react';
import { 
    Clock, 
    Percent, 
    CheckCircle, 
    AlertCircle, 
    XCircle, 
    FileCheck 
} from 'lucide-react';

export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return '₱0.00';
    if (typeof amount === 'string' && amount.startsWith('₱')) return amount;
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₱0.00';
    
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numAmount);
};

export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
        'pending': 'secondary',
        'partially_paid': 'outline',
        'paid': 'success',
        'overdue': 'destructive',
        'cancelled': 'destructive',
        'waived': 'outline',
        'approved': 'success',
        'collected': 'default'
    };
    return variants[status] || 'outline';
};

export const getStatusIcon = (status: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
        'pending': React.createElement(Clock, { className: "h-4 w-4 text-amber-500 dark:text-amber-400" }),
        'partially_paid': React.createElement(Percent, { className: "h-4 w-4 text-indigo-500 dark:text-indigo-400" }),
        'paid': React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500 dark:text-green-400" }),
        'overdue': React.createElement(AlertCircle, { className: "h-4 w-4 text-red-500 dark:text-red-400" }),
        'cancelled': React.createElement(XCircle, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" }),
        'waived': React.createElement(FileCheck, { className: "h-4 w-4 text-purple-500 dark:text-purple-400" }),
        'approved': React.createElement(CheckCircle, { className: "h-4 w-4 text-blue-500 dark:text-blue-400" }),
        'collected': React.createElement(FileCheck, { className: "h-4 w-4 text-teal-500 dark:text-teal-400" })
    };
    return icons[status] || null;
};