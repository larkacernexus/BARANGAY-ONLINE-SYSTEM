// resources/js/Pages/Admin/Roles/components/details-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Activity,
    Shield,
    Key,
    Users,
    Copy,
    Check,
    Calendar,
    Clock,
    Hash,
    Tag,
    AlertCircle,
    Database,
    Server,
    Code,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Role } from '@/types/admin/roles/roles';
import { formatDate } from '@/admin-utils/rolesUtils';

interface DetailsTabProps {
    role: Role;
    onCopyToClipboard: (text: string, label: string) => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}

// Helper Label component
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}>
            {children}
        </div>
    );
};

// Copyable field component
const CopyableField = ({ 
    label, 
    value, 
    onCopy, 
    icon: Icon,
    monospace = false 
}: { 
    label: string; 
    value: string | number; 
    onCopy: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    monospace?: boolean;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group">
            <Label>{label}</Label>
            <div className="flex items-center justify-between mt-1">
                <div className={`flex items-center gap-2 ${monospace ? 'font-mono' : ''} text-sm dark:text-gray-300`}>
                    {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
                    <span className="break-all">{value}</span>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy {label.toLowerCase()}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export const DetailsTab = ({ role, onCopyToClipboard, formatDateTime, formatTimeAgo }: DetailsTabProps) => {
    const [copiedJson, setCopiedJson] = useState(false);
    
    // Safe access with fallbacks
    const permissionsCount = role.permissions?.length ?? role.permissions_count ?? 0;
    const usersCount = role.users_count ?? 0;

    const handleCopyJson = () => {
        const jsonData = {
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
            is_system_role: role.is_system_role,
            users_count: usersCount,
            permissions_count: permissionsCount,
            created_at: role.created_at,
            updated_at: role.updated_at,
        };
        onCopyToClipboard(JSON.stringify(jsonData, null, 2), 'Role JSON data');
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    const activityItems = [
        {
            id: 'created',
            icon: Shield,
            iconColor: 'blue',
            title: 'Role created',
            timestamp: role.created_at,
            timeAgo: formatTimeAgo(role.created_at),
            description: `Role "${role.name}" was created`,
        },
        {
            id: 'permissions',
            icon: Key,
            iconColor: 'green',
            title: 'Permissions assigned',
            timestamp: role.updated_at,
            timeAgo: formatTimeAgo(role.updated_at),
            description: `${permissionsCount} permission${permissionsCount !== 1 ? 's' : ''} currently assigned`,
        },
        ...(usersCount > 0 ? [{
            id: 'users',
            icon: Users,
            iconColor: 'purple',
            title: 'User assignments',
            timestamp: role.updated_at,
            timeAgo: formatTimeAgo(role.updated_at),
            description: `${usersCount} user${usersCount !== 1 ? 's' : ''} currently assigned to this role`,
        }] : []),
    ];

    const getIconColorClass = (color: string) => {
        const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Database Details Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Database className="h-5 w-5 text-blue-500" />
                        Database Details
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Raw data and metadata from the database
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CopyableField
                                label="ID"
                                value={role.id}
                                onCopy={() => onCopyToClipboard(role.id.toString(), 'Role ID')}
                                icon={Hash}
                                monospace
                            />
                            <div>
                                <Label>System Role</Label>
                                <div className="mt-1">
                                    {role.is_system_role ? (
                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Yes
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                            No
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <Separator className="dark:bg-gray-800" />
                        
                        <CopyableField
                            label="Name"
                            value={role.name}
                            onCopy={() => onCopyToClipboard(role.name, 'Role Name')}
                            icon={Tag}
                        />
                        
                        {role.slug && (
                            <>
                                <Separator className="dark:bg-gray-800" />
                                <CopyableField
                                    label="Slug"
                                    value={role.slug}
                                    onCopy={() => onCopyToClipboard(role.slug, 'Role Slug')}
                                    icon={Code}
                                    monospace
                                />
                            </>
                        )}
                        
                        <Separator className="dark:bg-gray-800" />
                        
                        <div>
                            <Label>Description</Label>
                            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                <p className="text-sm dark:text-gray-300 break-words">
                                    {role.description || (
                                        <span className="text-gray-400 dark:text-gray-500 italic">No description provided</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        <Separator className="dark:bg-gray-800" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CopyableField
                                label="Created At"
                                value={role.created_at}
                                onCopy={() => onCopyToClipboard(role.created_at, 'Created date')}
                                icon={Calendar}
                                monospace
                            />
                            <CopyableField
                                label="Updated At"
                                value={role.updated_at}
                                onCopy={() => onCopyToClipboard(role.updated_at, 'Updated date')}
                                icon={Clock}
                                monospace
                            />
                        </div>
                        
                        <Separator className="dark:bg-gray-800" />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Users Count</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium dark:text-gray-300">{usersCount}</span>
                                </div>
                            </div>
                            <div>
                                <Label>Permissions Count</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Key className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium dark:text-gray-300">{permissionsCount}</span>
                                </div>
                            </div>
                        </div>
                        
                        <Separator className="dark:bg-gray-800" />
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={handleCopyJson}
                                        className="w-full dark:border-gray-600 dark:text-gray-300"
                                    >
                                        {copiedJson ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Code className="h-4 w-4 mr-2" />
                                                Copy JSON Data
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy all role data as JSON</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* System Role Warning in Details */}
                        {role.is_system_role && (
                            <Alert className="mt-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertTitle className="text-amber-800 dark:text-amber-400 text-sm">
                                    System Role
                                </AlertTitle>
                                <AlertDescription className="text-amber-700 dark:text-amber-500 text-xs">
                                    This role is protected by the system and cannot be modified or deleted.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Role Activity Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Activity className="h-5 w-5 text-green-500" />
                        Role Activity
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Recent activities and statistics related to this role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activityItems.map((item, index) => (
                            <div key={item.id} className="relative">
                                {index < activityItems.length - 1 && (
                                    <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                                )}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColorClass(item.iconColor)}`}>
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="text-sm font-medium dark:text-gray-200">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.timeAgo}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {item.description}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                                            {formatDateTime(item.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Additional Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                                <div className="text-sm font-medium dark:text-gray-200 mt-1">
                                    {formatDate(role.created_at)}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Last Modified</div>
                                <div className="text-sm font-medium dark:text-gray-200 mt-1">
                                    {formatDate(role.updated_at)}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button 
                                variant="link" 
                                className="text-sm w-full dark:text-blue-400"
                                onClick={() => {
                                    // TODO: Implement full activity log view
                                    console.log('View full activity log');
                                }}
                            >
                                View full activity log
                                <Server className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};