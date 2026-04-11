// resources/js/admin-utils/residentsUtils.ts
import { Resident, Purok, Privilege, Household } from '@/types/admin/residents/residents-types';
import { toast } from 'sonner';

// ========== LOCAL TYPE DEFINITIONS ==========

// Define FilterState locally since it's not exported from types
// IMPORTANT: Keep this consistent with the main FilterState in your types file
interface FilterState {
    status: string;
    purok_id: string | number;
    gender: string;
    min_age: string | number;
    max_age: string | number;
    civil_status: string;
    is_voter: string;
    is_head: string;
    privilege_id?: string | number;
    privilege?: string;
    search?: string;
}

// Extended Privilege type with additional properties needed for the UI
// This matches the structure from your pivot relationship
// Using Partial<Privilege> to make base properties optional
interface PrivilegeWithDetails extends Partial<Privilege> {
    // Required core properties
    id: number;
    code: string;
    name: string;
    // Additional UI properties
    pivot: any;
    id_number?: string;
    expires_at?: string;
    status?: 'active' | 'expiring_soon' | 'expired' | 'pending';
    granted_at?: string;
    granted_by?: number;
}

// ========== TYPE GUARDS ==========

/**
 * Type guard to check if a value is a string
 */
const isString = (value: unknown): value is string => {
    return typeof value === 'string';
};

/**
 * Type guard to check if a value is a number
 */
const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
};

/**
 * Type guard to check if a value is a valid Privilege with pivot details
 */
const isPrivilegeWithDetails = (value: unknown): value is PrivilegeWithDetails => {
    if (!value || typeof value !== 'object') return false;
    const obj = value as Record<string, unknown>;
    return (
        (typeof obj.id === 'number' || typeof obj.id === 'undefined') &&
        (typeof obj.code === 'string' || typeof obj.code === 'undefined') &&
        (typeof obj.name === 'string' || typeof obj.name === 'undefined')
    );
};

/**
 * Type guard to check if a value is an array of Privilege
 * This now properly handles both ResidentPrivilege and PrivilegeWithDetails
 */
const isPrivilegeArray = (value: unknown): value is PrivilegeWithDetails[] => {
    if (!Array.isArray(value)) return false;
    
    // Check if each item has the minimum required properties
    return value.every(item => {
        if (!item || typeof item !== 'object') return false;
        const obj = item as Record<string, unknown>;
        // Allow either name or code to be present (for flexibility)
        return (typeof obj.id === 'number' || typeof obj.id === 'string') &&
               (typeof obj.code === 'string' || typeof obj.name === 'string');
    });
};

/**
 * Helper function to get privilege status from dates
 */
const getPrivilegeStatusFromDates = (validUntil?: string): 'active' | 'expiring_soon' | 'expired' | 'pending' => {
    if (!validUntil) return 'active';
    
    try {
        const expiryDate = new Date(validUntil);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'expired';
        } else if (diffDays <= 30) {
            return 'expiring_soon';
        }
        
        return 'active';
    } catch {
        return 'active';
    }
};

/**
 * Type guard to safely convert any privilege to PrivilegeWithDetails
 */
const toPrivilegeWithDetails = (privilege: any): PrivilegeWithDetails => {
    // Get the valid_until date from various possible sources
    const validUntil = privilege.valid_until || privilege.expires_at || privilege.pivot?.valid_until;
    
    // Return the extended object with all required properties
    return {
        id: privilege.id || 0,
        code: privilege.code || '',
        name: privilege.name || privilege.privilege_name || privilege.title || 'Unknown Privilege',
        description: privilege.description || '',
        category: privilege.category || null,
        valid_until: validUntil,
        is_active: privilege.is_active !== undefined ? privilege.is_active : true,
        requires_verification: privilege.requires_verification !== undefined ? privilege.requires_verification : false,
        created_at: privilege.created_at || null,
        updated_at: privilege.updated_at || null,
        pivot: privilege.pivot || null,
        id_number: privilege.id_number || privilege.pivot?.id_number?.toString(),
        expires_at: privilege.expires_at || validUntil,
        granted_at: privilege.granted_at || privilege.pivot?.granted_at,
        granted_by: privilege.granted_by || privilege.pivot?.granted_by,
        status: privilege.status || getPrivilegeStatusFromDates(validUntil)
    };
};

