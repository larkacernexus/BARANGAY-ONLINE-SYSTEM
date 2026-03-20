// resources/js/Pages/Admin/Households/Show/components/badges/PrivilegeBadge.tsx

import { Privilege } from '../../types';
import { getStatusColor, getStatusIcon, getPrivilegeIcon, getPrivilegeColor } from '../../utils/badge-utils';
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

interface PrivilegeBadgeProps {
    privilege: Privilege;
}

const iconMap: Record<string, React.ElementType> = {
    Award, HandHelping, Scale, Briefcase, Users, Heart, User,
    CheckCircle, Clock, XCircle, AlertCircle
};

export const PrivilegeBadge = ({ privilege }: PrivilegeBadgeProps) => {
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
                        {privilege.discount_percentage && (
                            <span className="text-[10px] bg-white/50 dark:bg-gray-900/50 px-1 rounded">
                                {privilege.discount_percentage}%
                            </span>
                        )}
                        {privilege.id_number && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1 bg-white/50 dark:bg-gray-900/50 px-1 rounded">
                                #{privilege.id_number}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="font-medium dark:text-gray-100">{privilege.name}</p>
                    {privilege.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{privilege.description}</p>
                    )}
                    {privilege.discount_percentage && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {privilege.discount_percentage}% discount eligible
                        </p>
                    )}
                    {privilege.id_number && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {privilege.id_number}
                        </p>
                    )}
                    {privilege.expires_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Expires: {formatDate(privilege.expires_at)}
                        </p>
                    )}
                    {privilege.verified_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Verified: {formatDate(privilege.verified_at)}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};