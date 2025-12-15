import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/admin-app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, Home, CreditCard, FileText, Shield, Activity, AlertCircle, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Barangay Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    // Sample barangay statistics
    const stats = [
        {
            title: 'Total Residents',
            value: '2,847',
            change: '+2.3%',
            icon: Users,
            color: 'bg-blue-500',
            href: '/residents'
        },
        {
            title: 'Total Households',
            value: '678',
            change: '+1.1%',
            icon: Home,
            color: 'bg-green-500',
            href: '/households'
        },
        {
            title: 'Pending Payments',
            value: '142',
            change: '-5.2%',
            icon: CreditCard,
            color: 'bg-amber-500',
            href: '/payments'
        },
        {
            title: 'Active Clearances',
            value: '89',
            change: '+12.4%',
            icon: FileText,
            color: 'bg-purple-500',
            href: '/clearances'
        }
    ];

    const recentActivities = [
        { id: 1, type: 'payment', description: 'Juan Dela Cruz paid barangay tax', time: '10 min ago' },
        { id: 2, type: 'clearance', description: 'Maria Santos requested barangay clearance', time: '25 min ago' },
        { id: 3, type: 'registration', description: 'New household registered in Zone 5', time: '1 hour ago' },
        { id: 4, type: 'complaint', description: 'Noise complaint filed in Zone 3', time: '2 hours ago' },
        { id: 5, type: 'meeting', description: 'Upcoming barangay assembly tomorrow', time: '5 hours ago' },
    ];

    const quickActions = [
        { icon: Users, label: 'Register Resident', href: '/residents/create' },
        { icon: FileText, label: 'Issue Clearance', href: '/clearances/create' },
        { icon: CreditCard, label: 'Process Payment', href: '/payments/create' },
        { icon: Home, label: 'Add Household', href: '/households/create' },
        { icon: Shield, label: 'Emergency Alert', href: '/alerts' },
        { icon: Calendar, label: 'Schedule Event', href: '/events/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangay Dashboard - Kibawe Management System" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Barangay Kibawe Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back! Here's what's happening in your barangay today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <a
                                key={stat.title}
                                href={stat.href}
                                className="group relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-sidebar-border dark:bg-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        <p className={`mt-1 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change} from last month
                                        </p>
                                    </div>
                                    <div className={`${stat.color} rounded-lg p-3`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Quick Actions & Recent Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Quick Actions
                                </h2>
                                <Activity className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <a
                                            key={action.label}
                                            href={action.href}
                                            className="group flex flex-col items-center justify-center rounded-lg border border-sidebar-border/70 p-4 text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-sidebar-border dark:hover:bg-blue-900/20"
                                        >
                                            <div className="mb-2 rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 dark:bg-blue-900/30">
                                                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {action.label}
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Recent Activities
                                </h2>
                                <AlertCircle className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 rounded-lg border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                                    >
                                        <div className="mt-1 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                                            {activity.type === 'payment' && <CreditCard className="h-4 w-4 text-green-600" />}
                                            {activity.type === 'clearance' && <FileText className="h-4 w-4 text-blue-600" />}
                                            {activity.type === 'registration' && <Users className="h-4 w-4 text-purple-600" />}
                                            {activity.type === 'complaint' && <AlertCircle className="h-4 w-4 text-red-600" />}
                                            {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-amber-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Upcoming Events & Important Notices */}
                    <div className="space-y-6">
                        {/* Upcoming Events */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Upcoming Events
                                </h2>
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                            Tomorrow
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">9:00 AM</span>
                                    </div>
                                    <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                        Barangay General Assembly
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Barangay Hall, All residents are encouraged to attend
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            Dec 20
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">2:00 PM</span>
                                    </div>
                                    <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                        Health & Sanitation Seminar
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Health Center, Zone 3 & 4 residents
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    System Status
                                </h2>
                                <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        Online
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Backup System</span>
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                        Last: 2 hours ago
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Storage Usage</span>
                                    <span className="font-medium text-gray-900 dark:text-white">65%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className="h-full rounded-full bg-blue-600"
                                        style={{ width: '65%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}