// /components/residentui/reports/constants.ts
import { 
    Clock, 
    Loader2, 
    TrendingUp, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Flag, 
    Info, 
    FileText, 
    Eye,
    Users,
    MapPin,
    Calendar,
    MessageSquare,
    Paperclip,
    History,
    DollarSign,
    Download,
    Printer,
    Share2,
    Trash2,
    Edit,
    Zap,
    HelpCircle,
    Phone,
    Shield,
    User
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

export type ReportStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
export type ReportUrgency = 'low' | 'medium' | 'high';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReportImpact = 'minor' | 'moderate' | 'major' | 'critical';
export type AffectedPeople = 'individual' | 'multiple' | 'community';

// ============================================================================
// Status Configuration
// ============================================================================

export interface StatusConfig {
    label: string;
    color: string;
    textColor: string;
    icon: any;
    gradient?: string;
    description?: string;
    nextStep?: string;
}

export const STATUS_CONFIG: Record<ReportStatus, StatusConfig> = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock,
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20',
        description: 'Waiting for review',
        nextStep: 'Will be assigned for review'
    },
    under_review: { 
        label: 'Under Review', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: Loader2,
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20',
        description: 'Being investigated',
        nextStep: 'Awaiting resolution'
    },
    in_progress: { 
        label: 'In Progress', 
        color: 'bg-purple-100 dark:bg-purple-900/30', 
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: TrendingUp,
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20',
        description: 'Work in progress',
        nextStep: 'Awaiting completion'
    },
    resolved: { 
        label: 'Resolved', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20',
        description: 'Successfully resolved',
        nextStep: 'Case closed'
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        icon: XCircle,
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20',
        description: 'Report rejected',
        nextStep: 'No further action'
    },
};

// ============================================================================
// Urgency Configuration
// ============================================================================

export interface UrgencyConfig {
    label: string;
    color: string;
    textColor: string;
    dot: string;
    description?: string;
}

export const URGENCY_CONFIG: Record<ReportUrgency, UrgencyConfig> = {
    low: { 
        label: 'Low', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-700 dark:text-green-300',
        dot: 'bg-green-500',
        description: 'Minimal urgency, can be addressed in due time'
    },
    medium: { 
        label: 'Medium', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-700 dark:text-yellow-300',
        dot: 'bg-yellow-500',
        description: 'Moderate urgency, requires timely attention'
    },
    high: { 
        label: 'High', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-700 dark:text-red-300',
        dot: 'bg-red-500',
        description: 'Critical urgency, requires immediate attention'
    },
};

// ============================================================================
// Priority Configuration
// ============================================================================

export interface PriorityConfig {
    label: string;
    color: string;
    textColor: string;
    icon: any;
    dot: string;
    gradient?: string;
}

export const PRIORITY_CONFIG: Record<ReportPriority, PriorityConfig> = {
    low: {
        label: 'Low',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        icon: CheckCircle,
        dot: 'bg-green-500',
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
    medium: {
        label: 'Medium',
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        icon: AlertCircle,
        dot: 'bg-yellow-500',
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    high: {
        label: 'High',
        color: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        icon: Flag,
        dot: 'bg-orange-500',
        gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20'
    },
    critical: {
        label: 'Critical',
        color: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        icon: AlertCircle,
        dot: 'bg-red-500',
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20'
    },
};

// ============================================================================
// Impact Configuration
// ============================================================================

export interface ImpactConfig {
    label: string;
    color: string;
    textColor: string;
    description: string;
}

export const IMPACT_CONFIG: Record<ReportImpact, ImpactConfig> = {
    minor: {
        label: 'Minor Impact',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        description: 'Minimal damage or disruption'
    },
    moderate: {
        label: 'Moderate Impact',
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        description: 'Noticeable damage or disruption'
    },
    major: {
        label: 'Major Impact',
        color: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        description: 'Significant damage or disruption'
    },
    critical: {
        label: 'Critical Impact',
        color: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        description: 'Severe damage or danger to life'
    },
};

// ============================================================================
// Affected People Configuration
// ============================================================================

export interface AffectedPeopleConfig {
    icon: any;
    label: string;
    description: string;
}

export const AFFECTED_PEOPLE_CONFIG: Record<AffectedPeople, AffectedPeopleConfig> = {
    individual: {
        icon: User,
        label: 'Individual',
        description: 'Affects one person'
    },
    multiple: {
        icon: Users,
        label: 'Multiple People',
        description: 'Affects several people'
    },
    community: {
        icon: Users,
        label: 'Entire Community',
        description: 'Affects the whole community'
    },
};

// ============================================================================
// Tab Configuration
// ============================================================================

export interface TabConfig {
    id: string;
    label: string;
    icon: any;
    count?: number;
}

export const REPORT_TABS: TabConfig[] = [
    { id: 'all', label: 'All Reports', icon: FileText },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'under_review', label: 'Under Review', icon: Loader2 },
    { id: 'in_progress', label: 'In Progress', icon: TrendingUp },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
];

// Detail view tabs
export const REPORT_DETAIL_TABS: TabConfig[] = [
    { id: 'details', label: 'Details', icon: Info },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'history', label: 'History', icon: History },
];

