// components/admin/document-types/DocumentTypesDialogs.tsx
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
import { BulkOperation, BulkEditField, SelectionStats } from '@/types/document-types';

interface DocumentTypesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkActivateDialog: boolean;
    setShowBulkActivateDialog: (show: boolean) => void;
    showBulkDeactivateDialog: boolean;
    setShowBulkDeactivateDialog: (show: boolean) => void;
    showBulkRequiredDialog: boolean;
    setShowBulkRequiredDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    bulkEditField: BulkEditField;
    setBulkEditField: (field: BulkEditField) => void;
    selectedDocumentTypes: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
}

export default function DocumentTypesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkActivateDialog,
    setShowBulkActivateDialog,
    showBulkDeactivateDialog,
    setShowBulkDeactivateDialog,
    showBulkRequiredDialog,
    setShowBulkRequiredDialog,
    isPerformingBulkAction,
    bulkEditValue,
    setBulkEditValue,
    bulkEditField,
    setBulkEditField,
    selectedDocumentTypes,
    handleBulkOperation,
    selectionStats = {
        total: 0,
        active: 0,
        inactive: 0,
        required: 0,
        optional: 0,
        hasFormats: 0,
        totalFileSizeMB: 0,
        maxFileSizeMB: 0,
        categories: {}
    }
}: DocumentTypesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Document Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedDocumentTypes.length} selected document type{selectedDocumentTypes.length !== 1 ? 's' : ''}?
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

            {/* Bulk Activate Dialog */}
            <AlertDialog open={showBulkActivateDialog} onOpenChange={setShowBulkActivateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate Selected Document Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to activate {selectedDocumentTypes.length} selected document type{selectedDocumentTypes.length !== 1 ? 's' : ''}?
                            Activated document types will be available for use.
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
                        <AlertDialogTitle>Deactivate Selected Document Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate {selectedDocumentTypes.length} selected document type{selectedDocumentTypes.length !== 1 ? 's' : ''}?
                            Deactivated document types will not be available for new clearances.
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

            {/* Bulk Required Update Dialog */}
            <AlertDialog open={showBulkRequiredDialog} onOpenChange={setShowBulkRequiredDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Requirement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update requirement status for {selectedDocumentTypes.length} selected document types.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Requirement Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => {
                                    setBulkEditValue(e.target.value);
                                    setBulkEditField('required');
                                }}
                            >
                                <option value="">Select Requirement</option>
                                <option value="required">Required</option>
                                <option value="optional">Optional</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current requirement distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Required: {selectionStats.required} document type(s)</li>
                                <li>Optional: {selectionStats.optional} document type(s)</li>
                                <li>Active: {selectionStats.active} document type(s)</li>
                                <li>Inactive: {selectionStats.inactive} document type(s)</li>
                                <li>With format restrictions: {selectionStats.hasFormats}</li>
                                <li>Max file size: {selectionStats.maxFileSizeMB} MB</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_required')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Requirement'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}