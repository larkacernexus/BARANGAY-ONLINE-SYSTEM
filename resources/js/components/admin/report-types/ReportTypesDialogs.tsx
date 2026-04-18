// components/admin/report-types/ReportTypesDialogs.tsx
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
import { BulkOperation, BulkEditField, SelectionStats } from '@/types/admin/report-types/report-types';

interface ReportTypesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkActivateDialog: boolean;
    setShowBulkActivateDialog: (show: boolean) => void;
    showBulkDeactivateDialog: boolean;
    setShowBulkDeactivateDialog: (show: boolean) => void;
    showBulkPriorityDialog: boolean;
    setShowBulkPriorityDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    bulkEditField: BulkEditField;
    setBulkEditField: (field: BulkEditField) => void;
    selectedReportTypes: number[];
    handleBulkOperation: (operation: BulkOperation) => void;
    selectionStats?: SelectionStats;
}

export default function ReportTypesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkActivateDialog,
    setShowBulkActivateDialog,
    showBulkDeactivateDialog,
    setShowBulkDeactivateDialog,
    showBulkPriorityDialog,
    setShowBulkPriorityDialog,
    isPerformingBulkAction,
    bulkEditValue,
    setBulkEditValue,
    bulkEditField,
    setBulkEditField,
    selectedReportTypes,
    handleBulkOperation,
    selectionStats = {
        total: 0,
        active: 0,
        inactive: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        requiresImmediateAction: 0,
        requiresEvidence: 0,
        allowsAnonymous: 0,
        totalResolutionDays: 0
    }
}: ReportTypesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Report Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedReportTypes.length} selected report type{selectedReportTypes.length !== 1 ? 's' : ''}?
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
                        <AlertDialogTitle>Activate Selected Report Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to activate {selectedReportTypes.length} selected report type{selectedReportTypes.length !== 1 ? 's' : ''}?
                            Activated report types will be available for use.
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
                        <AlertDialogTitle>Deactivate Selected Report Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate {selectedReportTypes.length} selected report type{selectedReportTypes.length !== 1 ? 's' : ''}?
                            Deactivated report types will not be available for new reports.
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

            {/* Bulk Priority Update Dialog */}
            <AlertDialog open={showBulkPriorityDialog} onOpenChange={setShowBulkPriorityDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Priority</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update priority for {selectedReportTypes.length} selected report types.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Priority Level</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => {
                                    setBulkEditValue(e.target.value);
                                    setBulkEditField('priority');
                                }}
                            >
                                <option value="">Select Priority</option>
                                <option value="1">Critical (Level 1)</option>
                                <option value="2">High (Level 2)</option>
                                <option value="3">Medium (Level 3)</option>
                                <option value="4">Low (Level 4)</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current priority distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Critical: {selectionStats.critical} report type(s)</li>
                                <li>High: {selectionStats.high} report type(s)</li>
                                <li>Medium: {selectionStats.medium} report type(s)</li>
                                <li>Low: {selectionStats.low} report type(s)</li>
                                <li>Total resolution days: {selectionStats.totalResolutionDays}</li>
                                <li>Requires immediate action: {selectionStats.requiresImmediateAction}</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_priority')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Priority'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}