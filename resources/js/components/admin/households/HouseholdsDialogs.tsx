// components/admin/households/HouseholdsDialogs.tsx

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
import { BulkAction, SelectionStats, Purok } from '@/types/admin/households/household.types';

interface HouseholdsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (value: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (value: boolean) => void;
    showBulkPurokDialog: boolean;
    setShowBulkPurokDialog: (value: boolean) => void;
    isPerformingBulkAction: boolean;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    selectedHouseholds: number[];
    handleBulkOperation: (operation: BulkAction) => void;
    handleBulkStatusUpdate?: (status: string) => Promise<void>;
    handleBulkPurokUpdate?: (purokId: number) => Promise<void>;
    handleBulkDelete?: () => Promise<void>;
    puroks: Purok[];
    selectionStats?: SelectionStats;
}

export default function HouseholdsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    showBulkPurokDialog,
    setShowBulkPurokDialog,
    isPerformingBulkAction,
    bulkEditValue,
    setBulkEditValue,
    selectedHouseholds,
    handleBulkOperation,
    handleBulkStatusUpdate,
    handleBulkPurokUpdate,
    handleBulkDelete,
    puroks,
    selectionStats
}: HouseholdsDialogsProps) {
    
    const totalMembers = selectionStats?.totalMembers || 0;
    
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Delete Selected Households</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete {selectedHouseholds.length} selected household{selectedHouseholds.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {totalMembers > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                ⚠️ Warning: Selected households have a total of {totalMembers} members.
                                Deleting them will also remove all member records.
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
                            onClick={async () => {
                                if (handleBulkDelete) {
                                    await handleBulkDelete();
                                } else {
                                    await handleBulkOperation('delete');
                                }
                            }}
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

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Update status for {selectedHouseholds.length} selected households.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="dark:text-gray-300">New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="" className="bg-white dark:bg-gray-900">Select Status</option>
                                <option value="active" className="bg-white dark:bg-gray-900">Active</option>
                                <option value="inactive" className="bg-white dark:bg-gray-900">Inactive</option>
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
                            onClick={async () => {
                                if (handleBulkStatusUpdate) {
                                    await handleBulkStatusUpdate(bulkEditValue);
                                } else {
                                    await handleBulkOperation('change_status');
                                }
                            }}
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

            {/* Bulk Purok Update Dialog */}
            <AlertDialog open={showBulkPurokDialog} onOpenChange={setShowBulkPurokDialog}>
                <AlertDialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Bulk Update Purok</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Update purok for {selectedHouseholds.length} selected households.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="dark:text-gray-300">New Purok</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="" className="bg-white dark:bg-gray-900">Select Purok</option>
                                {puroks.map((purok) => (
                                    <option key={purok.id} value={purok.id} className="bg-white dark:bg-gray-900">
                                        {purok.name}
                                    </option>
                                ))}
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
                            onClick={async () => {
                                if (handleBulkPurokUpdate) {
                                    await handleBulkPurokUpdate(Number(bulkEditValue));
                                } else {
                                    await handleBulkOperation('change_purok');
                                }
                            }}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Purok'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}