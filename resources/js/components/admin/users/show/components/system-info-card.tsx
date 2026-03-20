// resources/js/Pages/Admin/Users/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

interface Props {
    user: any;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const SystemInfoCard = ({ user, formatDate }: Props) => {
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
                        <span className="text-gray-500 dark:text-gray-400">User ID</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                            #{user.id}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Role ID</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                            #{user.role_id}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Department ID</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                            #{user.department_id || 'N/A'}
                        </code>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last IP</span>
                        <span className="text-xs dark:text-gray-300">{user.last_login_ip || 'N/A'}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span className="text-xs dark:text-gray-300">{formatDate(user.created_at, true)}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                        <span className="text-xs dark:text-gray-300">{formatDate(user.updated_at, true)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};