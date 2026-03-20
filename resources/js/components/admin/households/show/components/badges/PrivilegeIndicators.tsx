// resources/js/Pages/Admin/Households/Show/components/badges/PrivilegeIndicators.tsx

import { Badge } from '@/components/ui/badge';
import { Resident } from '../../types';
import { getPrivilegeColor, getPrivilegeIcon } from '../../utils/badge-utils';
import { Award, HandHelping, Scale, Briefcase, Users, Heart, User } from 'lucide-react';

interface PrivilegeIndicatorsProps {
    resident: Resident;
}

const iconMap: Record<string, React.ElementType> = {
    Award, HandHelping, Scale, Briefcase, Users, Heart, User
};

export const PrivilegeIndicators = ({ resident }: PrivilegeIndicatorsProps) => {
    if (!resident.privileges_list || resident.privileges_list.length === 0) {
        return null;
    }
    
    // Show only active privileges
    const activePrivileges = resident.privileges_list.filter(p => p.status === 'active' || p.status === 'expiring_soon');
    
    if (activePrivileges.length === 0) return null;
    
    const getIconComponent = (code: string) => {
        const iconName = getPrivilegeIcon(code);
        const Icon = iconMap[iconName] || Award;
        return <Icon className="h-3 w-3" />;
    };
    
    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {activePrivileges.slice(0, 3).map((privilege) => (
                <Badge 
                    key={privilege.id} 
                    className={`${getPrivilegeColor(privilege.code)} text-xs`}
                >
                    {getIconComponent(privilege.code)}
                    <span className="ml-1">{privilege.code}</span>
                </Badge>
            ))}
            {activePrivileges.length > 3 && (
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs">
                    +{activePrivileges.length - 3}
                </Badge>
            )}
        </div>
    );
};