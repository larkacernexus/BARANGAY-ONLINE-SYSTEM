// resources/js/Pages/Admin/Users/components/profile-summary-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    User as UserIcon,
    Shield,
    Building,
} from 'lucide-react';

interface Props {
    user: any;
}

export const ProfileSummaryCard = ({ user }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <UserIcon className="h-5 w-5" />
                    Profile Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
                        <span className="font-mono text-sm dark:text-gray-300">#{user.id}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Username</span>
                        <span className="font-medium dark:text-gray-300">{user.username || 'Not set'}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                        <span className="font-medium dark:text-gray-300">{user.email}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                        {user.role ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role.name}
                            </Badge>
                        ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                        )}
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                        {user.department ? (
                            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                                <Building className="h-3 w-3 mr-1" />
                                {user.department.name}
                            </Badge>
                        ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};