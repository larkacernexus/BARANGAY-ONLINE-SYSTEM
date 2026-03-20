// resources/js/Pages/Admin/Officials/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface Props {
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const SystemInfoCard = ({ official, formatDate }: Props) => {
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
                        <span className="text-gray-500 dark:text-gray-400">ID</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                            #{official.id}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Position Code</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                            {official.position}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="cursor-help dark:text-gray-300">{formatDate(official.created_at)}</span>
                            </TooltipTrigger>
                            <TooltipContent>{formatDate(official.created_at, true)}</TooltipContent>
                        </Tooltip>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Updated</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="cursor-help dark:text-gray-300">{formatDate(official.updated_at)}</span>
                            </TooltipTrigger>
                            <TooltipContent>{formatDate(official.updated_at, true)}</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};