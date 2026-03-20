// pages/admin/Dashboard.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

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
import { type PageProps, type StatItem, type QuickAction } from '@/components/admin/dashboard/types/dashboard';

// Import icons
import { 
    Users, Home, CreditCard, FileText, Heart, HeartHandshake, Baby, Gift,
    UserPlus, FilePlus, TrendingUp, Award, DollarSign, PieChart, Bell, 
    Clock, Activity, MapPin, BarChart, Calendar, Shield, Star, Zap,
    CheckCircle, XCircle, AlertCircle, Menu, X, ChevronDown
} from 'lucide-react';

const DASHBOARD_URL = '/admin/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Barangay Dashboard',
        href: DASHBOARD_URL,
    },
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'analytics' | 'demographics'>('overview');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'year'>(props.selectedDateRange || 'week');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        stats: true,
        quickActions: true,
        charts: false,
        recent: true,
        summary: true
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

    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        if (diffInMinutes < 10080) {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleRefresh = () => {
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
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

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

    const stats: StatItem[] = [
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
    ];

    const detailedStats: StatItem[] = [
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
    ];

    const quickActions: QuickAction[] = [
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
    ];

    const mobileQuickActions = quickActions.slice(0, 4);
    const recentPayments = props.recentActivities?.recentPayments || [];
    const popularClearances = props.clearanceTypeStats || [];
    const recentResidents = props.recentActivities?.newResidents || [];
    const dailyCollections = props.paymentStats?.dailyCollections || [];
    const clearanceStatus = props.clearanceRequestStats?.byStatus || [];
    const privilegeStats = props.privilegeStats || {
        byPrivilege: [],
        expiringSoon: [],
        recentlyExpired: [],
        totalActive: 0
    };

    const systemStatus = [
        {
            service: 'Database',
            status: 'online' as const,
            lastCheck: 'Just now',
            details: `Residents: ${props.stats.totalResidents}`,
            uptime: '99.9%',
            responseTime: '45ms'
        },
        {
            service: 'Payment System',
            status: 'online' as const,
            lastCheck: '5 min ago',
            details: `₱${props.collectionStats.today} collected`,
            uptime: '99.5%',
            responseTime: '120ms'
        },
        {
            service: 'Clearance System',
            status: (props.stats.pendingClearances > 10 ? 'warning' : 'online') as const,
            lastCheck: '2 hours ago',
            details: `${props.stats.pendingClearances} pending`,
            uptime: '98.2%',
            responseTime: '230ms'
        }
    ];

    // Mobile view rendering
    if (isMobile) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Barangay Dashboard - Management System" />
                
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-gray-900">Barangay Dashboard</h1>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
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
                    {/* Stats Grid - Always visible first */}
                    <div className="grid grid-cols-2 gap-2">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} stat={stat} />
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-gray-500">Quick Actions</h2>
                        <QuickActions actions={mobileQuickActions} />
                    </div>

                    {/* Recent Activities */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-gray-500">Recent Activities</h2>
                        <RecentActivities activities={props.activities || []} isMobile={true} />
                    </div>

                    {/* Collapsible Sections */}
                    <div className="space-y-3">
                        {/* Charts Section */}
                        <div className="border rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleSection('charts')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50"
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
                                    <PrivilegeStats data={privilegeStats} />
                                </div>
                            )}
                        </div>

                        {/* Summary Section */}
                        <div className="border rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleSection('summary')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50"
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
                                        storageUsage={props.storageStats}
                                        autoRefresh={autoRefresh}
                                        onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Recent Residents Section */}
                        <div className="border rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleSection('recentResidents')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50"
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

                {/* Removed the duplicate mobile footer - now using global MobileStickyFooter */}
            </AppLayout>
        );
    }

    // Desktop view
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangay Dashboard - Management System" />
            
            {/* Desktop Header */}
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
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} stat={stat} />
                    ))}
                </div>

                {/* Detailed Stats */}
                {(activeView === 'detailed' || activeView === 'analytics') && (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {detailedStats.map((stat) => (
                            <StatCard key={stat.title} stat={stat} />
                        ))}
                    </div>
                )}

                {/* View-specific content */}
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

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <QuickActions actions={quickActions} />
                        
                        <RecentActivities 
                            activities={props.activities || []} 
                        />
                        
                        {/* Charts Row 1 */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <DailyCollectionsChart data={dailyCollections} />
                            <RecentPayments payments={recentPayments} />
                        </div>
                        
                        {/* Charts Row 2 */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <PopularClearances clearances={popularClearances} />
                            <ClearanceStatusChart data={clearanceStatus} />
                        </div>
                        
                        {/* Charts Row 3 */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <PrivilegeStats data={privilegeStats} />
                            <RecentResidents residents={recentResidents} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <CollectionSummary collectionStats={props.collectionStats} />
                        <ClearanceOverview 
                            clearanceRequestStats={props.clearanceRequestStats}
                            clearanceRequestsToday={props.activityStats?.clearanceRequestsToday || 0}
                        />
                        <SystemStatus 
                            statuses={systemStatus}
                            storageUsage={props.storageStats}
                            autoRefresh={autoRefresh}
                            onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}