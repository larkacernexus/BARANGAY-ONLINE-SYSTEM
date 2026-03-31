// components/admin/officials/show/components/tabs/activity-tab.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Activity, 
    Clock, 
    User, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Eye, 
    Edit, 
    Trash2, 
    UserPlus, 
    UserX, 
    KeyRound,
    LogIn,
    LogOut,
    Shield,
    Mail
} from 'lucide-react';

// Import types from shared officials types
import { ActivityLog, Official, User as UserType } from '@/types/admin/officials/officials';

interface ActivityTabProps {
    official: Official & {
        user?: UserType & {
            activities?: ActivityLog[];
        };
    };
    formatDate: (date: string | null | undefined) => string;
    formatDateTime: (date: string | null | undefined) => string;
    formatTimeAgo: (date: string) => string;
}

export const ActivityTab = ({ official, formatDate, formatDateTime, formatTimeAgo }: ActivityTabProps) => {
    // Get activities from the associated user account
    const activities = official.user?.activities || [];

    // Helper function to get icon based on action type
    const getActionIcon = (action: string) => {
        const actionLower = action.toLowerCase();
        
        if (actionLower.includes('login')) {
            return <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />;
        }
        if (actionLower.includes('logout')) {
            return <LogOut className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
        }
        if (actionLower.includes('create') || actionLower.includes('add')) {
            return <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
        }
        if (actionLower.includes('update') || actionLower.includes('edit')) {
            return <Edit className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
        }
        if (actionLower.includes('delete') || actionLower.includes('remove')) {
            return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
        }
        if (actionLower.includes('view') || actionLower.includes('viewed')) {
            return <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
        }
        if (actionLower.includes('password') || actionLower.includes('reset')) {
            return <KeyRound className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
        }
        if (actionLower.includes('role') || actionLower.includes('permission')) {
            return <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
        }
        if (actionLower.includes('email')) {
            return <Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
        }
        return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    };

    // Helper function to get status badge variant
    const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return 'secondary';
        switch (status.toLowerCase()) {
            case 'success':
            case 'completed':
            case 'active':
                return 'default';
            case 'failed':
            case 'error':
            case 'inactive':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (status?: string) => {
        if (!status) return null;
        switch (status.toLowerCase()) {
            case 'success':
            case 'completed':
                return <CheckCircle className="h-3 w-3 mr-1" />;
            case 'failed':
            case 'error':
                return <XCircle className="h-3 w-3 mr-1" />;
            default:
                return null;
        }
    };

    // Calculate activities in last 30 days
    const activitiesLast30Days = activities.filter(a => {
        const days = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return days <= 30;
    }).length;

    // Get last activity
    const lastActivity = activities.length > 0 ? activities[0] : null;

    // Get user display name
    const getUserName = () => {
        if (official.user?.username) return official.user.username;
        if (official.resident?.full_name) return official.resident.full_name;
        return 'the official';
    };

    // Get user email
    const getUserEmail = () => {
        return official.user?.email || official.email || '';
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Activity className="h-5 w-5" />
                            User Activity Log
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Recent activities performed by {getUserName()}
                        </CardDescription>
                    </div>
                    {official.user && getUserEmail() && (
                        <Badge variant="outline" className="dark:border-gray-600 px-3 py-1">
                            <User className="h-3 w-3 mr-1" />
                            {getUserEmail()}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {!official.user ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                            No User Account Associated
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Activity logs are only available for officials with linked user accounts
                        </p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                            No Activity Records Found
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Activities will appear here when the user logs in or performs actions
                        </p>
                        {official.user.last_login_at && (
                            <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                                Last login: {formatDateTime(official.user.last_login_at)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Activity Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Activities</p>
                                <p className="text-xl font-bold dark:text-gray-200">{activities.length}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 Days</p>
                                <p className="text-xl font-bold dark:text-gray-200">{activitiesLast30Days}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last Activity</p>
                                <p className="text-sm font-medium dark:text-gray-200">
                                    {lastActivity ? formatDateTime(lastActivity.created_at) : 'N/A'}
                                </p>
                                {lastActivity && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {formatTimeAgo(lastActivity.created_at)}
                                    </p>
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Account Status</p>
                                <p className="text-sm font-medium dark:text-gray-200 capitalize flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Active
                                </p>
                            </div>
                        </div>

                        {/* Activity Table */}
                        <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
                            <Table>
                                <TableHeader className="dark:bg-gray-900">
                                    <TableRow className="dark:border-gray-700">
                                        <TableHead className="w-[120px] dark:text-gray-300">Action</TableHead>
                                        <TableHead className="dark:text-gray-300">Description</TableHead>
                                        <TableHead className="w-[180px] dark:text-gray-300">Date & Time</TableHead>
                                        <TableHead className="w-[100px] dark:text-gray-300">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.map((activity: ActivityLog, index: number) => (
                                        <TableRow key={activity.id || index} className="dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(activity.action)}
                                                    <span className="font-medium dark:text-gray-200 capitalize">
                                                        {activity.action.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                <div className="space-y-1">
                                                    <p>{activity.description}</p>
                                                    {activity.ip_address && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                            <span>IP: {activity.ip_address}</span>
                                                            {activity.user_agent && (
                                                                <span className="truncate max-w-[200px]">
                                                                    • {activity.user_agent.split(' ')[0]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                <div className="flex flex-col">
                                                    <span className="whitespace-nowrap">
                                                        {formatDateTime(activity.created_at)}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        {formatTimeAgo(activity.created_at)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={getStatusVariant(activity.properties?.status)} 
                                                    className="flex items-center gap-1 w-fit"
                                                >
                                                    {getStatusIcon(activity.properties?.status)}
                                                    {activity.properties?.status || 'Success'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Footer Stats */}
                        <div className="flex justify-between items-center pt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Showing {activities.length} activity records
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Last updated: {formatDateTime(new Date().toISOString())}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};