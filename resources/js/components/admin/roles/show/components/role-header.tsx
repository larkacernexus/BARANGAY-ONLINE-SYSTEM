// resources/js/Pages/Admin/Roles/components/role-header.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Copy,
    Check,
    Printer,
    MoreVertical,
    Edit,
    Key,
    Download,
    Trash2,
    Shield,
    Hash,
    Users,
    CalendarDays,
    ShieldCheck,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Role } from '@/types/admin/roles/roles';
import { formatDate } from '@/admin-utils/rolesUtils';

interface RoleHeaderProps {
    role: Role;
    onCopyLink: () => void;
    onExport: () => void;
    onManagePermissions: () => void;
    onDelete: () => void;
    canDelete: boolean;
    copied?: boolean;
}

const getRoleGradient = (isSystemRole: boolean): string => {
    return isSystemRole
        ? 'from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700'
        : 'from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700';
};

const getRoleBadgeColor = (isSystemRole: boolean): string => {
    return isSystemRole
        ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
};

const getRoleIcon = (isSystemRole: boolean) => {
    return isSystemRole ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />;
};

export const RoleHeader = ({
    role,
    onCopyLink,
    onExport,
    onManagePermissions,
    onDelete,
    canDelete,
    copied = false
}: RoleHeaderProps) => {
    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const permissionsCount = role.permissions_count ?? 0;
    const hasUsers = usersCount > 0;

    const handleCopyLink = () => {
        onCopyLink();
    };

    return (
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-4">
                    <Link href={route('admin.roles.index')}>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="shrink-0 dark:border-gray-600 dark:text-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Roles
                        </Button>
                    </Link>
                </div>
                
                <div className="flex items-start gap-4">
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getRoleGradient(role.is_system_role)} shrink-0`}>
                        <Shield className="h-7 w-7 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100 break-words">
                                {role.name}
                            </h1>
                            <Badge variant="outline" className={getRoleBadgeColor(role.is_system_role)}>
                                {getRoleIcon(role.is_system_role)}
                                <span className="ml-1">{role.is_system_role ? 'System Role' : 'Custom Role'}</span>
                            </Badge>
                        </div>
                        
                        {role.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {role.description}
                            </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {/* Role ID Badge with Copy */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleCopyLink}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Hash className="h-3.5 w-3.5" />
                                            <span className="text-sm font-mono">
                                                ID: {role.id}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy role ID</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Slug Badge */}
                            {role.slug && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 rounded-full">
                                                <Shield className="h-3.5 w-3.5" />
                                                <span className="text-sm font-mono">{role.slug}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Role Slug</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {/* Permissions Badge */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full">
                                            <Key className="h-3.5 w-3.5" />
                                            <span className="text-sm font-medium">{permissionsCount}</span>
                                            <span className="text-xs hidden sm:inline">
                                                permission{permissionsCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Total permissions granted</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Users Badge */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full">
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="text-sm font-medium">{usersCount}</span>
                                            <span className="text-xs hidden sm:inline">
                                                user{usersCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Users assigned to this role</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Created At Badge */}
                            {role.created_at && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span className="text-sm">
                                                    {formatDate(role.created_at)}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Date created</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                {/* Manage Permissions Button - Primary Action */}
                <Button
                    onClick={onManagePermissions}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 shadow-sm"
                >
                    <Key className="h-4 w-4 mr-2" />
                    Manage Permissions
                </Button>

                {/* 3-Dots Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="default"
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900 dark:border-gray-700">
                        <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={handleCopyLink}
                            className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={() => window.print()}
                            className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Details
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onExport}
                            className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export as JSON
                        </DropdownMenuItem>
                        
                        {/* Edit option for non-system roles only */}
                        {!role.is_system_role && (
                            <>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem asChild className="dark:text-gray-300 dark:hover:bg-gray-700">
                                    <Link href={route('admin.roles.edit', role.id)} className="flex items-center cursor-pointer w-full">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Role
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        
                        {/* Delete option with permission check */}
                        {canDelete && !role.is_system_role && (
                            <>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={onDelete} 
                                    className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Role
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};