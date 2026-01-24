export interface DocumentType {
    id: number;
    name: string;
    description: string;
    is_required: boolean;
    sort_order: number;
}

export interface ClearanceType {
    is_popular: boolean;
    id: number;
    name: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    description: string;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    purpose_options: string[];
    document_types: DocumentType[];
    has_required_documents: boolean;
    document_types_count: number;
}

export interface Resident {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    id: number;
    full_name: string;
    address: string;
    contact_number: string;
    purok_name?: string;
}

export interface PageProps {
    clearanceTypes: ClearanceType[];
    resident: Resident;
}

export interface UploadedFileWithMetadata {
    file: File;
    description: string;
    document_type_id?: number;
}

export interface FormData {
    clearance_type_id: string;
    purpose: string;
    purpose_custom: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes: string;
    resident_id: string;
    documents: File[];
    descriptions: string[];
    document_type_ids: number[];
}

export interface PurposeOption {
    value: string;
    label: string;
    icon: any;
}