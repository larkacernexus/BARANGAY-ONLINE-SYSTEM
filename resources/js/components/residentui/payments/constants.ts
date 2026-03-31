// components/residentui/payments/payment-constants.ts
import {
    Receipt,
    Banknote,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    FileText,
    ShieldCheck,
    CheckCircle2,
    Undo2,
    TrendingUp,
    TrendingDown,
    Building,
    Smartphone,
    Landmark,
    Calendar,
    DollarSign,
    Tag,
    Briefcase,
    Heart,
    Eye,
    Printer,
    Download,
    Copy,
    Share2,
    MoreVertical,
    FileCheck,
    Home,
    LucideIcon
} from 'lucide-react';
import { Payment, PaymentStats } from '@/types/portal/payments/payment.types';

// ============================================================================
// Stats Cards Configuration
// ============================================================================

export const getPaymentStatsCards = (
    stats: PaymentStats, 
    formatCurrency: (amount: number) => string
) => {
    const totalPayments = stats.total_payments || 0;
    const totalPaid = stats.total_paid || 0;
    const balanceDue = stats.balance_due || 0;
    const pendingPayments = stats.pending_payments || 0;
    const overduePayments = stats.overdue_payments || 0;
    
    const paymentRate = totalPayments > 0 ? (totalPaid / totalPayments) * 100 : 0;
    
    return [
        {
            title: 'Total Payments',
            value: totalPayments,
            icon: Receipt,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-100 dark:bg-blue-900/20',
            trend: {
                value: `${paymentRate.toFixed(1)}% paid`,
                positive: paymentRate > 50
            },
            footer: `${totalPayments} transaction${totalPayments !== 1 ? 's' : ''}`
        },
        {
            title: 'Total Paid',
            value: formatCurrency(totalPaid),
            icon: Banknote,
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
            trend: {
                value: totalPaid > 0 ? 'Collected' : 'No payments',
                positive: totalPaid > 0
            },
            footer: 'Total amount collected'
        },
        {
            title: 'Balance Due',
            value: formatCurrency(balanceDue),
            icon: AlertCircle,
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/20',
            trend: {
                value: balanceDue > 0 ? 'Needs attention' : 'All paid',
                positive: balanceDue === 0
            },
            footer: overduePayments > 0 ? `${overduePayments} overdue` : 'Outstanding balance'
        },
        {
            title: 'Pending',
            value: pendingPayments,
            icon: Clock,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-100 dark:bg-purple-900/20',
            trend: {
                value: pendingPayments > 0 ? `${pendingPayments} awaiting` : 'All processed',
                positive: pendingPayments === 0
            },
            footer: 'Awaiting confirmation'
        }
    ];
};

// ============================================================================
// Payment Status Configuration
// ============================================================================

export const PAYMENT_STATUS_CONFIG: Record<string, {
    label: string;
    color: string;
    textColor: string;
    variant: string;
    icon: LucideIcon;
    gradient?: string;
    borderColor?: string;
    badgeColor?: string;
}> = {
    completed: {
        label: 'Paid',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        variant: 'paid',
        icon: CheckCircle,
        gradient: 'from-green-500 to-green-600',
        borderColor: 'border-green-500',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    },
    paid: {
        label: 'Paid',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        variant: 'paid',
        icon: CheckCircle,
        gradient: 'from-green-500 to-green-600',
        borderColor: 'border-green-500',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    },
    pending: {
        label: 'Pending',
        color: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-800 dark:text-amber-300',
        variant: 'pending',
        icon: Clock,
        gradient: 'from-amber-500 to-amber-600',
        borderColor: 'border-amber-500',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
    },
    overdue: {
        label: 'Overdue',
        color: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        variant: 'overdue',
        icon: AlertCircle,
        gradient: 'from-red-500 to-red-600',
        borderColor: 'border-red-500',
        badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-gray-100 dark:bg-gray-900',
        textColor: 'text-gray-800 dark:text-gray-300',
        variant: 'cancelled',
        icon: XCircle,
        gradient: 'from-gray-500 to-gray-600',
        borderColor: 'border-gray-500',
        badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    },
    refunded: {
        label: 'Refunded',
        color: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-800 dark:text-purple-300',
        variant: 'refunded',
        icon: Undo2,
        gradient: 'from-purple-500 to-purple-600',
        borderColor: 'border-purple-500',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    },
    partially_paid: {
        label: 'Partially Paid',
        color: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-300',
        variant: 'partially_paid',
        icon: Receipt,
        gradient: 'from-blue-500 to-blue-600',
        borderColor: 'border-blue-500',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    }
};

