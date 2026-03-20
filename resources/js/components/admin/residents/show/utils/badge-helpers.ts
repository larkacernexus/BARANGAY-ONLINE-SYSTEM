// resources/js/Pages/Admin/Residents/Show/utils/badge-helpers.ts

import { ResidentPrivilege } from '../types';

// Status utilities - returns string values only
export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'deceased':
            return 'destructive';
        default:
            return 'outline';
    }
};

export const getPrivilegeStatusColor = (status: string): string => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case 'expiring_soon':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        case 'expired':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

export const getDiscountColor = (percentage?: number): string => {
    if (!percentage) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    if (percentage >= 20) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    if (percentage >= 10) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
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

export const formatRelationship = (relationship?: string): string => {
    if (!relationship) return 'Member';
    return relationship.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

// Privilege utilities
export const getDiscountTypeName = (privilege: ResidentPrivilege): string => {
    if (privilege.discount_type_name) return privilege.discount_type_name;
    if (privilege.privilege?.discount_type?.name) return privilege.privilege.discount_type.name;
    return 'Discount';
};

export const getDiscountPercentage = (privilege: ResidentPrivilege): number | undefined => {
    if (privilege.discount_percentage) return privilege.discount_percentage;
    if (privilege.privilege?.default_discount_percentage) return privilege.privilege.default_discount_percentage;
    return undefined;
};

export const getDiscountCode = (privilege: ResidentPrivilege): string => {
    if (privilege.discount_code) return privilege.discount_code;
    if (privilege.privilege?.discount_type?.code) return privilege.privilege.discount_type.code;
    if (privilege.privilege?.code) return privilege.privilege.code;
    return 'N/A';
};

// Icon name utilities - returns string icon names only
export const getStatusIconName = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'CheckCircle';
        case 'inactive':
            return 'XCircle';
        case 'deceased':
            return 'XCircle';
        default:
            return 'AlertCircle';
    }
};

export const getPrivilegeIconName = (privilege: ResidentPrivilege): string => {
    const code = privilege.privilege?.code || privilege.privilege_code || '';
    const name = privilege.privilege?.name || privilege.privilege_name || '';
    
    switch (code) {
        case 'SC':
            return 'Award';
        case 'PWD':
            return 'Heart';
        case '4PS':
            return 'Users';
        case 'SP':
            return 'UserCheck';
        case 'IND':
            return 'Home';
        case 'IP':
            return 'Users2';
        case 'FRM':
            return 'Briefcase';
        case 'FSH':
            return 'Briefcase';
        case 'OFW':
            return 'Globe';
        case 'SCH':
            return 'GraduationCap';
        case 'OSP':
            return 'Medal';
        case 'UNE':
            return 'UserX';
        default:
            if (name.includes('Senior')) return 'Award';
            if (name.includes('Disability')) return 'Heart';
            if (name.includes('4Ps')) return 'Users';
            if (name.includes('Parent')) return 'UserCheck';
            return 'Award';
    }
};

// Text utilities
export const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'Active';
        case 'inactive':
            return 'Inactive';
        case 'deceased':
            return 'Deceased';
        default:
            return status;
    }
};

export const getCivilStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'married':
            return 'Married';
        case 'single':
            return 'Single';
        case 'widowed':
            return 'Widowed';
        case 'separated':
            return 'Separated';
        default:
            return status;
    }
};

export const getGenderText = (gender: string): string => {
    switch (gender.toLowerCase()) {
        case 'male':
            return 'Male';
        case 'female':
            return 'Female';
        case 'other':
            return 'Other';
        default:
            return gender;
    }
};