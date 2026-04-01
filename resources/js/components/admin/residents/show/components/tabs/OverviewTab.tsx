import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
    User, 
    Copy, 
    Calendar, 
    MapPin, 
    Phone, 
    Mail, 
    Briefcase, 
    GraduationCap, 
    Church, 
    Camera, 
    Vote, 
    CheckCircle, 
    XCircle,
    FileText,
    Home,
    Building2,
    Hash
} from "lucide-react";

import { Resident } from '@/types/admin/residents/residents-types';
import { 
    getGenderBadgeConfig, 
    getCivilStatusBadgeConfig 
} from '@/components/admin/residents/show/utils/badge-utils';
import { formatDate, getAddress, getFullName } from '@/components/admin/residents/show/utils/helpers';

interface OverviewTabProps {
    resident: Resident;
}

export const OverviewTab = ({ resident }: OverviewTabProps) => {
    const fullName = getFullName(resident);
    
    // Using the fixed utility functions
    const gender = getGenderBadgeConfig(resident.gender);
    const civilStatus = getCivilStatusBadgeConfig(resident.civil_status);
    
    // Build address from available fields
    const address = getAddress(resident);
    const purokName = resident.purok?.name || `Purok ${resident.purok_id}`;

    const handleCopyId = () => {
        navigator.clipboard.writeText(String(resident.resident_id));
        // Optional: You could add a toast here
    };

    return (
        <div className="space-y-6">
            {/* Personal Information Card */}
            <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <User className="h-5 w-5 text-blue-500" />
                        Personal Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Basic identity and demographic details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</p>
                            <p className="text-lg font-semibold dark:text-gray-200 uppercase">{fullName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resident ID</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-sm px-2 py-0.5 dark:text-gray-300">
                                    {resident.resident_id}
                                </Badge>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 dark:text-gray-400 dark:hover:text-white"
                                    onClick={handleCopyId}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date of Birth</p>
                            <div className="flex items-center gap-2 dark:text-gray-300">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <p className="font-medium">{formatDate(resident.birth_date)}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</p>
                            <p className="text-xl font-bold dark:text-gray-200">{resident.age} <span className="text-sm font-normal text-gray-500">years old</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</p>
                            <Badge variant={gender.variant} className={gender.className}>
                                {gender.label}
                            </Badge>
                        </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Civil Status</p>
                            <Badge variant={civilStatus.variant || "secondary"} className={civilStatus.className}>
                                {civilStatus.label}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Education Level</p>
                            <div className="flex items-center gap-2 dark:text-gray-300">
                                <GraduationCap className="h-4 w-4 text-purple-500" />
                                <p className="font-medium">{resident.education_level || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Demographics */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {resident.occupation && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Occupation</p>
                                <div className="flex items-center gap-2 dark:text-gray-300">
                                    <Briefcase className="h-4 w-4 text-emerald-500" />
                                    <p className="font-medium">{resident.occupation}</p>
                                </div>
                            </div>
                        )}
                        {resident.religion && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Religion</p>
                                <div className="flex items-center gap-2 dark:text-gray-300">
                                    <Church className="h-4 w-4 text-amber-500" />
                                    <p className="font-medium">{resident.religion}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contact & Location Card */}
            <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Phone className="h-5 w-5 text-green-500" />
                        Contact & Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Number</p>
                            <div className="flex items-center gap-2 dark:text-gray-300">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <p className="font-medium">{resident.contact_number || 'No contact provided'}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</p>
                            <div className="flex items-center gap-2 dark:text-gray-300">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <p className="font-medium">{resident.email || 'No email provided'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resident Address</p>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
                            <MapPin className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Home className="h-3.5 w-3.5 text-gray-400" />
                                    <p className="text-sm font-medium dark:text-gray-200">
                                        {address || 'No address specified'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {purokName}
                                    </p>
                                </div>
                                {resident.house_number && (
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            House #{resident.house_number}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Household Information */}
            {resident.household && (
                <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Home className="h-5 w-5 text-indigo-500" />
                            Household Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Household Number</p>
                                <p className="font-mono text-sm dark:text-gray-300">{resident.household.household_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Relationship to Head</p>
                                <p className="font-medium dark:text-gray-300">{resident.relationship_to_head || 'Member'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role in Household</p>
                                <Badge variant={resident.is_head ? "default" : "secondary"} className="gap-1">
                                    {resident.is_head ? 'Head of Household' : 'Household Member'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Voting & Verification */}
            <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">
                        Status & Verification
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <Vote className="h-5 w-5 text-purple-500" />
                                <span className="text-sm font-semibold dark:text-gray-300">Voter Status</span>
                            </div>
                            {resident.is_voter ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
                                    <CheckCircle className="h-3 w-3" /> Registered
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="gap-1">
                                    <XCircle className="h-3 w-3" /> Not Registered
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <Camera className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-semibold dark:text-gray-300">Identity Photo</span>
                            </div>
                            {(resident.profile_photo || resident.photo_path || resident.photo_url) ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">Available</Badge>
                            ) : (
                                <Badge variant="outline" className="text-red-500 border-red-200 dark:border-red-800">Missing</Badge>
                            )}
                        </div>
                    </div>
                    
                    {/* Registration Date */}
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Registered on</span>
                            <span className="font-medium dark:text-gray-300">{formatDate(resident.created_at)}</span>
                        </div>
                        {resident.updated_at !== resident.created_at && (
                            <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-gray-500 dark:text-gray-400">Last updated</span>
                                <span className="font-medium dark:text-gray-300">{formatDate(resident.updated_at)}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};