// /components/residentui/clearances/constants.ts

// Status configuration
export const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 dark:bg-yellow-900/30', 
    textColor: 'text-yellow-800 dark:text-yellow-300'
  },
  pending_payment: { 
    label: 'Pending Payment', 
    color: 'bg-orange-100 dark:bg-orange-900/30', 
    textColor: 'text-orange-800 dark:text-orange-300'
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 dark:bg-blue-900/30', 
    textColor: 'text-blue-800 dark:text-blue-300'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-100 dark:bg-green-900/30', 
    textColor: 'text-green-800 dark:text-green-300'
  },
  issued: { 
    label: 'Issued', 
    color: 'bg-purple-100 dark:bg-purple-900/30', 
    textColor: 'text-purple-800 dark:text-purple-300'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 dark:bg-red-900/30', 
    textColor: 'text-red-800 dark:text-red-300'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 dark:bg-gray-900', 
    textColor: 'text-gray-800 dark:text-gray-300'
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
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'pending_payment', label: 'Pending Payment' },
  { id: 'processing', label: 'Processing' },
  { id: 'approved', label: 'Approved' },
  { id: 'issued', label: 'Issued' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
];

// Stats cards configuration
export const getClearanceStatsCards = (stats: any, formatCurrency: (amount: number) => string) => [
  {
    title: 'Total Requests',
    value: stats.total_clearances || 0,
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
    iconColor: 'text-green-600 dark:text-green-400',
    iconBgColor: 'bg-green-50 dark:bg-green-900/20',
    footer: 'In progress'
  },
  {
    title: 'Pending Payment',
    value: stats.pending_payment_clearances || 0,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
    footer: `Balance: ${formatCurrency(stats.total_balance || 0)}`
  },
];