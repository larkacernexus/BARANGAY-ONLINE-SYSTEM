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
    Heart,
    Home,
    Shield,
    Briefcase,
    BadgePercent,
    Star,
    ShoppingBag,
    HelpCircle
} from "lucide-react";
import { ResidentPrivilege } from '@/types/admin/residents/residents-types';

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
        case 'pending':
            return { iconName: 'AlertCircle', iconClass: 'h-3 w-3 text-amber-500' };
        case 'suspended':
            return { iconName: 'AlertCircle', iconClass: 'h-3 w-3 text-red-500' };
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
        case 'suspended': return 'destructive';
        default: return 'outline';
    }
};

/**
 * Background and text colors for Privilege badges
 */
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

/**
 * Resolves icon name for specific privileges
 */
export const getPrivilegeIconName = (privilege: ResidentPrivilege): string => {
    // Get privilege name and code from either direct properties or nested privilege object
    const code = privilege.privilege?.code || privilege.privilege_code || '';
    const name = privilege.privilege?.name || privilege.privilege_name || '';
    const nameLower = name.toLowerCase();
    
    // Check by code first
    switch (code) {
        case 'SC': 
        case 'SENIOR': 
            return 'Heart';
        case 'PWD': 
            return 'Accessibility';
        case '4PS': 
        case '4PS_MEMBER':
            return 'Users';
        case 'SCH': 
        case 'STUDENT':
            return 'GraduationCap';
        case 'OFW': 
            return 'Globe';
        case 'SOLO_PARENT':
            return 'Home';
        case 'VETERAN':
            return 'Shield';
        case 'EMPLOYEE':
            return 'Briefcase';
        case 'DISCOUNT':
            return 'BadgePercent';
        case 'SCHOLAR':
            return 'Star';
        default:
            // Check by name
            if (nameLower.includes('senior') || nameLower.includes('elder')) return 'Heart';
            if (nameLower.includes('disability') || nameLower.includes('pwd')) return 'Accessibility';
            if (nameLower.includes('student')) return 'GraduationCap';
            if (nameLower.includes('solo') || nameLower.includes('parent')) return 'Home';
            if (nameLower.includes('veteran') || nameLower.includes('military')) return 'Shield';
            if (nameLower.includes('employee') || nameLower.includes('worker')) return 'Briefcase';
            if (nameLower.includes('discount')) return 'BadgePercent';
            if (nameLower.includes('scholar')) return 'Star';
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
        Heart,
        Home,
        Shield,
        Briefcase,
        BadgePercent,
        Star,
        ShoppingBag,
        CheckCircle,
        XCircle,
        Skull,
        AlertCircle
    };
    return icons[iconName] || HelpCircle;
};

/**
 * Config for Civil Status badges - Updated to handle null/undefined
 */
export const getCivilStatusBadgeConfig = (status: string | null | undefined): { 
    label: string; 
    className: string; 
    variant?: "outline" | "secondary" | "default" 
} => {
    const s = status?.toLowerCase() || '';
    switch (s) {
        case 'married':
            return { 
                label: 'Married', 
                className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
            };
        case 'single':
            return { 
                label: 'Single', 
                className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700', 
                variant: 'outline' 
            };
        case 'widowed':
            return { 
                label: 'Widowed', 
                className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
            };
        case 'divorced':
            return { 
                label: 'Divorced', 
                className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' 
            };
        case 'separated':
            return { 
                label: 'Separated', 
                className: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' 
            };
        default:
            return { 
                label: status || 'Not Specified', 
                className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                variant: 'outline' 
            };
    }
};

/**
 * Config for Gender badges - Updated to handle null/undefined
 */
export const getGenderBadgeConfig = (gender: string | null | undefined): { 
    label: string; 
    className: string; 
    variant?: "outline" | "secondary" | "default" 
} => {
    const g = gender?.toLowerCase() || '';
    switch (g) {
        case 'male':
            return { 
                label: 'Male', 
                className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
            };
        case 'female':
            return { 
                label: 'Female', 
                className: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-200' 
            };
        case 'other':
            return { 
                label: 'Other', 
                className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
            };
        default:
            return { 
                label: gender || 'Not Specified', 
                className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                variant: 'outline' 
            };
    }
};

/**
 * Formats Household Relationship strings
 */
export const formatRelationship = (relationship: string | null | undefined): string => {
    if (!relationship) return "Not Specified";
    return relationship
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Colors for Relationship badges (Head of Family vs Member)
 */
export const getRelationshipColor = (relationship: string | null | undefined): string => {
    const r = relationship?.toLowerCase() || '';
    switch (r) {
        case 'head':
        case 'head_of_family':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
        case 'spouse':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
        case 'child':
            return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800';
        case 'parent':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        default:
            return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
};

/**
 * Helper for styling discount percentages
 */
export const getDiscountColor = (discount: number): string => {
    if (discount >= 20) return "text-green-600 dark:text-green-400 font-bold";
    if (discount >= 10) return "text-blue-600 dark:text-blue-400 font-semibold";
    return "text-gray-600 dark:text-gray-400";
};

/**
 * Safe retrieval of discount percentage
 */
export const getDiscountPercentage = (privilege: ResidentPrivilege): number | null => {
    // Check various possible locations for discount percentage
    if (privilege.discount_percentage) {
        return typeof privilege.discount_percentage === 'number' 
            ? privilege.discount_percentage 
            : parseInt(privilege.discount_percentage);
    }
    if (privilege.privilege?.default_discount_percentage) {
        return privilege.privilege.default_discount_percentage;
    }
    if (privilege.privilege?.discount_type?.percentage) {
        return privilege.privilege.discount_type.percentage;
    }
    return null;
};

/**
 * Get privilege name safely
 */
export const getPrivilegeName = (privilege: ResidentPrivilege): string => {
    return privilege.privilege?.name || privilege.privilege_name || 'Unknown Benefit';
};

/**
 * Get privilege code safely
 */
export const getPrivilegeCode = (privilege: ResidentPrivilege): string => {
    return privilege.privilege?.code || privilege.privilege_code || '';
};

/**
 * Check if privilege is expiring soon (within X days)
 */
export const isExpiringSoon = (privilege: ResidentPrivilege, daysThreshold: number = 30): boolean => {
    if (!privilege.expiry_date) return false;
    
    const expiryDate = new Date(privilege.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
};

/**
 * Check if privilege is expired
 */
export const isExpired = (privilege: ResidentPrivilege): boolean => {
    if (!privilege.expiry_date) return false;
    
    const expiryDate = new Date(privilege.expiry_date);
    const today = new Date();
    
    return expiryDate < today;
};

/**
 * Get privilege status based on expiry date and other factors
 */
export const getPrivilegeStatus = (privilege: ResidentPrivilege): 'active' | 'expiring_soon' | 'expired' | 'pending' => {
    if (privilege.status) {
        return privilege.status;
    }
    
    if (privilege.pivot?.status) {
        return privilege.pivot.status as any;
    }
    
    if (isExpired(privilege)) {
        return 'expired';
    }
    
    if (isExpiringSoon(privilege)) {
        return 'expiring_soon';
    }
    
    return 'active';
};

/**
 * Get privilege discount display text
 */
export const getDiscountDisplay = (privilege: ResidentPrivilege): string | null => {
    const discount = getDiscountPercentage(privilege);
    if (discount) {
        return `${discount}% off`;
    }
    return null;
};

/**
 * Get privilege status badge variant
 */
export const getPrivilegeStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'active': return 'default';
        case 'expiring_soon': return 'secondary';
        case 'expired': return 'destructive';
        case 'pending': return 'outline';
        default: return 'outline';
    }
};