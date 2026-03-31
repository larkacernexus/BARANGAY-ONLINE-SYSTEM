// // components/blotter/BlotterTypes.ts
// export interface Resident {
//     id: number;
//     name: string;
//     first_name: string;
//     last_name: string;
//     address?: string;
//     contact_number?: string;
// }

// export interface IncidentType {
//     code: string;
//     name: string;
//     category: string;
//     description: string;
//     priority_level: number;
//     resolution_days: number;
//     requires_evidence: boolean;
//     legal_basis?: string;
// }

// export interface BlotterFormData {
//     incident_type: string;
//     incident_description: string;
//     incident_datetime: string;
//     location: string;
//     barangay: string;
//     reporter_name: string;
//     reporter_contact: string;
//     reporter_address: string;
//     reporter_is_resident: boolean;
//     reporter_resident_id: number | null;
//     respondent_name: string;
//     respondent_address: string;
//     respondent_is_resident: boolean;
//     respondent_resident_id: number | null;
//     witnesses: string;
//     evidence: string;
//     priority: string;
//     involved_residents: number[];
//     attachments: File[];
// }