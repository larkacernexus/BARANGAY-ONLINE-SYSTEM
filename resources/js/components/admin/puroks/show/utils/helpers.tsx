// resources/js/Pages/Admin/Puroks/utils/helpers.ts

import React from 'react';
import { format, parseISO } from 'date-fns';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Home,
    Users,
    BarChart3,
    Activity,
    Globe,
    MapPin,
} from 'lucide-react';

// Define the Resident interface to resolve ts(2304)
export interface Resident {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    [key: string]: any;
}

export const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'pending': return 'outline';
        default: return 'outline';
    }
};

export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        default:
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    }
};

export const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return <CheckCircle className="h-3 w-3" />;
        case 'inactive':
            return <XCircle className="h-3 w-3" />;
        case 'pending':
            return <Clock className="h-3 w-3" />;
        default:
            return <AlertCircle className="h-3 w-3" />;
    }
};

export const getFullName = (resident: Resident) => {
    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    return name;
};

export const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case 'home': return <Home className="h-4 w-4" />;
        case 'users': return <Users className="h-4 w-4" />;
        case 'bar-chart-3': return <BarChart3 className="h-4 w-4" />;
        case 'activity': return <Activity className="h-4 w-4" />;
        case 'globe': return <Globe className="h-4 w-4" />;
        default: return <MapPin className="h-4 w-4" />;
    }
};

export const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'gray': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
};

// FIXED: Updated to accept string | number | null
export const formatCoordinates = (latitude?: string | number | null, longitude?: string | number | null) => {
    if (!latitude || !longitude) {
        return 'Not set';
    }
    
    // Convert to numbers if they're strings
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    
    // Check if they're valid numbers
    if (isNaN(lat) || isNaN(lng)) {
        return 'Invalid coordinates';
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
};

// Add these helper functions for better coordinate handling
export const parseCoordinate = (coord?: string | number | null): number | null => {
    if (coord === undefined || coord === null) return null;
    
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    
    if (isNaN(num)) return null;
    
    return num;
};

export const isValidCoordinates = (latitude?: string | number | null, longitude?: string | number | null): boolean => {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    
    return lat !== null && lng !== null;
};