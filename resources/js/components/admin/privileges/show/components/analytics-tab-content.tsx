// resources/js/Pages/Admin/Privileges/components/analytics-tab-content.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsageStatisticsCard } from './usage-statistics-card';
import { BarChart3, UserPlus } from 'lucide-react';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
}

interface ResidentPrivilege {
    id: number;
    resident_id: number;
    verified_at: string | null;
    created_at: string;
    resident: Resident;
}

interface Privilege {
    residents_count?: number;
    active_residents_count?: number;
    pending_count?: number;
    expired_count?: number;
    default_discount_percentage: string | number;
}

interface Props {
    privilege: Privilege;
    recentAssignments: ResidentPrivilege[];
}

const getFullName = (resident: Resident) => {
    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    return name;
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

import { format, parseISO } from 'date-fns';

export const AnalyticsTabContent = ({ privilege, recentAssignments }: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <UsageStatisticsCard privilege={privilege} />
            
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Assignment Trends</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Monthly assignment statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-900 md:col-span-2">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Recent Activity</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Latest assignment activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentAssignments.slice(0, 5).map((assignment) => (
                            <div key={assignment.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium dark:text-gray-200">
                                        {getFullName(assignment.resident)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Assigned {formatDate(assignment.created_at)}
                                    </p>
                                </div>
                                <Badge variant="outline" className="dark:border-gray-600">
                                    {assignment.verified_at ? 'Verified' : 'Pending'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};