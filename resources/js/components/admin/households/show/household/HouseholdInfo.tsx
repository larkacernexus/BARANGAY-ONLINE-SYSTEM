
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Home, Phone, Mail, MapPin, User, Crown, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Household } from '../types';
import { getHeadResident, getHeadResidentId, getFullName, getPhotoUrl, formatDate } from '../utils/helpers';
import { PrivilegeIndicators } from '../components/badges';
import { Badge } from '@/components/ui/badge'; 
interface HouseholdInfoProps {
    household: Household;
}

export const HouseholdInfo = ({ household }: HouseholdInfoProps) => {
    const headResident = getHeadResident(household);
    const headResidentId = getHeadResidentId(household);
    const hasHead = !!headResident;

    const getResidentPhotoUrl = (resident: any) => {
        return resident.photo_url || getPhotoUrl(resident.photo_path);
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Home className="h-5 w-5" />
                    Household Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Complete details about this household
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Household Number</p>
                        <p className="text-lg font-semibold dark:text-gray-200">{household.household_number}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</p>
                        <p className="dark:text-gray-300">{formatDate(household.created_at)}</p>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {hasHead && headResidentId && headResident && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Head of Family</p>
                        <Link 
                            href={route('admin.residents.show', headResidentId)}
                            className="block hover:no-underline"
                        >
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer group">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 overflow-hidden flex-shrink-0">
                                    {getResidentPhotoUrl(headResident) ? (
                                        <img 
                                            src={getResidentPhotoUrl(headResident)!}
                                            alt={headResident.full_name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold dark:text-gray-200">
                                            {headResident.full_name}
                                        </p>
                                        <ExternalLink className="h-3 w-3 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                                        <span>{headResident.age} years old</span>
                                        <span>•</span>
                                        <span>{headResident.gender}</span>
                                        <span>•</span>
                                        <span>{headResident.civil_status}</span>
                                        {headResident.occupation && (
                                            <>
                                                <span>•</span>
                                                <span>{headResident.occupation}</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <PrivilegeIndicators resident={headResident} />
                                </div>
                                <Badge className="ml-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Head
                                </Badge>
                            </div>
                        </Link>
                    </div>
                )}

                <Separator className="dark:bg-gray-700" />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</p>
                        <div className="flex items-center gap-2 dark:text-gray-300">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <p>{household.contact_number || 'Not provided'}</p>
                        </div>
                    </div>
                    {household.email && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                            <div className="flex items-center gap-2 dark:text-gray-300">
                                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <p>{household.email}</p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <div className="flex items-start gap-2 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-1" />
                        <div>
                            <p className="font-medium dark:text-gray-200">{household.address}</p>
                            <p className="text-gray-600 dark:text-gray-400">Purok {household.purok}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};