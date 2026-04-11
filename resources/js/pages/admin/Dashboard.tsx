// pages/admin/Dashboard.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { type BreadcrumbItem } from '@/types/breadcrumbs';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';

// Import components
import { Header } from '@/components/admin/dashboard/Header';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { RecentActivities } from '@/components/admin/dashboard/RecentActivities';
import { CollectionSummary } from '@/components/admin/dashboard/CollectionSummary';
import { ClearanceOverview } from '@/components/admin/dashboard/ClearanceOverview';
import { SystemStatus } from '@/components/admin/dashboard/SystemStatus';
import { DetailedView } from '@/components/admin/dashboard/views/DetailedView';
import { AnalyticsView } from '@/components/admin/dashboard/views/AnalyticsView';
import { DemographicsView } from '@/components/admin/dashboard/views/DemographicsView';
import { RecentPayments } from '@/components/admin/dashboard/RecentPayments';
import { PopularClearances } from '@/components/admin/dashboard/PopularClearances';
import { RecentResidents } from '@/components/admin/dashboard/RecentResidents';
import { PrivilegeStats } from '@/components/admin/dashboard/PrivilegeStats';
import { DailyCollectionsChart } from '@/components/admin/dashboard/charts/DailyCollectionsChart';
import { ClearanceStatusChart } from '@/components/admin/dashboard/charts/ClearanceStatusChart';

// Import types
import { 
    type PageProps, 
    type StatItem, 
    type QuickAction, 
    type ActivityItem,
    type PrivilegeStatsData,
    type SystemStatus as SystemStatusType
} from '@/types/admin/dashboard/dashboard';

// Import icons
import { 
    Users, Home, CreditCard, FileText, Heart, HeartHandshake, Baby, Gift,
    UserPlus, FilePlus, Menu, X, ChevronDown
} from 'lucide-react';

const DASHBOARD_URL = '/admin/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Barangay Dashboard',
        href: DASHBOARD_URL,
    },
];

