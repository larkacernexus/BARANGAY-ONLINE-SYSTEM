// components/admin/role-permissions/RolePermissionsDialogs.tsx
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
import { Shield, Key, Loader2 } from 'lucide-react';
import { SelectionStats } from '@/admin-utils/rolePermissionsUtils';

interface RolePermissionsDialogsProps {
    showBulkRevokeDialog: boolean;
    setShowBulkRevokeDialog: (show: boolean) => void;
    showRevokeDialog: any;
    setShowRevokeDialog: (permission: any) => void;
    isPerformingBulkAction: boolean;
    selectedPermissions: number[];
    handleBulkOperation: (operation: string) => void;
    confirmRevoke: () => void;
    selectionStats: SelectionStats;
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
                        <AlertDialogTitle>Revoke {selectedPermissions.length} Permissions</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke {selectedPermissions.length} selected permission assignment{selectedPermissions.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                            <br /><br />
                            <div className="text-sm text-gray-600 mt-2">
                                <strong>Impact summary:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>{selectionStats.uniqueRoles} unique roles affected</li>
                                    <li>{selectionStats.uniquePermissions} different permissions</li>
                                    <li>{selectionStats.systemRoles} system roles • {selectionStats.customRoles} custom roles</li>
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('bulk_revoke')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Revoking...
                                </>
                            ) : (
                                `Revoke ${selectedPermissions.length} Permission${selectedPermissions.length !== 1 ? 's' : ''}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Single Revoke Dialog */}
            <AlertDialog open={!!showRevokeDialog} onOpenChange={(open) => !open && setShowRevokeDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke this permission assignment?
                            <br /><br />
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-gray-500" />
                                <strong>{showRevokeDialog?.role?.name}</strong>
                                {showRevokeDialog?.role?.is_system_role ? (
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">System</span>
                                ) : (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Custom</span>
                                )}
                            </div>
                            will lose the permission:
                            <br />
                            <div className="flex items-center gap-2 mt-2">
                                <Key className="h-4 w-4 text-gray-500" />
                                <div>
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                        {showRevokeDialog?.permission?.name}
                                    </code>
                                    <br />
                                    <span className="text-sm text-gray-600">
                                        ({showRevokeDialog?.permission?.display_name})
                                    </span>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Module: {showRevokeDialog?.permission?.module}
                                    </span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRevoke}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Revoke Permission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}