// resources/js/components/admin/blotters/show/types.ts

export interface InvolvedResident {
    id: number;
    name: string;
    address: string | null;
    contact: string | null;
}

export interface Attachment {
    name: string;
    path: string;
    size: number;
    type: string;
    url?: string;
    preview?: string;
}

export interface Blotter {
    id: number;
    blotter_number: string;
    incident_type: string;
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
    status: string;
    status_badge: string;
    priority: string;
    priority_badge: string;
    action_taken: string | null;
    investigator: string | null;
    resolved_datetime: string | null;
    attachments: Attachment[] | null;
    involved_residents: InvolvedResident[] | null;
    created_at: string;
    updated_at: string;
}

export interface TabDefinition {
    id: string;
    label: string;
    icon: React.ReactNode;
    count?: number;
    disabled?: boolean;
}