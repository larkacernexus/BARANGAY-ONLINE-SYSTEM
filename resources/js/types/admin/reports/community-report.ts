// resources/js/types/admin/community-report.ts

export interface ReportType {
    id: number;
    name: string;
    category: string;
    description: string;
    icon?: string;
    priority_level?: number;
    priority_label?: string;
    priority_color?: string;
    resolution_days?: number;
    requires_evidence?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Resident {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    purok?: string;
    purok_id?: number;
    resident_id?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
}

export interface Filters {
    search?: string;
    status?: string;
    priority?: string;
    urgency?: string;
    report_type?: string;
    category?: string;
    from_date?: string;
    to_date?: string;
    purok?: string;
    impact_level?: string;
    assigned_to?: string;
    source?: string;
    has_evidences?: boolean;
    safety_concern?: boolean;
    environmental_impact?: boolean;
    recurring_issue?: boolean;
    is_anonymous?: boolean;
    affected_people?: string;
    sort_by?: string;
    sort_order?: string;
}

export interface Stats {
    total: number;
    pending: number;
    under_review: number;
    assigned: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    critical_priority: number;
    high_urgency: number;
    today: number;
    this_week: number;
    this_month: number;
    anonymous: number;
    with_evidences: number;
    safety_concerns: number;
    environmental_issues: number;
    recurring_issues: number;
    average_resolution_time: string;
    community_impact_count: number;
    individual_impact_count: number;
}

export interface FileWithPreview extends File {
    id: string;
    preview?: string;
}

export interface CommunityReportFormData {
    // Complainant Information
    user_id: number | null;
    is_anonymous: boolean;
    reporter_name: string;
    reporter_contact: string;
    reporter_address: string;
    
    // Report Type
    report_type_id: number | null;
    
    // Incident Details
    title: string;
    description: string;
    detailed_description: string;
    location: string;
    incident_date: string;
    incident_time: string;
    urgency_level: string;
    recurring_issue: boolean;
    affected_people: string;
    estimated_affected_count: string;
    
    // Perpetrator & Resolution
    perpetrator_details: string;
    preferred_resolution: string;
    
    // Previous Reports
    has_previous_report: boolean;
    previous_report_id: string;
    
    // Classification & Impact
    impact_level: string;
    safety_concern: boolean;
    environmental_impact: boolean;
    noise_level: string;
    duration_hours: string;
    
    // Admin Fields
    status: string;
    priority: string;
    assigned_to: number | null;
}

export interface StaffMember {
    id: number; // user.id
    user_id: number;
    resident_id: number | null;
    name: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    username: string | null;
    position: string | null;
    role: string | null;
    purok: string | null;
    address: string | null;
    is_active: boolean;
    initials: string;
    avatar: string | null;
}

export interface StatusBanner {
    color: string;
    icon: React.ReactNode;
    title: string;
    message: string;
}

export interface CommunityReport {
    acknowledged_at: any;
    assignedTo: any;
    previous_report: any;
    category: any;
    source: string;
    tags: boolean;
    user: any;
    id: number;
    report_number: string;
    user_id: number | null;
    report_type_id: number;
    title: string;
    description: string;
    detailed_description?: string;
    location: string;
    incident_date: string;
    incident_time?: string;
    urgency_level: string;
    recurring_issue: boolean;
    affected_people: string;
    estimated_affected_count?: string;
    is_anonymous: boolean;
    reporter_name?: string;
    reporter_contact?: string;
    reporter_address?: string;
    perpetrator_details?: string;
    preferred_resolution?: string;
    has_previous_report: boolean;
    previous_report_id?: string;
    impact_level: string;
    safety_concern: boolean;
    environmental_impact: boolean;
    noise_level?: string;
    duration_hours?: string;
    status: string;
    priority: string;
    assigned_to: number | null;
    assigned_to_name?: string;
    resolved_at?: string;
    resolution_notes?: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    complainant?: Resident;
    report_type?: ReportType;
    assigned_user?: {
        id: number;
        name: string;
        email: string;
    };
    evidences?: Evidence[];
    activities?: Activity[];
}

export interface Evidence {
    id: number;
    community_report_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    description?: string;
    uploaded_by: number;
    created_at: string;
    updated_at: string;
    
