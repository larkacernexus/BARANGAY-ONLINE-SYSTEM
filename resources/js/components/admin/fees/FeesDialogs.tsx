// components/admin/fees/FeesDialogs.tsx

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
import { SelectionStats, BulkOperation } from '@/types/admin/fees/fees'; 

interface FeesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedFees: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
}

const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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
    // Calculate total balance safely from selectionStats
    const getTotalBalance = () => {
        if (!selectionStats) return 0;
        
        // Use totalBalance if available, otherwise calculate from totalAmount and paidAmount
        if (selectionStats.totalBalance !== undefined) {
            return selectionStats.totalBalance;
        }
        
        if (selectionStats.totalAmount !== undefined && selectionStats.paidAmount !== undefined) {
            return selectionStats.totalAmount - selectionStats.paidAmount;
        }
        
        return 0;
    };
    
    const totalBalance = getTotalBalance();
    const hasBalance = totalBalance > 0;
    
    return (
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
            <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Delete Selected Fees</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete {selectedFees.length} selected fee{selectedFees.length !== 1 ? 's' : ''}?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {hasBalance && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            ⚠️ Warning: Selected fees have a total balance of {formatCurrency(totalBalance)}.
                            Consider marking as paid instead of deleting.
                        </p>
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel 
                        disabled={isPerformingBulkAction}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleBulkOperation('delete' as BulkOperation)}
                        className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
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