// components/admin/roles/RolesDialogs.tsx
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
import { Shield, Users, Trash2, Loader2 } from 'lucide-react';
import { BulkOperation, SelectionStats } from '@/types/admin/roles/roles'; // CHANGE THIS IMPORT

interface RolesDialogsProps {
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (show: boolean) => void;
    showBulkTypeDialog: boolean;
    setShowBulkTypeDialog: (show: boolean) => void;
    isPerformingBulkAction: boolean;
    selectedRoles: number[];
    handleBulkOperation: (operation: BulkOperation) => void; // CHANGE THIS LINE
    selectionStats?: SelectionStats; // MAKE THIS OPTIONAL
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
}

export default function RolesDialogs({
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    showBulkTypeDialog,
    setShowBulkTypeDialog,
    isPerformingBulkAction,
    selectedRoles,
    handleBulkOperation,
    selectionStats,
    bulkEditValue,
    setBulkEditValue
}: RolesDialogsProps) {
    return (
        <>
            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Roles</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedRoles.length} selected role{selectedRoles.length !== 1 ? 's' : ''}?
                            This action cannot be undone. System roles or roles with users cannot be deleted.
                            <br /><br />
                            {selectionStats && (
                                <span className="font-medium">
                                    {selectionStats.deletable || 0} out of {selectedRoles.length} roles are deletable.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction || (selectionStats ? selectionStats.deletable === 0 : false)}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                `Delete ${selectionStats?.deletable || 0} Role${selectionStats?.deletable !== 1 ? 's' : ''}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Type Update Dialog */}
            <AlertDialog open={showBulkTypeDialog} onOpenChange={setShowBulkTypeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Change Role Type</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change type for {selectedRoles.length} selected roles. Note: System roles cannot be changed to custom.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Role Type</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Type</option>
                                <option value="custom">Custom Role</option>
                                <option value="system">System Role</option>
                            </select>
                        </div>
                        {selectionStats && (
                            <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                <div className="font-medium mb-1">Current selection stats:</div>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{selectionStats.total} total roles</li>
                                    <li>{selectionStats.systemRoles} system roles</li>
                                    <li>{selectionStats.customRoles} custom roles</li>
                                    <li>{selectionStats.totalUsers} total users assigned</li>
                                    <li>{selectionStats.totalPermissions} total permissions</li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('change_type')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Change Type'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}