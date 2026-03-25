// /components/residentui/clearances/constants.ts

import { 
  Clock, DollarSign, Loader2, CheckCircle, FileCheck, XCircle, 
  BarChart, FileText, AlertCircle, Zap, Mail, Calendar, User, Copy 
} from 'lucide-react';

// Status configuration (unchanged)
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
    color: 'bg-gray-100 dark:bg-gray-900', 
    textColor: 'text-gray-800 dark:text-gray-300',
    icon: XCircle
  },
};

// Urgency configuration (unchanged)
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
  { id: 'all', label: 'All', icon: FileText },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'pending_payment', label: 'Pending Payment', icon: DollarSign },
  { id: 'processing', label: 'Processing', icon: Loader2 },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'issued', label: 'Issued', icon: FileCheck },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

// Stats cards configuration - FIXED: trend must be an object with value and positive
export const getClearanceStatsCards = (stats: any, formatCurrency: (amount: number) => string) => [
  {
    title: 'Total Requests',
    value: stats.total_clearances || 0,
    icon: FileText,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
    trend: {
      value: '+12.5%',
      positive: true
    }
  },
  {
    title: 'Issued',
    value: stats.issued_clearances || 0,
    icon: FileCheck,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
    trend: {
      value: '+8.2%',
      positive: true
    }
  },
  {
    title: 'Processing',
    value: stats.processing_clearances || 0,
    icon: Loader2,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBgColor: 'bg-green-50 dark:bg-green-900/20',
    footer: 'In progress'
  },
  {
    title: 'Pending Payment',
    value: stats.pending_payment_clearances || 0,
    icon: DollarSign,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
    footer: `Balance: ${formatCurrency(stats.total_balance || 0)}`
  },
];