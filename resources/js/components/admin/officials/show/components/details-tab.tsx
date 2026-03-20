// resources/js/Pages/Admin/Officials/components/details-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    User,
    Shield,
    Calendar,
} from 'lucide-react';

interface Props {
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
    getStatusColor: (status: string, isCurrent: boolean) => string;
    getStatusIcon: (status: string, isCurrent: boolean) => React.ReactNode;
}

export const DetailsTab = ({
    official,
    formatDate,
    getStatusColor,
    getStatusIcon
}: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Resident Information */}
            {official.resident && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <User className="h-5 w-5" />
                            Resident Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                <p className="font-medium dark:text-gray-200">{official.resident.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                                <p className="font-medium dark:text-gray-200">{official.resident.age} years</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                                <p className="font-medium dark:text-gray-200">{official.resident.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Civil Status</p>
                                <p className="font-medium dark:text-gray-200">{official.resident.civil_status}</p>
                            </div>
                        </div>
                        
                        {official.resident.birth_date && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
                                    <p className="font-medium dark:text-gray-200">{formatDate(official.resident.birth_date)}</p>
                                </div>
                            </>
                        )}
                        
                        {official.resident.purok && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Purok</p>
                                    <p className="font-medium dark:text-gray-200">{official.resident.purok.name}</p>
                                </div>
                            </>
                        )}
                        
                        {official.resident.household && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Household</p>
                                    <p className="font-medium dark:text-gray-200">{official.resident.household.household_number}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Link href={`/residents/${official.resident.id}`} className="w-full">
                            <Button variant="outline" className="w-full">
                                View Full Resident Profile
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            )}

            {/* Official Details */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Shield className="h-5 w-5" />
                        Official Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                            <p className="font-medium dark:text-gray-200">{official.full_position}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Position Code</p>
                            <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                                {official.position}
                            </code>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Committee</p>
                            <p className="font-medium dark:text-gray-200">{official.committee_name || 'None'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display Order</p>
                            <p className="font-medium dark:text-gray-200">{official.order}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                            <Badge variant="outline" className={official.is_regular ? 'bg-green-100 text-green-800 border-green-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                                {official.is_regular ? 'Regular' : 'Ex-Officio'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <Badge className={getStatusColor(official.status, official.is_current)}>
                                {getStatusIcon(official.status, official.is_current)}
                                <span className="ml-1">
                                    {official.is_current ? 'Current' : official.status}
                                </span>
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Term Details */}
            <Card className="dark:bg-gray-900 md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Calendar className="h-5 w-5" />
                        Term Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Term Start</p>
                            <p className="text-lg font-semibold dark:text-gray-200">{formatDate(official.term_start)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(official.term_start, true)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Term End</p>
                            <p className="text-lg font-semibold dark:text-gray-200">{formatDate(official.term_end)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(official.term_end, true)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Term Duration</p>
                            <p className="text-lg font-semibold dark:text-gray-200">{official.term_duration}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};