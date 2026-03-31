// resources/js/types/blotter.ts

export interface Blotter {
    id: number;
    blotter_number: string;
    incident_type: string;
    incident_type_code?: string;
    incident_description: string;
    incident_datetime: string;
    formatted_datetime: string;
    location: string;
    barangay: string;
    reporter_name: string;
    reporter_contact: string | null;
    reporter_address: string | null;
    respondent_name: string | null;
    respondent_address: string | null;
    witnesses: string | null;
    evidence: string | null;
    status: 'pending' | 'investigating' | 'resolved' | 'archived';
    status_badge: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    priority_badge: string;
    action_taken: string | null;
    investigator: string | null;
    resolved_datetime: string | null;
    attachments: Array<{
        file_path: string;
        file_type: any;
        id: number;
        file_name: string;
        file_size: number;
        name: string;
        path: string;
        size: number;
        type: string;
    }> | null;
    involved_residents: Array<{
        id: number;
        name: string;
        address: string;
        contact: string;
    }> | null;
    created_at: string;
    updated_at: string;
}

export interface BlotterStats {
    total: number;
    pending: number;
    investigating: number;
    resolved: number;
    archived: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
}

export interface BlotterFilters {
    status: string;
    priority: string;
    incident_type: string;
    barangay: string;
    date_from: string;
    date_to: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    search?: string;
}

export interface Attachment {
    file_type: string;
    id: number;
    file_name: string;
    file_size: number;
    name: string;
    path: string;
    size: number;
    type: string;
    url?: string;
    preview?: string;
}

export interface InvolvedResident {
    id: number;
    name: string;
    address: string | null;
    contact: string | null;
}

export interface IncidentType {
    code: string;
    name: string;
    category: string;
    description: string;
    priority_level: number;
    resolution_days: number;
    requires_evidence: boolean;
    legal_basis?: string;
}

export interface Resident {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    address?: string;
    contact_number?: string;
}