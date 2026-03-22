// components/admin/users/show/components/tabs/activity-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Activity, 
    Clock, 
    LogIn, 
    LogOut, 
    Edit, 
    Trash2, 
    UserPlus, 
    KeyRound, 
    Shield, 
    Mail,
    Eye,
    RefreshCw,
    Filter,
    Calendar,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface ActivityTabProps {
    user: any;
    activityLogs: any[];
    stats: any;
    onLogoutAll: () => void;
    isLoggingOutAll: boolean;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const ActivityTab = ({
    user,
    activityLogs,
    stats,
    onLogoutAll,
    isLoggingOutAll,
    formatDate
}: ActivityTabProps) => {
    const [filter, setFilter] = useState<'all' | 'login' | 'action' | 'admin'>('all');
    const [showFilters, setShowFilters] = useState(false);

    const getActionIcon = (action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('login')) return <LogIn className="h-4 w-4 text-green-600" />;
        if (actionLower.includes('logout')) return <LogOut className="h-4 w-4 text-orange-600" />;
        if (actionLower.includes('create')) return <UserPlus className="h-4 w-4 text-blue-600" />;
        if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit className="h-4 w-4 text-purple-600" />;
        if (actionLower.includes('delete')) return <Trash2 className="h-4 w-4 text-red-600" />;
        if (actionLower.includes('password')) return <KeyRound className="h-4 w-4 text-yellow-600" />;
        if (actionLower.includes('role') || actionLower.includes('permission')) return <Shield className="h-4 w-4 text-indigo-600" />;
        if (actionLower.includes('email')) return <Mail className="h-4 w-4 text-cyan-600" />;
        return <Activity className="h-4 w-4 text-gray-600" />;
    };

    const filteredLogs = activityLogs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'login') return log.action.toLowerCase().includes('login');
        if (filter === 'action') return !log.action.toLowerCase().includes('login') && !log.action.toLowerCase().includes('admin');
        if (filter === 'admin') return log.action.toLowerCase().includes('admin');
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Activity Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="text-2xl font-bold mt-2 dark:text-gray-100">{stats.total_activities || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Activities</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <LogIn className="h-8 w-8 mx-auto text-green-500" />
                            <p className="text-2xl font-bold mt-2 dark:text-gray-100">{stats.login_count || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Logins</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto text-orange-500" />
                            <p className="text-2xl font-bold mt-2 dark:text-gray-100">{stats.last_week_activities || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 Days</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logout All Sessions Button */}
            <Card className="dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Active Sessions</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Force logout from all devices and browsers
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={onLogoutAll}
                            disabled={isLoggingOutAll}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoggingOutAll ? 'animate-spin' : ''}`} />
                            {isLoggingOutAll ? 'Logging out...' : 'Logout All Sessions'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Logs Table */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <Activity className="h-5 w-5" />
                                Activity Logs
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Recent actions performed by this user
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                        </Button>
                    </div>
                    
                    {showFilters && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'login' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('login')}
                            >
                                <LogIn className="h-3 w-3 mr-1" />
                                Logins
                            </Button>
                            <Button
                                variant={filter === 'action' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('action')}
                            >
                                <Activity className="h-3 w-3 mr-1" />
                                Actions
                            </Button>
                            <Button
                                variant={filter === 'admin' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('admin')}
                            >
                                <Shield className="h-3 w-3 mr-1" />
                                Admin Actions
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No activity records found</p>
                        </div>
                    ) : (
                        <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
                            <Table>
                                <TableHeader className="dark:bg-gray-900">
                                    <TableRow className="dark:border-gray-700">
                                        <TableHead className="w-[100px] dark:text-gray-300">Action</TableHead>
                                        <TableHead className="dark:text-gray-300">Description</TableHead>
                                        <TableHead className="w-[180px] dark:text-gray-300">Date & Time</TableHead>
                                        <TableHead className="w-[100px] dark:text-gray-300">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log: any) => (
                                        <TableRow key={log.id} className="dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(log.action)}
                                                    <span className="font-medium dark:text-gray-200 capitalize">
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                <div className="space-y-1">
                                                    <p>{log.description}</p>
                                                    {log.ip_address && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                                            IP: {log.ip_address}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                <div className="flex flex-col">
                                                    <span className="whitespace-nowrap">
                                                        {formatDate(log.created_at, true)}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        {formatDate(log.created_at, false)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                                    {log.status || 'Success'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};