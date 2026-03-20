// resources/js/Pages/Admin/Roles/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { Role } from '../types';

interface Props {
    role: Role;
    onCopyToClipboard: (text: string, label: string) => void;
    formatDateTime: (date: string) => string;
}

export const SystemInfoCard = ({ role, onCopyToClipboard, formatDateTime }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-sm font-medium dark:text-gray-100 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Role ID</span>
                    <code className="text-xs dark:text-gray-300">#{role.id}</code>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Users Count</span>
                    <span className="dark:text-gray-300">{role.users_count || 0}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Permissions</span>
                    <span className="dark:text-gray-300">{role.permissions?.length || 0}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="dark:text-gray-300">{formatDateTime(role.updated_at)}</span>
                </div>
            </CardContent>
        </Card>
    );
};