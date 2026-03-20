// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegesByMember.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HouseholdMember } from '../../types';
import { PrivilegesList } from './PrivilegesList';
import { getRelationshipColor } from '../../utils/badge-utils';
import { formatRelationship } from '../../utils/helpers';

interface PrivilegesByMemberProps {
    members: HouseholdMember[];
}

export const PrivilegesByMember = ({ members }: PrivilegesByMemberProps) => {
    const membersWithPrivileges = members.filter(m => m.resident.privileges_list && m.resident.privileges_list.length > 0);

    if (membersWithPrivileges.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Privileges by Member</h3>
            {membersWithPrivileges.map((member) => (
                <div key={member.id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <Link href={route('admin.residents.show', member.resident_id)} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                                {member.resident.full_name}
                            </Link>
                            <Badge className={`ml-2 ${getRelationshipColor(member.relationship_to_head)}`}>
                                {formatRelationship(member.relationship_to_head)}
                            </Badge>
                        </div>
                    </div>
                    <PrivilegesList privileges={member.resident.privileges_list} />
                </div>
            ))}
        </div>
    );
};