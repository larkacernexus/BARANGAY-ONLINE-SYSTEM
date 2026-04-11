// resources/js/Pages/Admin/Roles/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Shield,
    Lock,
    Key,
    Users,
    Copy,
    Calendar,
    Clock,
    ChevronRight,
    Info,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Role, Permission } from '@/types/admin/roles/roles';
import { formatDate, getRoleTypeBadgeVariant } from '@/admin-utils/rolesUtils';
import { QuickActionsCard } from './quick-actions-card';
import { SystemInfoCard } from './system-info-card';

interface OverviewTabProps {
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
    statistics: Array<{
        label: string;
        value: string | number;
        icon: React.ComponentType<{ className?: string }>;
        description: string;
        color: string;
    }>;
    onCopyToClipboard: (text: string, label: string) => void;
    onManagePermissions: () => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}

// Helper Label component
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}>
            {children}
        </div>
    );
};

export const OverviewTab = ({
    role,
    groupedPermissions,
    statistics,
    onCopyToClipboard,
    onManagePermissions,
    formatDateTime,
    formatTimeAgo
}: OverviewTabProps) => {
    // Safe access with fallbacks
    const permissionsCount = role.permissions?.length ?? role.permissions_count ?? 0;
    const usersCount = role.users_count ?? 0;
    const typeVariant = getRoleTypeBadgeVariant(role.is_system_role);
    const hasPermissions = Object.keys(groupedPermissions).length > 0;
    const modulesCount = Object.keys(groupedPermissions).length;

    const handleExport = () => {
        const exportData = {
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
            is_system_role: role.is_system_role,
            users_count: usersCount,
            permissions_count: permissionsCount,
            permissions: role.permissions?.map(p => ({
                id: p.id,
                name: p.name,
                display_name: p.display_name,
                module: p.module,
                description: p.description,
            })) || [],
            created_at: role.created_at,
            updated_at: role.updated_at,
            export_date: new Date().toISOString(),
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const switchToPermissionsTab = () => {
        const tabButton = document.querySelector('button[data-tab="permissions"]');
        if (tabButton) {
            (tabButton as HTMLButtonElement).click();
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
                {/* Role Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Shield className="h-5 w-5" />
                            Role Information
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Complete details about this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Role ID</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="font-mono text-sm dark:text-gray-300">{role.id}</div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 dark:text-gray-400 dark:hover:text-white"
                                        onClick={() => onCopyToClipboard(role.id.toString(), 'Role ID')}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Slug</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="font-mono text-sm dark:text-gray-300">{role.slug}</div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 dark:text-gray-400 dark:hover:text-white"
                                        onClick={() => onCopyToClipboard(role.slug, 'Role Slug')}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Role Type</Label>
                                <div className="mt-2">
                                    <Badge 
                                        variant="outline"
                                        className={typeVariant.className}
                                    >
                                        {typeVariant.text}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Statistics</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm dark:text-gray-300">{usersCount} users</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Key className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm dark:text-gray-300">{permissionsCount} permissions</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                            <Label>Description</Label>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md min-h-[80px] dark:text-gray-300">
                                {role.description || (
                                    <span className="text-gray-400 dark:text-gray-500 italic">No description provided</span>
                                )}
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Created</Label>
                                <div className="flex items-center gap-2 mt-1 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm">{formatDateTime(role.created_at)}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ({formatTimeAgo(role.created_at)})
                                </div>
                            </div>
                            <div>
                                <Label>Last Updated</Label>
                                <div className="flex items-center gap-2 mt-1 dark:text-gray-300">
                                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm">{formatDateTime(role.updated_at)}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ({formatTimeAgo(role.updated_at)})
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Summary Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Lock className="h-5 w-5" />
                            Permissions Summary
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {permissionsCount} permission{permissionsCount !== 1 ? 's' : ''} assigned to this role
                            {modulesCount > 0 && ` across ${modulesCount} module${modulesCount !== 1 ? 's' : ''}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasPermissions ? (
                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).slice(0, 3).map(([module, permissions]) => (
                                    <div key={module}>
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                                            <span>{module}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {permissions.length}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {permissions.slice(0, 5).map(permission => (
                                                <Tooltip key={permission.id}>
                                                    <TooltipTrigger asChild>
                                                        <Badge 
                                                            variant="outline" 
                                                            className="text-xs cursor-help dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            {permission.display_name || permission.name}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-xs">
                                                        <div className="space-y-1">
                                                            <div className="font-medium dark:text-gray-100">
                                                                {permission.display_name || permission.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                {permission.name}
                                                            </div>
                                                            {permission.description && (
                                                                <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                                                                    {permission.description}
                                                                </div>
                                                            )}
                                                            {permission.module && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    Module: {permission.module}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                            {permissions.length > 5 && (
                                                <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                                    +{permissions.length - 5} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {modulesCount > 3 && (
                                    <div className="pt-2">
                                        <Button 
                                            variant="link" 
                                            className="p-0 h-auto dark:text-blue-400"
                                            onClick={switchToPermissionsTab}
                                        >
                                            View all {modulesCount} permission modules
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="h-12 w-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                    <Key className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No permissions assigned</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    This role has no permissions yet
                                </p>
                                {!role.is_system_role && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-3 dark:border-gray-600 dark:text-gray-300"
                                        onClick={onManagePermissions}
                                    >
                                        <Key className="h-4 w-4 mr-2" />
                                        Assign Permissions
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <QuickActionsCard
                    role={role}
                    onManagePermissions={onManagePermissions}
                    onExport={handleExport}
                />

                <SystemInfoCard
                    role={role}
                    onCopyToClipboard={onCopyToClipboard}
                    formatDateTime={formatDateTime}
                />
            </div>
        </div>
    );
};