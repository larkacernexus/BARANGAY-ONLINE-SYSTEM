// resources/js/Pages/Admin/Roles/utils/helpers.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { Permission, Role } from '../types';

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const getStatusVariant = (status: string) => {
    switch (status) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        default: return 'outline';
    }
};

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'active': return <Check className="h-3 w-3 text-green-500 dark:text-green-400" />;
        case 'inactive': return <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
        default: return null;
    }
};

export const getStatusBadge = (status: string) => {
    return (
        <Badge variant={getStatusVariant(status)} className="flex items-center gap-1">
            {getStatusIcon(status)}
            {status}
        </Badge>
    );
};

export const groupPermissionsByModule = (permissions: Permission[] = []) => {
    return permissions.reduce((groups, permission) => {
        const module = permission.module || 'General';
        if (!groups[module]) {
            groups[module] = [];
        }
        groups[module].push(permission);
        return groups;
    }, {} as Record<string, Permission[]>);
};

export const canDeleteRole = (role: Role) => {
    return !role.is_system_role && (role.users_count || 0) === 0;
};

export const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};