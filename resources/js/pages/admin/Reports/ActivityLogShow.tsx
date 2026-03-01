// resources/js/Pages/Admin/Reports/ActivityLogShow.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Calendar,
    User as UserIcon,
    Activity,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Receipt,
    FileCheck,
    Database,
    Server,
    Globe,
    Lock,
    LogIn,
    LogOut,
    Edit,
    Plus,
    Trash2,
    Network,
    HardDrive,
    Shield,
    Users,
    ChevronLeft
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    log_name: string;
    description: string | null;
    subject_type: string | null;
    subject_id: number | null;
    event: string;
    properties: any;
    batch_uuid: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
    causer: User | null;
}

interface ActivityLogShowProps {
    log: ActivityLog;
}

// Helper functions (same as in ActivityLogs component)
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

const getEventIcon = (event: string, logName: string) => {
    if (logName === 'payments') return <CreditCard className="h-4 w-4" />;
    if (logName === 'clearance-requests') return <FileCheck className="h-4 w-4" />;
    if (logName === 'users') return <Users className="h-4 w-4" />;
    
    if (logName === 'authentication') {
        if (event === 'login') return <LogIn className="h-4 w-4" />;
        if (event === 'logout') return <LogOut className="h-4 w-4" />;
        return <Lock className="h-4 w-4" />;
    }
    
    if (logName === 'system') return <Server className="h-4 w-4" />;
    
    const icons: Record<string, JSX.Element> = {
        'created': <Plus className="h-4 w-4" />,
        'updated': <Edit className="h-4 w-4" />,
        'deleted': <Trash2 className="h-4 w-4" />,
        'login': <LogIn className="h-4 w-4" />,
        'logout': <LogOut className="h-4 w-4" />,
        'failed': <AlertCircle className="h-4 w-4" />,
        'registered': <UserIcon className="h-4 w-4" />,
    };
    
    return icons[event] || <Activity className="h-4 w-4" />;
};

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

const formatEventType = (event: string): string => {
    if (!event) return '';
    return event.replace(/_/g, ' ').toUpperCase();
};

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

const getClearanceDetails = (properties: any): { label: string; value: string; icon: JSX.Element }[] => {
    if (!properties?.attributes) return [];
    
    const attrs = properties.attributes;
    const details = [];
    
    if (attrs.purpose) {
        details.push({
            label: 'Purpose',
            value: attrs.purpose,
            icon: <FileText className="h-4 w-4" />
        });
    }
    
    if (attrs.status) {
        const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        details.push({
            label: 'Status',
            value: statusMap[attrs.status] || attrs.status,
            icon: <CheckCircle className="h-4 w-4" />
        });
    }
    
    if (attrs.resident_id) {
        details.push({
            label: 'Resident ID',
            value: `#${attrs.resident_id}`,
            icon: <UserIcon className="h-4 w-4" />
        });
    }
    
    if (attrs.fee_amount) {
        details.push({
            label: 'Fee Amount',
            value: `₱${parseFloat(attrs.fee_amount).toFixed(2)}`,
            icon: <CreditCard className="h-4 w-4" />
        });
    }
    
    if (attrs.approved_by) {
        details.push({
            label: 'Approved By',
            value: `User #${attrs.approved_by}`,
            icon: <UserIcon className="h-4 w-4" />
        });
    }
    
    return details;
};

export default function ActivityLogShow({ log }: ActivityLogShowProps) {
    return (
        <AppLayout
            title="Activity Log Details"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Activity Logs', href: '/admin/reports/activity-logs' },
                { title: 'Log Details', href: `/admin/reports/activity-logs/${log.id}` }
            ]}
        >
            <Head title="Activity Log Details" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/reports/activity-logs"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Activity Logs
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Activity Log Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Detailed view of system activity log entry
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Log Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Log Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
                                        {getEventIcon(log.event, log.log_name)}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {log.description || getEventDisplay(log.event, log.subject_type)}
                                            </h2>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${getLogTypeClass(log.log_name)}`}>
                                                {getLogTypeDisplay(log.log_name)}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${getEventClass(log.event)}`}>
                                                {formatEventType(log.event)}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {formatDate(log.created_at, true)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {formatDate(log.updated_at, true)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {log.batch_uuid && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Database className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                                                        <span className="font-mono text-gray-900 dark:text-white text-xs">
                                                            {log.batch_uuid}
                                                        </span>
                                                    </div>
                                                )}
                                                {log.ip_address && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Globe className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                                                        <span className="font-mono text-gray-900 dark:text-white text-xs">
                                                            {log.ip_address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* User Information */}
                                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performed By</h3>
                                            {log.causer ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                            {log.causer.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{log.causer.name}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.causer.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Server className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 dark:text-gray-400">System Process</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Subject Information */}
                                        {log.subject_type && (
                                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</h3>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {getSubjectDisplay(log.subject_type, log.subject_id)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Payment Details */}
                                        {log.log_name === 'payments' && log.properties && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {getPaymentDetails(log.properties).map((detail, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                                    {detail.icon}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white">{detail.value}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Clearance Request Details */}
                                        {log.log_name === 'clearance-requests' && log.properties && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Clearance Request Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {getClearanceDetails(log.properties).map((detail, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                                    {detail.icon}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white">{detail.value}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Properties JSON (Raw Data) */}
                                        {log.properties && Object.keys(log.properties).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raw Data</h3>
                                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
                                                        {JSON.stringify(log.properties, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* User Agent Information */}
                            {log.user_agent && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device Information</h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{log.user_agent}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Sidebar with Quick Info */}
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Event Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {log.event.charAt(0).toUpperCase() + log.event.slice(1)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {getLogTypeDisplay(log.log_name)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date Recorded</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(log.created_at, false)}
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
                                <Link
                                    href={`/admin/reports/activity-logs?search=${log.id}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                >
                                    <Activity className="h-4 w-4" />
                                    Find Similar Logs
                                </Link>
                                
                                {log.causer && (
                                    <Link
                                        href={`/users/${log.causer.id}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        View User Profile
                                    </Link>
                                )}
                                
                                <Link
                                    href="/admin/reports/activity-logs"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Logs
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}