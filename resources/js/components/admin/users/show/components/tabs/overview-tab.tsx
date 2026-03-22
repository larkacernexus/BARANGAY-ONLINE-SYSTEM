// components/admin/users/show/components/tabs/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    User, 
    Mail, 
    Calendar, 
    Clock, 
    Shield, 
    CheckCircle, 
    XCircle,
    Copy,
    RefreshCw,
    LogOut,
    Trash2,
    Activity,
    BarChart3,
    TrendingUp,
    Users
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface OverviewTabProps {
    user: any;
    stats: any;
    emailCopied: boolean;
    onCopyEmail: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onLogoutAll: () => void;
    onDelete: () => void;
    formatDate: (date: string | null, includeTime?: boolean) => string;
    isResettingPassword: boolean;
    isLoggingOutAll: boolean;
}

export const OverviewTab = ({
    user,
    stats,
    emailCopied,
    onCopyEmail,
    onResetPassword,
    onToggleStatus,
    onLogoutAll,
    onDelete,
    formatDate,
    isResettingPassword,
    isLoggingOutAll
}: OverviewTabProps) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                </Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                </Badge>;
            case 'suspended':
                return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Suspended
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
                {/* User Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <User className="h-5 w-5" />
                            User Information
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Basic information about the user account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                                <p className="mt-1 text-gray-900 dark:text-gray-100">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onCopyEmail}
                                        className="h-6 px-2"
                                    >
                                        {emailCopied ? (
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                                <p className="mt-1 capitalize text-gray-900 dark:text-gray-100">{user.role?.name || 'No Role'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                                <div className="mt-1">{getStatusBadge(user.status)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Summary Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Activity className="h-5 w-5" />
                            Activity Summary
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Recent user activity and engagement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold dark:text-gray-100">{stats.total_activities || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Activities</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold dark:text-gray-100">{stats.last_week_activities || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 Days</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold dark:text-gray-100">{stats.login_count || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Logins</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold dark:text-gray-100">{user.last_login_at ? formatDate(user.last_login_at, true) : 'Never'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
                {/* Quick Actions Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Shield className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Manage user account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onResetPassword}
                            disabled={isResettingPassword}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isResettingPassword ? 'animate-spin' : ''}`} />
                            {isResettingPassword ? 'Sending...' : 'Reset Password'}
                        </Button>
                        
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onToggleStatus}
                        >
                            {user.status === 'active' ? (
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
                        </Button>
                        
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onLogoutAll}
                            disabled={isLoggingOutAll}
                        >
                            <LogOut className={`h-4 w-4 mr-2 ${isLoggingOutAll ? 'animate-spin' : ''}`} />
                            {isLoggingOutAll ? 'Logging out...' : 'Logout All Sessions'}
                        </Button>
                        
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                        </Button>
                    </CardContent>
                </Card>

                {/* Timeline Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Clock className="h-5 w-5" />
                            Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                                <p className="text-sm font-medium dark:text-gray-200">{formatDate(user.created_at, true)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                <p className="text-sm font-medium dark:text-gray-200">{formatDate(user.updated_at, true)}</p>
                            </div>
                        </div>
                        {user.email_verified_at && (
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                                    <p className="text-sm font-medium dark:text-gray-200">{formatDate(user.email_verified_at, true)}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};