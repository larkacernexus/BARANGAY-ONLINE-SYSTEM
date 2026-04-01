import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Briefcase, 
    GraduationCap, 
    Church, 
    Vote,
    Calendar,
    User,
    Hash
} from "lucide-react";
import { Resident } from '@/types/admin/residents/residents-types';

// Matching utility names exactly to fix ts(2305)
import { 
    getGenderBadgeConfig, 
    getCivilStatusBadgeConfig 
} from '@/components/admin/residents/show/utils/badge-utils';
import { formatDate } from '@/components/admin/residents/show/utils/helpers';

interface DetailsTabProps {
    resident: Resident;
}

export const DetailsTab = ({ resident }: DetailsTabProps) => {
    const gender = getGenderBadgeConfig(resident.gender);
    const civilStatus = getCivilStatusBadgeConfig(resident.civil_status);

    return (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Complete Personal Details
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Official records for this resident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Name Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DetailItem 
                        label="First Name" 
                        value={resident.first_name} 
                        icon={<User className="h-3 w-3" />}
                    />
                    <DetailItem 
                        label="Middle Name" 
                        value={resident.middle_name} 
                        icon={<User className="h-3 w-3" />}
                    />
                    <DetailItem 
                        label="Last Name" 
                        value={resident.last_name} 
                        icon={<User className="h-3 w-3" />}
                    />
                    <DetailItem 
                        label="Suffix" 
                        value={resident.suffix} 
                        icon={<Hash className="h-3 w-3" />}
                    />
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Age & Gender Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem 
                        label="Birth Date" 
                        value={formatDate(resident.birth_date)} 
                        icon={<Calendar className="h-3 w-3" />}
                    />
                    <DetailItem 
                        label="Age" 
                        value={`${resident.age} years old`} 
                        icon={<Calendar className="h-3 w-3" />}
                    />
                    <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                            Gender
                        </p>
                        <Badge variant={gender.variant} className={`${gender.className} font-medium`}>
                            {gender.label}
                        </Badge>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Civil Status & Demographic Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                            Civil Status
                        </p>
                        <Badge variant={civilStatus.variant || "secondary"} className={`${civilStatus.className}`}>
                            {civilStatus.label}
                        </Badge>
                    </div>
                    
                    {resident.occupation && (
                        <DetailItem 
                            label="Occupation" 
                            value={resident.occupation} 
                            icon={<Briefcase className="h-3 w-3" />}
                        />
                    )}
                    
                    {resident.education_level && (
                        <DetailItem 
                            label="Education Level" 
                            value={resident.education_level} 
                            icon={<GraduationCap className="h-3 w-3" />}
                        />
                    )}
                    
                    {resident.religion && (
                        <DetailItem 
                            label="Religion" 
                            value={resident.religion} 
                            icon={<Church className="h-3 w-3" />}
                        />
                    )}
                    
                    <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                            <Vote className="h-3 w-3" />
                            Voter Status
                        </p>
                        <Badge variant={resident.is_voter ? "default" : "secondary"} className={resident.is_voter ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                            {resident.is_voter ? 'Registered Voter' : 'Non-Voter'}
                        </Badge>
                    </div>
                </div>

                {/* Additional Information Section */}
                {(resident.household_id || resident.relationship_to_head) && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {resident.household_id && (
                                <DetailItem 
                                    label="Household ID" 
                                    value={`Household #${resident.household_id}`} 
                                    icon={<Hash className="h-3 w-3" />}
                                />
                            )}
                            {resident.relationship_to_head && (
                                <DetailItem 
                                    label="Relationship to Head" 
                                    value={resident.relationship_to_head} 
                                />
                            )}
                        </div>
                    </>
                )}

                {/* Registration Information */}
                <Separator className="dark:bg-gray-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem 
                        label="Date Registered" 
                        value={formatDate(resident.created_at)} 
                        icon={<Calendar className="h-3 w-3" />}
                    />
                    <DetailItem 
                        label="Last Updated" 
                        value={formatDate(resident.updated_at)} 
                        icon={<Calendar className="h-3 w-3" />}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

interface DetailItemProps {
    label: string;
    value?: string | null;
    icon?: React.ReactNode;
}

const DetailItem = ({ label, value, icon }: DetailItemProps) => (
    <div className="space-y-2">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
            {icon && <span className="inline-block">{icon}</span>}
            {label}
        </p>
        <p className="text-sm font-medium dark:text-gray-200 break-words">
            {value || '—'}
        </p>
    </div>
);