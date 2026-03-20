// resources/js/Pages/Admin/Permissions/components/information-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Info,
} from 'lucide-react';

interface Props {
    permission: any;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getModuleDisplayName: (module: string) => string;
}

export const InformationCard = ({ permission, formatDate, formatTimeAgo, getModuleDisplayName }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Info className="h-5 w-5" />
                    Permission Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Technical Name:</span>
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
                        {permission.name}
                    </span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <Badge variant={permission.is_active ? "default" : "secondary"}>
                        {permission.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Module:</span>
                    <span className="dark:text-gray-300">{getModuleDisplayName(permission.module)}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="dark:text-gray-300">{formatDate(permission.created_at)}</span>
                </div>
                <div className="flex justify-between py-2">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                    <span className="dark:text-gray-300">{formatTimeAgo(permission.updated_at)}</span>
                </div>
            </CardContent>
        </Card>
    );
};