// /Pages/resident/Dashboard.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUp, Sparkles, ChevronRight, Plus, LayoutDashboard, FileText, CreditCard, Clock, AlertCircle, AlertTriangle, Bell, Calendar, FileCheck, Grid, Home, MessageSquare, User, Users, Wallet, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
import { WelcomeAnimation } from '@/components/portal/dashboard/WelcomeAnimation';
import { BannerHeader, BannerSlide, BannerAnnouncement } from '@/components/portal/dashboard/BannerHeader';

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
    stats?: {
        total_payments: number;
        total_payments_amount: number;
        total_clearances: number;
        total_complaints: number;
        pending_clearances: number;
        pending_requests: number;
        household_members: number;
        percentage_change: number;
        trend: 'up' | 'down' | 'neutral';
    };
    announcements?: Announcement[];
    upcomingEvents?: Event[];
    paymentSummary?: PaymentSummary[];
    resident?: Resident;
    recentPayments?: Payment[];
    pendingClearances?: Clearance[];
    activeComplaints?: Complaint[];
    bannerSlides?: BannerSlide[];
    dateFilter?: string;
}

// Tab options for dropdown
const TAB_OPTIONS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: Clock },
];

// Date filter options
const DATE_FILTER_OPTIONS = [
    { id: 'today', label: 'Today', icon: Clock },
    { id: 'week', label: 'This Week', icon: Calendar },
    { id: 'month', label: 'This Month', icon: Calendar },
    { id: 'year', label: 'This Year', icon: Calendar },
    { id: 'all', label: 'All Time', icon: TrendingUp },
];

// Session storage key for welcome animation
const WELCOME_SHOWN_KEY = 'barangay_welcome_shown';

// Helper function to validate image URLs (prevent CORS issues)
const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    const blockedDomains = [
        'facebook.com',
        'fb.com',
        'instagram.com',
        'twitter.com',
        'x.com',
        'tiktok.com',
        'youtube.com',
        'vimeo.com'
    ];
    
    const urlLower = url.toLowerCase();
    return !blockedDomains.some(domain => urlLower.includes(domain));
};

// Helper function to sanitize banner slides
const sanitizeBannerSlides = (slides: BannerSlide[]): BannerSlide[] => {
    return slides.filter(slide => {
        const isValid = isValidImageUrl(slide.image) && 
                       (!slide.mobileImage || isValidImageUrl(slide.mobileImage));
        
        if (!isValid) {
            console.warn('Invalid banner slide detected and filtered:', slide.id);
        }
        
        return isValid;
    }).map(slide => ({
        ...slide,
        image: slide.image || '/images/fallback-banner.jpg',
        mobileImage: slide.mobileImage || slide.image || '/images/fallback-banner-mobile.jpg'
    }));
};

