// resources/js/Pages/Admin/Residents/Show/utils/helpers.ts

import { format, parseISO } from 'date-fns';
import { ResidentPrivilege } from '@/types/admin/residents/residents-types';

export const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatShortDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatShortDate(dateString);
};

export const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Expired ${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
        return 'Expires today';
    } else if (diffDays === 1) {
        return 'Expires tomorrow';
    } else if (diffDays < 30) {
        return `Expires in ${diffDays} days`;
    } else {
        return `Expires on ${formatDate(dateString)}`;
    }
};

/**
 * Get photo URL from path or full URL
 * Handles both string, null, and undefined values
 */
export const getPhotoUrl = (photoPath?: string | null, photoUrl?: string | null): string | null => {
    // Check photo URL first (full URL)
    if (photoUrl && photoUrl.trim()) {
        // If it's already a full URL or absolute path, return as is
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('/')) {
            return photoUrl;
        }
        // Otherwise, ensure it has a leading slash
        return `/${photoUrl.replace(/^\/+/, '')}`;
    }
    
    // Check photo path (relative path)
    if (photoPath && photoPath.trim()) {
        // Remove 'public/' prefix if present
        const cleanPath = photoPath.replace('public/', '');
        // Remove leading slash if present to avoid double slash
        const finalPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
        return `/storage/${finalPath}`;
    }
    
    return null;
};

/**
 * Get photo URL or return default avatar
 */
export const getPhotoOrDefault = (photoPath?: string | null, photoUrl?: string | null): string => {
    const photo = getPhotoUrl(photoPath, photoUrl);
    return photo || '/images/default-avatar.png';
};

/**
 * Check if resident has a photo
 */
export const hasPhoto = (photoPath?: string | null, photoUrl?: string | null): boolean => {
    return !!(getPhotoUrl(photoPath, photoUrl));
};

export const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

/**
 * Get full name from resident object
 */
export const getFullName = (resident: {
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
}): string => {
    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    if (resident.suffix) {
        name += ` ${resident.suffix}`;
    }
    return name;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get privilege discount percentage
 */
export const getPrivilegeDiscount = (privilege: ResidentPrivilege): number | null => {
    if (privilege.discount_percentage) {
        return typeof privilege.discount_percentage === 'number' 
            ? privilege.discount_percentage 
            : parseInt(privilege.discount_percentage);
    }
    
    if (privilege.privilege?.default_discount_percentage) {
        return privilege.privilege.default_discount_percentage;
    }
    
    if (privilege.privilege?.discount_type?.percentage) {
        return privilege.privilege.discount_type.percentage;
    }
    
    return null;
};

/**
 * Get privilege status based on expiry date
 */
export const getPrivilegeStatus = (privilege: ResidentPrivilege): 'active' | 'expiring_soon' | 'expired' | 'pending' => {
    if (privilege.status) {
        return privilege.status;
    }
    
    if (privilege.pivot?.status) {
        return privilege.pivot.status as any;
    }
    
    if (privilege.expiry_date) {
        const expiryDate = new Date(privilege.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (expiryDate < today) {
            return 'expired';
        }
        
        if (daysUntilExpiry <= 30) {
            return 'expiring_soon';
        }
    }
    
    return 'active';
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber?: string | null): string => {
    if (!phoneNumber) return 'N/A';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a 11-digit mobile number (Philippines)
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    // Check if it's a 10-digit mobile number (without leading 0)
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
        return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // Return original if format doesn't match
    return phoneNumber;
};

/**
 * Get address string from resident
 */
export const getAddress = (resident: {
    house_number?: string | null;
    street?: string | null;
    purok?: { name: string } | null;
}): string => {
    const parts = [];
    
    if (resident.house_number) parts.push(resident.house_number);
    if (resident.street) parts.push(resident.street);
    if (resident.purok?.name) parts.push(resident.purok.name);
    
    return parts.join(', ') || 'No address specified';
};