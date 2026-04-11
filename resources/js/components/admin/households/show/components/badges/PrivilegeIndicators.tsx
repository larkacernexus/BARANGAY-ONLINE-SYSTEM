// resources/js/Pages/Admin/Households/Show/components/badges/PrivilegeIndicators.tsx

import { Badge } from '@/components/ui/badge';
import { 
    Award, HandHelping, Scale, Briefcase, Users, Heart, User,
    Shield, Building, Home, GraduationCap, Stethoscope, Truck, 
    Factory, ShoppingBag, CheckCircle, Clock, XCircle, AlertCircle
} from 'lucide-react';
import { ExtendedPrivilege } from '@/types/admin/households/household.types';

interface PrivilegeIndicatorsProps {
    privileges: ExtendedPrivilege[];
    maxDisplay?: number;
    showTooltip?: boolean;
}

// Helper to get privilege icon
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

// Helper to get privilege color
const getPrivilegeColor = (code: string): string => {
    const colors: Record<string, string> = {
        'SC': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'OSP': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'PWD': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'SP': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'IND': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        '4PS': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        'IP': 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
        'FRM': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'FSH': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
        'OFW': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'SCH': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
        'UNE': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        'VET': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'SOLO': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    };
    return colors[code] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
};

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
    Award, HandHelping, Scale, Briefcase, Users, Heart, User,
    Shield, Building, Home, GraduationCap, Stethoscope, Truck,
    Factory, ShoppingBag, CheckCircle, Clock, XCircle, AlertCircle
};

export const PrivilegeIndicators = ({ 
    privileges, 
    maxDisplay = 3,
    showTooltip = false 
}: PrivilegeIndicatorsProps) => {
    if (!privileges || privileges.length === 0) {
        return null;
    }
    
    // Filter active privileges (active or expiring_soon)
    const activePrivileges = privileges.filter(p => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
    
    if (activePrivileges.length === 0) return null;
    
    const getIconComponent = (code: string) => {
        const iconName = getPrivilegeIcon(code);
        const Icon = iconMap[iconName] || Award;
        return <Icon className="h-3 w-3 flex-shrink-0" />;
    };
    
    const displayedPrivileges = activePrivileges.slice(0, maxDisplay);
    const remainingCount = activePrivileges.length - maxDisplay;
    
    return (
        <div className="flex flex-wrap gap-1.5">
            {displayedPrivileges.map((privilege) => (
                <Badge 
                    key={privilege.id} 
                    variant="outline"
                    className={`${getPrivilegeColor(privilege.code)} text-xs px-2 py-0.5 gap-1 font-medium transition-all hover:scale-105 cursor-help`}
                    title={showTooltip ? `${privilege.name}${privilege.discount_percentage ? ` (${privilege.discount_percentage}% off)` : ''}` : undefined}
                >
                    {getIconComponent(privilege.code)}
                    <span>{privilege.code}</span>
                    {privilege.discount_percentage && (
                        <span className="text-[10px] ml-0.5 bg-white/50 dark:bg-gray-900/50 px-1 rounded">
                            {privilege.discount_percentage}%
                        </span>
                    )}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge 
                    variant="secondary" 
                    className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 font-medium"
                    title={`${remainingCount} more privilege${remainingCount !== 1 ? 's' : ''}`}
                >
                    +{remainingCount}
                </Badge>
            )}
        </div>
    );
};