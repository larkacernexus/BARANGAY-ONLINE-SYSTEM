// resources/js/Pages/Admin/Users/components/user-header.tsx
import React, { useState, useCallback } from 'react';
import { Link } from '@inertiajs/react';
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
    MoreVertical,
    Key,
    XCircle,
    CheckCircle,
    ShieldCheck,
    ShieldOff,
    Trash2,
    User as UserIcon,
    Mail,
    CalendarDays,
    Clock,
    Shield,
    AlertCircle,
    Hash,
    Loader2,
} from 'lucide-react';
import { User, UserRole } from '@/types/admin/users/user-types';

interface UserHeaderProps {
    user: User;
    onCopyLink: () => void;
    onPrint: () => void;
    onEdit: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onToggle2FA: () => void;
    onDelete: () => void;
    copied?: boolean;
    isResettingPassword?: boolean;
    isActive?: boolean;
    has2FA?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

// Helper function to safely get role name
const getRoleName = (role: UserRole | undefined): string => {
    if (!role) return 'resident';
    return role.name?.toLowerCase() || 'resident';
};

// Helper function to safely get status badge variant
const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'suspended':
            return 'destructive';
        case 'pending':
            return 'outline';
        default:
            return 'outline';
    }
};

// Helper function to safely get status badge color
const getStatusBadgeClass = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        case 'suspended':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

// Helper function to safely get status icon
const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return <CheckCircle className="h-3 w-3" />;
        case 'inactive':
            return <Clock className="h-3 w-3" />;
        case 'suspended':
            return <XCircle className="h-3 w-3" />;
        case 'pending':
            return <AlertCircle className="h-3 w-3" />;
        default:
            return <AlertCircle className="h-3 w-3" />;
    }
};

// Helper function to safely get role badge color
const getRoleBadgeClass = (role: UserRole | undefined): string => {
    const roleName = getRoleName(role);
    
    switch (roleName) {
        case 'admin':
        case 'administrator':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
        case 'staff':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'resident':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

// Helper function to safely get role display name
const getRoleDisplayName = (role: UserRole | undefined): string => {
    const roleName = getRoleName(role);
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
};

// Helper function to get user gradient
const getUserGradient = (): string => {
    return 'from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700';
};

// Helper function to safely construct full name
const getFullName = (user: User): string => {
    if (!user) return 'User';
    
    const parts: string[] = [];
    
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    
    let fullName = parts.join(' ');
    
    return fullName || user.email || 'User';
};

// Helper function to safely format date
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Invalid date';
    }
};

export const UserHeader = ({
    user,
    onCopyLink,
    onPrint,
    onEdit,
    onResetPassword,
    onToggleStatus,
    onToggle2FA,
    onDelete,
    copied = false,
    isResettingPassword = false,
    isActive: propIsActive,
    has2FA: propHas2FA,
    canEdit = true,
    canDelete = true,
}: UserHeaderProps) => {
    const [localCopied, setLocalCopied] = useState(false);

    // Use props if provided, otherwise derive from user object
    const isActive = propIsActive ?? user?.status === 'active';
    const has2FA = propHas2FA ?? !!user?.two_factor_confirmed_at;
    const userStatus = user?.status || 'pending';
    const userRole = user?.role;
    const userEmail = user?.email || 'No email';
    const userId = user?.id;
    const fullName = getFullName(user);
    const createdAt = user?.created_at;

    const handleCopyLink = useCallback(() => {
        onCopyLink();
        setLocalCopied(true);
        setTimeout(() => setLocalCopied(false), 2000);
    }, [onCopyLink]);

    const handlePrint = useCallback(() => {
        onPrint();
    }, [onPrint]);

    const showCopied = copied || localCopied;

    return (
        <TooltipProvider>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/users">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="shrink-0 dark:border-gray-600 dark:text-gray-300"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getUserGradient()} shrink-0`}>
                            <UserIcon className="h-7 w-7 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100 break-words">
                                    {fullName}
                                </h1>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {/* Status Badge */}
                                <Badge 
                                    variant={getStatusBadgeVariant(userStatus)}
                                    className={getStatusBadgeClass(userStatus)}
                                >
                                    {getStatusIcon(userStatus)}
                                    <span className="ml-1 capitalize">{userStatus}</span>
                                </Badge>

                                {/* Role Badge */}
                                {userRole && (
                                    <Badge 
                                        variant="outline"
                                        className={getRoleBadgeClass(userRole)}
                                    >
                                        <Shield className="h-3 w-3 mr-1" />
                                        <span className="capitalize">{getRoleDisplayName(userRole)}</span>
                                    </Badge>
                                )}

                                {/* User ID with Copy */}
                                {userId && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleCopyLink}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            >
                                                <Hash className="h-3.5 w-3.5" />
                                                <span className="text-sm font-mono">
                                                    ID: {userId}
                                                </span>
                                                {showCopied ? (
                                                    <Check className="h-3.5 w-3.5 ml-1" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5 ml-1" />
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Click to copy user ID</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Email Badge */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span className="text-sm max-w-[200px] truncate">{userEmail}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Email address</TooltipContent>
                                </Tooltip>

                                {/* 2FA Badge */}
                                {has2FA && (
                                    <Badge 
                                        variant="outline"
                                        className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                    >
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        2FA Enabled
                                    </Badge>
                                )}

                                {/* Created Date Badge */}
                                {createdAt && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span className="text-sm">
                                                    {formatDate(createdAt)}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Joined date</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Edit Button - Primary Action */}
                    {canEdit && (
                        <Button
                            onClick={onEdit}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 shadow-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                        </Button>
                    )}

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
                                Copy Profile Link
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={handlePrint}
                                className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Profile
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onResetPassword}
                                disabled={isResettingPassword}
                                className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {isResettingPassword ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Key className="h-4 w-4 mr-2" />
                                        Reset Password
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onToggleStatus}
                                className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {isActive ? (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deactivate User
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate User
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onToggle2FA}
                                className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {has2FA ? (
                                    <>
                                        <ShieldOff className="h-4 w-4 mr-2" />
                                        Disable 2FA
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4 mr-2" />
                                        Enable 2FA
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                    <DropdownMenuItem 
                                        onClick={onDelete}
                                        className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete User
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