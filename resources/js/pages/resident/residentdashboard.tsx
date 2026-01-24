import AppLayout from '@/layouts/resident-app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
  CreditCard, 
  FileText, 
  AlertCircle, 
  Calendar, 
  Bell, 
  User, 
  MessageSquare,
  Clock,
  Phone,
  Home,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Download,
  Eye,
  MapPin,
  Plus,
  Search,
  Shield,
  Users,
  Sparkles,
  DollarSign,
  AlertTriangle,
  FileCheck,
  ClipboardList,
  Package,
  Receipt,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Create custom hooks for better separation of concerns
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

const useScrollVisibility = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowScrollTop(currentScrollY > 300);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { showScrollTop, lastScrollY };
};

const useSwipeNavigation = (tabs, activeTab, setActiveTab) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Breadcrumb items for the layout
const breadcrumbs = [
  { label: 'Dashboard', href: '/resident/dashboard' }
];

// Welcome messages based on time of day
const getWelcomeMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Safe utilities
const safeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const safeArray = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// Format date with caching for performance
const dateFormatter = new Intl.DateTimeFormat('en-US', { 
  month: 'short',
  day: 'numeric'
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return dateFormatter.format(date);
  } catch (error) {
    return 'N/A';
  }
};

// Status icon component
const StatusIcon = ({ status, className = "h-4 w-4 sm:h-5 sm:w-5" }) => {
  const statusStr = safeString(status).toLowerCase();
  
  const icons = {
    'completed': { Icon: CheckCircle, color: 'text-emerald-500' },
    'paid': { Icon: CheckCircle, color: 'text-emerald-500' },
    'approved': { Icon: CheckCircle, color: 'text-emerald-500' },
    'resolved': { Icon: CheckCircle, color: 'text-emerald-500' },
    'pending': { Icon: Clock, color: 'text-amber-500' },
    'unpaid': { Icon: Clock, color: 'text-amber-500' },
    'in-progress': { Icon: TrendingUp, color: 'text-blue-500' },
    'processing': { Icon: TrendingUp, color: 'text-blue-500' },
    'review': { Icon: TrendingUp, color: 'text-blue-500' },
    'rejected': { Icon: AlertTriangle, color: 'text-rose-500' },
    'cancelled': { Icon: AlertTriangle, color: 'text-rose-500' },
    'overdue': { Icon: AlertTriangle, color: 'text-rose-500' },
  };
  
  const { Icon = Clock, color = 'text-gray-400 dark:text-gray-500' } = icons[statusStr] || {};
  
  return <Icon className={`${className} ${color}`} />;
};

// Reusable card component
const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  padding = 'p-4 sm:p-6',
  border = true
}) => (
  <div className={`
    rounded-xl sm:rounded-2xl 
    bg-white dark:bg-gray-800 
    ${border ? 'border border-gray-200 dark:border-gray-700' : ''}
    ${padding}
    shadow-md sm:shadow-lg
    ${hoverable ? 'hover:shadow-xl transition-shadow duration-300' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// Reusable gradient button component
const GradientButton = ({ 
  children, 
  href, 
  onClick, 
  gradient = 'from-blue-600 to-purple-600',
  className = '',
  ...props
}) => {
  const Component = href ? Link : 'button';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 
        rounded-lg sm:rounded-xl 
        bg-gradient-to-r ${gradient}
        px-4 py-2.5 sm:px-5 sm:py-3 
        text-sm font-medium text-white 
        shadow-md sm:shadow-lg 
        hover:shadow-xl 
        transition-all 
        hover:scale-[1.02]
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

// Mobile tab navigation component
const MobileTabNav = ({ tabs, activeTab, setActiveTab }) => {
  const activeTabProgress = ((tabs.findIndex(t => t.id === activeTab) + 1) / tabs.length) * 100;
  
  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg 
                transition-all whitespace-nowrap min-w-[80px] 
                justify-center
                ${isActive
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:bg-white/10'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">{tab.label}</span>
              {isActive && (
                <span className="sr-only">Current tab</span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Active Tab Progress Indicator */}
      <div 
        className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden" 
        role="progressbar"
        aria-valuenow={activeTabProgress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${activeTabProgress}%` }}
        />
      </div>
    </div>
  );
};

