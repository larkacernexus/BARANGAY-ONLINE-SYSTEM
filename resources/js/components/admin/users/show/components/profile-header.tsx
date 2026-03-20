import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreVertical,
    Mail,
    Shield,
    CheckCircle,
    ShieldCheck,
    User,
    Calendar,
    Phone,
    MapPin,
    Crown,
    Hash,
    Clock,
    AlertCircle,
    Key,
    Lock,
    Globe,
    Award,
    Briefcase,
} from 'lucide-react';
import { User as UserType } from '../types';

interface Props {
    user: UserType;
    fullName: string;
    getInitials: (name: string) => string;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
}

// Format date helper
const formatDate = (date: string | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const ProfileHeader = ({ 
    user, 
    fullName, 
    getInitials, 
    getStatusColor, 
    getStatusIcon 
}: Props) => {
    const isVerified = !!user.email_verified_at;
    const hasTwoFactor = !!user.two_factor_confirmed_at;
    
    // Calculate account age
    const getAccountAge = () => {
        if (!user.created_at) return null;
        const created = new Date(user.created_at);
        const now = new Date();
        const diffTime = now.getTime() - created.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
    };

    const accountAge = getAccountAge();

    // Get last active
    const getLastActive = () => {
        if (!user.last_login_at) return 'Never';
        return formatDate(user.last_login_at);
    };

    return (
        <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
            {/* Large Avatar */}
            <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 border-2 border-gray-100 dark:border-gray-800">
                    <AvatarImage src={(user as any).avatar_url} alt={fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-xl font-semibold">
                        {fullName !== 'Unknown User' ? getInitials(fullName) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                </Avatar>
                {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                )}
            </div>

            {/* User Info - 3-column grid */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Column 1: Basic Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold truncate">{fullName}</h2>
                        <Badge className={`${getStatusColor(user.status)} px-2 py-0.5 text-xs h-5`}>
                            {getStatusIcon(user.status)}
                            <span className="ml-1">{user.status}</span>
                        </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{user.role?.name || 'No Role'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span>User ID: {user.id}</span>
                        </div>

                        {user.username && (
                            <div className="flex items-center gap-2 text-xs">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>@{user.username}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Contact & Account Details */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contact & Account
                    </h3>
                    
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 truncate">
                            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                        </div>
                        
                        {user.contact_number && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{user.contact_number}</span>
                            </div>
                        )}
                        
                        {user.department && (
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3 text-muted-foreground" />
                                <span>{user.department}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>Joined: {formatDate(user.created_at)}</span>
                        </div>
                        
                        {accountAge && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>Account age: {accountAge}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Security & Status */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Security & Activity
                    </h3>
                    
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            {hasTwoFactor ? (
                                <>
                                    <ShieldCheck className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400">2FA Enabled</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">2FA Disabled</span>
                                </>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Key className="h-3 w-3 text-muted-foreground" />
                            <span>Last login: {getLastActive()}</span>
                        </div>
                        
                        {user.last_ip && (
                            <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <span>IP: {user.last_ip}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
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
                            
                            {user.is_superadmin && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Super Admin
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem>Message</DropdownMenuItem>
                    <DropdownMenuItem>Notify</DropdownMenuItem>
                    <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};