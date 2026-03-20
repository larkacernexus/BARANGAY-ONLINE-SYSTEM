// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegeCategories.tsx

import { Award, HandHelping, Scale, Briefcase, Users, Heart, User } from 'lucide-react';
import { getPrivilegeColor, getPrivilegeIcon } from '../../utils/badge-utils';

interface PrivilegeCategoriesProps {
    counts: Record<string, number>;
}

const iconMap: Record<string, React.ElementType> = {
    Award, HandHelping, Scale, Briefcase, Users, Heart, User
};

export const PrivilegeCategories = ({ counts }: PrivilegeCategoriesProps) => {
    if (Object.keys(counts).length === 0) {
        return null;
    }

    const getIconComponent = (code: string) => {
        const iconName = getPrivilegeIcon(code);
        const Icon = iconMap[iconName] || Award;
        return <Icon className="h-3 w-3" />;
    };

    return (
        <div className="border dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Privilege Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(counts).map(([code, count]) => (
                    <div key={code} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className={`p-1 rounded ${getPrivilegeColor(code)}`}>
                            {getIconComponent(code)}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{code}</div>
                            <div className="text-xs text-gray-500">{count} member{count !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};