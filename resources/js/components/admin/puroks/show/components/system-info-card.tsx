// resources/js/Pages/Admin/Puroks/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Info,
} from 'lucide-react';
import { Purok } from '../types';
import { formatCoordinates } from '../utils/helpers';

interface Props {
    purok: Purok;
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const SystemInfoCard = ({ purok, formatDate }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Info className="h-5 w-5" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="dark:text-gray-300 cursor-help">{formatDate(purok.created_at)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {formatDate(purok.created_at, true)}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="dark:text-gray-300 cursor-help">{formatDate(purok.updated_at)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {formatDate(purok.updated_at, true)}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ID:</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">#{purok.id}</code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Coordinates:</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-xs font-mono dark:text-gray-300 cursor-help">
                                    {formatCoordinates(purok.latitude, purok.longitude)}
                                </span>
                            </TooltipTrigger>
                            {purok.latitude && purok.longitude && (
                                <TooltipContent>
                                    Lat: {purok.latitude.toFixed(6)}<br />
                                    Lng: {purok.longitude.toFixed(6)}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};