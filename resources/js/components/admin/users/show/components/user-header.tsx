// resources/js/Pages/Admin/Users/components/user-header.tsx
import React, { useState } from 'react';
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
    Hash
} from 'lucide-react';
import { User } from '../types';

// Define the Role type if not already imported
interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: Array<{
        id: number;
        name: string;
        display_name: string;
        description?: string;
    }>;
}

interface Props {
    user: User;
    onCopyLink: () => void;
    onPrint: () => void;
    onEdit: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onToggle2FA: () => void;
    onDelete: () => void;
}

// Helper function to safely get role name (handles both string and object)
const getRoleName = (role: string | Role | undefined): string => {
    if (!role) return 'resident';
    if (typeof role === 'string') return role.toLowerCase();
    return role.name?.toLowerCase() || 'resident';
};

// Helper function to safely get status badge color
const getStatusBadgeColor = (status: string = 'pending'): string => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
        case 'suspended':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
    }
};

// Helper function to safely get status icon
const getStatusIcon = (status: string = 'pending') => {
    switch (status?.toLowerCase()) {
        case 'active':
            return <CheckCircle className="h-3 w-3" />;
        case 'inactive':
        case 'suspended':
            return <XCircle className="h-3 w-3" />;
        case 'pending':
            return <Clock className="h-3 w-3" />;
        default:
            return <AlertCircle className="h-3 w-3" />;
    }
};

// Helper function to safely get role badge color
const getRoleBadgeColor = (role: string | Role | undefined): string => {
    const roleName = getRoleName(role);
    
    switch (roleName) {
        case 'admin':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
        case 'staff':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'resident':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
    }
};

// Helper function to safely get role display name
const getRoleDisplayName = (role: string | Role | undefined): string => {
    const roleName = getRoleName(role);
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
};

const getUserGradient = (): string => {
    return 'from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700';
};

// Helper function to safely construct full name
const getFullName = (user: User): string => {
    if (!user) return 'User';
    
    const parts = [];
    
    if (user.first_name) parts.push(user.first_name);
    if (user.middle_name) parts.push(user.middle_name);
    if (user.last_name) parts.push(user.last_name);
    
    let fullName = parts.join(' ');
    
    if (user.suffix && fullName) {
        fullName += `, ${user.suffix}`;
    }
    
    return fullName || 'User';
};

// Helper function to safely format date
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString();
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
    onDelete
}: Props) => {
    const [copied, setCopied] = useState(false);

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

    // Safely get values with defaults
    const userStatus = user?.status || 'pending';
    const userRole = user?.role;
    const userEmail = user?.email || 'No email';
    const userId = user?.id;
    const fullName = getFullName(user);
    const twoFactorEnabled = !!user?.two_factor_confirmed_at;
    const createdAt = user?.created_at;

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getUserGradient()}`}>
                            <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {fullName}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={getStatusBadgeColor(userStatus)}>
                                    {getStatusIcon(userStatus)}
                                    <span className="ml-1 capitalize">{userStatus}</span>
                                </Badge>

                                {/* Role Badge - Now handles both string and object */}
                                {userRole && (
                                    <Badge variant="outline" className={getRoleBadgeColor(userRole)}>
                                        <Shield className="h-3 w-3 mr-1" />
                                        <span className="capitalize">{getRoleDisplayName(userRole)}</span>
                                    </Badge>
                                )}

                                {/* User ID with Copy */}
                                {userId && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div 
                                                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                                onClick={handleCopyLink}
                                            >
                                                <Hash className="h-3 w-3" />
                                                <span className="text-sm font-mono">
                                                    ID: {userId}
                                                </span>
                                                {copied ? (
                                                    <Check className="h-3 w-3 ml-1" />
                                                ) : (
                                                    <Copy className="h-3 w-3 ml-1" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Click to copy user ID</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Email Badge */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <Mail className="h-3 w-3" />
                                            <span className="text-sm max-w-[200px] truncate">{userEmail}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Email address</TooltipContent>
                                </Tooltip>

                                {/* 2FA Badge */}
                                {twoFactorEnabled && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        2FA Enabled
                                    </Badge>
                                )}

                                {/* Created Date Badge */}
                                {createdAt && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full cursor-default">
                                                <CalendarDays className="h-3 w-3" />
                                                <span className="text-sm">
                                                    {formatDate(createdAt)}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Joined</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action */}
                    {userId && (
                        <Link href={`/users/${userId}/edit`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    )}

                    {/* 3-Dots Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900 dark:border-gray-700">
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
                                Print Profile
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onResetPassword}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Key className="h-4 w-4 mr-2" />
                                Reset Password
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onToggleStatus}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {userStatus === 'active' ? (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onToggle2FA}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {twoFactorEnabled ? (
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
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onDelete}
                                className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    );
};