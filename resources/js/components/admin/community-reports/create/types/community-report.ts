// types/community-report.ts
export interface Resident {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface ReportType {
    id: number;
    name: string;
    category: string;
    description: string;
    icon?: string;
    priority_label?: string;
    priority_color?: string;
    resolution_days?: number;
    requires_evidence?: boolean;
}

export interface FileWithPreview extends File {
    id: string;
    preview?: string;
}