import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
    Search,
    Download,
    Eye,
    AlertCircle,
    Calendar,
    User,
    FileText,
    Clock,
    RefreshCw,
    Loader2,
} from 'lucide-react';

interface AccessLog {
    id: number;
    user_id: number | null;
    ip_address: string;
    user_agent: string | null;
    url: string;
    route_name: string | null;
    method: string;
    action_type: string | null;
    resource_type: string | null;
    resource_id: string | null;
    description: string | null;
    status_code: number | null;
    response_time: number | null;
    is_sensitive: boolean;
    accessed_at: string;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        username: string;
    };
}

interface UserOption {
    id: number;
    name: string;
    email: string;
}

interface AccessLogsProps {
    logs: {
        data: AccessLog[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        path: string;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        search?: string;
        user_id?: string;
        action_type?: string;
        method?: string;
        status_code?: string;
        sensitive?: string;
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    users: UserOption[];
    action_types: string[];
    methods: string[];
    status_codes: number[];
    stats: {
        total_logs: number;
        total_users: number;
        sensitive_actions: number;
        avg_response_time: number;
        today_logs: number;
        top_users: Array<{
            user: UserOption | null;
            access_count: number;
        }>;
    };
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
};

const getMethodColor = (method: string): string => {
    switch (method) {
        case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'PATCH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

const getStatusCodeColor = (code: number | null): string => {
    if (!code) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    if (code >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

const truncateText = (text: string | null, length: number = 50): string => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatResponseTime = (time: number | null): string => {
    if (!time) return 'N/A';
    return `${time}ms`;
};

export default function AccessLogs({
    logs,
    filters,
    users,
    action_types,
    methods,
    status_codes,
    stats
}: AccessLogsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [actionType, setActionType] = useState(filters.action_type || '');
    const [method, setMethod] = useState(filters.method || '');
    const [statusCode, setStatusCode] = useState(filters.status_code || '');
    const [sensitive, setSensitive] = useState(filters.sensitive || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [perPage, setPerPage] = useState(filters.per_page || '25');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        params.delete('page');
        
        router.get('/reports/access-logs', Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFilter('search', search);
        }
    };

    const resetFilters = () => {
        router.get('/reports/access-logs', {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const exportLogs = () => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        
        window.location.href = `/reports/access-logs/export?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        
        router.get('/reports/access-logs', Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const openLogDetails = (log: AccessLog) => {
        setSelectedLog(log);
    };

    return (
        <AppLayout
            title="Access Logs"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Security', href: '/reports/security-audit' },
                { title: 'Access Logs', href: '/reports/access-logs' }
            ]}
        >
            <Head title="Access Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Access Logs
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Comprehensive audit trail of all user actions and system access
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={exportLogs}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logs</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.total_logs.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.total_users}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sensitive Actions</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.sensitive_actions.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.avg_response_time}ms
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Users */}
                {stats.top_users.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Active Users</CardTitle>
                            <CardDescription>Users with most access in the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.top_users.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        {item.user?.name?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.user?.name || 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.user?.email || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {item.access_count} actions
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Filters</CardTitle>
                                <CardDescription>Refine access log results</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                disabled={isLoading}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Search logs..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleSearch}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* User Filter - Using basic select */}
                            <div className="space-y-2">
                                <Label htmlFor="user">User</Label>
                                <select
                                    id="user"
                                    value={userId}
                                    onChange={(e) => handleFilter('user_id', e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Users</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Type Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="actionType">Action Type</Label>
                                <select
                                    id="actionType"
                                    value={actionType}
                                    onChange={(e) => handleFilter('action_type', e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Actions</option>
                                    {action_types
                                        .filter(type => type && type.trim() !== '')
                                        .map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Method Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="method">HTTP Method</Label>
                                <select
                                    id="method"
                                    value={method}
                                    onChange={(e) => handleFilter('method', e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Methods</option>
                                    {methods
                                        .filter(m => m && m.trim() !== '')
                                        .map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Status Code Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="statusCode">Status Code</Label>
                                <select
                                    id="statusCode"
                                    value={statusCode}
                                    onChange={(e) => handleFilter('status_code', e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Status Codes</option>
                                    {status_codes
                                        .filter(code => code != null && code !== '')
                                        .map((code) => (
                                            <option key={code} value={code.toString()}>
                                                {code}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Sensitive Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="sensitive">Sensitive Actions</Label>
                                <select
                                    id="sensitive"
                                    value={sensitive}
                                    onChange={(e) => handleFilter('sensitive', e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Actions</option>
                                    <option value="true">Sensitive Only</option>
                                    <option value="false">Non-Sensitive Only</option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-2">
                                <Label htmlFor="dateFrom">Date From</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="dateFrom"
                                        type="date"
                                        className="pl-9"
                                        value={dateFrom}
                                        onChange={(e) => handleFilter('date_from', e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateTo">Date To</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="dateTo"
                                        type="date"
                                        className="pl-9"
                                        value={dateTo}
                                        onChange={(e) => handleFilter('date_to', e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Per Page Selector */}
                        <div className="mt-4 flex justify-end">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="perPage">Rows per page:</Label>
                                <select
                                    id="perPage"
                                    value={perPage}
                                    onChange={(e) => handleFilter('per_page', e.target.value)}
                                    disabled={isLoading}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Access Logs</CardTitle>
                        <CardDescription>
                            Showing {logs.from} to {logs.to} of {logs.total} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="relative">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                                        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Timestamp
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    IP Address
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Method
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    URL/Route
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Resource
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Response Time
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {logs.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="px-4 py-8 text-center">
                                                        <div className="flex flex-col items-center justify-center space-y-2">
                                                            <Eye className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                                                            <p className="text-gray-500 dark:text-gray-400">No access logs found</p>
                                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                                Try adjusting your filters or check back later
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.data.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                                    {formatDate(log.accessed_at)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {getRelativeTime(log.accessed_at)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {log.user ? (
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {log.user.first_name} {log.user.last_name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {log.user.email}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 dark:text-gray-400">System</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <code className="text-xs text-gray-600 dark:text-gray-400">
                                                                {log.ip_address}
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <Badge className={getMethodColor(log.method)}>
                                                                {log.method}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 max-w-xs">
                                                            <div className="truncate" title={`Route: ${log.route_name || 'N/A'}\nURL: ${log.url}`}>
                                                                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                                                                    {truncateText(log.route_name || log.url, 30)}
                                                                </p>
                                                                {log.url !== log.route_name && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {truncateText(log.url, 40)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <Badge variant="outline">
                                                                {log.action_type || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-sm">
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {log.resource_type || 'N/A'}
                                                                </span>
                                                                {log.resource_id && (
                                                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                                        #{log.resource_id}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <Badge className={getStatusCodeColor(log.status_code)}>
                                                                {log.status_code || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatResponseTime(log.response_time)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openLogDetails(log)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {logs.data.length > 0 && logs.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination 
                                    currentPage={logs.current_page}
                                    totalPages={logs.last_page}
                                    onPageChange={handlePageChange}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Log Details Dialog */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Access Log Details
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    ×
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Timestamp</Label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(selectedLog.accessed_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">User</Label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {selectedLog.user 
                                                ? `${selectedLog.user.first_name} ${selectedLog.user.last_name} (${selectedLog.user.email})`
                                                : 'System'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">IP Address</Label>
                                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                                            {selectedLog.ip_address}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Method</Label>
                                        <Badge className={getMethodColor(selectedLog.method)}>
                                            {selectedLog.method}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status Code</Label>
                                        <Badge className={getStatusCodeColor(selectedLog.status_code)}>
                                            {selectedLog.status_code || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Response Time</Label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatResponseTime(selectedLog.response_time)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium">URL</Label>
                                    <p className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs break-all text-gray-900 dark:text-white">
                                        {selectedLog.url}
                                    </p>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium">Route Name</Label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {selectedLog.route_name || 'N/A'}
                                    </p>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium">Action Type</Label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {selectedLog.action_type || 'N/A'}
                                    </p>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium">Resource</Label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {selectedLog.resource_type || 'N/A'} {selectedLog.resource_id ? `#${selectedLog.resource_id}` : ''}
                                    </p>
                                </div>
                                
                                {selectedLog.description && (
                                    <div>
                                        <Label className="text-sm font-medium">Description</Label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {selectedLog.description}
                                        </p>
                                    </div>
                                )}
                                
                                {selectedLog.is_sensitive && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                Sensitive Action
                                            </span>
                                        </div>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            This action involved sensitive data or operations.
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={() => setSelectedLog(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}