// resources/js/Pages/Admin/Reports/ReportTypes/components/duplicate-confirmation-dialog.tsx
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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportType: any;
    isDuplicating: boolean;
    onDuplicate: () => void;
}

export const DuplicateConfirmationDialog = ({
    open,
    onOpenChange,
    reportType,
    isDuplicating,
    onDuplicate
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Duplicate Report Type</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Create a copy of "{reportType.name}"? The new report type will have "(Copy)" appended to its name.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDuplicating} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDuplicate}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isDuplicating}
                    >
                        {isDuplicating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Duplicating...
                            </>
                        ) : (
                            'Duplicate'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};