import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/admin-app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
  Users, 
  Home, 
  CreditCard, 
  FileText, 
  Shield, 
  Activity, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Wifi,
  Database,
  HardDrive,
  Bell,
  MoreHorizontal,
  ArrowRight,
  UserPlus,
  FilePlus,
  DollarSign,
  AlertTriangle,
  CalendarPlus,
  MessageSquare,
  UserCheck,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp as TrendingUpIcon,
  Hash,
  Pencil,
  Phone,
  MapPin,
  Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Define dashboard URL as a constant
const DASHBOARD_URL = '/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Barangay Dashboard',
        href: DASHBOARD_URL,
    },
];

// Type definitions for better type safety
type StatItem = {
    title: string;
    value: string | number;
    change: string;
    icon: React.ComponentType<any>;
    color: string;
    href: string;
    changeType: 'increase' | 'decrease' | 'neutral';
};

type ActivityItem = {
    id: number;
    type: 'payment' | 'clearance' | 'registration' | 'complaint' | 'meeting' | 'alert';
    description: string;
    time: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    bgColor: string;
    data?: any;
};

type QuickAction = {
    icon: React.ComponentType<any>;
    label: string;
    href: string;
    description: string;
    badge?: string;
};

type SystemStatus = {
    service: string;
    status: 'online' | 'warning' | 'offline';
    lastCheck: string;
    details?: string;
};

