// resources/js/Pages/Admin/Roles/components/danger-zone.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertTriangle,
    Trash2,
    Shield,
    Users,
    AlertCircle,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Role } from '@/types/admin/roles/roles';

interface DangerZoneProps {
    role: Role;
    onDelete: () => void;
    canDelete: boolean;
    isDeleting?: boolean;
    onViewUsers?: () => void;
}

export const DangerZone = ({ 
    role, 
    onDelete, 
    canDelete, 
    isDeleting = false,
    onViewUsers 
}: DangerZoneProps) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const hasUsers = usersCount > 0;
    const isSystemRole = role.is_system_role;
    
    const getDeleteDisabledReason = (): string => {
        if (isSystemRole) return 'System roles cannot be deleted';
        if (hasUsers) return `Cannot delete role with ${usersCount} assigned user${usersCount !== 1 ? 's' : ''}`;
        return '';
    };

    const handleDeleteClick = () => {
        if (showConfirmation) {
            onDelete();
        } else {
            setShowConfirmation(true);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    const disabledReason = getDeleteDisabledReason();
    const isDisabled = !canDelete || isDeleting;

    return (
        <Card className="border-red-200 dark:border-red-900/50 dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-red-50 dark:bg-red-950/20">
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions for this role - proceed with caution
                </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <div className="font-semibold text-red-800 dark:text-red-300">
                                    Delete this role
                                </div>
                                {isSystemRole && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="inline-flex">
                                                    <Shield className="h-4 w-4 text-amber-500" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>System roles cannot be deleted</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                                <p>
                                    Once deleted, this role cannot be recovered. 
                                    {!isSystemRole && ' Users assigned to this role will lose their role-based permissions.'}
                                </p>
                                {hasUsers && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>
                                            <span className="font-medium">{usersCount}</span> user
                                            {usersCount !== 1 ? 's are' : ' is'} currently assigned to this role.
                                        </span>
                                        {onViewUsers && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0 text-red-600 dark:text-red-400"
                                                onClick={onViewUsers}
                                            >
                                                View users
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {showConfirmation && !isDisabled && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                                >
                                    Cancel
                                </Button>
                            )}
                            
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <Button 
                                                variant="destructive"
                                                onClick={handleDeleteClick}
                                                disabled={isDisabled}
                                                className={`whitespace-nowrap shadow-sm ${
                                                    showConfirmation && !isDisabled
                                                        ? 'bg-red-700 hover:bg-red-800'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                } text-white`}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : showConfirmation && !isDisabled ? (
                                                    <>
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                        Confirm Delete
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Role
                                                    </>
                                                )}
                                                {hasUsers && !isSystemRole && !isDeleting && (
                                                    <span className="ml-2 text-xs opacity-80">
                                                        ({usersCount})
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {isDisabled && disabledReason && (
                                        <TooltipContent side="left">
                                            <p>{disabledReason}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Warning Alerts */}
                    {hasUsers && !isSystemRole && canDelete && (
                        <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-800 dark:text-amber-400">
                                Warning: Users Assigned
                            </AlertTitle>
                            <AlertDescription className="text-amber-700 dark:text-amber-500">
                                This role has {usersCount} active user{usersCount !== 1 ? 's' : ''}. 
                                Deleting this role will remove permissions from these users. 
                                Consider reassigning them to another role first.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isSystemRole && (
                        <Alert className="bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800">
                            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <AlertTitle className="text-purple-800 dark:text-purple-400">
                                Protected System Role
                            </AlertTitle>
                            <AlertDescription className="text-purple-700 dark:text-purple-500">
                                This is a system role that is protected. System roles cannot be deleted 
                                as they are essential for the application's core functionality.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!hasUsers && !isSystemRole && canDelete && !showConfirmation && (
                        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-400">
                                Ready for Deletion
                            </AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-500">
                                This role has no assigned users and can be safely deleted.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Consequences List */}
                    {!isSystemRole && canDelete && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <div className="font-medium mb-2">What happens when you delete this role?</div>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>The role will be permanently removed from the system</li>
                                <li>All users will lose permissions associated with this role</li>
                                <li>Any audit logs will retain the role name for historical records</li>
                                <li>This action cannot be undone</li>
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};