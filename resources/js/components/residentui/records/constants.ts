import { 
    FileText, File, Image, FileDigit, Lock, Calendar, User, 
    Download, Eye, Trash2, MoreVertical, Grid, List, Folder, 
    FolderOpen, Shield, Heart, GraduationCap, Briefcase, Award,
    Type, Clock, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';

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
    'gray': 'bg-gray-50 dark:bg-gray-800'
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

// Stats cards configuration
export const getRecordStatsCards = (stats: any) => [
    {
        title: 'Total Documents',
        value: stats?.document_count || 0,
        icon: Folder,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        trend: '+12.5%',
        trendUp: true,
    },
    {
        title: 'Storage Used',
        value: stats?.used || '0 MB',
        icon: File,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        trend: `${stats?.percentage || 0}% of limit`,
        trendUp: stats?.percentage < 70,
    },
    {
        title: 'Categories',
        value: stats?.categories_count || 0,
        icon: FolderOpen,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-600 dark:text-green-400',
        trend: 'Active',
        trendUp: true,
    },
    {
        title: 'Available Space',
        value: stats?.available || '100 MB',
        icon: Shield,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        badge: stats?.percentage > 90 ? 'Almost Full' : null,
    },
];