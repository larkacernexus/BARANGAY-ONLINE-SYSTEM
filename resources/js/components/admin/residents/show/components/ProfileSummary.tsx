// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import { User, Crown, Eye, Camera } from 'lucide-react';
import { Resident } from '../types';

// Updated Utility Imports - Matching your badge-utils.ts
import { 
    getStatusConfig, 
    getStatusVariant, 
    getGenderBadgeConfig, 
    getCivilStatusBadgeConfig,
    getPrivilegeIcon 
} from '@/components/admin/residents/show/utils/badge-utils';
import { getPhotoUrl } from '@/components/admin/residents/show/utils/helpers';

interface ProfileSummaryProps {
    resident: Resident;
    isHeadOfHousehold: boolean;
    activePrivilegesCount: number;
    onViewFullPhoto: () => void;
}

// Helper function to get initials from name
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const ProfileSummary = ({ 
    resident, 
    isHeadOfHousehold, 
    activePrivilegesCount,
    onViewFullPhoto 
}: ProfileSummaryProps) => {
    const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}${resident.suffix ? ' ' + resident.suffix : ''}`;
    
    // Configs from utilities
    const statusCfg = getStatusConfig(resident.status);
    const StatusIcon = getPrivilegeIcon(statusCfg.iconName);
    const genderCfg = getGenderBadgeConfig(resident.gender);
    const civilStatusCfg = getCivilStatusBadgeConfig(resident.civil_status);

    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
    const hasPhoto = !!photoUrl;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-sm dark:text-gray-100">Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                    <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-700 shadow-lg">
                        <AvatarImage 
                            src={photoUrl || undefined} 
                            alt={fullName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white text-3xl font-medium">
                            {getInitials(resident.first_name, resident.last_name)}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold dark:text-gray-100">{fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {resident.resident_id}</p>
                    {isHeadOfHousehold && (
                        <div className="mt-2">
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Head of Household
                            </Badge>
                        </div>
                    )}
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-2">
                    {/* Status Row */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <Badge variant={getStatusVariant(resident.status)} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {resident.status}
                        </Badge>
                    </div>

                    {/* Age Row */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Age:</span>
                        <span className="font-medium dark:text-gray-200">{resident.age} years</span>
                    </div>

                    {/* Gender Row */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                        <Badge 
                            variant={genderCfg.variant || 'default'} 
                            className={genderCfg.className}
                        >
                            {genderCfg.label}
                        </Badge>
                    </div>

                    {/* Civil Status Row */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Civil Status:</span>
                        <Badge 
                            variant={civilStatusCfg.variant || 'default'} 
                            className={civilStatusCfg.className}
                        >
                            {civilStatusCfg.label}
                        </Badge>
                    </div>

                    {/* Location Row */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Purok:</span>
                        <span className="font-medium dark:text-gray-200">{resident.purok_name || 'None'}</span>
                    </div>

                    {/* Voter Row */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Voter:</span>
                        <span className="font-medium dark:text-gray-200">{resident.is_voter ? 'Yes' : 'No'}</span>
                    </div>

                    {/* Benefits Row */}
                    {activePrivilegesCount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Active Benefits:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{activePrivilegesCount}</span>
                        </div>
                    )}
                </div>

                {hasPhoto && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                            onClick={onViewFullPhoto}
                        >
                            <Eye className="h-3 w-3 mr-2" />
                            View Full Photo
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};