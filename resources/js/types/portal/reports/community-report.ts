// types/portal/community-report.ts
import { 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Info, 
    Loader2, 
    LucideIcon, 
    TrendingUp, 
    XCircle,
    Users,
    User,
    MapPin,
    Calendar,
    FileText,
    Paperclip,
    History,
    DollarSign,
    Flag,
    Zap,
    Eye,
    Download,
    Printer,
    Share2,
    Trash2,
    Edit,
    HelpCircle,
    Phone,
    Shield
} from 'lucide-react';

// ============================================================================
// Core Type Definitions
// ============================================================================

export type ReportStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReportImpact = 'minor' | 'moderate' | 'major' | 'critical';
export type AffectedPeople = 'individual' | 'multiple' | 'community';
export type ReportCategory = 'issue' | 'complaint' | 'incident' | 'request';
export type ReportFormStep = 'type' | 'details' | 'evidence' | 'review';

// ============================================================================
// File Types
// ============================================================================

export interface FileWithPreview extends File {
    preview: string;
    id: string;
    type: string;
}

export interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    name: string;
    size: number;
    type: string;
    lastModified: number;
    uploadProgress?: number;
    uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export interface ReportEvidence {
    file_type(file_type: any, is_image: boolean): unknown;
    id: number;
    report_id: number;
    file_path: string;
    file_name: string;
    original_name: string;
    file_size: number;
    formatted_size: string;
    mime_type: string;
    is_image: boolean;
    description?: string;
    notes?: string | null;
    uploaded_by: number;
    uploaded_by_name?: string;
    created_at: string;
    updated_at: string;
    file_url?: string;
}

// ============================================================================
// Report Type
// ============================================================================

export interface ReportType {
    id: number;
    name: string;
    code: string;
    description: string;
    icon: string;
    icon_component?: LucideIcon;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    priority_label: string;
    priority_color: string;
    category: ReportCategory;
    form_template?: string;
    instructions?: string;
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface ReportUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    first_name?: string;
    last_name?: string;
}

export interface AssignedUser {
    id: number;
    name: string;
    role: string;
    email?: string;
}

// ============================================================================
// Main Report Types
// ============================================================================

export interface CommunityReport {
    id: number;
    report_number: string;
    report_type_id: number;
    title: string;
    description: string;
    detailed_description?: string;
    location: string;
    incident_date: string;
    incident_time: string | null;
    urgency: UrgencyLevel;
    priority?: ReportPriority;
    status: ReportStatus;
    is_anonymous: boolean;
    reporter_name: string | null;
    reporter_contact: string | null;
    reporter_address?: string | null;
    recurring_issue?: boolean;
    affected_people?: AffectedPeople;
    estimated_affected_count?: number;
    impact_level?: ReportImpact;
    safety_concern?: boolean;
    environmental_impact?: boolean;
    admin_notes: string | null;
    resolution_notes?: string | null;
    resolved_at: string | null;
    acknowledged_at?: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    
    // Relations
    report_type: ReportType;
    evidences: ReportEvidence[];
    evidences_count?: number;
    user?: ReportUser;
    assigned_to?: number | null;
    assigned_to_user?: AssignedUser | null;
    
    // Computed fields
    formatted_created_at: string;
    formatted_incident_date: string;
    formatted_resolved_date?: string;
    days_since_created: number;
    status_color?: string;
    urgency_color?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    canResolve?: boolean;
}

// ============================================================================
// Draft Types
// ============================================================================

export interface LocalDraft {
    id: string;
    report_type_id: number | null;
    title: string;
    description: string;
    detailed_description?: string;
    location: string;
    incident_date: string;
    incident_time: string;
    urgency: UrgencyLevel;
    priority?: ReportPriority;
    is_anonymous: boolean;
    reporter_name: string;
    reporter_contact: string;
    reporter_address?: string;
    affected_people?: AffectedPeople;
    estimated_affected_count?: number;
    impact_level?: ReportImpact;
    safety_concern?: boolean;
    environmental_impact?: boolean;
    recurring_issue?: boolean;
    files: Array<{
        name: string;
        size: number;
        type: string;
        lastModified: number;
    }>;
    created_at: string;
    updated_at: string;
}

