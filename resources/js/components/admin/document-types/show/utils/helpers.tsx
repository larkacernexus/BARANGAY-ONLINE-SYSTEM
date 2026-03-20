// resources/js/Pages/Admin/DocumentTypes/utils/helpers.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
    CheckCircle, 
    XCircle, 
    FileCheck, 
    FileX,
    Folder,
    ListOrdered,
    Award
} from 'lucide-react';

// Format date
export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatShortDate(dateString);
};

// Format file size
export const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(2)} MB`;
    return `${(kb / 1024 / 1024).toFixed(2)} GB`;
};

// Get status icon
export const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" /> : 
        <XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
};

// Get status variant
export const getStatusVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
};

// Get color class for stats
export const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

// Get status badge
export const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
        return (
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
        </Badge>
    );
};

// Get required badge
export const getRequiredBadge = (isRequired: boolean) => {
    if (isRequired) {
        return (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                <FileCheck className="h-3 w-3 mr-1" />
                Required
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
            <FileX className="h-3 w-3 mr-1" />
            Optional
        </Badge>
    );
};

// Check if document type is new
export const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
};