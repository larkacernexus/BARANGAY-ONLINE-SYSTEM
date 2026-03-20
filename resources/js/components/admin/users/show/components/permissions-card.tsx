import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Shield,
    ChevronRight,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

// Define structures to avoid using 'any'
interface Permission {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    module?: string;
}

interface UserRole {
    name: string;
    permissions: Permission[];
}

interface User {
    id: number;
    name: string;
    permissions?: Permission[];
    role?: UserRole;
}

interface Props {
    user: User;
}

export const PermissionsCard = ({ user }: Props) => {
    const [showAll, setShowAll] = useState(false);
    
    // Type the accumulator as Record<string, Permission[]>
    const groupedPermissions: Record<string, Permission[]> = user.permissions?.reduce(
        (acc: Record<string, Permission[]>, permission: Permission) => {
            const moduleName = permission.module || 'Other';
            if (!acc[moduleName]) {
                acc[moduleName] = [];
            }
            acc[moduleName].push(permission);
            return acc;
        }, 
        {}
    ) || {};

    const rolePermissions = user.role?.permissions || [];
    const totalPermissions = (user.permissions?.length || 0) + rolePermissions.length;

    // TypeScript now correctly infers [string, Permission[]]
    const allEntries = Object.entries(groupedPermissions);
    const displayedModules = showAll 
        ? allEntries 
        : allEntries.slice(0, 2);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Shield className="h-5 w-5" />
                    Permissions ({totalPermissions})
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Direct and role-based permissions
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {user.permissions?.length || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Direct</p>
                    </div>
                    <div className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {rolePermissions.length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">From Role</p>
                    </div>
                </div>

                {/* Direct Permissions */}
                {user.permissions && user.permissions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm dark:text-gray-300">Direct Permissions</h4>
                        {displayedModules.map(([module, modulePermissions]) => (
                            <div key={module} className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                                    {module.replace(/_/g, ' ')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {modulePermissions.map((permission) => (
                                        <Tooltip key={permission.id}>
                                            <TooltipTrigger asChild>
                                                <Badge variant="outline" className="text-xs cursor-help dark:border-gray-600 dark:text-gray-300">
                                                    {permission.display_name || permission.name}
                                                </Badge>
                                            </TooltipTrigger>
                                            {permission.description && (
                                                <TooltipContent>
                                                    {permission.description}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        {allEntries.length > 2 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAll(!showAll)}
                                className="w-full text-xs"
                            >
                                {showAll ? 'Show less' : `Show ${allEntries.length - 2} more modules`}
                            </Button>
                        )}
                    </div>
                )}

                {/* Role-based Permissions */}
                {rolePermissions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t dark:border-gray-700">
                        <h4 className="font-medium text-sm dark:text-gray-300">
                            Role-based Permissions <span className="text-xs text-gray-500">(from {user.role?.name})</span>
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {rolePermissions.slice(0, 5).map((permission) => (
                                <Badge key={permission.id} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                    {permission.display_name || permission.name}
                                </Badge>
                            ))}
                            {rolePermissions.length > 5 && (
                                <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                    +{rolePermissions.length - 5} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t dark:border-gray-700 pt-4">
                <Link href={`/users/${user.id}/permissions`} className="w-full">
                    <Button variant="outline" className="w-full">
                        Manage Permissions
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};