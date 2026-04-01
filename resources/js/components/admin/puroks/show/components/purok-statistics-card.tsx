// resources/js/Pages/Admin/Puroks/components/purok-statistics-card.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Info,
    Users,
    Home,
    Activity,
    MapPin,
    TrendingUp,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Purok } from '@/types/admin/puroks/purok';

interface Props {
    purok: Purok;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
}

export const PurokStatisticsCard = ({ purok, getStatusColor, getStatusIcon }: Props) => {
    const averageHouseholdSize = purok.total_households > 0 
        ? (purok.total_residents / purok.total_households).toFixed(1)
        : '0.0';
    
    const hasMap = purok.google_maps_url && purok.google_maps_url.trim() !== '';
    const hasLeader = purok.leader_name && purok.leader_name.trim() !== '';
    const hasContact = purok.leader_contact && purok.leader_contact.trim() !== '';

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Activity className="h-5 w-5" />
                    Purok Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Average Household Size */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Avg. Household Size
                            </span>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="font-bold text-lg dark:text-gray-200 cursor-help">
                                    {averageHouseholdSize}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Average number of residents per household</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Total Households */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Total Households
                            </span>
                        </div>
                        <span className="font-bold text-lg dark:text-gray-200">
                            {purok.total_households.toLocaleString()}
                        </span>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Total Residents */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Total Residents
                            </span>
                        </div>
                        <span className="font-bold text-lg dark:text-gray-200">
                            {purok.total_residents.toLocaleString()}
                        </span>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Population Density */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Population Density
                            </span>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="font-bold text-lg dark:text-gray-200 cursor-help">
                                    {purok.total_residents.toLocaleString()} residents
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Total residents in this purok</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Status
                            </span>
                        </div>
                        <Badge className={getStatusColor(purok.status)}>
                            {getStatusIcon(purok.status)}
                            <span className="ml-1 capitalize">{purok.status}</span>
                        </Badge>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Map Link */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Map Location
                            </span>
                        </div>
                        <Badge 
                            variant={hasMap ? "outline" : "secondary"} 
                            className={hasMap 
                                ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400' 
                                : 'dark:bg-gray-700 dark:text-gray-300'
                            }
                        >
                            {hasMap ? 'Available' : 'Not Set'}
                        </Badge>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Leader Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Purok Leader
                            </span>
                        </div>
                        <Badge 
                            variant={hasLeader ? "outline" : "secondary"} 
                            className={hasLeader 
                                ? 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400' 
                                : 'dark:bg-gray-700 dark:text-gray-300'
                            }
                        >
                            {hasLeader ? (hasContact ? 'Assigned' : 'No Contact') : 'Not Assigned'}
                        </Badge>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Created Date */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Created
                            </span>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-sm font-medium dark:text-gray-300 cursor-help">
                                    {formatDate(purok.created_at)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Date this purok was created</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    {/* Warning for missing data */}
                    {!hasLeader && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        No Leader Assigned
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                        Consider assigning a leader to manage this purok
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {purok.total_households === 0 && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        No Households Registered
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                                        Start adding households to this purok
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};