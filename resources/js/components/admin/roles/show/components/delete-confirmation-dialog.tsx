// resources/js/Pages/Admin/Roles/components/delete-confirmation-dialog.tsx
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
import { RefreshCw } from 'lucide-react';
import { Role } from '../types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
    isDeleting: boolean;
    onDelete: () => void;
}

export const DeleteConfirmationDialog = ({
    open,
    onOpenChange,
    role,
    isDeleting,
    onDelete
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Delete Role</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete the role "{role.name}"? This action cannot be undone. Users assigned to this role will lose their role-based permissions.
                    </AlertDialogDescription>
                </AlertDialogHeader>
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
                            'Delete Role'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};