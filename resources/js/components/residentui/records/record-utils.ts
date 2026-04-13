// /components/residentui/records/record-utils.ts

import { toast } from 'sonner';
import { FILE_TYPE_CONFIG } from './constants';

// Type definitions
interface FileTypeConfig {
    color: string;
    name?: string;
}

// ==================== Date Formatting ====================

/**
 * Format date for display with mobile/desktop variants
 */
export const formatDate = (dateString?: string, isMobile: boolean = false): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        if (isMobile) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Format datetime with time
 */
export const formatDateTime = (dateString?: string, includeSeconds: boolean = false): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (includeSeconds) {
            options.second = '2-digit';
        }
        
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
        
        return formatDate(dateString);
    } catch (error) {
        return 'N/A';
    }
};

// ==================== File Type Utilities ====================

/**
 * Get file color based on extension
 */
export const getFileColor = (extension: string): string => {
    const ext = extension?.toLowerCase() || '';
    const config = FILE_TYPE_CONFIG[ext] as FileTypeConfig | undefined;
    return config?.color || 'text-gray-500 dark:text-gray-400';
};

/**
 * Get file type display name
 */
export const getFileTypeDisplay = (extension: string): string => {
    const ext = extension?.toLowerCase() || '';
    const config = FILE_TYPE_CONFIG[ext] as FileTypeConfig | undefined;
    
    if (config?.name) return config.name;
    
    // Common fallbacks
    const typeMap: Record<string, string> = {
        'pdf': 'PDF Document',
        'jpg': 'JPEG Image',
        'jpeg': 'JPEG Image',
        'png': 'PNG Image',
        'gif': 'GIF Image',
        'svg': 'SVG Image',
        'webp': 'WebP Image',
        'mp4': 'MP4 Video',
        'mp3': 'MP3 Audio',
        'doc': 'Word Document',
        'docx': 'Word Document',
        'xls': 'Excel Spreadsheet',
        'xlsx': 'Excel Spreadsheet',
        'txt': 'Text File',
        'json': 'JSON File',
        'xml': 'XML File',
        'zip': 'ZIP Archive',
        'rar': 'RAR Archive',
        '7z': '7-Zip Archive'
    };
    
    return typeMap[ext] || `${ext.toUpperCase()} File`;
};

// ==================== Document Status Utilities ====================

/**
 * Check if document is expired
 */
export const isDocumentExpired = (doc: any): boolean => {
    if (!doc?.expiry_date) return false;
    try {
        const expiryDate = new Date(doc.expiry_date);
        const today = new Date();
        return expiryDate < today;
    } catch {
        return false;
    }
};

/**
 * Get document status display
 */
export const getDocumentStatus = (doc: any): {
    label: string;
    color: string;
} => {
    if (isDocumentExpired(doc)) {
        return {
            label: 'Expired',
            color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
        };
    }
    
    if (doc?.requires_password) {
        return {
            label: 'Password Protected',
            color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
        };
    }
    
    return {
        label: 'Active',
        color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    };
};

// ==================== Resident Utilities ====================

/**
 * Get resident name with proper fallbacks
 */
export const getResidentName = (
    residentId: number, 
    doc?: any, 
    residents?: any[]
): string => {
    // First priority: Get from document's resident object (most reliable)
    if (doc?.resident) {
        if (doc.resident.full_name && doc.resident.full_name.trim()) {
            return doc.resident.full_name.trim();
        }
        if (doc.resident.first_name || doc.resident.last_name) {
            const firstName = doc.resident.first_name || '';
            const lastName = doc.resident.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName) return fullName;
        }
    }
    
    // Second priority: Get from residents array
    if (residents && residents.length > 0) {
        const resident = residents.find(r => r.id === residentId);
        if (resident) {
            if (resident.full_name && resident.full_name.trim()) {
                return resident.full_name.trim();
            }
            if (resident.first_name || resident.last_name) {
                const firstName = resident.first_name || '';
                const lastName = resident.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                if (fullName) return fullName;
            }
        }
    }
    
    // Third priority: Try to get from doc's resident_id reference
    if (doc?.resident_id && residents) {
        const resident = residents.find(r => r.id === doc.resident_id);
        if (resident) {
            if (resident.full_name) return resident.full_name;
            if (resident.first_name || resident.last_name) {
                return `${resident.first_name || ''} ${resident.last_name || ''}`.trim();
            }
        }
    }
    
    // Debug log to help identify missing resident data (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.warn(`[getResidentName] Resident not found for ID: ${residentId}`, { 
            hasDoc: !!doc,
            hasDocResident: !!doc?.resident,
            docId: doc?.id,
            docName: doc?.name,
            residentsCount: residents?.length || 0
        });
    }
    
    return 'Unknown Resident';
};

/**
 * Get resident initials
 */
export const getResidentInitials = (name: string): string => {
    if (!name || name === 'Unknown Resident') return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
};

