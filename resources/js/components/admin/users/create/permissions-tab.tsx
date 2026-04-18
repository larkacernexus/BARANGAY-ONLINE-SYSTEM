// components/admin/users/create/permissions-tab.tsx
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Lock } from 'lucide-react';
import type { Permission } from '@/types/admin/users/user-types';

interface PermissionsTabProps {
    formData: any;
    errors: Record<string, string>;
    permissions: Record<string, Permission[]>;
    permissionModules: string[];
    selectedRolePermissions: number[];
    selectedPermissionsCount: number;
    flattenedPermissions: Permission[];
    onTogglePermission: (permissionId: number) => void;
    onToggleAllPermissions: (modulePermissions: Permission[]) => void;
    isSubmitting: boolean;
}

export function PermissionsTab({
    formData,
    errors,
    permissions,
    permissionModules,
    selectedRolePermissions,
    selectedPermissionsCount,
    flattenedPermissions,
    onTogglePermission,
    onToggleAllPermissions,
    isSubmitting
}: PermissionsTabProps) {
    const getPermissionById = (permissionId: number): Permission | undefined => {
        return flattenedPermissions.find(p => p && p.id === permissionId);
    };

    if (permissionModules.length === 0) {
        return (
            <div className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium dark:text-gray-200">No permissions available</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    No permission modules have been configured in the system.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Permissions Summary */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium dark:text-gray-300">Permissions Summary:</span>
                </div>
                <Badge variant="outline" className="dark:border-gray-600">
                    {formData.selected_permissions.length} custom + {selectedRolePermissions.length} from role = {selectedPermissionsCount} total
                </Badge>
            </div>

            {/* Permission Modules */}
            {permissionModules.map((module) => {
                const modulePermissions = permissions[module];
                const safePermissions = Array.isArray(modulePermissions) ? modulePermissions : [];

                if (safePermissions.length === 0) return null;

                const allSelected = safePermissions.every(p => 
                    p && p.id && (formData.selected_permissions.includes(p.id) || selectedRolePermissions.includes(p.id))
                );
                const someSelected = safePermissions.some(p => 
                    p && p.id && formData.selected_permissions.includes(p.id)
                );

                return (
                    <div key={module} className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold dark:text-gray-200 capitalize">
                                    {module.replace(/_/g, ' ')}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                    {safePermissions.length} permissions
                                </Badge>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleAllPermissions(safePermissions)}
                                className="dark:text-gray-400 dark:hover:text-white"
                                disabled={isSubmitting}
                            >
                                {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                            </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {safePermissions.map((permission) => {
                                if (!permission || permission.id === undefined) return null;

                                const permissionId = permission.id;
                                const isFromRole = selectedRolePermissions.includes(permissionId);
                                const isSelected = formData.selected_permissions.includes(permissionId);
                                const isChecked = isSelected || isFromRole;

                                return (
                                    <div
                                        key={permission.id}
                                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                            isFromRole
                                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                                : isSelected
                                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <Checkbox
                                            id={`permission-${permission.id}`}
                                            checked={isChecked}
                                            onCheckedChange={() => onTogglePermission(permissionId)}
                                            disabled={isFromRole || isSubmitting}
                                            className="mt-0.5 dark:border-gray-600"
                                        />
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center justify-between flex-wrap gap-1">
                                                <Label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className={`text-sm font-medium cursor-pointer ${
                                                        isFromRole 
                                                            ? 'text-blue-700 dark:text-blue-400' 
                                                            : isSelected
                                                            ? 'text-green-700 dark:text-green-400'
                                                            : 'dark:text-gray-300'
                                                    }`}
                                                >
                                                    {permission.display_name || permission.name}
                                                </Label>
                                                {isFromRole && (
                                                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                        From Role
                                                    </Badge>
                                                )}
                                                {isSelected && !isFromRole && (
                                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                                                        Custom
                                                    </Badge>
                                                )}
                                            </div>
                                            {permission.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {permission.description}
                                                </p>
                                            )}
                                            <code className="text-xs text-gray-400 dark:text-gray-500">
                                                {permission.name}
                                            </code>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Selected Permissions List */}
            {(formData.selected_permissions.length > 0 || selectedRolePermissions.length > 0) && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium dark:text-gray-300">Selected Permissions:</span>
                        <span className="text-sm dark:text-gray-300">
                            {formData.selected_permissions.length + selectedRolePermissions.length} total
                        </span>
                    </div>
                    <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                        {formData.selected_permissions.map((permissionId: number) => {
                            const permission = getPermissionById(permissionId);
                            if (!permission) return null;

                            return (
                                <span
                                    key={`custom-${permissionId}`}
                                    className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded"
                                >
                                    {permission.display_name || permission.name}
                                </span>
                            );
                        })}
                        {selectedRolePermissions.map((permissionId: number) => {
                            const permission = getPermissionById(permissionId);
                            if (!permission) return null;

                            return (
                                <span
                                    key={`role-${permissionId}`}
                                    className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded"
                                >
                                    {permission.display_name || permission.name}
                                    <span className="ml-1 text-blue-600 dark:text-blue-400">(role)</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-sm dark:text-gray-300 mb-2">About Permissions</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <li><span className="text-blue-600 dark:text-blue-400 font-medium">Blue permissions</span> are inherited from the user's role and cannot be changed</li>
                            <li><span className="text-green-600 dark:text-green-400 font-medium">Green permissions</span> are custom permissions assigned directly to this user</li>
                            <li>Custom permissions override role permissions for fine-grained access control</li>
                            <li>Use "Toggle All" to quickly grant or revoke all permissions in a module</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}