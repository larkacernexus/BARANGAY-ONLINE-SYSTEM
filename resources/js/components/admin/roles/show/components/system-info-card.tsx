// resources/js/Pages/Admin/Roles/components/system-info-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Info,
    Hash,
    Users,
    Key,
    Calendar,
    Clock,
    Copy,
    Shield,
    Check,
} from 'lucide-react';
import { Role } from '@/types/admin/roles/roles';

interface SystemInfoCardProps {
    role: Role;
    onCopyToClipboard: (text: string, label: string) => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo?: (date: string) => string;
}

interface InfoItem {
    id: string;
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    copyable?: boolean;
    copyLabel?: string;
    badge?: boolean;
    badgeVariant?: 'system' | 'custom';
}

export const SystemInfoCard = ({ 
    role, 
    onCopyToClipboard, 
    formatDateTime,
    formatTimeAgo 
}: SystemInfoCardProps) => {
    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const permissionsCount = role.permissions?.length ?? role.permissions_count ?? 0;
    const isSystemRole = role.is_system_role;

    const infoItems: InfoItem[] = [
        {
            id: 'id',
            label: 'Role ID',
            value: role.id,
            icon: Hash,
            copyable: true,
            copyLabel: 'Role ID',
        },
        {
            id: 'slug',
            label: 'Slug',
            value: role.slug || 'N/A',
            icon: Shield,
            copyable: !!role.slug,
            copyLabel: 'Role Slug',
        },
        {
            id: 'type',
            label: 'Role Type',
            value: isSystemRole ? 'System Role' : 'Custom Role',
            icon: Info,
            badge: true,
            badgeVariant: isSystemRole ? 'system' : 'custom',
        },
        {
            id: 'users',
            label: 'Users Count',
            value: usersCount,
            icon: Users,
            copyable: false,
        },
        {
            id: 'permissions',
            label: 'Permissions',
            value: permissionsCount,
            icon: Key,
            copyable: false,
        },
        {
            id: 'created',
            label: 'Created',
            value: formatDateTime(role.created_at),
            icon: Calendar,
            copyable: true,
            copyLabel: 'Created Date',
        },
        {
            id: 'updated',
            label: 'Last Updated',
            value: formatDateTime(role.updated_at),
            icon: Clock,
            copyable: true,
            copyLabel: 'Last Updated Date',
        },
    ];

    // Add relative time if formatTimeAgo is provided
    const relativeTime = formatTimeAgo && role.updated_at ? formatTimeAgo(role.updated_at) : null;

    const getBadgeStyles = (variant: 'system' | 'custom') => {
        return variant === 'system'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium dark:text-gray-100 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    System Information
                </CardTitle>
                <CardDescription className="text-xs dark:text-gray-400">
                    Technical details and metadata
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
                {infoItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && <Separator className="dark:bg-gray-800" />}
                        
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <item.icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.label}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {item.badge ? (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeStyles(item.badgeVariant!)}`}>
                                        {item.value}
                                    </span>
                                ) : (
                                    <code className="text-xs font-mono dark:text-gray-300">
                                        {item.value}
                                    </code>
                                )}
                                
                                {item.copyable && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity dark:text-gray-400 dark:hover:text-white"
                                                    onClick={() => onCopyToClipboard(
                                                        item.value.toString(), 
                                                        item.copyLabel || item.label
                                                    )}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="left">
                                                <p>Copy {item.label}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                ))}

                {/* Relative time display */}
                {relativeTime && (
                    <>
                        <Separator className="dark:bg-gray-800" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Updated (relative)
                                </span>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                {relativeTime}
                            </span>
                        </div>
                    </>
                )}

                {/* System Role Warning */}
                {isSystemRole && (
                    <>
                        <Separator className="dark:bg-gray-800" />
                        <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                            <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-amber-700 dark:text-amber-400">
                                <span className="font-medium">System Role</span>
                                <p className="mt-0.5 text-amber-600 dark:text-amber-500">
                                    This is a protected system role with restricted modifications.
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* ID Copy Success Indicator */}
                <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                        <span>Metadata Version</span>
                        <span>v1.0</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};