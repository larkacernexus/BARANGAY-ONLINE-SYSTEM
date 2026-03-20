import AppLayout from '@/layouts/admin-app-layout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Eye, 
    Calendar, 
    User as UserIcon, 
    Activity, 
    Shield,
    FileText,
    Clock,
    Copy,
    Check,
    Download,
    Printer,
    RefreshCw,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AuditLog, User } from '@/types/audit';
import { PageProps } from '@/types';

// Helper function to format date
const formatDate = (dateString: string | undefined, includeTime: boolean = true): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        
        return date.toLocaleDateString('en-PH', options);
    } catch {
        return 'Invalid date';
    }
};

// Get severity color class
const getSeverityClass = (severity: string | undefined): string => {
    const severityLevel = severity?.toLowerCase() || 'info';
    const classes: Record<string, string> = {
        'info': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
        'critical': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    
    return classes[severityLevel] || classes['info'];
};

// Get event icon
const getEventIcon = (event: string | undefined) => {
    const eventType = event || 'unknown';
    const icons: Record<string, JSX.Element> = {
        'login': <Shield className="h-5 w-5" />,
        'logout': <Shield className="h-5 w-5" />,
        'created': <FileText className="h-5 w-5" />,
        'updated': <RefreshCw className="h-5 w-5" />,
        'deleted': <FileText className="h-5 w-5" />,
        'password_changed': <Shield className="h-5 w-5" />,
        'profile_updated': <UserIcon className="h-5 w-5" />,
    };
    
    return icons[eventType] || <Activity className="h-5 w-5" />;
};

// Format event name for display
const formatEventName = (event: string | undefined): string => {
    if (!event) return 'Unknown Event';
    return event.replace(/_/g, ' ').toUpperCase();
};

interface AuditLogShowPageProps extends PageProps {
    log?: AuditLog;
    similar_logs?: AuditLog[];
    user_timeline?: AuditLog[];
    error?: string;
}

export default function AuditLogShow() {
    const { props } = usePage<AuditLogShowPageProps>();
    const { log, similar_logs = [], user_timeline = [], error } = props;
    
    const [copied, setCopied] = useState<boolean>(false);

    // Handle loading/error state
    if (!log) {
        return (
            <AppLayout
                title="Audit Log Not Found"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Reports', href: '/admin/reports' },
                    { title: 'Audit Logs', href: '/admin/reports/audit-logs' },
                    { title: 'Log Not Found', href: '#' }
                ]}
            >
                <Head title="Audit Log Not Found" />

                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {error || 'Audit Log Not Found'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                        The requested audit log could not be loaded. This might be due to a server error or the log may not exist.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/admin/reports/audit-logs"
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Return to Audit Logs
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        if (!text) return;
        
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Print log details
    const printLog = () => {
        const safeLog = {
            id: log.id || 'N/A',
            event: log.event || 'N/A',
            description: log.description || 'No description',
            severity: log.severity || 'info',
            created_at: log.created_at || new Date().toISOString(),
            user: log.user || null,
            causer: log.causer || null,
            ip_address: log.ip_address || 'N/A',
            user_agent: log.user_agent || 'N/A',
            batch_uuid: log.batch_uuid || 'N/A',
            properties: log.properties || {},
        };

        const printContent = `
            <html>
                <head>
                    <title>Audit Log #${safeLog.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        .label { font-weight: bold; color: #666; }
                        .value { margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Audit Log Details</h1>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="section">
                        <h2>Basic Information</h2>
                        <p><span class="label">Log ID:</span> ${safeLog.id}</p>
                        <p><span class="label">Event:</span> ${safeLog.event}</p>
                        <p><span class="label">Description:</span> ${safeLog.description}</p>
                        <p><span class="label">Severity:</span> ${safeLog.severity}</p>
                        <p><span class="label">Timestamp:</span> ${formatDate(safeLog.created_at)}</p>
                    </div>
                    <div class="section">
                        <h2>User Information</h2>
                        <p><span class="label">User:</span> ${safeLog.user?.name || 'System'}</p>
                        <p><span class="label">Email:</span> ${safeLog.user?.email || 'N/A'}</p>
                        <p><span class="label">Causer:</span> ${safeLog.causer?.name || 'N/A'}</p>
                    </div>
                    <div class="section">
                        <h2>Technical Details</h2>
                        <p><span class="label">IP Address:</span> ${safeLog.ip_address}</p>
                        <p><span class="label">User Agent:</span> ${safeLog.user_agent}</p>
                        <p><span class="label">Batch UUID:</span> ${safeLog.batch_uuid}</p>
                    </div>
                    <div class="section">
                        <h2>Properties</h2>
                        <pre>${JSON.stringify(safeLog.properties, null, 2)}</pre>
                    </div>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    // Export log as JSON
    const exportLog = () => {
        const data = {
            log: {
                id: log.id || 'N/A',
                event: log.event || 'N/A',
                description: log.description || 'N/A',
                severity: log.severity || 'info',
                created_at: log.created_at || new Date().toISOString(),
                updated_at: log.updated_at || new Date().toISOString(),
                user: log.user || null,
                causer: log.causer || null,
                ip_address: log.ip_address || 'N/A',
                user_agent: log.user_agent || 'N/A',
                batch_uuid: log.batch_uuid || 'N/A',
                properties: log.properties || {},
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${log.id || 'export'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Log exported as JSON');
    };

    return (
        <AppLayout
            title={`Audit Log #${log.id || 'Details'}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Reports', href: '/admin/reports' },
                { title: 'Audit Logs', href: '/admin/reports/audit-logs' },
                { title: `Log #${log.id || 'Details'}`, href: '#' }
            ]}
        >
            <Head title={`Audit Log #${log.id || 'Details'}`} />

            <div className="space-y-6">
                {/* Header with actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/reports/audit-logs"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Audit Log Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Log ID: #{log.id || 'N/A'} • {formatDate(log.created_at)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={exportLog}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                        <button
                            onClick={printLog}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? 'Copied!' : 'Copy JSON'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Log Overview Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    {getEventIcon(log.event)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Event Overview
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {log.description || 'No description available'}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(log.severity)}`}>
                                        {(log.severity || 'INFO').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Event Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Event Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Event Type</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatEventName(log.event)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Log ID</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                {log.id || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Batch UUID</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                {log.batch_uuid || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamp Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Created At</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(log.created_at)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Updated At</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(log.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Information Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        User Information
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        User who performed the action
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Performed By */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Performed By</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">User</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {log.user ? (
                                                    <Link 
                                                        href={`/admin/users/${log.user.id}`}
                                                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                                                    >
                                                        {log.user.name || 'Unknown User'}
                                                    </Link>
                                                ) : (
                                                    'System'
                                                )}
                                            </div>
                                        </div>
                                        {log.user && log.user.email && (
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.user.email}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Caused By */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Caused By</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Causer</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {log.causer ? (
                                                    <Link 
                                                        href={`/admin/users/${log.causer.id}`}
                                                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                                                    >
                                                        {log.causer.name || 'Unknown User'}
                                                    </Link>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </div>
                                        {log.causer && log.causer.email && (
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.causer.email}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Details Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Technical Details
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Network and system information
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* IP Address */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP Address</h3>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                            {log.ip_address || 'Unknown'}
                                        </span>
                                        {log.ip_address && (
                                            <button
                                                onClick={() => copyToClipboard(log.ip_address || '')}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-900 rounded transition-colors"
                                                title="Copy IP address"
                                            >
                                                <Copy className="h-4 w-4 text-gray-500" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* User Agent */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Agent</h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <p className="text-sm text-gray-900 dark:text-white break-all">
                                            {log.user_agent || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Properties Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Properties
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Additional event data and metadata
                                    </p>
                                </div>
                            </div>

                            {log.properties && Object.keys(log.properties).length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => copyToClipboard(JSON.stringify(log.properties, null, 2))}
                                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                                        >
                                            <Copy className="h-3 w-3" />
                                            Copy JSON
                                        </button>
                                    </div>
                                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                                        {JSON.stringify(log.properties, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No additional properties</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Similar Logs */}
                        {similar_logs && similar_logs.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Similar Logs
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Recent similar activities
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {similar_logs.slice(0, 5).map((similar) => (
                                        <Link
                                            key={similar.id}
                                            href={`/admin/reports/audit-logs/${similar.id}`}
                                            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {similar.description || formatEventName(similar.event)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${getSeverityClass(similar.severity)}`}>
                                                            {similar.severity || 'info'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(similar.created_at, false)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                
                                {similar_logs.length > 5 && (
                                    <Link
                                        href="/admin/reports/audit-logs"
                                        className="mt-4 w-full text-center block px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                                    >
                                        View all logs
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* User Timeline */}
                        {log.user && user_timeline && user_timeline.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            User Timeline
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Recent activities by this user
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {user_timeline.slice(0, 5).map((activity) => (
                                        <Link
                                            key={activity.id}
                                            href={`/admin/reports/audit-logs/${activity.id}`}
                                            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded ${getSeverityClass(activity.severity)}`}>
                                                    {getEventIcon(activity.event)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {activity.description || formatEventName(activity.event)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(activity.created_at, true)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                
                                <Link
                                    href={`/admin/users/${log.user.id}`}
                                    className="mt-4 w-full text-center block px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                                >
                                    View user profile
                                </Link>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h3>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => copyToClipboard(log.id?.toString() || '')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    disabled={!log.id}
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy Log ID
                                </button>
                                
                                {log.properties && Object.keys(log.properties).length > 0 && (
                                    <button
                                        onClick={() => copyToClipboard(JSON.stringify(log.properties, null, 2))}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Copy Properties
                                    </button>
                                )}
                                
                                {log.user && (
                                    <Link
                                        href={`/admin/users/${log.user.id}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        View User Profile
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}