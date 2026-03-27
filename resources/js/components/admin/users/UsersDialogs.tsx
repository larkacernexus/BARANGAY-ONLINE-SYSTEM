// components/admin/users/UsersDialogs.tsx
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
import { UsersDialogsProps, UserStatus } from '@/types/admin/users/user-types';

export default function UsersDialogs({
  showBulkDeleteDialog,
  setShowBulkDeleteDialog,
  showBulkStatusDialog,
  setShowBulkStatusDialog,
  showBulkRoleDialog,
  setShowBulkRoleDialog,
  selectedUsers,
  selectedUsersData,
  isPerformingBulkAction,
  bulkEditValue,
  setBulkEditValue,
  roles,
  departments,
  onBulkDeleteConfirm,
  onBulkStatusConfirm,
  onBulkRoleConfirm,
  onBulkDepartmentConfirm
}: UsersDialogsProps) {
  const selectionStats = selectedUsersData.reduce((acc, user) => {
    acc.total++;
    if (user.status === 'active') acc.active++;
    if (user.status === 'inactive') acc.inactive++;
    if (user.role_id === 1) acc.admins++;
    if (user.two_factor_enabled) acc.twoFactorEnabled++;
    return acc;
  }, { total: 0, active: 0, inactive: 0, admins: 0, twoFactorEnabled: 0 });

  const handleStatusConfirm = () => {
    if (onBulkStatusConfirm && bulkEditValue) {
      onBulkStatusConfirm(bulkEditValue as UserStatus);
      setBulkEditValue('');
    }
  };

  const handleRoleConfirm = () => {
    if (onBulkRoleConfirm && bulkEditValue) {
      onBulkRoleConfirm(parseInt(bulkEditValue));
      setBulkEditValue('');
    }
  };

  const handleDepartmentConfirm = () => {
    if (onBulkDepartmentConfirm && bulkEditValue) {
      onBulkDepartmentConfirm(parseInt(bulkEditValue));
      setBulkEditValue('');
    }
  };

  return (
    <>
      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBulkDeleteConfirm}
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
              Update status for {selectedUsers.length} selected users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Status</Label>
              <select 
                className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Current selection stats:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>{selectionStats.total} total users</li>
                <li>{selectionStats.active} active • {selectionStats.inactive} inactive</li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              disabled={isPerformingBulkAction || !bulkEditValue}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPerformingBulkAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Role Update Dialog */}
      <AlertDialog open={showBulkRoleDialog} onOpenChange={setShowBulkRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Update Role</AlertDialogTitle>
            <AlertDialogDescription>
              Update role for {selectedUsers.length} selected users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Role</Label>
              <select 
                className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleConfirm}
              disabled={isPerformingBulkAction || !bulkEditValue}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPerformingBulkAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}