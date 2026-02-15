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
import { Loader2 } from 'lucide-react';
import { SelectionStats } from '@/types/fees.types';

interface FeesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedFees: number[];
    handleBulkOperation: (operation: string) => void;
    selectionStats?: SelectionStats;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function FeesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    isPerformingBulkAction,
    selectedFees,
    handleBulkOperation,
    selectionStats
}: FeesDialogsProps) {
    return (
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Fees</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {selectedFees.length} selected fee{selectedFees.length !== 1 ? 's' : ''}?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {selectionStats && selectionStats.totalBalance > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            ⚠️ Warning: Selected fees have a total balance of {formatCurrency(selectionStats.totalBalance)}.
                            Consider marking as paid instead of deleting.
                        </p>
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPerformingBulkAction}>
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
    );
}