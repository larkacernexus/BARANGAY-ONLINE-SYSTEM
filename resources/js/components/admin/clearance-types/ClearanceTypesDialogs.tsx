// components/admin/clearance-types/ClearanceTypesDialogs.tsx
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import { BulkOperation, BulkEditField, SelectionStats } from '@/types/clearance-types';

interface ClearanceTypesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkActivateDialog: boolean;
    setShowBulkActivateDialog: (show: boolean) => void;
    showBulkDeactivateDialog: boolean;
    setShowBulkDeactivateDialog: (show: boolean) => void;
    showBulkEditDialog: boolean;
    setShowBulkEditDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    bulkEditField: BulkEditField;
    setBulkEditField: (field: BulkEditField) => void;
    bulkEditValue: string | number | boolean;
    setBulkEditValue: (value: string | number | boolean) => void;
    selectedTypes: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
}

export default function ClearanceTypesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkActivateDialog,
    setShowBulkActivateDialog,
    showBulkDeactivateDialog,
    setShowBulkDeactivateDialog,
    showBulkEditDialog,
    setShowBulkEditDialog,
    isPerformingBulkAction,
    bulkEditField,
    setBulkEditField,
    bulkEditValue,
    setBulkEditValue,
    selectedTypes,
    handleBulkOperation,
    selectionStats = {
        active: 0,
        inactive: 0,
        paid: 0,
        free: 0,
        needsApproval: 0,
        onlineOnly: 0,
        totalValue: 0,
        avgProcessingDays: 0
    }
}: ClearanceTypesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Clearance Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedTypes.length} selected clearance type{selectedTypes.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will permanently delete the clearance types
                            and remove them from our servers.
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

            {/* Bulk Activate Dialog */}
            <AlertDialog open={showBulkActivateDialog} onOpenChange={setShowBulkActivateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate Selected Clearance Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to activate {selectedTypes.length} selected clearance type{selectedTypes.length !== 1 ? 's' : ''}?
                            Activated clearance types will be available for use.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('activate')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activating...
                                </>
                            ) : (
                                'Activate Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Deactivate Dialog */}
            <AlertDialog open={showBulkDeactivateDialog} onOpenChange={setShowBulkDeactivateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Selected Clearance Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate {selectedTypes.length} selected clearance type{selectedTypes.length !== 1 ? 's' : ''}?
                            Deactivated clearance types will not be available for new requests.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('deactivate')}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deactivating...
                                </>
                            ) : (
                                'Deactivate Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Edit Dialog */}
            <AlertDialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Edit Selected Items</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update {selectedTypes.length} selected clearance types at once.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Field to Update</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditField}
                                onChange={(e) => {
                                    setBulkEditField(e.target.value as BulkEditField);
                                    setBulkEditValue('');
                                }}
                            >
                                <option value="processing_days">Processing Days</option>
                                <option value="validity_days">Validity Days</option>
                                <option value="fee">Fee Amount</option>
                                <option value="requires_payment">Payment Requirement</option>
                                <option value="requires_approval">Approval Requirement</option>
                                <option value="is_online_only">Online Only</option>
                            </select>
                        </div>
                        <div>
                            <Label>
                                New Value
                                {['requires_payment', 'requires_approval', 'is_online_only'].includes(bulkEditField) && (
                                    <span className="text-sm text-gray-500 ml-2">(Toggle on/off)</span>
                                )}
                            </Label>
                            {['requires_payment', 'requires_approval', 'is_online_only'].includes(bulkEditField) ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <Button
                                        variant={bulkEditValue === true ? "default" : "outline"}
                                        onClick={() => setBulkEditValue(true)}
                                        className="flex-1"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Enable
                                    </Button>
                                    <Button
                                        variant={bulkEditValue === false ? "destructive" : "outline"}
                                        onClick={() => setBulkEditValue(false)}
                                        className="flex-1"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Disable
                                    </Button>
                                </div>
                            ) : (
                                <Input
                                    type="number"
                                    value={bulkEditValue as string | number}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                    min={bulkEditField === 'fee' ? 0 : 1}
                                    placeholder={`Enter new ${bulkEditField.replace('_', ' ')}`}
                                />
                            )}
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">This will affect:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectedTypes.length} clearance types</li>
                                <li>{selectionStats.active} active types</li>
                                <li>{selectionStats.paid} paid types</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update')}
                            disabled={isPerformingBulkAction || bulkEditValue === ''}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}