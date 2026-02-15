import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import {
    Key,
    Shield,
    User,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Copy,
    Trash2,
    Eye,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { RolePermission } from '@/admin-utils/rolePermissionsUtils';
import { truncateText, getTruncationLength, formatDate, getModuleBadgeVariant, formatTimeAgo } from '@/admin-utils/rolePermissionsUtils';
import { useState } from 'react';
import { Button } from '@headlessui/react';

interface RolePermissionsGridViewProps {
    permissions: RolePermission[];
    isBulkMode: boolean;
    selectedPermissions: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onRevokePermission: (permission: RolePermission) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    windowWidth: number;
}

// Three Dots Menu Component
function ThreeDotsMenu({ 
    permission,
    isSelected,
    onItemSelect,
    onRevokePermission,
    onCopyToClipboard
}: { 
    permission: RolePermission;
    isSelected: boolean;
    onItemSelect: (id: number) => void;
    onRevokePermission: (permission: RolePermission) => void;
    onCopyToClipboard: (text: string, label: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
            >
                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {open && (
                <>
                    {/* Click outside to close */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setOpen(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                        {permission.permission_id && (
                            <a
                                href={`/admin/permissions/${permission.permission_id}`}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                                onClick={() => setOpen(false)}
                            >
                                <Eye className="h-4 w-4 text-gray-500" />
                                <span>View Permission</span>
                            </a>
                        )}
                        
                        {permission.role_id && (
                            <a
                                href={`/admin/roles/${permission.role_id}`}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                                onClick={() => setOpen(false)}
                            >
                                <Shield className="h-4 w-4 text-gray-500" />
                                <span>View Role</span>
                            </a>
                        )}
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        
                        <button
                            onClick={() => {
                                onCopyToClipboard(`${permission.permission?.display_name || permission.permission?.name} → ${permission.role?.name}`, 'Permission Assignment');
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                            <Copy className="h-4 w-4 text-gray-500" />
                            <span>Copy Assignment</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                onCopyToClipboard(permission.permission?.name || 'N/A', 'Permission Name');
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                            <Copy className="h-4 w-4 text-gray-500" />
                            <span>Copy Permission Name</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                onCopyToClipboard(permission.role?.name || 'N/A', 'Role Name');
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                            <Copy className="h-4 w-4 text-gray-500" />
                            <span>Copy Role Name</span>
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        
                        <button
                            onClick={() => {
                                onItemSelect(permission.id);
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                            {isSelected ? (
                                <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600">Deselect</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 text-gray-500" />
                                    <span>Select for Bulk</span>
                                </>
                            )}
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        
                        <button
                            onClick={() => {
                                onRevokePermission(permission);
                                setOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Revoke Permission</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function RolePermissionsGridView({
    permissions,
    isBulkMode,
    selectedPermissions,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onRevokePermission,
    onCopyToClipboard,
    windowWidth
}: RolePermissionsGridViewProps) {
    
    const emptyState = (
        <EmptyState
            title="No permission assignments found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'No permissions have been assigned to roles yet.'}
            icon={<Key className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
        />
    );

    return (
        <GridLayout
            isEmpty={permissions.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {permissions.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                const permNameLength = getTruncationLength('name', windowWidth);
                const roleNameLength = getTruncationLength('name', windowWidth);
                const moduleBadge = getModuleBadgeVariant(permission.permission?.module || 'Unknown');
                const relativeTime = formatTimeAgo(permission.granted_at);
                
                return (
                    <Card 
                        key={permission.id}
                        className={`overflow-hidden transition-all hover:shadow-md relative ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button')) {
                                onItemSelect(permission.id);
                            }
                        }}
                    >
                        {/* Three dots menu at top-right */}
                        <div className="absolute top-3 right-3 z-10">
                            <ThreeDotsMenu 
                                permission={permission}
                                isSelected={isSelected}
                                onItemSelect={onItemSelect}
                                onRevokePermission={onRevokePermission}
                                onCopyToClipboard={onCopyToClipboard}
                            />
                        </div>

                        <CardContent className="p-4">
                            {/* Header with Checkbox */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        permission.permission?.is_active
                                            ? 'bg-green-100 dark:bg-green-900' 
                                            : 'bg-gray-100 dark:bg-gray-900'
                                    }`}>
                                        <Key className={`h-5 w-5 ${
                                            permission.permission?.is_active
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {truncateText(permission.permission?.display_name || permission.permission?.name || 'N/A', permNameLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {permission.permission?.name || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bulk mode checkbox */}
                                {isBulkMode && (
                                    <div className="flex items-center gap-1 mr-8">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(permission.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Permission to Role Flow */}
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <div className="text-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto ${
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
                                        <span className="text-xs font-medium mt-1 block">
                                            Permission
                                        </span>
                                        <span className="text-xs text-gray-500 truncate block mt-1">
                                            {truncateText(permission.permission?.name || 'N/A', 15)}
                                        </span>
                                    </div>
                                    
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                    
                                    <div className="text-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto ${
                                            permission.role?.is_system_role
                                                ? 'bg-purple-100 dark:bg-purple-900' 
                                                : 'bg-green-100 dark:bg-green-900'
                                        }`}>
                                            <Shield className={`h-4 w-4 ${
                                                permission.role?.is_system_role
                                                    ? 'text-purple-600 dark:text-purple-400' 
                                                    : 'text-green-600 dark:text-green-400'
                                            }`} />
                                        </div>
                                        <span className="text-xs font-medium mt-1 block">
                                            Role
                                        </span>
                                        <span className="text-xs text-gray-500 truncate block mt-1">
                                            {truncateText(permission.role?.name || 'N/A', 15)}
                                        </span>
                                    </div>
                                </div>

                                {/* Role Name */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned to Role</div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <Shield className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(permission.role?.name || 'N/A', roleNameLength)}
                                        </span>
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                                permission.role?.is_system_role
                                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                                                    : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            }`}
                                        >
                                            {permission.role?.is_system_role ? 'System' : 'Custom'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Module */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Module</div>
                                    <div className="flex justify-start">
                                        <Badge 
                                            variant="outline"
                                            className={moduleBadge.className}
                                        >
                                            {moduleBadge.text}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Assigned By */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned By</div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                            <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
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
                                </div>

                                {/* Permission Status */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Permission Status</div>
                                    <div className="flex justify-start">
                                        {permission.permission?.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline</div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Assigned</span>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {formatDate(permission.granted_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-gray-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Relative</span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {relativeTime}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                        <Key className="h-3 w-3" />
                                        <span>ID: {permission.id}</span>
                                    </div>
                                    <div className="text-right">
                                        <Badge 
                                            variant="outline" 
                                            className="text-xs"
                                        >
                                            {permission.role?.users_count || 0} users
                                        </Badge>
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-2">
                                        {permission.permission_id && (
                                            <Link href={`/admin/permissions/${permission.permission_id}`}>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full justify-center h-7 text-xs"
                                                >
                                                    <Key className="h-3 w-3 mr-1" />
                                                    Permission
                                                </Button>
                                            </Link>
                                        )}
                                        {permission.role_id && (
                                            <Link href={`/admin/roles/${permission.role_id}`}>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full justify-center h-7 text-xs"
                                                >
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Role
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}