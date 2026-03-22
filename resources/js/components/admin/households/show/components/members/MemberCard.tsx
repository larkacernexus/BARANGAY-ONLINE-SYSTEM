// resources/js/Pages/Admin/Households/Show/components/members/MemberCard.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    User, 
    Calendar, 
    Phone, 
    Mail, 
    MapPin, 
    Award,
    Eye,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResidentDetailsModal } from './ResidentDetailsModal';

interface ResidentPrivilege {
    id: number;
    name: string;
    code: string;
    status: 'active' | 'expiring_soon' | 'expired' | 'pending';
    id_number?: string;
    expires_at?: string;
    discount_percentage?: number;
}

interface Member {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    created_at?: string;
    updated_at?: string;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        age?: number;
        gender?: string;
        civil_status?: string;
        contact_number?: string;
        email?: string;
        address?: string;
        occupation?: string;
        education?: string;
        religion?: string;
        is_voter?: boolean;
        place_of_birth?: string;
        remarks?: string;
        photo_url?: string;
        privileges_list?: ResidentPrivilege[];
    };
}

interface MemberCardProps {
    member: Member;
    onViewResident?: (residentId: number) => void;
}

export const MemberCard = ({ member, onViewResident }: MemberCardProps) => {
    const [showResidentDetails, setShowResidentDetails] = useState(false);
    const resident = member.resident;

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
        <>
            <Card className="hover:shadow-md transition-shadow dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            {/* Avatar */}
                            <Avatar className="h-12 w-12">
                                {resident.photo_url ? (
                                    <AvatarImage src={resident.photo_url} alt={resident.full_name} />
                                ) : (
                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {resident.first_name?.[0]}{resident.last_name?.[0]}
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            {/* Resident Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold dark:text-gray-100">
                                        {resident.full_name}
                                    </h3>
                                    {member.is_head && (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            Head of Household
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="dark:border-gray-700">
                                        {member.relationship_to_head}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                                    {resident.age && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{resident.age} years old</span>
                                        </div>
                                    )}
                                    {resident.gender && (
                                        <span>{resident.gender}</span>
                                    )}
                                    {resident.civil_status && (
                                        <span>• {resident.civil_status}</span>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                    {resident.contact_number && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{resident.contact_number}</span>
                                        </div>
                                    )}
                                    {resident.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate max-w-[200px]">{resident.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                {resident.address && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{resident.address}</span>
                                    </div>
                                )}

                                {/* Privileges */}
                                {resident.privileges_list && resident.privileges_list.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Award className="h-3 w-3 text-gray-400" />
                                        {resident.privileges_list.slice(0, 3).map((privilege) => (
                                            <Badge 
                                                key={privilege.id} 
                                                className={`${getPrivilegeBadgeClass(privilege.status)} text-xs flex items-center gap-1`}
                                            >
                                                {getPrivilegeIcon(privilege.status)}
                                                {privilege.name}
                                            </Badge>
                                        ))}
                                        {resident.privileges_list.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{resident.privileges_list.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResidentDetails(true)}
                                className="h-8 px-2"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                            </Button>
                            <Link href={route('admin.residents.show', resident.id)}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span className="sr-only">Open Profile</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Show when member was added */}
                    {member.created_at && (
                        <div className="mt-3 pt-2 border-t dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
                            Added {new Date(member.created_at).toLocaleDateString()}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resident Details Modal */}
            <ResidentDetailsModal
                open={showResidentDetails}
                onOpenChange={setShowResidentDetails}
                member={member}
            />
        </>
    );
};