    // Computed
    url?: string;
    preview_url?: string;
}

export interface Activity {
    id: number;
    community_report_id: number;
    user_id: number;
    user_name?: string;
    action: string;
    description: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    created_at: string;
}

export interface Comment {
    id: number;
    community_report_id: number;
    user_id: number;
    user_name?: string;
    user_avatar?: string;
    content: string;
    is_internal: boolean;
    attachments?: CommentAttachment[];
    created_at: string;
    updated_at: string;
}

export interface CommentAttachment {
    id: number;
    comment_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    created_at: string;
}

export interface FilterOptions {
    status?: string;
    priority?: string;
    report_type_id?: number;
    assigned_to?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    per_page?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface DashboardStats {
    total_reports: number;
    pending_reports: number;
    in_progress_reports: number;
    resolved_reports: number;
    rejected_reports: number;
    by_priority: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    by_urgency: {
        low: number;
        medium: number;
        high: number;
    };
    recent_reports: CommunityReport[];
    recent_activities: Activity[];
}

export interface StatusOption {
    value: string;
    label: string;
    color?: string;
    icon?: string;
}

export interface PriorityOption {
    value: string;
    label: string;
    color?: string;
    icon?: string;
}

export interface UrgencyOption {
    value: string;
    label: string;
    color?: string;
    icon?: string;
}

export interface ImpactLevelOption {
    value: string;
    label: string;
    description?: string;
}

export interface AffectedPeopleOption {
    value: string;
    label: string;
    description?: string;
}

export interface NoiseLevelOption {
    value: string;
    label: string;
    description?: string;
}

export interface PageProps {
    report_types: ReportType[];
    categories: string[];
    puroks: string[];
    users: Resident[];
    statuses: StatusOption[];
    urgencies: UrgencyOption[];
    priorities: PriorityOption[];
    impact_levels: ImpactLevelOption[];
    affected_people_options: AffectedPeopleOption[];
    noise_levels: NoiseLevelOption[];
    report?: CommunityReport;
    stats?: DashboardStats;
    filters?: FilterOptions;
}

// Chart Data Types
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    count: number;
    pending?: number;
    resolved?: number;
    in_progress?: number;
}

// Form Validation Types
export interface FormErrors {
    [key: string]: string | string[];
}

// Export Types
export interface ExportOptions {
    format: 'pdf' | 'csv' | 'excel';
    date_from?: string;
    date_to?: string;
    status?: string[];
    report_type?: number[];
    include_evidences?: boolean;
    include_comments?: boolean;
}

// Notification Types
export interface Notification {
    id: number;
    type: string;
    data: {
        report_id: number;
        report_number: string;
        message: string;
        action_url: string;
    };
    read_at: string | null;
    created_at: string;
}

// Search Types
export interface SearchResult {
    id: number;
    report_number: string;
    title: string;
    complainant_name: string;
    status: string;
    priority: string;
    created_at: string;
    match_score: number;
    highlights: {
        title?: string[];
        description?: string[];
        complainant_name?: string[];
    };
}

// Activity Log Types
export interface ActivityLog {
    action: string;
    user_name: string;
    details: string;
    ip_address: any;
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_type: string;
    causer_id: number;
    causer_name?: string;
    properties: {
        attributes?: Record<string, any>;
        old?: Record<string, any>;
        ip_address?: string;
        user_agent?: string;
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
}

// Workflow Types
export interface WorkflowStep {
    id: number;
    name: string;
    order: number;
    roles: string[];
    permissions: string[];
    required_fields: string[];
    optional_fields?: string[];
}

export interface WorkflowTransition {
    from_status: string;
    to_status: string;
    label: string;
    requires_reason?: boolean;
    requires_approval?: boolean;
    allowed_roles: string[];
}

// Template Types
export interface ResolutionTemplate {
    id: number;
    name: string;
    content: string;
    report_type_id?: number;
    category?: string;
    created_by: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Settings Types
export interface ReportSettings {
    auto_assign_enabled: boolean;
    default_priority: string;
    default_status: string;
    resolution_deadline_days: number;
    require_evidence_for_high_priority: boolean;
    notification_settings: {
        on_assigned: boolean;
        on_status_change: boolean;
        on_comment: boolean;
        on_resolution: boolean;
    };
    escalation_rules: {
        enabled: boolean;
        days_before_escalation: number;
        escalate_to_role: string;
    };
}

// Helper Types for UI State
export interface StepStatus {
    step: number;
    title: string;
    isComplete: boolean;
    isActive: boolean;
    isValid: boolean;
    fields: string[];
}

export interface FileUploadState {
    files: FileWithPreview[];
    isUploading: boolean;
    uploadProgress: number;
    errors: string[];
}

export interface ModalState {
    isOpen: boolean;
    type: 'preview' | 'delete' | 'assign' | 'resolve' | 'reject' | 'comment';
    data?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
    meta?: {
        pagination?: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

// ==================== HOOK TYPES ====================

export interface UseCommunityReportsManagementProps {
    reports: {
        data: CommunityReport[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: Filters;
    statuses?: StatusOption[];
    priorities?: PriorityOption[];
    urgencies?: UrgencyOption[];
    report_types?: ReportType[];
    categories?: string[];
    puroks?: string[];
    staff?: Array<{id: number, name: string}>;
    stats: Stats;
}

export interface SelectionStats {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_urgency: Record<string, number>;
    by_impact: Record<string, number>;
    by_assigned: Record<string, number>;
    has_evidences: number;
    safety_concerns: number;
    environmental_issues: number;
    recurring_issues: number;
    anonymous: number;
    with_attachments: number;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export type BulkOperation = 
    | 'export' 
    | 'print' 
    | 'update_status' 
    | 'update_priority' 
    | 'assign_to' 
    | 'delete' 
    | 'generate_report' 
    | 'escalate' 
    | 'archive';