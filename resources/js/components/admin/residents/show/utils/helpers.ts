// resources/js/Pages/Admin/Residents/Show/utils/helpers.ts

import { format, parseISO } from 'date-fns';
import { ResidentPrivilege } from '../types';

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