// Local interface that matches exactly what RecentActivities expects
interface RecentActivityItem {
    id: number;
    description: string;
    type: string;
    time: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    priority: string;
    isRead: boolean;
    data?: any;
    created_at?: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    subject_type?: string;
    subject_id?: number;
    properties?: any;
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'analytics' | 'demographics'>('overview');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'year'>(
        props.selectedDateRange || 'week'
    );
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        stats: true,
        quickActions: true,
        charts: false,
        recent: true,
        summary: true,
        recentResidents: false
    });

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (props.selectedDateRange) {
            setSelectedTimeRange(props.selectedDateRange);
        }
    }, [props.selectedDateRange]);

    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            handleRefresh();
        }, 300000);
        
        return () => clearInterval(interval);
    }, [autoRefresh]);

    useEffect(() => {
        const handleOrientationChange = () => {
            window.dispatchEvent(new Event('resize'));
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        return () => window.removeEventListener('orientationchange', handleOrientationChange);
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        router.reload({
            only: [
                'stats', 'activities', 'recentActivities', 'paymentStats', 'clearanceRequestStats', 
                'clearanceTypeStats', 'collectionStats', 'activityStats', 'storageStats', 
                'demographicStats', 'privilegeStats', 'selectedDateRange'
            ],
            onSuccess: () => {
                setTimeout(() => setRefreshing(false), 500);
            },
            onError: () => {
                setRefreshing(false);
            }
        });
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, []);

    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    const calculateChange = useCallback((current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    }, []);

    const yesterdayStats = useMemo(() => {
        const todayResidents = props.stats.totalResidents;
        const newResidentsToday = props.activityStats?.newResidentsToday ?? 0;
        const yesterdayResidents = Math.max(0, todayResidents - newResidentsToday);
        
        const yesterdayPayments = parseFloat(props.collectionStats.yesterday.replace(/,/g, '')) || 0;
        
        const pendingClearances = props.stats.pendingClearances;
        const clearanceRequestsToday = props.activityStats?.clearanceRequestsToday ?? 0;
        const yesterdayClearances = Math.max(0, pendingClearances - clearanceRequestsToday);
        
        return {
            residents: yesterdayResidents,
            payments: yesterdayPayments,
            clearances: yesterdayClearances
        };
    }, [props.stats, props.activityStats, props.collectionStats]);

    const stats: StatItem[] = useMemo(() => [
        {
            title: 'Total Residents',
            value: props.stats.totalResidents.toLocaleString(),
            change: calculateChange(props.stats.totalResidents, yesterdayStats.residents),
            changeType: props.stats.totalResidents > yesterdayStats.residents ? 'increase' : 
                       props.stats.totalResidents < yesterdayStats.residents ? 'decrease' : 'neutral',
            icon: Users,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            href: '/admin/residents',
            trend: props.stats.totalResidents > yesterdayStats.residents ? 'up' : 'stable',
        },
        {
            title: 'Total Households',
            value: props.stats.totalHouseholds.toLocaleString(),
            change: calculateChange(props.stats.totalHouseholds, Math.floor(props.stats.totalHouseholds * 0.99)),
            changeType: props.stats.totalHouseholds > Math.floor(props.stats.totalHouseholds * 0.99) ? 'increase' : 'neutral',
            icon: Home,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            href: '/admin/households',
            trend: 'stable',
        },
        {
            title: 'Monthly Collections',
            value: `₱${props.collectionStats.monthly}`,
            change: props.collectionStats.growthRate,
            changeType: parseFloat(props.collectionStats.growthRate) > 0 ? 'increase' : 
                       parseFloat(props.collectionStats.growthRate) < 0 ? 'decrease' : 'neutral',
            icon: CreditCard,
            color: 'bg-gradient-to-br from-amber-500 to-amber-600',
            href: '/admin/payments',
            trend: parseFloat(props.collectionStats.growthRate) > 0 ? 'up' : 'down',
        },
        {
            title: 'Pending Clearances',
            value: props.stats.pendingClearances.toLocaleString(),
            change: calculateChange(props.stats.pendingClearances, yesterdayStats.clearances),
            changeType: props.stats.pendingClearances > yesterdayStats.clearances ? 'increase' : 
                       props.stats.pendingClearances < yesterdayStats.clearances ? 'decrease' : 'neutral',
            icon: FileText,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            href: '/admin/clearances?status=pending',
            trend: props.stats.pendingClearances < yesterdayStats.clearances ? 'down' : 'up',
        },
    ], [props.stats, props.collectionStats, yesterdayStats, calculateChange]);

    const detailedStats: StatItem[] = useMemo(() => [
        {
            title: 'Senior Citizens',
            value: props.stats.seniorCitizens?.toLocaleString() || '0',
            change: '+2.5%',
            changeType: 'increase',
            icon: Heart,
            color: 'bg-gradient-to-br from-rose-500 to-rose-600',
            href: '/admin/residents?privilege=senior',
            trend: 'up'
        },
        {
            title: 'PWDs',
            value: props.stats.pwds?.toLocaleString() || '0',
            change: '+1.2%',
            changeType: 'increase',
            icon: HeartHandshake,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            href: '/admin/residents?privilege=pwd',
            trend: 'up'
        },
        {
            title: 'Solo Parents',
            value: props.stats.soloParents?.toLocaleString() || '0',
            change: '-0.5%',
            changeType: 'decrease',
            icon: Baby,
            color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
            href: '/admin/residents?privilege=solo-parent',
            trend: 'down'
        },
        {
            title: '4Ps',
            value: props.stats.fourPs?.toLocaleString() || '0',
            change: '+3.8%',
            changeType: 'increase',
            icon: Gift,
            color: 'bg-gradient-to-br from-teal-500 to-teal-600',
            href: '/admin/residents?privilege=4ps',
            trend: 'up'
        },
    ], [props.stats]);

    const quickActions: QuickAction[] = useMemo(() => [
        { 
            icon: UserPlus, 
            label: 'Register Resident', 
            href: '/admin/residents/create',
            description: 'Add new resident to the system',
            badge: props.activityStats?.newResidentsToday ? 
                `${props.activityStats.newResidentsToday} today` : 
                undefined,
            category: 'resident',
            shortcut: 'Alt+R'
        },
        { 
            icon: Home,
            label: 'Add Household', 
            href: '/admin/households/create',
            description: 'Register new household',
            badge: props.recentActivities?.newResidents?.length > 3 ? 
                'New family' : 
                undefined,
            category: 'resident',
            shortcut: 'Alt+H'
        },
        { 
            icon: FilePlus, 
            label: 'Request Clearance', 
            href: '/admin/clearances/create',
            description: 'Create clearance request',
            badge: props.stats.pendingClearances > 0 ? 
                `${props.stats.pendingClearances} pending` : 
                undefined,
            category: 'clearance',
            shortcut: 'Alt+C'
        },
        { 
            icon: CreditCard, 
            label: 'Process Payment', 
            href: '/admin/payments/create',
            description: 'Record and process payments',
            badge: props.activityStats?.paymentsToday ? 
                `${props.activityStats.paymentsToday} today` : 
                'Process',
            category: 'payment',
            shortcut: 'Alt+P'
        },
    ], [props.activityStats, props.recentActivities, props.stats.pendingClearances]);

    const mobileQuickActions = quickActions.slice(0, 4);
    
    // Transform activities to match what RecentActivities expects (with priority as required string)
    const transformedActivities: RecentActivityItem[] = useMemo(() => {
        const rawActivities = props.activities || [];
        return rawActivities.map(activity => ({
            id: activity.id || 0,
            type: activity.type || 'announcement',
            description: activity.description || '',
            time: activity.time || activity.created_at || new Date().toISOString(),
            icon: activity.icon || 'Activity',
            iconColor: activity.iconColor || 'text-blue-500',
            bgColor: activity.bgColor || 'bg-blue-100',
            data: activity.data,
            isRead: activity.isRead || false,
            priority: activity.priority || 'medium', // Ensure priority is always a string
            created_at: activity.created_at || new Date().toISOString(),
            causer: activity.causer,
            subject_type: activity.subject_type,
            subject_id: activity.subject_id,
            properties: activity.properties
        }));
    }, [props.activities]);
    
    // Ensure we have valid arrays
    const recentPayments = useMemo(() => props.recentActivities?.recentPayments || [], [props.recentActivities]);
    const popularClearances = useMemo(() => props.clearanceTypeStats || [], [props.clearanceTypeStats]);
    const recentResidents = useMemo(() => props.recentActivities?.newResidents || [], [props.recentActivities]);
    const dailyCollections = useMemo(() => props.paymentStats?.dailyCollections || [], [props.paymentStats]);
    const clearanceStatus = useMemo(() => props.clearanceRequestStats?.byStatus || [], [props.clearanceRequestStats]);
    
    // Transform storage stats to match SystemStatus expected format
    const transformedStorageStats = useMemo(() => {
        const storage = props.storageStats;
        if (!storage) {
            return {
                percentage: 0,
                usedPrecise: '0 MB',
                total: '0 MB',
                database: 0,
                files: 0,
                backups: 0,
                logs: 0,
                details: {
                    tableCount: 0,
                    totalRows: 0,
                    residentCount: 0,
                    householdCount: 0,
                    paymentCount: 0,
                    clearanceCount: 0,
                },
                backupStatus: {
                    lastBackup: 'Never',
                    backupSize: '0 MB',
                },
                topTables: [] as [string, { size_kb: number; rows: number }][]
            };
        }
        
        const topTables: [string, { size_kb: number; rows: number }][] = Object.entries(storage.details?.tableSizes || {})
            .sort((a, b) => b[1].size_kb - a[1].size_kb)
            .slice(0, 5)
            .map(([name, data]) => [name, { size_kb: data.size_kb, rows: data.rows }]);
        
        return {
            percentage: storage.percentage,
            usedPrecise: `${storage.totalUsedMB} MB`,
            total: `${storage.totalStorageMB} MB`,
            database: storage.breakdown?.database || 0,
            files: storage.breakdown?.files || 0,
            backups: storage.breakdown?.backups || 0,
            logs: storage.breakdown?.logs || 0,
            details: {
                tableCount: storage.details?.tableCount || 0,
                totalRows: storage.details?.totalRows || 0,
                residentCount: storage.details?.residentCount || 0,
                householdCount: storage.details?.householdCount || 0,
                paymentCount: storage.details?.paymentCount || 0,
                clearanceCount: storage.details?.clearanceCount || 0,
            },
            backupStatus: storage.backupStatus || {
                lastBackup: 'Never',
                backupSize: '0 MB',
            },
            topTables
        };
    }, [props.storageStats]);

    // Transform privilege stats to match component expectations
    const transformedPrivilegeStats: PrivilegeStatsData = useMemo(() => {
        if (!props.privilegeStats) {
            return {
                byPrivilege: [],
                expiringSoon: [],
                recentlyExpired: [],
                totalActive: 0
            };
        }
        
        // Transform expiringSoon and recentlyExpired to include all required fields
        const transformExpiringItem = (item: any) => ({
            id: item.id || 0,
            resident_id: item.resident_id || 0,
            resident_name: item.resident_name || item.name || '',
            first_name: item.first_name || '',
            last_name: item.last_name || '',
            privilege_type: item.privilege_type || item.type || '',
            privilege_name: item.privilege_name || item.name || '',
            privilege_code: item.privilege_code || item.code || '',
            expiry_date: item.expiry_date || item.expires_at || '',
            expires_at: item.expires_at || item.expiry_date || '',
            days_remaining: item.days_remaining || 0
        });
        
        return {
            byPrivilege: props.privilegeStats.byPrivilege || [],
            expiringSoon: (props.privilegeStats.expiringSoon || []).map(transformExpiringItem),
            recentlyExpired: (props.privilegeStats.recentlyExpired || []).map(transformExpiringItem),
            totalActive: props.privilegeStats.totalActive || 0
        };
    }, [props.privilegeStats]);

    const systemStatus: SystemStatusType[] = useMemo(() => {
        return [
            {
                service: 'Database',
                status: 'online',
                lastCheck: 'Just now',
                details: `Residents: ${props.stats.totalResidents}`,
                uptime: '99.9%',
                responseTime: '45ms'
            },
            {
                service: 'Payment System',
                status: 'online',
                lastCheck: '5 min ago',
                details: `₱${props.collectionStats.today} collected`,
                uptime: '99.5%',
                responseTime: '120ms'
            },
            {
                service: 'Clearance System',
                status: props.stats.pendingClearances > 10 ? 'warning' : 'online',
                lastCheck: '2 hours ago',
                details: `${props.stats.pendingClearances} pending`,
                uptime: '98.2%',
                responseTime: '230ms'
            }
        ];
    }, [props.stats, props.collectionStats]);

    // Mobile view rendering
    if (isMobile) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Barangay Dashboard - Management System" />
                
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-gray-900">Barangay Dashboard</h1>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    {showMobileMenu && (
                        <div className="fixed inset-0 top-[57px] z-50 bg-white overflow-y-auto">
                            <div className="p-4">
                                <Header 
                                    activeView={activeView}
                                    setActiveView={setActiveView}
                                    selectedTimeRange={selectedTimeRange}
                                    setSelectedTimeRange={setSelectedTimeRange}
                                    activeUsers={props.activityStats?.activeUsers || 0}
                                    onRefresh={handleRefresh}
                                    isRefreshing={refreshing}
                                    isFullscreen={isFullscreen}
                                    onToggleFullscreen={toggleFullscreen}
                                    isMobile={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex h-full flex-1 flex-col gap-4 p-3 pb-24">
                    <div className="grid grid-cols-2 gap-2">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} stat={stat} />
                        ))}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-gray-500">Quick Actions</h2>
                        <QuickActions actions={mobileQuickActions} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-gray-500">Recent Activities</h2>
                        <RecentActivities activities={transformedActivities} isMobile={true} />
                    </div>

                    <div className="space-y-3">
                        <div className="border rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleSection('charts')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                aria-expanded={expandedSections.charts}
                            >
                                <span className="text-sm font-medium text-gray-700">Analytics & Charts</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.charts ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSections.charts && (
                                <div className="p-3 space-y-3">
                                    <DailyCollectionsChart data={dailyCollections} />
                                    <RecentPayments payments={recentPayments.slice(0, 3)} />
                                    <PopularClearances clearances={popularClearances.slice(0, 3)} />
                                    <ClearanceStatusChart data={clearanceStatus} />
                                    <PrivilegeStats data={transformedPrivilegeStats} />
                                </div>
                            )}
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleSection('summary')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                aria-expanded={expandedSections.summary}
                            >
                                <span className="text-sm font-medium text-gray-700">Summary</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.summary ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSections.summary && (
                                <div className="p-3 space-y-3">
                                    <CollectionSummary collectionStats={props.collectionStats} />
                                    <ClearanceOverview 
                                        clearanceRequestStats={props.clearanceRequestStats}
                                        clearanceRequestsToday={props.activityStats?.clearanceRequestsToday || 0}
                                    />
                                    <SystemStatus 
                                        statuses={systemStatus}
                                        storageUsage={transformedStorageStats}
                                        autoRefresh={autoRefresh}
                                        onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleSection('recentResidents')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                aria-expanded={expandedSections.recentResidents}
                            >
                                <span className="text-sm font-medium text-gray-700">Recent Residents</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.recentResidents ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {expandedSections.recentResidents && (
                                <div className="p-3">
                                    <RecentResidents residents={recentResidents.slice(0, 3)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Desktop view
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangay Dashboard - Management System" />
            
            <div className="hidden md:block">
                <Header 
                    activeView={activeView}
                    setActiveView={setActiveView}
                    selectedTimeRange={selectedTimeRange}
                    setSelectedTimeRange={setSelectedTimeRange}
                    activeUsers={props.activityStats?.activeUsers || 0}
                    onRefresh={handleRefresh}
                    isRefreshing={refreshing}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                />
            </div>
            
            <div className="flex h-full flex-1 flex-col gap-4 p-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} stat={stat} />
                    ))}
                </div>

                {(activeView === 'detailed' || activeView === 'analytics') && (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {detailedStats.map((stat) => (
                            <StatCard key={stat.title} stat={stat} />
                        ))}
                    </div>
                )}

                {activeView === 'detailed' && props.paymentStats && props.clearanceRequestStats && props.clearanceTypeStats && (
                    <DetailedView 
                        paymentStats={props.paymentStats}
                        clearanceRequestStats={props.clearanceRequestStats}
                        clearanceTypeStats={props.clearanceTypeStats}
                    />
                )}

                {activeView === 'analytics' && props.collectionStats && props.activityStats && props.recentActivities && (
                    <AnalyticsView 
                        collectionStats={props.collectionStats}
                        activityStats={props.activityStats}
                        recentActivities={props.recentActivities}
                    />
                )}

                {activeView === 'demographics' && props.demographicStats && (
                    <DemographicsView 
                        demographicStats={props.demographicStats}
                        totalResidents={props.stats.totalResidents}
                    />
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <QuickActions actions={quickActions} />
                        <RecentActivities activities={transformedActivities} />
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <DailyCollectionsChart data={dailyCollections} />
                            <RecentPayments payments={recentPayments} />
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <PopularClearances clearances={popularClearances} />
                            <ClearanceStatusChart data={clearanceStatus} />
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <PrivilegeStats data={transformedPrivilegeStats} />
                            <RecentResidents residents={recentResidents} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <CollectionSummary collectionStats={props.collectionStats} />
                        <ClearanceOverview 
                            clearanceRequestStats={props.clearanceRequestStats}
                            clearanceRequestsToday={props.activityStats?.clearanceRequestsToday || 0}
                        />
                        <SystemStatus 
                            statuses={systemStatus}
                            storageUsage={transformedStorageStats}
                            autoRefresh={autoRefresh}
                            onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}