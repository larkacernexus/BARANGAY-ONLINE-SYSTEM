import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
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
    Edit,
    Trash2,
    Key,
    Hash,
    Shield,
    MoreVertical,
    Download,
    ShieldCheck,
    Users,
    CalendarDays,
    Lock,
    Unlock,
    Sparkles
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Permission } from '@/types';

// Define the specific literal types the Badge component accepts
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | null | undefined;

interface Props {
    permission: Permission;
    isSystem: boolean;
    onCopyLink: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPrint?: () => void;
    onExport?: () => void;
    canEdit: boolean;
    canDelete: boolean;
    // Updated return type to match Badge variants
    getStatusVariant: (status: string) => BadgeVariant;
    getStatusIcon: (status: string) => React.ReactNode;
}

const getPermissionGradient = (isSystem: boolean): string => {
    return isSystem
        ? 'from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700'
        : 'from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700';
};

const getStatusBadgeColor = (isActive: boolean): string => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
};

export const PermissionHeader = ({
    permission,
    isSystem,
    onCopyLink,
    onEdit,
    onDelete,
    onPrint,
    onExport,
    canEdit,
    canDelete,
    getStatusVariant,
    getStatusIcon
}: Props) => {
    const [copied, setCopied] = useState(false);
    const statusKey = permission.is_active ? 'active' : 'inactive';

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(route('admin.permissions.index'))}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Permissions
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getPermissionGradient(isSystem)}`}>
                            <Key className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {permission.display_name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={getStatusBadgeColor(permission.is_active)}>
                                    {getStatusIcon(statusKey)}
                                    <span className="ml-1">{permission.is_active ? 'Active' : 'Inactive'}</span>
                                </Badge>

                                {/* Permission ID with Copy */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                ID: {permission.id}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy permission ID</TooltipContent>
                                </Tooltip>

                                {/* System Badge */}
                                {isSystem && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        <Shield className="h-3 w-3 mr-1" />
                                        System
                                    </Badge>
                                )}

                                {/* Stats Badges - Replace with actual data */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <Users className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Roles using this permission</TooltipContent>
                                </Tooltip>

                                {/* Permission Name Badge */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 rounded-full cursor-default">
                                            <Key className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {permission.name}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>System name</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action (if can edit) */}
                    {canEdit && (
                        <Button 
                            size="sm" 
                            onClick={onEdit}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}

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
                                onClick={handlePrint}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                            
                            {onExport && (
                                <DropdownMenuItem 
                                    onClick={onExport}
                                    className="dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                            )}
                            
                            {canDelete && !isSystem && (
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
        </TooltipProvider>
    );
};