// ============================================================================
// Payment Method Configuration
// ============================================================================

export const PAYMENT_METHOD_CONFIG: Record<string, {
    label: string;
    color: string;
    textColor: string;
    icon: LucideIcon;
    requiresReference?: boolean;
    description?: string;
    sortOrder?: number;
}> = {
    cash: {
        label: 'Cash',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        icon: Banknote,
        requiresReference: false,
        description: 'Pay with cash at the barangay hall',
        sortOrder: 1
    },
    gcash: {
        label: 'GCash',
        color: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: Smartphone,
        requiresReference: true,
        description: 'Pay via GCash mobile wallet',
        sortOrder: 2
    },
    maya: {
        label: 'Maya',
        color: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: Smartphone,
        requiresReference: true,
        description: 'Pay via Maya (formerly PayMaya)',
        sortOrder: 3
    },
    bank: {
        label: 'Bank Transfer',
        color: 'bg-indigo-100 dark:bg-indigo-900/30',
        textColor: 'text-indigo-800 dark:text-indigo-300',
        icon: Landmark,
        requiresReference: true,
        description: 'Pay via bank transfer',
        sortOrder: 4
    },
    check: {
        label: 'Check',
        color: 'bg-gray-100 dark:bg-gray-900/30',
        textColor: 'text-gray-800 dark:text-gray-300',
        icon: FileText,
        requiresReference: true,
        description: 'Pay via check',
        sortOrder: 5
    },
    online: {
        label: 'Online Payment',
        color: 'bg-teal-100 dark:bg-teal-900/30',
        textColor: 'text-teal-800 dark:text-teal-300',
        icon: CreditCard,
        requiresReference: true,
        description: 'Pay via online payment gateway',
        sortOrder: 6
    }
};

// ============================================================================
// Tabs Configuration
// ============================================================================

export const PAYMENT_TABS = [
    { value: 'all', label: 'All', icon: Receipt, description: 'View all payments' },
    { value: 'paid', label: 'Paid', icon: CheckCircle, description: 'Completed and paid payments' },
    { value: 'pending', label: 'Pending', icon: Clock, description: 'Awaiting payment' },
    { value: 'overdue', label: 'Overdue', icon: AlertCircle, description: 'Past due date payments' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, description: 'Cancelled payments' }
];

// ============================================================================
// Action Buttons Configuration
// ============================================================================

export const PAYMENT_ACTIONS = {
    view: {
        label: 'View Details',
        icon: Eye,
        color: 'text-blue-600 dark:text-blue-400',
        hoverColor: 'hover:text-blue-700 dark:hover:text-blue-300'
    },
    print: {
        label: 'Print Receipt',
        icon: Printer,
        color: 'text-gray-600 dark:text-gray-400',
        hoverColor: 'hover:text-gray-700 dark:hover:text-gray-300'
    },
    download: {
        label: 'Download Receipt',
        icon: Download,
        color: 'text-emerald-600 dark:text-emerald-400',
        hoverColor: 'hover:text-emerald-700 dark:hover:text-emerald-300'
    },
    copy: {
        label: 'Copy OR Number',
        icon: Copy,
        color: 'text-purple-600 dark:text-purple-400',
        hoverColor: 'hover:text-purple-700 dark:hover:text-purple-300'
    },
    share: {
        label: 'Share Receipt',
        icon: Share2,
        color: 'text-indigo-600 dark:text-indigo-400',
        hoverColor: 'hover:text-indigo-700 dark:hover:text-indigo-300'
    },
    more: {
        label: 'More Options',
        icon: MoreVertical,
        color: 'text-gray-600 dark:text-gray-400',
        hoverColor: 'hover:text-gray-700 dark:hover:text-gray-300'
    }
};

