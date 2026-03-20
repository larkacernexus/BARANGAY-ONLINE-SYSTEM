// resources/js/Pages/Admin/Roles/components/permissions-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Lock,
    Key,
    Settings,
    Copy,
} from 'lucide-react';
import { Role, Permission } from '../types';

interface Props {
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
    onCopyToClipboard: (text: string, label: string) => void;
    onManagePermissions: () => void;
}

export const PermissionsTab = ({ role, groupedPermissions, onCopyToClipboard, onManagePermissions }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Lock className="h-5 w-5" />
                            Assigned Permissions
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {role.permissions?.length || 0} permissions across {Object.keys(groupedPermissions).length} modules
                        </CardDescription>
                    </div>
                    <Button 
                        size="sm"
                        onClick={onManagePermissions}
                        disabled={role.is_system_role}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Permissions
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {Object.keys(groupedPermissions).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedPermissions).map(([module, permissions]) => (
                            <div key={module} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold dark:text-gray-100">
                                        {module}
                                    </h3>
                                    <Badge variant="outline" className="text-sm dark:border-gray-600 dark:text-gray-300">
                                        {permissions.length} permissions
                                    </Badge>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {permissions.map(permission => (
                                        <Card key={permission.id} className="dark:bg-gray-900 overflow-hidden">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium dark:text-gray-200">
                                                    {permission.display_name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="space-y-2">
                                                    <code className="text-xs text-gray-500 dark:text-gray-400 block">
                                                        {permission.name}
                                                    </code>
                                                    {permission.description && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {permission.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 dark:text-gray-400 dark:hover:text-white"
                                                    onClick={() => onCopyToClipboard(permission.name, 'Permission name')}
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    Copy
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Key className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">
                            No permissions assigned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            This role doesn't have any permissions assigned yet.
                        </p>
                        <Button 
                            onClick={onManagePermissions}
                            disabled={role.is_system_role}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Assign Permissions
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};