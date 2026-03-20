// resources/js/Pages/Admin/Households/Show/components/members/MemberCard.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { User, ExternalLink, Vote, Crown } from 'lucide-react';
import { HouseholdMember } from '../../types';
import { getPhotoUrl, formatRelationship } from '../../utils/helpers';
import { getRelationshipColor } from '../../utils/badge-utils';
import { PrivilegeIndicators } from '../badges';

interface MemberCardProps {
    member: HouseholdMember;
}

export const MemberCard = ({ member }: MemberCardProps) => {
    const photoUrl = getPhotoUrl(member.resident.photo_path, member.resident.photo_url);
    const isHead = member.is_head;
    const fullName = member.resident.full_name;

    return (
        <Link 
            href={route('admin.residents.show', member.resident_id)}
            className="block hover:no-underline"
        >
            <div className="flex items-start justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3 flex-1">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                        isHead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                        {photoUrl ? (
                            <img 
                                src={photoUrl}
                                alt={fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className={`h-6 w-6 ${isHead ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium dark:text-gray-200">
                                {fullName}
                            </p>
                            <ExternalLink className="h-3 w-3 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                            <span>{member.resident.age} years old</span>
                            <span>•</span>
                            <span>{member.resident.gender}</span>
                            <span>•</span>
                            <span>{member.resident.civil_status}</span>
                        </div>
                        
                        <PrivilegeIndicators resident={member.resident} />
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {member.resident.is_voter && (
                                <span className="flex items-center gap-1">
                                    <Vote className="h-3 w-3" />
                                    Registered Voter
                                </span>
                            )}
                            {member.resident.has_user_account && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <User className="h-3 w-3" />
                                    Has Account
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                    <Badge className={getRelationshipColor(member.relationship_to_head)}>
                        {formatRelationship(member.relationship_to_head)}
                    </Badge>
                    {isHead && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <Crown className="h-3 w-3 mr-1" />
                            Head
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
    );
};