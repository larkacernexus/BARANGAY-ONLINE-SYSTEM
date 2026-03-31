// components/admin/forms/FormsDialogs.tsx

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
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SelectionStats, BulkOperation } from '@/types/admin/forms/forms.types';

interface FormsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (value: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedForms: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
    // Optional props for other dialogs
    showBulkStatusDialog?: boolean;
    setShowBulkStatusDialog?: (value: boolean) => void;
    bulkEditValue?: string;
    setBulkEditValue?: (value: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FormsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    isPerformingBulkAction,
    selectedForms,
    handleBulkOperation,
    selectionStats,
    showBulkStatusDialog = false,
    setShowBulkStatusDialog = () => {},
    bulkEditValue = '',
    setBulkEditValue = () => {}
}: FormsDialogsProps) {
    
    // Calculate total size from selectionStats
    const totalSize = selectionStats?.totalSize || 0;
    const totalDownloads = selectionStats?.totalDownloads || 0;
    const activeCount = selectionStats?.active || 0;
    const inactiveCount = selectionStats?.inactive || 0;
    
    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Delete Selected Forms</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete {selectedForms.length} selected form{selectedForms.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {/* Show warning if there are downloads */}
                    {totalDownloads > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                ⚠️ Warning: Selected forms have a total of {totalDownloads.toLocaleString()} downloads.
                                Deleting them will remove download history.
                            </p>
                        </div>
                    )}
                    
                    {/* Show total size info */}
                    {totalSize > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Total file size: {formatFileSize(totalSize)}
                            </p>
                        </div>
                    )}
                    
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel 
                            disabled={isPerformingBulkAction} 
                            className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete' as BulkOperation)}
                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto dark:bg-red-700 dark:hover:bg-red-800"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Status Dialog (Optional) */}
            {setShowBulkStatusDialog && (
                <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                    <AlertDialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-gray-100">Bulk Update Status</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                                Update status for {selectedForms.length} selected forms.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        {/* Show current stats */}
                        {(activeCount > 0 || inactiveCount > 0) && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Currently: {activeCount} active, {inactiveCount} inactive
                                </p>
                            </div>
                        )}
                        
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="dark:text-gray-300">New Status</Label>
                                <select 
                                    className="w-full border rounded px-3 py-2 mt-1 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                    value={bulkEditValue}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel 
                                disabled={isPerformingBulkAction} 
                                className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleBulkOperation('change_status' as BulkOperation)}
                                disabled={isPerformingBulkAction || !bulkEditValue}
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                {isPerformingBulkAction ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Status'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}