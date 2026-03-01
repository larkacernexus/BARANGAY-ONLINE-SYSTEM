// types/community-report.ts

export interface FileWithPreview extends File {
    preview: string;
    id: string;
    type: string;
}

export interface ReportType {
    id: number;
    name: string;
    code: string;
    description: string;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    priority_label: string;
    priority_color: string;
    category: 'issue' | 'complaint';
}

export interface LocalDraft {
    id: string;
    report_type_id: number | null;
    title: string;
    description: string;
    location: string;
    incident_date: string;
    incident_time: string;
    urgency: 'low' | 'medium' | 'high';
    is_anonymous: boolean;
    reporter_name: string;
    reporter_contact: string;
    files: Array<{name: string, size: number, type: string, lastModified: number}>;
    created_at: string;
    updated_at: string;
}

export interface PageProps {
    reportTypes?: ReportType[];
    auth: any;
}

export interface PreviewModalState {
    isOpen: boolean;
    url: string;
    type: string;
    name: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high';