// resources/js/components/admin/puroks/PuroksDialogs.tsx

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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PuroksDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedPuroks: number[];
    handleBulkOperation: () => void; // For delete
    handleBulkStatusUpdate: () => void; // For status update
    selectionStats: any;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void; // ← This expects a string, not a SetStateAction
}

export default function PuroksDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    isPerformingBulkAction,
    selectedPuroks,
    handleBulkOperation,
    handleBulkStatusUpdate,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
}: PuroksDialogsProps) {
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Delete Selected Puroks</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete {selectedPuroks.length} selected purok{selectedPuroks.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will also remove all associated households and residents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {/* Selection Stats for Delete Dialog */}
                    {selectedPuroks.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                            <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Items to be deleted:</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Total:</span> {selectionStats.total || selectedPuroks.length}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Active:</span> {selectionStats.active || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Inactive:</span> {selectionStats.inactive || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Households:</span> {selectionStats.totalHouseholds || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Residents:</span> {selectionStats.totalResidents || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">With Leaders:</span> {selectionStats.hasLeaders || 0}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleBulkOperation();
                                setShowBulkDeleteDialog(false);
                            }}
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
                <AlertDialogContent className="max-w-md dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Update status for {selectedPuroks.length} selected purok{selectedPuroks.length !== 1 ? 's' : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="dark:text-gray-300">Status Action</Label>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setBulkEditValue('active'); // ← Pass string directly
                                        handleBulkStatusUpdate();
                                        setShowBulkStatusDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Activate All
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setBulkEditValue('inactive'); // ← Pass string directly
                                        handleBulkStatusUpdate();
                                        setShowBulkStatusDialog(false);
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Deactivate All
                                </Button>
                            </div>
                        </div>
                        
                        {/* Selection Stats */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current selection stats:</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Total:</span> {selectionStats.total || selectedPuroks.length}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Active:</span> {selectionStats.active || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Inactive:</span> {selectionStats.inactive || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Households:</span> {selectionStats.totalHouseholds || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Residents:</span> {selectionStats.totalResidents || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">With Leaders:</span> {selectionStats.hasLeaders || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => setShowBulkStatusDialog(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            Done
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}