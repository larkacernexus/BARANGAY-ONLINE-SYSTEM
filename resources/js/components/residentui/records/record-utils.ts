import { toast } from 'sonner';
import { FILE_TYPE_CONFIG, ICON_MAP } from './constants';
import { FileIcon } from 'lucide-react';

export const formatDate = (dateString?: string, isMobile: boolean = false) => {
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

export const getFileIcon = (extension: string, mimeType?: string) => {
    const ext = extension?.toLowerCase() || '';
    
    if (mimeType?.startsWith('image/')) {
        return FILE_TYPE_CONFIG['jpg']?.icon || FileIcon;
    }
    
    return FILE_TYPE_CONFIG[ext]?.icon || FileIcon;
};

export const getFileColor = (extension: string) => {
    const ext = extension?.toLowerCase() || '';
    return FILE_TYPE_CONFIG[ext]?.color || 'text-gray-500 dark:text-gray-400';
};

export const getIconComponent = (iconName: string) => {
    const normalizedName = iconName?.toLowerCase() || '';
    return ICON_MAP[normalizedName] || FileIcon;
};

export const isDocumentExpired = (doc: any) => {
    if (!doc.expiry_date) return false;
    try {
        return new Date(doc.expiry_date) < new Date();
    } catch {
        return false;
    }
};

export const getResidentName = (residentId: number, residents?: any[]) => {
    const resident = residents?.find(r => r.id === residentId);
    return resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown Resident';
};

export const copyToClipboard = async (text: string, successMessage: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
    } catch {
        toast.error('Failed to copy');
    }
};

export const getCsrfToken = () => {
    if (typeof document === 'undefined') return null;
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    return metaToken ? metaToken.getAttribute('content') : null;
};