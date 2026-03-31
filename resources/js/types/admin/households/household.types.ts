// types/admin/households/household.types.ts

import { ReactNode } from 'react';

// ============================================================================
// Base Types
// ============================================================================

export type HouseholdStatus = 'active' | 'inactive' | 'archived';
export type Gender = 'male' | 'female' | 'other';
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated';
export type Relationship = 'head' | 'spouse' | 'child' | 'parent' | 'sibling' | 'grandparent' | 'other';
export type BulkAction = 'delete' | 'activate' | 'deactivate' | 'export' | 'print' | 'change_status' | 'change_purok';
export type BulkEditField = 'status' | 'purok_id' | 'notes';
export type SelectionMode = 'page' | 'filtered' | 'all';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

// ============================================================================
// Household Types
// ============================================================================

export interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    address: string;
    purok_id: number;
    purok_name?: string;
    member_count: number;
    status: HouseholdStatus;
    contact_number?: string;
    email?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    
    // Computed/Formatted fields
    formatted_created_at?: string;
    formatted_updated_at?: string;
    status_label?: string;
    status_color?: string;
}

export interface HouseholdFormData {
    head_of_family: number | null;
    address: string;
    purok_id: number | null;
    remarks: string;
    housing_type: string;
    water_source: string;
    electricity: boolean;
    internet: boolean;
    members: HouseholdMemberFormData[];
}

export interface HouseholdMemberFormData {
    resident_id: number;
    role: string;
    is_primary: boolean;
}

// ============================================================================
// Member Types
// ============================================================================

export interface HouseholdMember {
    id: number;
    household_id: number;
    resident_id?: number;
    name: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    relationship: string;
    date_of_birth?: string;
    gender?: Gender;
    civil_status?: CivilStatus;
    occupation?: string;
    is_employed?: boolean;
    monthly_income?: number;
    is_head?: boolean;
    created_at: string;
    updated_at: string;
    
    // Computed fields
    full_name?: string;
    age?: number;
    purok_id?: number;
    purok_name?: string;
    photo_path?: string;
    photo_url?: string;
}

export interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    date_of_birth?: string; 
    address?: string;
    purok_id?: number;
    purok_name?: string;
    photo_path?: string;
    photo_url?: string;
    gender?: Gender;
    civil_status?: CivilStatus;
    occupation?: string;
    
    // Computed field
    full_name?: string;
}


export interface ExtendedMember extends HouseholdMember {
    resident: Resident & {
        privileges_list?: ExtendedPrivilege[];
        full_name?: string;
        age?: number;
        date_of_birth?: string; // Added date_of_birth
        gender?: string;
        civil_status?: string;
        contact_number?: string;
        email?: string;
        address?: string;
        occupation?: string;
        education?: string;
        religion?: string;
        is_voter?: boolean;
        place_of_birth?: string;
        remarks?: string;
        
    };
    relationship_to_head?: string;
}

// Extended types for modal
export interface ExtendedPrivilege extends Privilege {
    id_number?: string;
    discount_percentage?: number;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
}

// ============================================================================
// Purok Types
// ============================================================================

