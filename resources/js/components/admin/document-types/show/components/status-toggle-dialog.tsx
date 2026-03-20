// resources/js/Pages/Admin/DocumentTypes/components/status-toggle-dialog.tsx
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

export const StatusToggleDialog = ({
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
                        {documentType.is_active ? 'Deactivate' : 'Activate'} Document Type
                    </AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to {documentType.is_active ? 'deactivate' : 'activate'} "{documentType.name}"?
                        {documentType.is_active 
                            ? ' This document will no longer be available for use.'
                            : ' This document will become available for use.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onToggle}
                        className={documentType.is_active ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                    >
                        {documentType.is_active ? 'Deactivate' : 'Activate'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};