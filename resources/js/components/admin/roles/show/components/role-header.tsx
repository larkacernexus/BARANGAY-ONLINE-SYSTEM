// resources/js/Pages/Admin/Roles/components/role-header.tsx
import React, { useState } from 'react';
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
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Role } from '../types';

interface Props {
    role: Role;
    onCopyLink: () => void;
    onExport: () => void;
    onManagePermissions: () => void;
    onDelete: () => void;
    canDelete: boolean;
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
    canDelete
}: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href={route('admin.roles.index')}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Roles
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getRoleGradient(role.is_system_role)}`}>
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            {role.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Role Type Badge */}
                            <Badge variant="outline" className={getRoleBadgeColor(role.is_system_role)}>
                                {getRoleIcon(role.is_system_role)}
                                <span className="ml-1">{role.is_system_role ? 'System Role' : 'Custom Role'}</span>
                            </Badge>

                            {/* Role ID Badge with Copy */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                ID: {role.id}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy role ID</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Stats Badges - Replace with actual data */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <Key className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Permissions</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <Users className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Users with this role</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Created At Badge - Optional */}
                            {role.created_at && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full cursor-default">
                                                <CalendarDays className="h-3 w-3" />
                                                <span className="text-sm">
                                                    {new Date(role.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Created</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Manage Permissions Button - Primary Action */}
                <Button
                    onClick={onManagePermissions}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                >
                    <Key className="h-4 w-4 mr-2" />
                    Manage Permissions
                </Button>

                {/* 3-Dots Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                        <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={handleCopyLink}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={() => window.print()}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onExport}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export as JSON
                        </DropdownMenuItem>
                        
                        {/* Edit option for non-system roles only */}
                        {!role.is_system_role && (
                            <>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem asChild className="dark:text-gray-300 dark:hover:bg-gray-700">
                                    <Link href={route('admin.roles.edit', role.id)} className="flex items-center cursor-pointer">
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
                                    className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};