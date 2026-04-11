// components/admin/users/show/components/tabs/permissions-tab.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Shield, 
    Key, 
    Lock, 
    ChevronRight,
    ChevronDown,
    Users,
    Settings,
    Database,
    FileText,
    UserCog,
    BarChart3,
    Mail,
    Calendar,
    Bell,
    ShieldCheck,
    AlertCircle,
    Copy
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { User, Permission, UserRole } from '@/types/admin/users/user-types';

interface PermissionsTabProps {
    user: User;
    role?: UserRole;
    userPermissions?: Permission[];
    rolePermissions?: Permission[];
}

// Extended permission type with source tracking
// Make module optional since it might not exist on Permission
interface ExtendedPermission extends Permission {
  module?: string;  // Make optional with ?
  source?: 'role' | 'direct';
}

interface GroupedPermissions {
    [module: string]: ExtendedPermission[];
}

// Module icon mapping
const getModuleIcon = (module: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
        'users': <Users className="h-5 w-5" />,
        'roles': <UserCog className="h-5 w-5" />,
        'permissions': <Key className="h-5 w-5" />,
        'settings': <Settings className="h-5 w-5" />,
        'dashboard': <BarChart3 className="h-5 w-5" />,
        'reports': <FileText className="h-5 w-5" />,
        'system': <Database className="h-5 w-5" />,
        'email': <Mail className="h-5 w-5" />,
        'calendar': <Calendar className="h-5 w-5" />,
        'notifications': <Bell className="h-5 w-5" />,
        'security': <ShieldCheck className="h-5 w-5" />,
        'general': <Shield className="h-5 w-5" />,
    };
    return icons[module.toLowerCase()] || <Shield className="h-5 w-5" />;
};

// Get module display title
const getModuleTitle = (module: string): string => {
    return module.charAt(0).toUpperCase() + module.slice(1);
};

// Get permission source badge variant
const getSourceBadgeVariant = (source: 'role' | 'direct'): 'outline' | 'default' => {
    return source === 'role' ? 'outline' : 'default';
};

// Get permission source badge class
const getSourceBadgeClass = (source: 'role' | 'direct'): string => {
    return source === 'role' 
        ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
        : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
};

export const PermissionsTab = ({ 
    user, 
    role: propRole,
    userPermissions: propUserPermissions,
    rolePermissions: propRolePermissions
}: PermissionsTabProps) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Safe access with fallbacks
    const userRole = propRole || user.role;
    const rolePerms: Permission[] = propRolePermissions || userRole?.permissions || [];
    const directPerms: Permission[] = propUserPermissions || user.permissions || [];
    
    // Combine permissions and track source
    const allPermissions: ExtendedPermission[] = useMemo(() => {
        const rolePermsWithSource: ExtendedPermission[] = rolePerms.map((p: Permission) => ({ 
            ...p, 
            source: 'role' as const,
            module: (p as any).module || 'General' // Safe access to module
        }));
        const directPermsWithSource: ExtendedPermission[] = directPerms.map((p: Permission) => ({ 
            ...p, 
            source: 'direct' as const,
            module: (p as any).module || 'General' // Safe access to module
        }));
        return [...rolePermsWithSource, ...directPermsWithSource];
    }, [rolePerms, directPerms]);

    // Group permissions by module
    const groupedPermissions: GroupedPermissions = useMemo(() => {
        const groups: GroupedPermissions = {};
        
        allPermissions.forEach((permission: ExtendedPermission) => {
            const moduleName: string = permission.module || 'General';
            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }
            groups[moduleName].push(permission);
        });
        
        return groups;
    }, [allPermissions]);

    // Calculate statistics
    const stats = useMemo(() => ({
        total: allPermissions.length,
        fromRole: rolePerms.length,
        direct: directPerms.length,
        modules: Object.keys(groupedPermissions).length,
    }), [allPermissions.length, rolePerms.length, directPerms.length, groupedPermissions]);

    const toggleSection = (module: string): void => {
        setExpandedSection(expandedSection === module ? null : module);
    };

    const handleCopyPermissionKey = (permissionName: string): void => {
        navigator.clipboard.writeText(permissionName);
    };

    const hasNoPermissions = stats.total === 0;

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
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium dark:text-gray-200">
                                    {userRole?.name || 'No Role Assigned'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {stats.fromRole} permission{stats.fromRole !== 1 ? 's' : ''} inherited from role
                                </p>
                            </div>
                        </div>
                        {userRole && (
                            <Link href={`/admin/roles/${userRole.id}`}>
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
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <Key className="h-5 w-5" />
                                Permissions Overview
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                All permissions available to this user (role + direct)
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="dark:border-gray-600">
                                Total: {stats.total}
                            </Badge>
                            {stats.direct > 0 && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    Direct: {stats.direct}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {hasNoPermissions ? (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Lock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">No permissions assigned</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                This user has no permissions from their role or direct assignments
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([moduleName, permissions]) => {
                                const isExpanded = expandedSection === moduleName;
                                const roleCount = permissions.filter((p: ExtendedPermission) => p.source === 'role').length;
                                const directCount = permissions.filter((p: ExtendedPermission) => p.source === 'direct').length;
                                
                                return (
                                    <div key={moduleName} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(moduleName)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getModuleIcon(moduleName)}
                                                <div className="text-left">
                                                    <p className="font-medium dark:text-gray-200">
                                                        {getModuleTitle(moduleName)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                                                        {roleCount > 0 && ` (${roleCount} from role)`}
                                                        {directCount > 0 && ` (${directCount} direct)`}
                                                    </p>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="p-4 space-y-2 bg-white dark:bg-gray-900">
                                                {permissions.map((permission: ExtendedPermission) => (
                                                    <div 
                                                        key={permission.id} 
                                                        className="flex items-center justify-between py-2 px-2 border-b dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded transition-colors group"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-medium dark:text-gray-200 text-sm">
                                                                    {permission.display_name || permission.name}
                                                                </p>
                                                                {permission.source === 'direct' && (
                                                                    <Badge 
                                                                        variant={getSourceBadgeVariant(permission.source)}
                                                                        className={getSourceBadgeClass(permission.source)}
                                                                    >
                                                                        Direct
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {permission.description && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {permission.description}
                                                                </p>
                                                            )}
                                                            <code className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1 block">
                                                                {permission.name}
                                                            </code>
                                                        </div>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => handleCopyPermissionKey(permission.name)}
                                                                    >
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Copy permission key</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Direct Permissions Summary (if any) */}
            {directPerms.length > 0 && (
                <Card className="dark:bg-gray-900 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <UserCog className="h-5 w-5 text-blue-500" />
                            Direct Permissions Summary
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Permissions assigned directly to this user (override role permissions)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {directPerms.map((permission: Permission) => (
                                <TooltipProvider key={permission.id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge 
                                                className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 cursor-help"
                                            >
                                                {permission.display_name || permission.name}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-xs">
                                                <div className="font-medium">{permission.display_name || permission.name}</div>
                                                <div className="font-mono text-xs">{permission.name}</div>
                                                {permission.description && (
                                                    <div className="mt-1">{permission.description}</div>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Note: Direct permissions take precedence over role permissions.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Info Alert for Users with No Role */}
            {!userRole && (
                <Card className="dark:bg-gray-900 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="font-medium text-yellow-800 dark:text-yellow-400">No Role Assigned</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                                    This user has no role assigned. Please assign a role to grant permissions.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};