/**
 * Type guard for household membership
 */
interface HouseholdMembership {
    is_head: boolean;
    relationship_to_head?: string;
    household?: Household | {
        id: number;
        household_number: string;
        head_of_family?: string;
        name?: string;
    };
}

const isHouseholdMembership = (value: unknown): value is HouseholdMembership => {
    if (!value || typeof value !== 'object') return false;
    const obj = value as Record<string, unknown>;
    return (
        (typeof obj.is_head === 'boolean' || typeof obj.is_head === 'undefined') &&
        (typeof obj.household === 'object' || typeof obj.household === 'undefined')
    );
};

/**
 * Type guard for Purok object
 */
interface PurokObject {
    id: number;
    name: string;
}

const isPurokObject = (value: unknown): value is PurokObject => {
    if (!value || typeof value !== 'object') return false;
    const obj = value as Record<string, unknown>;
    return (
        (typeof obj.id === 'number' || typeof obj.id === 'string') &&
        (typeof obj.name === 'string')
    );
};

// ========== CORE UTILITIES ==========

/**
 * Safely convert unknown to number
 */
export const safeNumber = (value: unknown, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    
    return defaultValue;
};

/**
 * Safely convert unknown to string
 */
export const safeString = (value: unknown, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return defaultValue;
        }
    }
    
    return defaultValue;
};

/**
 * Safely truncate text with type checking
 */
export const truncateText = (text: unknown, maxLength: number = 30): string => {
    const str = safeString(text);
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
};

/**
 * Safely truncate address
 */
export const truncateAddress = (address: unknown, maxLength: number = 40): string => {
    const str = safeString(address);
    if (!str) return 'N/A';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
};

/**
 * Safely format contact number
 */
export const formatContactNumber = (contact: unknown): string => {
    const str = safeString(contact);
    if (!str) return 'N/A';
    if (str.length <= 12) return str;
    return truncateText(str, 12);
};

/**
 * Safely get photo URL
 */
export const getPhotoUrl = (photoPath?: unknown, photoUrl?: unknown): string | null => {
    const path = safeString(photoPath);
    const url = safeString(photoUrl);
    
    if (url) return url;
    if (!path) return null;
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    const cleanPath = path.replace('public/', '');
    
    if (cleanPath.startsWith('storage/')) {
        return `/${cleanPath}`;
    }
    
    if (cleanPath.includes('resident-photos') || cleanPath.includes('resident_photos')) {
        return `/storage/${cleanPath}`;
    }
    
    return `/storage/${cleanPath}`;
};

/**
 * Safely get full name from resident
 */
export const getFullName = (resident: Resident): string => {
    // Check if full_name is already set and is a string
    if (isString(resident.full_name) && resident.full_name) {
        return resident.full_name;
    }

    const firstName = safeString(resident.first_name);
    const lastName = safeString(resident.last_name);
    const middleName = safeString(resident.middle_name);
    const suffix = safeString(resident.suffix);
    
    let name = firstName;
    
    if (middleName) {
        name += ` ${middleName.charAt(0)}.`;
    }
    
    name += ` ${lastName}`;
    
    if (suffix) {
        name += ` ${suffix}`;
    }
    
    return name || 'Unknown';
};

/**
 * Safely get household info - returns format expected by ResidentCard
 */
interface HouseholdInfo {
    id: number;
    name: string;
}

