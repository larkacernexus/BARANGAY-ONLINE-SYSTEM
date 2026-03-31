// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegesByMember.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Award, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Import types from shared types file
import { HouseholdMember, Resident, Privilege } from '@/types/admin/households/household.types';
import { getPhotoUrl, formatDate, getFullName } from '@/types/admin/households/household.types';

interface MemberWithPrivileges extends HouseholdMember {
    full_name?: string;
    age?: number;
    privileges: Privilege[];
    resident?: Resident;
}

interface PrivilegesByMemberProps {
    members: MemberWithPrivileges[];
}

export const PrivilegesByMember = ({ members }: PrivilegesByMemberProps) => {
    if (members.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Privileges by Member</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No members have privileges assigned.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getPrivilegeIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-3 w-3 text-green-500" />;
            case 'expiring_soon':
                return <Clock className="h-3 w-3 text-yellow-500" />;
            case 'expired':
                return <AlertCircle className="h-3 w-3 text-red-500" />;
            default:
                return <Award className="h-3 w-3 text-gray-500" />;
        }
    };

    const getPrivilegeBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'expiring_soon':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'expired':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Privileges by Member</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => {
                        const photoUrl = getPhotoUrl(member.photo_path, member.photo_url);
                        const fullName = member.full_name || getFullName(member.first_name, member.last_name, member.middle_name);
                        
                        return (
                            <div key={member.id} className="border rounded-lg p-4 dark:border-gray-700">
                                <div className="flex items-start gap-3 mb-3">
                                    <Avatar className="h-10 w-10">
                                        {photoUrl ? (
                                            <AvatarImage src={photoUrl} alt={fullName} />
                                        ) : (
                                            <AvatarFallback>
                                                <User className="h-5 w-5" />
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <Link 
                                            href={route('admin.residents.show', member.resident_id || member.id)}
                                            className="font-medium hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                        >
                                            {fullName}
                                        </Link>
                                        {member.age && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.age} years old</p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="dark:border-gray-600">
                                        {member.privileges.length} privilege{member.privileges.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {member.privileges.map((privilege) => (
                                        <Badge 
                                            key={privilege.id} 
                                            className={`${getPrivilegeBadgeClass(privilege.status)} text-xs flex items-center gap-1 px-2 py-1`}
                                        >
                                            {getPrivilegeIcon(privilege.status)}
                                            {privilege.name}
                                            {privilege.expiry_date && (
                                                <span className="ml-1 text-[10px] opacity-75">
                                                    (Expires: {formatDate(privilege.expiry_date)})
                                                </span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};