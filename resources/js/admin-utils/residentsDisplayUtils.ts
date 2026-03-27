// admin-utils/residentsDisplayUtils.ts
import { Resident } from '@/types/admin/residents/residents-types';
import {
    formatContactNumber,
    getPhotoUrl,
    getFullName,
    isHeadOfHousehold,
    getHouseholdInfo,
    truncateText,
    truncateAddress,
    getTruncationLength
} from './residentsUtils';

// ============ String/Formatting Utilities ============
export const getInitials = (
    firstName: string | null | undefined, 
    lastName: string | null | undefined
): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
};

export const safeFormatContactNumber = (
    contactNumber: string | null | undefined
): string => {
    if (!contactNumber) return 'N/A';
    return formatContactNumber(contactNumber);
};

export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

export const calculateAge = (birthDate?: string | null): number | null => {
    if (!birthDate) return null;
    try {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    } catch {
        return null;
    }
};

// ============ Status Configuration ============
export const STATUS_CONFIG = {
    active: {
        label: 'Active',
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    },
    inactive: {
        label: 'Inactive',
        color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    },
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
    }
} as const;

export const CIVIL_STATUS_CONFIG = {
    married: { 
        label: 'Married', 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
    },
    single: { 
        label: 'Single', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
    },
    widowed: { 
        label: 'Widowed', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' 
    },
    divorced: { 
        label: 'Divorced', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
    }
} as const;

export const getStatusConfig = (status: string | null | undefined) => {
    const key = typeof status === 'string' ? status.toLowerCase() : '';
    return STATUS_CONFIG[key as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.inactive;
};

export const getCivilStatusConfig = (status: string | null | undefined) => {
    const key = typeof status === 'string' ? status.toLowerCase() : '';
    return CIVIL_STATUS_CONFIG[key as keyof typeof CIVIL_STATUS_CONFIG] || { 
        label: status || 'N/A', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' 
    };
};

// ============ Type Guards ============
export const isPurokObject = (purok: unknown): purok is { id: number; name: string } => {
    return typeof purok === 'object' && purok !== null && 'name' in purok;
};

export const isDocumentArray = (documents: unknown): documents is Array<{ id: number; name?: string }> => {
    return Array.isArray(documents);
};

// ============ Resident Data Extractors ============
export interface ResidentDisplayData {
    photoUrl: string | null;
    fullName: string;
    initials: string;
    age: number | null;
    householdInfo: { id: number; name: string } | null;
    isHead: boolean;
    hasPhoto: boolean;
    address: string;
    contactNumber?: string | null;
    birthDate: string | null;
    email?: string | null;
    civilStatus: string | null;
    gender: string | null;
    bloodType: string | null;
    occupation?: string | null;
    educationalAttainment: string | null;
    notes: string | null;
    isVoter: boolean | null;
    purokName: string | null;
    documentsCount: number;
    statusConfig: { label: string; color: string };
    civilStatusConfig: { label: string; color: string };
}

export const extractResidentDisplayData = (resident: Resident, isMobile: boolean = false): ResidentDisplayData => {
    const photoUrl = getPhotoUrl(resident.profile_photo, (resident as any).photo_url);
    const fullName = getFullName(resident);
    const initials = getInitials(resident.first_name, resident.last_name);
    const age = calculateAge(resident.birth_date);
    const householdInfo = getHouseholdInfo(resident);
    const isHead = isHeadOfHousehold(resident);
    const hasPhoto = !!photoUrl;
    
    const address = (resident as any).address || '';
    const contactNumber = resident.contact_number;
    const birthDate = resident.birth_date;
    const email = resident.email;
    const civilStatus = resident.civil_status;
    const gender = resident.gender;
    const bloodType = (resident as any).blood_type;
    const occupation = resident.occupation;
    const educationalAttainment = (resident as any).educational_attainment;
    const notes = (resident as any).notes;
    const isVoter = resident.is_voter;
    
    const purokName = isPurokObject(resident.purok) 
        ? resident.purok.name 
        : typeof resident.purok === 'string' 
            ? `Purok ${resident.purok}` 
            : null;
    
    const documentsCount = isDocumentArray((resident as any).documents) 
        ? (resident as any).documents.length 
        : 0;
    
    const statusConfig = getStatusConfig(resident.status);
    const civilStatusConfig = getCivilStatusConfig(civilStatus);
    
    return {
        photoUrl,
        fullName,
        initials,
        age,
        householdInfo,
        isHead,
        hasPhoto,
        address,
        contactNumber,
        birthDate,
        email,
        civilStatus,
        gender,
        bloodType,
        occupation,
        educationalAttainment,
        notes,
        isVoter,
        purokName,
        documentsCount,
        statusConfig,
        civilStatusConfig
    };
};

// ============ Truncation Helpers ============
export const getTruncationLengths = (isMobile: boolean) => ({
    nameLength: isMobile ? 20 : 30,
    addressLength: isMobile ? 25 : 40,
    householdNameLength: isMobile ? 15 : 25
});

// ============ Status Badge Component Helper ============
export const getStatusBadgeClass = (status: string | null | undefined): string => {
    const config = getStatusConfig(status);
    return `text-xs px-2 py-0.5 ${config.color}`;
};