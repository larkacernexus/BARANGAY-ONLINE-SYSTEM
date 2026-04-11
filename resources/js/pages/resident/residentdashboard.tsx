// /Pages/resident/Dashboard.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowUp, Sparkles, ChevronRight, Plus, LayoutDashboard, FileText, CreditCard, Clock, AlertCircle, AlertTriangle, Bell, Calendar, FileCheck, Grid, Home, MessageSquare, User, Users, Wallet, ChevronDown } from 'lucide-react';
import AppLayout from '@/layouts/resident-app-layout';

// Hooks
import { useMobile } from '@/components/residentui/hooks/use-mobile';

// Components
import { GlassCard } from '@/components/portal/dashboard/GlassCard';
import { MetricCard } from '@/components/portal/dashboard/MetricCard';
import { ActionCard } from '@/components/portal/dashboard/ActionCard';
import { ActivityFeed } from '@/components/portal/dashboard/ActivityFeed';
import { TransactionItem } from '@/components/portal/dashboard/TransactionItem';
import { AnnouncementBanner } from '@/components/portal/dashboard/AnnouncementBanner';
import { EventCard } from '@/components/portal/dashboard/EventCard';
import { EmergencyContact } from '@/components/portal/dashboard/EmergencyContact';
import { ServiceTile } from '@/components/portal/dashboard/ServiceTile';

// Constants
import { EMERGENCY_CONTACTS, DOCUMENT_SERVICES, PAYMENT_SERVICES } from '@/components/residentui/dashboard/constants';

// Types
import { 
    Stats, Resident, Payment, Clearance, Complaint, 
    Announcement, Event, PaymentSummary, Activity 
} from '@/types/portal/dashboard/dashboard-types';

// Utils
import { formatCurrency, formatDate, getStatusBadge } from '@/utils/portal/dashboard/dashboard-utils';
import { cn } from '@/lib/utils';

interface DashboardProps {
    stats?: Stats;
    announcements?: Announcement[];
    upcomingEvents?: Event[];
    paymentSummary?: PaymentSummary[];
    resident?: Resident;
    recentPayments?: Payment[];
    pendingClearances?: Clearance[];
    activeComplaints?: Complaint[];
}

// Tab options for dropdown
const TAB_OPTIONS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: Clock },
];

