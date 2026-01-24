// resources/js/Pages/Admin/Reports/LoginLogShow.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    User as UserIcon,
    Clock,
    Globe,
    Network,
    Computer,
    Smartphone,
    Tablet,
    Monitor,
    CheckCircle,
    AlertCircle,
    Shield,
    LogIn,
    LogOut,
    FileText,
    HardDrive,
    Server,
    ChevronLeft,
    Chrome
} from 'lucide-react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    created_at: string;
    updated_at: string;
}

interface LoginLog {
    id: number;
    user_id: number | null;
    ip_address: string | null;
    user_agent: string | null;
    device_type: string | null;
    browser: string | null;
    platform: string | null;
    login_at: string;
    logout_at: string | null;
    is_successful: boolean;
    failure_reason: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
}

interface LoginLogShowProps extends PageProps {
    log: LoginLog;
    related_logs: LoginLog[];
}

// Helper functions
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

const getSessionDuration = (loginAt: string, logoutAt: string | null): string => {
    if (!logoutAt) return 'Still active';
    
    const login = new Date(loginAt);
    const logout = new Date(logoutAt);
    const durationMs = logout.getTime() - login.getTime();
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
};

const getStatusClass = (isSuccessful: boolean): string => {
    return isSuccessful 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
};

const getDeviceClass = (deviceType: string | null): string => {
    const classes: Record<string, string> = {
        'Desktop': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'Mobile': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'Tablet': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    };
    
    return classes[deviceType || 'Desktop'] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

const getBrowserClass = (browser: string | null): string => {
    const classes: Record<string, string> = {
        'Chrome': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'Firefox': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
        'Safari': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'Edge': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'Opera': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    
    return classes[browser || 'Unknown'] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
        case 'Mobile':
            return <Smartphone className="h-5 w-5" />;
        case 'Tablet':
            return <Tablet className="h-5 w-5" />;
        default:
            return <Computer className="h-5 w-5" />;
    }
};

const getBrowserIcon = (browser: string | null) => {
    if (!browser) return <Globe className="h-5 w-5" />;
    
    const browserLower = browser.toLowerCase();
    
    if (browserLower.includes('chrome')) {
        return <Chrome className="h-5 w-5" />;
    }
    
    // For other browsers, use Globe
    return <Globe className="h-5 w-5" />;
};

const parseUserAgentDetails = (userAgent: string | null) => {
    if (!userAgent) return null;
    
    try {
        const ua = userAgent.toLowerCase();
        let browser = 'Unknown';
        let browserVersion = 'Unknown';
        let os = 'Unknown';
        let osVersion = 'Unknown';
        let device = 'Desktop';
        let isMobile = false;
        let isTablet = false;
        let isDesktop = true;
        
        // Browser detection
        if (ua.includes('chrome') && !ua.includes('edg')) {
            browser = 'Chrome';
            const match = ua.match(/chrome\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('firefox')) {
            browser = 'Firefox';
            const match = ua.match(/firefox\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
            browser = 'Safari';
            const match = ua.match(/version\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('edg')) {
            browser = 'Edge';
            const match = ua.match(/edg\/([\d.]+)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('opera')) {
            browser = 'Opera';
            const match = ua.match(/opera\/([\d.]+)/);
            if (match) browserVersion = match[1];
        }
        
        // OS detection
        if (ua.includes('windows')) {
            os = 'Windows';
            const match = ua.match(/windows nt ([\d.]+)/);
            if (match) {
                const version = match[1];
                osVersion = version === '10.0' ? '10/11' : version;
            }
        } else if (ua.includes('mac os x')) {
            os = 'macOS';
            const match = ua.match(/mac os x ([\d_]+)/);
            if (match) osVersion = match[1].replace(/_/g, '.');
        } else if (ua.includes('linux')) {
            os = 'Linux';
            osVersion = '';
        } else if (ua.includes('android')) {
            os = 'Android';
            isMobile = true;
            isDesktop = false;
            const match = ua.match(/android ([\d.]+)/);
            if (match) osVersion = match[1];
        } else if (ua.includes('iphone') || ua.includes('ipad')) {
            os = 'iOS';
            isMobile = ua.includes('iphone');
            isTablet = ua.includes('ipad');
            isDesktop = false;
            const match = ua.match(/os ([\d_]+)/);
            if (match) osVersion = match[1].replace(/_/g, '.');
        }
        
        // Device detection
        if (ua.includes('mobile')) device = 'Mobile';
        if (ua.includes('tablet')) device = 'Tablet';
        if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) device = 'Desktop';
        
        return {
            browser,
            browserVersion,
            os,
            osVersion,
            device,
            isMobile,
            isTablet,
            isDesktop
        };
    } catch {
        return null;
    }
};

export default function LoginLogShow({ log, related_logs }: LoginLogShowProps) {
    const userAgentDetails = log.user_agent ? parseUserAgentDetails(log.user_agent) : null;
    const sessionDuration = getSessionDuration(log.login_at, log.logout_at);

    return (
        <AppLayout
            title="Login Log Details"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Login Logs', href: '/reports/login-logs' },
                { title: 'Login Details', href: `/reports/login-logs/${log.id}` }
            ]}
        >
            <Head title="Login Log Details" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/reports/login-logs"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Login Logs
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Login Activity Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Detailed view of authentication event
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Login Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Login Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${getStatusClass(log.is_successful)}`}>
                                        {log.is_successful ? (
                                            <CheckCircle className="h-6 w-6" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {log.is_successful ? 'Successful Login' : 'Failed Login Attempt'}
                                            </h2>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getStatusClass(log.is_successful)}`}>
                                                {log.is_successful ? 'SUCCESS' : 'FAILED'}
                                            </span>
                                            {log.device_type && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getDeviceClass(log.device_type)}`}>
                                                    {getDeviceIcon(log.device_type)}
                                                    {log.device_type}
                                                </span>
                                            )}
                                            {log.browser && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getBrowserClass(log.browser)}`}>
                                                    {getBrowserIcon(log.browser)}
                                                    {log.browser}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Status Section */}
                                        {!log.is_successful && log.failure_reason && (
                                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                                    <div>
                                                        <h3 className="font-medium text-red-800 dark:text-red-300">
                                                            Authentication Failed
                                                        </h3>
                                                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                                            {log.failure_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* User Information */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">User Information</h3>
                                            {log.user ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                <UserIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {log.user.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                <UserIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {log.user.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {log.user.username && (
                                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                    <UserIcon className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        @{log.user.username}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <AlertCircle className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                User account has been deleted
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                This user account no longer exists in the system
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Session Timeline */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Session Timeline</h3>
                                            <div className="relative pl-8 space-y-6">
                                                {/* Login Time */}
                                                <div className="relative">
                                                    <div className="absolute left-[-32px] top-0 w-4 h-4 rounded-full bg-green-500 dark:bg-green-400"></div>
                                                    <div className="absolute left-[-28px] top-4 w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            <span className="font-medium text-gray-900 dark:text-white">Login</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {formatDate(log.login_at, true)}
                                                        </p>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {getRelativeTime(log.login_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Logout Time or Current Status */}
                                                {log.logout_at ? (
                                                    <div className="relative">
                                                        <div className="absolute left-[-32px] top-0 w-4 h-4 rounded-full bg-red-500 dark:bg-red-400"></div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                <span className="font-medium text-gray-900 dark:text-white">Logout</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {formatDate(log.logout_at, true)}
                                                            </p>
                                                            <div className="mt-2 text-sm">
                                                                <span className="text-gray-500">Session Duration: </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {sessionDuration}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <div className="absolute left-[-32px] top-0 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                <span className="font-medium text-gray-900 dark:text-white">Active Session</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                User is currently logged in
                                                            </p>
                                                            <div className="mt-2 text-sm">
                                                                <span className="text-gray-500">Active for: </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {getSessionDuration(log.login_at, null)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Device & Network Information */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Device & Network Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {log.ip_address && (
                                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                <Globe className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                                                                <p className="font-mono text-gray-900 dark:text-white text-sm">
                                                                    {log.ip_address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            <span className="inline-flex items-center gap-1">
                                                                <Network className="h-3 w-3" />
                                                                Localhost (127.0.0.1)
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {userAgentDetails && (
                                                    <>
                                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                    {getDeviceIcon(log.device_type || userAgentDetails.device)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Device Type</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {log.device_type || userAgentDetails.device}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                <span className="inline-flex items-center gap-1">
                                                                    {userAgentDetails.isMobile && '📱 Mobile'}
                                                                    {userAgentDetails.isTablet && '📱 Tablet'}
                                                                    {userAgentDetails.isDesktop && '💻 Desktop'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                    {getBrowserIcon(log.browser || userAgentDetails.browser)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Browser</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {log.browser || userAgentDetails.browser}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {userAgentDetails.browserVersion && userAgentDetails.browserVersion !== 'Unknown' && (
                                                                <div className="mt-2 text-xs text-gray-500">
                                                                    Version: {userAgentDetails.browserVersion}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="p-2 bg-white dark:bg-gray-800 rounded">
                                                                    <HardDrive className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Operating System</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {log.platform || userAgentDetails.os}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {userAgentDetails.osVersion && userAgentDetails.osVersion !== '' && (
                                                                <div className="mt-2 text-xs text-gray-500">
                                                                    Version: {userAgentDetails.osVersion}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Raw User Agent Data */}
                                        {log.user_agent && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raw User Agent</h3>
                                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
                                                        {log.user_agent}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Related Logs */}
                        {related_logs && related_logs.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Login Activities</h3>
                                <div className="space-y-3">
                                    {related_logs.slice(0, 5).map((relatedLog) => (
                                        <Link
                                            key={relatedLog.id}
                                            href={`/reports/login-logs/${relatedLog.id}`}
                                            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded ${getStatusClass(relatedLog.is_successful)}`}>
                                                        {relatedLog.is_successful ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <AlertCircle className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {relatedLog.user ? relatedLog.user.name : 'Unknown user'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500">
                                                                {getRelativeTime(relatedLog.login_at)}
                                                            </span>
                                                            {relatedLog.ip_address && (
                                                                <span className="text-xs font-mono text-gray-500">
                                                                    • {relatedLog.ip_address}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {relatedLog.device_type || 'Desktop'}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={`/reports/login-logs?user_id=${log.user_id}`}
                                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                        >
                                            View all login history for this user →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Sidebar with Quick Info & Actions */}
                    <div className="space-y-6">
                        {/* Quick Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Information</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Log ID</p>
                                    <p className="font-mono text-gray-900 dark:text-white">#{log.id}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                    <p className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getStatusClass(log.is_successful)}`}>
                                        {log.is_successful ? 'Successful' : 'Failed'}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Login Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(log.login_at, false)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Login Time</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(log.login_at, true).split(',')[1]?.trim() || formatDate(log.login_at, true)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Session Duration</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {sessionDuration}
                                    </p>
                                </div>
                                
                                {log.ip_address && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">IP Address</p>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                                            {log.ip_address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Actions Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
                            
                            <div className="space-y-3">
                                {log.user && (
                                    <>
                                        <Link
                                            href={`/users/${log.user.id}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            View User Profile
                                        </Link>
                                        <Link
                                            href={`/reports/login-logs?user_id=${log.user.id}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View User's Login History
                                        </Link>
                                    </>
                                )}
                                
                                {log.ip_address && (
                                    <Link
                                        href={`/reports/login-logs?search=${log.ip_address}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <Network className="h-4 w-4" />
                                        Find by IP Address
                                    </Link>
                                )}
                                
                                <Link
                                    href="/reports/login-logs"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to All Logs
                                </Link>
                            </div>
                        </div>
                        
                        {/* Security Notes */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="h-5 w-5 text-amber-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Notes</h3>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                {!log.is_successful ? (
                                    <>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            This failed login attempt may indicate:
                                        </p>
                                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 pl-4">
                                            <li className="list-disc">• Invalid credentials</li>
                                            <li className="list-disc">• Account lockout attempt</li>
                                            <li className="list-disc">• Suspicious activity</li>
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            This successful login shows:
                                        </p>
                                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 pl-4">
                                            <li className="list-disc">• Standard authentication</li>
                                            <li className="list-disc">• Device and location information</li>
                                            <li className="list-disc">• Session duration tracking</li>
                                        </ul>
                                    </>
                                )}
                                
                                {log.ip_address === '127.0.0.1' && (
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500">
                                            ⓘ Localhost access detected (127.0.0.1)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}