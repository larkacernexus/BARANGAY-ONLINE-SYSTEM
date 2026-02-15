// components/admin/officials/OfficialsDialogs.tsx
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
import { CheckCircle, XCircle, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { SelectionStats } from '@/admin-utils/officialsUtils';

interface OfficialsDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedOfficials: number[];
    handleBulkOperation: (operation: string) => void;
    selectionStats: SelectionStats;
}

export default function OfficialsDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    isPerformingBulkAction,
    selectedOfficials,
    handleBulkOperation,
    selectionStats
}: OfficialsDialogsProps) {
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Officials</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedOfficials.length} selected official{selectedOfficials.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will also remove all associated assignments.
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
                            Update status for {selectedOfficials.length} selected officials.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Status Actions</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleBulkOperation('make_current')}
                                    disabled={isPerformingBulkAction}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Current
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleBulkOperation('make_former')}
                                    disabled={isPerformingBulkAction}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark as Former
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleBulkOperation('activate')}
                                    disabled={isPerformingBulkAction}
                                >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Activate
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleBulkOperation('deactivate')}
                                    disabled={isPerformingBulkAction}
                                >
                                    <ShieldOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total officials</li>
                                <li>{selectionStats.current} current • {selectionStats.former} former</li>
                                <li>{selectionStats.regular} regular • {selectionStats.exOfficio} ex-officio</li>
                                <li>{selectionStats.withCommittee} with committee • {selectionStats.withoutCommittee} without</li>
                                <li>{selectionStats.hasContact} with contact • {selectionStats.noContact} no contact</li>
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