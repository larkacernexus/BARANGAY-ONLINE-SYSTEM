// types/clearance.ts
export interface ClearanceRequest {
    reference_number(reference_number: any): unknown;
    valid_until: any;
    status_display: string;
    clearance_number: any;
    issue_date(issue_date: any): import("react").ReactNode;
    urgency(urgency: any): "default" | "destructive" | "outline" | "secondary" | null | undefined;
    urgency_display: any;
    formatted_fee: string;
    fee_amount: any;
    additional_requirements: any;
    requirements_met: boolean;
    payment: any;
    estimated_completion_date: any;
    issuing_officer_name: any;
    processed_at: any;
    remarks: any;
    admin_notes: any;
    id: number;
    resident_id: number;
    clearance_type_id: number;
    control_number: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    purpose: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes?: string;
    amount_due?: number;
    amount_paid?: number;
    payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
    issued_date?: string;
    expiry_date?: string;
    signed_by?: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    resident?: Resident;
    clearance_type?: ClearanceType;
    documents?: ClearanceDocument[];
    payments?: Payment[];
    status_history?: StatusHistory[];
    notes?: OfficerNote[];
}

export interface ClearanceDocument {
    status: string;
    id: number;
    clearance_request_id: number;
    document_type_id?: number;
    name: string;
    file_path: string;
    description?: string;
    uploaded_at: string;
    
    // Relationships
    document_type?: DocumentType;
}

export interface Payment {
    id: number;
    clearance_request_id: number;
    amount: number;
    payment_method: 'cash' | 'gcash' | 'paymaya' | 'bank_transfer' | 'others';
    reference_number?: string;
    payment_date: string;
    status: 'pending' | 'verified' | 'rejected';
    verified_by?: string;
    verified_at?: string;
    created_at: string;
}

export interface StatusHistory {
    id: number;
    clearance_request_id: number;
    status: string;
    remarks?: string;
    created_by: string;
    created_at: string;
}

export interface OfficerNote {
    id: number;
    clearance_request_id: number;
    content: string;
    created_by: string;
    created_at: string;
}

export interface DocumentType {
    id: number;
    name: string;
    description?: string;
    is_required: boolean;
    file_types?: string[];
    max_size?: number; // in MB
}