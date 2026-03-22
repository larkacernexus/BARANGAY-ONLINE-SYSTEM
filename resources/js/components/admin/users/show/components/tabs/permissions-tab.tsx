// components/admin/users/show/components/tabs/permissions-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Shield, 
    Key, 
    Lock, 
    CheckCircle, 
    XCircle,
    ChevronRight,
    Users,
    Globe,
    Settings,
    Database,
    FileText,
    UserCog,
    Building2,
    Home,
    BarChart3
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface PermissionsTabProps {
    user: any;
}

export const PermissionsTab = ({ user }: PermissionsTabProps) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const rolePermissions = user.role?.permissions || [];
    const directPermissions = user.permissions || [];
    
    const allPermissions = [...rolePermissions, ...directPermissions];
    
    // Group permissions by module
    const groupedPermissions = allPermissions.reduce((groups: any, permission: any) => {
        const module = permission.module || 'general';
        if (!groups[module]) {
            groups[module] = [];
        }
        groups[module].push(permission);
        return groups;
    }, {});

    const getModuleIcon = (module: string) => {
        switch (module.toLowerCase()) {
            case 'users':
                return <Users className="h-5 w-5" />;
            case 'roles':
                return <UserCog className="h-5 w-5" />;
            case 'permissions':
                return <Key className="h-5 w-5" />;
            case 'settings':
                return <Settings className="h-5 w-5" />;
            case 'dashboard':
                return <BarChart3 className="h-5 w-5" />;
            case 'reports':
                return <FileText className="h-5 w-5" />;
            case 'system':
                return <Database className="h-5 w-5" />;
            default:
                return <Shield className="h-5 w-5" />;
        }
    };

    const getModuleTitle = (module: string) => {
        return module.charAt(0).toUpperCase() + module.slice(1);
    };

    return (
        <div className="space-y-6">
            {/* Role Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Shield className="h-5 w-5" />
                        Role Assignment
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        The role determines the base permissions for this user
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium dark:text-gray-200">{user.role?.name || 'No Role Assigned'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {rolePermissions.length} permissions inherited from role
                                </p>
                            </div>
                        </div>
                        {user.role && (
                            <Link href={`/admin/roles/${user.role.id}`}>
                                <Button variant="outline" size="sm">
                                    View Role
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Overview */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Key className="h-5 w-5" />
                        Permissions Overview
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        All permissions available to this user (role + direct)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="text-center py-12">
                            <Lock className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No permissions assigned</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([module, permissions]: [string, any]) => (
                                <div key={module} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setExpandedSection(expandedSection === module ? null : module)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getModuleIcon(module)}
                                            <div className="text-left">
                                                <p className="font-medium dark:text-gray-200">{getModuleTitle(module)}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-5 w-5 transition-transform ${expandedSection === module ? 'rotate-90' : ''}`} />
                                    </button>
                                    
                                    {expandedSection === module && (
                                        <div className="p-4 space-y-2">
                                            {permissions.map((permission: any) => (
                                                <div key={permission.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                                                    <div>
                                                        <p className="font-medium dark:text-gray-200">{permission.name}</p>
                                                        {permission.description && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{permission.description}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant="outline" className="ml-2">
                                                        {permission.source === 'role' ? 'From Role' : 'Direct'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Direct Permissions (if any) */}
            {directPermissions.length > 0 && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <UserCog className="h-5 w-5" />
                            Direct Permissions
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Permissions assigned directly to this user (override role)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {directPermissions.map((permission: any) => (
                                <Badge key={permission.id} variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    {permission.name}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};