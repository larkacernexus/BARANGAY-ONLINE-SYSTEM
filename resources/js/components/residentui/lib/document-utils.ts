import { DOCUMENT_STATUS_CONFIG, getFileTypeConfig } from '@/components/residentui/constants/document-ui';
import { AlertCircle } from 'lucide-react';

export const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDate = (dateString?: string, format: 'short' | 'long' = 'long'): string => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (format === 'short') {
            return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return date.toLocaleDateString('en-PH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch {
        return 'Invalid date';
    }
};

export const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '—';
    try {
        return new Date(dateString).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Invalid date';
    }
};

export const getDocumentStatus = (doc: any): string => {
    if (doc.status) return doc.status;
    if (doc.expiry_date && new Date(doc.expiry_date) < new Date()) {
        return 'expired';
    }
    return 'active';
};

export const getStatusConfig = (status: string) => {
    return DOCUMENT_STATUS_CONFIG[status as keyof typeof DOCUMENT_STATUS_CONFIG] || {
        label: status,
        color: 'text-gray-600 dark:text-gray-400',
        icon: AlertCircle,
        gradient: 'from-gray-500 to-slate-500',
        badge: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800'
    };
};