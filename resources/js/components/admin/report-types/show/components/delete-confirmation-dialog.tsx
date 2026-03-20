// resources/js/Pages/Admin/Reports/ReportTypes/components/delete-confirmation-dialog.tsx
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
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportType: any;
    isDeleting: boolean;
    onDelete: () => void;
}

export const DeleteConfirmationDialog = ({
    open,
    onOpenChange,
    reportType,
    isDeleting,
    onDelete
}: Props) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Delete Report Type</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete the report type "{reportType.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {reportType.community_reports_count > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            This report type has {reportType.community_reports_count} associated report(s). 
                            You cannot delete it while reports exist.
                        </p>
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isDeleting || reportType.community_reports_count > 0}
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};