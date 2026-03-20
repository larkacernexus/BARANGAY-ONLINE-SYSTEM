// resources/js/Pages/Admin/Households/Show/utils/helpers.ts

import { format, parseISO } from 'date-fns';
import { Household, Resident, HouseholdMember } from '../types';

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

export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
};

export const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    if (photoUrl) return photoUrl;
    if (!photoPath) return null;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }
    
    const cleanPath = photoPath.replace('public/', '');
    
    if (cleanPath.startsWith('storage/')) {
        return `/${cleanPath}`;
    }
    
    if (cleanPath.includes('resident-photos') || cleanPath.includes('resident_photos')) {
        return `/storage/${cleanPath}`;
    }
    
    return `/storage/${cleanPath}`;
};

export const getHeadResident = (household: Household): Resident | null => {
    if (household.head_resident) {
        return household.head_resident;
    }
    
    const headMember = household.household_members?.find(member => member.is_head);
    return headMember ? headMember.resident : null;
};

export const getHeadResidentId = (household: Household): number | null => {
    const headResident = getHeadResident(household);
    return headResident ? headResident.id : null;
};

export const getFullName = (resident: Resident): string => {
    return resident.full_name || `${resident.first_name} ${resident.last_name}`;
};

export const formatRelationship = (relationship: string): string => {
    return relationship.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export const isNew = (createdAt: string, days: number = 7): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < days;
};

export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        default:
            return 'outline';
    }
};