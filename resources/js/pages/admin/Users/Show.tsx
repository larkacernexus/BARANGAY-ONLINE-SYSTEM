import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User as UserIcon,
    Mail,
    Phone,
    Shield,
    Building,
    Calendar,
    Activity,
    Edit,
    Key,
    Lock,
    History,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    UserCheck,
    ShieldCheck,
    ShieldAlert,
    LogOut,
    KeyRound,
    RefreshCw,
    Download,
    Printer
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

// Types based on your database schema
interface User {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    username: string | null;
    contact_number: string | null;
    position: string | null;
    department_id: number | null;
    role_id: number;
    status: 'active' | 'inactive';
    email_verified_at: string | null;
    require_password_change: boolean;
    password_changed_at: string | null;
    two_factor_secret: string | null;
    two_factor_recovery_codes: string | null;
    two_factor_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
    last_login_ip: string | null;
    role?: {
        id: number;
        name: string;
        description?: string;
        permissions?: Array<{
            id: number;
            name: string;
            display_name: string;
            description?: string;
        }>;
    };
    department?: {
        id: number;
        name: string;
        description?: string;
    };
    permissions?: Array<{
        id: number;
        name: string;
        display_name: string;
        description?: string;
        module?: string;
    }>;
}

interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_type: string;
    causer_id: number;
    properties: any;
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
}

interface PagePropsWithData extends PageProps {
    user: User;
    activityLogs: ActivityLog[];
    stats?: {
        residents_managed?: number;
        payments_processed?: number;
        clearances_issued?: number;
        users_created?: number;
    };
}

