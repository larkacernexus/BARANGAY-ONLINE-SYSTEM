// resources/js/components/admin/receipts/ReceiptsDialogs.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ReceiptsDialogsProps {
    showBulkVoidDialog: boolean;
    setShowBulkVoidDialog: (show: boolean) => void;
    showBulkExportDialog: boolean;
    setShowBulkExportDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedReceipts: number[];
    handleBulkVoid: () => void;
    handleBulkExport: () => void;
    selectionStats: any;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function ReceiptsDialogs({
    showBulkVoidDialog,
    setShowBulkVoidDialog,
    showBulkExportDialog,
    setShowBulkExportDialog,
    isPerformingBulkAction,
    selectedReceipts,
    handleBulkVoid,
    handleBulkExport,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
}: ReceiptsDialogsProps) {
    return (
        <>
            {/* Bulk Void Dialog */}
            <AlertDialog open={showBulkVoidDialog} onOpenChange={setShowBulkVoidDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">
                            Void {selectedReceipts.length} Receipt(s)
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            You are about to void {selectedReceipts.length} receipt(s) with a total amount of {selectionStats?.formattedTotalAmount || '₱0.00'}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="void-reason" className="dark:text-gray-300">
                                Reason for Voiding <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="void-reason"
                                placeholder="Please provide a reason for voiding these receipts..."
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                                rows={3}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                This reason will be recorded for all selected receipts.
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkVoid}
                            disabled={isPerformingBulkAction || !bulkEditValue.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Voiding...
                                </>
                            ) : (
                                `Void ${selectedReceipts.length} Receipt(s)`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Export Dialog */}
            <AlertDialog open={showBulkExportDialog} onOpenChange={setShowBulkExportDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">
                            Export {selectedReceipts.length} Receipt(s)
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            You are about to export {selectedReceipts.length} receipt(s) with a total amount of {selectionStats?.formattedTotalAmount || '₱0.00'}.
                            The data will be exported as a CSV file.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction} className="dark:border-gray-600 dark:text-gray-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkExport}
                            disabled={isPerformingBulkAction}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                `Export ${selectedReceipts.length} Receipt(s)`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}