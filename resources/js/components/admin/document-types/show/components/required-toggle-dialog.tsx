// resources/js/Pages/Admin/DocumentTypes/components/required-toggle-dialog.tsx
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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentType: any;
    onToggle: () => void;
}

export const RequiredToggleDialog = ({
    open,
    onOpenChange,
    documentType,
    onToggle
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">
                        {documentType.is_required ? 'Mark as Optional' : 'Mark as Required'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to mark "{documentType.name}" as {documentType.is_required ? 'optional' : 'required'}?
                        This will affect all clearance types that require this document.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onToggle}
                        className={documentType.is_required ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                    >
                        {documentType.is_required ? 'Mark as Optional' : 'Mark as Required'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};