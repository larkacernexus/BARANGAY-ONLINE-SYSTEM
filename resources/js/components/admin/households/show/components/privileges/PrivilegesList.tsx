// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegesList.tsx

import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { User, Award } from 'lucide-react';
import { ExtendedPrivilege } from '@/types/admin/households/household.types';
import { PrivilegeBadge } from '../badges/PrivilegeBadge';

interface PrivilegesListProps {
    privileges: ExtendedPrivilege[];
    maxDisplay?: number;
    showEmptyMessage?: boolean;
    emptyMessage?: string;
}

// Helper to sort privileges by status priority
const sortPrivilegesByStatus = (privileges: ExtendedPrivilege[]): ExtendedPrivilege[] => {
    const statusOrder: Record<string, number> = { 
        active: 1, 
        expiring_soon: 2, 
        pending: 3, 
        expired: 4 
    };
    
    return [...privileges].sort((a, b) => {
        const orderA = statusOrder[a.status] || 5;
        const orderB = statusOrder[b.status] || 5;
        return orderA - orderB;
    });
};

export const PrivilegesList = ({ 
    privileges, 
    maxDisplay = 3,
    showEmptyMessage = true,
    emptyMessage = "No privileges assigned"
}: PrivilegesListProps) => {
    const [showAll, setShowAll] = useState(false);
    
    // Validate privileges array
    const validPrivileges = useMemo(() => {
        if (!privileges || !Array.isArray(privileges)) return [];
        return privileges.filter(p => p && p.id);
    }, [privileges]);
    
    if (validPrivileges.length === 0) {
        if (!showEmptyMessage) return null;
        
        return (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 italic">
                <Award className="h-3 w-3" />
                <span>{emptyMessage}</span>
            </div>
        );
    }

    const displayedPrivileges = showAll ? validPrivileges : validPrivileges.slice(0, maxDisplay);
    const hasMore = validPrivileges.length > maxDisplay;
    
    // Sort privileges by status priority (active first, then expiring soon, etc.)
    const sortedPrivileges = sortPrivilegesByStatus(displayedPrivileges);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {sortedPrivileges.map((privilege) => (
                    <PrivilegeBadge 
                        key={privilege.id} 
                        privilege={privilege}
                    />
                ))}
            </div>
            
            {hasMore && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none transition-colors"
                >
                    {showAll ? 'Show less' : `+${validPrivileges.length - maxDisplay} more`}
                </button>
            )}
        </div>
    );
};