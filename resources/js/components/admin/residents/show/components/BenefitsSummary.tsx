// resources/js/Pages/Admin/Residents/Show/components/BenefitsSummary.tsx

import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, AlertCircle } from "lucide-react";
import { ResidentPrivilege } from '@/types/admin/residents/residents-types';
import { 
    getPrivilegeIconName, 
    getPrivilegeIcon, 
    getDiscountPercentage, 
    getDiscountColor,
    getPrivilegeName,
    getPrivilegeStatus
} from '@/components/admin/residents/show/utils/badge-utils';

interface BenefitsSummaryProps {
    privileges: ResidentPrivilege[];
    activePrivileges: ResidentPrivilege[];
    maxDiscount: number;
    discountTypes: Set<string>;
}

export const BenefitsSummary = ({ 
    privileges, 
    activePrivileges, 
    maxDiscount, 
    discountTypes 
}: BenefitsSummaryProps) => {
    const hasPrivileges = privileges.length > 0;
    
    // Get expiring soon privileges using the utility function
    const expiringSoon = privileges.filter(p => {
        const status = getPrivilegeStatus(p);
        return status === 'expiring_soon';
    });

    return (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider dark:text-gray-100">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Benefits Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl">
                        <p className="text-2xl font-black text-green-600 dark:text-green-400">{activePrivileges.length}</p>
                        <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-tighter">Active</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{maxDiscount}%</p>
                        <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-tighter">Max Off</p>
                    </div>
                </div>
                
                {hasPrivileges && (
                    <div className="space-y-4">
                        {discountTypes.size > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest">Entitlements</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(discountTypes).map((type) => (
                                        <Badge key={type} variant="secondary" className="text-[10px] px-2 py-0">
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator className="dark:bg-gray-700" />
                        
                        <div className="space-y-2.5">
                            <h4 className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest">Active Benefits</h4>
                            <div className="space-y-2">
                                {activePrivileges.slice(0, 4).map((p) => {
                                    // Get discount using utility function
                                    const discount = getDiscountPercentage(p) ?? 0;
                                    const privilegeName = getPrivilegeName(p);
                                    const IconName = getPrivilegeIconName(p);
                                    const IconComponent = getPrivilegeIcon(IconName);

                                    return (
                                        <div key={p.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-xs font-medium dark:text-gray-300 truncate max-w-[120px]" title={privilegeName}>
                                                    {privilegeName}
                                                </span>
                                            </div>
                                            {discount > 0 ? (
                                                <span className={`text-[11px] font-bold ${getDiscountColor(discount)}`}>
                                                    -{discount}%
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">No disc.</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {activePrivileges.length > 4 && (
                                <div className="text-center pt-1">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                        +{activePrivileges.length - 4} more
                                    </span>
                                </div>
                            )}
                        </div>

                        {expiringSoon.length > 0 && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                                    {expiringSoon.length} {expiringSoon.length === 1 ? 'Benefit Expiring Soon' : 'Benefits Expiring Soon'}
                                </span>
                            </div>
                        )}
                        
                        {/* Show if no active benefits but has other privileges */}
                        {activePrivileges.length === 0 && privileges.length > 0 && (
                            <div className="mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                                    No active benefits
                                </span>
                            </div>
                        )}
                    </div>
                )}
                
                {!hasPrivileges && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                            <BarChart3 className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No benefits assigned</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This resident has no active benefits</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};