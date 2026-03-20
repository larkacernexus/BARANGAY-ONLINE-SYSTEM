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
    Zap,
    Info,
    Download,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Role, Permission } from '../types';
import { QuickActionsCard } from './quick-actions-card';
import { SystemInfoCard } from './system-info-card';

interface Props {
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
    statistics: any[];
    onCopyToClipboard: (text: string, label: string) => void;
    onManagePermissions: () => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}

// Helper Label component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}>
            {children}
        </div>
    );
}

export const OverviewTab = ({
    role,
    groupedPermissions,
    statistics,
    onCopyToClipboard,
    onManagePermissions,
    formatDateTime,
    formatTimeAgo
}: Props) => {
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role ID</Label>
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
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</Label>
                                <div className="mt-1">
                                    <Badge 
                                        variant={role.is_system_role ? "default" : "outline"}
                                        className={role.is_system_role 
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        }
                                    >
                                        {role.is_system_role ? 'System Role' : 'Custom Role'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md min-h-[80px] dark:text-gray-300">
                                {role.description || (
                                    <span className="text-gray-400 dark:text-gray-500 italic">No description provided</span>
                                )}
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</Label>
                                <div className="flex items-center gap-2 mt-1 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm">{formatDateTime(role.created_at)}</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</Label>
                                <div className="flex items-center gap-2 mt-1 dark:text-gray-300">
                                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm">{formatTimeAgo(role.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Summary Card - Full Width */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Lock className="h-5 w-5" />
                            Permissions Summary
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {role.permissions?.length || 0} permissions assigned to this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(groupedPermissions).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).slice(0, 3).map(([module, permissions]) => (
                                    <div key={module}>
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {module} ({permissions.length})
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {permissions.slice(0, 5).map(permission => (
                                                <Tooltip key={permission.id}>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="text-xs cursor-help dark:border-gray-600 dark:text-gray-300">
                                                            {permission.display_name}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className="max-w-xs">
                                                            <div className="font-medium dark:text-gray-100">{permission.display_name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{permission.name}</div>
                                                            {permission.description && (
                                                                <div className="text-xs mt-1 dark:text-gray-400">{permission.description}</div>
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
                                {Object.keys(groupedPermissions).length > 3 && (
                                    <div className="pt-2">
                                        <Button 
                                            variant="link" 
                                            className="p-0 h-auto dark:text-blue-400"
                                            onClick={() => {
                                                const tabButton = document.querySelector('button[data-tab="permissions"]');
                                                if (tabButton) (tabButton as HTMLButtonElement).click();
                                            }}
                                        >
                                            View all {Object.keys(groupedPermissions).length} permission modules
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Key className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No permissions assigned</p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-3 dark:border-gray-600 dark:text-gray-300"
                                    onClick={onManagePermissions}
                                    disabled={role.is_system_role}
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    Assign Permissions
                                </Button>
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
                    onExport={() => {
                        const data = {
                            id: role.id,
                            name: role.name,
                            description: role.description,
                            is_system_role: role.is_system_role,
                            users_count: role.users_count,
                            permissions: role.permissions?.map(p => ({
                                id: p.id,
                                name: p.name,
                                display_name: p.display_name,
                                module: p.module,
                            })) || [],
                            created_at: role.created_at,
                            updated_at: role.updated_at,
                        };
                        
                        const jsonString = JSON.stringify(data, null, 2);
                        const blob = new Blob([jsonString], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }}
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