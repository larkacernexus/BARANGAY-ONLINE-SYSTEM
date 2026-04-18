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
    X,
    Filter,
    ChevronDown,
    ChevronUp,
    Globe,
    Server,
    Activity,
    Shield,
    Terminal,
    Database,
    BarChart3,
    Users,
    AlertTriangle,
    CheckCircle,
    XCircle,
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
    accessed_at_formatted?: string;
    accessed_at_relative?: string;
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

// Helper function to format date consistently
const formatDate = (dateString: string, includeTime: boolean = true): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        
        return date.toLocaleDateString('en-PH', options);
    } catch {
        return '';
    }
};

// Helper function to get relative time
const getRelativeTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString, false);
};

// Get method color class - consistent with ActivityLogs
const getMethodColor = (method: string): string => {
    const classes: Record<string, string> = {
        'GET': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border dark:border-blue-800',
        'POST': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border dark:border-green-800',
        'PUT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 dark:border dark:border-yellow-800',
        'PATCH': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 dark:border dark:border-orange-800',
        'DELETE': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border dark:border-red-800',
    };
    
    return classes[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700';
};

// Get status code color class - consistent with ActivityLogs
const getStatusCodeColor = (code: number | null): string => {
    if (!code) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700';
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border dark:border-green-800';
    if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border dark:border-blue-800';
    if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 dark:border dark:border-yellow-800';
    if (code >= 500) return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border dark:border-red-800';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700';
};

// Get action type color class
const getActionTypeColor = (actionType: string | null): string => {
    if (!actionType) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700';
    
    const classes: Record<string, string> = {
        'view': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border dark:border-blue-800',
        'create': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border dark:border-green-800',
        'update': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 dark:border dark:border-yellow-800',
        'delete': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border dark:border-red-800',
        'login': 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:border dark:border-purple-800',
        'logout': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 dark:border dark:border-indigo-800',
        'export': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:border dark:border-amber-800',
        'import': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 dark:border dark:border-cyan-800',
    };
    
    return classes[actionType.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700';
};

// Get method icon
const getMethodIcon = (method: string) => {
    switch (method) {
        case 'GET': return <Eye className="h-3 w-3" />;
        case 'POST': return <FileText className="h-3 w-3" />;
        case 'PUT': return <RefreshCw className="h-3 w-3" />;
        case 'PATCH': return <Activity className="h-3 w-3" />;
        case 'DELETE': return <XCircle className="h-3 w-3" />;
        default: return <Terminal className="h-3 w-3" />;
    }
};

// Get status icon
const getStatusIcon = (code: number | null) => {
    if (!code) return <AlertCircle className="h-3 w-3" />;
    if (code >= 200 && code < 300) return <CheckCircle className="h-3 w-3" />;
    if (code >= 300 && code < 400) return <RefreshCw className="h-3 w-3" />;
    if (code >= 400 && code < 500) return <AlertTriangle className="h-3 w-3" />;
    if (code >= 500) return <XCircle className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
};

const truncateText = (text: string | null, length: number = 50): string => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatResponseTime = (time: number | null): string => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
};

// Clean filter parameters
const cleanFilterParams = (params: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
            cleaned[key] = value.trim();
        } else if (typeof value === 'number') {
            cleaned[key] = value;
        }
    });
    
    return cleaned;
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
    const [showFilters, setShowFilters] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    // Build filter parameters
    const buildFilterParams = (): Record<string, any> => {
        const params: Record<string, any> = {};
        
        if (search.trim()) params.search = search.trim();
        if (userId) params.user_id = userId;
        if (actionType) params.action_type = actionType;
        if (method) params.method = method;
        if (statusCode) params.status_code = statusCode;
        if (sensitive) params.sensitive = sensitive;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (perPage !== '25') params.per_page = perPage;
        
        return params;
    };

    const handleFilter = (key: string, value: string) => {
        // Update local state based on key
        switch (key) {
            case 'search': setSearch(value); break;
            case 'user_id': setUserId(value); break;
            case 'action_type': setActionType(value); break;
            case 'method': setMethod(value); break;
            case 'status_code': setStatusCode(value); break;
            case 'sensitive': setSensitive(value); break;
            case 'date_from': setDateFrom(value); break;
            case 'date_to': setDateTo(value); break;
            case 'per_page': setPerPage(value); break;
        }
        
        const params = cleanFilterParams({
            ...buildFilterParams(),
            [key]: value || undefined,
        });
        
        // Remove page parameter
        delete params.page;
        
        router.get('/reports/access-logs', params, {
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
        setSearch('');
        setUserId('');
        setActionType('');
        setMethod('');
        setStatusCode('');
        setSensitive('');
        setDateFrom('');
        setDateTo('');
        setPerPage('25');
        
        router.get('/reports/access-logs', {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleRefresh = () => {
        const params = buildFilterParams();
        router.get('/reports/access-logs', params, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const exportLogs = () => {
        setIsLoading(true);
        
        const exportParams: Record<string, any> = { format: 'csv' };
        const filterParams = buildFilterParams();
        
        Object.entries(filterParams).forEach(([key, value]) => {
            exportParams[key] = value;
        });

        router.get('/reports/access-logs/export', exportParams, {
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            }
        });
    };

    const handlePageChange = (page: number) => {
        const params = { ...buildFilterParams(), page };
        
        router.get('/reports/access-logs', cleanFilterParams(params), {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const toggleLogExpansion = (logId: number) => {
        setExpandedLogs(prev => {
            const next = new Set(prev);
            if (next.has(logId)) {
                next.delete(logId);
            } else {
                next.add(logId);
            }
            return next;
        });
    };

    const openLogDetails = (log: AccessLog) => {
        setSelectedLog(log);
    };

    // Check if filters are active
    const hasActiveFilters = 
        search.trim() !== '' || 
        userId !== '' || 
        actionType !== '' || 
        method !== '' || 
        statusCode !== '' || 
        sensitive !== '' || 
        dateFrom !== '' || 
        dateTo !== '' || 
        perPage !== '25';

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
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        
                        <Button
                            onClick={exportLogs}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Stats Cards - 4 Equal Size Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Logs */}
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full">
                        <CardContent className="pt-6 h-full flex flex-col">
                            <div className="flex items-start justify-between flex-1">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logs</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.total_logs.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Database className="h-3 w-3" />
                                        <span>All access records</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg flex-shrink-0">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unique Users */}
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full">
                        <CardContent className="pt-6 h-full flex flex-col">
                            <div className="flex items-start justify-between flex-1">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.total_users.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Users className="h-3 w-3" />
                                        <span>Active users tracked</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg flex-shrink-0">
                                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sensitive Actions */}
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full">
                        <CardContent className="pt-6 h-full flex flex-col">
                            <div className="flex items-start justify-between flex-1">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sensitive Actions</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.sensitive_actions.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Shield className="h-3 w-3" />
                                        <span>Security events</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Average Response Time */}
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-full">
                        <CardContent className="pt-6 h-full flex flex-col">
                            <div className="flex items-start justify-between flex-1">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stats.avg_response_time}ms
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <BarChart3 className="h-3 w-3" />
                                        <span>System performance</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg flex-shrink-0">
                                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Users */}
                {stats.top_users.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-500" />
                                <CardTitle>Top Active Users</CardTitle>
                            </div>
                            <CardDescription>Users with most access in the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.top_users.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
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
                                        <Badge variant="outline" className="bg-primary-50 dark:bg-primary-900/20">
                                            {item.access_count} actions
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Filters</CardTitle>
                                <CardDescription>Refine access log results</CardDescription>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    
                    {showFilters && (
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
                                        {search && (
                                            <button
                                                onClick={() => handleFilter('search', '')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* User Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="user">User</Label>
                                    <select
                                        id="user"
                                        value={userId}
                                        onChange={(e) => handleFilter('user_id', e.target.value)}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
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
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
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
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
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
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                                    >
                                        <option value="">All Status Codes</option>
                                        {status_codes
                                            .filter(code => code != null)
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
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
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

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-wrap gap-2">
                                        {search && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded text-sm">
                                                Search: "{search}"
                                            </span>
                                        )}
                                        {userId && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 rounded text-sm">
                                                User: {users.find(u => u.id === parseInt(userId))?.name || userId}
                                            </span>
                                        )}
                                        {actionType && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                                                Action: {actionType}
                                            </span>
                                        )}
                                        {method && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 rounded text-sm">
                                                Method: {method}
                                            </span>
                                        )}
                                        {statusCode && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                                                Status: {statusCode}
                                            </span>
                                        )}
                                        {sensitive && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 rounded text-sm">
                                                {sensitive === 'true' ? 'Sensitive Only' : 'Non-Sensitive Only'}
                                            </span>
                                        )}
                                        {(dateFrom || dateTo) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded text-sm">
                                                Date: {dateFrom || 'Start'} to {dateTo || 'End'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Per Page Selector */}
                            <div className="mt-4 flex justify-end">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="perPage">Rows per page:</Label>
                                    <select
                                        id="perPage"
                                        value={perPage}
                                        onChange={(e) => handleFilter('per_page', e.target.value)}
                                        disabled={isLoading}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Logs Table */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle>Access Log Entries</CardTitle>
                        <CardDescription>
                            Showing {logs.from || 0} to {logs.to || 0} of {logs.total} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                                                    Response
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {logs.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="px-4 py-8 text-center">
                                                        <div className="flex flex-col items-center justify-center space-y-2">
                                                            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                                                            <p className="text-gray-500 dark:text-gray-400">No access logs found</p>
                                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                                Try adjusting your filters or check back later
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.data.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                                    {formatDate(log.accessed_at)}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
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
                                                                <div className="flex items-center gap-1">
                                                                    <Server className="h-3 w-3 text-gray-400" />
                                                                    <span className="text-gray-500 dark:text-gray-400">System</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-1">
                                                                <Globe className="h-3 w-3 text-gray-400" />
                                                                <code className="text-xs text-gray-600 dark:text-gray-400">
                                                                    {log.ip_address}
                                                                </code>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <Badge className={`${getMethodColor(log.method)} flex items-center gap-1 w-fit`}>
                                                                {getMethodIcon(log.method)}
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
                                                            <Badge className={getActionTypeColor(log.action_type)}>
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
                                                            <Badge className={`${getStatusCodeColor(log.status_code)} flex items-center gap-1 w-fit`}>
                                                                {getStatusIcon(log.status_code)}
                                                                {log.status_code || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`text-sm font-medium ${
                                                                log.response_time && log.response_time > 1000 
                                                                    ? 'text-amber-600 dark:text-amber-400' 
                                                                    : 'text-gray-900 dark:text-white'
                                                            }`}>
                                                                {formatResponseTime(log.response_time)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-1">
                                                                {log.is_sensitive && (
                                                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        Sensitive
                                                                    </Badge>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openLogDetails(log)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
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

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Access Log Details
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(null)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</Label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {formatDate(selectedLog.accessed_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">User</Label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {selectedLog.user 
                                                ? `${selectedLog.user.first_name} ${selectedLog.user.last_name} (${selectedLog.user.email})`
                                                : 'System Process'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</Label>
                                        <p className="text-sm font-mono text-gray-900 dark:text-white mt-1 flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            {selectedLog.ip_address}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Method</Label>
                                        <div className="mt-1">
                                            <Badge className={getMethodColor(selectedLog.method)}>
                                                {getMethodIcon(selectedLog.method)}
                                                {selectedLog.method}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Code</Label>
                                        <div className="mt-1">
                                            <Badge className={getStatusCodeColor(selectedLog.status_code)}>
                                                {getStatusIcon(selectedLog.status_code)}
                                                {selectedLog.status_code || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Time</Label>
                                        <p className={`text-sm mt-1 ${
                                            selectedLog.response_time && selectedLog.response_time > 1000 
                                                ? 'text-amber-600 dark:text-amber-400' 
                                                : 'text-gray-900 dark:text-white'
                                        }`}>
                                            {formatResponseTime(selectedLog.response_time)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</Label>
                                    <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs break-all text-gray-900 dark:text-white mt-1 border border-gray-200 dark:border-gray-700">
                                        {selectedLog.url}
                                    </p>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Route Name</Label>
                                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                                        {selectedLog.route_name || 'N/A'}
                                    </p>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Action Type</Label>
                                    <div className="mt-1">
                                        <Badge className={getActionTypeColor(selectedLog.action_type)}>
                                            {selectedLog.action_type || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Resource</Label>
                                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                                        {selectedLog.resource_type || 'N/A'} {selectedLog.resource_id ? `#${selectedLog.resource_id}` : ''}
                                    </p>
                                </div>
                                
                                {selectedLog.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {selectedLog.description}
                                        </p>
                                    </div>
                                )}
                                
                                {selectedLog.user_agent && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">User Agent</Label>
                                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1 break-all">
                                            {selectedLog.user_agent}
                                        </p>
                                    </div>
                                )}
                                
                                {selectedLog.is_sensitive && (
                                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                Sensitive Action
                                            </span>
                                        </div>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            This action involved sensitive data or operations that require additional security monitoring.
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <Button onClick={() => setSelectedLog(null)}>
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