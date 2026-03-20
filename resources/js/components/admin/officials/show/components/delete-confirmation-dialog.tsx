// resources/js/Pages/Admin/Officials/components/delete-confirmation-dialog.tsx
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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    official: any;
    isDeleting: boolean;
    onDelete: () => void;
}

export const DeleteConfirmationDialog = ({
    open,
    onOpenChange,
    official,
    isDeleting,
    onDelete
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Delete Official</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete this official record for "{official.resident?.full_name || 'Unknown'}"? This action cannot be undone.
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
                            'Delete Official'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};