// Desktop tab navigation component
const DesktopTabNav = ({ tabs, activeTab, setActiveTab }) => (
  <div className="mb-8" role="tablist">
    <div className="flex space-x-1 rounded-2xl bg-white dark:bg-gray-800 p-2 shadow-xl overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={isActive}
            className={`
              flex items-center gap-3 rounded-xl px-5 py-3 
              text-sm font-medium transition-all whitespace-nowrap
              ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

// Floating Action Button component
const FAB = ({ isMobile, showQuickActions, setShowQuickActions, quickActions, showScrollTop }) => {
  if (!isMobile) return null;
  
  return (
    <>
      {/* Main FAB - positioned differently based on scrollTop visibility */}
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          showScrollTop ? 'bottom-36 right-4' : 'bottom-24 right-4'
        }`}
        aria-label={showQuickActions ? "Close quick actions" : "Open quick actions"}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {showQuickActions ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Plus className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Quick Action Menu */}
      {showQuickActions && (
        <div className={`fixed z-40 space-y-3 ${
          showScrollTop ? 'bottom-48 right-4' : 'bottom-36 right-4'
        }`}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-800 p-3 shadow-2xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95 animate-slide-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
                onClick={() => setShowQuickActions(false)}
              >
                <div className={`rounded-lg p-2 ${action.gradient}`}>
                  <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium block">{action.label}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{action.description}</span>
                </div>
                {action.badge && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                    {action.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

// Tab Content Components
const OverviewTab = ({ statsCards, quickActions, combinedActivities, recentPayments, emergencyContacts }) => (
  <>
    {/* Stats Cards */}
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} hoverable>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <div className="mt-1 sm:mt-2 flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    stat.change.startsWith('+') 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md sm:shadow-lg`}>
                <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>

    {/* Quick Actions */}
    <div className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Frequent services</p>
        </div>
        <Link 
          href="/resident/services"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:gap-3 transition-all"
        >
          View all
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group block relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 p-3 sm:p-5 shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 border border-gray-100 dark:border-gray-700 active:scale-95"
            >
              <div className="relative mb-3 sm:mb-4">
                <div className={`h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl ${action.gradient} p-2.5 sm:p-3.5 shadow-md sm:shadow-lg group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
                  <Icon className="h-full w-full text-white" aria-hidden="true" />
                </div>
                {action.badge && (
                  <span className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-xs font-bold shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 group-hover:scale-105 sm:group-hover:scale-110 transition-transform">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                {action.label}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>

    <div className="grid gap-4 sm:gap-8 sm:grid-cols-2">
      {/* Recent Activity */}
      <Card>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Latest updates</p>
          </div>
          <Link 
            href="/resident/activity"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:gap-3 transition-all"
          >
            View all
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {combinedActivities.map((activity) => {
            const ActivityIcon = activity.icon || FileText;
            return (
              <div 
                key={activity.id} 
                className="group flex items-center gap-3 sm:gap-4 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 ${activity.bgColor} group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
                  <ActivityIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${activity.color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                        {activity.description}
                      </p>
                      <div className="mt-1 sm:mt-1.5 flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 capitalize px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                          {activity.type}
                        </span>
                        <span>•</span>
                        <span>{formatDate(activity.date)}</span>
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-4">
                      <StatusIcon status={activity.status} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Payments */}
      <Card>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent Payments</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Transaction history</p>
          </div>
          <Link 
            href="/resident/payments"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:gap-3 transition-all"
          >
            View all
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {recentPayments.length > 0 ? (
            recentPayments.slice(0, 3).map((payment) => (
              payment && (
                <div key={payment.id || payment._id || Math.random()} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-md sm:rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-2.5">
                          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                            {payment.fee_type || 'Barangay Fee'}
                          </p>
                          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg sm:text-2xl text-gray-900 dark:text-gray-100">
                        ₱{parseFloat(payment.amount || 0).toFixed(2)}
                      </p>
                      <div className="mt-1 sm:mt-2 flex items-center justify-end gap-1 sm:gap-2">
                        <StatusIcon status={payment.status} />
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${
                          payment.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' :
                          payment.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                          payment.status === 'overdue' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {payment.status || 'completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="inline-flex rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-3 sm:p-4 mb-3 sm:mb-4">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No payments yet</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment history will appear here</p>
            </div>
          )}
        </div>
      </Card>
    </div>

    {/* Emergency Contacts */}
    <div className="mt-6 sm:mt-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Emergency Contacts</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Important contacts for emergencies</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {emergencyContacts.map((contact) => {
          const ContactIcon = contact.icon;
          return (
            <button
              key={contact.name}
              onClick={() => window.location.href = `tel:${contact.number}`}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left bg-gradient-to-br ${contact.gradient} transition-all hover:scale-[1.02] active:scale-95 shadow-md sm:shadow-lg hover:shadow-xl`}
              aria-label={`Call ${contact.name}: ${contact.number}`}
            >
              <div className="relative z-10">
                <div className="mb-2 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <div className="rounded-md sm:rounded-lg bg-white/20 p-1.5 sm:p-2 backdrop-blur-sm">
                    <ContactIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/90">{contact.name}</p>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">{contact.number}</p>
                <p className="text-xs sm:text-sm text-white/70">{contact.description}</p>
              </div>
              <div className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Phone className="h-4 w-4 sm:h-6 sm:w-6 text-white/50" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </>
);

const DocumentsTab = ({ pendingClearances }) => (
  <div className="space-y-4 sm:space-y-8">
    {/* Header Card */}
    <Card border={false} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Document Services</h2>
          <p className="text-blue-100 text-xs sm:text-sm">Request clearances and manage documents</p>
        </div>
        <GradientButton 
          href="/resident/clearances/create"
          gradient="from-white to-white"
          className="text-blue-600"
        >
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          New Request
        </GradientButton>
      </div>
    </Card>

    {/* Pending Clearances */}
    {pendingClearances.length > 0 ? (
      <Card>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Pending Clearances</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Requests awaiting approval</p>
          </div>
          <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
            {pendingClearances.length} pending
          </span>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {pendingClearances.slice(0, 3).map((clearance) => (
            clearance && (
              <div key={clearance.id || clearance._id || Math.random()} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 sm:p-3">
                        <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                          {clearance.clearance_type || 'Clearance Request'}
                        </h3>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {clearance.purpose || 'No purpose specified'}
                        </p>
                        <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                            {clearance.status || 'pending'}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(clearance.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                    <Link 
                      href={`/resident/clearances/${clearance.id || clearance._id}`}
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-md sm:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors active:scale-95"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
        <Link 
          href="/resident/clearances"
          className="mt-4 sm:mt-6 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          View all clearance requests
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </Link>
      </Card>
    ) : (
      <Card>
        <div className="p-6 sm:p-12 text-center">
          <div className="mx-auto mb-4 sm:mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">No documents yet</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Request your first clearance certificate</p>
          <GradientButton 
            href="/resident/clearances/create"
            gradient="from-blue-600 to-blue-700"
            className="mt-4 sm:mt-6"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            Request Clearance
          </GradientButton>
        </div>
      </Card>
    )}

    {/* Document Services Grid */}
    <div>
      <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Document Services</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { 
            icon: FileText, 
            label: 'Request', 
            href: '/resident/clearances/create', 
            gradient: 'from-blue-500 to-blue-600',
            description: 'Get certificates'
          },
          { 
            icon: Download, 
            label: 'Forms', 
            href: '/resident/forms', 
            gradient: 'from-emerald-500 to-emerald-600',
            description: 'Printable docs'
          },
          { 
            icon: Eye, 
            label: 'Records', 
            href: '/resident/documents', 
            gradient: 'from-purple-500 to-purple-600',
            description: 'View files'
          },
          { 
            icon: FileCheck, 
            label: 'Track', 
            href: '/resident/clearances', 
            gradient: 'from-amber-500 to-amber-600',
            description: 'Monitor requests'
          },
        ].map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.label}
              href={service.href}
              className="group block relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 p-3 sm:p-5 shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 border border-gray-100 dark:border-gray-700 active:scale-95"
            >
              <div className={`mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.gradient} p-2 sm:p-3 shadow-md sm:shadow-lg group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
                <Icon className="h-full w-full text-white" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-1.5 line-clamp-1">
                {service.label}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);

const PaymentsTab = ({ recentPayments, paymentSummary }) => (
  <div className="space-y-4 sm:space-y-8">
    {/* Payment Overview */}
    <Card border={false} className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Payment Services</h2>
          <p className="text-emerald-100 text-xs sm:text-sm">View history and manage receipts</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-emerald-200">Total Paid</p>
            <p className="text-lg sm:text-2xl font-bold">
              ₱{paymentSummary.reduce((sum, p) => sum + parseFloat(p?.total || 0), 0).toFixed(2)}
            </p>
          </div>
          <GradientButton 
            href="/resident/payments"
            gradient="from-white to-white"
            className="text-emerald-600"
          >
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            View History
          </GradientButton>
        </div>
      </div>
    </Card>

    {/* Recent Payments */}
    {recentPayments.length > 0 ? (
      <Card>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent Payments</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Transaction history</p>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {recentPayments.slice(0, 3).map((payment) => (
            payment && (
              <div key={payment.id || payment._id || Math.random()} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className={`rounded-md sm:rounded-lg p-2 sm:p-3 ${
                        payment.status === 'paid' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                        payment.status === 'pending' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                        'bg-gradient-to-br from-rose-500 to-rose-600'
                      }`}>
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                          {payment.fee_type || 'Payment'}
                        </h3>
                        <div className="mt-1 sm:mt-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {formatDate(payment.payment_date)}
                          </span>
                          {payment.payment_method && (
                            <>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">•</span>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {payment.payment_method}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg sm:text-2xl text-gray-900 dark:text-gray-100">
                      ₱{parseFloat(payment.amount || 0).toFixed(2)}
                    </p>
                    <div className="mt-1 sm:mt-2 flex items-center justify-end gap-1 sm:gap-2">
                      <StatusIcon status={payment.status} />
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${
                        payment.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' :
                        payment.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                        payment.status === 'overdue' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {payment.status || 'completed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
        <Link 
          href="/resident/payments"
          className="mt-4 sm:mt-6 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          View all payment history
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </Link>
      </Card>
    ) : (
      <Card>
        <div className="p-6 sm:p-12 text-center">
          <div className="mx-auto mb-4 sm:mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">No payments yet</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payment history will appear here</p>
          <GradientButton 
            href="/resident/payments"
            gradient="from-emerald-600 to-emerald-700"
            className="mt-4 sm:mt-6"
          >
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            View Payments
          </GradientButton>
        </div>
      </Card>
    )}

    {/* Payment Summary */}
    {paymentSummary.length > 0 && (
      <Card>
        <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Payment Summary</h2>
        <div className="grid gap-3 sm:gap-4">
          {paymentSummary.map((summary, index) => (
            summary && (
              <div key={index} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`rounded-md sm:rounded-lg p-2 sm:p-3 ${
                    summary.type?.includes('annual') ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    summary.type?.includes('monthly') ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    'bg-gradient-to-br from-amber-500 to-amber-600'
                  }`}>
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                      {summary.type || 'Payment'}
                    </p>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {summary.count || 0} {summary.count === 1 ? 'payment' : 'payments'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₱{parseFloat(summary.total || 0).toFixed(2)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total amount</p>
                </div>
              </div>
            )
          ))}
        </div>
      </Card>
    )}

    {/* Payment Services */}
    <div>
      <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Payment Services</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { icon: CreditCard, label: 'History', href: '/resident/payments', gradient: 'from-blue-500 to-blue-600', description: 'View records' },
          { icon: DollarSign, label: 'Summary', href: '/resident/payments/summary', gradient: 'from-emerald-500 to-emerald-600', description: 'View totals' },
          { icon: Receipt, label: 'Receipts', href: '/resident/receipts', gradient: 'from-purple-500 to-purple-600', description: 'Get receipts' },
          { icon: AlertCircle, label: 'Status', href: '/resident/payments?status=overdue', gradient: 'from-rose-500 to-rose-600', description: 'Check status' },
        ].map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.label}
              href={service.href}
              className="group block relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 p-3 sm:p-5 shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 border border-gray-100 dark:border-gray-700 active:scale-95"
            >
              <div className={`mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.gradient} p-2 sm:p-3 shadow-md sm:shadow-lg group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
                <Icon className="h-full w-full text-white" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-1.5 line-clamp-1">
                {service.label}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);

const HistoryTab = ({ combinedActivities, realStats }) => (
  <div className="space-y-4 sm:space-y-8">
    {/* History Overview */}
    <Card border={false} className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Activity History</h2>
          <p className="text-gray-300 text-xs sm:text-sm">Complete timeline of your transactions</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-300">Total Activities</p>
            <p className="text-lg sm:text-2xl font-bold">
              {combinedActivities.length}
            </p>
          </div>
        </div>
      </div>
    </Card>

    {/* Combined History */}
    <Card>
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent History</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Your complete activity timeline</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
            <option>All time</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {combinedActivities.map((activity) => {
          const ActivityIcon = activity.icon || FileText;
          const activityUrl = `/resident/${activity.type}s/${safeString(activity.originalId)}`;
          return (
            <div key={activity.id} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 ${activity.bgColor} group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
                  <ActivityIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${activity.color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                        {activity.description}
                      </h3>
                      <div className="mt-1 sm:mt-2 flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 capitalize px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                          {activity.type}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      {activity.amount && (
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                            {activity.amount}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <StatusIcon status={activity.status} />
                        <span className="mt-0.5 sm:mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                      href={activityUrl}
                      className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View details
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link 
        href="/resident/activity"
        className="mt-4 sm:mt-6 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-95"
      >
        View complete history
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
      </Link>
    </Card>

    {/* Stats Summary */}
    <div>
      <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Summary</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { 
            title: 'Payments', 
            value: realStats.totalPayments, 
            gradient: 'from-blue-500 to-blue-600',
            icon: DollarSign
          },
          { 
            title: 'Clearances', 
            value: realStats.totalClearances, 
            gradient: 'from-emerald-500 to-emerald-600',
            icon: FileCheck
          },
          { 
            title: 'Complaints', 
            value: realStats.totalComplaints, 
            gradient: 'from-amber-500 to-amber-600',
            icon: AlertCircle
          },
          { 
            title: 'Pending', 
            value: realStats.pendingRequests, 
            gradient: 'from-purple-500 to-purple-600',
            icon: ClipboardList
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-md sm:rounded-lg bg-gradient-to-br ${stat.gradient} p-2 sm:p-3`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  </div>
);

// Announcements and Events Component
const AnnouncementsAndEvents = ({ announcements, upcomingEvents }) => (
  <div className="grid gap-4 sm:gap-8 mt-8 sm:mt-12 md:grid-cols-2">
    {/* Announcements */}
    {announcements.length > 0 && (
      <Card>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-3 shadow-md sm:shadow-lg">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Announcements</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">Latest updates</p>
            </div>
          </div>
          {announcements.some(a => a?.priority === 'high') && (
            <span className="h-2 w-2 sm:h-3 sm:w-3 animate-pulse rounded-full bg-rose-500 shadow-md sm:shadow-lg" aria-label="High priority announcements" />
          )}
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {announcements.slice(0, 2).map((announcement) => (
            announcement && (
              <div key={announcement.id || announcement._id || Math.random()} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
                <div className="mb-2 sm:mb-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                    announcement.priority === 'high' 
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    {announcement.priority === 'high' ? 'Important' : 'Update'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(announcement.created_at)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-1">
                  {announcement.title || 'Announcement'}
                </h3>
                {announcement.content && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {announcement.content}
                  </p>
                )}
              </div>
            )
          ))}
        </div>
        
        <Link 
          href="/resident-announcements"
          className="mt-4 sm:mt-6 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          View all announcements
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </Link>
      </Card>
    )}

    {/* Upcoming Events */}
    {upcomingEvents.length > 0 && (
      <Card>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 sm:p-3 shadow-md sm:shadow-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Events</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">Community activities</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {upcomingEvents.slice(0, 2).map((event) => {
            if (!event) return null;
            const eventDate = new Date(event.event_date || event.date);
            const today = new Date();
            const isToday = eventDate.toDateString() === today.toDateString();
            
            return (
              <div key={event.id || event._id || Math.random()} className="rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
                <div className="mb-2 sm:mb-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                    isToday 
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {isToday ? 'Today' : formatDate(eventDate)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {eventDate.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-1">
                  {event.title || 'Event'}
                </h3>
                {event.location && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" aria-hidden="true" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <Link 
          href="/resident/events"
          className="mt-4 sm:mt-6 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          View all events
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </Link>
      </Card>
    )}
  </div>
);

// All Services Component
const AllServices = ({ services }) => (
  <div className="mt-8 sm:mt-12">
    <div className="mb-6 text-center">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">All Services</h2>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Access all barangay services</p>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <Link
            key={service.label}
            href={service.href}
            className="group block relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 p-3 sm:p-5 shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 border border-gray-100 dark:border-gray-700 active:scale-95"
          >
            <div className={`mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.gradient} p-2 sm:p-3 shadow-md sm:shadow-lg group-hover:scale-105 sm:group-hover:scale-110 transition-transform`}>
              <Icon className="h-full w-full text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base text-center block line-clamp-1">
              {service.label}
            </span>
            {service.count > 0 && (
              <span className="absolute top-2 right-2 sm:top-4 sm:right-4 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-xs font-bold text-white shadow-md sm:shadow-lg">
                {service.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  </div>
);

// Main Dashboard Component
export default function Dashboard({ 
  stats = {}, 
  recentActivities = [], 
  announcements = [], 
  upcomingEvents = [], 
  paymentSummary = [],
  resident = {},
  recentPayments = [],
  pendingClearances = [],
  activeComplaints = []
}) {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Custom hooks
  const isMobile = useMobileDetection();
  const { showScrollTop } = useScrollVisibility();
  
  // Mobile tabs configuration
  const mobileTabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: Clock },
  ], []);
  
  // Swipe navigation
  const swipeHandlers = useSwipeNavigation(
    mobileTabs.map(t => t.id),
    activeTab,
    setActiveTab
  );
  
  // Safe data handling with useMemo for performance
  const safeAnnouncements = useMemo(() => safeArray(announcements), [announcements]);
  const safeUpcomingEvents = useMemo(() => safeArray(upcomingEvents), [upcomingEvents]);
  const safePaymentSummary = useMemo(() => safeArray(paymentSummary), [paymentSummary]);
  const safeRecentPayments = useMemo(() => safeArray(recentPayments), [recentPayments]);
  const safePendingClearances = useMemo(() => safeArray(pendingClearances), [pendingClearances]);
  const safeActiveComplaints = useMemo(() => safeArray(activeComplaints), [activeComplaints]);
  
  // Quick actions with real data
  const quickActions = useMemo(() => [
    { 
      icon: FileText, 
      label: 'Request Clearance', 
      href: '/resident/clearances/create', 
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      badge: safePendingClearances.length || stats?.pending_clearances || 0,
      description: 'Get barangay clearance'
    },
    { 
      icon: MessageSquare, 
      label: 'File Complaint', 
      href: '/resident/complaints/create', 
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      description: 'Report concerns',
      badge: safeActiveComplaints.length || stats?.active_complaints || 0
    },
    { 
      icon: FileCheck, 
      label: 'View Documents', 
      href: '/resident/documents', 
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      description: 'Access your files'
    },
    { 
      icon: User, 
      label: 'Profile', 
      href: '/resident/profile/edit', 
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      badge: resident?.profile_completion < 100 ? `${resident.profile_completion}%` : null,
      description: 'Update info'
    },
  ], [safePendingClearances.length, safeActiveComplaints.length, resident?.profile_completion, stats]);
  
  // Calculate stats from actual data
  const realStats = useMemo(() => ({
    totalPayments: stats?.total_payments || safeRecentPayments.length || 0,
    totalClearances: stats?.total_clearances || safePendingClearances.length || 0,
    totalComplaints: stats?.total_complaints || safeActiveComplaints.length || 0,
    pendingRequests: safePendingClearances.length + (safeActiveComplaints.filter(c => c?.status === 'pending')?.length || 0)
  }), [stats, safeRecentPayments.length, safePendingClearances.length, safeActiveComplaints.length]);
  
  // Combined activities
  const combinedActivities = useMemo(() => {
    const activities = [];
    
    // Add payment activities
    safeRecentPayments.slice(0, 2).forEach(payment => {
      if (payment) {
        activities.push({
          id: `payment-${payment.id || payment._id || Math.random()}`,
          type: 'payment',
          description: `Payment: ${payment.fee_type || 'barangay fee'}`,
          status: payment.status || 'completed',
          date: payment.created_at || payment.payment_date || new Date().toISOString(),
          amount: `₱${parseFloat(payment.amount || 0).toFixed(2)}`,
          icon: CreditCard,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          originalId: payment.id || payment._id
        });
      }
    });
    
    // Add clearance activities
    if (safePendingClearances.length > 0) {
      safePendingClearances.slice(0, 1).forEach(clearance => {
        if (clearance) {
          activities.push({
            id: `clearance-${clearance.id || clearance._id || Math.random()}`,
            type: 'clearance',
            description: clearance.clearance_type || 'Clearance request',
            status: clearance.status || 'pending',
            date: clearance.created_at || new Date().toISOString(),
            icon: FileCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            originalId: clearance.id || clearance._id
          });
        }
      });
    }
    
    // Add complaint activities
    if (safeActiveComplaints.length > 0) {
      safeActiveComplaints.slice(0, 1).forEach(complaint => {
        if (complaint) {
          activities.push({
            id: `complaint-${complaint.id || complaint._id || Math.random()}`,
            type: 'complaint',
            description: complaint.subject || 'Complaint filed',
            status: complaint.status || 'processing',
            date: complaint.created_at || new Date().toISOString(),
            icon: AlertCircle,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            originalId: complaint.id || complaint._id
          });
        }
      });
    }
    
    // Add default if no activities
    if (activities.length === 0) {
      activities.push(
        {
          id: 'welcome-1',
          type: 'welcome',
          description: 'Welcome to Barangay Portal',
          status: 'completed',
          date: new Date().toISOString(),
          icon: Sparkles,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          originalId: 'welcome'
        }
      );
    }
    
    return activities.slice(0, 3);
  }, [safeRecentPayments, safePendingClearances, safeActiveComplaints]);
  
  // Stats cards
  const statsCards = useMemo(() => [
    {
      title: 'Payments',
      value: realStats.totalPayments,
      change: '+12%',
      gradient: 'from-blue-500 to-blue-600',
      icon: DollarSign
    },
    {
      title: 'Clearances',
      value: realStats.totalClearances,
      change: '+8%',
      gradient: 'from-emerald-500 to-emerald-600',
      icon: FileCheck
    },
    {
      title: 'Complaints',
      value: realStats.totalComplaints,
      change: '+5%',
      gradient: 'from-amber-500 to-amber-600',
      icon: AlertCircle
    },
    {
      title: 'Pending',
      value: realStats.pendingRequests,
      change: '-3%',
      gradient: 'from-purple-500 to-purple-600',
      icon: ClipboardList
    }
  ], [realStats]);
  
  // Emergency contacts
  const emergencyContacts = useMemo(() => [
    { 
      name: 'Police', 
      number: '117', 
      gradient: 'from-blue-500 to-blue-600',
      icon: Shield,
      description: 'Emergency'
    },
    { 
      name: 'Fire', 
      number: '160', 
      gradient: 'from-red-500 to-red-600',
      icon: AlertTriangle,
      description: 'Fire dept'
    },
    { 
      name: 'Ambulance', 
      number: '161', 
      gradient: 'from-emerald-500 to-emerald-600',
      icon: Package,
      description: 'Medical'
    },
    { 
      name: 'Barangay', 
      number: '(082) 123-4567', 
      gradient: 'from-purple-500 to-purple-600',
      icon: Home,
      description: 'Local office'
    },
  ], []);
  
  // All services
  const allServices = useMemo(() => [
    { icon: FileText, label: 'Documents', href: '/resident/clearances', gradient: 'from-blue-500 to-blue-600', count: safePendingClearances.length },
    { icon: CreditCard, label: 'Payments', href: '/resident/payments', gradient: 'from-emerald-500 to-emerald-600', count: safeRecentPayments.length },
    { icon: Users, label: 'Family', href: '/resident/family', gradient: 'from-purple-500 to-purple-600' },
    { icon: AlertCircle, label: 'Complaints', href: '/resident/complaints', gradient: 'from-amber-500 to-amber-600', count: safeActiveComplaints.length },
    { icon: Download, label: 'Forms', href: '/resident/forms', gradient: 'from-indigo-500 to-indigo-600' },
    { icon: Eye, label: 'Records', href: '/resident/documents', gradient: 'from-rose-500 to-rose-600' },
    { icon: Shield, label: 'Security', href: '/resident/security', gradient: 'from-teal-500 to-teal-600' },
    { icon: Plus, label: 'More', href: '/resident/services', gradient: 'from-gray-500 to-gray-600' },
  ], [safePendingClearances.length, safeRecentPayments.length, safeActiveComplaints.length]);
  
  // Event handlers
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Tab content mapping
  const renderTabContent = useCallback(() => {
    const tabs = {
      overview: <OverviewTab 
        statsCards={statsCards}
        quickActions={quickActions}
        combinedActivities={combinedActivities}
        recentPayments={safeRecentPayments}
        emergencyContacts={emergencyContacts}
      />,
      documents: <DocumentsTab 
        pendingClearances={safePendingClearances}
      />,
      payments: <PaymentsTab 
        recentPayments={safeRecentPayments}
        paymentSummary={safePaymentSummary}
      />,
      history: <HistoryTab 
        combinedActivities={combinedActivities}
        realStats={realStats}
      />
    };
    
    return tabs[activeTab] || null;
  }, [activeTab, statsCards, quickActions, combinedActivities, safeRecentPayments, emergencyContacts, safePendingClearances, safePaymentSummary, realStats]);
  
  // Render different header based on device
  const renderHeader = () => {
    if (isMobile) {
      return (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm"
                aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-white line-clamp-1">
                  {getWelcomeMessage()}, {resident?.first_name || 'Resident'}!
                </h1>
                <div className="flex items-center text-xs text-blue-100">
                  <Home className="mr-1 h-3 w-3" aria-hidden="true" />
                  <span>HH#{resident?.household_number || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm"
              aria-label="Search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          
          <MobileTabNav 
            tabs={mobileTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          {/* Mobile Search Menu */}
          {showMobileMenu && (
            <div className="mt-4 animate-slide-down">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full rounded-xl border-0 bg-white/90 py-3 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white shadow-lg"
                  aria-label="Search services"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className={`rounded-lg p-2 ${action.gradient}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium block">{action.label}</span>
                        <span className="text-xs text-blue-100">{action.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="mb-8 rounded-b-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 pb-24 pt-6 shadow-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {getWelcomeMessage()}, {resident?.first_name || resident?.full_name?.split(' ')[0] || 'Resident'}!
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className="flex items-center text-sm text-blue-100">
                    <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>HH#{resident?.household_number || 'N/A'}</span>
                  </div>
                  {resident?.purok && (
                    <div className="flex items-center text-sm text-blue-100">
                      <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>Purok {resident.purok}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search services, documents..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full rounded-xl border-0 bg-white/90 py-3 pl-12 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white shadow-lg"
                  aria-label="Search services and documents"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-sm">
                  <div className={`rounded-lg bg-gradient-to-br ${stat.gradient} p-1.5 sm:p-2`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-100">{stat.title}</p>
                    <p className="text-base sm:text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Resident Dashboard" />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20 sm:pb-12"> {/* Increased padding-bottom for mobile */}
        {/* Header */}
        {renderHeader()}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 sm:-mt-16">
          {/* Desktop Tabs */}
          {!isMobile && (
            <DesktopTabNav 
              tabs={mobileTabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Tab Content */}
          <div 
            {...(isMobile ? swipeHandlers : {})}
            className="touch-pan-y"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
            {renderTabContent()}
          </div>

          {/* Announcements & Events */}
          {activeTab !== 'history' && (
            <AnnouncementsAndEvents 
              announcements={safeAnnouncements}
              upcomingEvents={safeUpcomingEvents}
            />
          )}

          {/* All Services Grid */}
          {!['payments', 'documents'].includes(activeTab) && (
            <AllServices services={allServices} />
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FAB 
        isMobile={isMobile}
        showQuickActions={showQuickActions}
        setShowQuickActions={setShowQuickActions}
        quickActions={quickActions}
        showScrollTop={showScrollTop}
      />

      {/* Back to Top Button - Fixed positioning */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 ${
            isMobile ? 'bottom-24 right-4' : 'bottom-6 right-6'
          }`}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Swipe Hint for Mobile */}
      {isMobile && !showQuickActions && !showScrollTop && (
        <div className="fixed bottom-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-black/20 backdrop-blur-sm px-4 py-2 text-xs text-white animate-pulse" aria-hidden="true">
            <span>←</span>
            <span>Swipe to switch tabs</span>
            <span>→</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// Add CSS animation for slide down
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}