export interface Purok {
    id: number;
    name: string;
    code?: string;
    description?: string;
    population?: number;
    household_count?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Privilege Types
// ============================================================================

export interface Privilege {
    id: number;
    code: string;
    name: string;
    description?: string;
    status: 'active' | 'expiring_soon' | 'expired' | 'pending';
    issued_date?: string;
    expiry_date?: string;
    issued_by?: string;
    notes?: string;
}

// ============================================================================
// Fee Types
// ============================================================================

export interface Fee {
    id: number;
    household_id: number;
    fee_type: string;
    amount: number;
    total_amount?: number;
    amount_paid?: number;
    status: 'issued' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    due_date?: string;
    paid_date?: string;
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface Payment {
    id: number;
    household_id: number;
    fee_id?: number;
    amount: number;
    total_amount?: number;
    payment_method: 'cash' | 'gcash' | 'maya' | 'online' | 'other';
    reference_number?: string;
    payment_date: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    receipt_number?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Clearance Types
// ============================================================================

export interface Clearance {
    id: number;
    household_id: number;
    resident_id?: number;
    clearance_type: string;
    status: 'pending' | 'approved' | 'rejected' | 'released' | 'expired';
    purpose?: string;
    requested_date: string;
    approved_date?: string;
    released_date?: string;
    expiry_date?: string;
    reference_number?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Resident Document Types
// ============================================================================

export interface ResidentDocument {
    id: number;
    resident_id: number;
    document_type: string;
    document_number?: string;
    file_path?: string;
    file_url?: string;
    status: 'active' | 'expired' | 'pending' | 'rejected';
    issue_date?: string;
    expiry_date?: string;
    issued_by?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Activity Log Types
// ============================================================================

export interface ActivityLog {
    id: number;
    user_id?: number;
    user_name?: string;
    action: string;
    description: string;
    model_type?: string;
    model_id?: number;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationData<T = Household> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links?: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface HouseholdFilters {
    search?: string;
    status?: HouseholdStatus;
    purok_id?: number | string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    min_members?: number;
    max_members?: number;
}

export interface FilterState {
    search: string;
    status: string;
    purok_id: string;
    from_date: string;
    to_date: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    min_members: string;
    max_members: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface HouseholdStats {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    totalMembers: number;
    averageMembers: number;
    purokCount: number;
    recent_additions?: number;
    growth_rate?: number;
    by_status?: Record<HouseholdStatus, number>;
    by_purok?: Record<string, number>;
}

export interface FilteredStats {
    total: number;
    active: number;
    inactive: number;
    totalMembers: number;
    averageMembers: number;
    purokCount: number;
}

export interface SelectionStats {
    total: number;
    totalMembers: number;
    active: number;
    inactive: number;
    archived: number;
    byPurok: Record<string, number>;
    byStatus: Record<string, number>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface HouseholdApiResponse {
    success: boolean;
    message?: string;
    data?: Household | Household[];
    errors?: Record<string, string[]>;
}

export interface BulkOperationResponse {
    success: boolean;
    message: string;
    processed_count: number;
    failed_count: number;
    errors?: BulkOperationError[];
}

export interface BulkOperationError {
    id: number;
    error: string;
}

// ============================================================================
// Page Props Types
// ============================================================================

export interface PageProps {
    auth?: any;
    flash?: FlashMessage;
    errors?: Record<string, string>;
    [key: string]: any;
}

export interface HouseholdsPageProps extends PageProps {
    households: Household[];
    stats: HouseholdStats;
    filters: HouseholdFilters;
    puroks: Purok[];
    allHouseholds: Household[];
}

export interface HouseholdsShowProps extends PageProps {
    household: Household;
    members: HouseholdMember[];
    puroks: Purok[];
    stats?: MemberStats;
}

export interface HouseholdsCreateProps extends PageProps {
    puroks: Purok[];
    heads: Resident[];
    available_residents: Resident[];
    roles: Role[];
}

export interface HouseholdsEditProps extends PageProps {
    household: Household;
    puroks: Purok[];
}

// ============================================================================
// Member Statistics Types
// ============================================================================

export interface MemberStats {
    total_members: number;
    by_gender: Record<Gender, number>;
    by_age_group: Record<string, number>;
    by_civil_status: Record<CivilStatus, number>;
    by_employment: {
        employed: number;
        unemployed: number;
    };
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
    format: ExportFormat;
    include_members?: boolean;
    date_range?: {
        start: string;
        end: string;
    };
    purok_ids?: number[];
    status?: HouseholdStatus[];
}

// ============================================================================
// Flash Message Types
// ============================================================================

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRules {
    household_number: FieldValidation;
    head_of_family: FieldValidation;
    address: FieldValidation;
    purok_id: FieldValidation;
}

export interface FieldValidation {
    required: boolean;
    unique?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    exists?: boolean;
}

export const householdValidationRules: ValidationRules = {
    household_number: {
        required: true,
        unique: true,
        pattern: /^[A-Z0-9-]+$/
    },
    head_of_family: {
        required: true,
        min: 2,
        max: 100
    },
    address: {
        required: true,
        min: 5,
        max: 200
    },
    purok_id: {
        required: true,
        exists: true
    }
};

// ============================================================================
// Utility Functions
// ============================================================================

export const formatHouseholdNumber = (number: string): string => number.toUpperCase();

export const getStatusColor = (status: HouseholdStatus): string => {
    const colors: Record<HouseholdStatus, string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[status];
};

export const getStatusLabel = (status: HouseholdStatus): string => {
    const labels: Record<HouseholdStatus, string> = {
        active: 'Active',
        inactive: 'Inactive',
        archived: 'Archived'
    };
    return labels[status];
};

export const getPurokColor = (purokName: string): string => {
    const colors: Record<string, string> = {
        'Zone 1': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Zone 2': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Zone 3': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'Zone 4': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        'Zone 5': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    };
    return colors[purokName] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

export const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

export const formatDateTime = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid Date';
    }
};

export const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const getMemberAgeGroup = (age: number): string => {
    if (age < 0) return 'Unknown';
    if (age < 1) return 'Infant';
    if (age < 5) return 'Toddler';
    if (age < 13) return 'Child';
    if (age < 20) return 'Teen';
    if (age < 60) return 'Adult';
    return 'Senior';
};

export const getGenderLabel = (gender?: Gender): string => {
    const labels: Record<Gender, string> = {
        male: 'Male',
        female: 'Female',
        other: 'Other'
    };
    return gender ? labels[gender] : 'N/A';
};

export const getCivilStatusLabel = (status?: CivilStatus): string => {
    const labels: Record<CivilStatus, string> = {
        single: 'Single',
        married: 'Married',
        widowed: 'Widowed',
        separated: 'Separated'
    };
    return status ? labels[status] : 'N/A';
};

export const getRelationshipLabel = (relationship: string): string => {
    const labels: Record<string, string> = {
        head: 'Head of Family',
        spouse: 'Spouse',
        child: 'Child',
        parent: 'Parent',
        sibling: 'Sibling',
        grandparent: 'Grandparent',
        other: 'Other'
    };
    return labels[relationship.toLowerCase()] || relationship;
};

export const getFullName = (firstName: string, lastName: string, middleName?: string): string => {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
};

export const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    if (photoUrl) {
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('/')) {
            return photoUrl;
        }
        return `/${photoUrl.replace(/^\/+/, '')}`;
    }
    
    if (photoPath) {
        const cleanPath = photoPath.replace('public/', '');
        return `/storage/${cleanPath}`;
    }
    
    return null;
};

export const hasPhoto = (item: { photo_path?: string; photo_url?: string }): boolean => {
    return !!(item.photo_path || item.photo_url);
};

// ============================================================================
// Additional Utility Functions
// ============================================================================

/**
 * Check if a record was created within the last 7 days
 */
export const isNew = (createdAt: string): boolean => {
    if (!createdAt) return false;
    try {
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    } catch {
        return false;
    }
};

/**
 * Check if a record was created within the last N days
 */
export const isRecent = (createdAt: string, days: number = 7): boolean => {
    if (!createdAt) return false;
    try {
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    } catch {
        return false;
    }
};

/**
 * Get relative time string (e.g., "2 days ago", "just now")
 */
export const getRelativeTime = (date: string): string => {
    if (!date) return 'N/A';
    try {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return formatDate(date);
    } catch {
        return 'Invalid date';
    }
};