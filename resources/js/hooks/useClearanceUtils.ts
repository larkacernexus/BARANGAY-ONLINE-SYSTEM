import React from 'react';
import { ClearanceRequest, ClearanceDocument, StatusVariant, UrgencyVariant } from '@/types/admin/clearances/clearance';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    FileCode,
    Shield,
    Image as ImageIcon,
    FileText,
    File
} from 'lucide-react';

export function useClearanceUtils() {
    // Format date
    const formatDate = (dateString?: string | null): string => {
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

   const formatDateTime = (dateString?: string | null): string => {
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
    // Format file size
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Format currency
    const formatCurrency = (amount?: number): string => {
        if (amount === undefined || amount === null) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Get file icon for list view
    const getFileIcon = (document: ClearanceDocument): React.ReactElement => {
        const isImage = !!(document.mime_type?.startsWith('image/') || 
                       document.file_name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i));
        const isPDF = !!(document.mime_type === 'application/pdf' || 
                      document.file_name?.match(/\.pdf$/i));
        const isWord = !!(document.mime_type?.includes('word') || 
                       document.mime_type?.includes('document') ||
                       document.file_name?.match(/\.(doc|docx)$/i));
        const isExcel = !!(document.mime_type?.includes('excel') || 
                        document.mime_type?.includes('spreadsheet') ||
                        document.file_name?.match(/\.(xls|xlsx|csv)$/i));

        if (isImage) return React.createElement(ImageIcon, { className: "h-5 w-5 text-blue-500" });
        if (isPDF) return React.createElement(FileText, { className: "h-5 w-5 text-red-500" });
        if (isWord) return React.createElement(File, { className: "h-5 w-5 text-blue-600" });
        if (isExcel) return React.createElement(File, { className: "h-5 w-5 text-green-600" });
        return React.createElement(File, { className: "h-5 w-5 text-gray-500" });
    };

    // Get status badge variant
    const getStatusVariant = (status: string): StatusVariant => {
        const variants: Record<string, StatusVariant> = {
            'pending': 'secondary',
            'pending_payment': 'outline',
            'processing': 'outline',
            'approved': 'default',
            'issued': 'default',
            'rejected': 'destructive',
            'cancelled': 'destructive',
            'expired': 'outline'
        };
        return variants[status] || 'outline';
    };

    // Get status icon
    const getStatusIcon = (status: string): React.ReactElement | null => {
        const icons: Record<string, React.ReactElement> = {
            'pending': React.createElement(Clock, { className: "h-4 w-4 text-amber-500" }),
            'pending_payment': React.createElement(DollarSign, { className: "h-4 w-4 text-amber-500" }),
            'processing': React.createElement(FileCode, { className: "h-4 w-4 text-blue-500" }),
            'approved': React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500" }),
            'issued': React.createElement(Shield, { className: "h-4 w-4 text-green-500" }),
            'rejected': React.createElement(XCircle, { className: "h-4 w-4 text-red-500" }),
            'cancelled': React.createElement(XCircle, { className: "h-4 w-4 text-gray-500" }),
            'expired': React.createElement(AlertCircle, { className: "h-4 w-4 text-gray-500" })
        };
        return icons[status] || null;
    };

    // Get urgency badge variant
    const getUrgencyVariant = (urgency: string): UrgencyVariant => {
        const variants: Record<string, UrgencyVariant> = {
            'normal': 'default',
            'rush': 'secondary',
            'express': 'destructive'
        };
        return variants[urgency] || 'outline';
    };

    // Get document status color - Updated to use ClearanceDocument
    const getDocumentStatusColor = (document: ClearanceDocument): string => {
        const status = document.verification_status || 'pending';
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get document status text - Updated to use ClearanceDocument
            const getDocumentStatusText = (document: ClearanceDocument): string => {
                const status = document.verification_status || 'pending';
                
                const statusMap: Record<string, string> = {
                    'verified': 'Verified',
                    'rejected': 'Rejected',
                    'pending': 'Pending'
                };
                
                return statusMap[status] || 'Pending';
            };

    // Calculate remaining validity - Updated to use ClearanceRequest
    const getValidityStatus = (clearance: ClearanceRequest): { text: string; color: string } | null => {
        if (clearance.status !== 'issued' || !clearance.valid_until) {
            return null;
        }

        const today = new Date();
        const validUntil = new Date(clearance.valid_until);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return { text: `Valid for ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600' };
        } else if (diffDays === 0) {
            return { text: 'Expires today', color: 'text-amber-600' };
        } else {
            return { text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`, color: 'text-red-600' };
        }
    };

    // Calculate document statistics - Updated to use ClearanceDocument
    const getDocumentStats = (documents: ClearanceDocument[] = []) => {
        const total = documents.length;
        const verified = documents.filter(d => d.verification_status === 'verified').length;
        const pending = documents.filter(d => d.verification_status === 'pending').length;
        const rejected = documents.filter(d => d.verification_status === 'rejected').length;

        return {
            total,
            verified,
            pending,
            rejected,
            pendingCount: pending,
            verifiedCount: verified,
            rejectedCount: rejected,
            pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
            verifiedPercentage: total > 0 ? (verified / total) * 100 : 0,
            rejectedPercentage: total > 0 ? (rejected / total) * 100 : 0
        };
    };

    return {
        formatDate,
        formatDateTime,
        formatFileSize,
        formatCurrency,
        getFileIcon,
        getStatusVariant,
        getStatusIcon,
        getUrgencyVariant,
        getDocumentStatusColor,
        getDocumentStatusText,
        getValidityStatus,
        getDocumentStats
    };
}