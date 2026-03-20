// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegesList.tsx

import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { Privilege } from '../../types';
import { PrivilegeBadge } from '../badges';
import { getRelationshipColor, getPrivilegeColor, getPrivilegeIcon } from '../../utils/badge-utils';
import { formatRelationship } from '../../utils/helpers';

interface PrivilegesListProps {
    privileges: Privilege[];
}

export const PrivilegesList = ({ privileges }: PrivilegesListProps) => {
    const [showAll, setShowAll] = useState(false);
    
    if (!privileges || privileges.length === 0) {
        return (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No privileges assigned</p>
        );
    }

    const displayedPrivileges = showAll ? privileges : privileges.slice(0, 3);
    const hasMore = privileges.length > 3;

    const sortedPrivileges = [...displayedPrivileges].sort((a, b) => {
        const statusOrder = { active: 1, expiring_soon: 2, pending: 3, expired: 4 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 5) - 
               (statusOrder[b.status as keyof typeof statusOrder] || 5);
    });

    return (
        <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
                {sortedPrivileges.map((privilege) => (
                    <PrivilegeBadge key={privilege.id} privilege={privilege} />
                ))}
            </div>
            {hasMore && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none"
                >
                    {showAll ? 'Show less' : `+${privileges.length - 3} more`}
                </button>
            )}
        </div>
    );
};