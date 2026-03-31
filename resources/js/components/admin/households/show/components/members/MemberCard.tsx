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
    AlertCircle,
    Crown
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import types from shared types file
import { HouseholdMember, Resident, Privilege } from '@/types/admin/households/household.types';
import { 
    getFullName, 
    getPhotoUrl, 
    calculateAge, 
    getGenderLabel, 
    getCivilStatusLabel,
    formatDate,
    getRelativeTime,
    getRelationshipLabel,
    ExtendedMember
} from '@/types/admin/households/household.types';

// Import modal component
import { ResidentDetailsModal } from './ResidentDetailsModal';

interface MemberCardProps {
    member: ExtendedMember;
    isHead?: boolean;
    onViewResident?: (residentId: number) => void;
}

export const MemberCard = ({ member, isHead = false, onViewResident }: MemberCardProps) => {
    const [showResidentDetails, setShowResidentDetails] = useState(false);
    const resident = member.resident;

    // If no resident data, show a placeholder
    if (!resident) {
        return (
            <Card className="hover:shadow-md transition-shadow dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                <User className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold dark:text-gray-100">
                                    {member.name || 'Unknown Member'}
                                </h3>
                                {isHead && (
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Head of Household
                                    </Badge>
                                )}
                                <Badge variant="outline" className="dark:border-gray-700">
                                    {member.relationship_to_head || getRelationshipLabel(member.relationship)}
                                </Badge>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Resident data not available
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Get full name using shared utility
    const fullName = resident.full_name || getFullName(resident.first_name, resident.last_name, resident.middle_name);
    
    // Get photo URL using shared utility
    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
    
    // Calculate age if not provided
    const age = resident.age || (resident.date_of_birth ? calculateAge(resident.date_of_birth) : undefined);
    
    // Get avatar initials
    const getInitials = () => {
        const first = resident.first_name?.[0] || '';
        const last = resident.last_name?.[0] || '';
        return (first + last).toUpperCase();
    };

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
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Avatar */}
                            <Avatar className="h-12 w-12 flex-shrink-0">
                                {photoUrl ? (
                                    <AvatarImage src={photoUrl} alt={fullName} />
                                ) : (
                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {getInitials()}
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            {/* Resident Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold dark:text-gray-100 truncate">
                                        {fullName}
                                    </h3>
                                    {isHead && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 flex-shrink-0">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Head of Household
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="dark:border-gray-700 flex-shrink-0">
                                        {member.relationship_to_head || getRelationshipLabel(member.relationship)}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                                    {age && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{age} years old</span>
                                        </div>
                                    )}
                                    {resident.gender && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span>{getGenderLabel(resident.gender)}</span>
                                        </>
                                    )}
                                    {resident.civil_status && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span>{getCivilStatusLabel(resident.civil_status)}</span>
                                        </>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                    {resident.contact_number && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                            <span>{resident.contact_number}</span>
                                        </div>
                                    )}
                                    {resident.email && (
                                        <div className="flex items-center gap-1 min-w-0">
                                            <Mail className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{resident.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                {resident.address && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{resident.address}</span>
                                    </div>
                                )}

                                {/* Occupation */}
                                {resident.occupation && (
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Occupation: {resident.occupation}
                                    </div>
                                )}

                                {/* Privileges */}
                                {resident.privileges_list && resident.privileges_list.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Award className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        {resident.privileges_list.slice(0, 3).map((privilege) => (
                                            <Badge 
                                                key={privilege.id} 
                                                className={`${getPrivilegeBadgeClass(privilege.status)} text-xs flex items-center gap-1`}
                                            >
                                                {getPrivilegeIcon(privilege.status)}
                                                {privilege.name}
                                                {privilege.id_number && (
                                                    <span className="ml-1 text-[10px] opacity-75">
                                                        #{privilege.id_number}
                                                    </span>
                                                )}
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResidentDetails(true)}
                                className="h-8 px-2"
                                title="View Details"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                            </Button>
                            <Link href={route('admin.residents.show', resident.id)}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    title="Open Profile"
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
                            Added {formatDate(member.created_at)} • {getRelativeTime(member.created_at)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resident Details Modal - only show if resident exists */}
            {resident && (
                <ResidentDetailsModal
                    open={showResidentDetails}
                    onOpenChange={setShowResidentDetails}
                    member={member}
                />
            )}
        </>
    );
};