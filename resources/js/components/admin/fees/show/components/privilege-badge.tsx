// resources/js/Pages/Admin/Fees/components/privilege-badge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getPrivilegeIcon, getPrivilegeColor } from '../utils/privileges';

interface Props {
    privilege: any;
}

export const PrivilegeBadge = ({ privilege }: Props) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 cursor-help ${getPrivilegeColor(privilege.code)}`}
                    >
                        <span className="mr-1">{getPrivilegeIcon(privilege.code)}</span>
                        {privilege.name || privilege.code}
                        {privilege.discount_percentage && (
                            <span className="ml-1 text-[10px] opacity-80">
                                ({privilege.discount_percentage}%)
                            </span>
                        )}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium dark:text-gray-100">{privilege.name || privilege.code}</p>
                    {privilege.description && (
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{privilege.description}</p>
                    )}
                    {privilege.discount_percentage && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {privilege.discount_percentage}% discount eligible
                        </p>
                    )}
                    {privilege.id_number && (
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                            ID: {privilege.id_number}
                        </p>
                    )}
                    {privilege.expires_at && (
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                            Expires: {new Date(privilege.expires_at).toLocaleDateString()}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};