// resources/js/Pages/Admin/Users/components/permissions-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Shield,
    Users,
    ChevronRight,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PermissionsCard } from './permissions-card';

interface Props {
    user: any;
}

export const PermissionsTab = ({ user }: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Permissions Card */}
            <PermissionsCard user={user} />

            {/* Role Info Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Users className="h-5 w-5" />
                        Role Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Details about the assigned role
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user.role ? (
                        <>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Role Name</p>
                                <p className="text-xl font-bold dark:text-gray-100">{user.role.name}</p>
                            </div>
                            
                            {user.role.description && (
                                <>
                                    <Separator className="dark:bg-gray-700" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                        <p className="text-sm dark:text-gray-300">{user.role.description}</p>
                                    </div>
                                </>
                            )}
                            
                            <Separator className="dark:bg-gray-700" />
                            
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Role Permissions</p>
                                <div className="flex flex-wrap gap-1">
                                    {user.role.permissions && user.role.permissions.length > 0 ? (
                                        user.role.permissions.slice(0, 8).map((permission: any) => (
                                            <Badge key={permission.id} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                                {permission.display_name || permission.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No permissions assigned to this role</p>
                                    )}
                                    {user.role.permissions && user.role.permissions.length > 8 && (
                                        <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                            +{user.role.permissions.length - 8} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Shield className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No role assigned</p>
                            <p className="text-sm mt-1">Assign a role to manage permissions</p>
                        </div>
                    )}
                </CardContent>
                {user.role && (
                    <CardFooter className="border-t dark:border-gray-700 pt-4">
                        <Link href={`/roles/${user.role.id}`} className="w-full">
                            <Button variant="outline" className="w-full">
                                Manage Role
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};