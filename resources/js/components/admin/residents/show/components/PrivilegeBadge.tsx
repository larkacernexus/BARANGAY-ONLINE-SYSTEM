import * as Icons from 'lucide-react';
import { Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResidentPrivilege } from '../types';
import { getPrivilegeIconName, getPrivilegeStatusColor, getDiscountPercentage } from '../utils/badge-utils';
import { formatDate } from '../utils/helpers';

export const PrivilegeBadge = ({ privilege }: { privilege: ResidentPrivilege }) => {
    const iconName = getPrivilegeIconName(privilege);
    const statusColor = getPrivilegeStatusColor(privilege.status);
    const discount = getDiscountPercentage(privilege);
    const Icon = (Icons as any)[iconName] || Icons.Award;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border cursor-help ${statusColor}`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-semibold">{privilege.privilege?.name || 'Privilege'}</span>
                        {discount && <span className="ml-1 px-1 bg-white/50 rounded">{discount}%</span>}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <p className="font-bold">{privilege.id_number ? `#${privilege.id_number}` : 'No ID'}</p>
                        <p className="text-xs">Issued: {formatDate(privilege.issued_date)}</p>
                        {privilege.privilege?.requires_verification && (
                            <p className="text-[10px] text-amber-500 flex items-center gap-1">
                                <Shield className="h-3 w-3" /> Requires Verification
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};