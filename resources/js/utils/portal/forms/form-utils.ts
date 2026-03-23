// forms-show/utils/form-utils.ts
import { 
    FileType, FileText, BarChart3, Image as ImageIcon, 
    Building2, Users, Shield, AlertTriangle, Building,
    XCircle, Star, CheckCircle, Tag, Calendar, Folder, Eye, Download
} from 'lucide-react';
import { StatusConfig } from '@/types/portal/forms/form.types';

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export const getFileTypeCategory = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word') || fileType.includes('doc')) return 'Word Document';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'Excel Spreadsheet';
    if (fileType.includes('image')) return 'Image File';
    return 'Document';
};

export const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
};

export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        'Social Services': 'from-purple-500 to-pink-500',
        'Permits & Licenses': 'from-blue-500 to-indigo-500',
        'Health & Medical': 'from-red-500 to-rose-500',
        'Education': 'from-green-500 to-emerald-500',
        'Legal & Police': 'from-indigo-500 to-purple-500',
        'Employment': 'from-amber-500 to-orange-500',
        'Housing': 'from-cyan-500 to-blue-500',
    };
    return colors[category] || 'from-gray-500 to-slate-500';
};

export const getStatusConfig = (isActive: boolean, isFeatured: boolean): StatusConfig => {
    if (!isActive) {
        return { 
            label: 'Unavailable', 
            color: 'text-red-600', 
            icon: XCircle, 
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            gradient: 'from-red-500 to-rose-500'
        };
    }
    
    if (isFeatured) {
        return { 
            label: 'Popular', 
            color: 'text-purple-600', 
            icon: Star, 
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            gradient: 'from-purple-500 to-pink-500'
        };
    }
    
    return { 
        label: 'Available', 
        color: 'text-green-600', 
        icon: CheckCircle, 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        gradient: 'from-green-500 to-emerald-500'
    };
};

export const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileType;
    if (fileType.includes('word') || fileType.includes('doc')) return FileText;
    if (fileType.includes('excel') || fileType.includes('sheet')) return BarChart3;
    if (fileType.includes('image')) return ImageIcon;
    return FileText;
};

export const getAgencyIcon = (agency: string) => {
    if (agency.includes('Mayor')) return Building2;
    if (agency.includes('DSWD')) return Users;
    if (agency.includes('PNP') || agency.includes('Police')) return Shield;
    if (agency.includes('Health')) return AlertTriangle;
    return Building;
};