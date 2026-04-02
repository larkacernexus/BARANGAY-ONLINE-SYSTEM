// resources/js/components/admin/role-permissions/RolePermissionsDialogs.tsx
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

import { BulkOperation, RolePermission } from '@/types/admin/rolepermissions/rolePermissions.types';

interface RolePermissionsDialogsProps {
    showBulkRevokeDialog: boolean;
    setShowBulkRevokeDialog: (value: boolean) => void;
    showRevokeDialog: RolePermission | null; // Change from any to proper type
    setShowRevokeDialog: (value: RolePermission | null) => void; // Change from any to proper type
    isPerformingBulkAction: boolean;
    selectedPermissions: number[];
    handleBulkOperation: (operation: BulkOperation) => void; // Change from string to BulkOperation
    confirmRevoke: () => void;
    selectionStats: any;
}

export default function RolePermissionsDialogs({
    showBulkRevokeDialog,
    setShowBulkRevokeDialog,
    showRevokeDialog,
    setShowRevokeDialog,
    isPerformingBulkAction,
    selectedPermissions,
    handleBulkOperation,
    confirmRevoke,
    selectionStats
}: RolePermissionsDialogsProps) {
    return (
        <>
            {/* Bulk Revoke Dialog */}
            <AlertDialog open={showBulkRevokeDialog} onOpenChange={setShowBulkRevokeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Permissions</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke {selectedPermissions.length} selected permission(s)? 
                            This action cannot be undone. Users with these roles will lose access to the associated permissions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {selectionStats && (
                        <div className="my-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Affected data:</h4>
                            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                <li>• {selectionStats.uniqueRoles || 0} roles affected</li>
                                <li>• {selectionStats.uniqueModules || 0} modules impacted</li>
                            </ul>
                        </div>
                    )}
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('bulk_revoke')}
                            disabled={isPerformingBulkAction}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPerformingBulkAction ? 'Revoking...' : 'Revoke Permissions'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Single Revoke Dialog */}
            <AlertDialog open={!!showRevokeDialog} onOpenChange={() => setShowRevokeDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke permission 
                            <span className="font-medium text-gray-900 dark:text-white mx-1">
                                "{showRevokeDialog?.permission?.display_name || showRevokeDialog?.permission?.name || 'N/A'}"
                            </span>
                            from role 
                            <span className="font-medium text-gray-900 dark:text-white mx-1">
                                "{showRevokeDialog?.role?.name || 'N/A'}"
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {showRevokeDialog && (
                        <div className="my-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Permission details:</h4>
                            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                <li>• Module: {showRevokeDialog.permission?.module || 'N/A'}</li>
                                <li>• Granted by: {showRevokeDialog.granter?.name || 'System'}</li>
                                <li>• Granted on: {showRevokeDialog.granted_at ? new Date(showRevokeDialog.granted_at).toLocaleString() : 'N/A'}</li>
                            </ul>
                        </div>
                    )}
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRevoke}
                            disabled={isPerformingBulkAction}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPerformingBulkAction ? 'Revoking...' : 'Revoke Permission'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}