// components/admin/roles/create/permissions-tab.tsx
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Key, Plus, Minus, Trash2, Lock, Shield } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    module: string;
    is_active: boolean;
}

interface PermissionsTabProps {
    formData: any;
    errors: Record<string, string>;
    permissions: Record<string, Permission[]>;
    groupedPermissions: Record<string, Permission[]>;
    availableModules: string[];
    selectedModule: string;
    searchTerm: string;
    localPermissions: number[];
    filteredPermissions: Permission[];
    isAllSelected: (module?: string) => boolean;
    isAnySelected: (module?: string) => boolean;
    onModuleChange: (module: string) => void;
    onSearchChange: (search: string) => void;
    onPermissionToggle: (permissionId: number) => void;
    onSelectAll: (module?: string) => void;
    onDeselectAll: (module?: string) => void;
    isSubmitting: boolean;
    isSystemRole?: boolean;
}

export function PermissionsTab({
    formData,
    errors,
    permissions,
    groupedPermissions,
    availableModules,
    selectedModule,
    searchTerm,
    localPermissions,
    filteredPermissions,
    isAllSelected,
    isAnySelected,
    onModuleChange,
    onSearchChange,
    onPermissionToggle,
    onSelectAll,
    onDeselectAll,
    isSubmitting,
    isSystemRole = false
}: PermissionsTabProps) {
    const getModuleColor = (module: string) => {
        const colors: Record<string, string> = {
            'admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'user': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'content': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'settings': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return colors[module.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    const getSelectedCount = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissionIds = groupedPermissions[module].map(p => p.id);
            return localPermissions.filter(id => modulePermissionIds.includes(id)).length;
        }
        return localPermissions.length;
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <Select value={selectedModule} onValueChange={onModuleChange} disabled={isSubmitting}>
                    <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="Filter by module" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {availableModules.map(module => (
                            <SelectItem key={module} value={module} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                {module === 'all' ? 'All Modules' : module}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Selected Count Summary */}
            {localPermissions.length > 0 && !isSystemRole && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            {localPermissions.length} permission(s) selected
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeselectAll()}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            disabled={localPermissions.length === 0 || isSubmitting}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear All
                        </Button>
                    </div>
                </div>
            )}

            {/* System Role Notice */}
            {isSystemRole && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm text-amber-800 dark:text-amber-300">
                            System role permissions cannot be modified
                        </span>
                    </div>
                </div>
            )}

            {/* Permissions List */}
            <div className="border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {filteredPermissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Key className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No permissions found</p>
                        <p className="text-sm mt-1">Try changing your search or filter criteria.</p>
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                            const selectedCount = getSelectedCount(module);
                            const allSelected = isAllSelected(module);
                            const anySelected = isAnySelected(module);
                            
                            return (
                                <div key={module} className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getModuleColor(module)}>
                                                {module}
                                            </Badge>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {modulePermissions.length} permissions
                                            </span>
                                            {selectedCount > 0 && (
                                                <Badge variant="outline" className="text-xs dark:border-gray-600">
                                                    {selectedCount} selected
                                                </Badge>
                                            )}
                                        </div>
                                        {!isSystemRole && (
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onSelectAll(module)}
                                                    disabled={allSelected || isSubmitting}
                                                    className="h-7 text-xs dark:text-gray-400 dark:hover:text-white"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Select All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDeselectAll(module)}
                                                    disabled={!anySelected || isSubmitting}
                                                    className="h-7 text-xs dark:text-gray-400 dark:hover:text-white"
                                                >
                                                    <Minus className="h-3 w-3 mr-1" />
                                                    Clear
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        {modulePermissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                                    localPermissions.includes(permission.id)
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={localPermissions.includes(permission.id)}
                                                    onCheckedChange={() => onPermissionToggle(permission.id)}
                                                    disabled={isSystemRole || isSubmitting}
                                                    className="mt-0.5 dark:border-gray-600"
                                                />
                                                <div className="flex-1">
                                                    <Label
                                                        htmlFor={`permission-${permission.id}`}
                                                        className={`font-medium cursor-pointer ${
                                                            localPermissions.includes(permission.id) 
                                                                ? 'dark:text-indigo-300' 
                                                                : 'dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {permission.display_name}
                                                    </Label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                                        {permission.name}
                                                    </p>
                                                    {permission.description && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            {permission.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        permission.is_active
                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {permission.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Help text */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-sm dark:text-gray-300 mb-2">About Permissions</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <li>Permissions control access to specific features and actions</li>
                            <li>Only assign permissions that are necessary for the role</li>
                            <li>Inactive permissions are disabled and cannot be assigned</li>
                            {isSystemRole && <li>System role permissions are fixed and cannot be changed</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}