// components/admin/dashboard/RecentActivities.tsx
import { Link } from '@inertiajs/react';
import { 
    ArrowRight, 
    Filter, 
    MoreHorizontal,
    Activity,
    Users,
    Home,
    CreditCard,
    FileText,
    UserPlus,
    UserCheck,
    UserMinus,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    LogIn,
    LogOut,
    Settings,
    Shield,
    Award,
    Gift,
    Heart,
    HeartHandshake,
    Baby,
    Building,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Receipt,
    FileCheck,
    FileX,
    PlusCircle,
    Edit,
    Trash2,
    PieChart,
    TrendingUp,
    BarChart,
    Bell,
    Star,
    Zap
} from 'lucide-react';

interface ActivityItem {
    id: number;
    description: string;
    type: string;
    time: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    priority: string;
    isRead: boolean;
    causer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    subject_type?: string;
    subject_id?: number;
    properties?: any;
    created_at?: string;
}

interface RecentActivitiesProps {
    activities: ActivityItem[];
    isMobile?: boolean;
}

// Icon mapping object
const IconMap: Record<string, React.ElementType> = {
    'Activity': Activity,
    'Users': Users,
    'User': Users,
    'Home': Home,
    'CreditCard': CreditCard,
    'FileText': FileText,
    'UserPlus': UserPlus,
    'UserCheck': UserCheck,
    'UserMinus': UserMinus,
    'DollarSign': DollarSign,
    'Clock': Clock,
    'CheckCircle': CheckCircle,
    'XCircle': XCircle,
    'AlertCircle': AlertCircle,
    'LogIn': LogIn,
    'LogOut': LogOut,
    'Settings': Settings,
    'Shield': Shield,
    'Award': Award,
    'Gift': Gift,
    'Heart': Heart,
    'HeartHandshake': HeartHandshake,
    'Baby': Baby,
    'Building': Building,
    'MapPin': MapPin,
    'Phone': Phone,
    'Mail': Mail,
    'Calendar': Calendar,
    'Receipt': Receipt,
    'FileCheck': FileCheck,
    'FileX': FileX,
    'PlusCircle': PlusCircle,
    'Edit': Edit,
    'Trash2': Trash2,
    'PieChart': PieChart,
    'TrendingUp': TrendingUp,
    'BarChart': BarChart,
    'Bell': Bell,
    'Star': Star,
    'Zap': Zap,
};

const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
        case 'high': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
        case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'low': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
};

const getTypeColor = (type: string) => {
    switch(type?.toLowerCase()) {
        case 'resident':
        case 'registration':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'payment':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
        case 'clearance':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'household':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'user':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
};

export function RecentActivities({ activities, isMobile = false }: RecentActivitiesProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className={`rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-gray-900 ${
                isMobile ? 'p-4' : 'p-6'
            }`}>
                <div className={`flex items-center justify-between ${
                    isMobile ? 'mb-3' : 'mb-6'
                }`}>
                    <div>
                        <h2 className={`font-bold text-gray-900 dark:text-white ${
                            isMobile ? 'text-lg' : 'text-xl'
                        }`}>
                            Recent Activities
                        </h2>
                        {!isMobile && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Latest system events and user actions
                            </p>
                        )}
                    </div>
                    <Link 
                        href="/admin/reports/audit-logs"
                        className={`flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${
                            isMobile ? 'text-xs' : 'text-sm'
                        }`}
                    >
                        {isMobile ? 'All' : 'View all logs'}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No recent activities</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-gray-900 ${
            isMobile ? 'p-4' : 'p-6'
        }`}>
            <div className={`flex items-center justify-between ${
                isMobile ? 'mb-3' : 'mb-6'
            }`}>
                <div>
                    <h2 className={`font-bold text-gray-900 dark:text-white ${
                        isMobile ? 'text-lg' : 'text-xl'
                    }`}>
                        Recent Activities
                    </h2>
                    {!isMobile && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Latest system events and user actions
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isMobile && (
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Filter className="h-4 w-4" />
                        </button>
                    )}
                    <Link 
                        href="/admin/reports/audit-logs"
                        className={`flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${
                            isMobile ? 'text-xs' : 'text-sm'
                        }`}
                    >
                        {isMobile ? 'All' : 'View all logs'}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
            
            <div className="space-y-3">
                {activities.map((activity) => {
                    const IconComponent = IconMap[activity.icon] || Activity;
                    
                    return (
                        <div
                            key={activity.id}
                            className="group flex items-start gap-3 rounded-lg border border-sidebar-border/70 p-3 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-sidebar-border dark:hover:bg-blue-900/10"
                        >
                            <div className={`mt-1 rounded-lg p-2 ${activity.bgColor || 'bg-gray-100 dark:bg-gray-700'}`}>
                                <IconComponent className={`h-4 w-4 ${activity.iconColor || 'text-gray-600 dark:text-gray-300'}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {activity.description}
                                    </p>
                                    {activity.priority && (
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityColor(activity.priority)}`}>
                                            {activity.priority}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                                    <span className={`rounded-full px-2 py-0.5 font-medium ${getTypeColor(activity.type)}`}>
                                        {activity.type}
                                    </span>
                                    
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {activity.time}
                                    </span>
                                    
                                    {!activity.isRead && (
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                    
                                    {activity.causer && (
                                        <span className="text-gray-500 dark:text-gray-400">
                                            by {activity.causer.name}
                                        </span>
                                    )}
                                </div>
                                
                                {activity.properties?.changes && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {Object.keys(activity.properties.changes).map(key => (
                                            <span key={key} className="mr-2">
                                                {key}: {
                                                    typeof activity.properties.changes[key] === 'object'
                                                        ? JSON.stringify(activity.properties.changes[key])
                                                        : activity.properties.changes[key]
                                                }
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <button className="opacity-0 group-hover:opacity-100 rounded-lg p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {activities.length > 5 && !isMobile && (
                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                    <Link 
                        href="/admin/reports/audit-logs"
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1"
                    >
                        View all {activities.length} activities
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}