// resources/js/Pages/Admin/ClearanceTypes/components/system-info-card.tsx
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
    Hash,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../utils/helpers';

interface Props {
    clearanceType: any;
}

export const SystemInfoCard = ({ clearanceType }: Props) => {
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
                            #{clearanceType.id}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Code</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                            {clearanceType.code}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="mt-1 dark:text-gray-300 cursor-help">{formatDate(clearanceType.created_at)}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                {formatDate(clearanceType.created_at, true)}
                            </TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatRelativeTime(clearanceType.created_at)}
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="mt-1 dark:text-gray-300 cursor-help">{formatDate(clearanceType.updated_at)}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                {formatDate(clearanceType.updated_at, true)}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};