export interface ReportDraft {
    id: string;
    user_id: number;
    report_type_id?: number;
    title?: string;
    description?: string;
    detailed_description?: string;
    location?: string;
    incident_date?: string;
    incident_time?: string;
    urgency?: UrgencyLevel;
    priority?: ReportPriority;
    is_anonymous?: boolean;
    reporter_name?: string;
    reporter_contact?: string;
    reporter_address?: string;
    affected_people?: AffectedPeople;
    estimated_affected_count?: number;
    impact_level?: ReportImpact;
    safety_concern?: boolean;
    environmental_impact?: boolean;
    recurring_issue?: boolean;
    data?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ReportFormData {
    report_type_id: string;
    title: string;
    description: string;
    detailed_description?: string;
    location: string;
    incident_date: string;
    incident_time: string;
    urgency: UrgencyLevel;
    priority?: ReportPriority;
    is_anonymous: boolean;
    reporter_name: string;
    reporter_contact: string;
    reporter_address?: string;
    affected_people?: AffectedPeople;
    estimated_affected_count?: number;
    impact_level?: ReportImpact;
    safety_concern?: boolean;
    environmental_impact?: boolean;
    recurring_issue?: boolean;
    files: File[];
    [key: string]: any;
}

export interface ReportFormErrors {
    report_type_id?: string;
    title?: string;
    description?: string;
    location?: string;
    incident_date?: string;
    incident_time?: string;
    urgency?: string;
    reporter_name?: string;
    reporter_contact?: string;
    reporter_address?: string;
    files?: string;
    [key: string]: string | undefined;
}

export interface ReportFormStepConfig {
    id: ReportFormStep;
    title: string;
    description: string;
    icon: LucideIcon;
    isCompleted: boolean;
}

// ============================================================================
// Filter & Pagination Types
// ============================================================================

export interface ReportFilters {
    search?: string;
    status?: ReportStatus | 'all';
    type?: string | 'all';
    category?: ReportCategory | 'all';
    priority?: UrgencyLevel | 'all';
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
}

export interface PaginatedReports {
    data: CommunityReport[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface FilterOptions {
    reportTypes: ReportType[];
    categories: ReportCategory[];
    statuses: ReportStatus[];
    priorities: UrgencyLevel[];
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface ReportStats {
    total: number;
    pending: number;
    under_review: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    cancelled: number;
    average_resolution_days: number;
    resolution_rate: number;
    by_urgency?: Record<UrgencyLevel, number>;
    by_category?: Record<ReportCategory, number>;
}

// ============================================================================
// Modal State Types
// ============================================================================

export interface PreviewModalState {
    isOpen: boolean;
    url: string;
    type: string;
    name: string;
    file?: File;
}

export interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

// ============================================================================
// Page Props Types
// ============================================================================

export interface CommunityReportPageProps {
    reports?: PaginatedReports;
    stats?: ReportStats;
    filterOptions?: FilterOptions;
    currentResident?: ReportUser;
    filters?: ReportFilters;
    error?: string;
}

export interface ReportShowPageProps {
    report: CommunityReport;
    canEdit?: boolean;
    canDelete?: boolean;
    canResolve?: boolean;
    user?: ReportUser;
    error?: string;
}

export interface ReportCreatePageProps {
    reportTypes: ReportType[];
    draft?: ReportDraft | null;
    error?: string;
}

// ============================================================================
// Status Configuration Types
// ============================================================================

export interface StatusConfig {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: LucideIcon;
    gradient?: string;
    description?: string;
    nextStep?: string;
}

export const REPORT_STATUS_CONFIG: Record<ReportStatus, StatusConfig> = {
    pending: {
        label: 'Pending',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20',
        description: 'Waiting for review',
        nextStep: 'Will be assigned for review'
    },
    under_review: {
        label: 'Under Review',
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-300',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: Loader2,
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20',
        description: 'Being investigated',
        nextStep: 'Awaiting resolution'
    },
    in_progress: {
        label: 'In Progress',
        color: 'purple',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-800 dark:text-purple-300',
        borderColor: 'border-purple-200 dark:border-purple-800',
        icon: TrendingUp,
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20',
        description: 'Work in progress',
        nextStep: 'Awaiting completion'
    },
    resolved: {
        label: 'Resolved',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20',
        description: 'Successfully resolved',
        nextStep: 'Case closed'
    },
    rejected: {
        label: 'Rejected',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20',
        description: 'Report rejected',
        nextStep: 'No further action'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700',
        icon: XCircle,
        gradient: 'from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700',
        description: 'Report cancelled',
        nextStep: 'No further action'
    }
};

// ============================================================================
// Urgency Configuration
// ============================================================================

export interface UrgencyConfig {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    dotColor: string;
    days_target: number;
    icon: LucideIcon;
    description?: string;
}

export const URGENCY_CONFIG: Record<UrgencyLevel, UrgencyConfig> = {
    low: {
        label: 'Low',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dotColor: 'bg-green-500',
        days_target: 14,
        icon: Info,
        description: 'Minimal urgency, can be addressed in due time'
    },
    medium: {
        label: 'Medium',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        dotColor: 'bg-yellow-500',
        days_target: 7,
        icon: Clock,
        description: 'Moderate urgency, requires timely attention'
    },
    high: {
        label: 'High',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        dotColor: 'bg-red-500',
        days_target: 3,
        icon: AlertCircle,
        description: 'Critical urgency, requires immediate attention'
    }
};

// ============================================================================
// Priority Configuration
// ============================================================================

export interface PriorityConfig {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    dotColor: string;
    icon: LucideIcon;
    gradient?: string;
}

export const PRIORITY_CONFIG: Record<ReportPriority, PriorityConfig> = {
    low: {
        label: 'Low',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dotColor: 'bg-green-500',
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
    medium: {
        label: 'Medium',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        dotColor: 'bg-yellow-500',
        icon: Clock,
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    high: {
        label: 'High',
        color: 'orange',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        dotColor: 'bg-orange-500',
        icon: AlertCircle,
        gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20'
    },
    critical: {
        label: 'Critical',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        dotColor: 'bg-red-500',
        icon: AlertCircle,
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20'
    }
};

// ============================================================================
// Impact Configuration
// ============================================================================

export interface ImpactConfig {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    description: string;
}

export const IMPACT_CONFIG: Record<ReportImpact, ImpactConfig> = {
    minor: {
        label: 'Minor Impact',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        description: 'Minimal damage or disruption'
    },
    moderate: {
        label: 'Moderate Impact',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        description: 'Noticeable damage or disruption'
    },
    major: {
        label: 'Major Impact',
        color: 'orange',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        description: 'Significant damage or disruption'
    },
    critical: {
        label: 'Critical Impact',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        description: 'Severe damage or danger to life'
    }
};

// ============================================================================
// Affected People Configuration
// ============================================================================

export interface AffectedPeopleConfig {
    icon: LucideIcon;
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
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getStatusConfig = (status: ReportStatus): StatusConfig => {
    return REPORT_STATUS_CONFIG[status] || REPORT_STATUS_CONFIG.pending;
};

export const getUrgencyConfig = (urgency: UrgencyLevel): UrgencyConfig => {
    return URGENCY_CONFIG[urgency] || URGENCY_CONFIG.low;
};

export const getPriorityConfig = (priority: ReportPriority): PriorityConfig => {
    return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
};

export const getImpactConfig = (impact: ReportImpact): ImpactConfig => {
    return IMPACT_CONFIG[impact] || IMPACT_CONFIG.minor;
};

export const getAffectedPeopleConfig = (affected: AffectedPeople): AffectedPeopleConfig => {
    return AFFECTED_PEOPLE_CONFIG[affected] || AFFECTED_PEOPLE_CONFIG.individual;
};

// ============================================================================
// Default Export
// ============================================================================

export default {
    REPORT_STATUS_CONFIG,
    URGENCY_CONFIG,
    PRIORITY_CONFIG,
    IMPACT_CONFIG,
    AFFECTED_PEOPLE_CONFIG,
    getStatusConfig,
    getUrgencyConfig,
    getPriorityConfig,
    getImpactConfig,
    getAffectedPeopleConfig
};