export default function UserShow() {
    const { user, activityLogs = [], stats } = usePage<PagePropsWithData>().props;
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [isLoggingOutAllSessions, setIsLoggingOutAllSessions] = useState(false);

    // Safely get full name
    const getFullName = (): string => {
        if (!user) return 'Loading...';
        
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`.trim();
        } else if (user.first_name) {
            return user.first_name;
        } else if (user.last_name) {
            return user.last_name;
        } else {
            return user.email || 'Unknown User';
        }
    };

    // Format date safely
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Format time ago safely
    const formatTimeAgo = (dateString: string | null) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            return formatDate(dateString);
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Get status icon
    const getStatusIcon = () => {
        if (!user) return null;
        
        switch (user.status) {
            case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'inactive': return <XCircle className="h-5 w-5 text-gray-400" />;
            default: return null;
        }
    };

    // Get status badge variant
    const getStatusBadgeVariant = () => {
        if (!user) return 'outline';
        
        switch (user.status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            default: return 'outline';
        }
    };

    // Handle password reset
    const handleResetPassword = () => {
        if (!user) return;
        
        if (confirm(`Are you sure you want to reset password for ${getFullName()}? A new password will be emailed to them.`)) {
            setIsResettingPassword(true);
            router.post(`/users/${user.id}/reset-password`, {}, {
                onSuccess: () => {
                    toast.success('Password reset email sent successfully');
                    setIsResettingPassword(false);
                },
                onError: (errors) => {
                    toast.error('Failed to reset password');
                    setIsResettingPassword(false);
                }
            });
        }
    };

    // Handle logout all sessions
    const handleLogoutAllSessions = () => {
        if (!user) return;
        
        if (confirm(`Are you sure you want to log out all sessions for ${getFullName()}?`)) {
            setIsLoggingOutAllSessions(true);
            router.post(`/users/${user.id}/logout-all-sessions`, {}, {
                onSuccess: () => {
                    toast.success('All sessions logged out successfully');
                    setIsLoggingOutAllSessions(false);
                },
                onError: (errors) => {
                    toast.error('Failed to log out sessions');
                    setIsLoggingOutAllSessions(false);
                }
            });
        }
    };

    // Handle 2FA toggle
    const handleToggle2FA = () => {
        if (!user) return;
        
        const action = user.two_factor_confirmed_at ? 'disable' : 'enable';
        if (confirm(`Are you sure you want to ${action} two-factor authentication for ${getFullName()}?`)) {
            router.put(`/users/${user.id}/toggle-2fa`, {}, {
                onSuccess: () => {
                    toast.success(`2FA ${action}d successfully`);
                },
                onError: (errors) => {
                    toast.error(`Failed to ${action} 2FA`);
                }
            });
        }
    };

    // Handle status toggle
    const handleToggleStatus = () => {
        if (!user) return;
        
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? 'activate' : 'deactivate';
        
        if (confirm(`Are you sure you want to ${action} ${getFullName()}?`)) {
            router.put(`/users/${user.id}`, {
                status: newStatus
            }, {
                onSuccess: () => {
                    toast.success(`User ${action}d successfully`);
                },
                onError: (errors) => {
                    toast.error(`Failed to ${action} user`);
                }
            });
        }
    };

    // Group permissions by module safely
    const groupedPermissions = user?.permissions?.reduce((acc, permission) => {
        const module = permission.module || 'Other';
        if (!acc[module]) {
            acc[module] = [];
        }
        acc[module].push(permission);
        return acc;
    }, {} as Record<string, typeof user.permissions>) || {};

    // Get permissions from role safely with fallback
    const rolePermissions = user?.role?.permissions || [];

    // Format activity log description
    const formatActivityDescription = (activity: ActivityLog) => {
        return activity.description || 'Performed an action';
    };

    // Get activity icon
    const getActivityIcon = (activity: ActivityLog) => {
        const desc = activity.description.toLowerCase();
        if (desc.includes('login')) return <KeyRound className="h-4 w-4 text-blue-500" />;
        if (desc.includes('logout')) return <LogOut className="h-4 w-4 text-gray-500" />;
        if (desc.includes('create') || desc.includes('add')) return <UserCheck className="h-4 w-4 text-green-500" />;
        if (desc.includes('update') || desc.includes('edit')) return <Edit className="h-4 w-4 text-amber-500" />;
        if (desc.includes('delete') || desc.includes('remove')) return <XCircle className="h-4 w-4 text-red-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    // If user data is not loaded yet
    if (!user) {
        return (
            <AppLayout
                title="Loading..."
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Users', href: '/users' },
                    { title: 'Loading...', href: '#' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading user data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title={`User Profile: ${getFullName()}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Users', href: '/users' },
                { title: getFullName(), href: `/users/${user.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{getFullName()}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge 
                                    variant={getStatusBadgeVariant()} 
                                    className="flex items-center gap-1 capitalize"
                                >
                                    {getStatusIcon()}
                                    {user.status || 'unknown'}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                    {user.role?.name || 'No Role'}
                                </Badge>
                                <Badge variant="outline">
                                    {user.department?.name || 'No Department'}
                                </Badge>
                                {user.email_verified_at && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Email Verified
                                    </Badge>
                                )}
                                {user.two_factor_confirmed_at && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        2FA Enabled
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleToggleStatus}
                            className="flex items-center gap-1"
                        >
                            {user.status === 'active' ? (
                                <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Link href={`/users/${user.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Profile
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleResetPassword}
                            disabled={isResettingPassword}
                            className="flex items-center gap-1"
                        >
                            {isResettingPassword ? (
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Key className="h-4 w-4 mr-1" />
                            )}
                            Reset Password
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Download className="h-4 w-4 mr-1" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Printer className="h-4 w-4 mr-1" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid grid-cols-2 lg:grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Permissions</span>
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Activity</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* User Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="h-5 w-5" />
                                        User Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="text-sm text-gray-500">Email Address</div>
                                                <div className="font-medium truncate">{user.email}</div>
                                                {!user.email_verified_at && (
                                                    <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Email not verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Contact Number</div>
                                                <div className="font-medium">{user.contact_number || 'Not provided'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Shield className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Username</div>
                                                <div className="font-medium">{user.username || 'Not set'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Position</div>
                                                <div className="font-medium">{user.position || 'Not specified'}</div>
                                            </div>
                                        </div>
                                        {user.department && (
                                            <div className="flex items-start gap-3">
                                                <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm text-gray-500">Department</div>
                                                    <div className="font-medium">{user.department.name}</div>
                                                    {user.department.description && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {user.department.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {user.role && (
                                            <div className="flex items-start gap-3">
                                                <Shield className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm text-gray-500">Role</div>
                                                    <div className="font-medium">{user.role.name}</div>
                                                    {user.role.description && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {user.role.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Account Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Account Created</div>
                                                <div className="font-medium">{formatDate(user.created_at)}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {formatTimeAgo(user.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Last Login</div>
                                                <div className="font-medium">{formatDate(user.last_login_at)}</div>
                                                {user.last_login_ip && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        IP: {user.last_login_ip}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {formatTimeAgo(user.last_login_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Lock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Password Status</div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {user.require_password_change ? (
                                                            <AlertCircle className="h-3 w-3 text-amber-500" />
                                                        ) : (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        )}
                                                        <span className="text-sm">
                                                            {user.require_password_change ? 'Change required' : 'Up to date'}
                                                        </span>
                                                    </div>
                                                    {user.password_changed_at && (
                                                        <div className="text-xs text-gray-500 ml-5">
                                                            Last changed: {formatTimeAgo(user.password_changed_at)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm text-gray-500">Security Features</div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {user.two_factor_confirmed_at ? (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        <span className="text-sm">Two-factor authentication</span>
                                                        {user.two_factor_confirmed_at && (
                                                            <div className="text-xs text-gray-500">
                                                                Enabled {formatTimeAgo(user.two_factor_confirmed_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {user.email_verified_at ? (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        <span className="text-sm">Email verified</span>
                                                        {user.email_verified_at && (
                                                            <div className="text-xs text-gray-500">
                                                                Verified {formatTimeAgo(user.email_verified_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats */}
                        {stats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Statistics</CardTitle>
                                    <CardDescription>
                                        Recent activity and performance metrics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {stats.residents_managed || 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Residents Managed</div>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-2xl font-bold text-green-600">
                                                {stats.payments_processed || 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Payments Processed</div>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {stats.clearances_issued || 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Clearances Issued</div>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="text-2xl font-bold text-amber-600">
                                                {stats.users_created || 0}
                                            </div>
                                            <div className="text-sm text-gray-500">Users Created</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Direct Permissions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Direct Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        {(user.permissions?.length || 0)} custom permissions assigned directly
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {user.permissions && user.permissions.length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                                                <div key={module} className="space-y-2">
                                                    <h4 className="font-medium text-sm text-gray-700 capitalize">
                                                        {module.replace(/_/g, ' ')}
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {Array.isArray(modulePermissions) && modulePermissions.map((permission) => (
                                                            <div 
                                                                key={permission.id} 
                                                                className="flex items-center justify-between p-2 border rounded text-sm"
                                                            >
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {permission.display_name || permission.name}
                                                                    </div>
                                                                    {permission.description && (
                                                                        <div className="text-xs text-gray-500">
                                                                            {permission.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    Direct
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Shield className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p>No direct permissions assigned</p>
                                            <p className="text-sm mt-1">Permissions are inherited from role</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Role-based Permissions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role-based Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        Permissions inherited from the {user.role?.name || 'No Role'} role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {rolePermissions.length > 0 ? (
                                        <div className="space-y-3">
                                            {Array.isArray(rolePermissions) && rolePermissions.map((permission: any) => (
                                                <div 
                                                    key={permission.id} 
                                                    className="flex items-center justify-between p-2 border rounded text-sm"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {permission.display_name || permission.name}
                                                        </div>
                                                        {permission.description && (
                                                            <div className="text-xs text-gray-500">
                                                                {permission.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        From Role
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ShieldAlert className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p>No permissions from role</p>
                                            <p className="text-sm mt-1">Role has no assigned permissions</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Total Permissions Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Permissions Summary</CardTitle>
                                <CardDescription>
                                    Overview of all accessible permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">Total Permissions:</div>
                                        <div className="font-medium">
                                            {(user.permissions?.length || 0) + rolePermissions.length}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="text-gray-500">Direct permissions:</div>
                                            <div className="font-medium">{user.permissions?.length || 0}</div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="text-gray-500">Role permissions:</div>
                                            <div className="font-medium">{rolePermissions.length}</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                                            style={{ 
                                                width: `${Math.min(
                                                    ((user.permissions?.length || 0) / Math.max((user.permissions?.length || 0) + rolePermissions.length, 1)) * 100, 
                                                    100
                                                )}%` 
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <span>Direct permissions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                            <span>Role permissions</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    User actions and system interactions (Last 50 activities)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activityLogs.length > 0 ? (
                                    <div className="space-y-3">
                                        {activityLogs.map((activity) => (
                                            <div 
                                                key={activity.id} 
                                                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mt-1 flex-shrink-0">
                                                    {getActivityIcon(activity)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">
                                                        {formatActivityDescription(activity)}
                                                    </div>
                                                    {activity.properties && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {JSON.stringify(activity.properties, null, 2)}
                                                        </div>
                                                    )}
                                                    {activity.causer && activity.causer.id !== user.id && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            By: {activity.causer.name} ({activity.causer.email})
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                                    {formatTimeAgo(activity.created_at)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No activity recorded</p>
                                        <p className="text-sm mt-1">User has not performed any actions yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <KeyRound className="h-4 w-4" />
                                                Password Management
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {user.require_password_change 
                                                    ? 'Password change required on next login'
                                                    : user.password_changed_at 
                                                        ? `Last changed: ${formatTimeAgo(user.password_changed_at)}`
                                                        : 'Password never changed'
                                                }
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                className="w-full mt-3"
                                                onClick={handleResetPassword}
                                                disabled={isResettingPassword}
                                            >
                                                {isResettingPassword ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Resetting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Key className="h-4 w-4 mr-2" />
                                                        Reset Password
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4" />
                                                Two-Factor Authentication
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {user.two_factor_confirmed_at 
                                                    ? `Enabled ${formatTimeAgo(user.two_factor_confirmed_at)}`
                                                    : 'Not enabled'
                                                }
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                className={`w-full mt-3 ${
                                                    user.two_factor_confirmed_at 
                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                }`}
                                                onClick={handleToggle2FA}
                                            >
                                                {user.two_factor_confirmed_at ? 'Disable 2FA' : 'Enable 2FA'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LogOut className="h-5 w-5" />
                                        Session Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium">Active Sessions</h4>
                                            <div className="mt-3 space-y-2">
                                                {user.last_login_at ? (
                                                    <div className="p-3 border rounded bg-gray-50">
                                                        <div className="font-medium text-sm">Current Session</div>
                                                        <div className="text-xs text-gray-500">
                                                            Last activity: {formatTimeAgo(user.last_login_at)}
                                                        </div>
                                                        {user.last_login_ip && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                IP: {user.last_login_ip}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        <LogOut className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                                        <p className="text-sm">No active sessions</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={handleLogoutAllSessions}
                                            disabled={isLoggingOutAllSessions || !user.last_login_at}
                                        >
                                            {isLoggingOutAllSessions ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Logging out...
                                                </>
                                            ) : (
                                                <>
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Logout All Sessions
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Security Audit */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Security Audit
                                </CardTitle>
                                <CardDescription>
                                    Security recommendations and audit trail
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Account Status</div>
                                            <div className="text-xs text-gray-500">
                                                Account is {user.status}. {user.status === 'active' ? 'All systems operational.' : 'Account is inactive.'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            user.email_verified_at ? 'bg-green-100' : 'bg-amber-100'
                                        }`}>
                                            {user.email_verified_at ? (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Email Verification</div>
                                            <div className="text-xs text-gray-500">
                                                {user.email_verified_at 
                                                    ? 'Email verified and secure.'
                                                    : 'Email not verified. Consider verifying for enhanced security.'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            user.two_factor_confirmed_at ? 'bg-green-100' : 'bg-amber-100'
                                        }`}>
                                            {user.two_factor_confirmed_at ? (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Two-Factor Authentication</div>
                                            <div className="text-xs text-gray-500">
                                                {user.two_factor_confirmed_at 
                                                    ? '2FA enabled for enhanced security.'
                                                    : '2FA not enabled. Consider enabling for additional security.'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Last Activity</div>
                                            <div className="text-xs text-gray-500">
                                                {user.last_login_at 
                                                    ? `Last login was ${formatTimeAgo(user.last_login_at)}.`
                                                    : 'No login activity recorded.'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}