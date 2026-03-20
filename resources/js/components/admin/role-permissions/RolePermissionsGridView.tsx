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
    Copy,
    Trash2,
    Eye,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { RolePermission } from '@/admin-utils/rolePermissionsUtils';
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';

// Define helper functions locally or import them
const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const getTruncationLength = (type: 'name' | 'email' | 'description', width: number): number => {
    if (width < 640) return type === 'name' ? 15 : 20;
    if (width < 768) return type === 'name' ? 20 : 25;
    if (width < 1024) return type === 'name' ? 25 : 30;
    return type === 'name' ? 30 : 40;
};

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
};

const getModuleBadgeVariant = (module: string): { text: string; className: string } => {
    const moduleMap: Record<string, { text: string; className: string }> = {
        'users': { text: 'Users', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
        'roles': { text: 'Roles', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
        'permissions': { text: 'Permissions', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
        'settings': { text: 'Settings', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
    };
    return moduleMap[module.toLowerCase()] || { 
        text: module || 'Unknown', 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' 
    };
};

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

// Three Dots Menu Component - Optimized with useCallback
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

    const handleClose = useCallback(() => setOpen(false), []);
    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(prev => !prev);
    }, []);

    const handleCopyAssignment = useCallback(() => {
        onCopyToClipboard(
            `${permission.permission?.display_name || permission.permission?.name || 'Permission'} → ${permission.role?.name || 'Role'}`, 
            'Permission Assignment'
        );
        setOpen(false);
    }, [permission, onCopyToClipboard]);

    const handleCopyPermissionName = useCallback(() => {
        onCopyToClipboard(permission.permission?.name || 'N/A', 'Permission Name');
        setOpen(false);
    }, [permission, onCopyToClipboard]);

    const handleCopyRoleName = useCallback(() => {
        onCopyToClipboard(permission.role?.name || 'N/A', 'Role Name');
        setOpen(false);
    }, [permission, onCopyToClipboard]);

    const handleSelect = useCallback(() => {
        onItemSelect(permission.id);
        setOpen(false);
    }, [permission.id, onItemSelect]);

    const handleRevoke = useCallback(() => {
        onRevokePermission(permission);
        setOpen(false);
    }, [permission, onRevokePermission]);

    return (
        <div className="relative">
            <button
                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                onClick={handleToggle}
                aria-label="Actions menu"
                aria-expanded={open}
            >
                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={handleClose} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-1">
                        {permission.permission_id && (
                            <Link
                                href={`/admin/permissions/${permission.permission_id}`}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                                onClick={handleClose}
                            >
                                <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span>View Permission</span>
                            </Link>
                        )}
                        
                        {permission.role_id && (
                            <Link
                                href={`/admin/roles/${permission.role_id}`}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                                onClick={handleClose}
                            >
                                <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span>View Role</span>
                            </Link>
                        )}
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        
                        <button
                            onClick={handleCopyAssignment}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                            <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Copy Assignment</span>
                        </button>
                        
                        <button
                            onClick={handleCopyPermissionName}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                            <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Copy Permission Name</span>
                        </button>
                        
                        <button
                            onClick={handleCopyRoleName}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                            <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Copy Role Name</span>
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        
                        <button
                            onClick={handleSelect}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3"
                        >
                            {isSelected ? (
                                <>
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-green-600 dark:text-green-400">Deselect</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-700 dark:text-gray-300">Select for Bulk</span>
                                </>
                            )}
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        
                        <button
                            onClick={handleRevoke}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
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
    
    const emptyState = useMemo(() => (
        <EmptyState
            title="No permission assignments found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'No permissions have been assigned to roles yet.'}
            icon={<Key className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
        />
    ), [hasActiveFilters, onClearFilters]);

    // Pre-calculate truncation lengths for performance
    const truncationLengths = useMemo(() => ({
        name: getTruncationLength('name', windowWidth),
        description: getTruncationLength('description', windowWidth)
    }), [windowWidth]);

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
                const permissionName = permission.permission?.display_name || permission.permission?.name || 'N/A';
                const permissionCode = permission.permission?.name || 'N/A';
                const roleName = permission.role?.name || 'N/A';
                const moduleBadge = getModuleBadgeVariant(permission.permission?.module || 'Unknown');
                const relativeTime = formatTimeAgo(permission.granted_at);
                const granterName = permission.granter?.name || 'System';
                const granterEmail = permission.granter?.email;
                
                return (
                    <Card 
                        key={permission.id}
                        className={`overflow-hidden transition-all hover:shadow-md relative bg-white dark:bg-gray-950 border ${
                            isSelected 
                                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button')) {
                                onItemSelect(permission.id);
                            }
                        }}
                    >
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
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3 pr-8">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        permission.permission?.is_active
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                        <Key className={`h-5 w-5 ${
                                            permission.permission?.is_active
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {truncateText(permissionName, truncationLengths.name)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {truncateText(permissionCode, truncationLengths.description)}
                                        </div>
                                    </div>
                                </div>
                                
                                {isBulkMode && (
                                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(permission.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Compact Permission to Role Flow */}
                            <div className="flex items-center justify-between gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                                <div className="flex items-center gap-1 min-w-0">
                                    <Badge variant="outline" className="text-xs bg-white dark:bg-gray-900 border-green-200 dark:border-green-800">
                                        <Key className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                                        <span className="truncate max-w-[80px]">{truncateText(permission.permission?.name || 'N/A', 10)}</span>
                                    </Badge>
                                    <ArrowRight className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0 mx-1" />
                                    <Badge variant="outline" className="text-xs bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
                                        <Shield className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />
                                        <span className="truncate max-w-[80px]">{truncateText(permission.role?.name || 'N/A', 10)}</span>
                                    </Badge>
                                </div>
                                <Badge 
                                    variant={permission.role?.is_system_role ? 'default' : 'secondary'}
                                    className="text-xs flex-shrink-0"
                                >
                                    {permission.role?.is_system_role ? 'System' : 'Custom'}
                                </Badge>
                            </div>

                            {/* Two-column layout for better space utilization */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Left Column */}
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Module</div>
                                        <Badge variant="outline" className={moduleBadge.className}>
                                            {moduleBadge.text}
                                        </Badge>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</div>
                                        {permission.permission?.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span>{formatDate(permission.granted_at)}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Relative</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                                            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span>{relativeTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Granter Info - Compact */}
                            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                        <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {granterName}
                                        </div>
                                        {granterEmail && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {granterEmail}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300 flex-shrink-0">
                                        {permission.role?.users_count || 0} users
                                    </Badge>
                                </div>
                            </div>

                            {/* Quick Action Buttons - Compact */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {permission.permission_id && (
                                    <Link href={`/admin/permissions/${permission.permission_id}`} className="w-full">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full justify-center h-7 text-xs border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <Key className="h-3 w-3 mr-1" />
                                            Permission
                                        </Button>
                                    </Link>
                                )}
                                {permission.role_id && (
                                    <Link href={`/admin/roles/${permission.role_id}`} className="w-full">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full justify-center h-7 text-xs border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <Shield className="h-3 w-3 mr-1" />
                                            Role
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {/* Permission ID - Minimal */}
                            <div className="mt-2 text-xs text-gray-400 dark:text-gray-600 text-right">
                                ID: {permission.id}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}