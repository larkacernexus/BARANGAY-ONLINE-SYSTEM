// resources/js/Pages/Admin/Fees/utils/privileges.tsx
import React from 'react';
import {
    Award,
    HandHelping,
    Scale,
    Briefcase,
    Users,
    Heart,
    User
} from 'lucide-react';

export const getPrivilegeIcon = (code: string): React.ReactNode => {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, React.ReactNode> = {
        'S': <Award className="h-3 w-3" />,
        'P': <HandHelping className="h-3 w-3" />,
        'I': <Scale className="h-3 w-3" />,
        'F': <Briefcase className="h-3 w-3" />,
        'O': <Users className="h-3 w-3" />,
        '4': <Heart className="h-3 w-3" />,
        'U': <User className="h-3 w-3" />,
        'A': <Award className="h-3 w-3" />,
        'B': <Award className="h-3 w-3" />,
        'C': <Award className="h-3 w-3" />,
        'D': <Award className="h-3 w-3" />,
        'E': <Award className="h-3 w-3" />,
    };
    
    return iconMap[firstChar] || <Award className="h-3 w-3" />;
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

export const getResidentPrivileges = (resident: any): any[] => {
    if (!resident) return [];
    
    // Check for privileges array
    if (resident.privileges && Array.isArray(resident.privileges)) {
        return resident.privileges.filter((p: any) => 
            p.status === 'active' || p.status === 'expiring_soon'
        );
    }
    
    // Check for privileges_list
    if (resident.privileges_list && Array.isArray(resident.privileges_list)) {
        return resident.privileges_list.filter((p: any) => 
            p.status === 'active' || p.status === 'expiring_soon'
        );
    }
    
    return [];
};