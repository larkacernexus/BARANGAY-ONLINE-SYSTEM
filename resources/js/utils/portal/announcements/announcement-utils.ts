// utils/portal/announcements/announcement-utils.ts
import { 
    ShieldAlert, PartyPopper, Wrench, Megaphone, Bell,
    Info, AlertCircle, AlertTriangle, Shield,
    FileImage, FileText, FileSpreadsheet, FileArchive, File,
    Briefcase,
    Globe,
    Home,
    MapPin,
    User,
    Users,
    LucideIcon
} from 'lucide-react';
import { TypeConfig, PriorityConfig } from '@/types/portal/announcements/announcement.types';

export const TYPE_CONFIG: Record<string, TypeConfig> = {
    important: {
        label: 'Important',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: ShieldAlert as LucideIcon,
        gradient: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        hoverColor: 'hover:bg-red-100'
    },
    event: {
        label: 'Event',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: PartyPopper as LucideIcon,
        gradient: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        hoverColor: 'hover:bg-green-100'
    },
    maintenance: {
        label: 'Maintenance',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Wrench as LucideIcon,
        gradient: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        hoverColor: 'hover:bg-blue-100'
    },
    general: {
        label: 'General',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: Megaphone as LucideIcon,
        gradient: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        hoverColor: 'hover:bg-gray-100'
    },
    other: {
        label: 'Other',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Bell as LucideIcon,
        gradient: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:bg-purple-100'
    },
};

export const PRIORITY_CONFIG: Record<number, PriorityConfig> = {
    0: {
        label: 'Normal',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: Bell as LucideIcon,
        gradient: 'from-gray-100 to-gray-200',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300'
    },
    1: {
        label: 'Low',
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: Info as LucideIcon,
        gradient: 'from-blue-100 to-blue-200',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300'
    },
    2: {
        label: 'Medium',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: AlertCircle as LucideIcon,
        gradient: 'from-yellow-100 to-yellow-200',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300'
    },
    3: {
        label: 'High',
        color: 'bg-orange-100 text-orange-700 border-orange-300',
        icon: AlertTriangle as LucideIcon,
        gradient: 'from-orange-100 to-orange-200',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300'
    },
    4: {
        label: 'Urgent',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: Shield as LucideIcon,
        gradient: 'from-red-100 to-red-200',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300'
    },
};

export const AUDIENCE_ICONS: Record<string, LucideIcon> = {
    all: Globe as LucideIcon,
    roles: Users as LucideIcon,
    puroks: MapPin as LucideIcon,
    households: Home as LucideIcon,
    household_members: Users as LucideIcon,
    businesses: Briefcase as LucideIcon,
    specific_users: User as LucideIcon,
};

export const getTypeConfig = (type: string): TypeConfig => {
    return TYPE_CONFIG[type] || TYPE_CONFIG.general;
};

export const getPriorityConfig = (priority: number): PriorityConfig => {
    return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[0];
};

export const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string, fileName: string): LucideIcon => {
    if (mimeType.includes('image')) return FileImage as LucideIcon;
    if (mimeType.includes('pdf')) return FileText as LucideIcon;
    if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return FileText as LucideIcon;
    if (mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return FileSpreadsheet as LucideIcon;
    if (mimeType.includes('zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return FileArchive as LucideIcon;
    return File as LucideIcon;
};