export const getHouseholdInfo = (resident: Resident): HouseholdInfo | null => {
    // Check household_memberships
    const memberships = resident.household_memberships;
    
    if (Array.isArray(memberships) && memberships.length > 0) {
        const membership = memberships[0];
        
        if (isHouseholdMembership(membership) && membership.household) {
            const household = membership.household;
            return {
                id: safeNumber(household.id),
                name: safeString(
                    (household as any).household_number || 
                    (household as any).head_of_family || 
                    (household as any).name || 
                    'Unknown Household'
                )
            };
        }
    }
    
    // Check direct household property
    if (resident.household) {
        const household = resident.household;
        return {
            id: safeNumber(household.id),
            name: safeString(
                household.household_number || 
                (household as any).name || 
                (household as any).head_of_family || 
                'Unknown Household'
            )
        };
    }
    
    return null;
};

/**
 * Get detailed household info (for internal use)
 */
interface DetailedHouseholdInfo {
    id: number;
    household_number: string;
    head_of_family: string;
    relationship_to_head: string;
    is_head: boolean;
}

export const getDetailedHouseholdInfo = (resident: Resident): DetailedHouseholdInfo | null => {
    const memberships = resident.household_memberships;
    
    if (Array.isArray(memberships) && memberships.length > 0) {
        const membership = memberships[0];
        
        if (isHouseholdMembership(membership) && membership.household) {
            const household = membership.household;
            return {
                id: safeNumber(household.id),
                household_number: safeString((household as any).household_number),
                head_of_family: safeString((household as any).head_of_family || (household as any).name),
                relationship_to_head: safeString(membership.relationship_to_head),
                is_head: membership.is_head === true
            };
        }
    }
    
    return null;
};

/**
 * Check if resident is head of household
 */
export const isHeadOfHousehold = (resident: Resident): boolean => {
    const memberships = resident.household_memberships;
    
    if (Array.isArray(memberships) && memberships.length > 0) {
        return memberships.some(membership => {
            if (isHouseholdMembership(membership)) {
                return membership.is_head === true;
            }
            return false;
        });
    }
    
    return false;
};

/**
 * Get status badge variant
 */
export const getStatusBadgeVariant = (status: unknown): "default" | "secondary" | "destructive" | "outline" => {
    const statusStr = safeString(status).toLowerCase();
    
    switch (statusStr) {
        case 'active': 
            return 'default';
        case 'inactive':
        case 'deceased':
            return 'secondary';
        case 'suspended':
            return 'destructive';
        default: 
            return 'outline';
    }
};

/**
 * Get formatted status label
 */
export const getStatusLabel = (status: unknown): string => {
    const statusStr = safeString(status);
    if (!statusStr) return 'Unknown';
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
};

/**
 * Get truncation length based on screen width
 */
export const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'occupation' = 'name'): number => {
    if (typeof window === 'undefined') return 30;
    
    const width = window.innerWidth;
    if (width < 480) {
        switch(type) {
            case 'name': return 15;
            case 'address': return 20;
            case 'contact': return 8;
            case 'occupation': return 12;
            default: return 15;
        }
    }
    if (width < 640) {
        switch(type) {
            case 'name': return 20;
            case 'address': return 25;
            case 'contact': return 10;
            case 'occupation': return 15;
            default: return 20;
        }
    }
    if (width < 768) {
        switch(type) {
            case 'name': return 25;
            case 'address': return 30;
            case 'contact': return 12;
            case 'occupation': return 20;
            default: return 25;
        }
    }
    if (width < 1024) {
        switch(type) {
            case 'name': return 30;
            case 'address': return 35;
            case 'contact': return 15;
            case 'occupation': return 25;
            default: return 30;
        }
    }
    switch(type) {
        case 'name': return 35;
        case 'address': return 40;
        case 'contact': return 15;
        case 'occupation': return 30;
        default: return 35;
    }
};

// ========== PRIVILEGE UTILITIES ==========

/**
 * Safely convert any privilege array to PrivilegeWithDetails[]
 */
const safePrivilegesArray = (privileges: any[] | undefined): PrivilegeWithDetails[] => {
    if (!privileges || !Array.isArray(privileges)) {
        return [];
    }
    
    return privileges.map(privilege => toPrivilegeWithDetails(privilege));
};

/**
 * Get privilege status from pivot data
 */