export default function Dashboard({ 
    stats = {
        total_payments: 0,
        total_payments_amount: 0,
        total_clearances: 0,
        total_complaints: 0,
        pending_clearances: 0,
        pending_requests: 0,
        household_members: 0,
        percentage_change: 0,
        trend: 'neutral'
    }, 
    announcements = [], 
    upcomingEvents = [], 
    paymentSummary = [],
    resident = {} as Resident,
    recentPayments = [],
    pendingClearances = [],
    activeComplaints = [],
    bannerSlides = [],
    dateFilter: initialDateFilter = 'week'
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [dateFilter, setDateFilter] = useState(initialDateFilter);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);
    const [mobileSection, setMobileSection] = useState<'activity' | 'transactions'>('activity');
    const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
    const isMobile = useMobile();

    // Sanitize banner slides to prevent CORS issues
    const sanitizedBannerSlides = useMemo(() => 
        sanitizeBannerSlides(bannerSlides), 
        [bannerSlides]
    );

    // Helper function to convert string priority to number
    const convertPriorityToNumber = (priority?: string | number): number => {
        if (typeof priority === 'number') return priority;
        switch (priority) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    };

    // Helper function to get priority label
    const getPriorityLabel = (priority?: string | number): string => {
        const numPriority = convertPriorityToNumber(priority);
        const labels: Record<number, string> = {
            4: 'Urgent',
            3: 'High',
            2: 'Medium',
            1: 'Low',
            0: 'Normal'
        };
        return labels[numPriority] || 'Normal';
    };

    // Helper function to get type for banner
    const getBannerType = (type?: string): 'general' | 'important' | 'event' | 'maintenance' | 'other' => {
        switch (type?.toLowerCase()) {
            case 'important':
                return 'important';
            case 'event':
                return 'event';
            case 'maintenance':
                return 'maintenance';
            case 'general':
                return 'general';
            default:
                return 'general';
        }
    };

    // Transform announcements for banner display
    const bannerAnnouncements: BannerAnnouncement[] = useMemo(() => {
        return announcements.slice(0, 3).map(a => ({
            id: typeof a.id === 'string' ? parseInt(a.id) : (a.id as number),
            title: a.title || 'Announcement',
            content: a.content || '',
            type: getBannerType(a.type),
            priority: convertPriorityToNumber(a.priority),
            created_at: a.created_at || new Date().toISOString(),
            time_ago: a.created_at ? formatDate(a.created_at) : 'Recently',
            priority_label: getPriorityLabel(a.priority),
            type_label: a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : 'General',
        }));
    }, [announcements]);

    // Handle date filter change - SERVER SIDE FETCH with CORRECT ROUTE
    const handleDateFilterChange = useCallback((newFilter: string) => {
        if (newFilter === dateFilter || isLoading) return;
        
        setIsLoading(true);
        setDateFilter(newFilter);
        
        router.get('/portal/dashboard', 
            { date_filter: newFilter },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    setIsLoading(false);
                    setShowDateFilterDropdown(false);
                },
                onError: (errors) => {
                    console.error('Error fetching filtered data:', errors);
                    setIsLoading(false);
                }
            }
        );
    }, [dateFilter, isLoading]);

    // Check if welcome animation should be shown
    useEffect(() => {
        const hasShownWelcome = sessionStorage.getItem(WELCOME_SHOWN_KEY);
        
        if (!hasShownWelcome) {
            const timer = setTimeout(() => {
                setShowWelcomeAnimation(true);
                sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, []);

    // Auto-dismiss welcome animation
    useEffect(() => {
        if (showWelcomeAnimation) {
            const timer = setTimeout(() => {
                setShowWelcomeAnimation(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showWelcomeAnimation]);

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
            if (showDateFilterDropdown && !target.closest('.date-filter-dropdown')) {
                setShowDateFilterDropdown(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown, showDateFilterDropdown]);

    const quickActions = useMemo(() => [
        { 
            icon: FileText, 
            label: 'Request Clearance', 
            description: 'Get barangay clearance',
            href: '/portal/my-clearances/request',
            badge: pendingClearances?.length,
            gradient: 'from-blue-500 to-blue-600'
        },
        { 
            icon: MessageSquare, 
            label: 'File Complaint', 
            description: 'Report concerns',
            href: '/portal/my-incidents/create',
            badge: activeComplaints?.length,
            gradient: 'from-amber-500 to-orange-600'
        },
        { 
            icon: CreditCard, 
            label: 'Make Payment', 
            description: 'Pay fees online',
            href: '/portal/payments/pay',
            gradient: 'from-emerald-500 to-teal-600'
        },
        { 
            icon: User, 
            label: 'Update Profile', 
            description: 'Edit your info',
            href: '/portal/resident/profile/edit',
            gradient: 'from-purple-500 to-pink-600'
        },
    ], [pendingClearances, activeComplaints]);

    const services = useMemo(() => [
        { icon: FileText, label: 'Clearance', href: '/portal/my-clearances', gradient: 'from-blue-500 to-blue-600', count: pendingClearances?.length },
        { icon: CreditCard, label: 'Payments', href: '/portal/payments', gradient: 'from-emerald-500 to-emerald-600' },
        { icon: Users, label: 'Family', href: '/portal/resident/family', gradient: 'from-purple-500 to-purple-600' },
        { icon: MessageSquare, label: 'Complaints', href: '/portal/my-incidents', gradient: 'from-amber-500 to-amber-600', count: activeComplaints?.length },
        { icon: FileCheck, label: 'Records', href: '/portal/my-records', gradient: 'from-indigo-500 to-indigo-600' },
        { icon: Calendar, label: 'Events', href: '/portal/resident/events', gradient: 'from-rose-500 to-rose-600' },
        { icon: Bell, label: 'Announcements', href: '/portal/announcements', gradient: 'from-teal-500 to-teal-600' },
        { icon: Grid, label: 'All Services', href: '/portal/resident/services', gradient: 'from-gray-500 to-gray-600' },
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

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const currentTab = TAB_OPTIONS.find(tab => tab.id === activeTab) || TAB_OPTIONS[0];
    const CurrentTabIcon = currentTab.icon;
    const currentDateFilter = DATE_FILTER_OPTIONS.find(f => f.id === dateFilter) || DATE_FILTER_OPTIONS[1];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const handleWelcomeClose = useCallback(() => {
        setShowWelcomeAnimation(false);
    }, []);

    // Loading overlay component
    const LoadingOverlay = () => {
        if (!isLoading) return null;
        
        return (
            <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Loading data...</span>
                </div>
            </div>
        );
    };

    // Desktop Tabs Navigation
    const DesktopTabs = () => (
        <div className="hidden lg:flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {TAB_OPTIONS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );

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

    // Date Filter Component with server-side loading
    const DateFilterTabs = () => (
        <div className="flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                {DATE_FILTER_OPTIONS.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = dateFilter === filter.id;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => handleDateFilterChange(filter.id)}
                            disabled={isLoading}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                isActive
                                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{filter.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile Date Filter Dropdown */}
            <div className="sm:hidden relative date-filter-dropdown">
                <button
                    onClick={() => setShowDateFilterDropdown(!showDateFilterDropdown)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium"
                >
                    <currentDateFilter.icon className="h-3.5 w-3.5" />
                    <span>{currentDateFilter.label}</span>
                    <ChevronDown className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        showDateFilterDropdown && "rotate-180"
                    )} />
                </button>

                {showDateFilterDropdown && (
                    <div className="absolute top-full right-0 mt-1 min-w-[120px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
                        {DATE_FILTER_OPTIONS.map((filter) => {
                            const Icon = filter.icon;
                            const isActive = dateFilter === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => handleDateFilterChange(filter.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                                        isActive 
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    )}
                                >
                                    <Icon className="h-3 w-3" />
                                    <span>{filter.label}</span>
                                    {isActive && (
                                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Trend Indicator */}
            {activeTab === 'overview' && dateFilter !== 'all' && stats.percentage_change !== 0 && (
                <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                    stats.trend === 'up' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                    stats.trend === 'down' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                    stats.trend === 'neutral' && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}>
                    {stats.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {stats.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {stats.trend === 'neutral' && <Minus className="h-3 w-3" />}
                    <span>
                        {stats.percentage_change > 0 ? '+' : ''}
                        {stats.percentage_change.toFixed(1)}% from previous period
                    </span>
                </div>
            )}
        </div>
    );

    // Mobile section tabs
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

            {/* Loading Overlay */}
            <LoadingOverlay />

            {/* Background Gradient */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
            
            {/* Decorative Elements */}
            <div className="fixed top-0 right-0 -z-10 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="fixed bottom-0 left-0 -z-10 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

            {/* Welcome Animation */}
            <WelcomeAnimation 
                isVisible={showWelcomeAnimation}
                onClose={handleWelcomeClose}
                residentName={resident?.first_name || 'Resident'}
                greeting={getGreeting()}
            />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 pb-24 lg:pb-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white break-words">
                            {getGreeting()}, {resident?.first_name || 'Resident'}! 👋
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                            {isMobile ? 'Your daily overview' : "Here's what's happening with your account today."}
                        </p>
                    </div>
                </div>

                {/* Banner Header - Using sanitized slides to prevent CORS */}
                {sanitizedBannerSlides.length > 0 && (
                    <BannerHeader 
                        slides={sanitizedBannerSlides}
                        announcements={bannerAnnouncements}
                        autoPlay={true}
                        autoPlayInterval={6000}
                        showIndicators={true}
                        showArrows={true}
                    />
                )}

                {/* Tabs Navigation */}
                <div className="mb-2 sm:mb-4">
                    <DesktopTabs />
                    <MobileTabDropdown />
                </div>

                {/* Date Filter Tabs - Below main tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <DateFilterTabs />
                </div>

                {/* Stats Grid - Only show on overview */}
                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
                            <MetricCard 
                                title="Payments" 
                                value={stats.total_payments} 
                                icon={Wallet}
                            />
                            <MetricCard title="Clearances" value={stats.total_clearances} icon={FileCheck} />
                            <MetricCard title="Complaints" value={stats.total_complaints} icon={AlertCircle} />
                            <MetricCard title="Pending" value={stats.pending_requests} icon={Clock} />
                        </div>

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

                        <MobileSectionTabs />

                        {/* Activity & Transactions - Desktop */}
                        <div className="hidden lg:grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                                    <Link href="/portal/resident/activity" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                        View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </div>
                                <ActivityFeed activities={combinedActivities} />
                            </section>

                            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                                    <Link href="/portal/payments" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
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
                                        <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                            No transactions for {currentDateFilter.label.toLowerCase()}
                                        </p>
                                    )}
                                </GlassCard>
                            </section>
                        </div>

                        {/* Mobile Layout */}
                        <div className="lg:hidden">
                            {mobileSection === 'activity' ? (
                                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                                        <Link href="/portal/resident/activity" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                            View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Link>
                                    </div>
                                    <ActivityFeed activities={combinedActivities} />
                                </section>
                            ) : (
                                <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                                        <Link href="/portal/payments" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
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
                                            <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                                No transactions for {currentDateFilter.label.toLowerCase()}
                                            </p>
                                        )}
                                    </GlassCard>
                                </section>
                            )}
                        </div>

                        {/* Announcements & Events - Show only if NO banner */}
                        {sanitizedBannerSlides.length === 0 && announcements.length > 0 && (
                            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Announcements</h2>
                                    <Link href="/portal/announcements" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                        View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {announcements.slice(0, 3).map((announcement) => (
                                        <AnnouncementBanner key={announcement.id} announcement={announcement} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Upcoming Events */}
                        {upcomingEvents?.length > 0 && (
                            <section className="space-y-2 sm:space-y-3 md:space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                                    <Link href="/portal/resident/events" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                        View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                                    {upcomingEvents.slice(0, 4).map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}

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

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <section className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Document Services</h2>
                            <Link href="/portal/my-clearances/request" className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                New Request
                            </Link>
                        </div>

                        {pendingClearances.length > 0 && (
                            <GlassCard className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                                        Clearance Requests ({pendingClearances.length})
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {currentDateFilter.label}
                                    </span>
                                </div>
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
                                    <Link href="/portal/my-clearances" className="block text-center mt-3 sm:mt-4 text-xs sm:text-sm text-blue-500 hover:text-blue-600">
                                        View all {pendingClearances.length} requests
                                    </Link>
                                )}
                            </GlassCard>
                        )}

                        {pendingClearances.length === 0 && (
                            <GlassCard className="p-8 text-center">
                                <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No clearance requests for {currentDateFilter.label.toLowerCase()}
                                </p>
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

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <section className="space-y-4 sm:space-y-5 md:space-y-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Payment Services</h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-5">
                            <MetricCard 
                                title="Total Amount" 
                                value={formatCurrency(stats.total_payments_amount)} 
                                icon={Wallet}
                            />
                            <MetricCard 
                                title="Pending" 
                                value={recentPayments?.filter(p => p?.status === 'pending').length || 0} 
                                icon={Clock} 
                            />
                            <MetricCard 
                                title="Overdue" 
                                value={recentPayments?.filter(p => p?.status === 'overdue').length || 0} 
                                icon={AlertTriangle} 
                            />
                        </div>

                        <GlassCard className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                                    Transactions ({recentPayments?.length || 0})
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {currentDateFilter.label}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentPayments?.slice(0, 5).map((payment) => (
                                    <div key={payment.id} className="py-3 first:pt-0 last:pb-0">
                                        <TransactionItem transaction={payment} />
                                    </div>
                                ))}
                                {(!recentPayments || recentPayments.length === 0) && (
                                    <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                        No transactions for {currentDateFilter.label.toLowerCase()}
                                    </p>
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

                {/* History Tab */}
                {activeTab === 'history' && (
                    <section className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Activity History</h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {currentDateFilter.label}
                            </span>
                        </div>

                        <GlassCard className="p-4 sm:p-6">
                            <ActivityFeed activities={combinedActivities} />
                            {combinedActivities.length === 1 && combinedActivities[0].id === 'welcome' && (
                                <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                    No activities for {currentDateFilter.label.toLowerCase()}
                                </p>
                            )}
                        </GlassCard>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
                            <MetricCard title="Total" value={combinedActivities.filter(a => a.id !== 'welcome').length} icon={Clock} />
                            <MetricCard title="Payments" value={stats.total_payments} icon={Wallet} />
                            <MetricCard title="Clearances" value={stats.total_clearances} icon={FileCheck} />
                            <MetricCard title="Complaints" value={stats.total_complaints} icon={AlertCircle} />
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