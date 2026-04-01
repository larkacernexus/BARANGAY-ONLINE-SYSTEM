// resources/js/Pages/Admin/Permissions/utils/helpers.tsx
import React from 'react';
import {
    LayoutDashboard,
    Users,
    Home,
    File,
    Calendar as CalendarIcon,
    Settings,
    Bell,
    BarChart3,
    Database,
    FileText,
    Check,
    X,
    Shield,
    Hash,
    Building,
    Key,
    User,
} from 'lucide-react';

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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

export const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
};

export const getModuleDisplayName = (moduleName: string) => {
    switch (moduleName) {
        case 'Dashboard': return 'Dashboard';
        case 'Residents': return 'Residents Management';
        case 'Households': return 'Households Management';
        case 'Fees': return 'Fees Collection';
        case 'Calendar': return 'Calendar & Events';
        case 'Settings': return 'System Settings';
        case 'Notifications': return 'Notifications';
        case 'Reports': return 'Reports & Analytics';
        case 'Database': return 'Database Management';
        default: return moduleName;
    }
};

export const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
        case 'Dashboard': return <LayoutDashboard className="h-5 w-5" />;
        case 'Residents': return <Users className="h-5 w-5" />;
        case 'Households': return <Home className="h-5 w-5" />;
        case 'Fees': return <File className="h-5 w-5" />;
        case 'Calendar': return <CalendarIcon className="h-5 w-5" />;
        case 'Settings': return <Settings className="h-5 w-5" />;
        case 'Notifications': return <Bell className="h-5 w-5" />;
        case 'Reports': return <BarChart3 className="h-5 w-5" />;
        case 'Database': return <Database className="h-5 w-5" />;
        default: return <FileText className="h-5 w-5" />;
    }
};

export const getModuleColor = (moduleName: string) => {
    switch (moduleName) {
        case 'Dashboard': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        case 'Residents': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Households': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'Fees': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'Calendar': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
        case 'Settings': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
        case 'Notifications': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
        case 'Reports': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
};

// Updated to accept boolean
export const getStatusVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? "default" : "secondary";
};

// Updated to accept boolean
export const getStatusIcon = (isActive: boolean) => {
    return isActive 
        ? <Check className="h-3 w-3 text-green-500 dark:text-green-400" />
        : <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
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

export const isSystemPermission = (name?: string) => {
    return name?.startsWith('system.') || false;
};