import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Shield, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Globe, 
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Lock,
    RefreshCw,
    Calendar,
    FileText,
    User as UserIcon,
    Smartphone,
    Search,
    Filter,
    Loader2,
    Eye,
    Download
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FailedLogin {
    id: number;
    user_id: number | null;
    ip_address: string | null;
    user_agent: string | null;
    device_type: string | null;
    browser: string | null;
    platform: string | null;
    login_at: string;
    failure_reason: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface SuspiciousIp {
    ip_address: string;
    attempt_count: number;
    last_attempt: string;
    first_attempt: string;
    location: {
        country: string;
        city: string;
        isp: string;
    };
}

interface PasswordChange {
    id: number;
    description: string;
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
}

interface SecurityEvent {
    id: number;
    description: string;
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
}

interface SecurityTrend {
    date: string;
    failed_logins: number;
    successful_logins: number;
    sensitive_actions: number;
}

interface AuditProps {
    failed_logins: FailedLogin[];
    suspicious_ips: SuspiciousIp[];
    password_changes: PasswordChange[];
    security_events: SecurityEvent[];
    two_factor_stats: {
        enabled: number;
        disabled: number;
        total: number;
    };
    stats: {
        failed_login_attempts: number;
        successful_logins: number;
        suspicious_ips: number;
        password_changes: number;
        security_events: number;
        unique_users_logged_in: number;
        average_session_duration: string;
    };
    trends: SecurityTrend[];
    filters: {
        date_from: string;
        date_to: string;
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

export default function SecurityAudit({
    failed_logins,
    suspicious_ips,
    password_changes,
    security_events,
    two_factor_stats,
    stats,
    trends,
    filters
}: AuditProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [isLoading, setIsLoading] = useState(false);

    const handleDateFilter = () => {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        
        router.get('/security/security-audit', params, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleRefresh = () => {
        router.get('/security/security-audit', {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const twoFactorPercentage = two_factor_stats.total > 0 
        ? Math.round((two_factor_stats.enabled / two_factor_stats.total) * 100)
        : 0;

    return (
        <AppLayout
            title="Security Audit"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Security', href: '/security/security-audit' },
                { title: 'Security Audit', href: '/security/security-audit' }
            ]}
        >
            <Head title="Security Audit" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Security Audit Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Comprehensive security monitoring and threat detection
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        
                        <Link
                            href="/security/access-logs"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                            View Access Logs
                        </Link>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Date Range</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Filter security events by date</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300">From:</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300">To:</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <button
                                onClick={handleDateFilter}
                                disabled={isLoading}
                                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Logins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.failed_login_attempts}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Authentication failures</span>
                                </div>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful Logins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.successful_logins}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Authentication successes</span>
                                </div>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspicious IPs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.suspicious_ips}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Globe className="h-3 w-3" />
                                    <span>Potential threats</span>
                                </div>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.unique_users_logged_in}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Users className="h-3 w-3" />
                                    <span>Active accounts</span>
                                </div>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-Factor Authentication Stats */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="h-5 w-5 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Security enhancement status</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {two_factor_stats.enabled}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enabled 2FA</p>
                            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${twoFactorPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {two_factor_stats.disabled}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Disabled 2FA</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {two_factor_stats.total}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Users</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">2FA Adoption Rate</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {twoFactorPercentage}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Failed Login Attempts */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Failed Login Attempts</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Latest authentication failures</p>
                            </div>
                        </div>
                        <Link
                            href="/reports/login-logs?status=failed"
                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                            View all →
                        </Link>
                    </div>
                    
                    <div className="space-y-3">
                        {failed_logins.length > 0 ? (
                            failed_logins.map((login) => (
                                <div key={login.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {login.user ? login.user.name : 'Unknown user'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {getRelativeTime(login.login_at)}
                                                </span>
                                                {login.ip_address && (
                                                    <span className="text-xs font-mono text-gray-500">
                                                        • {login.ip_address}
                                                    </span>
                                                )}
                                                {login.failure_reason && (
                                                    <span className="text-xs text-red-600 dark:text-red-400">
                                                        • {login.failure_reason}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {login.device_type || 'Desktop'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No failed login attempts found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Suspicious IPs */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-amber-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Suspicious IP Addresses</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">IPs with multiple failed attempts</p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {suspicious_ips.length} detected
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {suspicious_ips.length > 0 ? (
                            suspicious_ips.map((ip, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium text-gray-900 dark:text-white">
                                                {ip.ip_address}
                                            </span>
                                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium rounded">
                                                {ip.attempt_count} attempts
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            <span>{ip.location.country}, {ip.location.city}</span>
                                            <span>•</span>
                                            <span>Last: {getRelativeTime(ip.last_attempt)}</span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/reports/login-logs?search=${ip.ip_address}`}
                                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No suspicious IPs detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trends Chart (Simple) */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Trends</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days activity</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {trends.map((trend, index) => {
                            const maxValue = Math.max(
                                ...trends.map(t => Math.max(t.failed_logins, t.successful_logins, t.sensitive_actions))
                            );
                            
                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {new Date(trend.date).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-red-600 dark:text-red-400">
                                                {trend.failed_logins} failed
                                            </span>
                                            <span className="text-green-600 dark:text-green-400">
                                                {trend.successful_logins} success
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {trend.sensitive_actions} sensitive
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="flex h-full">
                                            <div 
                                                className="bg-red-500"
                                                style={{ width: `${(trend.failed_logins / maxValue) * 100}%` }}
                                            ></div>
                                            <div 
                                                className="bg-green-500"
                                                style={{ width: `${(trend.successful_logins / maxValue) * 100}%` }}
                                            ></div>
                                            <div 
                                                className="bg-blue-500"
                                                style={{ width: `${(trend.sensitive_actions / maxValue) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}