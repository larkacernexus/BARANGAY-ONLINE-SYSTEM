import { 
    Briefcase, GraduationCap, Building, FileCheck, Car, Banknote, 
    Users, Home as HomeIcon, PenSquare, AlertCircle 
} from 'lucide-react';

// Common purpose options
export const COMMON_PURPOSE_OPTIONS = [
    { value: 'employment', label: 'Employment', icon: Briefcase },
    { value: 'education', label: 'Education/School', icon: GraduationCap },
    { value: 'business', label: 'Business Registration', icon: Building },
    { value: 'government', label: 'Government Transaction', icon: FileCheck },
    { value: 'travel', label: 'Travel/Passport', icon: Car },
    { value: 'loan', label: 'Loan Application', icon: Banknote },
    { value: 'marriage', label: 'Marriage License', icon: Users },
    { value: 'housing', label: 'Housing Application', icon: HomeIcon },
    { value: 'vehicle', label: 'Vehicle Registration', icon: Car },
    { value: 'voter', label: 'Voter\'s Registration', icon: Users },
    { value: 'nbi', label: 'NBI Clearance', icon: FileCheck },
    { value: 'police', label: 'Police Clearance', icon: FileCheck },
    { value: 'health', label: 'Health Certificate', icon: FileCheck },
    { value: 'business_permit', label: 'Business Permit', icon: Building },
    { value: 'building_permit', label: 'Building Permit', icon: Building },
    { value: 'property', label: 'Property Transaction', icon: HomeIcon },
    { value: 'insurance', label: 'Insurance Claim', icon: Banknote },
    { value: 'legal', label: 'Legal Document', icon: FileCheck },
    { value: 'scholarship', label: 'Scholarship Application', icon: GraduationCap },
    { value: 'immigration', label: 'Immigration', icon: Users },
    { value: 'custom', label: 'Other/Custom', icon: PenSquare },
];

// Local storage key for draft
export const CLEARANCE_DRAFT_KEY = 'clearance_request_draft';

// Interface for localStorage draft
export interface ClearanceDraft {
    clearance_type_id: string;
    purpose: string;
    purpose_custom: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes: string;
    uploadedFilesMetadata: Array<{
        name: string;
        size: number;
        type: string;
        description: string;
        document_type_id?: number;
    }>;
    selectedDocumentTypes: number[];
    activeStep: number;
    lastSaved: string;
}

// Helper to generate draft ID
export const generateDraftId = () => {
    return 'clearance_draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};