// Mobile detail view tabs
export const MOBILE_REPORT_DETAIL_TABS: TabConfig[] = [
    { id: 'details', label: 'Details', icon: Info },
    { id: 'evidence', label: 'Evidence', icon: Paperclip },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'help', label: 'Help', icon: HelpCircle },
];

// ============================================================================
// Stats Cards Configuration
// ============================================================================

export interface StatsCardConfig {
    title: string;
    value: number;
    icon: any;
    iconColor: string;
    iconBgColor: string;
    footer: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const getReportStatsCards = (stats: {
    total: number;
    resolved: number;
    pending: number;
    in_progress?: number;
    under_review?: number;
    rejected?: number;
}): StatsCardConfig[] => {
    const total = stats.total || 0;
    const resolved = stats.resolved || 0;
    const resolvedPercentage = total > 0 ? ((resolved / total) * 100).toFixed(0) : '0';

    return [
        {
            title: 'Total Reports',
            value: total,
            icon: FileText,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            footer: `${total} total report${total !== 1 ? 's' : ''}`
        },
        {
            title: 'Resolved',
            value: resolved,
            icon: CheckCircle,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            footer: `${resolvedPercentage}% resolved`
        },
        {
            title: 'In Progress',
            value: stats.in_progress || 0,
            icon: TrendingUp,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
            footer: 'Active cases'
        },
        {
            title: 'Pending',
            value: stats.pending || 0,
            icon: Clock,
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            iconBgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            footer: 'Awaiting review'
        },
    ];
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getStatusConfig = (status: string): StatusConfig => {
    return STATUS_CONFIG[status as ReportStatus] || STATUS_CONFIG.pending;
};

export const getUrgencyConfig = (urgency: string): UrgencyConfig => {
    return URGENCY_CONFIG[urgency as ReportUrgency] || URGENCY_CONFIG.low;
};

export const getPriorityConfig = (priority: string): PriorityConfig => {
    return PRIORITY_CONFIG[priority as ReportPriority] || PRIORITY_CONFIG.low;
};

export const getImpactConfig = (impact: string): ImpactConfig => {
    return IMPACT_CONFIG[impact as ReportImpact] || IMPACT_CONFIG.minor;
};

export const getAffectedPeopleConfig = (affected: string): AffectedPeopleConfig => {
    return AFFECTED_PEOPLE_CONFIG[affected as AffectedPeople] || AFFECTED_PEOPLE_CONFIG.individual;
};

// ============================================================================
// Icon Mapper
// ============================================================================

export const ICON_MAP: Record<string, any> = {
    // Report types
    'alert-circle': AlertCircle,
    'megaphone': AlertCircle,
    'volume-2': AlertCircle,
    'gavel': Flag,
    'users': Users,
    'zap': Zap,
    'trash-2': Trash2,
    'droplets': AlertCircle,
    'wrench': TrendingUp,
    'building': MapPin,
    'bell': AlertCircle,
    'construction': TrendingUp,
    'car': TrendingUp,
    'paw-print': Users,
    'heart-pulse': AlertCircle,
    'store': MapPin,
    'volume': AlertCircle,
    'user-x': User,
    'handshake': Users,
    
    // Actions
    'edit': Edit,
    'delete': Trash2,
    'download': Download,
    'print': Printer,
    'share': Share2,
    'view': Eye,
    
    // Status
    'pending': Clock,
    'under-review': Loader2,
    'in-progress': TrendingUp,
    'resolved': CheckCircle,
    'rejected': XCircle,
};

export const getIcon = (iconName: string): any => {
    return ICON_MAP[iconName] || AlertCircle;
};

// ============================================================================
// File Type Helpers
// ============================================================================

export const getFileIcon = (fileType: string, isImage: boolean): any => {
    if (isImage) return Eye;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('video')) return Eye;
    return Paperclip;
};

// ============================================================================
// Export all configs as default
// ============================================================================

export default {
    STATUS_CONFIG,
    URGENCY_CONFIG,
    PRIORITY_CONFIG,
    IMPACT_CONFIG,
    AFFECTED_PEOPLE_CONFIG,
    REPORT_TABS,
    REPORT_DETAIL_TABS,
    MOBILE_REPORT_DETAIL_TABS,
    getReportStatsCards,
    getStatusConfig,
    getUrgencyConfig,
    getPriorityConfig,
    getImpactConfig,
    getAffectedPeopleConfig,
    getIcon,
    getFileIcon,
};