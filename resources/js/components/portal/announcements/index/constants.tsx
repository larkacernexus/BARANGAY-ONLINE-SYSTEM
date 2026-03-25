// /components/residentui/announcements/constants.tsx
import { 
    AlertTriangle, PartyPopper, Wrench, Info, Megaphone,
    Globe, Users, MapPin, Home, Briefcase, Target,
    Eye, Paperclip, Calendar, TrendingUp, Star,
    Clock, CheckCircle, XCircle,
    FileText
} from 'lucide-react';
import { TypeConfig, PriorityConfig } from '@/types/portal/announcements/announcement.types';

// Announcement Type Configs
export const ANNOUNCEMENT_TYPE_CONFIGS: Record<string, TypeConfig> = {
    important: {
        label: 'Important',
        color: 'red',
        icon: AlertTriangle,
        gradient: 'from-red-500 to-orange-500',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/40'
    },
    event: {
        label: 'Event',
        color: 'green',
        icon: PartyPopper,
        gradient: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800',
        hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/40'
    },
    maintenance: {
        label: 'Maintenance',
        color: 'blue',
        icon: Wrench,
        gradient: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/40'
    },
    general: {
        label: 'General',
        color: 'gray',
        icon: Info,
        gradient: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-50 dark:bg-gray-900/50',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700',
        hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-900'
    },
    other: {
        label: 'Other',
        color: 'purple',
        icon: Megaphone,
        gradient: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        textColor: 'text-purple-700 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800',
        hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/40'
    }
};

// Priority Configs
export const PRIORITY_CONFIGS: Record<number, PriorityConfig> = {
    0: {
        label: 'Normal',
        color: 'gray',
        icon: Info,
        gradient: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-900',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700'
    },
    1: {
        label: 'Low',
        color: 'blue',
        icon: Info,
        gradient: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-950/50',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800'
    },
    2: {
        label: 'Medium',
        color: 'yellow',
        icon: Clock,
        gradient: 'from-yellow-500 to-amber-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-950/50',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    3: {
        label: 'High',
        color: 'orange',
        icon: TrendingUp,
        gradient: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-950/50',
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-200 dark:border-orange-800'
    },
    4: {
        label: 'Urgent',
        color: 'red',
        icon: AlertTriangle,
        gradient: 'from-red-500 to-red-600',
        bgColor: 'bg-red-100 dark:bg-red-950/50',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800'
    }
};

// Audience Icons
export const AUDIENCE_ICONS: Record<string, React.ReactNode> = {
    all: <Globe className="h-3 w-3" />,
    roles: <Users className="h-3 w-3" />,
    puroks: <MapPin className="h-3 w-3" />,
    households: <Home className="h-3 w-3" />,
    household_members: <Users className="h-3 w-3" />,
    businesses: <Briefcase className="h-3 w-3" />,
    specific_users: <Target className="h-3 w-3" />
};

// Audience Labels
export const AUDIENCE_LABELS: Record<string, string> = {
    all: 'Everyone',
    roles: 'Specific Roles',
    puroks: 'Your Purok',
    households: 'Your Household',
    household_members: 'Household Members',
    businesses: 'Business Owners',
    specific_users: 'Personalized'
};

// Status Configs
export const STATUS_CONFIGS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: {
        label: 'Active',
        color: 'green',
        icon: CheckCircle
    },
    upcoming: {
        label: 'Upcoming',
        color: 'blue',
        icon: Clock
    },
    expired: {
        label: 'Expired',
        color: 'gray',
        icon: XCircle
    },
    draft: {
        label: 'Draft',
        color: 'yellow',
        icon: FileText
    }
};

// Helper functions
export const getTypeConfig = (type: string): TypeConfig => {
    return ANNOUNCEMENT_TYPE_CONFIGS[type] || ANNOUNCEMENT_TYPE_CONFIGS.general;
};

export const getPriorityConfig = (priority: number): PriorityConfig => {
    return PRIORITY_CONFIGS[priority] || PRIORITY_CONFIGS[0];
};

export const getStatusConfig = (status: string) => {
    return STATUS_CONFIGS[status] || { label: status, color: 'gray', icon: Info };
};