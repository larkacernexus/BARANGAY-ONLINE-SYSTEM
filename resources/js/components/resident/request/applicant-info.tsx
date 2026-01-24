import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Home } from 'lucide-react';

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
        <Card className="lg:rounded-xl shadow-sm">
            <CardHeader className="p-3 lg:p-4">
                <CardTitle className="flex items-center gap-2 text-sm lg:text-base font-semibold">
                    <User className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                    Applicant Information
                </CardTitle>
                <p className="text-xs text-gray-500">Your registered details</p>
            </CardHeader>
            <CardContent className="p-3 lg:p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                    {/* Name - Full width on mobile, half on desktop */}
                    <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Full Name</p>
                                <p className="font-medium text-sm truncate">
                                    {resident.full_name}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Contact Number */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Contact</p>
                                <p className="font-medium text-sm truncate">
                                    {resident.contact_number}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Address - Full width on mobile, half on desktop */}
                    <div className="sm:col-span-2 lg:col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                                <p className="font-medium text-sm line-clamp-2">
                                    {resident.address}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Purok - Optional */}
                    {resident.purok_name && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                                <Home className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500">Purok</p>
                                    <Badge 
                                        variant="secondary" 
                                        className="text-xs font-normal px-2 py-0.5 h-auto"
                                    >
                                        {resident.purok_name}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}