import AppLayout from '@/layouts/resident-app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Clock,
  Bell,
  User,
  Home,
  ChevronRight,
  TrendingUp,
  Download,
  Eye,
  MapPin,
  Shield,
  Users,
  Calendar,
  MessageSquare,
  ArrowUp,
  Wallet,
  Receipt,
  FileCheck,
  AlertCircle,
  Flame,
  Heart,
  Grid,
  Plus,
  Sparkles,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Menu
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// UTILITIES & HELPERS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

const getStatusBadge = (status: string) => {
  const variants = {
    completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    paid: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    approved: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    pending: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    processing: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    'in-progress': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    rejected: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    overdue: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  };
  
  return variants[status?.toLowerCase()] || 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400';
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

const GlassCard = ({ children, className = '', interactive = false, gradient = false, onClick }: GlassCardProps) => (
  <div 
    onClick={onClick}
    className={`
      relative overflow-hidden
      bg-white/80 dark:bg-gray-800/80 
      backdrop-blur-xl
      rounded-2xl 
      border border-white/20 dark:border-gray-700/30
      shadow-lg shadow-black/5
      ${interactive ? 'active:scale-[0.98] hover:shadow-xl hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-800 transition-all duration-300' : ''}
      ${gradient ? 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, trendUp = true, className = '' }: MetricCardProps) => {
  const isMobile = useMobile();
  
  return (
    <GlassCard interactive gradient className={`p-4 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend && !isMobile && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`h-4 w-4 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`} />
              <span className={`text-xs sm:text-sm font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>
      {trend && isMobile && (
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className={`h-3 w-3 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`} />
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend}
          </span>
        </div>
      )}
    </GlassCard>
  );
};

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  badge?: number;
  gradient?: string;
}

const ActionCard = ({ icon: Icon, label, description, href, badge = 0, gradient = 'from-blue-500 to-blue-600' }: ActionCardProps) => {
  const isMobile = useMobile();
  
  return (
    <Link 
      href={href}
      className="group relative block"
    >
      <GlassCard interactive className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-${gradient.split(' ')[0].replace('from-', '')}/25 transition-transform group-hover:scale-110 duration-300 flex-shrink-0`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{label}</h3>
            {!isMobile && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
            )}
          </div>
          {badge > 0 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
        {!isMobile && (
          <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
        )}
      </GlassCard>
    </Link>
  );
};

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    date: string;
    amount?: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative">
          {index < activities.length - 1 && (
            <div className="absolute left-5 sm:left-6 top-12 sm:top-14 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700" />
          )}
          <GlassCard className="p-3 sm:p-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
                  <activity.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white break-words">{activity.description}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {activity.amount && (
                      <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white whitespace-nowrap">
                        {activity.amount}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)} whitespace-nowrap`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      ))}
    </div>
  );
};

interface TransactionItemProps {
  transaction: {
    id: string;
    fee_type?: string;
    created_at: string;
    amount: number;
    status: string;
  };
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const isMobile = useMobile();
  
  const statusIcons = {
    completed: CheckCircle2,
    paid: CheckCircle2,
    pending: Clock,
    overdue: AlertTriangle,
    rejected: XCircle,
  };

  const StatusIcon = statusIcons[transaction.status?.toLowerCase()] || Info;

  return (
    <div className="flex items-center justify-between py-2 sm:py-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl transition-colors">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{transaction.fee_type || 'Payment'}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.created_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
        <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(transaction.amount)}</p>
        {!isMobile ? (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getStatusBadge(transaction.status)}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium capitalize whitespace-nowrap">{transaction.status}</span>
          </div>
        ) : (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(transaction.status)} whitespace-nowrap`}>
            {transaction.status}
          </span>
        )}
      </div>
    </div>
  );
};

interface AnnouncementBannerProps {
  announcement: {
    id: string;
    title: string;
    priority: string;
    content: string;
    created_at: string;
  };
}

