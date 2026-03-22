// resources/js/components/admin/blotters/BlottersDialogs.tsx

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
import { Loader2, AlertCircle, Scale, Clock, CheckCircle, Archive } from 'lucide-react';

interface BlottersDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedBlotters: number[];
    handleBulkOperation: (operation: string) => void;
    handleBulkStatusUpdate: () => void;
    selectionStats: any;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function BlottersDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    isPerformingBulkAction,
    selectedBlotters,
    handleBulkOperation,
    handleBulkStatusUpdate,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
}: BlottersDialogsProps) {
    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'investigating': return <AlertCircle className="h-4 w-4" />;
            case 'resolved': return <CheckCircle className="h-4 w-4" />;
            case 'archived': return <Archive className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Blotters</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedBlotters.length} selected blotter{selectedBlotters.length !== 1 ? 's' : ''}?
                            This action cannot be undone. All associated data, including attachments and evidence, will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="font-medium mb-1">Summary:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total || selectedBlotters.length} total blotters</li>
                                <li>{selectionStats.pending || 0} pending • {selectionStats.investigating || 0} investigating</li>
                                <li>{selectionStats.resolved || 0} resolved • {selectionStats.archived || 0} archived</li>
                                <li>{selectionStats.urgent || 0} urgent cases</li>
                            </ul>
                        </div>
                    </div>
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
                            Update status for {selectedBlotters.length} selected blotters.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-gray-900"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="pending">Pending</option>
                                <option value="investigating">Investigating</option>
                                <option value="resolved">Resolved</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total || selectedBlotters.length} total blotters</li>
                                <li className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                    {selectionStats.pending || 0} pending
                                </li>
                                <li className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-blue-500" />
                                    {selectionStats.investigating || 0} investigating
                                </li>
                                <li className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {selectionStats.resolved || 0} resolved
                                </li>
                                <li className="flex items-center gap-1">
                                    <Archive className="h-3 w-3 text-gray-500" />
                                    {selectionStats.archived || 0} archived
                                </li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
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