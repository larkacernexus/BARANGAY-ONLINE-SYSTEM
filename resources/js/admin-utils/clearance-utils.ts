import { toast } from 'sonner';

export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
};

export const truncateText = (text: string, maxLength: number): { display: string; full: string } => {
    if (!text) return { display: '', full: '' };
    if (text.length <= maxLength) return { display: text, full: text };
    
    return { 
        display: text.substring(0, maxLength) + '...', 
        full: text 
    };
};

export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        'pending': 'secondary',
        'pending_payment': 'outline',
        'processing': 'outline',
        'approved': 'outline',
        'issued': 'default',
        'rejected': 'destructive',
        'cancelled': 'outline',
        'expired': 'outline'
    };
    return variants[status] || 'outline';
};

export const getUrgencyVariant = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        'normal': 'outline',
        'rush': 'secondary',
        'express': 'default'
    };
    return variants[urgency] || 'outline';
};

export const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
        'pending': 'Pending Review',
        'pending_payment': 'Pending Payment',
        'processing': 'Under Processing',
        'approved': 'Approved',
        'issued': 'Issued',
        'rejected': 'Rejected',
        'cancelled': 'Cancelled',
        'expired': 'Expired'
    };
    return statusMap[status] || status;
};

export const getUrgencyDisplay = (urgency: string): string => {
    const urgencyMap: Record<string, string> = {
        'normal': 'Normal',
        'rush': 'Rush',
        'express': 'Express'
    };
    return urgencyMap[urgency] || 'Normal';
};

export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

export const getResidentName = (resident?: { full_name?: string; first_name?: string; last_name?: string }): string => {
    if (!resident) return 'N/A';
    if (resident.full_name) return resident.full_name;
    if (resident.first_name || resident.last_name) {
        return `${resident.first_name || ''} ${resident.last_name || ''}`.trim();
    }
    return 'N/A';
};

export const isPriorityUrgency = (urgency: string): boolean => {
    return urgency === 'express' || urgency === 'rush';
};

export const handleCopyToClipboard = (text: string, label: string): void => {
    navigator.clipboard.writeText(text).then(() => {
        toast.success(`${label} copied to clipboard`);
    }).catch(() => {
        toast.error('Failed to copy to clipboard');
    });
};