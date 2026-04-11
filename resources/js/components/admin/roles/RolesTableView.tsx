// components/admin/roles/RolesTableView.tsx
import { memo, useCallback, useMemo } from 'react';
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
import { Shield, Users, MoreVertical, Eye, Edit, Key, Copy, Printer, Trash2, CheckSquare, Square, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { Role } from '@/types/admin/roles/roles';
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

// Extracted empty state component for better readability
const EmptyState = memo(({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
    <TableRow>
        <TableCell colSpan={7} className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                    <Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No roles found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        {hasActiveFilters 
                            ? 'No roles match your current filters. Try adjusting your search criteria.'
                            : 'Get started by creating your first role.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            size="sm"
                        >
                            Clear Filters
                        </Button>
                    )}
                    <Link href="/admin/roles/create">
                        <Button size="sm">
                            Create First Role
                        </Button>
                    </Link>
                </div>
            </div>
        </TableCell>
    </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Extracted role row component for better performance
// Extracted role row component for better performance
const RoleRow = memo(({
    role,
    isBulkMode,
    isSelected,
    isExpanded,
    windowWidth,
    onItemSelect,
    onCopyToClipboard,
    onDelete,
    toggleRoleExpansion,
}: {
    role: Role;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    windowWidth: number;
    onItemSelect: (id: number) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onDelete: (role: Role) => void;
    toggleRoleExpansion: (roleId: number) => void;
}) => {
    const nameLength = getTruncationLength('name', windowWidth);
    const descLength = getTruncationLength('description', windowWidth);
    const typeVariant = getRoleTypeBadgeVariant(role.is_system_role);
    const deletable = canDeleteRole(role);
    const deleteDisabledReason = role.is_system_role ? 'System role cannot be deleted' : 'Role has assigned users';
    
    // Safe access with fallback values
    const usersCount = role.users_count ?? 0;
    const permissionsCount = role.permissions_count ?? 0;
    const hasUsers = usersCount > 0;

    const handleRowClick = useCallback((e: React.MouseEvent) => {
        if (isBulkMode && 
            e.target instanceof HTMLElement && 
            !e.target.closest('a') && 
            !e.target.closest('button') &&
            !e.target.closest('[data-dropdown-menu]') &&
            !e.target.closest('input[type="checkbox"]')) {
            onItemSelect(role.id);
        }
    }, [isBulkMode, onItemSelect, role.id]);

    return (
        <>
            <TableRow 
                className={`
                    transition-colors duration-150
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                    ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/30' : ''}
                `}
                onClick={handleRowClick}
            >
                {isBulkMode && (
                    <TableCell className="px-4 py-3 text-center w-12">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onItemSelect(role.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select role ${role.name}`}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                    </TableCell>
                )}
                
                <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className={`
                            h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0
                            ${role.is_system_role 
                                ? 'bg-purple-100 dark:bg-purple-900/30' 
                                : 'bg-green-100 dark:bg-green-900/30'
                            }
                        `}>
                            <Shield className={`h-4.5 w-4.5 ${
                                role.is_system_role 
                                    ? 'text-purple-600 dark:text-purple-400' 
                                    : 'text-green-600 dark:text-green-400'
                            }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate" title={role.name}>
                                {truncateText(role.name, nameLength)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                ID: {role.id} • {role.slug}
                            </div>
                        </div>
                    </div>
                </TableCell>
                
                <TableCell className="px-4 py-3">
                    <Badge 
                        variant="outline"
                        className={`${typeVariant.className} whitespace-nowrap`}
                    >
                        {typeVariant.text}
                    </Badge>
                </TableCell>
                
                <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{usersCount}</span>
                        {hasUsers && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get('/admin/users', { role: role.id });
                                }}
                            >
                                View Users
                            </Button>
                        )}
                    </div>
                </TableCell>
                
                <TableCell className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={role.description || ''}>
                        {role.description 
                            ? truncateText(role.description, descLength)
                            : <span className="text-gray-400 dark:text-gray-500 italic">No description</span>
                        }
                    </div>
                </TableCell>
                
                <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(role.created_at)}
                    </div>
                </TableCell>
                
                <TableCell className="px-4 py-3 text-right sticky right-0 bg-inherit">
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRoleExpansion(role.id)}
                            className="h-8 w-8 p-0"
                            aria-label={isExpanded ? 'Show less details' : 'Show more details'}
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
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Open role actions menu"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56" data-dropdown-menu>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/roles/${role.id}`} className="flex items-center cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>View Details</span>
                                    </Link>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem asChild>
                                    <Link 
                                        href={`/admin/roles/${role.id}/edit`} 
                                        className={`flex items-center cursor-pointer ${role.is_system_role ? 'opacity-50 pointer-events-none' : ''}`}
                                        aria-disabled={role.is_system_role}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit Role</span>
                                        {role.is_system_role && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                System
                                            </span>
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/roles/${role.id}/permissions`} className="flex items-center cursor-pointer">
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
                                    <span>Copy Role Name</span>
                                </DropdownMenuItem>
                                
                                {role.description && (
                                    <DropdownMenuItem 
                                        onClick={() => onCopyToClipboard(role.description!, 'Role Description')}
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
                                                    <span>Select for Bulk Actions</span>
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                    className={`
                                        flex items-center cursor-pointer
                                        ${deletable 
                                            ? 'text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50' 
                                            : 'text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                    onClick={() => deletable && onDelete(role)}
                                    disabled={!deletable}
                                    title={!deletable ? deleteDisabledReason : undefined}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete Role</span>
                                    {!deletable && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {role.is_system_role ? 'System' : 'Has users'}
                                        </span>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
            </TableRow>
            
            {/* Expanded Row */}
            {isExpanded && (
                <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                    <TableCell colSpan={isBulkMode ? 7 : 6} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start">
                                        <span className="text-gray-600 dark:text-gray-400 w-28">Slug:</span>
                                        <span className="font-mono text-xs">{role.slug}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-600 dark:text-gray-400 w-28">Permissions:</span>
                                        <span className="font-medium">{permissionsCount}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-600 dark:text-gray-400 w-28">Created:</span>
                                        <span>{formatDate(role.created_at)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-600 dark:text-gray-400 w-28">Last Updated:</span>
                                        <span>{formatDate(role.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href={`/admin/roles/${role.id}/permissions`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <Key className="h-3.5 w-3.5 mr-2" />
                                            Manage Permissions
                                        </Button>
                                    </Link>
                                    
                                    <Link href={`/admin/roles/${role.id}/edit`}>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className={`w-full justify-start ${role.is_system_role ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={role.is_system_role}
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-2" />
                                            Edit Role
                                        </Button>
                                    </Link>
                                    
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start"
                                        onClick={() => onCopyToClipboard(role.name, 'Role Name')}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        Copy Name
                                    </Button>
                                    
                                    <Link href={`/admin/roles/${role.id}`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <Eye className="h-3.5 w-3.5 mr-2" />
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                                
                                {hasUsers && (
                                    <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Assigned to <span className="font-semibold text-gray-900 dark:text-white">{usersCount}</span> user(s)
                                                </p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-7 text-xs"
                                                onClick={() => router.get('/admin/users', { role: role.id })}
                                            >
                                                View Users →
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
});

RoleRow.displayName = 'RoleRow';

// Main component
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
    
    const selectedSet = useMemo(
        () => new Set(selectedRoles),
        [selectedRoles]
    );
    
    const handleSelectAll = useCallback(() => {
        onSelectAllOnPage();
    }, [onSelectAllOnPage]);
    
    const allSelected = roles.length > 0 && roles.every(role => selectedSet.has(role.id));
    
    return (
        <div className="overflow-x-auto border rounded-lg">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                            <TableRow className="border-b">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all roles on current page"
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role Name
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Users
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {roles.length === 0 ? (
                                <EmptyState 
                                    hasActiveFilters={hasActiveFilters} 
                                    onClearFilters={onClearFilters} 
                                />
                            ) : (
                                roles.map((role) => (
                                    <RoleRow
                                        key={role.id}
                                        role={role}
                                        isBulkMode={isBulkMode}
                                        isSelected={selectedSet.has(role.id)}
                                        isExpanded={expandedRole === role.id}
                                        windowWidth={windowWidth}
                                        onItemSelect={onItemSelect}
                                        onCopyToClipboard={onCopyToClipboard}
                                        onDelete={onDelete}
                                        toggleRoleExpansion={toggleRoleExpansion}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}