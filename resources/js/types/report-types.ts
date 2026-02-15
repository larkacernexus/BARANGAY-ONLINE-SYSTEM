// types/report-types.ts
export interface ReportType {
    id: number;
    name: string;
    code: string;
    description?: string;
    icon?: string;
    color?: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    required_fields?: any[];
    resolution_steps?: any[];
    assigned_to_roles?: string[];
    created_at: string;
    updated_at: string;
}

export type BulkOperation = 'export' | 'print' | 'delete' | 'activate' | 'deactivate' | 'update_priority' | 'export_csv' | 'export_pdf' | 'duplicate' | 'generate_reports' | 'send_message';

export type BulkEditField = 'status' | 'priority';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface FilterState {
    search: string;
    status: string;
    priority: string;
    requires_action: string;
}

export interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    requiresImmediateAction: number;
    requiresEvidence: number;
    allowsAnonymous: number;
    totalResolutionDays: number;
}

export interface PageProps {
    reportTypes: ReportType[];
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        requires_action?: string;
    };
    stats: {
        total: number;
        active: number;
        requires_immediate_action: number;
        allows_anonymous: number;
        requires_evidence: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}