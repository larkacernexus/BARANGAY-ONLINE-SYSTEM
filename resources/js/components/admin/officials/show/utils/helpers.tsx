// resources/js/Pages/Admin/Officials/utils/helpers.tsx
import React from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    Crown,
    Building,
    FileText,
    Award,
    Users,
    Hash,
    AlertTriangle,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    RefreshCw,
    UserPlus,
    BarChart3,
    Target,
    Trophy,
    Info,
    History,
    Zap,
    UserCheck,
    Briefcase,
    GraduationCap,
    Star,
    Medal,
    Activity,
    TrendingUp,
    PieChart,
    LineChart,
    Github,
    Linkedin,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Twitch,
    PenTool,
    BookOpen,
    Users2,
    UserCog,
    UserX,
    UserMinus,
    UserPlus as UserPlusIcon,
    Users as UsersIcon,
    ShieldCheck,
    ShieldAlert,
    ShieldOff,
    Fingerprint,
    Key,
    Lock,
    Unlock,
    EyeOff,
    EyeIcon,
} from 'lucide-react';

export const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    
    switch (status) {
        case 'active':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        case 'former':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        default:
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    }
};

export const getStatusIcon = (status: string, isCurrent: boolean) => {
    if (isCurrent) return <CheckCircle className="h-3 w-3" />;
    
    switch (status) {
        case 'active':
            return <CheckCircle className="h-3 w-3" />;
        case 'inactive':
            return <XCircle className="h-3 w-3" />;
        case 'former':
            return <Clock className="h-3 w-3" />;
        default:
            return <Shield className="h-3 w-3" />;
    }
};

export const getPositionIcon = (position: string) => {
    switch (position) {
        case 'captain':
            return <Crown className="h-5 w-5 text-amber-600 dark:text-amber-500" />;
        case 'kagawad':
            return <Building className="h-5 w-5 text-blue-600 dark:text-blue-500" />;
        case 'secretary':
            return <FileText className="h-5 w-5 text-purple-600 dark:text-purple-500" />;
        case 'treasurer':
            return <Award className="h-5 w-5 text-green-600 dark:text-green-500" />;
        case 'sk_chairman':
            return <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />;
        case 'sk_kagawad':
            return <Users className="h-5 w-5 text-indigo-400 dark:text-indigo-400" />;
        case 'secretary_treasurer':
            return <FileText className="h-5 w-5 text-orange-600 dark:text-orange-500" />;
        default:
            return <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
};

export const getPositionColor = (position: string) => {
    switch (position) {
        case 'captain':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        case 'kagawad':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'secretary':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        case 'treasurer':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'sk_chairman':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};