import { 
  Clock, DollarSign, Loader2, CheckCircle, FileCheck, XCircle, 
  BarChart, FileText, AlertCircle, Zap, Mail, Calendar, User, Copy 
} from 'lucide-react';

// Status configuration
export const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 dark:bg-yellow-900/30', 
    textColor: 'text-yellow-800 dark:text-yellow-300',
    icon: Clock
  },
  pending_payment: { 
    label: 'Pending Payment', 
    color: 'bg-orange-100 dark:bg-orange-900/30', 
    textColor: 'text-orange-800 dark:text-orange-300',
    icon: DollarSign
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 dark:bg-blue-900/30', 
    textColor: 'text-blue-800 dark:text-blue-300',
    icon: Loader2
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-100 dark:bg-green-900/30', 
    textColor: 'text-green-800 dark:text-green-300',
    icon: CheckCircle
  },
  issued: { 
    label: 'Issued', 
    color: 'bg-purple-100 dark:bg-purple-900/30', 
    textColor: 'text-purple-800 dark:text-purple-300',
    icon: FileCheck
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 dark:bg-red-900/30', 
    textColor: 'text-red-800 dark:text-red-300',
    icon: XCircle
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 dark:bg-gray-800', 
    textColor: 'text-gray-800 dark:text-gray-300',
    icon: XCircle
  },
};

// Urgency configuration
export const URGENCY_CONFIG = {
  normal: { 
    label: 'Normal', 
    color: 'bg-blue-100 dark:bg-blue-900/30', 
    textColor: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500'
  },
  rush: { 
    label: 'Rush', 
    color: 'bg-orange-100 dark:bg-orange-900/30', 
    textColor: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500'
  },
  express: { 
    label: 'Express', 
    color: 'bg-red-100 dark:bg-red-900/30', 
    textColor: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500'
  },
};

// Clearance tabs configuration
export const CLEARANCE_TABS = [
  { value: 'all', label: 'All', icon: FileText },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'pending_payment', label: 'Pending Payment', icon: DollarSign },
  { value: 'processing', label: 'Processing', icon: Loader2 },
  { value: 'approved', label: 'Approved', icon: CheckCircle },
  { value: 'issued', label: 'Issued', icon: FileCheck },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

// Stats cards configuration
export const getClearanceStatsCards = (stats: any, formatCurrency: (amount: number) => string) => [
  {
    title: 'Total Requests',
    value: stats.total_clearances || 0,
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    title: 'Issued',
    value: stats.issued_clearances || 0,
    icon: FileCheck,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    trend: '+8.2%',
    trendUp: true,
  },
  {
    title: 'Processing',
    value: stats.processing_clearances || 0,
    icon: Loader2,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
    trend: 'In progress',
    trendUp: true,
  },
  {
    title: 'Pending Payment',
    value: stats.pending_payment_clearances || 0,
    icon: DollarSign,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    badge: `₱${(stats.total_balance || 0).toLocaleString()}`,
  },
];