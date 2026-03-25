import { 
    FileText, File, Image, FileDigit, Lock, Calendar, User, 
    Download, Eye, Trash2, MoreVertical, Grid, List, Folder, 
    FolderOpen, Shield, Heart, GraduationCap, Briefcase, Award,
    Type, Clock, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';
import type { StorageStats } from '@/types/portal/records/records';

// Icon mapping
export const ICON_MAP: Record<string, any> = {
    'user': User,
    'heart': Heart,
    'file-text': FileText,
    'graduation-cap': GraduationCap,
    'briefcase': Briefcase,
    'award': Award,
    'shield': Shield,
    'folder': Folder,
    'folder-open': FolderOpen,
    'file': File,
    'calendar': Calendar,
    'image': Image,
    'file-digit': FileDigit,
    'type': Type,
};

// Color mappings
export const COLOR_MAP: Record<string, string> = {
    'blue': 'text-blue-600 dark:text-blue-400',
    'red': 'text-red-600 dark:text-red-400',
    'green': 'text-green-600 dark:text-green-400',
    'yellow': 'text-yellow-600 dark:text-yellow-400',
    'purple': 'text-purple-600 dark:text-purple-400',
    'pink': 'text-pink-600 dark:text-pink-400',
    'indigo': 'text-indigo-600 dark:text-indigo-400',
    'gray': 'text-gray-600 dark:text-gray-400'
};

export const BG_COLOR_MAP: Record<string, string> = {
    'blue': 'bg-blue-50 dark:bg-blue-900/20',
    'red': 'bg-red-50 dark:bg-red-900/20',
    'green': 'bg-green-50 dark:bg-green-900/20',
    'yellow': 'bg-yellow-50 dark:bg-yellow-900/20',
    'purple': 'bg-purple-50 dark:bg-purple-900/20',
    'pink': 'bg-pink-50 dark:bg-pink-900/20',
    'indigo': 'bg-indigo-50 dark:bg-indigo-900/20',
    'gray': 'bg-gray-50 dark:bg-gray-900'
};

// File type configurations
export const FILE_TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
    'pdf': { icon: FileText, color: 'text-red-500 dark:text-red-400' },
    'doc': { icon: Type, color: 'text-blue-500 dark:text-blue-400' },
    'docx': { icon: Type, color: 'text-blue-500 dark:text-blue-400' },
    'xls': { icon: FileDigit, color: 'text-green-500 dark:text-green-400' },
    'xlsx': { icon: FileDigit, color: 'text-green-500 dark:text-green-400' },
    'csv': { icon: FileDigit, color: 'text-green-500 dark:text-green-400' },
    'jpg': { icon: Image, color: 'text-purple-500 dark:text-purple-400' },
    'jpeg': { icon: Image, color: 'text-purple-500 dark:text-purple-400' },
    'png': { icon: Image, color: 'text-purple-500 dark:text-purple-400' },
    'gif': { icon: Image, color: 'text-purple-500 dark:text-purple-400' },
    'webp': { icon: Image, color: 'text-purple-500 dark:text-purple-400' },
};

// Stats cards configuration - UPDATED to match ModernStatsCards expected structure
export const getRecordStatsCards = (stats: StorageStats) => {
    const documentCount = stats?.document_count || 0;
    const usedPercentage = stats?.percentage || 0;
    
    return [
        {
            title: 'Total Documents',
            value: documentCount.toLocaleString(),
            icon: Folder,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: {
                value: '12.5%',
                positive: true
            },
            footer: 'vs last month'
        },
        {
            title: 'Storage Used',
            value: stats?.used || '0 MB',
            icon: File,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
            trend: {
                value: `${usedPercentage}%`,
                positive: usedPercentage < 70
            },
            footer: `of ${stats?.limit || '0 MB'}`
        },
        {
            title: 'Categories',
            value: stats?.categories_count || 0,
            icon: FolderOpen,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            footer: 'Active categories'
        },
        {
            title: 'Available Space',
            value: stats?.available || '100 MB',
            icon: Shield,
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBgColor: 'bg-amber-50 dark:bg-amber-900/20',
            footer: usedPercentage > 90 ? 'Almost full' : `${100 - usedPercentage}% remaining`
        },
    ];
};

// Alternative: If you prefer to have trend only on some cards
export const getRecordStatsCardsWithTrends = (stats: StorageStats) => {
    const documentCount = stats?.document_count || 0;
    const usedPercentage = stats?.percentage || 0;
    
    return [
        {
            title: 'Total Documents',
            value: documentCount.toLocaleString(),
            icon: Folder,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: {
                value: '+12.5%',
                positive: true
            },
            footer: 'Total records in system'
        },
        {
            title: 'Storage Used',
            value: stats?.used || '0 MB',
            icon: File,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
            footer: `${stats?.used || '0 MB'} of ${stats?.limit || '0 MB'} used`
        },
        {
            title: 'Categories',
            value: stats?.categories_count || 0,
            icon: FolderOpen,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            footer: 'Document categories'
        },
        {
            title: 'Available Space',
            value: stats?.available || '100 MB',
            icon: Shield,
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBgColor: 'bg-amber-50 dark:bg-amber-900/20',
            trend: usedPercentage > 90 ? {
                value: 'Critical',
                positive: false
            } : {
                value: `${Math.round(100 - usedPercentage)}%`,
                positive: true
            },
            footer: `${Math.round(usedPercentage)}% used`
        },
    ];
};