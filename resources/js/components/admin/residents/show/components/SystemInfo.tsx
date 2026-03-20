import { useState } from 'react';
import { Resident, HouseholdMembership } from '../types';
import { formatDateTime, formatTimeAgo, formatDate, calculateAge } from '@/components/admin/residents/show/utils/helpers';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Icons
import { Info } from 'lucide-react';
interface SystemInfoProps {
    resident: Resident;
    householdMembership?: HouseholdMembership | null;
}

export const SystemInfo = ({ resident, householdMembership }: SystemInfoProps) => {
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-sm dark:text-gray-100 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Database ID</span>
                    <code className="text-xs dark:text-gray-300">#{resident.id}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Resident ID</span>
                    <code className="text-xs dark:text-gray-300">{resident.resident_id}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Purok ID</span>
                    <span className="text-sm dark:text-gray-300">{resident.purok_id}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Household ID</span>
                    <span className="text-sm dark:text-gray-300">{resident.household_id || 'None'}</span>
                </div>
                
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 dark:text-gray-400 dark:hover:text-white"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                >
                    {showMoreDetails ? 'Show Less' : 'Show More Details'}
                </Button>
                
                {showMoreDetails && (
                    <div className="pt-3 space-y-3 border-t dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                            <p className="text-sm dark:text-gray-300">{formatDateTime(resident.created_at)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(resident.created_at)}</p>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                            <p className="text-sm dark:text-gray-300">{formatDateTime(resident.updated_at)}</p>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                            <p className="text-sm dark:text-gray-300">{formatDate(resident.birth_date)}</p>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Calculated Age</p>
                            <p className="text-sm dark:text-gray-300">{calculateAge(resident.birth_date)} years</p>
                        </div>
                        {householdMembership && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Household Member ID</p>
                                    <p className="text-sm dark:text-gray-300">{householdMembership.id}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};