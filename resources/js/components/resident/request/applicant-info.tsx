import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface Resident {
    id: number;
    full_name: string;
    address: string;
    contact_number: string;
    purok_name?: string;
}

interface ApplicantInfoProps {
    resident: Resident;
}

export function ApplicantInfo({ resident }: ApplicantInfoProps) {
    return (
        <Card className="lg:rounded-xl">
            <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <User className="h-4 w-4 lg:h-5 lg:w-5" />
                    Applicant Information
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs lg:text-sm text-gray-500">Full Name</Label>
                        <div className="font-medium text-sm lg:text-base truncate">{resident.full_name}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs lg:text-sm text-gray-500">Contact Number</Label>
                        <div className="font-medium text-sm lg:text-base">{resident.contact_number}</div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs lg:text-sm text-gray-500">Address</Label>
                        <div className="font-medium text-sm lg:text-base">{resident.address}</div>
                    </div>
                    {resident.purok_name && (
                        <div className="sm:col-span-2 sm:col-start-1 space-y-1">
                            <Label className="text-xs lg:text-sm text-gray-500">Purok</Label>
                            <div className="font-medium text-sm lg:text-base">{resident.purok_name}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}