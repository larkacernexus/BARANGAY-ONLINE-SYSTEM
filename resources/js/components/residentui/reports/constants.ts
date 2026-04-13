// /components/residentui/reports/constants.ts

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
    dot: string;
    label: string;
    color: string;
    textColor: string;
    gradient?: string;
    description?: string;
    nextStep?: string;
}

export const STATUS_CONFIG: Record<ReportStatus, StatusConfig> = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20',
        description: 'Waiting for review',
        nextStep: 'Will be assigned for review',
        dot: ''
    },
    under_review: {
        label: 'Under Review',
        color: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-300',
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20',
        description: 'Being investigated',
        nextStep: 'Awaiting resolution',
        dot: ''
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-800 dark:text-purple-300',
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20',
        description: 'Work in progress',
        nextStep: 'Awaiting completion',
        dot: ''
    },
    resolved: {
        label: 'Resolved',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20',
        description: 'Successfully resolved',
        nextStep: 'Case closed',
        dot: ''
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20',
        description: 'Report rejected',
        nextStep: 'No further action',
        dot: ''
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
    dot: string;
    gradient?: string;
}

export const PRIORITY_CONFIG: Record<ReportPriority, PriorityConfig> = {
    low: {
        label: 'Low',
        color: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dot: 'bg-green-500',
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
    medium: {
        label: 'Medium',
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        dot: 'bg-yellow-500',
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    high: {
        label: 'High',
        color: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        dot: 'bg-orange-500',
        gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20'
    },
    critical: {
        label: 'Critical',
        color: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
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
    label: string;
    description: string;
}

export const AFFECTED_PEOPLE_CONFIG: Record<AffectedPeople, AffectedPeopleConfig> = {
    individual: {
        label: 'Individual',
        description: 'Affects one person'
    },
    multiple: {
        label: 'Multiple People',
        description: 'Affects several people'
    },
    community: {
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
    status: ReportStatus | 'all';
    color: string;
    count?: number;
}

export const REPORT_TABS: TabConfig[] = [
    { id: 'all', label: 'All Reports', status: 'all', color: 'gray' },
    { id: 'pending', label: 'Pending', status: 'pending', color: 'yellow' },
    { id: 'under_review', label: 'Under Review', status: 'under_review', color: 'blue' },
    { id: 'in_progress', label: 'In Progress', status: 'in_progress', color: 'purple' },
    { id: 'resolved', label: 'Resolved', status: 'resolved', color: 'green' },
    { id: 'rejected', label: 'Rejected', status: 'rejected', color: 'red' },
];

// Detail view tabs
export interface DetailTabConfig {
    id: string;
    label: string;
}

export const REPORT_DETAIL_TABS: DetailTabConfig[] = [
    { id: 'details', label: 'Details' },
    { id: 'documents', label: 'Documents' },
    { id: 'payments', label: 'Payments' },
    { id: 'history', label: 'History' },
];

// Mobile detail view tabs
export const MOBILE_REPORT_DETAIL_TABS: DetailTabConfig[] = [
    { id: 'details', label: 'Details' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'help', label: 'Help' },
];

// ============================================================================
// Stats Cards Configuration
// ============================================================================

export interface StatsCardConfig {
    title: string;
    value: number;
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
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
            footer: `${total} total report${total !== 1 ? 's' : ''}`
        },
        {
            title: 'Resolved',
            value: resolved,
            iconColor: 'text-green-600 dark:text-green-400',
            iconBgColor: 'bg-green-50 dark:bg-green-900/20',
            footer: `${resolvedPercentage}% resolved`
        },
        {
            title: 'In Progress',
            value: stats.in_progress || 0,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
            footer: 'Active cases'
        },
        {
            title: 'Pending',
            value: stats.pending || 0,
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            iconBgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            footer: 'In progress'
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
};