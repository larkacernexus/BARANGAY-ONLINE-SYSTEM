// /components/residentui/forms/form-utils.ts
import { 
    FileText, BarChart, Image as ImageIcon, 
    Building2, Users, Shield, AlertTriangle, Building,
    XCircle, Star, CheckCircle, Tag, Download,
    FileType, Clock
} from 'lucide-react';
import { StatusConfig, Form, Stats, RelatedForm } from '@/types/portal/forms/form.types';
import { CATEGORY_COLORS } from '@/components/residentui/forms/constants';

// ========== FORMATTING FUNCTIONS ==========
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (dateString?: string, shortFormat: boolean = false): string => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        if (shortFormat) {
            return date.toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
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

export const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'Not set';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid date';
    }
};

// ========== TEXT UTILITIES ==========
export const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const copyToClipboard = async (text: string, message: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return { success: true, message };
    } catch (err) {
        return { success: false, message: 'Failed to copy to clipboard' };
    }
};

// ========== FILE TYPE UTILITIES ==========
export const getFileTypeCategory = (fileType: string): string => {
    if (!fileType) return 'Document';
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word') || fileType.includes('doc')) return 'Word Document';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'Excel Spreadsheet';
    if (fileType.includes('image')) return 'Image File';
    return 'Document';
};

export const getFileExtension = (fileName: string): string => {
    if (!fileName) return 'FILE';
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
};

export const getFileIcon = (fileType: string) => {
    if (!fileType) return FileText;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word') || fileType.includes('doc')) return FileText;
    if (fileType.includes('excel') || fileType.includes('sheet')) return BarChart;
    if (fileType.includes('image')) return ImageIcon;
    return FileText;
};

export const getFileTypeColor = (fileType: string): string => {
    if (!fileType) return 'text-gray-500 dark:text-gray-400';
    if (fileType.includes('pdf')) return 'text-red-500 dark:text-red-400';
    if (fileType.includes('word') || fileType.includes('doc')) return 'text-blue-500 dark:text-blue-400';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'text-green-500 dark:text-green-400';
    if (fileType.includes('image')) return 'text-purple-500 dark:text-purple-400';
    return 'text-gray-500 dark:text-gray-400';
};

// ========== CATEGORY UTILITIES ==========
export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
        'Business': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
        'Agriculture': 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300',
        'Transportation': 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300',
        'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[category] || colors['Other'];
};

export const getCategoryGradient = (category: string): string => {
    const gradients: Record<string, string> = {
        'Social Services': 'from-purple-500 to-pink-500',
        'Permits & Licenses': 'from-blue-500 to-indigo-500',
        'Health & Medical': 'from-red-500 to-rose-500',
        'Education': 'from-green-500 to-emerald-500',
        'Legal & Police': 'from-indigo-500 to-purple-500',
        'Employment': 'from-amber-500 to-orange-500',
        'Housing': 'from-cyan-500 to-blue-500',
        'Business': 'from-emerald-500 to-teal-500',
        'Agriculture': 'from-lime-500 to-green-500',
        'Transportation': 'from-sky-500 to-blue-500',
    };
    return gradients[category] || 'from-gray-500 to-slate-500';
};

// ========== AGENCY UTILITIES ==========
export const getAgencyIcon = (agency: string) => {
    if (!agency) return Building;
    if (agency.includes('Mayor') || agency.includes('Municipal')) return Building2;
    if (agency.includes('DSWD')) return Users;
    if (agency.includes('PNP') || agency.includes('Police')) return Shield;
    if (agency.includes('Health')) return AlertTriangle;
    return Building;
};

// ========== STATUS CONFIGURATION ==========
export const getStatusConfig = (isActive: boolean, isFeatured: boolean): StatusConfig => {
    if (!isActive) {
        return { 
            label: 'Unavailable', 
            color: 'text-red-600', 
            icon: XCircle, 
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            gradient: 'from-red-500 to-rose-500',
            textColor: 'text-red-700 dark:text-red-400',
            borderColor: 'border-red-200 dark:border-red-800'
        };
    }
    
    if (isFeatured) {
        return { 
            label: 'Popular', 
            color: 'text-purple-600', 
            icon: Star, 
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            gradient: 'from-purple-500 to-pink-500',
            textColor: 'text-purple-700 dark:text-purple-400',
            borderColor: 'border-purple-200 dark:border-purple-800'
        };
    }
    
    return { 
        label: 'Available', 
        color: 'text-green-600', 
        icon: CheckCircle, 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        gradient: 'from-green-500 to-emerald-500',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800'
    };
};

// ========== STATS CARD GENERATION ==========
export const getFormStatsCards = (stats: Stats, formatNumber: (num: number) => string) => {
    return [
        {
            title: 'Total Forms',
            value: formatNumber(stats.total),
            icon: FileText,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            footer: `${stats.active} active`
        },
        {
            title: 'Total Downloads',
            value: formatNumber(stats.downloads),
            icon: Download,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            title: 'Categories',
            value: stats.categories_count.toString(),
            icon: Tag,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            footer: stats.popular_categories?.[0]?.category || 'Various'
        },
        {
            title: 'Agencies',
            value: stats.agencies_count.toString(),
            icon: Building,
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBgColor: 'bg-amber-50 dark:bg-amber-900/20',
            footer: stats.popular_agencies?.[0]?.agency || 'Various'
        }
    ];
};

// ========== STATUS COUNT ==========
export const getStatusCount = (stats: Stats, status: string): number => {
    switch (status) {
        case 'all':
            return stats.total;
        case 'popular':
            return stats.total;
        case 'recent':
            return stats.total;
        default:
            return 0;
    }
};

// ========== RELATED FORMS UTILITIES ==========
export const getRelatedForms = (forms: RelatedForm[], currentId: number, limit: number = 4): RelatedForm[] => {
    return forms
        .filter(form => form.id !== currentId)
        .slice(0, limit);
};

// ========== FORM VALIDATION ==========
export const isFormValid = (form: Form): boolean => {
    return form.is_active && (!form.valid_until || new Date(form.valid_until) > new Date());
};

export const isFormExpired = (form: Form): boolean => {
    if (!form.valid_until) return false;
    return new Date(form.valid_until) < new Date();
};

// ========== SORTING FUNCTIONS ==========
export const sortForms = (forms: Form[], sortBy: string, sortOrder: 'asc' | 'desc'): Form[] => {
    const sorted = [...forms];
    
    sorted.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Form];
        let bValue: any = b[sortBy as keyof Form];
        
        if (sortBy === 'title') {
            aValue = aValue?.toLowerCase() || '';
            bValue = bValue?.toLowerCase() || '';
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    
    return sorted;
};