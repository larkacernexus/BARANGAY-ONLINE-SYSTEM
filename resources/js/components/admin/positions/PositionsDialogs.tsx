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
    handleBulkOperation: (operation: string) => void;
    selectionStats: any;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function PositionsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    isPerformingBulkAction,
    selectedPositions,
    handleBulkOperation,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
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
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedPositions.length} selected positions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Status Action</Label>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleBulkOperation('activate')}
                                    disabled={isPerformingBulkAction}
                                >
                                    Activate All
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleBulkOperation('deactivate')}
                                    disabled={isPerformingBulkAction}
                                >
                                    Deactivate All
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label>Account Requirement</Label>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setBulkEditValue('enable');
                                        handleBulkOperation('toggle_account');
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Require Account
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setBulkEditValue('disable');
                                        handleBulkOperation('toggle_account');
                                    }}
                                    disabled={isPerformingBulkAction}
                                >
                                    Remove Requirement
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total || selectedPositions.length} total positions</li>
                                <li>{selectionStats.active || 0} active • {selectionStats.inactive || 0} inactive</li>
                                <li>{selectionStats.totalOfficials?.toLocaleString() || '0'} total officials</li>
                                <li>{selectionStats.requiresAccount || 0} require account</li>
                                <li>{selectionStats.hasCommittee || 0} with committee assignments</li>
                                {selectionStats.avgOfficials && (
                                    <li>Avg: {selectionStats.avgOfficials.toFixed(1)} officials per position</li>
                                )}
                            </ul>
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