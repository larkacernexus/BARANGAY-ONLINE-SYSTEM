// resources/js/Pages/Admin/Puroks/components/recent-activities-card.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Activity,
} from 'lucide-react';
import { Household, Resident } from '../types';

interface Props {
    recentHouseholds: Household[];
    recentResidents: Resident[];
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const RecentActivitiesCard = ({ recentHouseholds, recentResidents, formatDate }: Props) => {
    const [showAll, setShowAll] = useState(false);
    
    const displayedHouseholds = showAll ? recentHouseholds : recentHouseholds.slice(0, 3);
    const displayedResidents = showAll ? recentResidents : recentResidents.slice(0, 3);
    
    const hasMore = recentHouseholds.length > 3 || recentResidents.length > 3;

    const getFullName = (resident: Resident) => {
        let name = `${resident.first_name}`;
        if (resident.middle_name) {
            name += ` ${resident.middle_name.charAt(0)}.`;
        }
        name += ` ${resident.last_name}`;
        return name;
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Activity className="h-5 w-5" />
                    Recent Activities
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Recent Households</h4>
                        {recentHouseholds.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No recent households</p>
                        ) : (
                            <div className="space-y-3">
                                {displayedHouseholds.map((household) => (
                                    <div key={household.id} className="flex items-center justify-between text-sm">
                                        <div className="truncate flex-1">
                                            <Link href={`/households/${household.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium dark:text-gray-200">
                                                {household.household_number}
                                            </Link>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{household.head_of_family}</div>
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                                    {formatDate(household.created_at)}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {formatDate(household.created_at, true)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Recent Residents</h4>
                        {recentResidents.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No recent residents</p>
                        ) : (
                            <div className="space-y-3">
                                {displayedResidents.map((resident) => (
                                    <div key={resident.id} className="flex items-center justify-between text-sm">
                                        <div className="truncate flex-1">
                                            <Link href={`/residents/${resident.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium dark:text-gray-200">
                                                {getFullName(resident)}
                                            </Link>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{resident.age}y • {resident.gender}</div>
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                                    {formatDate(resident.created_at)}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {formatDate(resident.created_at, true)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {hasMore && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            {showAll ? 'Show less' : 'Show more'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};