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
    MapPin,
    AlertCircle,
} from 'lucide-react';
import { Purok } from '@/types/admin/puroks/purok';
import { 
    formatCoordinates, 
    isValidCoordinates, 
    parseCoordinate,
    formatDate 
} from '@/components/admin/puroks/show/utils/helpers';// Import from coordinates utility

interface Props {
    purok: Purok;
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const SystemInfoCard = ({ purok, formatDate }: Props) => {
    const hasValidCoordinates = isValidCoordinates(purok.latitude, purok.longitude);
    const latNum = parseCoordinate(purok.latitude);
    const lngNum = parseCoordinate(purok.longitude);
    const coordinates = formatCoordinates(purok.latitude, purok.longitude);
    
    // Handle updated_at safely
    const updatedAt = purok.updated_at || purok.created_at;
    
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
                    {/* Created Date */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="dark:text-gray-300 cursor-help font-medium">
                                    {formatDate(purok.created_at)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Full date and time</p>
                                <p className="text-xs mt-1">{formatDate(purok.created_at, true)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Last Updated */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="dark:text-gray-300 cursor-help font-medium">
                                    {formatDate(updatedAt)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Last modification time</p>
                                <p className="text-xs mt-1">{formatDate(updatedAt, true)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* ID */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">ID:</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono dark:text-gray-300">
                            #{purok.id}
                        </code>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Coordinates */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Coordinates:
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className={`text-xs font-mono cursor-help flex items-center gap-1 ${
                                    hasValidCoordinates 
                                        ? 'dark:text-gray-300' 
                                        : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    {coordinates}
                                    {!hasValidCoordinates && (
                                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                                    )}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {hasValidCoordinates && latNum !== null && lngNum !== null ? (
                                    <div className="space-y-1">
                                        <p className="font-medium">Geographic Coordinates</p>
                                        <p>Latitude: {latNum.toFixed(6)}</p>
                                        <p>Longitude: {lngNum.toFixed(6)}</p>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `${latNum}, ${lngNum}`
                                                );
                                            }}
                                            className="text-xs text-blue-500 hover:text-blue-600 mt-1 w-full text-left"
                                        >
                                            Copy coordinates
                                        </button>
                                    </div>
                                ) : (
                                    <p>No coordinates set for this purok</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    {/* Google Maps Link */}
                    {purok.google_maps_url && (
                        <>
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Map:</span>
                                <a 
                                    href={purok.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center gap-1"
                                >
                                    <MapPin className="h-3 w-3" />
                                    Open in Google Maps →
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};