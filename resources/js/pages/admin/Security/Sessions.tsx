import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Monitor, 
    Users, 
    Globe, 
    Clock, 
    RefreshCw, 
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    User as UserIcon,
    Smartphone,
    Computer,
    Tablet,
    Shield,
    LogOut,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Session {
    session_id: string;
    user_id: number;
    ip_address: string;
    user_agent: string;
    last_activity: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    device_info: {
        browser: string;
        os: string;
    };
    last_activity_formatted: string;
    last_activity_full: string;
    is_active: boolean;
    user_full_name: string;
    login_time: string | null;
    session_duration: string;
}

interface SessionsProps {
    sessions: Session[];
    stats: {
        total_active: number;
        total_sessions: number;
        unique_users: number;
        unique_ips: number;
    };
    filters: {
        search?: string;
        user_id?: string;
        status?: string;
    };
}

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

const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile')) {
        return <Smartphone className="h-4 w-4" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        return <Tablet className="h-4 w-4" />;
    } else {
        return <Computer className="h-4 w-4" />;
    }
};

const getBrowserClass = (browser: string): string => {
    const classes: Record<string, string> = {
        'Chrome': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'Firefox': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
        'Safari': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'Edge': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'Opera': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    
    return classes[browser] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

const getStatusClass = (isActive: boolean): string => {
    return isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

export default function Sessions({ sessions, stats, filters }: SessionsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

    const handleForceLogout = (sessionId: string, userName: string) => {
        if (!confirm(`Are you sure you want to force logout ${userName}?`)) {
            return;
        }

        router.delete(`/admin/sessions/${sessionId}/force-logout`, {
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onSuccess: () => {
                toast.success('Session terminated successfully');
                setIsLoading(false);
            },
            onError: () => {
                toast.error('Failed to terminate session');
                setIsLoading(false);
            },
        });
    };

    const toggleSessionExpansion = (sessionId: string) => {
        setExpandedSessions(prev => {
            const next = new Set(prev);
            if (next.has(sessionId)) {
                next.delete(sessionId);
            } else {
                next.add(sessionId);
            }
            return next;
        });
    };

    const handleRefresh = () => {
        router.get('/admin/sessions', {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AppLayout
            title="Active Sessions"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Security', href: '/reports/security-audit' },
                { title: 'Active Sessions', href: '/admin/sessions' }
            ]}
        >
            <Head title="Active Sessions" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Active User Sessions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor and manage currently logged-in users
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Now</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total_active}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Monitor className="h-3 w-3" />
                                    <span>Currently online</span>
                                </div>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Monitor className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total_sessions}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Users className="h-3 w-3" />
                                    <span>Last 24 hours</span>
                                </div>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.unique_users}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <UserIcon className="h-3 w-3" />
                                    <span>Distinct users</span>
                                </div>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique IPs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.unique_ips}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Globe className="h-3 w-3" />
                                    <span>Distinct locations</span>
                                </div>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Active Sessions ({sessions.length})
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Real-time monitoring of user sessions
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search sessions..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sessions.map((session) => (
                                <div key={session.session_id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
                                                {getDeviceIcon(session.user_agent)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {session.user_full_name}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getStatusClass(session.is_active)}`}>
                                                        {session.is_active ? (
                                                            <>
                                                                <CheckCircle className="h-3 w-3" />
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="h-3 w-3" />
                                                                Idle
                                                            </>
                                                        )}
                                                    </span>
                                                    {session.device_info.browser && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getBrowserClass(session.device_info.browser)}`}>
                                                            {session.device_info.browser}
                                                        </span>
                                                    )}
                                                    {session.device_info.os && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                                                            {session.device_info.os}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <UserIcon className="h-3 w-3" />
                                                        <span>{session.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        <span className="font-mono text-xs">{session.ip_address}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>Last activity: {session.last_activity_formatted}</span>
                                                    </div>
                                                    {session.login_time && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>Duration: {session.session_duration}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Expanded Details */}
                                                {expandedSessions.has(session.session_id) && (
                                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Details</h4>
                                                                <div className="space-y-1 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Session ID:</span>
                                                                        <span className="font-mono text-gray-900 dark:text-white text-xs">
                                                                            {session.session_id.substring(0, 20)}...
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">User ID:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {session.user_id}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Last Activity:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {session.last_activity_full}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Status:</span>
                                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(session.is_active)}`}>
                                                                            {session.is_active ? 'Active' : 'Idle'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device Information</h4>
                                                                <div className="space-y-1 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Browser:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {session.device_info.browser}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Operating System:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {session.device_info.os}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">IP Address:</span>
                                                                        <span className="font-mono text-gray-900 dark:text-white text-xs">
                                                                            {session.ip_address}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* User Agent Details */}
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                User Agent
                                                            </h4>
                                                            <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                                                {session.user_agent}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleSessionExpansion(session.session_id)}
                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                {expandedSessions.has(session.session_id) ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleForceLogout(session.session_id, session.user_full_name)}
                                                disabled={isLoading}
                                                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded disabled:opacity-50"
                                            >
                                                <LogOut className="h-3 w-3" />
                                                Force Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center p-6">
                            <Monitor className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                                No active sessions found
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Users will appear here when they log in
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}