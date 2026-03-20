import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Resident } from '@/components/admin/residents/show/types';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DetailItem label="First Name" value={resident.first_name} />
                    <DetailItem label="Middle Name" value={resident.middle_name} />
                    <DetailItem label="Last Name" value={resident.last_name} />
                    <DetailItem label="Suffix" value={resident.suffix} />
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem label="Birth Date" value={formatDate(resident.birth_date)} />
                    <DetailItem label="Age" value={`${resident.age} years old`} />
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Gender</p>
                        <Badge variant={gender.variant} className={`${gender.className} font-medium`}>
                            {gender.label}
                        </Badge>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Civil Status</p>
                        <Badge variant={civilStatus.variant || "secondary"} className={`${civilStatus.className}`}>
                            {civilStatus.label}
                        </Badge>
                    </div>
                    <DetailItem label="Place of Birth" value={resident.place_of_birth} />
                    <DetailItem label="Occupation" value={resident.occupation} />
                    <DetailItem label="Education" value={resident.education} />
                    <DetailItem label="Religion" value={resident.religion} />
                    <DetailItem label="Voter Status" value={resident.is_voter ? 'Registered Voter' : 'Non-Voter'} />
                </div>
            </CardContent>
        </Card>
    );
};

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="space-y-1">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-sm font-medium dark:text-gray-200">{value || '---'}</p>
    </div>
);