// resources/js/Pages/Admin/Households/Show/utils/badge-utils.ts

import { Privilege } from '../types';

export const getPrivilegeIcon = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, string> = {
        'S': 'Award',
        'P': 'HandHelping',
        'I': 'Scale',
        'F': 'Briefcase',
        'O': 'Users',
        '4': 'Heart',
        'U': 'User',
        'A': 'Award',
        'B': 'Award',
        'C': 'Award',
        'D': 'Award',
        'E': 'Award',
    };
    
    return iconMap[firstChar] || 'Award';
};

export const getPrivilegeColor = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};

export const getStatusIcon = (status: string): string => {
    switch (status) {
        case 'active': return 'CheckCircle';
        case 'expiring_soon': return 'Clock';
        case 'expired': return 'XCircle';
        default: return 'AlertCircle';
    }
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        case 'expired': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

export const getRelationshipColor = (relationship: string): string => {
    const rel = relationship.toLowerCase();
    if (rel === 'head') return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    if (rel.includes('spouse')) return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
    if (rel.includes('son') || rel.includes('daughter') || rel.includes('child')) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    if (rel.includes('father') || rel.includes('mother') || rel.includes('parent')) return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    if (rel.includes('brother') || rel.includes('sister') || rel.includes('sibling')) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    if (rel.includes('grand')) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
};