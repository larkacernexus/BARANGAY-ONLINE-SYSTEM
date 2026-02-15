export type CommunityReport = {
    category: { id: number; name: string; category?: string; } | undefined;
    id: number;
    report_number: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        purok?: string;
    };
    report_type_id: number;
    report_type?: {
        id: number;
        name: string;
        category?: string;
    };
    title: string;
    description: string;
    detailed_description?: string;
    location: string;
    incident_date: string;
    incident_time?: string;
    urgency_level: 'low' | 'medium' | 'high';
    recurring_issue: boolean;
    affected_people: 'individual' | 'family' | 'group' | 'community' | 'multiple';
    estimated_affected_count?: number;
    is_anonymous: boolean;
    reporter_name?: string;
    reporter_contact?: string;
    reporter_address?: string;
    perpetrator_details?: string;
    preferred_resolution?: string;
    has_previous_report: boolean;
    previous_report_id?: number;
    impact_level: 'minor' | 'moderate' | 'major' | 'severe';
    safety_concern: boolean;
    environmental_impact: boolean;
    noise_level?: 'low' | 'medium' | 'high';
    duration_hours?: number;
    status: 'pending' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assigned_to?: {
        role: any;
        email: any;
        id: number;
        name: string;
        avatar?: string;
    };
    resolution_notes?: string;
    resolved_at?: string;
    acknowledged_at?: string;
    created_at: string;
    updated_at: string;
    evidences?: Array<{
        id: number;
        file_path: string;
        file_name: string;
        file_type: string;
        file_size: number;
    }>;
    tags?: string[];
    views?: number;
    source?: 'web' | 'mobile' | 'email' | 'phone' | 'in_person' | 'other';
};

export interface PaginationData {
    current_page: number;
    data: CommunityReport[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
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

export type BulkOperation = 'export' | 'print' | 'delete' | 'update_status' | 'update_priority' | 
                           'assign_to' | 'generate_report' | 'send_notification' | 'escalate' | 'archive';