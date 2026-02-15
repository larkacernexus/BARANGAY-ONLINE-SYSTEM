// components/admin/roles/RolesTableView.tsx
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
import { Link, router } from '@inertiajs/react';
import { Shield, Users, MoreVertical, Eye, Edit, Key, Copy, Printer, Trash2, CheckSquare, Square, ChevronUp, ChevronDown } from 'lucide-react';
import { Role } from '@/types';
import { FilterState } from '@/admin-utils/rolesUtils';
import { truncateText, getTruncationLength, getRoleTypeBadgeVariant, formatDate, canDeleteRole } from '@/admin-utils/rolesUtils';

interface RolesTableViewProps {
    roles: Role[];
    isBulkMode: boolean;
    selectedRoles: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (role: Role) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    windowWidth: number;
    toggleRoleExpansion: (roleId: number) => void;
    expandedRole: number | null;
}

export default function RolesTableView({
    roles,
    isBulkMode,
    selectedRoles,
    filtersState,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    windowWidth,
    toggleRoleExpansion,
    expandedRole
}: RolesTableViewProps) {
    
    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && roles.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                    Role Name
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Type
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Users
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                    Description
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Created
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isBulkMode ? 7 : 6} className="text-center py-8 text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Shield className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                    No roles found
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {hasActiveFilters 
                                                        ? 'Try changing your filters or search criteria.'
                                                        : 'Get started by creating a role.'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={onClearFilters}
                                                        className="h-8"
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                )}
                                                <Link href="/roles/create">
                                                    <Button className="h-8">
                                                        Create First Role
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => {
                                    const isSelected = selectedRoles.includes(role.id);
                                    const nameLength = getTruncationLength('name', windowWidth);
                                    const descLength = getTruncationLength('description', windowWidth);
                                    const isExpanded = expandedRole === role.id;
                                    const typeVariant = getRoleTypeBadgeVariant(role.is_system_role);
                                    
                                    return (
                                        <>
                                            <TableRow 
                                                key={role.id} 
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                } ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                                                onClick={(e) => {
                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                        !e.target.closest('a') && 
                                                        !e.target.closest('button') &&
                                                        !e.target.closest('.dropdown-menu-content') &&
                                                        !e.target.closest('input[type="checkbox"]')) {
                                                        onItemSelect(role.id);
                                                    }
                                                }}
                                            >
                                                {isBulkMode && (
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => onItemSelect(role.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            role.is_system_role 
                                                                ? 'bg-purple-100 dark:bg-purple-900' 
                                                                : 'bg-green-100 dark:bg-green-900'
                                                        }`}>
                                                            <Shield className={`h-4 w-4 ${
                                                                role.is_system_role 
                                                                    ? 'text-purple-600 dark:text-purple-400' 
                                                                    : 'text-green-600 dark:text-green-400'
                                                            }`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                                {truncateText(role.name, nameLength)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                                ID: {role.id} • {role.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <Badge 
                                                        variant="outline"
                                                        className={typeVariant.className}
                                                    >
                                                        {typeVariant.text}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                        <span className="truncate">{role.users_count || 0}</span>
                                                        {role.users_count > 0 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                View
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {role.description 
                                                            ? truncateText(role.description, descLength)
                                                            : <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {formatDate(role.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRoleExpansion(role.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/roles/${role.id}`} className="flex items-center cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        <span>View Details</span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                
                                                                <DropdownMenuItem asChild>
                                                                    <Link 
                                                                        href={`/roles/${role.id}/edit`} 
                                                                        className={`flex items-center cursor-pointer ${role.is_system_role ? 'pointer-events-none opacity-50' : ''}`}
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        <span>Edit Role</span>
                                                                        {role.is_system_role && (
                                                                            <span className="ml-auto text-xs text-gray-500">
                                                                                System
                                                                            </span>
                                                                        )}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/roles/${role.id}/permissions`} className="flex items-center cursor-pointer">
                                                                        <Key className="mr-2 h-4 w-4" />
                                                                        <span>Manage Permissions</span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                
                                                                <DropdownMenuSeparator />
                                                                
                                                                <DropdownMenuItem 
                                                                    onClick={() => onCopyToClipboard(role.name, 'Role Name')}
                                                                    className="flex items-center cursor-pointer"
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    <span>Copy Name</span>
                                                                </DropdownMenuItem>
                                                                
                                                                {role.description && (
                                                                    <DropdownMenuItem 
                                                                        onClick={() => onCopyToClipboard(role.description || '', 'Role Description')}
                                                                        className="flex items-center cursor-pointer"
                                                                    >
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        <span>Copy Description</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                
                                                                {isBulkMode && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem 
                                                                            onClick={() => onItemSelect(role.id)}
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
                                                                    className={`flex items-center cursor-pointer ${
                                                                        canDeleteRole(role) 
                                                                            ? 'text-red-600 focus:text-red-700 focus:bg-red-50' 
                                                                            : 'text-gray-400 cursor-not-allowed'
                                                                    }`}
                                                                    onClick={() => canDeleteRole(role) ? onDelete(role) : null}
                                                                    disabled={!canDeleteRole(role)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    <span>Delete Role</span>
                                                                    {!canDeleteRole(role) && (
                                                                        <span className="ml-auto text-xs text-gray-500">
                                                                            {role.is_system_role ? 'System' : 'Has users'}
                                                                        </span>
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            
                                            {/* Expanded Row with Additional Details */}
                                            {isExpanded && (
                                                <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                                                    <TableCell colSpan={isBulkMode ? 7 : 6} className="px-4 py-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Role Details</h4>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Slug:</span>
                                                                        <span className="ml-2 text-sm font-medium">{role.slug}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Permissions:</span>
                                                                        <span className="ml-2 text-sm font-medium">{role.permissions_count || 0}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                                                                        <span className="ml-2 text-sm">{formatDate(role.created_at)}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated:</span>
                                                                        <span className="ml-2 text-sm">{formatDate(role.updated_at)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h4>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Link href={`/roles/${role.id}/permissions`}>
                                                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                                                            <Key className="h-3 w-3 mr-2" />
                                                                            Permissions
                                                                        </Button>
                                                                    </Link>
                                                                    
                                                                    <Link 
                                                                        href={`/roles/${role.id}/edit`}
                                                                    >
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm" 
                                                                            className={`w-full justify-start h-8 ${role.is_system_role ? 'pointer-events-none opacity-50' : ''}`}
                                                                            disabled={role.is_system_role}
                                                                        >
                                                                            <Edit className="h-3 w-3 mr-2" />
                                                                            Edit Role
                                                                            {role.is_system_role && (
                                                                                <span className="ml-auto text-xs text-gray-500">System</span>
                                                                            )}
                                                                        </Button>
                                                                    </Link>
                                                                    
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        className="w-full justify-start h-8"
                                                                        onClick={() => onCopyToClipboard(role.name, 'Role Name')}
                                                                    >
                                                                        <Copy className="h-3 w-3 mr-2" />
                                                                        Copy Name
                                                                    </Button>
                                                                    <Link href={`/roles/${role.id}`}>
                                                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                                                            <Eye className="h-3 w-3 mr-2" />
                                                                            View Details
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                                {role.users_count > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Users with this Role</h4>
                                                                        <div className="bg-white dark:bg-gray-800 border rounded p-2">
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                This role is assigned to <span className="font-medium">{role.users_count} user(s)</span>.
                                                                            </p>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="sm" 
                                                                                className="mt-2 h-7 text-xs"
                                                                                onClick={() => {
                                                                                    router.get('/users', { role: role.id });
                                                                                }}
                                                                            >
                                                                                View Users
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}