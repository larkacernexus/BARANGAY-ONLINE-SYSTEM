import { 
    Clock, Loader2, TrendingUp, CheckCircle, XCircle, 
    Flag, MapPin, Paperclip, Shield, AlertCircle, 
    BarChart, Calendar, User, FileText 
} from 'lucide-react';

// Status configuration
export const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock
    },
    under_review: { 
        label: 'Under Review', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: Loader2
    },
    in_progress: { 
        label: 'In Progress', 
        color: 'bg-indigo-100 dark:bg-indigo-900/30', 
        textColor: 'text-indigo-800 dark:text-indigo-300',
        icon: TrendingUp
    },
    resolved: { 
        label: 'Resolved', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        icon: XCircle
    },
};

// Priority/Urgency configuration
export const URGENCY_CONFIG = {
    low: { 
        label: 'Low', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500'
    },
    medium: { 
        label: 'Medium', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-800 dark:text-orange-300',
        dot: 'bg-orange-500'
    },
    high: { 
        label: 'High', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        dot: 'bg-red-500'
    },
};

// Report tabs configuration
export const REPORT_TABS = [
    { value: 'all', label: 'All Reports', icon: BarChart },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'under_review', label: 'Under Review', icon: Loader2 },
    { value: 'in_progress', label: 'In Progress', icon: TrendingUp },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
];

// Stats cards configuration
export const getReportStatsCards = (stats: any) => [
    {
        title: 'Total Reports',
        value: stats.total || 0,
        icon: Flag,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        trend: '+12.5%',
        trendUp: true,
    },
    {
        title: 'Resolved',
        value: stats.resolved || 0,
        icon: CheckCircle,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-600 dark:text-green-400',
        trend: stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%',
        trendUp: true,
    },
    {
        title: 'In Progress',
        value: (stats.total - stats.resolved - (stats.pending || 0)) || 0,
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        trend: 'Active',
        trendUp: true,
    },
    {
        title: 'Pending',
        value: stats.pending || 0,
        icon: Clock,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        badge: 'Awaiting review',
    },
];