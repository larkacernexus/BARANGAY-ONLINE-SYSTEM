export interface ClearanceType {
    id: number;
    name: string;
    description: string;
    processing_days: number;
    validity_days: number;
    formatted_fee: string;
    purpose_options?: string[];
    document_types?: Array<{
        id: number;
        name: string;
        is_required: boolean;
        description?: string;
    }>;
    category?: string;
}

export interface Resident {
    middle_name: any;
    suffix: any;
    contact_number: string;
    id: number;
    first_name: string;
    last_name: string;
    address: string;
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
    _method: 'post' | 'put';
}