export default function Dashboard({ 
    stats = {}, 
    announcements = [], 
    upcomingEvents = [], 
    paymentSummary = [],
    resident = {},
    recentPayments = [],
    pendingClearances = [],
    activeComplaints = []
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileSection, setMobileSection] = useState<'activity' | 'transactions'>('activity');
    const isMobile = useMobile();

    // Handle scroll to show/hide scroll top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showDropdown && !target.closest('.tab-dropdown')) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    const safeStats = useMemo(() => ({
        totalPayments: stats?.total_payments || recentPayments?.length || 0,
        totalClearances: stats?.total_clearances || pendingClearances?.length || 0,
        totalComplaints: stats?.total_complaints || activeComplaints?.length || 0,
        pendingRequests: (pendingClearances?.length || 0) + (activeComplaints?.filter(c => c?.status === 'pending')?.length || 0)
    }), [stats, recentPayments, pendingClearances, activeComplaints]);

    const quickActions = useMemo(() => [
        { 
            icon: FileText, 
            label: 'Request Clearance', 
            description: 'Get barangay clearance',
            href: '/resident/clearances/create',
            badge: pendingClearances?.length,
            gradient: 'from-blue-500 to-blue-600'
        },
        { 
            icon: MessageSquare, 
            label: 'File Complaint', 
            description: 'Report concerns',
            href: '/resident/complaints/create',
            badge: activeComplaints?.length,
            gradient: 'from-amber-500 to-orange-600'
        },
        { 
            icon: CreditCard, 
            label: 'Make Payment', 
            description: 'Pay fees online',
            href: '/resident/payments',
            gradient: 'from-emerald-500 to-teal-600'
        },
        { 
            icon: User, 
            label: 'Update Profile', 
            description: 'Edit your info',
            href: '/resident/profile/edit',
            gradient: 'from-purple-500 to-pink-600'
        },
    ], [pendingClearances, activeComplaints]);

    const services = useMemo(() => [
        { icon: FileText, label: 'Clearance', href: '/resident/clearances', gradient: 'from-blue-500 to-blue-600', count: pendingClearances?.length },
        { icon: CreditCard, label: 'Payments', href: '/resident/payments', gradient: 'from-emerald-500 to-emerald-600' },
        { icon: Users, label: 'Family', href: '/resident/family', gradient: 'from-purple-500 to-purple-600' },
        { icon: MessageSquare, label: 'Complaints', href: '/resident/complaints', gradient: 'from-amber-500 to-amber-600', count: activeComplaints?.length },
        { icon: FileCheck, label: 'Records', href: '/resident/documents', gradient: 'from-indigo-500 to-indigo-600' },
        { icon: Calendar, label: 'Events', href: '/resident/events', gradient: 'from-rose-500 to-rose-600' },
        { icon: Bell, label: 'Announcements', href: '/resident/announcements', gradient: 'from-teal-500 to-teal-600' },
        { icon: Grid, label: 'All Services', href: '/resident/services', gradient: 'from-gray-500 to-gray-600' },
    ], [pendingClearances, activeComplaints]);

    const combinedActivities = useMemo(() => {
        const activities: Activity[] = [];
        
        recentPayments?.slice(0, 2).forEach(p => {
            if (p) activities.push({
                id: `payment-${p.id}`,
                type: 'payment',
                description: `Payment: ${p.fee_type || 'Barangay fee'}`,
                status: p.status,
                date: p.created_at,
                amount: formatCurrency(p.amount),
                icon: CreditCard,
            });
        });

        pendingClearances?.slice(0, 1).forEach(c => {
            if (c) activities.push({
                id: `clearance-${c.id}`,
                type: 'clearance',
                description: c.clearance_type || 'Clearance request',
                status: c.status,
                date: c.created_at,
                icon: FileCheck,
            });
        });

        activeComplaints?.slice(0, 1).forEach(c => {
            if (c) activities.push({
                id: `complaint-${c.id}`,
                type: 'complaint',
                description: c.subject || 'Complaint filed',
                status: c.status,
                date: c.created_at,
                icon: AlertCircle,
            });
        });

        if (activities.length === 0) {
            activities.push({
                id: 'welcome',
                type: 'welcome',
                description: 'Welcome to Barangay Portal',
                status: 'completed',
                date: new Date().toISOString(),
                icon: Home,
            });
        }

        return activities.slice(0, 3);
    }, [recentPayments, pendingClearances, activeComplaints]);

    const totalPaid = useMemo(() => 
        formatCurrency(paymentSummary?.reduce((sum, p) => sum + (p?.total || 0), 0)),
    [paymentSummary]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const currentTab = TAB_OPTIONS.find(tab => tab.id === activeTab) || TAB_OPTIONS[0];
    const CurrentTabIcon = currentTab.icon;

    // Mobile dropdown selector
    const MobileTabDropdown = () => (
        <div className="lg:hidden relative tab-dropdown">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <CurrentTabIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentTab.label}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "h-4 w-4 text-gray-500 transition-transform duration-200",
                    showDropdown && "rotate-180"
                )} />
            </button>

            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {TAB_OPTIONS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setShowDropdown(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 transition-colors",
                                    isActive 
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                )}
                            >
                                <Icon className={cn(
                                    "h-4 w-4",
                                    isActive && "text-blue-500"
                                )} />
                                <span className="text-sm font-medium">{tab.label}</span>
                                {isActive && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Mobile section tabs for activity/transactions (only for overview tab)
    const MobileSectionTabs = () => (
        <div className="lg:hidden flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
            <button
                onClick={() => setMobileSection('activity')}
                className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                    mobileSection === 'activity'
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400"
                )}
            >
                Recent Activity
            </button>
            <button
                onClick={() => setMobileSection('transactions')}
                className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                    mobileSection === 'transactions'
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400"
                )}
            >
                Recent Transactions
            </button>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Resident Dashboard" />

            {/* Background Gradient */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
            
            {/* Decorative Elements */}
            <div className="fixed top-0 right-0 -z-10 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="fixed bottom-0 left-0 -z-10 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 pb-24 lg:pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white break-words">
                            Welcome back, {resident?.first_name || 'Resident'}!
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                            {isMobile ? 'Your daily overview' : "Here's what's happening with your account today."}
                        </p>
                    </div>
                </div>

                {/* Mobile Tab Dropdown */}
                <MobileTabDropdown />

                {/* Stats Grid - Only show on overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
                        <MetricCard title="Payments" value={safeStats.totalPayments} icon={Wallet} trend="+12%" trendUp={true} />
                        <MetricCard title="Clearances" value={safeStats.totalClearances} icon={FileCheck} trend="+8%" trendUp={true} />
                        <MetricCard title="Complaints" value={safeStats.totalComplaints} icon={AlertCircle} trend="+5%" trendUp={false} />
                        <MetricCard title="Pending" value={safeStats.pendingRequests} icon={Clock} trend="-3%" trendUp={true} />
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Quick Actions */}
                        <section className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                {quickActions.map((action) => (
                                    <ActionCard key={action.label} {...action} />
                                ))}
                            </div>
                        </section>

                        {/* Mobile Section Tabs (only for activity/transactions toggle) */}
                        <MobileSectionTabs />

                        {/* Activity & Transactions - Desktop Layout (side by side) */}
                        <div className="hidden lg:grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                                    <Link href="/resident/activity" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                        View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </div>
                                <ActivityFeed activities={combinedActivities} />
                            </section>

                            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                                    <Link href="/resident/payments" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                        View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </div>
                                <GlassCard className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentPayments?.slice(0, 3).map((payment) => (
                                        <div key={payment.id} className="p-3 sm:p-4">
                                            <TransactionItem transaction={payment} />
                                        </div>
                                    ))}
                                    {(!recentPayments || recentPayments.length === 0) && (
                                        <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No transactions yet</p>
                                    )}
                                </GlassCard>
                            </section>
                        </div>

                        {/* Mobile Layout - Only show selected section */}
                        <div className="lg:hidden">
                            {mobileSection === 'activity' ? (
                                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                                        <Link href="/resident/activity" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                            View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Link>
                                    </div>
                                    <ActivityFeed activities={combinedActivities} />
                                </section>
                            ) : (
                                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                                        <Link href="/resident/payments" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                            View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Link>
                                    </div>
                                    <GlassCard className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {recentPayments?.slice(0, 3).map((payment) => (
                                            <div key={payment.id} className="p-3 sm:p-4">
                                                <TransactionItem transaction={payment} />
                                            </div>
                                        ))}
                                        {(!recentPayments || recentPayments.length === 0) && (
                                            <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No transactions yet</p>
                                        )}
                                    </GlassCard>
                                </section>
                            )}
                        </div>

                        {/* Announcements & Events */}
                        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                            {announcements?.length > 0 && (
                                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Announcements</h2>
                                        <Link href="/resident/announcements" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                            View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Link>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        {announcements.slice(0, 2).map((announcement) => (
                                            <AnnouncementBanner key={announcement.id} announcement={announcement} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {upcomingEvents?.length > 0 && (
                                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                                        <Link href="/resident/events" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                            View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Link>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        {upcomingEvents.slice(0, 2).map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Emergency Contacts */}
                        <section className="space-y-2 sm:space-y-3 md:space-y-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Emergency Contacts</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                {EMERGENCY_CONTACTS.map((contact) => (
                                    <EmergencyContact key={contact.name} contact={contact} />
                                ))}
                            </div>
                        </section>

                        {/* All Services */}
                        <section className="space-y-2 sm:space-y-3 md:space-y-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">All Services</h2>
                            <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
                                {services.map((service) => (
                                    <ServiceTile key={service.label} {...service} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === 'documents' && (
                    <section className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Document Services</h2>
                            <Link href="/resident/clearances/create" className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                New Request
                            </Link>
                        </div>

                        {pendingClearances?.length > 0 && (
                            <GlassCard className="p-4 sm:p-6">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Pending Clearances</h3>
                                <div className="space-y-2 sm:space-y-3">
                                    {pendingClearances.slice(0, 3).map((clearance) => (
                                        <GlassCard key={clearance.id} className="p-3 sm:p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white break-words truncate">
                                                        {clearance.clearance_type || 'Clearance Request'}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                                        {formatDate(clearance.created_at)}
                                                    </p>
                                                </div>
                                                <span className={cn(`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadge(clearance.status)} self-start sm:self-center`)}>
                                                    {clearance.status}
                                                </span>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                                {pendingClearances.length > 3 && (
                                    <Link href="/resident/clearances" className="block text-center mt-3 sm:mt-4 text-xs sm:text-sm text-blue-500 hover:text-blue-600">
                                        View all {pendingClearances.length} requests
                                    </Link>
                                )}
                            </GlassCard>
                        )}

                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Available Services</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            {DOCUMENT_SERVICES.map((service) => (
                                <ServiceTile key={service.label} {...service} />
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'payments' && (
                    <section className="space-y-4 sm:space-y-5 md:space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Payment Services</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-5">
                            <MetricCard title="Total Paid" value={totalPaid} icon={Wallet} />
                            <MetricCard title="Pending" value={recentPayments?.filter(p => p?.status === 'pending')?.length || 0} icon={Clock} />
                            <MetricCard title="Overdue" value={recentPayments?.filter(p => p?.status === 'overdue')?.length || 0} icon={AlertTriangle} />
                        </div>

                        <GlassCard className="p-4 sm:p-6">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Transactions</h3>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentPayments?.slice(0, 5).map((payment) => (
                                    <div key={payment.id} className="py-3 first:pt-0 last:pb-0">
                                        <TransactionItem transaction={payment} />
                                    </div>
                                ))}
                                {(!recentPayments || recentPayments.length === 0) && (
                                    <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No transactions yet</p>
                                )}
                            </div>
                        </GlassCard>

                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Payment Services</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            {PAYMENT_SERVICES.map((service) => (
                                <ServiceTile key={service.label} {...service} />
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'history' && (
                    <section className="space-y-4 sm:space-y-5 md:space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Activity History</h2>

                        <GlassCard className="p-4 sm:p-6">
                            <ActivityFeed activities={combinedActivities} />
                            {combinedActivities.length === 0 && (
                                <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No activities yet</p>
                            )}
                        </GlassCard>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
                            <MetricCard title="Total" value={combinedActivities.length} icon={Clock} />
                            <MetricCard title="Payments" value={safeStats.totalPayments} icon={Wallet} />
                            <MetricCard title="Clearances" value={safeStats.totalClearances} icon={FileCheck} />
                            <MetricCard title="Complaints" value={safeStats.totalComplaints} icon={AlertCircle} />
                        </div>
                    </section>
                )}
            </main>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 p-2 sm:p-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all z-30 group"
                >
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            )}
        </AppLayout>
    );
}