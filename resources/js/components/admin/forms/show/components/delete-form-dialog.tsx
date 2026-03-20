// resources/js/Pages/Admin/Forms/components/delete-form-dialog.tsx
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
import { Loader2 } from 'lucide-react';
import { Form } from '../types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: Form;
    isDeleting: boolean;
    onDelete: () => void;
}

export const DeleteFormDialog = ({
    open,
    onOpenChange,
    form,
    isDeleting,
    onDelete,
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Delete Form</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        This action cannot be undone. This will permanently delete the form
                        "{form.title}" and remove all associated data from our servers.
                        All download links will become invalid.
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
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Form'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};