// ==================== Clipboard Utilities ====================

/**
 * Copy text to clipboard with toast feedback
 */
export const copyToClipboard = async (text: string, successMessage: string): Promise<void> => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            toast.success(successMessage);
        }
    } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy to clipboard');
    }
};

/**
 * Copy with fallback for older browsers
 */
export const copyWithFallback = (text: string, successMessage: string): void => {
    copyToClipboard(text, successMessage);
};

// ==================== CSRF Token Utilities ====================

/**
 * Get CSRF token from meta tag
 */
export const getCsrfToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    
    // Try to get from meta tag
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken) {
        return metaToken.getAttribute('content');
    }
    
    // Try to get from CSRF cookie (if available)
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (csrfCookie) {
        return decodeURIComponent(csrfCookie.split('=')[1]);
    }
    
    return null;
};

// ==================== File Size Utilities ====================

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Parse file size from human readable format to bytes
 */
export const parseFileSize = (sizeString: string): number => {
    const units: Record<string, number> = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024
    };
    
    const match = sizeString.match(/^([\d.]+)\s*([A-Z]+)$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    return value * (units[unit] || 1);
};

// ==================== Validation Utilities ====================

/**
 * Validate file type against allowed extensions
 */
export const isValidFileType = (fileName: string, allowedExtensions: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
};

/**
 * Validate file size
 */
export const isValidFileSize = (fileSize: number, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
};

// ==================== URL Utilities ====================

/**
 * Get file download URL
 */
export const getDownloadUrl = (documentId: number): string => {
    return `/portal/my-records/${documentId}/download`;
};

/**
 * Get file view URL
 */
export const getViewUrl = (documentId: number): string => {
    return `/portal/my-records/${documentId}`;
};

// ==================== Stats Utilities ====================

/**
 * Calculate storage stats
 */
export const calculateStorageStats = (
    documents: any[],
    storageLimit: string = '100 MB'
): {
    used: string;
    usedBytes: number;
    limit: string;
    limitBytes: number;
    available: string;
    availableBytes: number;
    percentage: number;
    documentCount: number;
} => {
    const limitBytes = parseFileSize(storageLimit);
    const usedBytes = documents.reduce((total, doc) => total + (doc.file_size || 0), 0);
    const availableBytes = Math.max(0, limitBytes - usedBytes);
    const percentage = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;
    
    return {
        used: formatFileSize(usedBytes),
        usedBytes,
        limit: storageLimit,
        limitBytes,
        available: formatFileSize(availableBytes),
        availableBytes,
        percentage: Math.min(percentage, 100),
        documentCount: documents.length
    };
};

/**
 * Get document count by category
 */
export const getDocumentCountByCategory = (
    documents: any[],
    categories: any[]
): Map<number, number> => {
    const countMap = new Map<number, number>();
    
    documents.forEach(doc => {
        const categoryId = doc.document_category_id;
        countMap.set(categoryId, (countMap.get(categoryId) || 0) + 1);
    });
    
    return countMap;
};

// ==================== Search Utilities ====================

/**
 * Search documents by text
 */
export const searchDocuments = (
    documents: any[],
    searchTerm: string
): any[] => {
    if (!searchTerm) return documents;
    
    const term = searchTerm.toLowerCase();
    return documents.filter(doc => 
        doc.name?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.reference_number?.toLowerCase().includes(term) ||
        doc.file_name?.toLowerCase().includes(term)
    );
};

// ==================== Export Utilities ====================

/**
 * Export documents to CSV
 */
export const exportToCSV = (
    documents: any[],
    filename: string = 'documents-export.csv'
): void => {
    if (!documents.length) {
        toast.error('No documents to export');
        return;
    }
    
    // Define CSV headers
    const headers = [
        'Reference Number',
        'Document Name',
        'Category',
        'Resident',
        'File Type',
        'File Size',
        'Date Uploaded',
        'Description'
    ];
    
    // Prepare data rows
    const rows = documents.map(doc => [
        doc.reference_number || '',
        doc.name || '',
        doc.category?.name || '',
        getResidentName(doc.resident_id, doc),
        doc.file_extension?.toUpperCase() || '',
        doc.file_size_human || '',
        formatDate(doc.created_at),
        doc.description || ''
    ]);
    
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success(`Exported ${documents.length} documents`);
};

// ==================== Export ====================

export default {
    formatDate,
    formatDateTime,
    getRelativeTime,
    getFileColor,
    getFileTypeDisplay,
    isDocumentExpired,
    getDocumentStatus,
    getResidentName,
    getResidentInitials,
    copyToClipboard,
    copyWithFallback,
    getCsrfToken,
    formatFileSize,
    parseFileSize,
    isValidFileType,
    isValidFileSize,
    getDownloadUrl,
    getViewUrl,
    calculateStorageStats,
    getDocumentCountByCategory,
    searchDocuments,
    exportToCSV
};