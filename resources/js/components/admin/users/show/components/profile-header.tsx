// resources/js/Pages/Admin/Users/components/profile-header.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    MoreVertical,
    Mail,
    Shield,
    CheckCircle,
    ShieldCheck,
    User,
    Calendar,
    Phone,
    Crown,
    Hash,
    Clock,
    AlertCircle,
    Key,
    Lock,
    Globe,
    Briefcase,
    Copy,
    MessageSquare,
    Bell,
    Edit,
    Building2,
} from 'lucide-react';
import { User as UserType, UserRole, UserDepartment } from '@/types/admin/users/user-types';
import { formatDate, getFullName, getInitials, getStatusColor, getStatusIcon } from '../utils/helpers';

interface ProfileHeaderProps {
    user: UserType;
    fullName?: string;
    getInitials?: (name: string) => string;
    getStatusColor?: (status: string) => string;
    getStatusIcon?: (status: string) => React.ReactNode;
    onCopyEmail?: () => void;
    onSendMessage?: () => void;
    onEdit?: () => void;
    onNotify?: () => void;
    onCopyId?: () => void;
}

// Helper to safely get department name
const getDepartmentName = (department: UserDepartment | string | undefined): string => {
    if (!department) return 'N/A';
    if (typeof department === 'string') return department;
    return department.name || 'N/A';
};

// Helper to safely get role name
const getRoleName = (role: UserRole | undefined): string => {
    if (!role) return 'No Role';
    return role.name || 'No Role';
};

// Helper to check if user is super admin
const isSuperAdmin = (user: UserType): boolean => {
    const roleName = getRoleName(user.role).toLowerCase();
    return roleName === 'super admin' || roleName === 'administrator' || roleName === 'admin';
};

export const ProfileHeader = ({ 
    user, 
    fullName: propFullName,
    getInitials: propGetInitials,
    getStatusColor: propGetStatusColor,
    getStatusIcon: propGetStatusIcon,
    onCopyEmail,
    onSendMessage,
    onEdit,
    onNotify,
    onCopyId,
}: ProfileHeaderProps) => {
    // Use provided helpers or fallback to imported ones
    const initials = propGetInitials || getInitials;
    const statusColor = propGetStatusColor || getStatusColor;
    const statusIcon = propGetStatusIcon || getStatusIcon;
    
    // Safe access with fallbacks
    const fullName = propFullName || getFullName(user);
    const isVerified = !!user.email_verified_at;
    const hasTwoFactor = !!user.two_factor_confirmed_at;
    const isSuperAdminUser = isSuperAdmin(user);
    const userStatus = user.status || 'pending';
    const userRole = user.role;
    const userEmail = user.email || 'No email';
    const userId = user.id;
    const username = (user as any).username;
    const contactNumber = user.phone || (user as any).contact_number;
    const department = getDepartmentName(user.department);
    const lastIp = user.last_login_ip || (user as any).last_ip;
    const avatarUrl = user.avatar;
    
    // Calculate account age
    const getAccountAge = (): string | null => {
        if (!user.created_at) return null;
        const created = new Date(user.created_at);
        const now = new Date();
        const diffTime = now.getTime() - created.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''}`;
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
    };

    // Get last active
    const getLastActive = (): string => {
        if (!user.last_login_at) return 'Never';
        return formatDate(user.last_login_at);
    };

    const accountAge = getAccountAge();

    const handleCopyId = () => {
        if (onCopyId) {
            onCopyId();
        } else if (onCopyEmail) {
            navigator.clipboard.writeText(userId.toString());
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
            {/* Large Avatar */}
            <div className="relative flex-shrink-0 self-center md:self-start">
                <Avatar className="h-20 w-20 border-2 border-gray-100 dark:border-gray-800 shadow-sm">
                    <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-xl font-semibold">
                        {fullName !== 'Unknown User' ? initials(fullName) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                </Avatar>
                {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>Email verified</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>

            {/* User Info - Responsive Grid */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Name and Status Row */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <h2 className="text-xl font-semibold truncate dark:text-gray-100">
                                {fullName}
                            </h2>
                            <Badge className={statusColor(userStatus)}>
                                {statusIcon(userStatus)}
                                <span className="ml-1 capitalize">{userStatus}</span>
                            </Badge>
                        </div>
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Column 1: Basic Info */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Basic Information
                                </h3>
                                
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {getRoleName(userRole)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Hash className="h-3 w-3 flex-shrink-0" />
                                        <span>ID: {userId}</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 p-0"
                                                        onClick={handleCopyId}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Copy user ID</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    {username && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <User className="h-3 w-3 flex-shrink-0" />
                                            <span>@{username}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Contact Details */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Contact Information
                                </h3>
                                
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2 truncate text-gray-600 dark:text-gray-400">
                                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">{userEmail}</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 p-0"
                                                        onClick={onCopyEmail}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Copy email</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    
                                    {contactNumber && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{contactNumber}</span>
                                        </div>
                                    )}
                                    
                                    {department && department !== 'N/A' && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{department}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Account & Security */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Account & Security
                                </h3>
                                
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>Joined: {formatDate(user.created_at)}</span>
                                    </div>
                                    
                                    {accountAge && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>Account age: {accountAge}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Key className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>Last login: {getLastActive()}</span>
                                    </div>
                                    
                                    {lastIp && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>IP: {lastIp}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap mt-4">
                            {hasTwoFactor ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    2FA Enabled
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                    <Lock className="h-3 w-3 mr-1" />
                                    2FA Disabled
                                </Badge>
                            )}
                            
                            {isVerified ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Email Verified
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Unverified
                                </Badge>
                            )}
                            
                            {isSuperAdminUser && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Super Admin
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions Dropdown */}
                    {(onSendMessage || onNotify || onEdit || onCopyEmail) && (
                        <div className="flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                        Actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {onCopyEmail && (
                                        <DropdownMenuItem onClick={onCopyEmail}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Email
                                        </DropdownMenuItem>
                                    )}
                                    {onSendMessage && (
                                        <DropdownMenuItem onClick={onSendMessage}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Message
                                        </DropdownMenuItem>
                                    )}
                                    {onNotify && (
                                        <DropdownMenuItem onClick={onNotify}>
                                            <Bell className="h-4 w-4 mr-2" />
                                            Send Notification
                                        </DropdownMenuItem>
                                    )}
                                    {(onSendMessage || onNotify || onCopyEmail) && onEdit && (
                                        <DropdownMenuSeparator />
                                    )}
                                    {onEdit && (
                                        <DropdownMenuItem onClick={onEdit}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};