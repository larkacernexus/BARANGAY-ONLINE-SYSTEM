// types/admin/residents/residents-display-types.ts
import { Resident, Purok } from './residents-types';

// ============ Display Data Types ============
export interface ResidentDisplayData {
    photoUrl: string | null;
    fullName: string;
    initials: string;
    age: number | null;
    householdInfo: { id: number; name: string } | null;
    isHead: boolean;
    hasPhoto: boolean;
    address: string;
    contactNumber: string | null;
    birthDate: string | null;
    email: string | null;
    civilStatus: string | null;
    gender: string | null;
    bloodType: string | null;
    occupation: string | null;
    educationalAttainment: string | null;
    notes: string | null;
    isVoter: boolean | null;
    purokName: string | null;
    documentsCount: number;
    statusConfig: StatusConfig;
    civilStatusConfig: CivilStatusConfig;
}

export interface StatusConfig {
    label: string;
    color: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface CivilStatusConfig {
    label: string;
    color: string;
}

// ============ Truncation Configuration ============
export interface TruncationLengths {
    nameLength: number;
    addressLength: number;
    householdNameLength: number;
}

// ============ Component Props Types (Reusable) ============
export interface BaseResidentCardProps {
    resident: Resident;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    isMobile?: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onGenerateId?: (resident: Resident) => void;
    onCreateClearance?: (resident: Resident) => void;
    onToggleStatus?: (resident: Resident) => void;
    onToggleExpand: (id: number, e: React.MouseEvent) => void;
    onViewDetails: (id: number, e: React.MouseEvent) => void;
    onEdit: (id: number, e: React.MouseEvent) => void;
}

export interface BaseResidentTableRowProps {
    resident: Resident;
    isBulkMode: boolean;
    isSelected: boolean;
    isMobile?: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onToggleStatus?: (resident: Resident) => void;
    onSort?: (column: string) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export type { Resident };
