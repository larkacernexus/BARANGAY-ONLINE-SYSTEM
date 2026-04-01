// resources/js/components/admin/positions/PositionsDialogs.tsx

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

interface PositionsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedPositions: number[];
    handleBulkOperation: () => void; // For delete
    handleBulkAccountToggle: () => void; // For account toggle
    selectionStats: any; // Use any to handle the actual shape from positionUtils
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    handleBulkStatusUpdate?: (action: 'activate' | 'deactivate') => void;
}

export default function PositionsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    isPerformingBulkAction,
    selectedPositions,
    handleBulkOperation,
    handleBulkAccountToggle,
    selectionStats,
    bulkEditValue,
    setBulkEditValue,
    handleBulkStatusUpdate
}: PositionsDialogsProps) {
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Positions</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedPositions.length} selected position{selectedPositions.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will also remove all associated officials.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {/* Selection Stats for Delete Dialog */}
                    {selectedPositions.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                            <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Items to be deleted:</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Total:</span> {selectionStats.total || selectedPositions.length}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Active:</span> {selectionStats.active || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Inactive:</span> {selectionStats.inactive || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">With Officials:</span> {selectionStats.hasOfficials || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Total Officials:</span> {selectionStats.totalOfficials || 0}
                                </div>
                                <div className="text-red-700 dark:text-red-400">
                                    <span className="font-medium">Require Account:</span> {selectionStats.requiresAccount || 0}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
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

            {/* Bulk Status & Account Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Positions</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status or account requirements for {selectedPositions.length} selected position{selectedPositions.length !== 1 ? 's' : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-2">
                        {/* Status Update Section */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Status Update</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        if (handleBulkStatusUpdate) {
                                            handleBulkStatusUpdate('activate');
                                            setShowBulkStatusDialog(false);
                                        }
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Activate All
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        if (handleBulkStatusUpdate) {
                                            handleBulkStatusUpdate('deactivate');
                                            setShowBulkStatusDialog(false);
                                        }
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Deactivate All
                                </Button>
                            </div>
                        </div>

                        {/* Account Requirement Section */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Account Requirement</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setBulkEditValue('enable');
                                        handleBulkAccountToggle();
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Require Account
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setBulkEditValue('disable');
                                        handleBulkAccountToggle();
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Remove Requirement
                                </Button>
                            </div>
                        </div>

                        {/* Selection Stats */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current selection stats:</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Total:</span> {selectionStats.total || selectedPositions.length}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Active:</span> {selectionStats.active || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Inactive:</span> {selectionStats.inactive || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Require Account:</span> {selectionStats.requiresAccount || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">With Committee:</span> {selectionStats.hasCommittee || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">With Officials:</span> {selectionStats.hasOfficials || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Total Officials:</span> {selectionStats.totalOfficials || 0}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Avg Officials:</span> {(selectionStats.avgOfficials || 0).toFixed(1)}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Kagawad:</span> {selectionStats.isKagawad || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
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