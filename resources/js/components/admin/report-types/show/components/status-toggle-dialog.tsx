// resources/js/Pages/Admin/Reports/ReportTypes/components/status-toggle-dialog.tsx
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
    reportType: any;
    onToggle: () => void;
}

export const StatusToggleDialog = ({
    open,
    onOpenChange,
    reportType,
    onToggle
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">
                        {reportType.is_active ? 'Deactivate' : 'Activate'} Report Type
                    </AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to {reportType.is_active ? 'deactivate' : 'activate'} "{reportType.name}"?
                        {reportType.is_active 
                            ? ' This will prevent new reports from being filed under this type.'
                            : ' This will allow new reports to be filed under this type.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onToggle}
                        className={reportType.is_active ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                    >
                        {reportType.is_active ? 'Deactivate' : 'Activate'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};