const AnnouncementBanner = ({ announcement }: AnnouncementBannerProps) => {
  const priorityColors = {
    high: 'from-rose-500 to-pink-500',
    medium: 'from-amber-500 to-orange-500',
    low: 'from-blue-500 to-cyan-500',
  };

  type Priority = keyof typeof priorityColors;
  const gradient = priorityColors[announcement.priority as Priority] || priorityColors.low;

  return (
    <GlassCard gradient className={`p-4 sm:p-5 bg-gradient-to-r ${gradient}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
            <h3 className="font-semibold text-sm sm:text-base text-white truncate">{announcement.title}</h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white backdrop-blur-sm self-start sm:self-auto">
              {announcement.priority === 'high' ? 'Important' : 'Update'}
            </span>
          </div>
          <p className="text-white/90 text-xs sm:text-sm mb-2 break-words">{announcement.content}</p>
          <p className="text-white/70 text-xs">{formatDate(announcement.created_at)}</p>
        </div>
      </div>
    </GlassCard>
  );
};

interface EventCardProps {
  event: {
    id: string;
    title: string;
    event_date?: string;
    date?: string;
    location?: string;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const eventDate = new Date(event.event_date || event.date || '');
  
  return (
    <GlassCard className="p-3 sm:p-4">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="text-center min-w-[50px] sm:min-w-[60px] flex-shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {eventDate.toLocaleDateString('en-US', { day: 'numeric' })}
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{event.title}</h3>
          {event.location && (
            <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">
              {eventDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

interface ServiceIconProps {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const ServiceIcon = ({ icon: Icon, gradient }: ServiceIconProps) => (
  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
  </div>
);

interface ServiceTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  gradient: string;
  count?: number;
}

const ServiceTile = ({ icon, label, href, gradient, count = 0 }: ServiceTileProps) => (
  <Link 
    href={href}
    className="group block"
  >
    <GlassCard interactive className="p-2 sm:p-4">
      <div className="flex flex-col items-center text-center">
        <div className="transform group-hover:scale-110 transition-transform duration-300">
          <ServiceIcon icon={icon} gradient={gradient} />
        </div>
        <span className="mt-1 sm:mt-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">{label}</span>
        {count > 0 && (
          <span className="mt-0.5 sm:mt-1 text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            {count}
          </span>
        )}
      </div>
    </GlassCard>
  </Link>
);

interface EmergencyContactProps {
  contact: {
    name: string;
    number: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
  };
}

const EmergencyContact = ({ contact }: EmergencyContactProps) => (
  <a
    href={`tel:${contact.number}`}
    className="group block"
  >
    <GlassCard interactive className="p-3 sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br ${contact.gradient} shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <contact.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{contact.name}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{contact.number}</p>
        </div>
      </div>
    </GlassCard>
  </a>
);

interface TabType {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: TabType[];
  activeTab: string;
  onChange: (id: string) => void;
}

const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium shadow-md border border-gray-200 dark:border-gray-700"
        >
          <Menu className="h-4 w-4" />
          <span>{tabs.find(t => t.id === activeTab)?.label || 'Menu'}</span>
        </button>
        
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowMobileMenu(false)}
            />
            <GlassCard className="absolute right-0 mt-2 p-1 z-50 min-w-[200px]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onChange(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`
                      flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </GlassCard>
          </>
        )}
      </div>
    );
  }

  return (
    <GlassCard className="p-1 inline-flex">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
              ${isActive 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </GlassCard>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

interface StatsType {
  total_payments?: number;
  total_clearances?: number;
  total_complaints?: number;
}

interface ResidentType {
  id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  household_number?: string;
  purok?: string;
}

interface PaymentType {
  id: string;
  fee_type?: string;
  created_at: string;
  amount: number;
  status: string;
}

interface ClearanceType {
  id: string;
  clearance_type?: string;
  created_at: string;
  status: string;
}

interface ComplaintType {
  id: string;
  subject?: string;
  created_at: string;
  status: string;
}

interface AnnouncementType {
  id: string;
  title: string;
  priority: string;
  content: string;
  created_at: string;
}

interface EventType {
  id: string;
  title: string;
  event_date?: string;
  date?: string;
  location?: string;
}

interface PaymentSummaryType {
  total?: number;
}

export default function Dashboard({ 
  stats = {}, 
  announcements = [], 
  upcomingEvents = [], 
  paymentSummary = [],
  resident = {},
  recentPayments = [],
  pendingClearances = [],
  activeComplaints = []
}: {
  stats?: StatsType;
  announcements?: AnnouncementType[];
  upcomingEvents?: EventType[];
  paymentSummary?: PaymentSummaryType[];
  resident?: ResidentType;
  recentPayments?: PaymentType[];
  pendingClearances?: ClearanceType[];
  activeComplaints?: ComplaintType[];
}) {
  // State
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hooks
  const isMobile = useMobile();

  // Memoized data
  const safeStats = useMemo(() => ({
    totalPayments: stats?.total_payments || recentPayments?.length || 0,
    totalClearances: stats?.total_clearances || pendingClearances?.length || 0,
    totalComplaints: stats?.total_complaints || activeComplaints?.length || 0,
    pendingRequests: (pendingClearances?.length || 0) + (activeComplaints?.filter(c => c?.status === 'pending')?.length || 0)
  }), [stats, recentPayments, pendingClearances, activeComplaints]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: Clock },
  ], []);

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

  const emergencyContacts = useMemo(() => [
    { name: 'Police', number: '117', icon: Shield, gradient: 'from-blue-500 to-blue-600' },
    { name: 'Fire', number: '160', icon: Flame, gradient: 'from-rose-500 to-rose-600' },
    { name: 'Ambulance', number: '161', icon: Heart, gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Barangay', number: '(082) 123-4567', icon: Home, gradient: 'from-purple-500 to-purple-600' },
  ], []);

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
    const activities = [];
    
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

  // Handlers
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AppLayout>
      <Head title="Resident Dashboard" />

      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
      
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
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
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
            <MetricCard 
              title="Payments"
              value={safeStats.totalPayments}
              icon={Wallet}
              trend="+12%"
              trendUp={true}
            />
            <MetricCard 
              title="Clearances"
              value={safeStats.totalClearances}
              icon={FileCheck}
              trend="+8%"
              trendUp={true}
            />
            <MetricCard 
              title="Complaints"
              value={safeStats.totalComplaints}
              icon={AlertCircle}
              trend="+5%"
              trendUp={false}
            />
            <MetricCard 
              title="Pending"
              value={safeStats.pendingRequests}
              icon={Clock}
              trend="-3%"
              trendUp={true}
            />
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

            {/* Activity & Transactions */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Recent Activity */}
              <section className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                  <Link href="/resident/activity" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>
                <ActivityFeed activities={combinedActivities} />
              </section>

              {/* Recent Payments */}
              <section className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                  <Link href="/resident/payments" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>
                <GlassCard className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentPayments?.slice(0, 3).map((payment) => (
                    <TransactionItem key={payment.id} transaction={payment} />
                  ))}
                  {(!recentPayments || recentPayments.length === 0) && (
                    <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No transactions yet</p>
                  )}
                </GlassCard>
              </section>
            </div>

            {/* Announcements & Events */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Announcements */}
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

              {/* Upcoming Events */}
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
                {emergencyContacts.map((contact) => (
                  <EmergencyContact key={contact.name} contact={contact} />
                ))}
              </div>
            </section>

            {/* All Services */}
            <section className="space-y-2 sm:space-y-3 md:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">All Services</h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-1 sm:gap-2 md:gap-3">
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
              <Link 
                href="/portal/resident/clearances/create"
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-blue-500/25 w-full sm:w-auto"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                New Request
              </Link>
            </div>

            {/* Pending Clearances */}
            {pendingClearances?.length > 0 && (
              <GlassCard className="p-4 sm:p-6">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Pending Clearances</h3>
                <div className="space-y-2 sm:space-y-3">
                  {pendingClearances.slice(0, 3).map((clearance) => (
                    <GlassCard key={clearance.id} className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white break-words">
                            {clearance.clearance_type || 'Clearance Request'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                            {formatDate(clearance.created_at)}
                          </p>
                        </div>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getStatusBadge(clearance.status)} self-start sm:self-center`}>
                          {clearance.status}
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                {pendingClearances.length > 3 && (
                  <Link 
                    href="/resident/clearances"
                    className="block text-center mt-3 sm:mt-4 text-xs sm:text-sm text-blue-500 hover:text-blue-600"
                  >
                    View all {pendingClearances.length} requests
                  </Link>
                )}
              </GlassCard>
            )}

            {/* Document Services Grid */}
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Available Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {[
                { icon: FileText, label: 'Barangay Clearance', href: '/resident/clearances/create', gradient: 'from-blue-500 to-blue-600' },
                { icon: FileCheck, label: 'Certificate', href: '/resident/certificates', gradient: 'from-emerald-500 to-emerald-600' },
                { icon: Download, label: 'Download Forms', href: '/resident/forms', gradient: 'from-purple-500 to-purple-600' },
                { icon: Eye, label: 'View Records', href: '/resident/documents', gradient: 'from-amber-500 to-amber-600' },
              ].map((service) => (
                <ServiceTile key={service.label} {...service} />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'payments' && (
          <section className="space-y-4 sm:space-y-5 md:space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Payment Services</h2>

            {/* Payment Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-5">
              <MetricCard 
                title="Total Paid"
                value={totalPaid}
                icon={Wallet}
              />
              <MetricCard 
                title="Pending"
                value={recentPayments?.filter(p => p?.status === 'pending')?.length || 0}
                icon={Clock}
              />
              <MetricCard 
                title="Overdue"
                value={recentPayments?.filter(p => p?.status === 'overdue')?.length || 0}
                icon={AlertTriangle}
              />
            </div>

            {/* Recent Transactions */}
            <GlassCard className="p-4 sm:p-6">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Transactions</h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentPayments?.slice(0, 5).map((payment) => (
                  <TransactionItem key={payment.id} transaction={payment} />
                ))}
                {(!recentPayments || recentPayments.length === 0) && (
                  <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No transactions yet</p>
                )}
              </div>
            </GlassCard>

            {/* Payment Services */}
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-3 sm:mb-4">Payment Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {[
                { icon: CreditCard, label: 'Make Payment', href: '/resident/payments/create', gradient: 'from-blue-500 to-blue-600' },
                { icon: Receipt, label: 'View Receipts', href: '/resident/receipts', gradient: 'from-emerald-500 to-emerald-600' },
                { icon: Download, label: 'Download Summary', href: '/resident/payments/summary', gradient: 'from-purple-500 to-purple-600' },
                { icon: AlertCircle, label: 'Payment Status', href: '/resident/payments/status', gradient: 'from-amber-500 to-amber-600' },
              ].map((service) => (
                <ServiceTile key={service.label} {...service} />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="space-y-4 sm:space-y-5 md:space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Activity History</h2>

            {/* Activity Timeline */}
            <GlassCard className="p-4 sm:p-6">
              <ActivityFeed activities={combinedActivities} />
              {combinedActivities.length === 0 && (
                <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">No activities yet</p>
              )}
            </GlassCard>

            {/* History Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
              <MetricCard 
                title="Total"
                value={combinedActivities.length}
                icon={Clock}
              />
              <MetricCard 
                title="Payments"
                value={safeStats.totalPayments}
                icon={Wallet}
              />
              <MetricCard 
                title="Clearances"
                value={safeStats.totalClearances}
                icon={FileCheck}
              />
              <MetricCard 
                title="Complaints"
                value={safeStats.totalComplaints}
                icon={AlertCircle}
              />
            </div>
          </section>
        )}
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all z-40 group"
      >
        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </AppLayout>
  );
}