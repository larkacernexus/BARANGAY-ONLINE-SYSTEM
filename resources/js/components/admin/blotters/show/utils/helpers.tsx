// resources/js/components/admin/blotters/show/utils/helpers.tsx

import { Clock, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const formatDateTime = (date: string | null): string => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending':
            return <Clock className="h-5 w-5" />;
        case 'investigating':
            return <AlertCircle className="h-5 w-5" />;
        case 'resolved':
            return <CheckCircle className="h-5 w-5" />;
        case 'archived':
            return <XCircle className="h-5 w-5" />;
        default:
            return <AlertCircle className="h-5 w-5" />;
    }
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'investigating':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'resolved':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'archived':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
};

export const getPriorityIcon = (priority: string) => {
    switch (priority) {
        case 'urgent':
            return <AlertTriangle className="h-5 w-5" />;
        case 'high':
            return <AlertCircle className="h-5 w-5" />;
        case 'medium':
            return <Clock className="h-5 w-5" />;
        case 'low':
            return <CheckCircle className="h-5 w-5" />;
        default:
            return <AlertCircle className="h-5 w-5" />;
    }
};

export const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'low':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'high':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'urgent':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
};