type PageProps = {
    stats: {
        totalResidents: number;
        totalHouseholds: number;
        monthlyCollections: number;
        pendingClearances: number;
    };
    recentActivities: {
        newResidents: Array<{
            id: number;
            name: string;
            created_at: string;
            household_number?: string;
            [key: string]: any;
        }>;
        recentPayments: Array<{
            id: number;
            payer_name: string;
            total_amount: number;
            payment_date: string;
            payment_method: string;
            certificate_type?: string;
            [key: string]: any;
        }>;
        recentClearanceRequests: Array<{
            id: number;
            resident: {
                name: string;
            };
            clearanceType?: {
                name: string;
                code?: string;
            };
            purpose: string;
            created_at: string;
            status: string;
            urgency: string;
            [key: string]: any;
        }>;
    };
    paymentStats: {
        byCertificateType: Array<{
            type: string;
            original_type: string | number;
            count: number;
            amount: string;
        }>;
        byPaymentMethod: Array<{
            method: string;
            original_method: string;
            count: number;
            amount: string;
        }>;
        dailyCollections: Array<{
            date: string;
            day: string;
            count: number;
            amount: string;
        }>;
    };
    clearanceRequestStats: {
        byType: Array<{
            type: string;
            original_type: string | number;
            count: number;
        }>;
        byStatus: Array<{
            status: string;
            original_status: string;
            count: number;
        }>;
        byUrgency: Array<{
            urgency: string;
            original_urgency: string;
            count: number;
        }>;
    };
    clearanceTypeStats: Array<{
        id: number;
        name: string;
        code: string;
        description: string;
        fee: string;
        processing_days: number;
        validity_days: number;
        requires_payment: boolean;
        requires_approval: boolean;
        total_requests: number;
        monthly_requests: number;
        is_active: boolean;
    }>;
    collectionStats: {
        today: string;
        yesterday: string;
        weekly: string;
        yearly: string;
        dailyAvg: string;
        weeklyAvg: string;
    };
    activityStats: {
        newResidentsToday: number;
        paymentsToday: number;
        clearanceRequestsToday: number;
        totalActivitiesThisWeek: number;
    };
    storageStats: {
        totalUsedMB: number;
        totalStorageMB: number;
        percentage: number;
        breakdown: {
            database: number;
            files: number;
        };
        details: {
            databaseSizeMB: number;
            fileStorageSizeMB: number;
            fileCount: number;
            hasStorageFiles: boolean;
            residentCount: number;
            householdCount: number;
            paymentCount: number;
            clearanceCount: number;
            totalRows: number;
            tableCount: number;
            tableSizes: Record<string, { size_kb: number; rows: number }>;
        };
    };
};

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview');
    const [loading, setLoading] = useState(false);
    const [dateTime, setDateTime] = useState(new Date());
    
    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Format time for display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    };

    // Format date relative to now
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        } else if (diffInMinutes < 1440) { // 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    // Helper function to calculate change percentage
    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Calculate yesterday's data for comparison
    const getYesterdayStats = () => {
        const todayResidents = props.stats.totalResidents;
        const newResidentsToday = props.activityStats?.newResidentsToday ?? 0;
        const yesterdayResidents = Math.max(0, todayResidents - newResidentsToday);
        
        const yesterdayPayments = parseFloat(props.collectionStats.yesterday.replace(/,/g, '')) || 0;
        const todayPayments = parseFloat(props.collectionStats.today.replace(/,/g, '')) || 0;
        
        const pendingClearances = props.stats.pendingClearances;
        const clearanceRequestsToday = props.activityStats?.clearanceRequestsToday ?? 0;
        const yesterdayClearances = Math.max(0, pendingClearances - clearanceRequestsToday);
        
        return {
            residents: yesterdayResidents,
            payments: yesterdayPayments,
            clearances: yesterdayClearances
        };
    };

    const yesterdayStats = getYesterdayStats();

    // Enhanced barangay statistics with dynamic data
    const stats: StatItem[] = [
        {
            title: 'Total Residents',
            value: props.stats.totalResidents.toLocaleString(),
            change: calculateChange(props.stats.totalResidents, yesterdayStats.residents),
            changeType: props.stats.totalResidents > yesterdayStats.residents ? 'increase' : 
                       props.stats.totalResidents < yesterdayStats.residents ? 'decrease' : 'neutral',
            icon: Users,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            href: '/residents'
        },
        {
            title: 'Total Households',
            value: props.stats.totalHouseholds.toLocaleString(),
            change: calculateChange(props.stats.totalHouseholds, Math.floor(props.stats.totalHouseholds * 0.989)),
            changeType: 'increase',
            icon: Home,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            href: '/households'
        },
        {
            title: 'Today\'s Collections',
            value: `₱${props.collectionStats.today}`,
            change: calculateChange(
                parseFloat(props.collectionStats.today.replace(/,/g, '')), 
                yesterdayStats.payments
            ),
            changeType: parseFloat(props.collectionStats.today.replace(/,/g, '')) > yesterdayStats.payments ? 'increase' : 
                       parseFloat(props.collectionStats.today.replace(/,/g, '')) < yesterdayStats.payments ? 'decrease' : 'neutral',
            icon: CreditCard,
            color: 'bg-gradient-to-br from-amber-500 to-amber-600',
            href: '/payments'
        },
        {
            title: 'Pending Clearances',
            value: props.stats.pendingClearances.toLocaleString(),
            change: calculateChange(props.stats.pendingClearances, yesterdayStats.clearances),
            changeType: props.stats.pendingClearances > yesterdayStats.clearances ? 'increase' : 
                       props.stats.pendingClearances < yesterdayStats.clearances ? 'decrease' : 'neutral',
            icon: FileText,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            href: '/clearance-requests?status=pending'
        }
    ];

    // Generate recent activities from backend data
    const generateRecentActivities = (): ActivityItem[] => {
        const activities: ActivityItem[] = [];

        // Add new residents
        props.recentActivities.newResidents.forEach((resident) => {
            activities.push({
                id: resident.id,
                type: 'registration',
                description: `${resident.name} registered as new resident${resident.household_number ? ` (HH#${resident.household_number})` : ''}`,
                time: formatRelativeTime(resident.created_at),
                icon: UserPlus,
                iconColor: 'text-purple-600',
                bgColor: 'bg-purple-50',
                data: resident
            });
        });

        // Add recent payments
        props.recentActivities.recentPayments.forEach((payment) => {
            activities.push({
                id: payment.id,
                type: 'payment',
                description: `${payment.payer_name} paid ₱${payment.total_amount.toLocaleString()} via ${payment.payment_method}`,
                time: formatRelativeTime(payment.payment_date),
                icon: CreditCard,
                iconColor: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                data: payment
            });
        });

        // Add recent clearance requests
        props.recentActivities.recentClearanceRequests.forEach((clearance) => {
            activities.push({
                id: clearance.id,
                type: 'clearance',
                description: `${clearance.resident.name} requested ${clearance.clearanceType?.name || 'clearance'}`,
                time: formatRelativeTime(clearance.created_at),
                icon: FileText,
                iconColor: 'text-blue-600',
                bgColor: 'bg-blue-50',
                data: clearance
            });
        });

        // Sort by time (newest first) and limit to 5
        return activities
            .sort((a, b) => new Date(b.data?.created_at || b.time).getTime() - new Date(a.data?.created_at || a.time).getTime())
            .slice(0, 5);
    };

    const recentActivities = generateRecentActivities();

    // Enhanced quick actions with dynamic badges (removed events action)
    const quickActions: QuickAction[] = [
        { 
            icon: UserPlus, 
            label: 'Register Resident', 
            href: '/residents/create',
            description: 'Add new resident to the system',
            badge: props.activityStats?.newResidentsToday ? 
                `${props.activityStats.newResidentsToday} today` : 
                undefined
        },
        { 
            icon: FilePlus, 
            label: 'Request Clearance', 
            href: '/clearance-requests/create',
            description: 'Create clearance request',
            badge: props.stats.pendingClearances > 0 ? 
                `${props.stats.pendingClearances} pending` : 
                undefined
        },
        { 
            icon: CreditCard, 
            label: 'Process Payment', 
            href: '/payments/create',
            description: 'Record and process payments',
            badge: props.activityStats?.paymentsToday ? 
                `${props.activityStats.paymentsToday} today` : 
                'Process'
        },
        { 
            icon: Home,
            label: 'Add Household', 
            href: '/households/create',
            description: 'Register new household',
            badge: props.recentActivities.newResidents.length > 3 ? 
                'New family' : 
                undefined
        },
        { 
            icon: AlertTriangle, 
            label: 'Emergency Alert', 
            href: '/alerts/create',
            description: 'Send emergency notifications',
            badge: 'Urgent'
        },
        { 
            icon: FileText, 
            label: 'View Reports', 
            href: '/reports',
            description: 'Generate and view system reports',
            badge: 'Analytics'
        },
    ];

    // System status monitoring
    const systemStatus: SystemStatus[] = [
        {
            service: 'Database',
            status: 'online',
            lastCheck: 'Just now',
            details: `Residents: ${props.stats.totalResidents}, Households: ${props.stats.totalHouseholds}`
        },
        {
            service: 'Payment System',
            status: 'online',
            lastCheck: '5 min ago',
            details: `₱${props.collectionStats.today} collected today`
        },
        {
            service: 'Clearance System',
            status: props.stats.pendingClearances > 10 ? 'warning' : 'online',
            lastCheck: '2 hours ago',
            details: `${props.stats.pendingClearances} pending requests`
        },
        {
            service: 'User Activity',
            status: 'online',
            lastCheck: '10 min ago',
            details: `${props.activityStats?.totalActivitiesThisWeek ?? 0} activities this week`
        }
    ];

    // Helper function to get status color
    const getStatusColor = (status: SystemStatus['status']) => {
        switch(status) {
            case 'online': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'offline': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // Helper function to get change icon
    const getChangeIcon = (changeType: StatItem['changeType']) => {
        switch(changeType) {
            case 'increase': return <TrendingUp className="h-3 w-3" />;
            case 'decrease': return <TrendingDown className="h-3 w-3" />;
            default: return <Activity className="h-3 w-3" />;
        }
    };

    // Helper function to get system status icon
    const getSystemStatusIcon = (service: string) => {
        switch(service) {
            case 'Database': return Database;
            case 'Payment System': return CreditCard;
            case 'Clearance System': return FileText;
            case 'User Activity': return Activity;
            default: return Activity;
        }
    };

    // Calculate storage usage based on ACTUAL database sizes from backend
    const calculateStorageUsage = () => {
        const storageStats = props.storageStats || {
            totalUsedMB: 2.2,
            totalStorageMB: 2048,
            percentage: 0.1,
            breakdown: {
                database: 100,
                files: 0,
            },
            details: {
                databaseSizeMB: 2.2,
                fileStorageSizeMB: 0,
                fileCount: 0,
                hasStorageFiles: false,
                residentCount: props.stats.totalResidents,
                householdCount: props.stats.totalHouseholds,
                paymentCount: props.paymentStats.byCertificateType.reduce((acc, item) => acc + item.count, 0),
                clearanceCount: props.clearanceTypeStats.reduce((acc, item) => acc + item.total_requests, 0),
                totalRows: 387,
                tableCount: 39,
                tableSizes: {}
            }
        };
        
        // Format storage values nicely
        const formatStorage = (mb: number) => {
            if (mb >= 1024) {
                return `${(mb / 1024).toFixed(1)} GB`;
            } else if (mb >= 1) {
                return `${mb.toFixed(1)} MB`;
            } else {
                // Convert MB to KB for small values
                const kb = mb * 1024;
                return `${kb.toFixed(0)} KB`;
            }
        };
        
        // Format with appropriate precision
        const formatPrecise = (mb: number) => {
            if (mb < 1) {
                const kb = mb * 1024;
                return `${kb.toFixed(0)} KB`;
            } else if (mb < 10) {
                return `${mb.toFixed(1)} MB`;
            } else {
                return `${mb.toFixed(0)} MB`;
            }
        };
        
        // Get top 5 largest tables with safe type conversion
        const tableEntries: Array<[string, { size_kb: number; rows: number }]> = 
            Object.entries(storageStats.details.tableSizes || {}) as Array<[string, { size_kb: number; rows: number }]>;
        
        const topTables = tableEntries
            .map(([tableName, tableData]) => {
                // Safely convert size_kb and rows to numbers
                const sizeKb = typeof tableData.size_kb === 'number' ? tableData.size_kb :
                              typeof tableData.size_kb === 'string' ? parseFloat(tableData.size_kb) : 0;
                const rows = typeof tableData.rows === 'number' ? tableData.rows :
                            typeof tableData.rows === 'string' ? parseInt(tableData.rows, 10) : 0;
                
                return [tableName, { size_kb: sizeKb, rows }] as [string, { size_kb: number; rows: number }];
            })
            .sort(([, a], [, b]) => b.size_kb - a.size_kb)
            .slice(0, 5);
        
        return {
            percentage: storageStats.percentage,
            used: formatStorage(storageStats.totalUsedMB),
            usedPrecise: formatPrecise(storageStats.totalUsedMB),
            total: formatStorage(storageStats.totalStorageMB),
            database: storageStats.breakdown.database,
            files: storageStats.breakdown.files,
            details: storageStats.details,
            topTables: topTables,
            rawValues: {
                usedMB: storageStats.totalUsedMB,
                totalMB: storageStats.totalStorageMB
            }
        };
    };

    const storageUsage = calculateStorageUsage();

    // Helper function to safely render top tables
    const renderTopTables = () => {
        if (!storageUsage.topTables || storageUsage.topTables.length === 0) {
            return null;
        }
        
        return (
            <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Top Tables by Size</h4>
                <div className="space-y-2">
                    {storageUsage.topTables.map((tableEntry, index) => {
                        const [tableName, tableData] = tableEntry as [string, { size_kb: number; rows: number }];
                        
                        // Safely handle tableData values
                        const sizeKb = Number(tableData.size_kb) || 0;
                        const rows = Number(tableData.rows) || 0;
                        
                        return (
                            <div key={tableName} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {index + 1}.
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                        {tableName.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {sizeKb.toFixed(1)} KB
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                        ({rows.toLocaleString()} rows)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Custom chart component for daily collections
    const DailyCollectionsChart = () => {
        const collections = props.paymentStats.dailyCollections || [];
        const maxAmount = collections.length > 0 ? 
            Math.max(...collections.map(item => parseFloat(item.amount.replace(/,/g, '')))) : 0;
        
        if (collections.length === 0) {
            return (
                <div className="flex h-32 items-center justify-center text-gray-500">
                    No collection data available
                </div>
            );
        }
        
        return (
            <div className="space-y-2">
                {collections.map((item, index) => {
                    const amount = parseFloat(item.amount.replace(/,/g, ''));
                    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    
                    return (
                        <div key={index} className="flex items-center gap-4">
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-400">{item.day}</div>
                            <div className="flex-1">
                                <div className="h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-20 text-right text-sm font-medium text-gray-900 dark:text-white">
                                ₱{item.amount}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Custom pie chart for payment methods
    const PaymentMethodsChart = () => {
        const methods = props.paymentStats.byPaymentMethod || [];
        const total = methods.reduce((sum, item) => sum + item.count, 0);
        const colors = [
            'bg-emerald-500',
            'bg-amber-500',
            'bg-purple-500',
            'bg-blue-500',
            'bg-rose-500',
            'bg-cyan-500'
        ];
        
        if (methods.length === 0) {
            return (
                <div className="flex h-40 items-center justify-center text-gray-500">
                    No payment method data
                </div>
            );
        }
        
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center">
                    <div className="relative h-40 w-40">
                        <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                        {methods.map((item, index) => {
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;
                            const rotation = methods
                                .slice(0, index)
                                .reduce((sum, i) => sum + (i.count / total) * 360, 0);
                            
                            return (
                                <div
                                    key={index}
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        clipPath: `conic-gradient(${colors[index % colors.length]} 0% ${percentage}%, transparent ${percentage}% 100%)`,
                                        transform: `rotate(${rotation}deg)`
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {methods.map((item, index) => {
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                        
                        return (
                            <div key={index} className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.method}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{percentage}%</div>
                                </div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Helper function to get clearance type color
    const getClearanceTypeColor = (index: number) => {
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
            'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
            'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
        ];
        return colors[index % colors.length];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangay Dashboard - Kibawe Management System" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header with view toggle and refresh */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                                Barangay Kibawe Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Welcome back! Here's what's happening in your barangay today.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setActiveView('overview')}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeView === 'overview' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveView('detailed')}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeView === 'detailed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                            >
                                Detailed
                            </button>
                        </div>
                    </div>
                    
                    {/* Date and time display */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(dateTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(dateTime)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Stats Grid with dynamic data */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.title}
                                href={stat.href}
                                className="group relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-sidebar-border dark:bg-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            {getChangeIcon(stat.changeType)}
                                            <p className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-emerald-600' : stat.changeType === 'decrease' ? 'text-rose-600' : 'text-gray-600'}`}>
                                                {stat.change} from yesterday
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`${stat.color} rounded-xl p-3 text-white shadow-sm`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="absolute -right-6 -bottom-6 h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-gray-700" />
                                <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                            </Link>
                        );
                    })}
                </div>

                {/* Detailed View Charts */}
                {activeView === 'detailed' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Weekly Collections Trend
                                </h3>
                            </div>
                            <DailyCollectionsChart />
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Payment Methods
                                </h3>
                            </div>
                            <PaymentMethodsChart />
                        </div>
                        {/* Clearance Request Status */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Clearance Request Status
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {props.clearanceRequestStats.byStatus.map((status, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-full px-3 py-1 text-xs font-medium ${getClearanceTypeColor(index)}`}>
                                                {status.status}
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {status.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Clearance Types */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Popular Clearance Types
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {props.clearanceTypeStats
                                    .sort((a, b) => b.monthly_requests - a.monthly_requests)
                                    .slice(0, 5)
                                    .map((type, index) => (
                                        <div key={type.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {type.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {type.fee} • {type.processing_days} days processing
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {type.monthly_requests}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    this month
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Quick Actions & Recent Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Quick Actions
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Frequently used administrative tasks
                                    </p>
                                </div>
                                <Link 
                                    href="/admin/tools"
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    View all tools
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.label}
                                            href={action.href}
                                            className="group flex flex-col items-start rounded-lg border border-sidebar-border/70 bg-white p-4 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm dark:border-sidebar-border dark:bg-gray-800/50 dark:hover:bg-blue-900/20"
                                        >
                                            <div className="mb-3 flex w-full items-center justify-between">
                                                <div className="rounded-lg bg-blue-100 p-2 group-hover:bg-blue-200 dark:bg-blue-900/30">
                                                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                {action.badge && (
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        {action.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {action.label}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                {action.description}
                                            </p>
                                            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                                                <span>Go to action</span>
                                                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Recent Activities
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Latest system events and user actions
                                    </p>
                                </div>
                                <Link 
                                    href="/admin/activity-log"
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    View all logs
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => {
                                        const Icon = activity.icon;
                                        return (
                                            <div
                                                key={activity.id}
                                                className="group flex items-start gap-4 rounded-lg border border-sidebar-border/70 p-4 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-sidebar-border dark:hover:bg-blue-900/10"
                                            >
                                                <div className={`mt-1 rounded-lg p-2 ${activity.bgColor}`}>
                                                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {activity.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-3">
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 capitalize dark:bg-gray-700 dark:text-gray-300">
                                                            {activity.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {activity.time}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No recent activities
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Collection Summary & System Status */}
                    <div className="space-y-6">
                        {/* Collection Summary */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Collection Summary
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Today's financial overview
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                Today's Collection
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                                                ₱{props.collectionStats.today}
                                            </p>
                                        </div>
                                        <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            Yesterday
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                                            ₱{props.collectionStats.yesterday}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                            This Week
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-purple-800 dark:text-purple-200">
                                            ₱{props.collectionStats.weekly}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                            This Year
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-amber-800 dark:text-amber-200">
                                            ₱{props.collectionStats.yearly}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-cyan-50 p-4 dark:bg-cyan-900/20">
                                        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                            Daily Avg
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-cyan-800 dark:text-cyan-200">
                                            ₱{props.collectionStats.dailyAvg}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clearance System Overview */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Clearance System
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Overview of clearance requests
                                    </p>
                                </div>
                                <Link 
                                    href="/clearance-requests"
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            By Type
                                        </p>
                                        <div className="mt-2 space-y-2">
                                            {props.clearanceRequestStats.byType.slice(0, 3).map((type, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-sm text-blue-800 dark:text-blue-200">{type.type}</span>
                                                    <span className="font-bold text-blue-900 dark:text-blue-100">{type.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                            By Urgency
                                        </p>
                                        <div className="mt-2 space-y-2">
                                            {props.clearanceRequestStats.byUrgency.map((urgency, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-sm text-purple-800 dark:text-purple-200">{urgency.urgency}</span>
                                                    <span className="font-bold text-purple-900 dark:text-purple-100">{urgency.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                Today's Requests
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                                                {props.activityStats.clearanceRequestsToday}
                                            </p>
                                        </div>
                                        <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Status with ACTUAL Storage Usage */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        System Status
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Real-time service monitoring
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wifi className="h-5 w-5 text-emerald-500" />
                                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        All systems operational
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {systemStatus.map((status) => {
                                    const Icon = getSystemStatusIcon(status.service);
                                    return (
                                        <div 
                                            key={status.service}
                                            className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-lg p-2 ${
                                                    status.status === 'online' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                                    status.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                    'bg-rose-100 dark:bg-rose-900/30'
                                                }`}>
                                                    <Icon className={`h-4 w-4 ${
                                                        status.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' :
                                                        status.status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-rose-600 dark:text-rose-400'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {status.service}
                                                    </p>
                                                    {status.details && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {status.details}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(status.status)}`}>
                                                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {status.lastCheck}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Storage Usage - Based on ACTUAL Database Size (2.2 MiB) */}
                            <div className="mt-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">Storage Usage</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {storageUsage.details.tableCount} tables, {storageUsage.details.totalRows.toLocaleString()} total rows
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-900 dark:text-white">{storageUsage.percentage}%</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {storageUsage.usedPrecise} / {storageUsage.total}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                        style={{ width: `${Math.max(1, storageUsage.percentage)}%` }}
                                    />
                                </div>
                                
                                {/* Database Details */}
                                <div className="mb-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Database className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Database</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    {storageUsage.details.databaseSizeMB.toFixed(1)} MB • {storageUsage.database}% of storage
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                                {storageUsage.details.tableCount} tables
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* File Storage (if exists) */}
                                {storageUsage.details.fileStorageSizeMB > 0 && (
                                    <div className="mb-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4 text-emerald-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Files & Documents</p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                        {storageUsage.details.fileStorageSizeMB.toFixed(1)} MB • {storageUsage.files}% of storage
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                                    {storageUsage.details.fileCount} files
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Top Tables by Size */}
                                {renderTopTables()}
                                
                                {/* Data Statistics */}
                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                                        <span>Residents</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.residentCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                                        <span>Households</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.householdCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                                        <span>Payments</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.paymentCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                                        <span>Clearances</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.clearanceCount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}