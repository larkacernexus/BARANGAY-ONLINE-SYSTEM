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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface CommitteesDialogsProps {
    showBulkDeleteDialog: boolean;
    showBulkStatusDialog: boolean;
    selectedIds: number[];
    isPerformingBulkAction: boolean;
    selectionStats?: any;
    onClose: () => void;
    onBulkDelete: () => void;
    onBulkActivate: () => void;
    onBulkDeactivate: () => void;
}

export function CommitteesDialogs({
    showBulkDeleteDialog,
    showBulkStatusDialog,
    selectedIds,
    isPerformingBulkAction,
    selectionStats,
    onClose,
    onBulkDelete,
    onBulkActivate,
    onBulkDeactivate
}: CommitteesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={onClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Committees</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected committee{selectedIds.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onBulkDelete}
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

            {/* Bulk Status Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={onClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedIds.length} selected committees.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Status Action</Label>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onBulkActivate}
                                    disabled={isPerformingBulkAction}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate All
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onBulkDeactivate}
                                    disabled={isPerformingBulkAction}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deactivate All
                                </Button>
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onClose}
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