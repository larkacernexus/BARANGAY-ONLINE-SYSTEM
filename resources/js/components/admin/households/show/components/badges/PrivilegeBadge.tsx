// components/admin/households/privilege-badge.tsx

import { Privilege } from '@/types/admin/households/household.types';
import { formatDate } from '../../utils/helpers';
import {
    Award, HandHelping, Scale, Briefcase, Users, Heart, User,
    CheckCircle, Clock, XCircle, AlertCircle
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Extended privilege type with optional fields that might exist in the data
interface ExtendedPrivilege extends Privilege {
    discount_percentage?: number;
    id_number?: string;
    expires_at?: string;
    verified_at?: string;
}

interface PrivilegeBadgeProps {
    privilege: Privilege | ExtendedPrivilege;
}

// Local helper functions (to avoid import issues)
const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        expiring_soon: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        pending: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    };
    return colors[status] || colors.pending;
};

const getPrivilegeIcon = (code: string): string => {
    const icons: Record<string, string> = {
        'SC': 'Award',
        'OSP': 'Award',
        'PWD': 'HandHelping',
        'SP': 'Heart',
        'IND': 'Home',
        '4PS': 'Users',
        'IP': 'Shield',
        'FRM': 'Truck',
        'FSH': 'Ship',
        'OFW': 'Briefcase',
        'SCH': 'GraduationCap',
        'UNE': 'User',
        'VET': 'Shield',
        'SOLO': 'Heart',
    };
    return icons[code] || 'Award';
};

const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
        active: 'CheckCircle',
        expiring_soon: 'Clock',
        expired: 'XCircle',
        pending: 'AlertCircle'
    };
    return icons[status] || 'AlertCircle';
};

const iconMap: Record<string, React.ElementType> = {
    Award, HandHelping, Scale, Briefcase, Users, Heart, User,
    CheckCircle, Clock, XCircle, AlertCircle
};

export const PrivilegeBadge = ({ privilege }: PrivilegeBadgeProps) => {
    // Cast to ExtendedPrivilege to access optional properties
    const extendedPrivilege = privilege as ExtendedPrivilege;
    
    const getIconComponent = () => {
        const iconName = getPrivilegeIcon(privilege.code);
        const Icon = iconMap[iconName] || Award;
        return <Icon className="h-3 w-3" />;
    };

    const getStatusIconComponent = () => {
        const iconName = getStatusIcon(privilege.status);
        const Icon = iconMap[iconName] || AlertCircle;
        return <Icon className="h-3 w-3" />;
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border cursor-help ${getStatusColor(privilege.status)}`}>
                        {getIconComponent()}
                        <span className="font-semibold">{privilege.name}</span>
                        {extendedPrivilege.discount_percentage && (
                            <span className="text-[10px] bg-white/50 dark:bg-gray-900/50 px-1 rounded">
                                {extendedPrivilege.discount_percentage}%
                            </span>
                        )}
                        {extendedPrivilege.id_number && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1 bg-white/50 dark:bg-gray-900/50 px-1 rounded">
                                #{extendedPrivilege.id_number}
                            </span>
                        )}
                        <span className="text-[10px] opacity-70">
                            {getStatusIconComponent()}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                        <p className="font-medium dark:text-gray-100">{privilege.name}</p>
                        {privilege.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{privilege.description}</p>
                        )}
                        {extendedPrivilege.discount_percentage && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {extendedPrivilege.discount_percentage}% discount eligible
                            </p>
                        )}
                        {extendedPrivilege.id_number && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {extendedPrivilege.id_number}
                            </p>
                        )}
                        {extendedPrivilege.expires_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Expires: {formatDate(extendedPrivilege.expires_at)}
                            </p>
                        )}
                        {extendedPrivilege.verified_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Verified: {formatDate(extendedPrivilege.verified_at)}
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};