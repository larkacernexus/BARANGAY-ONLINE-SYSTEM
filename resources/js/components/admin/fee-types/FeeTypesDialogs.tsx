// components/admin/fee-types/FeeTypesDialogs.tsx
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
import { Loader2 } from 'lucide-react';
import { BulkOperation, BulkEditField, SelectionStats, FeeType } from '@/types/admin/fee-types/fee.types';

interface FeeTypesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (show: boolean) => void;
    showBulkCategoryDialog: boolean;
    setShowBulkCategoryDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    bulkEditField: BulkEditField;
    setBulkEditField: (field: BulkEditField) => void;
    selectedFeeTypes: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
    categories: Record<string, string>;
    selectedFeeTypesData: FeeType[];
    formatCurrency: (amount: number) => string;
}

export default function FeeTypesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    showBulkCategoryDialog,
    setShowBulkCategoryDialog,
    isPerformingBulkAction,
    bulkEditValue,
    setBulkEditValue,
    bulkEditField,
    setBulkEditField,
    selectedFeeTypes,
    handleBulkOperation,
    selectionStats = {
        total: 0,
        active: 0,
        inactive: 0,
        mandatory: 0,
        autoGenerate: 0,
        totalAmount: 0,
        fixedAmount: 0,
        variableAmount: 0,
        byCategory: {},
        byStatus: {},
        byAmountType: {},
        byFrequency: {},
        byDiscountType: {}
    },
    categories,
    selectedFeeTypesData,
    formatCurrency
}: FeeTypesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Fee Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedFeeTypes.length} selected fee type{selectedFeeTypes.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
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
                            Update status for {selectedFeeTypes.length} selected fee types.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Action</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                                value={bulkEditValue}
                                onChange={(e) => {
                                    setBulkEditValue(e.target.value);
                                    setBulkEditField('status');
                                }}
                            >
                                <option value="">Select Action</option>
                                <option value="activate">Activate Selected</option>
                                <option value="deactivate">Deactivate Selected</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded dark:text-gray-300">
                            <div className="font-medium mb-1 dark:text-gray-200">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total fee types</li>
                                <li>{selectionStats.active} active • {selectionStats.inactive} inactive</li>
                                <li>{selectionStats.mandatory} mandatory</li>
                                <li>{selectionStats.autoGenerate} auto-generated</li>
                                <li>Total amount: {formatCurrency(selectionStats.totalAmount)}</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (bulkEditValue === 'activate') {
                                    handleBulkOperation('activate');
                                } else if (bulkEditValue === 'deactivate') {
                                    handleBulkOperation('deactivate');
                                }
                            }}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                bulkEditValue === 'activate' ? 'Activate Selected' : 'Deactivate Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Category Update Dialog */}
            <AlertDialog open={showBulkCategoryDialog} onOpenChange={setShowBulkCategoryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update category for {selectedFeeTypes.length} selected fee types.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Category</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                                value={bulkEditValue}
                                onChange={(e) => {
                                    setBulkEditValue(e.target.value);
                                    setBulkEditField('category');
                                }}
                            >
                                <option value="">Select Category</option>
                                <option value="none">Uncategorized</option>
                                {Object.entries(categories).map(([id, name]) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded dark:text-gray-300">
                            <div className="font-medium mb-1 dark:text-gray-200">Current category distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                {(() => {
                                    const categoryCounts: Record<string, number> = {};
                                    selectedFeeTypesData.forEach(feeType => {
                                        const categoryName = feeType.document_category?.name || 'Uncategorized';
                                        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
                                    });
                                    
                                    return Object.entries(categoryCounts).map(([category, count]) => (
                                        <li key={category}>{category}: {count} fee type(s)</li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_category')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Category'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}