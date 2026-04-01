// resources/js/Pages/Admin/Residents/Show/components/SystemInfo.tsx

import { useState } from 'react';
import { Resident } from '@/types/admin/residents/residents-types';
import { formatDateTime, formatTimeAgo, formatDate, calculateAge } from '@/components/admin/residents/show/utils/helpers';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Icons
import { Info, Calendar, Clock, Database, Home, MapPin, User } from 'lucide-react';

// Define the household membership type based on your actual data structure
interface HouseholdMembershipData {
    id: number;
    is_head: boolean;
    relationship?: string | null;
    joined_at?: string | null;
    household_id?: number;
    resident_id?: number;
    is_active?: boolean;
}

interface SystemInfoProps {
    resident: Resident;
    householdMembership?: HouseholdMembershipData | null;
}

export const SystemInfo = ({ resident, householdMembership }: SystemInfoProps) => {
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm dark:text-gray-100 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Basic Information */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Database ID</span>
                    </div>
                    <code className="text-xs font-mono dark:text-gray-300">#{resident.id}</code>
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Resident ID</span>
                    </div>
                    <code className="text-xs font-mono dark:text-gray-300">{resident.resident_id}</code>
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Purok ID</span>
                    </div>
                    <span className="text-sm dark:text-gray-300">{resident.purok_id || 'Not assigned'}</span>
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Household ID</span>
                    </div>
                    <span className="text-sm dark:text-gray-300">{resident.household_id || 'None'}</span>
                </div>
                
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                >
                    {showMoreDetails ? 'Show Less' : 'Show More Details'}
                </Button>
                
                {showMoreDetails && (
                    <div className="pt-3 space-y-3 border-t dark:border-gray-700">
                        {/* Created Date */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                            </div>
                            <p className="text-sm dark:text-gray-300">{formatDateTime(resident.created_at)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(resident.created_at)}</p>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        {/* Last Updated */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                            </div>
                            <p className="text-sm dark:text-gray-300">{formatDateTime(resident.updated_at)}</p>
                            {resident.updated_at !== resident.created_at && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatTimeAgo(resident.updated_at)}
                                </p>
                            )}
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        {/* Birth Date */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                            </div>
                            <p className="text-sm dark:text-gray-300">{formatDate(resident.birth_date)}</p>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        {/* Calculated Age */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Calculated Age</p>
                            </div>
                            <p className="text-sm dark:text-gray-300 font-medium">{calculateAge(resident.birth_date)} years</p>
                        </div>
                        
                        {/* Household Membership Info */}
                        {householdMembership && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Home className="h-3 w-3 text-gray-400" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Household Membership ID</p>
                                    </div>
                                    <p className="text-sm font-mono dark:text-gray-300">#{householdMembership.id}</p>
                                </div>
                                
                                {householdMembership.relationship && (
                                    <>
                                        <Separator className="dark:bg-gray-700" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role in Household</p>
                                            <p className="text-sm dark:text-gray-300 capitalize">{householdMembership.relationship}</p>
                                        </div>
                                    </>
                                )}
                                
                                {householdMembership.joined_at && (
                                    <>
                                        <Separator className="dark:bg-gray-700" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Joined Household</p>
                                            <p className="text-sm dark:text-gray-300">{formatDate(householdMembership.joined_at)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatTimeAgo(householdMembership.joined_at)}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        
                        {/* Additional Info for Head of Household */}
                        {resident.is_head && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-md">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                                        This resident is marked as Head of Household
                                    </p>
                                </div>
                            </>
                        )}
                        
                        {/* Archived Status */}
                        {resident.is_archived && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-md">
                                    <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                                        This resident record is archived
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};