// resources/js/Pages/Admin/Roles/components/delete-confirmation-dialog.tsx
import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    RefreshCw,
    AlertTriangle,
    Trash2,
    Users,
    Shield,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Role } from '@/types/admin/roles/roles';
import { canDeleteRole } from '@/admin-utils/rolesUtils';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
    isDeleting: boolean;
    onDelete: () => void;
    onViewUsers?: () => void;
}

export const DeleteConfirmationDialog = ({
    open,
    onOpenChange,
    role,
    isDeleting,
    onDelete,
    onViewUsers,
}: DeleteConfirmationDialogProps) => {
    const [confirmText, setConfirmText] = useState('');
    const [showConfirmInput, setShowConfirmInput] = useState(false);
    
    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const hasUsers = usersCount > 0;
    const isSystemRole = role.is_system_role;
    const deletable = canDeleteRole(role);
    
    const needsConfirmation = hasUsers && !isSystemRole;
    const confirmRoleName = role.name.toLowerCase();
    
    const handleDelete = () => {
        if (needsConfirmation && confirmText !== confirmRoleName) {
            return;
        }
        onDelete();
    };
    
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setConfirmText('');
            setShowConfirmInput(false);
        }
        onOpenChange(newOpen);
    };
    
    const getWarningIcon = () => {
        if (isSystemRole) return <Shield className="h-6 w-6 text-purple-500" />;
        if (hasUsers) return <Users className="h-6 w-6 text-amber-500" />;
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    };
    
    const getWarningTitle = () => {
        if (isSystemRole) return 'Cannot Delete System Role';
        if (hasUsers) return 'Warning: Users Assigned';
        return 'Confirm Role Deletion';
    };
    
    const getWarningDescription = () => {
        if (isSystemRole) {
            return `"${role.name}" is a protected system role that is essential for the application's core functionality. System roles cannot be deleted.`;
        }
        if (hasUsers) {
            return `This role is currently assigned to ${usersCount} user${usersCount !== 1 ? 's' : ''}. Deleting this role will remove permissions from these users. Consider reassigning them to another role first.`;
        }
        return `Are you sure you want to delete the role "${role.name}"? This action cannot be undone and all associated permissions will be removed.`;
    };
    
    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900 max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`
                            p-2 rounded-full
                            ${isSystemRole ? 'bg-purple-100 dark:bg-purple-900/30' : 
                              hasUsers ? 'bg-amber-100 dark:bg-amber-900/30' : 
                              'bg-red-100 dark:bg-red-900/30'}
                        `}>
                            {getWarningIcon()}
                        </div>
                        <AlertDialogTitle className="dark:text-gray-100 text-lg">
                            {getWarningTitle()}
                        </AlertDialogTitle>
                    </div>
                    
                    <AlertDialogDescription className="dark:text-gray-400 space-y-3">
                        <p>{getWarningDescription()}</p>
                        
                        {hasUsers && !isSystemRole && (
                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-sm font-medium">
                                    <Users className="h-4 w-4" />
                                    <span>Impact Summary:</span>
                                </div>
                                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-500 list-disc list-inside">
                                    <li>{usersCount} user{usersCount !== 1 ? 's will' : ' will'} lose access to permissions</li>
                                    <li>Any workflows depending on this role may break</li>
                                    <li>Audit logs will retain the role name for reference</li>
                                </ul>
                                {onViewUsers && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="mt-2 p-0 h-auto text-amber-700 dark:text-amber-400"
                                        onClick={() => {
                                            onViewUsers();
                                            handleOpenChange(false);
                                        }}
                                    >
                                        View assigned users →
                                    </Button>
                                )}
                            </div>
                        )}
                        
                        {!isSystemRole && deletable && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-800 dark:text-green-400 text-sm">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>This role can be safely deleted</span>
                                </div>
                                <p className="mt-1 text-xs text-green-700 dark:text-green-500">
                                    No users are currently assigned to this role.
                                </p>
                            </div>
                        )}
                        
                        {needsConfirmation && !isSystemRole && (
                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                    Type <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{role.name}</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={`Enter "${role.name}"`}
                                    className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    autoFocus
                                />
                                {confirmText && confirmText !== confirmRoleName && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        Role name does not match
                                    </p>
                                )}
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel 
                        disabled={isDeleting} 
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                    </AlertDialogCancel>
                    
                    {!isSystemRole && deletable && (
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={`bg-red-600 hover:bg-red-700 text-white ${
                                needsConfirmation && confirmText !== confirmRoleName ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isDeleting || (needsConfirmation && confirmText !== confirmRoleName)}
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Permanently Delete
                                </>
                            )}
                        </AlertDialogAction>
                    )}
                    
                    {isSystemRole && (
                        <AlertDialogAction
                            onClick={() => handleOpenChange(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Got it
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};