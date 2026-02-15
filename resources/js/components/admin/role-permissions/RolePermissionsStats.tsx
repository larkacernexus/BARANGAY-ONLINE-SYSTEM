// components/admin/role-permissions/RolePermissionsStats.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Key, Users, Layers } from 'lucide-react';
import { RolePermission } from '@/admin-utils/rolePermissionsUtils';

interface RolePermissionsStatsProps {
    permissions: RolePermission[];
    totalItems: number;
}

export default function RolePermissionsStats({ permissions, totalItems }: RolePermissionsStatsProps) {
    const uniqueRoles = [...new Set(permissions.map(rp => rp.role_id))].length;
    const uniquePermissions = [...new Set(permissions.map(rp => rp.permission_id))].length;
    const uniqueModules = [...new Set(permissions.map(rp => rp.permission?.module))].filter(Boolean).length;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                            <p className="text-2xl font-bold">{totalItems}</p>
                            <div className="text-xs text-gray-500 mt-1">
                                Permission assignments
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Roles</p>
                            <p className="text-2xl font-bold text-green-600">{uniqueRoles}</p>
                            <div className="text-xs text-gray-500 mt-1">
                                Roles with permissions
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Unique Permissions</p>
                            <p className="text-2xl font-bold text-purple-600">{uniquePermissions}</p>
                            <div className="text-xs text-gray-500 mt-1">
                                Distinct permissions
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Modules</p>
                            <p className="text-2xl font-bold text-orange-600">{uniqueModules}</p>
                            <div className="text-xs text-gray-500 mt-1">
                                Active modules
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                            <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}