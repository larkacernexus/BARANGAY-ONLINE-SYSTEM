import AppLayout from '@/layouts/admin-app-layout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    Download, 
    RefreshCw, 
    Eye, 
    Trash2,
    Calendar,
    User as UserIcon,
    Activity,
    Shield,
    Clock,
    AlertTriangle,
    FileText,
    ChevronDown,
    ChevronUp,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    BarChart3,
    Users,
    CreditCard,
    Receipt,
    FileCheck,
    Database,
    Server,
    Terminal,
    AlertOctagon,
    Lock,
    Key,
    LogOut,
    LogIn,
    Settings,
    Edit,
    Plus,
    Minus,
    Globe,
    Network,
    HardDrive,
    Layers,
    FolderTree,
    Tag,
    Computer,
    Smartphone,
    Tablet,
    Monitor
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { PageProps } from '@/types';

// Define interfaces
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
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

interface PaginatedLoginLogs {
    data: LoginLog[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface LoginSummary {
    status: 'success' | 'failed';
    count: number;
}

interface BrowserSummary {
    browser: string;
    count: number;
}

interface DeviceSummary {
    device_type: string;
    count: number;
}

interface TopUser {
    user?: User | null;
    login_count: number;
}

interface HourlyLogin {
    hour: string;
    count: number;
}

interface StatusTab {
    id: string;
    name: string;
    displayName: string;
    icon: JSX.Element;
    color: string;
    count?: number;
}

interface LoginLogsPageProps extends PageProps {
    logs: PaginatedLoginLogs;
    filters: {
        search?: string;
        status?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
        browser?: string;
        device_type?: string;
        per_page?: number;
    };
    browsers: string[];
    devices: string[];
    users: User[];
    stats: {
        total_logins: number;
        successful_logins: number;
        failed_logins: number;
        active_sessions: number;
        today_logins: number;
        unique_users: number;
    };
    recent_logins: LoginLog[];
    login_summary: LoginSummary[];
    browser_summary: BrowserSummary[];
    device_summary: DeviceSummary[];
    top_users: TopUser[];
    hourly_logins: HourlyLogin[];
}

// Helper function to format date
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

// Get status color class
const getStatusClass = (isSuccessful: boolean): string => {
    return isSuccessful 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
};

// Get device color class
const getDeviceClass = (deviceType: string | null): string => {
    const classes: Record<string, string> = {
        'Desktop': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'Mobile': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'Tablet': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    };
    
    return classes[deviceType || 'Desktop'] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

// Get browser color class
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

// Get status display name
const getStatusDisplay = (isSuccessful: boolean): string => {
    return isSuccessful ? 'Success' : 'Failed';
};

// Get device icon
const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
        case 'Mobile':
            return <Smartphone className="h-4 w-4" />;
        case 'Tablet':
            return <Tablet className="h-4 w-4" />;
        default:
            return <Computer className="h-4 w-4" />;
    }
};

// Get browser icon
const getBrowserIcon = (browser: string | null) => {
    // Simple browser detection from user agent
    if (!browser || browser === 'Unknown') return <Globe className="h-4 w-4" />;
    
    const browserIcons: Record<string, JSX.Element> = {
        'Chrome': <Globe className="h-4 w-4" />,
        'Firefox': <Globe className="h-4 w-4" />,
        'Safari': <Globe className="h-4 w-4" />,
        'Edge': <Globe className="h-4 w-4" />,
        'Opera': <Globe className="h-4 w-4" />,
    };
    
    return browserIcons[browser] || <Globe className="h-4 w-4" />;
};

// Get session duration
const getSessionDuration = (loginAt: string, logoutAt: string | null): string => {
    if (!logoutAt) return 'Still active';
    
    const login = new Date(loginAt);
    const logout = new Date(logoutAt);
    const durationMs = logout.getTime() - login.getTime();
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${minutes}m`;
};

// Parse user agent for display
const parseUserAgentForDisplay = (userAgent: string | null): string => {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    // Browser detection
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    
    // OS detection
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return 'Unknown';
};

// Format status for display
const formatStatus = (status: string): string => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

// Clean filter parameters
const cleanFilterParams = (params: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
            cleaned[key] = value.trim();
        } else if (typeof value === 'number' && (key === 'per_page' && value !== 25)) {
            cleaned[key] = value;
        } else if (typeof value === 'number' && key !== 'per_page') {
            cleaned[key] = value;
        }
    });
    
    return cleaned;
};

// Get status icon
const getStatusIcon = (isSuccessful: boolean) => {
    return isSuccessful 
        ? <CheckCircle className="h-4 w-4" />
        : <AlertCircle className="h-4 w-4" />;
};

export default function LoginLogs() {
    const { props } = usePage<LoginLogsPageProps>();
    const { 
        logs, 
        filters, 
        browsers, 
        devices,
        users, 
        stats, 
        recent_logins, 
        login_summary, 
        browser_summary,
        device_summary,
        top_users,
        hourly_logins
    } = props;
    
    // State management
    const [search, setSearch] = useState<string>(filters.search || '');
    const [status, setStatus] = useState<string>(filters.status || '');
    const [browser, setBrowser] = useState<string>(filters.browser || '');
    const [deviceType, setDeviceType] = useState<string>(filters.device_type || '');
    const [userId, setUserId] = useState<string>(filters.user_id || '');
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from || '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 25);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [activeTab, setActiveTab] = useState<string>('all');

    // Get counts for each status from login_summary
    const getStatusCount = (statusType: 'success' | 'failed'): number => {
        if (!login_summary) return 0;
        const summary = login_summary.find(item => item.status === statusType);
        return summary?.count || 0;
    };

    // Define status tabs
    const statusTabs: StatusTab[] = useMemo(() => [
        {
            id: 'all',
            name: 'all',
            displayName: 'All Logins',
            icon: <Layers className="h-4 w-4" />,
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
            count: stats?.total_logins || 0
        },
        {
            id: 'success',
            name: 'success',
            displayName: 'Successful',
            icon: <CheckCircle className="h-4 w-4" />,
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            count: getStatusCount('success')
        },
        {
            id: 'failed',
            name: 'failed',
            displayName: 'Failed',
            icon: <AlertCircle className="h-4 w-4" />,
            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            count: getStatusCount('failed')
        }
    ], [login_summary, stats]);

    // Handle tab click
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'all') {
            // Clear status filter
            setStatus('');
            const params = cleanFilterParams({
                ...buildFilterParams(),
                status: undefined,
            });
            router.get('/admin/reports/login-logs', params, { // CHANGED HERE
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        } else {
            // Set status filter to selected tab
            const selectedTab = statusTabs.find(tab => tab.id === tabId);
            if (selectedTab) {
                setStatus(selectedTab.name);
                const params = cleanFilterParams({
                    ...buildFilterParams(),
                    status: selectedTab.name,
                });
                router.get('/admin/reports/login-logs', params, { // CHANGED HERE
                    preserveScroll: true,
                    preserveState: true,
                    onStart: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                });
            }
        }
    };

    // Function to build filter parameters
    const buildFilterParams = (): Record<string, any> => {
        const params: Record<string, any> = {};
        
        if (search.trim()) params.search = search.trim();
        if (status.trim()) params.status = status.trim();
        if (browser.trim()) params.browser = browser.trim();
        if (deviceType.trim()) params.device_type = deviceType.trim();
        if (userId.trim()) params.user_id = userId.trim();
        if (dateFrom.trim()) params.date_from = dateFrom.trim();
        if (dateTo.trim()) params.date_to = dateTo.trim();
        if (perPage !== 25) params.per_page = perPage;
        
        return params;
    };

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce(() => {
            const params = buildFilterParams();
            router.get('/admin/reports/login-logs', params, { // CHANGED HERE
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        }, 500),
        [search, status, browser, deviceType, userId, dateFrom, dateTo, perPage]
    );

    // Update search with debounce
    useEffect(() => {
        if (search !== undefined) {
            debouncedSearch();
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    // Handle filter changes
    const handleStatusChange = (value: string) => {
        setStatus(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            status: value.trim() || undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleBrowserChange = (value: string) => {
        setBrowser(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            browser: value.trim() || undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDeviceTypeChange = (value: string) => {
        setDeviceType(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            device_type: value.trim() || undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleUserIdChange = (value: string) => {
        setUserId(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            user_id: value.trim() || undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            date_from: value.trim() || undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            date_to: value.trim() || undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handlePerPageChange = (value: string) => {
        const numValue = parseInt(value);
        setPerPage(numValue);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            per_page: numValue !== 25 ? numValue : undefined,
        });
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSearch('');
        setStatus('');
        setBrowser('');
        setDeviceType('');
        setUserId('');
        setDateFrom('');
        setDateTo('');
        setPerPage(25);
        setActiveTab('all');
        setShowFilters(false);
        
        router.get('/admin/reports/login-logs', {}, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Refresh current filters
    const handleRefresh = () => {
        const params = buildFilterParams();
        router.get('/admin/reports/login-logs', params, { // CHANGED HERE
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle export
    const handleExport = (format: string = 'csv') => {
        setIsLoading(true);
        
        const exportParams: Record<string, any> = { format };
        const filterParams = buildFilterParams();
        
        Object.entries(filterParams).forEach(([key, value]) => {
            exportParams[key] = value;
        });

        router.get('/admin/reports/login-logs/export', exportParams, { // CHANGED HERE
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                toast.success(`${format.toUpperCase()} export started`);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to export logs');
            }
        });
    };

    // Toggle log expansion
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

    // Check if filters are active
    const hasActiveFilters = 
        search.trim() !== '' || 
        status.trim() !== '' || 
        browser.trim() !== '' || 
        deviceType.trim() !== '' || 
        userId.trim() !== '' || 
        dateFrom.trim() !== '' || 
        dateTo.trim() !== '' || 
        perPage !== 25;

    return (
        <AppLayout
            title="Login Logs"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Login Logs', href: '/admin/reports/login-logs' } // CHANGED HERE
            ]}
        >
            <Head title="Login Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            User Login Activity
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor all user login attempts, sessions, and authentication events
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                List View
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Grid View
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.total_logins?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <LogIn className="h-3 w-3" />
                                    <span>All login attempts</span>
                                </div>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.successful_logins?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Successful authentications</span>
                                </div>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.active_sessions?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Monitor className="h-3 w-3" />
                                    <span>Currently logged in</span>
                                </div>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Logins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.today_logins?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>Last 24 hours</span>
                                </div>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FolderTree className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Login Status
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? `${tab.color} ring-2 ring-offset-2 ring-opacity-50 ${tab.color.split(' ')[0].replace('bg-', 'ring-')}` : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <span className="flex items-center gap-1">
                                        {tab.icon}
                                        {tab.displayName}
                                    </span>
                                    {tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            {tab.count.toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Search and Filter Bar */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search login activities, users, IP addresses...`}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Status Filter - Hidden when tabs are active */}
                                    {activeTab === 'all' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Login Status
                                            </label>
                                            <select
                                                value={status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="">All Status</option>
                                                <option value="success">Successful</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Browser Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Browser
                                        </label>
                                        <select
                                            value={browser}
                                            onChange={(e) => handleBrowserChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Browsers</option>
                                            {browsers?.map((browser) => (
                                                <option key={browser} value={browser}>
                                                    {browser}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Device Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Device Type
                                        </label>
                                        <select
                                            value={deviceType}
                                            onChange={(e) => handleDeviceTypeChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Devices</option>
                                            {devices?.map((device) => (
                                                <option key={device} value={device}>
                                                    {device}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* User Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            User
                                        </label>
                                        <select
                                            value={userId}
                                            onChange={(e) => handleUserIdChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Users</option>
                                            {users?.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.username} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Per Page Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Items per page
                                        </label>
                                        <select
                                            value={perPage.toString()}
                                            onChange={(e) => handlePerPageChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="10">10 per page</option>
                                            <option value="25">25 per page</option>
                                            <option value="50">50 per page</option>
                                            <option value="100">100 per page</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Date Range Filter */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date From
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => handleDateFromChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date To
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => handleDateToChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Active Filters Display */}
                                {hasActiveFilters && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Active filters applied
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleResetFilters}
                                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {search && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                                                    Search: "{search}"
                                                </span>
                                            )}
                                            {activeTab !== 'all' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                                                    Status: {statusTabs.find(t => t.id === activeTab)?.displayName}
                                                </span>
                                            )}
                                            {status && activeTab === 'all' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                                                    Status: {formatStatus(status)}
                                                </span>
                                            )}
                                            {browser && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                                                    Browser: {browser}
                                                </span>
                                            )}
                                            {deviceType && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                                                    Device: {deviceType}
                                                </span>
                                            )}
                                            {userId && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                                                    User: {users?.find(u => u.id === parseInt(userId))?.first_name || 'Unknown'}
                                                </span>
                                            )}
                                            {(dateFrom || dateTo) && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-sm">
                                                    Date: {dateFrom || 'Start'} to {dateTo || 'End'}
                                                </span>
                                            )}
                                            {perPage !== 25 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded text-sm">
                                                    Per Page: {perPage}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Login Logs List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header with actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {activeTab === 'all' ? 'All Login Entries' : `${statusTabs.find(t => t.id === activeTab)?.displayName} Logins`}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Showing {logs.data.length} of {logs.total} logins
                                    {logs.from && logs.to && (
                                        <span> (Entries {logs.from} to {logs.to})</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Login Logs Table/Grid */}
                        {viewMode === 'list' ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {isLoading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                                    </div>
                                ) : logs.data.length > 0 ? (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {logs.data.map((log) => (
                                            <div 
                                                key={log.id} 
                                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Status Icon */}
                                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
                                                        {getStatusIcon(log.is_successful)}
                                                    </div>
                                                    
                                                    {/* Log Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                                    {log.user ? `${log.user.username} logged in` : 'Unknown user logged in'}
                                                                </h3>
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(log.is_successful)}`}>
                                                                    {getStatusIcon(log.is_successful)}
                                                                    {getStatusDisplay(log.is_successful)}
                                                                </span>
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getDeviceClass(log.device_type)}`}>
                                                                    {getDeviceIcon(log.device_type)}
                                                                    {log.device_type || 'Desktop'}
                                                                </span>
                                                                {log.browser && (
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getBrowserClass(log.browser)}`}>
                                                                        {getBrowserIcon(log.browser)}
                                                                        {log.browser}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {getRelativeTime(log.login_at)}
                                                                </span>
                                                                <button
                                                                    onClick={() => toggleLogExpansion(log.id)}
                                                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                                >
                                                                    {expandedLogs.has(log.id) ? (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                            {log.user ? (
                                                                <div className="flex items-center gap-1">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    <span>{log.user.username}</span>
                                                                    {log.user.email && (
                                                                        <>
                                                                            <span className="text-gray-400 hidden sm:inline">•</span>
                                                                            <span className="hidden sm:inline">{log.user.email}</span>
                                                                        </>
                                                                    )}
                                                                    {log.user.username && (
                                                                        <>
                                                                            <span className="text-gray-400 hidden sm:inline">•</span>
                                                                            <span className="hidden sm:inline">@{log.user.username}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    <span>User account deleted</span>
                                                                </div>
                                                            )}
                                                            
                                                            {log.ip_address && (
                                                                <div className="flex items-center gap-1">
                                                                    <Globe className="h-3 w-3" />
                                                                    <span className="font-mono text-xs">{log.ip_address}</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{formatDate(log.login_at)}</span>
                                                            </div>

                                                            {log.logout_at && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>Duration: {getSessionDuration(log.login_at, log.logout_at)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Failure reason */}
                                                        {!log.is_successful && log.failure_reason && (
                                                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                                                <div className="flex items-start gap-2">
                                                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                                                            Authentication Failed
                                                                        </p>
                                                                        <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                                                                            Reason: {log.failure_reason}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Expanded Details */}
                                                        {expandedLogs.has(log.id) && (
                                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Details</h4>
                                                                        <div className="space-y-1 text-sm">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">Login Time:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {formatDate(log.login_at, true)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">Logout Time:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {log.logout_at ? formatDate(log.logout_at, true) : 'Still active'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">Session Duration:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {getSessionDuration(log.login_at, log.logout_at)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">Status:</span>
                                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(log.is_successful)}`}>
                                                                                    {getStatusIcon(log.is_successful)}
                                                                                    {getStatusDisplay(log.is_successful)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device & Network</h4>
                                                                        <div className="space-y-1 text-sm">
                                                                            {log.ip_address && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">IP Address:</span>
                                                                                    <span className="font-mono text-gray-900 dark:text-white text-xs">
                                                                                        {log.ip_address}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {log.browser && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Browser:</span>
                                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getBrowserClass(log.browser)}`}>
                                                                                        {getBrowserIcon(log.browser)}
                                                                                        {log.browser}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {log.device_type && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Device:</span>
                                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getDeviceClass(log.device_type)}`}>
                                                                                        {getDeviceIcon(log.device_type)}
                                                                                        {log.device_type}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {log.platform && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Platform:</span>
                                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                                        {log.platform}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* User Agent Details */}
                                                                {log.user_agent && (
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            User Agent
                                                                        </h4>
                                                                        <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                                                            {log.user_agent}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* User Information */}
                                                                {log.user && (
                                                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            User Information
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                                                                                <UserIcon className="h-4 w-4 text-gray-500" />
                                                                                <div>
                                                                                    <div className="text-xs text-gray-500">Name</div>
                                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                        {log.user.first_name}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                                                                                <Globe className="h-4 w-4 text-gray-500" />
                                                                                <div>
                                                                                    <div className="text-xs text-gray-500">Email</div>
                                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                        {log.user.email}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {log.user.username && (
                                                                                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                                                                                    <UserIcon className="h-4 w-4 text-gray-500" />
                                                                                    <div>
                                                                                        <div className="text-xs text-gray-500">Username</div>
                                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                            @{log.user.username}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex justify-end gap-2 pt-2">
                                                                    {log.user && (
                                                                        <Link
                                                                            href={`/admin/users/${log.user.id}`}
                                                                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded"
                                                                        >
                                                                            <UserIcon className="h-3 w-3" />
                                                                            View User Profile
                                                                        </Link>
                                                                    )}
                                                                    <Link
                                                                        href={`/admin/reports/login-logs/${log.id}`} // CHANGED HERE
                                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                        View Full Details
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-64 flex flex-col items-center justify-center p-6">
                                        <LogIn className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400 text-center">
                                            No login logs found
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                            Try adjusting your filters or check back later
                                        </p>
                                    </div>
                                )}
                                
                                {/* Pagination */}
                                {logs.data.length > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Showing <span className="font-medium">{logs.from || 0}</span> to <span className="font-medium">{logs.to || 0}</span> of{' '}
                                                <span className="font-medium">{logs.total}</span> results
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {logs.links.map((link, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (link.url && !link.active) {
                                                                const url = new URL(link.url, window.location.origin);
                                                                const params: Record<string, string> = {};
                                                                
                                                                url.searchParams.forEach((value, key) => {
                                                                    if (value.trim() !== '') {
                                                                        params[key] = value;
                                                                    }
                                                                });
                                                                
                                                                router.get('/admin/reports/login-logs', params, { // CHANGED HERE
                                                                    preserveScroll: true,
                                                                    preserveState: true,
                                                                    onStart: () => setIsLoading(true),
                                                                    onFinish: () => setIsLoading(false),
                                                                });
                                                            }
                                                        }}
                                                        disabled={!link.url || link.active}
                                                        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                                            link.active
                                                                ? 'bg-primary-600 text-white'
                                                                : link.url
                                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Grid View */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {logs.data.map((log) => (
                                    <div 
                                        key={log.id} 
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${getStatusClass(log.is_successful)}`}>
                                                {getStatusIcon(log.is_successful)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                                                            {log.user ? `${log.user.first_name}` : 'Unknown user'}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getStatusClass(log.is_successful)}`}>
                                                                {getStatusIcon(log.is_successful)}
                                                                {getStatusDisplay(log.is_successful)}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getDeviceClass(log.device_type)}`}>
                                                                {getDeviceIcon(log.device_type)}
                                                                {log.device_type || 'Desktop'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        {log.user ? (
                                                            <>
                                                                <UserIcon className="h-3 w-3" />
                                                                <span className="truncate">{log.user.first_name}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserIcon className="h-3 w-3" />
                                                                <span>User deleted</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{getRelativeTime(log.login_at)}</span>
                                                    </div>
                                                    {log.ip_address && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span className="font-mono truncate">{log.ip_address}</span>
                                                        </div>
                                                    )}
                                                    {log.logout_at && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{getSessionDuration(log.login_at, log.logout_at)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        onClick={() => toggleLogExpansion(log.id)}
                                                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                                    >
                                                        {expandedLogs.has(log.id) ? 'Show Less' : 'View Details'}
                                                    </button>
                                                </div>
                                                
                                                {/* Expanded Details in Grid */}
                                                {expandedLogs.has(log.id) && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                                        <div className="text-xs space-y-1">
                                                            {log.browser && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Browser:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {log.browser}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {log.platform && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Platform:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {log.platform}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Failure reason in grid */}
                                                        {!log.is_successful && log.failure_reason && (
                                                            <div className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                                                <div className="font-medium text-red-800 dark:text-red-300">
                                                                    Failed: {log.failure_reason}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar with Analytics */}
                    <div className="space-y-6">
                        {/* Recent Logins */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Logins</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Latest authentication events</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {recent_logins?.slice(0, 5).map((login) => (
                                    <div key={login.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <div className={`p-2 rounded ${getStatusClass(login.is_successful)}`}>
                                            {getStatusIcon(login.is_successful)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {login.user ? login.user.first_name : 'Unknown user'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusClass(login.is_successful)}`}>
                                                    {getStatusDisplay(login.is_successful)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {getRelativeTime(login.login_at)}
                                                </span>
                                            </div>
                                            {login.ip_address && (
                                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                                    {login.ip_address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {(!recent_logins || recent_logins.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No recent logins
                                    </p>
                                )}
                            </div>
                            
                            <Link
                                href="/admin/reports/login-logs" // CHANGED HERE
                                className="mt-4 w-full text-center block px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg"
                            >
                                View all logins
                            </Link>
                        </div>

                        {/* Browser Distribution */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Browser Usage</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Most common browsers</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {browser_summary?.map((item) => (
                                    <div key={item.browser} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded ${getBrowserClass(item.browser)}`}>
                                                    {getBrowserIcon(item.browser)}
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {item.browser}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${getBrowserClass(item.browser).split(' ')[0]}`}
                                                style={{ 
                                                    width: `${Math.max(5, (item.count / Math.max(...browser_summary.map(b => b.count))) * 100)}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                
                                {(!browser_summary || browser_summary.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No browser data
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Device Distribution */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <Computer className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Types</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Login devices used</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {device_summary?.map((item) => (
                                    <div key={item.device_type} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded ${getDeviceClass(item.device_type)}`}>
                                                {getDeviceIcon(item.device_type)}
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {item.device_type || 'Unknown'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                                
                                {(!device_summary || device_summary.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No device data
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Top Active Users */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequent Users</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Most active logins</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {top_users?.map((item, index) => (
                                    <div key={item.user?.id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                    {item.user?.first_name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {item.user?.first_name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {item.user?.email || 'No email'}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                            {item.login_count || 0}
                                        </div>
                                    </div>
                                ))}
                                
                                {(!top_users || top_users.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No user login data
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}