// ============================================================================
// Filter Options Configuration
// ============================================================================

export const PAYMENT_FILTER_OPTIONS = {
    status: [
        { value: 'all', label: 'All Statuses', icon: Receipt },
        { value: 'paid', label: 'Paid', icon: CheckCircle },
        { value: 'pending', label: 'Pending', icon: Clock },
        { value: 'overdue', label: 'Overdue', icon: AlertCircle },
        { value: 'cancelled', label: 'Cancelled', icon: XCircle }
    ],
    sortBy: [
        { value: 'date', label: 'Date', icon: Calendar },
        { value: 'amount', label: 'Amount', icon: DollarSign },
        { value: 'status', label: 'Status', icon: AlertCircle },
        { value: 'or_number', label: 'OR Number', icon: Receipt }
    ],
    sortOrder: [
        { value: 'desc', label: 'Newest First', icon: TrendingDown },
        { value: 'asc', label: 'Oldest First', icon: TrendingUp }
    ],
    years: (years: number[]) => years.map(year => ({ value: year.toString(), label: year.toString() })),
    paymentMethods: (methods: any[]) => methods.map(method => ({
        value: method.type,
        label: method.display_name,
        icon: PAYMENT_METHOD_CONFIG[method.type]?.icon || CreditCard
    }))
};

// ============================================================================
// Chart Colors Configuration
// ============================================================================

export const PAYMENT_CHART_COLORS = {
    paid: '#10b981',
    pending: '#f59e0b',
    overdue: '#ef4444',
    cancelled: '#6b7280',
    refunded: '#8b5cf6',
    partially_paid: '#3b82f6'
};

// ============================================================================
// Date Range Presets
// ============================================================================

export const DATE_RANGE_PRESETS = [
    { label: 'Today', value: 'today', days: 0 },
    { label: 'Yesterday', value: 'yesterday', days: 1 },
    { label: 'Last 7 Days', value: 'last7', days: 7 },
    { label: 'Last 30 Days', value: 'last30', days: 30 },
    { label: 'This Month', value: 'this_month', days: null },
    { label: 'Last Month', value: 'last_month', days: null },
    { label: 'This Year', value: 'this_year', days: null },
    { label: 'Last Year', value: 'last_year', days: null }
];

// ============================================================================
// Helper Functions
// ============================================================================

export const getPaymentStatusConfig = (status: string) => {
    return PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
};

export const getPaymentMethodConfig = (method: string) => {
    return PAYMENT_METHOD_CONFIG[method] || PAYMENT_METHOD_CONFIG.cash;
};

export const getPaymentStatusOptions = () => {
    return Object.entries(PAYMENT_STATUS_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
        icon: config.icon,
        color: config.color
    }));
};

export const getPaymentMethodOptions = () => {
    return Object.entries(PAYMENT_METHOD_CONFIG)
        .sort((a, b) => (a[1].sortOrder || 0) - (b[1].sortOrder || 0))
        .map(([value, config]) => ({
            value,
            label: config.label,
            icon: config.icon,
            description: config.description,
            requiresReference: config.requiresReference
        }));
};

export const getStatusCountByTab = (stats: PaymentStats, tabValue: string, payments: Payment[] = []) => {
    switch (tabValue) {
        case 'all':
            return stats.total_payments || 0;
        case 'paid':
            return (stats.completed_payments || 0) + payments.filter(p => p.status === 'paid').length;
        case 'pending':
            return stats.pending_payments || 0;
        case 'overdue':
            return stats.overdue_payments || 0;
        case 'cancelled':
            return stats.cancelled_payments || 0;
        default:
            return 0;
    }
};