const getPrivilegeStatus = (privilege: any): 'active' | 'expiring_soon' | 'expired' | 'pending' => {
    // If status is already set in the privilege object
    if (privilege.status) {
        return privilege.status;
    }
    
    // Check if there's a valid_until date
    const validUntil = privilege.valid_until || privilege.pivot?.valid_until || privilege.expires_at;
    
    if (!validUntil) {
        return 'active';
    }
    
    try {
        const expiryDate = new Date(validUntil);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'expired';
        } else if (diffDays <= 30) {
            return 'expiring_soon';
        }
    } catch {
        // Invalid date format
    }
    
    return 'active';
};

/**
 * Get active privileges from resident
 */
export const getActivePrivileges = (resident: Resident): PrivilegeWithDetails[] => {
    const privileges = safePrivilegesArray(resident.privileges);
    
    return privileges.filter(p => {
        const status = getPrivilegeStatus(p);
        return status === 'active' || status === 'expiring_soon';
    });
};

/**
 * Get all privileges from resident with details
 */
export const getAllPrivileges = (resident: Resident): PrivilegeWithDetails[] => {
    const privileges = safePrivilegesArray(resident.privileges);
    
    return privileges.map(p => ({
        ...p,
        status: getPrivilegeStatus(p),
        id_number: p.id_number || p.pivot?.id_number?.toString(),
        expires_at: p.expires_at || p.valid_until || p.pivot?.valid_until,
        granted_at: p.granted_at || p.pivot?.granted_at,
        granted_by: p.granted_by || p.pivot?.granted_by
    }));
};

/**
 * Check if resident has a specific privilege by code
 */
export const hasPrivilege = (resident: Resident, privilegeCode: string): boolean => {
    const privileges = safePrivilegesArray(resident.privileges);
    
    const code = safeString(privilegeCode).toUpperCase();
    
    return privileges.some(p => 
        safeString(p.code).toUpperCase() === code
    );
};

/**
 * Check if resident has active specific privilege
 */
export const hasActivePrivilege = (resident: Resident, privilegeCode: string): boolean => {
    const privileges = safePrivilegesArray(resident.privileges);
    
    const code = safeString(privilegeCode).toUpperCase();
    
    return privileges.some(p => {
        const status = getPrivilegeStatus(p);
        return safeString(p.code).toUpperCase() === code && 
               (status === 'active' || status === 'expiring_soon');
    });
};

/**
 * Check if resident has any privilege by code (case insensitive)
 */
export const hasPrivilegeByCode = (resident: Resident, privilegeCode: string): boolean => {
    return hasPrivilege(resident, privilegeCode);
};

/**
 * Get privilege count by status
 */
export const getPrivilegeCountByStatus = (resident: Resident, status: string): number => {
    const privileges = safePrivilegesArray(resident.privileges);
    
    const statusLower = safeString(status).toLowerCase();
    
    return privileges.filter(p => {
        const privStatus = getPrivilegeStatus(p);
        return privStatus === statusLower;
    }).length;
};

/**
 * Get badge variant for privilege status
 */
export const getPrivilegeBadgeVariant = (status: unknown): string => {
    const statusStr = safeString(status).toLowerCase();
    
    switch (statusStr) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400';
        case 'expiring_soon':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'expired':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400';
        case 'pending':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400';
    }
};

/**
 * Get badge color for privilege code - DYNAMIC based on code pattern
 */
