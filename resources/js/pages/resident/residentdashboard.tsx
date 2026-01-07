import AppLayout from '@/layouts/resident-app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
  CreditCard, 
  FileText, 
  AlertCircle, 
  Calendar, 
  Bell, 
  User, 
  Shield,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  MapPin,
  Download,
  Eye,
  Home,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ 
  stats, 
  recentActivities, 
  announcements, 
  upcomingEvents, 
  paymentSummary,
  resident 
}) {
    const [activeTab, setActiveTab] = useState('overview');
    
    // Quick actions with categories
    const quickActions = [
        { 
            icon: FileText, 
            label: 'Request Clearance', 
            href: '/resident/clearances/create', 
            color: 'bg-blue-500/10 text-blue-600',
            description: 'Request barangay clearance',
            badge: stats?.pendingClearances > 0 ? `${stats.pendingClearances} pending` : null
        },
        { 
            icon: CreditCard, 
            label: 'Make Payment', 
            href: '/resident/payments/create', 
            color: 'bg-emerald-500/10 text-emerald-600',
            description: 'Pay fees online',
            badge: paymentSummary?.some(p => p.status === 'overdue') ? 'Overdue' : null
        },
        { 
            icon: MessageSquare, 
            label: 'File Complaint', 
            href: '/resident/complaints/create', 
            color: 'bg-amber-500/10 text-amber-600',
            description: 'Report concerns',
            badge: stats?.totalComplaints > 0 ? `${stats.totalComplaints} filed` : null
        },
        { 
            icon: User, 
            label: 'Update Profile', 
            href: '/resident/profile/edit', 
            color: 'bg-purple-500/10 text-purple-600',
            description: 'Update personal info',
            badge: resident?.profile_completion < 100 ? `${resident.profile_completion}%` : null
        },
        { 
            icon: Download, 
            label: 'Download Forms', 
            href: '/resident/forms', 
            color: 'bg-indigo-500/10 text-indigo-600',
            description: 'Get official forms',
            badge: '5 available'
        },
        { 
            icon: Eye, 
            label: 'View Records', 
            href: '/resident/records', 
            color: 'bg-rose-500/10 text-rose-600',
            description: 'Access your documents',
            badge: stats?.totalRecords || '0'
        },
    ];

    // Status colors for stats
    const statColors = {
        payments: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: CreditCard },
        clearances: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: FileText },
        complaints: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: AlertCircle },
        pending: { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: Clock }
    };

    // FIX: Ensure recentActivities is always an array
    const getRecentActivities = () => {
        if (Array.isArray(recentActivities)) {
            return recentActivities.slice(0, 3); // Only take first 3
        }
        
        // Return default activities if none provided or invalid
        return [
            { id: 1, type: 'payment', description: 'Paid barangay fees', status: 'completed', date: new Date().toISOString(), amount: '₱500.00' },
            { id: 2, type: 'clearance', description: 'Clearance request submitted', status: 'pending', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, type: 'complaint', description: 'Noise complaint filed', status: 'in-progress', date: new Date(Date.now() - 172800000).toISOString() },
        ];
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'in-progress': 
            case 'processing': 
            case 'in_review': return <TrendingUp className="h-4 w-4 text-blue-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    // FIX: Safely handle arrays that might be null or undefined
    const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
    const safeUpcomingEvents = Array.isArray(upcomingEvents) ? upcomingEvents : [];
    const safePaymentSummary = Array.isArray(paymentSummary) ? paymentSummary : [];
    const recentActivitiesList = getRecentActivities();

    return (
        <AppLayout>
            <Head title="Resident Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
                {/* Welcome Banner with gradient */}
                <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 p-6 text-white shadow-lg">
                    <div className="flex flex-col justify-between md:flex-row md:items-center">
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium opacity-90">Welcome back</span>
                            </div>
                            <h1 className="text-2xl font-bold md:text-3xl">
                                Hello, {resident?.full_name?.split(' ')[0] || 'Resident'}!
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                    <Home className="h-3 w-3" />
                                    <span>Household #{resident?.household_number || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                    <MapPin className="h-3 w-3" />
                                    <span>Zone {resident?.zone || 'N/A'}</span>
                                </div>
                                {resident?.address && (
                                    <div className="hidden md:flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                        <span>{resident.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-start gap-3 md:items-end">
                            <div className="hidden rounded-xl bg-white/10 p-3 backdrop-blur-sm md:block">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <div>
                                        <p className="text-xs opacity-90">Emergency Hotline</p>
                                        <p className="font-bold">(082) 123-4567</p>
                                    </div>
                                </div>
                            </div>
                            <Link 
                                href="/resident/profile"
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-white/90 hover:shadow-md"
                            >
                                View Profile
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Overview with improved design */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Overview</h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab('analytics')}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Analytics
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries({
                            payments: { label: 'Total Payments', value: stats?.totalPayments || 0, change: '+12%' },
                            clearances: { label: 'Clearances', value: stats?.totalClearances || 0, change: '+5%' },
                            complaints: { label: 'Complaints', value: stats?.totalComplaints || 0, change: '-2%' },
                            pending: { label: 'Pending Requests', value: stats?.pendingRequests || 0, change: '0%' }
                        }).map(([key, stat]) => {
                            const { bg, text, icon: Icon } = statColors[key];
                            return (
                                <div key={key} className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                                            <div className="mt-2 flex items-center gap-1">
                                                <TrendingUp className={`h-3 w-3 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`} />
                                                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {stat.change} from last month
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`rounded-lg p-3 ${bg}`}>
                                            <Icon className={`h-5 w-5 ${text}`} />
                                        </div>
                                    </div>
                                    <div className="absolute -right-8 -bottom-8 h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions Grid */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                                    <p className="mt-1 text-sm text-gray-600">Complete common tasks quickly</p>
                                </div>
                                <Link 
                                    href="/resident/services"
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View all services
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.label}
                                            href={action.href}
                                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className={`rounded-lg p-3 ${action.color} transition-transform group-hover:scale-110`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                {action.badge && (
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                        {action.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mt-4 font-semibold text-gray-900">{action.label}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                                            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                                                <span>Access now</span>
                                                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activity & Payment Summary */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Recent Activity */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Recent Activity</h2>
                                <div className="space-y-4">
                                    {recentActivitiesList.map((activity) => (
                                        <div 
                                            key={activity.id} 
                                            className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="mt-1">
                                                {getStatusIcon(activity.status)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900">{activity.description}</p>
                                                    {activity.amount && (
                                                        <span className="text-sm font-semibold text-emerald-600">
                                                            {activity.amount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="capitalize">{activity.type}</span>
                                                    <span>•</span>
                                                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                                                    <span className="ml-auto capitalize px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {activity.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link 
                                    href="/resident/activity"
                                    className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    View all activity
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Payment Summary */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Payment Summary</h2>
                                        <p className="mt-1 text-sm text-gray-600">Current year transactions</p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                                        {new Date().getFullYear()}
                                    </div>
                                </div>
                                
                                {safePaymentSummary.length > 0 ? (
                                    <div className="space-y-4">
                                        {safePaymentSummary.slice(0, 4).map((payment, index) => (
                                            <div key={index} className="rounded-xl bg-gradient-to-r from-gray-50 to-white p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`rounded-lg p-2 ${
                                                            payment.type === 'annual' ? 'bg-blue-500/10 text-blue-600' :
                                                            payment.type === 'monthly' ? 'bg-emerald-500/10 text-emerald-600' :
                                                            'bg-amber-500/10 text-amber-600'
                                                        }`}>
                                                            <CreditCard className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium capitalize">{payment.type} Fee</p>
                                                            <p className="text-sm text-gray-500">
                                                                {payment.count} {payment.count === 1 ? 'payment' : 'payments'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">₱{parseFloat(payment.total || 0).toFixed(2)}</p>
                                                        <p className={`text-xs font-medium ${
                                                            payment.status === 'paid' ? 'text-emerald-600' : 
                                                            payment.status === 'pending' ? 'text-amber-600' : 
                                                            'text-rose-600'
                                                        }`}>
                                                            {payment.status || 'completed'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                                        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-4 text-lg font-medium text-gray-900">No payments yet</h3>
                                        <p className="mt-2 text-gray-600">Your payment history will appear here</p>
                                        <Link 
                                            href="/resident/payments/create"
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Make First Payment
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                                
                                {safePaymentSummary.length > 4 && (
                                    <Link 
                                        href="/resident/payments"
                                        className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        View all payment history
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-6">
                        {/* Announcements */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
                                        <p className="mt-1 text-sm text-gray-600">Latest from barangay officials</p>
                                    </div>
                                    <div className="relative">
                                        <Bell className="h-5 w-5 text-blue-500" />
                                        {safeAnnouncements.some(a => a.priority === 'high') && (
                                            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {safeAnnouncements.length > 0 ? (
                                        safeAnnouncements.slice(0, 3).map((announcement) => (
                                            <div 
                                                key={announcement.id} 
                                                className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
                                                    announcement.priority === 'high' 
                                                    ? 'border-rose-200 bg-rose-50' 
                                                    : 'border-blue-100 bg-blue-50'
                                                }`}
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        announcement.priority === 'high'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {announcement.priority === 'high' ? '❗ Important' : '📢 Announcement'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                    {announcement.content}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                                    <span>Posted by {announcement.author || 'Barangay Official'}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bell className="mx-auto h-12 w-12 text-gray-300" />
                                            <h3 className="mt-4 text-lg font-medium text-gray-900">No announcements</h3>
                                            <p className="mt-2 text-gray-600">Check back later for updates</p>
                                        </div>
                                    )}
                                </div>
                                
                                {safeAnnouncements.length > 3 && (
                                    <Link 
                                        href="/resident/announcements"
                                        className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        View all announcements
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
                                        <p className="mt-1 text-sm text-gray-600">Community activities & meetings</p>
                                    </div>
                                    <Calendar className="h-5 w-5 text-emerald-500" />
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {safeUpcomingEvents.length > 0 ? (
                                        safeUpcomingEvents.slice(0, 2).map((event) => {
                                            const eventDate = new Date(event.event_date);
                                            const today = new Date();
                                            const tomorrow = new Date(today);
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            
                                            const isToday = eventDate.toDateString() === today.toDateString();
                                            const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();
                                            
                                            return (
                                                <div key={event.id} className="rounded-xl border border-gray-200 p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            isToday ? 'bg-rose-100 text-rose-800' :
                                                            isTomorrow ? 'bg-amber-100 text-amber-800' :
                                                            'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {isToday ? 'Today' : 
                                                             isTomorrow ? 'Tomorrow' :
                                                             eventDate.toLocaleDateString('en-US', { 
                                                                 weekday: 'short',
                                                                 month: 'short', 
                                                                 day: 'numeric' 
                                                             })}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {eventDate.toLocaleTimeString('en-US', { 
                                                                hour: 'numeric', 
                                                                minute: '2-digit' 
                                                            })}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                    {event.description && (
                                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                                            <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming events</h3>
                                            <p className="mt-2 text-gray-600">Check back for scheduled activities</p>
                                        </div>
                                    )}
                                </div>
                                
                                {safeUpcomingEvents.length > 2 && (
                                    <Link 
                                        href="/resident/events"
                                        className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        View all events
                                        <ChevronRight className="h-4 w-4" />
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