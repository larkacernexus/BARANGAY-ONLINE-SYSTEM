// components/admin/role-permissions/RolePermissionsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    ArrowRight,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    CheckSquare,
    Square,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { RolePermission } from '@/admin-utils/rolePermissionsUtils';
import { useState, useCallback, useMemo, useEffect } from 'react';

interface RolePermissionsGridViewProps {
    permissions: RolePermission[];
    isBulkMode: boolean;
    selectedPermissions: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onRevokePermission: (permission: RolePermission) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    windowWidth?: number;
}

// Helper functions
const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

const getModuleColor = (module: string): string => {
    const moduleMap: Record<string, string> = {
        'users': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'roles': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'permissions': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'settings': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'residents': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
        'households': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        'clearances': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'fees': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'payments': 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
        'reports': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'announcements': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    };
    return moduleMap[module.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

const getModuleDisplay = (module: string): string => {
    const moduleMap: Record<string, string> = {
        'users': 'Users',
        'roles': 'Roles',
        'permissions': 'Permissions',
        'settings': 'Settings',
        'residents': 'Residents',
        'households': 'Households',
        'clearances': 'Clearances',
        'fees': 'Fees',
        'payments': 'Payments',
        'reports': 'Reports',
        'announcements': 'Announcements',
    };
    return moduleMap[module.toLowerCase()] || module || 'Unknown';
};

const getStatusColor = (isActive: boolean): string => {
    return isActive 
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
};

export default function RolePermissionsGridView({
    permissions,
    isBulkMode,
    selectedPermissions,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onRevokePermission,
    onCopyToClipboard,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: RolePermissionsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);
    
    // Adjust text truncation based on grid columns
    const truncationLengths = useMemo(() => {
        if (gridCols >= 4) return { name: 25, code: 30 };
        if (gridCols === 3) return { name: 22, code: 25 };
        if (gridCols === 2) return { name: 20, code: 22 };
        return { name: 18, code: 20 };
    }, [gridCols]);

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (permissionId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(permissionId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedPermissions), [selectedPermissions]);

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

    // Early return for empty state
    if (permissions.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {permissions.map((permission) => {
                const isSelected = selectedSet.has(permission.id);
                const isExpanded = expandedId === permission.id;
                const permissionName = permission.permission?.display_name || permission.permission?.name || 'N/A';
                const permissionCode = permission.permission?.name || 'N/A';
                const roleName = permission.role?.name || 'N/A';
                const moduleName = permission.permission?.module || 'Unknown';
                const moduleColor = getModuleColor(moduleName);
                const moduleDisplay = getModuleDisplay(moduleName);
                const relativeTime = formatTimeAgo(permission.granted_at);
                const granterName = permission.granter?.name || 'System';
                const granterEmail = permission.granter?.email;
                const isPermissionActive = permission.permission?.is_active ?? true;
                
                return (
                    <Card 
                        key={permission.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(permission.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isPermissionActive
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        <Key className={`h-5 w-5 ${
                                            isPermissionActive
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-red-600 dark:text-red-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(permissionName, truncationLengths.name)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {truncateText(permissionCode, truncationLengths.code)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(permission.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            {permission.permission_id && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/permissions/${permission.permission_id}`} className="flex items-center">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Permission
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {permission.role_id && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/roles/${permission.role_id}`} className="flex items-center">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        View Role
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={() => {
                                                onCopyToClipboard(
                                                    `${permissionName} → ${roleName}`, 
                                                    'Permission Assignment'
                                                );
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Assignment
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => {
                                                onCopyToClipboard(permissionCode, 'Permission Name');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Permission
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => {
                                                onCopyToClipboard(roleName, 'Role Name');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Role
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(permission.id)}>
                                                        {isSelected ? (
                                                            <>
                                                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="h-4 w-4 mr-2" />
                                                                Select for Bulk
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem 
                                                className="text-red-600 dark:text-red-400"
                                                onClick={() => onRevokePermission(permission)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Revoke Permission
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(isPermissionActive)}`}
                                >
                                    {isPermissionActive ? 
                                        <CheckCircle className="h-3 w-3 mr-1" /> : 
                                        <XCircle className="h-3 w-3 mr-1" />
                                    }
                                    {isPermissionActive ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${moduleColor}`}
                                >
                                    {moduleDisplay}
                                </Badge>
                                
                                {permission.role?.is_system_role && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                        System Role
                                    </Badge>
                                )}
                            </div>

                            {/* Permission to Role Flow */}
                            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-900">
                                    <Key className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                                    {truncateText(permissionCode, 12)}
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-900">
                                    <Shield className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />
                                    {truncateText(roleName, 12)}
                                </Badge>
                            </div>

                            {/* Primary Info */}
                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>Assigned: {formatDate(permission.granted_at)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{relativeTime}</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <User className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">{granterName}</span>
                                </div>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(permission.id, e)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {/* Granter Details */}
                                    {granterEmail && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Granted By:</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{granterName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{granterEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Role Users Count */}
                                    {permission.role?.users_count !== undefined && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Users with this role:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 font-medium">
                                                {permission.role.users_count}
                                            </span>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-1">
                                        {permission.permission_id && (
                                            <Link
                                                href={`/admin/permissions/${permission.permission_id}`}
                                                className="flex-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button className="w-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1.5 px-3 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1">
                                                    <Key className="h-3 w-3" />
                                                    View Permission
                                                </button>
                                            </Link>
                                        )}
                                        {permission.role_id && (
                                            <Link
                                                href={`/admin/roles/${permission.role_id}`}
                                                className="flex-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button className="w-full text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-1.5 px-3 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    View Role
                                                </button>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Permission ID */}
                                    <div className="text-xs text-gray-400 dark:text-gray-600">
                                        Permission ID: {permission.id}
                                    </div>

                                    {/* Revoke button in expanded view */}
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="w-full text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-1.5 px-3 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRevokePermission(permission);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Revoke Permission
                                        </button>
                                    </div>

                                    {/* Collapse button */}
                                    <div className="flex items-center justify-end pt-2">
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(permission.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}