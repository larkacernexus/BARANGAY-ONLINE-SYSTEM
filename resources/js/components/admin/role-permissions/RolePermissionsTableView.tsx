// components/admin/role-permissions/RolePermissionsTableView.tsx

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { Key, User, Shield, MoreVertical, Eye, Copy, Trash2, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { RolePermission, FilterState } from '@/types/admin/rolepermissions/rolePermissions.types';
import { truncateText, getTruncationLength, formatDate, getModuleBadgeVariant, formatTimeAgo } from '@/admin-utils/rolePermissionsUtils';
import React from 'react';

interface RolePermissionsTableViewProps {
    permissions: RolePermission[];
    isBulkMode: boolean;
    selectedPermissions: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onRevokePermission: (permission: RolePermission) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    windowWidth: number;
    expandedPermission?: number | null;
    togglePermissionExpansion?: (id: number) => void;
}

export default function RolePermissionsTableView({
    permissions,
    isBulkMode,
    selectedPermissions,
    filtersState,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onRevokePermission,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    windowWidth,
    expandedPermission,
    togglePermissionExpansion,
}: RolePermissionsTableViewProps) {
    
    const permNameLength = getTruncationLength('name', windowWidth);
    const roleNameLength = getTruncationLength('name', windowWidth);
    
    if (permissions.length === 0) {
        return (
            <div className="text-center py-12">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No permission assignments found</h3>
                <p className="text-gray-500">
                    {hasActiveFilters 
                        ? 'Try adjusting your filters to see more results'
                        : 'No permissions have been assigned to roles yet'}
                </p>
                {hasActiveFilters && (
                    <Button onClick={onClearFilters} variant="outline" className="mt-4">
                        Clear Filters
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader className="bg-gray-50 dark:bg-gray-900">
                            <TableRow>
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && permissions.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[50px]">
                                    <span className="sr-only">Expand</span>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                    Permission
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                    Role
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Module
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                    Assigned By
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Assigned
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {permissions.map((permission) => {
                                const isSelected = selectedPermissions.includes(permission.id);
                                const isExpanded = expandedPermission === permission.id;
                                const moduleBadge = getModuleBadgeVariant(permission.permission?.module || 'Unknown');
                                
                                return (
                                    <React.Fragment key={permission.id}>
                                        <TableRow 
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                            }`}
                                            onClick={(e) => {
                                                if (isBulkMode && e.target instanceof HTMLElement && 
                                                    !e.target.closest('a') && 
                                                    !e.target.closest('button') &&
                                                    !e.target.closest('.dropdown-menu-content') &&
                                                    !e.target.closest('input[type="checkbox"]')) {
                                                    onItemSelect(permission.id);
                                                }
                                            }}
                                        >
                                            {isBulkMode && (
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => onItemSelect(permission.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}
                                            
                                            <TableCell className="px-4 py-3">
                                                {togglePermissionExpansion && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => togglePermissionExpansion(permission.id)}
                                                        className="h-8 w-8 p-0"
                                                        disabled={isBulkMode}
                                                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        permission.permission?.is_active
                                                            ? 'bg-green-100 dark:bg-green-900' 
                                                            : 'bg-gray-100 dark:bg-gray-900'
                                                    }`}>
                                                        <Key className={`h-4 w-4 ${
                                                            permission.permission?.is_active
                                                                ? 'text-green-600 dark:text-green-400' 
                                                                : 'text-gray-600 dark:text-gray-400'
                                                        }`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                                            {truncateText(permission.permission?.display_name || permission.permission?.name || 'N/A', permNameLength)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                            {permission.permission?.name || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        permission.role?.is_system_role
                                                            ? 'bg-purple-100 dark:bg-purple-900' 
                                                            : 'bg-green-100 dark:bg-green-900'
                                                    }`}>
                                                        <Shield className={`h-3 w-3 ${
                                                            permission.role?.is_system_role
                                                                ? 'text-purple-600 dark:text-purple-400' 
                                                                : 'text-green-600 dark:text-green-400'
                                                        }`} />
                                                    </div>
                                                    <span className="truncate">
                                                        {truncateText(permission.role?.name || 'N/A', roleNameLength)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Badge 
                                                    variant="outline"
                                                    className={moduleBadge.className}
                                                >
                                                    {moduleBadge.text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                                                        <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {permission.granter?.name || 'System'}
                                                        </div>
                                                        {permission.granter?.email && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {permission.granter.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(permission.granted_at)}
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        {formatTimeAgo(permission.granted_at)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                <div className="flex items-center justify-end gap-1">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            {permission.permission_id && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/role-permissions/${permission.permission_id}`} className="flex items-center cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        <span>View Permission</span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            
                                                            {permission.role_id && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/roles/${permission.role_id}`} className="flex items-center cursor-pointer">
                                                                        <Shield className="mr-2 h-4 w-4" />
                                                                        <span>View Role</span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            
                                                            <DropdownMenuSeparator />
                                                            
                                                            <DropdownMenuItem 
                                                                onClick={() => onCopyToClipboard(`${permission.permission?.display_name || permission.permission?.name} → ${permission.role?.name}`, 'Permission Assignment')}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Copy Assignment</span>
                                                            </DropdownMenuItem>
                                                            
                                                            <DropdownMenuItem 
                                                                onClick={() => onCopyToClipboard(permission.permission?.name || 'N/A', 'Permission Name')}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Copy Permission Name</span>
                                                            </DropdownMenuItem>
                                                            
                                                            <DropdownMenuItem 
                                                                onClick={() => onCopyToClipboard(permission.role?.name || 'N/A', 'Role Name')}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Copy Role Name</span>
                                                            </DropdownMenuItem>
                                                            
                                                            {isBulkMode && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => onItemSelect(permission.id)}
                                                                        className="flex items-center cursor-pointer"
                                                                    >
                                                                        {isSelected ? (
                                                                            <>
                                                                                <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                                <span className="text-green-600">Deselect</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Square className="mr-2 h-4 w-4" />
                                                                                <span>Select for Bulk</span>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            
                                                            <DropdownMenuSeparator />
                                                            
                                                            <DropdownMenuItem 
                                                                onClick={() => onRevokePermission(permission)}
                                                                className="flex items-center cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Revoke Permission</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Expanded Row for Additional Details */}
                                        {isExpanded && togglePermissionExpansion && (
                                            <TableRow className="bg-gray-50 dark:bg-gray-900/20">
                                                <TableCell colSpan={isBulkMode ? 8 : 7} className="p-0">
                                                    <div className="p-4 pl-12 border-t">
                                                        <h4 className="font-medium mb-3">Additional Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-500">Permission Code</div>
                                                                <div className="text-sm mt-1">{permission.permission?.name || 'N/A'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-500">Description</div>
                                                                <div className="text-sm mt-1">
                                                                    {permission.permission?.description || 'No description available'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-500">Status</div>
                                                                <Badge variant={permission.permission?.is_active ? 'default' : 'secondary'} className="mt-1">
                                                                    {permission.permission?.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}