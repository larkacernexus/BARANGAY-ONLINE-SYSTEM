// resources/js/Pages/Admin/Reports/ReportTypes/types.ts
export interface ReportType {
    id: number;
    code: string;
    name: string;
    category: string | null;
    subcategory: string | null;
    description: string | null;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    required_fields: any[];
    resolution_steps: any[];
    assigned_to_roles: string[];
    created_at: string;
    updated_at: string;
    community_reports_count: number;
    priority_label: string;
    priority_color: string;
    priority_icon: string;
    expected_resolution_date: string;
}

export interface ReportStats {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
    with_evidence: number;
    anonymous: number;
}

export interface PageProps {
    reportType: ReportType;
    recentReports: any[];
    reportStats: ReportStats;
}

export interface Statistic {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
}