export const getPrivilegeColor = (code: unknown): string => {
    const codeStr = safeString(code);
    // Generate a consistent color based on the first character of the code
    const firstChar = (codeStr?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
};

/**
 * Format privilege display
 */
export const formatPrivilegeDisplay = (privilege: PrivilegeWithDetails): string => {
    const name = safeString(privilege.name || privilege.code);
    const idNumber = safeString(privilege.id_number);
    const expiresAt = privilege.expires_at || privilege.valid_until;
    
    let display = name || 'Unknown';
    
    if (idNumber) {
        display += ` (${idNumber})`;
    }
    
    if (expiresAt) {
        display += ` - ${formatExpiryDate(expiresAt)}`;
    }
    
    return display;
};

/**
 * Get privilege icon (using Lucide icons) - DYNAMIC based on code
 */
export const getPrivilegeIcon = (code: unknown): string => {
    const codeStr = safeString(code);
    // Map based on common patterns - can be extended as needed
    const firstChar = (codeStr?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, string> = {
        'S': 'Users',      // Senior, Student
        'P': 'Heart',      // PWD
        'I': 'MapPin',     // Indigent, Indigenous
        'F': 'Tractor',    // Farmer, Fisherfolk
        'O': 'Plane',      // OFW
        '4': 'Home',       // 4Ps
        'U': 'Briefcase',  // Unemployed
        'A': 'Award',
        'B': 'Award',
        'C': 'Award',
        'D': 'Award',
        'E': 'Award',
    };
    
    return iconMap[firstChar] || 'Award';
};

/**
 * Check if privilege is expiring soon
 */
export const isPrivilegeExpiringSoon = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    
    try {
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 && diffDays <= 30;
    } catch {
        return false;
    }
};

/**
 * Format expiry date with relative time
 */
export const formatExpiryDate = (expiresAt?: string): string => {
    if (!expiresAt) return 'No expiry';
    
    try {
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Expired ${Math.abs(diffDays)} days ago`;
        } else if (diffDays === 0) {
            return 'Expires today';
        } else if (diffDays === 1) {
            return 'Expires tomorrow';
        } else if (diffDays < 30) {
            return `Expires in ${diffDays} days`;
        } else {
            return `Expires on ${formatDate(expiresAt)}`;
        }
    } catch {
        return 'Invalid date';
    }
};

// ========== MAIN FILTER FUNCTION ==========

/**
 * Filter residents based on search and filters
 */
export const filterResidents = (
    residents: Resident[], 
    search: string, 
    filters: FilterState,
    sortBy: string = 'last_name',
    sortOrder: string = 'asc'
): Resident[] => {
    let result = [...residents];

    // Search filter
    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(resident => {
            const fullName = getFullName(resident).toLowerCase();
            const residentId = safeString((resident as any).resident_id).toLowerCase();
            const contactNumber = safeString(resident.contact_number).toLowerCase();
            const email = safeString(resident.email).toLowerCase();
            const address = safeString((resident as any).address).toLowerCase();
            const occupation = safeString(resident.occupation).toLowerCase();
            
            // Safely get purok name
            let purokName = '';
            if (isPurokObject(resident.purok)) {
                purokName = resident.purok.name.toLowerCase();
            } else if (isString(resident.purok)) {
                purokName = (resident.purok as string).toLowerCase();
            }
            
            // Safely get household number
            let householdNumber = '';
            const memberships = (resident as any).household_memberships;
            if (Array.isArray(memberships) && memberships.length > 0) {
                const membership = memberships[0];
                if (isHouseholdMembership(membership) && membership.household) {
                    householdNumber = safeString((membership.household as any).household_number).toLowerCase();
                }
            }
            
            // Search in privileges - SAFELY handle any privilege type
            const privilegeMatches = Array.isArray(resident.privileges) &&
                resident.privileges.some((p: any) => 
                    safeString(p.name || p.privilege_name).toLowerCase().includes(searchLower) ||
                    safeString(p.code).toLowerCase().includes(searchLower) ||
                    safeString(p.id_number).toLowerCase().includes(searchLower)
                );
            
            return fullName.includes(searchLower) ||
                residentId.includes(searchLower) ||
                contactNumber.includes(searchLower) ||
                email.includes(searchLower) ||
                address.includes(searchLower) ||
                occupation.includes(searchLower) ||
                purokName.includes(searchLower) ||
                householdNumber.includes(searchLower) ||
                privilegeMatches;
        });
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
        result = result.filter(resident => resident.status === filters.status);
    }

    // Purok filter
    if (filters.purok_id && filters.purok_id !== 'all') {
        const purokId = safeNumber(filters.purok_id);
        result = result.filter(resident => resident.purok_id === purokId);
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
        result = result.filter(resident => resident.gender === filters.gender);
    }

    // Age filter - Convert string to number before comparing
    if (filters.min_age && filters.min_age !== '') {
        const minAge = safeNumber(filters.min_age);
        result = result.filter(resident => (resident.age || 0) >= minAge);
    }
    if (filters.max_age && filters.max_age !== '') {
        const maxAge = safeNumber(filters.max_age);
        result = result.filter(resident => (resident.age || 0) <= maxAge);
    }

    // Civil status filter
    if (filters.civil_status && filters.civil_status !== 'all') {
        result = result.filter(resident => resident.civil_status === filters.civil_status);
    }

    // Voter filter
    if (filters.is_voter && filters.is_voter !== 'all') {
        const isVoter = filters.is_voter === '1' || filters.is_voter === 'yes';
        result = result.filter(resident => resident.is_voter === isVoter);
    }
    
    // Head of household filter
    if (filters.is_head && filters.is_head !== 'all') {
        const isHead = filters.is_head === '1' || filters.is_head === 'yes';
        result = result.filter(resident => isHeadOfHousehold(resident) === isHead);
    }

    // Privilege filter (by privilege ID)
    if (filters.privilege_id && filters.privilege_id !== 'all') {
        const privilegeId = safeNumber(filters.privilege_id);
        result = result.filter(resident => 
            Array.isArray(resident.privileges) &&
            resident.privileges.some((p: any) => p.id === privilegeId)
        );
    }

    // Privilege filter (by privilege code)
    if (filters.privilege && filters.privilege !== 'all') {
        const privilegeCode = safeString(filters.privilege);
        result = result.filter(resident => 
            hasPrivilegeByCode(resident, privilegeCode)
        );
    }

    // Sorting
    result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
            case 'last_name':
                aValue = safeString(a.last_name).toLowerCase();
                bValue = safeString(b.last_name).toLowerCase();
                break;
            case 'first_name':
                aValue = safeString(a.first_name).toLowerCase();
                bValue = safeString(b.first_name).toLowerCase();
                break;
            case 'age':
                aValue = a.age || 0;
                bValue = b.age || 0;
                break;
            case 'created_at':
                aValue = new Date(safeString(a.created_at) || 0).getTime();
                bValue = new Date(safeString(b.created_at) || 0).getTime();
                break;
            case 'purok_id':
                if (isPurokObject(a.purok)) {
                    aValue = safeString(a.purok.name).toLowerCase();
                } else {
                    aValue = safeString(a.purok).toLowerCase();
                }
                if (isPurokObject(b.purok)) {
                    bValue = safeString(b.purok.name).toLowerCase();
                } else {
                    bValue = safeString(b.purok).toLowerCase();
                }
                break;
            case 'status':
                aValue = safeString(a.status).toLowerCase();
                bValue = safeString(b.status).toLowerCase();
                break;
            case 'household':
                const aHousehold = getHouseholdInfo(a);
                const bHousehold = getHouseholdInfo(b);
                aValue = safeString(aHousehold?.name).toLowerCase();
                bValue = safeString(bHousehold?.name).toLowerCase();
                break;
            case 'privileges_count':
                aValue = Array.isArray(a.privileges) ? a.privileges.length : 0;
                bValue = Array.isArray(b.privileges) ? b.privileges.length : 0;
                break;
            default:
                aValue = safeString(a.last_name).toLowerCase();
                bValue = safeString(b.last_name).toLowerCase();
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });

    return result;
};

// ========== SELECTION STATS ==========

interface SelectionStats {
    total: number;
    male: number;
    female: number;
    other: number;
    voters: number;
    heads: number;
    averageAge: number;
    hasPhotos: number;
    active: number;
    inactive: number;
    privilegeCounts: Record<string, number>;
}

/**
 * Get statistics for selected residents
 */
export const getSelectionStats = (selectedResidents: Resident[]): SelectionStats => {
    if (selectedResidents.length === 0) {
        return {
            total: 0,
            male: 0,
            female: 0,
            other: 0,
            voters: 0,
            heads: 0,
            averageAge: 0,
            hasPhotos: 0,
            active: 0,
            inactive: 0,
            privilegeCounts: {}
        };
    }
    
    const avgAge = selectedResidents.length > 0 
        ? selectedResidents.reduce((sum, r) => sum + (r.age || 0), 0) / selectedResidents.length
        : 0;
    
    // Calculate privilege counts - SAFELY handle any privilege type
    const privilegeCounts: Record<string, number> = {};
    selectedResidents.forEach(resident => {
        if (Array.isArray(resident.privileges)) {
            resident.privileges.forEach((p: any) => {
                const code = safeString(p.code);
                if (code) {
                    privilegeCounts[code] = (privilegeCounts[code] || 0) + 1;
                }
            });
        }
    });
    
    return {
        total: selectedResidents.length,
        male: selectedResidents.filter(r => r.gender === 'male').length,
        female: selectedResidents.filter(r => r.gender === 'female').length,
        other: selectedResidents.filter(r => r.gender === 'other').length,
        voters: selectedResidents.filter(r => r.is_voter === true).length,
        heads: selectedResidents.filter(r => isHeadOfHousehold(r)).length,
        active: selectedResidents.filter(r => r.status === 'active').length,
        hasPhotos: selectedResidents.filter(r => (r as any).photo_path).length,
        averageAge: Math.round(avgAge * 10) / 10,
        inactive: selectedResidents.filter(r => r.status === 'inactive').length,
        privilegeCounts
    };
};

// ========== FORMATTING ==========

/**
 * Format date safely
 */
export const formatDate = (dateString: unknown): string => {
    const str = safeString(dateString);
    if (!str) return 'N/A';
    
    try {
        const date = new Date(str);
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

/**
 * Format residents data for clipboard
 */
export const formatForClipboard = (residents: Resident[]): string => {
    if (residents.length === 0) return '';
    
    const headers = [
        'Full Name',
        'Resident ID',
        'Gender',
        'Age',
        'Birthdate',
        'Contact Number',
        'Email',
        'Address',
        'Purok',
        'Civil Status',
        'Occupation',
        'Educational Attainment',
        'Status',
        'Voter',
        'Head of Household',
        'Privileges'
    ];
    
    const rows = residents.map(resident => {
        // Format privileges as pipe-separated codes with status
        let privilegesFormatted = '';
        if (Array.isArray(resident.privileges)) {
            privilegesFormatted = resident.privileges
                .map((p: any) => {
                    let priv = safeString(p.code);
                    const status = getPrivilegeStatus(p);
                    const idNumber = safeString(p.id_number);
                    
                    if (status && status !== 'active') {
                        priv += `(${status})`;
                    }
                    if (idNumber) {
                        priv += `:${idNumber}`;
                    }
                    return priv;
                })
                .join('|');
        }
        
        // Get purok name safely
        let purokName = '';
        if (isPurokObject(resident.purok)) {
            purokName = resident.purok.name;
        } else if (isString(resident.purok)) {
            purokName = resident.purok;
        } else {
            purokName = 'N/A';
        }
        
        return [
            `"${getFullName(resident)}"`,
            `"${safeString((resident as any).resident_id)}"`,
            `"${safeString(resident.gender) || 'N/A'}"`,
            safeString(resident.age),
            `"${formatDate(resident.birth_date)}"`,
            `"${safeString(resident.contact_number)}"`,
            `"${safeString(resident.email)}"`,
            `"${safeString((resident as any).address)}"`,
            `"${purokName}"`,
            `"${safeString(resident.civil_status) || 'N/A'}"`,
            `"${safeString(resident.occupation)}"`,
            `"${safeString((resident as any).educational_attainment)}"`,
            `"${safeString(resident.status) || 'N/A'}"`,
            resident.is_voter ? 'Yes' : 'No',
            isHeadOfHousehold(resident) ? 'Yes' : 'No',
            `"${privilegesFormatted}"`
        ];
    });
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};