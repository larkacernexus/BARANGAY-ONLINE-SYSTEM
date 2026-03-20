// resources/js/Pages/Admin/Privileges/components/system-info-card.tsx
import React from 'react';
import { format, parseISO } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface Privilege {
    id: number;
    code: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    privilege: Privilege;
}

const formatDate = (dateString: string | null, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const SystemInfoCard = ({ privilege }: Props) => (
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
                            <span className="dark:text-gray-300 cursor-help">{formatDate(privilege.created_at)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {formatDate(privilege.created_at, true)}
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="dark:text-gray-300 cursor-help">{formatDate(privilege.updated_at)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {formatDate(privilege.updated_at, true)}
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">ID:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">#{privilege.id}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Code:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300 font-mono">
                        {privilege.code}
                    </code>
                </div>
            </div>
        </CardContent>
    </Card>
);