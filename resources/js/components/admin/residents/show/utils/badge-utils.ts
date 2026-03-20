import { 
    CheckCircle, 
    XCircle, 
    Skull, 
    AlertCircle, 
    Award, 
    Accessibility, 
    Users, 
    GraduationCap, 
    Globe,
    HelpCircle
} from "lucide-react";
import { ResidentPrivilege } from '../types';

export interface StatusConfig {
    iconName: string;
    iconClass: string;
}

/**
 * Returns icon configuration for resident status
 */
export const getStatusConfig = (status: string): StatusConfig => {
    switch (status?.toLowerCase()) {
        case 'active':
            return { iconName: 'CheckCircle', iconClass: 'h-3 w-3 text-green-500' };
        case 'inactive':
            return { iconName: 'XCircle', iconClass: 'h-3 w-3 text-gray-500' };
        case 'deceased':
            return { iconName: 'Skull', iconClass: 'h-3 w-3 text-red-600' };
        default:
            return { iconName: 'AlertCircle', iconClass: 'h-3 w-3 text-amber-500' };
    }
};

/**
 * Shadcn Badge variants for general status
 */
export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'deceased': return 'destructive';
        default: return 'outline';
    }
};

/**
 * Background and text colors for Privilege badges
 */
export const getPrivilegeStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        case 'expired': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

/**
 * Resolves icon name for specific privileges
 */
export const getPrivilegeIconName = (privilege: ResidentPrivilege): string => {
    const code = privilege.privilege?.code || privilege.privilege_code || '';
    const name = privilege.privilege?.name || privilege.privilege_name || '';
    
    switch (code) {
        case 'SC': return 'Award';
        case 'PWD': return 'Accessibility';
        case '4PS': return 'Users';
        case 'SCH': return 'GraduationCap';
        case 'OFW': return 'Globe';
        default:
            if (name.includes('Senior')) return 'Award';
            if (name.includes('Disability')) return 'Accessibility';
            return 'Award';
    }
};

/**
 * Maps icon name strings to actual Lucide Components
 */
export const getPrivilegeIcon = (iconName: string) => {
    const icons: Record<string, any> = {
        Award,
        Accessibility,
        Users,
        GraduationCap,
        Globe,
        CheckCircle,
        XCircle,
        Skull,
        AlertCircle
    };
    return icons[iconName] || HelpCircle;
};

/**
 * Config for Civil Status badges
 */
export const getCivilStatusBadgeConfig = (status: string): { label: string; className: string; variant?: "outline" | "secondary" | "default" } => {
    const s = status?.toLowerCase() || '';
    switch (s) {
        case 'married':
            return { label: 'Married', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' };
        case 'single':
            return { label: 'Single', className: 'dark:border-gray-600 dark:text-gray-300', variant: 'outline' };
        case 'widowed':
            return { label: 'Widowed', className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' };
        case 'separated':
            return { label: 'Separated', className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' };
        default:
            return { label: status || 'Unknown', className: '', variant: 'outline' };
    }
};

/**
 * Config for Gender badges
 */
export const getGenderBadgeConfig = (gender: string): { label: string; className: string; variant?: "outline" | "secondary" | "default" } => {
    const g = gender?.toLowerCase() || '';
    switch (g) {
        case 'male':
            return { label: 'Male', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' };
        case 'female':
            return { label: 'Female', className: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-200' };
        default:
            return { label: gender || 'Other', className: '', variant: 'outline' };
    }
};

/**
 * NEW: Formats Household Relationship strings
 */
export const formatRelationship = (relationship: string | null | undefined): string => {
    if (!relationship) return "Not Specified";
    return relationship
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * NEW: Colors for Relationship badges (Head of Family vs Member)
 */
export const getRelationshipColor = (relationship: string | null | undefined): string => {
    const r = relationship?.toLowerCase() || '';
    switch (r) {
        case 'head':
        case 'head_of_family':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
        case 'spouse':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
        default:
            return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
};

/**
 * Helper for styling discount percentages
 */
export const getDiscountColor = (discount: number): string => {
    if (discount >= 20) return "text-green-600 dark:text-green-400";
    if (discount >= 10) return "text-blue-600 dark:text-blue-400";
    return "text-gray-600 dark:text-gray-400";
};

/**
 * Safe retrieval of discount percentage
 */
export const getDiscountPercentage = (privilege: ResidentPrivilege): number | undefined => {
    return privilege.discount_percentage || privilege.privilege?.default_discount_percentage || undefined;
};