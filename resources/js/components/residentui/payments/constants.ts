import { Receipt, Banknote, AlertCircle, Clock, CheckCircle, XCircle, CreditCard, FileText, ShieldCheck } from 'lucide-react';

export const getPaymentStatsCards = (stats: any, formatCurrency: (amount: number) => string) => [
  {
    title: 'Total Payments',
    value: stats.total_payments || 0,
    icon: Receipt,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    title: 'Total Paid',
    value: formatCurrency(stats.total_paid || 0),
    icon: Banknote,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    trend: '+8.2%',
    trendUp: true,
  },
  {
    title: 'Balance Due',
    value: formatCurrency(stats.balance_due || 0),
    icon: AlertCircle,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    trend: stats.balance_due > 0 ? 'Needs attention' : 'All paid',
    trendUp: false,
  },
  {
    title: 'Pending',
    value: stats.pending_payments || 0,
    icon: Clock,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    badge: stats.overdue_payments ? `${stats.overdue_payments} overdue` : null,
  },
];

export const PAYMENT_STATUS_CONFIG = {
  completed: {
    label: 'Paid',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    variant: 'paid',
    icon: CheckCircle,
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    variant: 'paid',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-300',
    variant: 'pending',
    icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-300',
    variant: 'overdue',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-800 dark:text-gray-300',
    variant: 'cancelled',
    icon: XCircle,
  },
};

export const PAYMENT_METHOD_CONFIG = {
  cash: {
    label: 'Cash',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    icon: Banknote,
  },
  gcash: {
    label: 'GCash',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-300',
    icon: CreditCard,
  },
  maya: {
    label: 'Maya',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-800 dark:text-purple-300',
    icon: CreditCard,
  },
  bank: {
    label: 'Bank Transfer',
    color: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-800 dark:text-indigo-300',
    icon: Banknote,
  },
  check: {
    label: 'Check',
    color: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-800 dark:text-gray-300',
    icon: FileText,
  },
  online: {
    label: 'Online',
    color: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-800 dark:text-teal-300',
    icon: ShieldCheck,
  },
};

export const PAYMENT_TABS = [
  { value: 'all', label: 'All', icon: Receipt },
  { value: 'paid', label: 'Paid', icon: CheckCircle },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'overdue', label: 'Overdue', icon: AlertCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];