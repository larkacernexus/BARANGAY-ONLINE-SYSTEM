// resources/js/Pages/Admin/Permissions/components/delete-confirmation-dialog.tsx
import React from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Permission } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission: Permission;
    rolesCount: number;
    usersCount: number;
    isDeleting: boolean;
    onDelete: () => void;
}

export const DeleteConfirmationDialog = ({
    open,
    onOpenChange,
    permission,
    rolesCount,
    usersCount,
    isDeleting,
    onDelete
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Delete Permission</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete the permission "{permission.display_name}"?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Alert variant="destructive" className="dark:bg-red-950/30 dark:border-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-600 dark:text-red-400">
                            This will remove access from {rolesCount} role(s) and affect {usersCount} user(s).
                            This action cannot be undone.
                        </AlertDescription>
                    </Alert>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Permission'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};