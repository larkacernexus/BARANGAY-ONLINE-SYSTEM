// components/residentui/lib/resident-ui-utils.ts

export const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount == null) return '₱0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '₱0.00' : `₱${num.toFixed(2)}`;
};

export const formatDate = (dateString: string | null | undefined, format?: string): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // You can use the format parameter for different date formats if needed
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export type FileType = 'image' | 'pdf' | 'other';

export interface DocumentFile {
    mime_type?: string;
    file_name?: string;
    file_type?: string;
}

export const getFileType = (document: DocumentFile): FileType => {
    const { mime_type, file_name, file_type } = document;
    
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (mime_type && imageMimeTypes.includes(mime_type.toLowerCase())) {
        return 'image';
    }
    
    if (file_name && imageExtensions.some(ext => file_name.toLowerCase().endsWith(ext))) {
        return 'image';
    }
    
    if (file_type && file_type.toLowerCase().includes('image')) {
        return 'image';
    }
    
    if (mime_type && mime_type.toLowerCase() === 'application/pdf') {
        return 'pdf';
    }
    
    if (file_name && file_name.toLowerCase().endsWith('.pdf')) {
        return 'pdf';
    }
    
    if (file_type && file_type.toLowerCase().includes('pdf')) {
        return 'pdf';
    }
    
    return 'other';
};

export const downloadFile = async (url: string, filename: string): Promise<void> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        }, 100);
        
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};