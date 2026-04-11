// resources/js/Pages/Admin/Roles/components/quick-actions-card.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Zap,
    Key,
    Users,
    Download,
    Copy,
    ExternalLink,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Role } from '@/types/admin/roles/roles';

interface QuickActionsCardProps {
    role: Role;
    onManagePermissions: () => void;
    onExport: () => void;
    onDuplicate?: () => void;
}

export const QuickActionsCard = ({ 
    role, 
    onManagePermissions, 
    onExport,
    onDuplicate 
}: QuickActionsCardProps) => {
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const isSystemRole = role.is_system_role;

    const handleDuplicate = async () => {
        if (isSystemRole) return;
        
        setError(null);
        setIsDuplicating(true);
        
        try {
            if (onDuplicate) {
                onDuplicate();
            } else {
                // Default duplicate behavior
                router.get(route('admin.roles.create'), {
                    duplicate: role.id,
                });
            }
        } catch (err) {
            setError('Failed to duplicate role. Please try again.');
            console.error('Duplicate error:', err);
        } finally {
            setIsDuplicating(false);
        }
    };

    const handleViewUsers = () => {
        router.get(route('users.index'), { role: role.id });
    };

    const quickActions = [
        {
            id: 'manage-permissions',
            label: 'Manage Permissions',
            icon: Key,
            onClick: onManagePermissions,
            disabled: isSystemRole,
            tooltip: isSystemRole ? 'System role permissions cannot be modified' : 'Add or remove permissions for this role',
            variant: 'default' as const,
            className: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm',
        },
        {
            id: 'view-users',
            label: 'View Assigned Users',
            icon: Users,
            onClick: handleViewUsers,
            disabled: usersCount === 0,
            tooltip: usersCount === 0 ? 'No users assigned to this role' : `View ${usersCount} user${usersCount !== 1 ? 's' : ''} with this role`,
            variant: 'outline' as const,
        },
        {
            id: 'export-details',
            label: 'Export Details',
            icon: Download,
            onClick: onExport,
            disabled: false,
            tooltip: 'Export role details as JSON',
            variant: 'outline' as const,
        },
        {
            id: 'duplicate-role',
            label: 'Duplicate Role',
            icon: Copy,
            onClick: handleDuplicate,
            disabled: isSystemRole,
            tooltip: isSystemRole ? 'System roles cannot be duplicated' : 'Create a copy of this role',
            variant: 'outline' as const,
        },
    ];

    return (
        <Card className="dark:bg-gray-900 sticky top-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Quick Actions
                    </CardTitle>
                    {isSystemRole && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="p-1">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>System roles have limited actions</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <CardDescription className="dark:text-gray-400">
                    Perform common actions on this role
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-2">
                {error && (
                    <Alert variant="destructive" className="mb-3 py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    const isDisabled = action.disabled || (action.id === 'duplicate-role' && isDuplicating);
                    
                    return (
                        <TooltipProvider key={action.id}>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button
                                            variant={action.variant}
                                            className={`w-full justify-start ${action.className || ''} ${
                                                isDisabled && action.variant === 'outline' 
                                                    ? 'opacity-50 cursor-not-allowed dark:border-gray-600 dark:text-gray-500'
                                                    : 'dark:border-gray-600 dark:text-gray-300'
                                            }`}
                                            onClick={action.onClick}
                                            disabled={isDisabled}
                                        >
                                            {action.id === 'duplicate-role' && isDuplicating ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <IconComponent className="h-4 w-4 mr-2" />
                                            )}
                                            {action.label}
                                            {action.id === 'view-users' && usersCount > 0 && (
                                                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                    {usersCount}
                                                </span>
                                            )}
                                            {action.id === 'manage-permissions' && !isSystemRole && (
                                                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                                            )}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs">
                                    <p>{action.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </CardContent>
        </Card>
    );
};