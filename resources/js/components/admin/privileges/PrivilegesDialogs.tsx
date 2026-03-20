// resources/js/components/admin/privileges/PrivilegesDialogs.tsx

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

interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    requiresVerification: number;
    requiresIdNumber: number;
    totalAssignments: number;
    avgDiscount?: number;
}

interface PrivilegesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedPrivileges: number[];
    handleBulkOperation: (operation: string) => void;
    handleBulkStatusUpdate: () => void;
    selectionStats: SelectionStats;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function PrivilegesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    isPerformingBulkAction,
    selectedPrivileges,
    handleBulkOperation,
    handleBulkStatusUpdate,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
}: PrivilegesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Delete Selected Privileges</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete {selectedPrivileges.length} selected 
                            privilege{selectedPrivileges.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will also remove all resident assignments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
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

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Update status for {selectedPrivileges.length} selected privileges.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="dark:text-gray-300">New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                            <div className="font-medium mb-1 dark:text-gray-300">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total privileges</li>
                                <li>{selectionStats.active} active • {selectionStats.inactive} inactive</li>
                                <li>{selectionStats.requiresVerification} require verification</li>
                                <li>{selectionStats.requiresIdNumber} require ID number</li>
                                <li>{selectionStats.totalAssignments.toLocaleString()} total resident assignments</li>
                                {selectionStats.avgDiscount && (
                                    <li>Average discount: {selectionStats.avgDiscount.toFixed(1)}%</li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkStatusUpdate}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
        </>
    );
}