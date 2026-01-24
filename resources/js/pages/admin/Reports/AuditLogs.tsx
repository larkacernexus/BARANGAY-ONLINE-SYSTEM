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
    HardDrive
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { PageProps } from '@/types';

// Define interfaces based on your backend response
interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    log_name: string;
    description: string | null;
    subject_type: string | null;
    subject_id: number | null;
    event: string;
    causer_type: string | null;
    causer_id: number | null;
    properties: any;
    batch_uuid: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
    causer?: User;
    subject?: any;
}

interface PaginatedActivityLogs {
    data: ActivityLog[];
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

interface ActivitySummary {
    log_name: string;
    count: number;
}

interface EventSummary {
    event: string;
    count: number;
}

interface TopUser {
    user?: User | null;
    activity_count: number;
}

interface HourlyActivity {
    hour: string;
    count: number;
}

interface ActivityLogsPageProps extends PageProps {
    logs: PaginatedActivityLogs;
    filters: {
        search?: string;
        event_type?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
        log_name?: string;
        per_page?: number;
    };
    event_types: string[];
    log_names: string[];
    users: User[];
    stats: {
        total_logs: number;
        today_logs: number;
        payment_logs: number;
        user_logs: number;
        system_logs: number;
        user_activities: number;
    };
    recent_activities: ActivityLog[];
    activity_summary: ActivitySummary[];
    event_summary: EventSummary[];
    top_users: TopUser[];
    hourly_activity: HourlyActivity[];
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

// Get log type color class
const getLogTypeClass = (logName: string): string => {
    const classes: Record<string, string> = {
        'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        'payments': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'users': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'residents': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'households': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'clearance-requests': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        'authentication': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        'system': 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
    };
    
    return classes[logName] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

// Get event color class
const getEventClass = (event: string): string => {
    const classes: Record<string, string> = {
        'created': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'updated': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        'deleted': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        'login': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'logout': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'failed': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        'registered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    };
    
    return classes[event] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

// Get log type display name
const getLogTypeDisplay = (logName: string): string => {
    const types: Record<string, string> = {
        'default': 'System',
        'payments': 'Payments',
        'clearance-requests': 'Clearance Requests',
        'users': 'Users',
        'residents': 'Residents',
        'households': 'Households',
        'authentication': 'Authentication',
        'system': 'System',
    };
    
    return types[logName] || (logName ? logName.charAt(0).toUpperCase() + logName.slice(1).replace('-', ' ') : 'Unknown');
};

// Get event icon
const getEventIcon = (event: string, logName: string) => {
    // Log name specific icons
    if (logName === 'payments') {
        return <CreditCard className="h-4 w-4" />;
    }
    
    if (logName === 'clearance-requests') {
        return <FileCheck className="h-4 w-4" />;
    }
    
    if (logName === 'users') {
        return <Users className="h-4 w-4" />;
    }
    
    if (logName === 'authentication') {
        if (event === 'login') return <LogIn className="h-4 w-4" />;
        if (event === 'logout') return <LogOut className="h-4 w-4" />;
        return <Lock className="h-4 w-4" />;
    }
    
    if (logName === 'system') {
        return <Server className="h-4 w-4" />;
    }
    
    // Event specific icons
    const icons: Record<string, JSX.Element> = {
        'created': <Plus className="h-4 w-4" />,
        'updated': <Edit className="h-4 w-4" />,
        'deleted': <Trash2 className="h-4 w-4" />,
        'login': <LogIn className="h-4 w-4" />,
        'logout': <LogOut className="h-4 w-4" />,
        'failed': <AlertOctagon className="h-4 w-4" />,
        'registered': <UserIcon className="h-4 w-4" />,
    };
    
    return icons[event] || <Activity className="h-4 w-4" />;
};

// Get event display name
const getEventDisplay = (event: string, subjectType: string | null): string => {
    if (!event) return 'Unknown Event';
    
    const baseEvent = event.replace(/_/g, ' ');
    
    if (subjectType) {
        const modelName = subjectType.split('\\').pop() || '';
        const modelMap: Record<string, string> = {
            'Payment': 'Payment',
            'User': 'User Account',
            'Resident': 'Resident Record',
            'Household': 'Household Record',
            'ClearanceRequest': 'Clearance Request',
            'BarangayOfficial': 'Barangay Official',
            'Transaction': 'Transaction'
        };
        
        const friendlyName = modelMap[modelName] || modelName;
        return `${friendlyName} ${baseEvent}`;
    }
    
    return baseEvent.charAt(0).toUpperCase() + baseEvent.slice(1);
};

// Get subject display name
const getSubjectDisplay = (subjectType: string | null, subjectId: number | null): string => {
    if (!subjectType) return 'System';
    
    const modelName = subjectType.split('\\').pop() || '';
    
    const modelMap: Record<string, string> = {
        'Payment': 'Payment Record',
        'User': 'User Account',
        'Resident': 'Resident Record',
        'Household': 'Household Record',
        'ClearanceRequest': 'Clearance Request',
        'BarangayOfficial': 'Barangay Official',
        'Transaction': 'Transaction'
    };
    
    const displayName = modelMap[modelName] || modelName;
    
    if (subjectId) {
        return `${displayName} #${subjectId}`;
    }
    
    return displayName;
};

// Format event type for display
const formatEventType = (event: string): string => {
    if (!event) return '';
    return event.replace(/_/g, ' ').toUpperCase();
};

// Get payment details
const getPaymentDetails = (properties: any): { label: string; value: string; icon: JSX.Element }[] => {
    if (!properties?.attributes) return [];
    
    const attrs = properties.attributes;
    const details = [];
    
    if (attrs.or_number) {
        details.push({
            label: 'OR Number',
            value: attrs.or_number,
            icon: <FileText className="h-4 w-4" />
        });
    }
    
    if (attrs.payer_name) {
        details.push({
            label: 'Payer Name',
            value: attrs.payer_name,
            icon: <UserIcon className="h-4 w-4" />
        });
    }
    
    if (attrs.total_amount) {
        details.push({
            label: 'Amount',
            value: `₱${parseFloat(attrs.total_amount).toFixed(2)}`,
            icon: <CreditCard className="h-4 w-4" />
        });
    }
    
    if (attrs.payment_method) {
        const methodMap: Record<string, string> = {
            'cash': 'Cash',
            'gcash': 'GCash',
            'bank_transfer': 'Bank Transfer',
            'card': 'Credit/Debit Card',
            'check': 'Check'
        };
        details.push({
            label: 'Payment Method',
            value: methodMap[attrs.payment_method] || attrs.payment_method,
            icon: <Receipt className="h-4 w-4" />
        });
    }
    
    if (attrs.status) {
        const statusMap: Record<string, string> = {
            'completed': 'Completed',
            'pending': 'Pending',
            'failed': 'Failed',
            'refunded': 'Refunded',
            'cancelled': 'Cancelled'
        };
        details.push({
            label: 'Status',
            value: statusMap[attrs.status] || attrs.status,
            icon: attrs.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
        });
    }
    
    if (attrs.clearance_type) {
        details.push({
            label: 'Clearance Type',
            value: attrs.clearance_type,
            icon: <FileCheck className="h-4 w-4" />
        });
    }
    
    if (attrs.is_cleared !== undefined) {
        details.push({
            label: 'Cleared',
            value: attrs.is_cleared ? 'Yes' : 'No',
            icon: attrs.is_cleared ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />
        });
    }
    
    if (attrs.remarks) {
        details.push({
            label: 'Remarks',
            value: attrs.remarks,
            icon: <FileText className="h-4 w-4" />
        });
    }
    
    return details;
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

// Get log type icon
const getLogTypeIcon = (logName: string) => {
    const icons: Record<string, JSX.Element> = {
        'payments': <CreditCard className="h-4 w-4" />,
        'users': <Users className="h-4 w-4" />,
        'residents': <UserIcon className="h-4 w-4" />,
        'households': <Users className="h-4 w-4" />,
        'clearance-requests': <FileCheck className="h-4 w-4" />,
        'authentication': <Lock className="h-4 w-4" />,
        'system': <Server className="h-4 w-4" />,
        'default': <Database className="h-4 w-4" />,
    };
    
    return icons[logName] || <Activity className="h-4 w-4" />;
};

export default function ActivityLogs() {
    const { props } = usePage<ActivityLogsPageProps>();
    const { 
        logs, 
        filters, 
        event_types, 
        log_names,
        users, 
        stats, 
        recent_activities, 
        activity_summary, 
        event_summary,
        top_users,
        hourly_activity
    } = props;
    
    // State management
    const [search, setSearch] = useState<string>(filters.search || '');
    const [eventType, setEventType] = useState<string>(filters.event_type || '');
    const [logName, setLogName] = useState<string>(filters.log_name || '');
    const [userId, setUserId] = useState<string>(filters.user_id || '');
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from || '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to || '');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 25);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Function to build filter parameters
    const buildFilterParams = (): Record<string, any> => {
        const params: Record<string, any> = {};
        
        if (search.trim()) params.search = search.trim();
        if (eventType.trim()) params.event_type = eventType.trim();
        if (logName.trim()) params.log_name = logName.trim();
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
            router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        }, 500),
        [search, eventType, logName, userId, dateFrom, dateTo, perPage]
    );

    // Update search with debounce
    useEffect(() => {
        if (search !== undefined) {
            debouncedSearch();
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    // Handle filter changes
    const handleEventTypeChange = (value: string) => {
        setEventType(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            event_type: value.trim() || undefined,
        });
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleLogNameChange = (value: string) => {
        setLogName(value);
        const params = cleanFilterParams({
            ...buildFilterParams(),
            log_name: value.trim() || undefined,
        });
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
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
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
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
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
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
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
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
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSearch('');
        setEventType('');
        setLogName('');
        setUserId('');
        setDateFrom('');
        setDateTo('');
        setPerPage(25);
        setShowFilters(false);
        
        router.get('/reports/activity-logs', {}, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Refresh current filters
    const handleRefresh = () => {
        const params = buildFilterParams();
        router.get('/reports/activity-logs', params, { // FIXED: Changed from '/reports/audit-logs' to '/reports/activity-logs'
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

        router.get('/reports/activity-logs/export', exportParams, { // FIXED: Changed from '/reports/audit-logs/export' to '/reports/activity-logs/export'
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
        eventType.trim() !== '' || 
        logName.trim() !== '' || 
        userId.trim() !== '' || 
        dateFrom.trim() !== '' || 
        dateTo.trim() !== '' || 
        perPage !== 25;

    return (
        <AppLayout
            title="Activity Logs"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Activity Logs', href: '/reports/activity-logs' } // FIXED: Changed from 'Audit Logs' to 'Activity Logs'
            ]}
        >
            <Head title="Activity Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            System Activity Logs
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor all system activities, user actions, and events across the entire application
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.total_logs?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Database className="h-3 w-3" />
                                    <span>All system activities</span>
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Activities</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.today_logs?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>Last 24 hours</span>
                                </div>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Activities</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.user_activities?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <Users className="h-3 w-3" />
                                    <span>User-initiated actions</span>
                                </div>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats?.user_logs?.toLocaleString() || 0}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <UserIcon className="h-3 w-3" />
                                    <span>Unique users</span>
                                </div>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <UserIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search activities, users, IP addresses, events..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Log Type Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Log Type
                                    </label>
                                    <select
                                        value={logName}
                                        onChange={(e) => handleLogNameChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Log Types</option>
                                        {log_names?.map((log) => (
                                            <option key={log} value={log}>
                                                {getLogTypeDisplay(log)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Event Type Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Event Type
                                    </label>
                                    <select
                                        value={eventType}
                                        onChange={(e) => handleEventTypeChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Events</option>
                                        {event_types?.map((event) => (
                                            <option key={event} value={event}>
                                                {formatEventType(event)}
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
                                                {user.name} ({user.email})
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
                                        {logName && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                                                Type: {getLogTypeDisplay(logName)}
                                            </span>
                                        )}
                                        {eventType && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                                                Event: {formatEventType(eventType)}
                                            </span>
                                        )}
                                        {userId && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                                                User: {users?.find(u => u.id === parseInt(userId))?.name || 'Unknown'}
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

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Logs List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header with actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Activity Log Entries
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Showing {logs.data.length} of {logs.total} activities
                                    {logs.from && logs.to && (
                                        <span> (Entries {logs.from} to {logs.to})</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Activity Logs Table/Grid */}
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
                                                    {/* Event Icon */}
                                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
                                                        {getEventIcon(log.event, log.log_name)}
                                                    </div>
                                                    
                                                    {/* Log Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                                    {log.description || getEventDisplay(log.event, log.subject_type)}
                                                                </h3>
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getLogTypeClass(log.log_name)}`}>
                                                                    {getLogTypeIcon(log.log_name)}
                                                                    {getLogTypeDisplay(log.log_name)}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEventClass(log.event)}`}>
                                                                    {formatEventType(log.event)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {getRelativeTime(log.created_at)}
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
                                                            {log.causer ? (
                                                                <div className="flex items-center gap-1">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    <span>{log.causer.name}</span>
                                                                    {log.causer.email && (
                                                                        <>
                                                                            <span className="text-gray-400 hidden sm:inline">•</span>
                                                                            <span className="hidden sm:inline">{log.causer.email}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <Server className="h-3 w-3" />
                                                                    <span>System Process</span>
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
                                                                <span>{formatDate(log.created_at)}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Expanded Details */}
                                                        {expandedLogs.has(log.id) && (
                                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Details</h4>
                                                                        <div className="space-y-1 text-sm">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">Log Type:</span>
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {getLogTypeDisplay(log.log_name)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">Event:</span>
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEventClass(log.event)}`}>
                                                                                    {getEventDisplay(log.event, log.subject_type)}
                                                                                </span>
                                                                            </div>
                                                                            {log.subject_type && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Subject:</span>
                                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                                        {getSubjectDisplay(log.subject_type, log.subject_id)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {log.created_at && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Date & Time:</span>
                                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                                        {formatDate(log.created_at, true)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User & Network</h4>
                                                                        <div className="space-y-1 text-sm">
                                                                            {log.causer ? (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Performed By:</span>
                                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                                        {log.causer.name} ({log.causer.email})
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Performed By:</span>
                                                                                    <span className="font-medium text-gray-900 dark:text-white">System Process</span>
                                                                                </div>
                                                                            )}
                                                                            {log.ip_address && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">IP Address:</span>
                                                                                    <span className="font-mono text-gray-900 dark:text-white text-xs">
                                                                                        {log.ip_address}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {log.user_agent && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Device:</span>
                                                                                    <span className="text-gray-900 dark:text-white text-xs truncate">
                                                                                        {(() => {
                                                                                            // Simplify user agent display for admins
                                                                                            const ua = log.user_agent.toLowerCase();
                                                                                            if (ua.includes('chrome')) return 'Chrome Browser';
                                                                                            if (ua.includes('firefox')) return 'Firefox Browser';
                                                                                            if (ua.includes('safari')) return 'Safari Browser';
                                                                                            if (ua.includes('mobile')) return 'Mobile Device';
                                                                                            return 'Unknown Device';
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Payment-specific details */}
                                                                {log.log_name === 'payments' && log.properties && (
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            Payment Details
                                                                        </h4>
                                                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                {getPaymentDetails(log.properties).map((detail, index) => (
                                                                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                                                                        <div className="text-gray-500">
                                                                                            {detail.icon}
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <div className="text-xs text-gray-500">{detail.label}</div>
                                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                                {detail.value}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            
                                                                            {/* Recorded by information */}
                                                                            {log.properties?.attributes?.recorded_by && (
                                                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <UserIcon className="h-4 w-4 text-gray-500" />
                                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                            Recorded by User ID: {log.properties.attributes.recorded_by}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Generic properties display for other logs */}
                                                                {log.log_name !== 'payments' && log.properties && Object.keys(log.properties).length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                            Additional Information
                                                                        </h4>
                                                                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                                                                            <div className="space-y-2">
                                                                                {Object.entries(log.properties).map(([key, value], index) => {
                                                                                    // Skip technical fields
                                                                                    if (['attributes', 'old', 'original', 'changes'].includes(key)) return null;
                                                                                    
                                                                                    // Format key for display
                                                                                    const formattedKey = key
                                                                                        .replace(/_/g, ' ')
                                                                                        .replace(/\b\w/g, l => l.toUpperCase());
                                                                                    
                                                                                    // Format value based on type
                                                                                    let formattedValue = value;
                                                                                    if (typeof value === 'object') {
                                                                                        formattedValue = JSON.stringify(value, null, 2);
                                                                                    }
                                                                                    
                                                                                    return (
                                                                                        <div key={index} className="flex justify-between">
                                                                                            <span className="text-gray-600 dark:text-gray-400">{formattedKey}:</span>
                                                                                            <span className="font-medium text-gray-900 dark:text-white text-right">
                                                                                                {formattedValue as string}
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex justify-end gap-2 pt-2">
                                                                    <Link
                                                                        href={`/reports/activity-logs/${log.id}`}
                                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded"
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                        View Full Details
                                                                    </Link>
                                                                    {log.causer && (
                                                                        <Link
                                                                            href={`/users/${log.causer.id}`}
                                                                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                                        >
                                                                            <UserIcon className="h-3 w-3" />
                                                                            View User Profile
                                                                        </Link>
                                                                    )}
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
                                        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400 text-center">
                                            No activity logs found
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
                                                                
                                                                router.get('/reports/activity-logs', params, {
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
                                            <div className={`p-2 rounded-lg ${getLogTypeClass(log.log_name)}`}>
                                                {getEventIcon(log.event, log.log_name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                                                            {log.description || getEventDisplay(log.event, log.subject_type)}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getLogTypeClass(log.log_name)}`}>
                                                                {getLogTypeIcon(log.log_name)}
                                                                {getLogTypeDisplay(log.log_name)}
                                                            </span>
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getEventClass(log.event)}`}>
                                                                {formatEventType(log.event)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        {log.causer ? (
                                                            <>
                                                                <UserIcon className="h-3 w-3" />
                                                                <span className="truncate">{log.causer.name}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Server className="h-3 w-3" />
                                                                <span>System</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{getRelativeTime(log.created_at)}</span>
                                                    </div>
                                                    {log.ip_address && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span className="font-mono truncate">{log.ip_address}</span>
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
                                                            {log.subject_type && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Subject:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {getSubjectDisplay(log.subject_type, log.subject_id)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {log.causer && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">User:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">{log.causer.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Quick payment details */}
                                                        {log.log_name === 'payments' && log.properties?.attributes?.or_number && (
                                                            <div className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    OR#: {log.properties.attributes.or_number}
                                                                </div>
                                                                {log.properties.attributes.payer_name && (
                                                                    <div className="text-gray-600 dark:text-gray-400">
                                                                        Payer: {log.properties.attributes.payer_name}
                                                                    </div>
                                                                )}
                                                                {log.properties.attributes.total_amount && (
                                                                    <div className="text-gray-600 dark:text-gray-400">
                                                                        Amount: ₱{parseFloat(log.properties.attributes.total_amount).toFixed(2)}
                                                                    </div>
                                                                )}
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
                        {/* Recent Activities */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Latest system events</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {recent_activities?.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <div className={`p-2 rounded ${getLogTypeClass(activity.log_name)}`}>
                                            {getEventIcon(activity.event, activity.log_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {activity.description || getEventDisplay(activity.event, activity.subject_type)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${getLogTypeClass(activity.log_name)}`}>
                                                    {getLogTypeDisplay(activity.log_name)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {getRelativeTime(activity.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {(!recent_activities || recent_activities.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No recent activities
                                    </p>
                                )}
                            </div>
                            
                            <Link
                                href="/reports/activity-logs"
                                className="mt-4 w-full text-center block px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg"
                            >
                                View all activities
                            </Link>
                        </div>

                        {/* Activity by Log Type */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity by Log Type</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Distribution across modules</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {activity_summary?.map((item) => (
                                    <div key={item.log_name} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded ${getLogTypeClass(item.log_name)}`}>
                                                    {getLogTypeIcon(item.log_name)}
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {getLogTypeDisplay(item.log_name)}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${getLogTypeClass(item.log_name).split(' ')[0]}`}
                                                style={{ 
                                                    width: `${Math.max(5, (item.count / Math.max(...activity_summary.map(a => a.count))) * 100)}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                
                                {(!activity_summary || activity_summary.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No activity data
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Event Type Distribution */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Types</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Most common events</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {event_summary?.map((item) => (
                                    <div key={item.event} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <span className={`text-xs px-2 py-0.5 rounded ${getEventClass(item.event)}`}>
                                            {formatEventType(item.event)}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                                
                                {(!event_summary || event_summary.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No event data
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
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Active Users</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Most active system users</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {top_users?.map((item, index) => (
                                    <div key={item.user?.id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                    {item.user?.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {item.user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {item.user?.email || 'No email'}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                            {item.activity_count || 0}
                                        </div>
                                    </div>
                                ))}
                                
                                {(!top_users || top_users.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No user activity data
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