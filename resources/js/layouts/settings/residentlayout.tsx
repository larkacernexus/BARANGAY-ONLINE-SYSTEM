import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Shield, 
  Palette,
  Settings as SettingsIcon,
  Bell,
  Smartphone,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  History,
  Search,
  X,
  Command,
  Activity,
  LogIn,
  LogOut,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Filter,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';

// Extended type that includes description
type ExtendedNavItem = NavItem & {
  description?: string;
  badge?: string;
  disabled?: boolean;
  exact?: boolean;
  children?: Array<{
    title: string;
    href: string;
    icon?: React.ComponentType<any>;
  }>;
};

// Navigation items with Activities tab added
const settingsNavItems: ExtendedNavItem[] = [
  {
    title: 'Profile',
    href: '/residentsettings/profile',
    icon: User,
    description: 'Personal information & contact details',
    exact: true,
  },
  {
    title: 'Security',
    href: '/residentsettings/security',
    icon: ShieldCheck,
    description: 'Password & account security',
    exact: false,
    children: [
      {
        title: 'Password',
        href: '/residentsettings/security/password',
        icon: Lock,
      },
      {
        title: 'Two-Factor',
        href: '/residentsettings/security/two-factor',
        icon: Shield,
      },
    ]
  },
  {
    title: 'Preferences',
    href: '/residentsettings/preferences',
    icon: Bell,
    description: 'Notifications & display settings',
    exact: false,
    children: [
      {
        title: 'Appearance',
        href: '/residentsettings/preferences/appearance',
        icon: Palette,
      },
      {
        title: 'Notifications',
        href: '/residentsettings/preferences/notifications',
        icon: Bell,
      },
    ]
  },
  {
    title: 'Connected Devices',
    href: '/residentsettings/devices',
    icon: Smartphone,
    description: 'Manage linked devices & sessions',
    exact: true,
  },
  {
    title: 'Privacy',
    href: '/residentsettings/privacy',
    icon: Shield,
    description: 'Data & privacy settings',
    exact: true,
  },
  {
    title: 'Activities',
    href: '/residentsettings/activities',
    icon: Activity,
    description: 'View your account activity & audit logs',
    exact: true,
  },
];

// Search Item Type
type SearchResult = {
  id: string;
  title: string;
  description?: string;
  href: string;
  category: string;
  icon?: React.ComponentType<any>;
  keywords?: string[];
};

// Activity Item Type (keep this for type safety)
type ActivityItem = {
  id: string;
  type: 'login' | 'logout' | 'payment' | 'document' | 'profile' | 'security' | 'settings' | 'report' | 'announcement';
  action: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
  ip_address?: string;
  device?: string;
  location?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
};

// Props interface for the layout
interface SettingsLayoutProps extends PropsWithChildren {
  activities?: ActivityItem[];
  stats?: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    logins: number;
    payments: number;
    documents: number;
    audits: number;
    loginSuccess: number;
    loginFailed: number;
    paymentSuccess: number;
    paymentPending: number;
    paymentFailed: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    profile?: number;
    security?: number;
    settings?: number;
  };
}

// Helper functions
const isActivePath = (currentPath: string, itemHref: string, exact: boolean = true) => {
  if (exact) {
    return currentPath === itemHref || currentPath === `${itemHref}/`;
  }
  return currentPath.startsWith(itemHref);
};

const isAnyChildActive = (currentPath: string, children?: Array<{href: string}>) => {
  if (!children) return false;
  return children.some(child => isActivePath(currentPath, child.href, true));
};

// Search Modal Component
const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Searchable items from navigation
  const searchableItems: SearchResult[] = [
    { id: '1', title: 'Edit Profile', description: 'Update your personal information', href: '/residentsettings/profile', category: 'Profile', icon: User, keywords: ['name', 'email', 'phone', 'avatar'] },
    { id: '2', title: 'Change Password', description: 'Update your password', href: '/residentsettings/security/password', category: 'Security', icon: Lock, keywords: ['password', 'change', 'update', 'security'] },
    { id: '3', title: 'Two-Factor Authentication', description: 'Enable 2FA for extra security', href: '/residentsettings/security/two-factor', category: 'Security', icon: Shield, keywords: ['2fa', 'two factor', 'authentication', 'security'] },
    { id: '4', title: 'Appearance Settings', description: 'Customize theme and display', href: '/residentsettings/preferences/appearance', category: 'Preferences', icon: Palette, keywords: ['theme', 'dark', 'light', 'display', 'appearance'] },
    { id: '5', title: 'Notification Preferences', description: 'Manage your notifications', href: '/residentsettings/preferences/notifications', category: 'Preferences', icon: Bell, keywords: ['notifications', 'alerts', 'email'] },
    { id: '6', title: 'Connected Devices', description: 'View and manage devices', href: '/residentsettings/devices', category: 'Devices', icon: Smartphone, keywords: ['devices', 'sessions', 'active'] },
    { id: '7', title: 'Privacy Settings', description: 'Control your data privacy', href: '/residentsettings/privacy', category: 'Privacy', icon: Shield, keywords: ['privacy', 'data', 'share'] },
    { id: '8', title: 'Activity Log', description: 'View your account activity', href: '/residentsettings/activities', category: 'Activities', icon: Activity, keywords: ['activity', 'log', 'history', 'audit'] },
    { id: '9', title: 'Login History', description: 'See your recent logins', href: '/residentsettings/activities?tab=logins', category: 'Activities', icon: LogIn, keywords: ['login', 'signin', 'access'] },
    { id: '10', title: 'Payment History', description: 'View your payment records', href: '/residentsettings/activities?tab=payments', category: 'Activities', icon: DollarSign, keywords: ['payment', 'transaction', 'receipt'] },
  ];

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchableItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
    setResults(filtered);
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const updated = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    window.location.href = result.href;
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl"
      >
        <div className="bg-card rounded-lg border shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search settings... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-6 text-base"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {searchQuery ? (
              results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const Icon = result.icon || Search;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                          index === selectedIndex ? 'bg-primary/10' : 'hover:bg-muted'
                        )}
                      >
                        <div className={cn(
                          'p-2 rounded-md',
                          index === selectedIndex ? 'bg-primary/20' : 'bg-muted'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{result.title}</div>
                          {result.description && (
                            <p className="text-sm text-muted-foreground">{result.description}</p>
                          )}
                          <Badge variant="outline" className="mt-1 text-xs">
                            {result.category}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-muted-foreground/70">Try different keywords</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-medium text-muted-foreground">RECENT SEARCHES</span>
                      <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left"
                        >
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                <div>
                  <span className="text-xs font-medium text-muted-foreground px-2">SUGGESTIONS</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                      <Lock className="h-4 w-4" />
                      <span>Password</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                      <Activity className="h-4 w-4" />
                      <span>Activity Log</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-3 py-2 bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Log Component - Now receives activities from props
const ActivityLog = ({ activities = [], stats = {} }: { activities?: ActivityItem[], stats?: any }) => {
  const [filter, setFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [view, setView] = useState<'list' | 'compact'>('list');

  const getActivityIcon = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'payment':
        return status === 'failed' 
          ? <AlertTriangle className="h-4 w-4 text-red-500" />
          : <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'profile':
        return <User className="h-4 w-4 text-indigo-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'settings':
        return <SettingsIcon className="h-4 w-4 text-gray-500" />;
      case 'report':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'announcement':
        return <Bell className="h-4 w-4 text-pink-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: ActivityItem['status']) => {
    if (!status) return null;
    
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
      <Badge className={cn('text-xs', variants[status])}>
        {status}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter activities based on selected filter
  const filteredActivities = activities
    .filter(activity => filter === 'all' || activity.type === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Account Activity</h3>
          <Badge variant="secondary" className="ml-2">
            {activities.length} events
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Activity Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge 
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          All Activity
        </Badge>
        <Badge 
          variant={filter === 'login' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('login')}
        >
          Logins
        </Badge>
        <Badge 
          variant={filter === 'payment' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('payment')}
        >
          Payments
        </Badge>
        <Badge 
          variant={filter === 'document' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('document')}
        >
          Documents
        </Badge>
        <Badge 
          variant={filter === 'profile' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('profile')}
        >
          Profile
        </Badge>
        <Badge 
          variant={filter === 'security' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('security')}
        >
          Security
        </Badge>
        <Badge 
          variant={filter === 'settings' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('settings')}
        >
          Settings
        </Badge>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Time:</span>
        {['All time', 'Today', 'This week', 'This month', 'Custom'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range.toLowerCase())}
            className={cn(
              'px-2 py-1 rounded-md transition-colors',
              timeRange === range.toLowerCase() 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-muted text-muted-foreground'
            )}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Activity List - Now using real data */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'group relative rounded-lg border p-4 transition-all hover:shadow-md',
                activity.status === 'failed' && 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/10',
                activity.status === 'pending' && 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/10'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'p-2 rounded-full',
                  activity.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' :
                  activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  'bg-primary/10'
                )}>
                  {getActivityIcon(activity.type, activity.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{activity.action}</span>
                        {getStatusBadge(activity.status)}
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {activity.ip_address && (
                      <span className="flex items-center gap-1">
                        <span className="font-mono">{activity.ip_address}</span>
                      </span>
                    )}
                    {activity.device && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {activity.device}
                      </span>
                    )}
                    {activity.location && (
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        {activity.location}
                      </span>
                    )}
                    {activity.resource_id && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {activity.resource_id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Timeline Connector */}
              {index < filteredActivities.length - 1 && (
                <div className="absolute left-8 top-14 bottom-0 w-px bg-border" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No activities found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Activities will appear here when you perform actions
            </p>
          </div>
        )}
      </div>

      {/* Load More - Only show if there are more activities */}
      {activities.length > 10 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">
            Load More Activities
          </Button>
        </div>
      )}

      {/* Activity Summary - Using real stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.total || 0}</div>
          <div className="text-xs text-muted-foreground">Total Activities</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.successful || 0}</div>
          <div className="text-xs text-muted-foreground">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu = ({ 
  item, 
  currentPath,
  isActive,
  isChildActive
}: { 
  item: ExtendedNavItem;
  currentPath: string;
  isActive: boolean;
  isChildActive: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
          (isActive || isChildActive || isOpen)
            ? 'bg-primary/10 text-primary' 
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {item.badge}
          </Badge>
        )}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && item.children && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border bg-popover shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-2 border-b">
            <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{item.description}</p>
          </div>
          <div className="p-2">
            {item.children.map((child) => {
              const childActive = isActivePath(currentPath, child.href, true);
              const ChildIcon = child.icon;
              
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                    childActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4" />}
                  <div className="flex-1">
                    <div className="font-medium">{child.title}</div>
                  </div>
                  {childActive && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Navigation
const MobileNavigation = ({ 
  currentPath,
  onLinkClick 
}: { 
  currentPath: string;
  onLinkClick: () => void;
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const expanded: string[] = [];
    settingsNavItems.forEach(item => {
      if (item.children) {
        if (isActivePath(currentPath, item.href, item.exact) || 
            isAnyChildActive(currentPath, item.children)) {
          expanded.push(item.href);
        }
      }
    });
    return expanded;
  });

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(h => h !== href)
        : [...prev, href]
    );
  };

  return (
    <div className="lg:hidden border rounded-lg mt-2 mb-4">
      <nav className="p-2 space-y-1">
        {settingsNavItems.map((item) => {
          const isActive = isActivePath(currentPath, item.href, item.exact);
          const isChildActive = item.children ? isAnyChildActive(currentPath, item.children) : false;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.href);
          const Icon = item.icon;

          return (
            <div key={item.href} className="space-y-1">
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors',
                      (isActive || isChildActive) 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>

                  {isExpanded && item.children && (
                    <div className="ml-4 pl-4 space-y-1 border-l">
                      {item.children.map((child) => {
                        const childActive = isActivePath(currentPath, child.href, true);
                        const ChildIcon = child.icon;
                        
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onLinkClick}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              childActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted text-muted-foreground'
                            )}
                          >
                            {ChildIcon && <ChildIcon className="h-4 w-4" />}
                            <span className="flex-1">{child.title}</span>
                            {childActive && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              )}
            </div>
          );
        })}

        {/* Help Link */}
        <div className="pt-4 mt-4 border-t">
          <Link
            href="/help/settings"
            onClick={onLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default function SettingsLayout({ children }: PropsWithChildren) {
  const { url, props } = usePage();
  const currentPath = url;
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Get activities and stats from props
  const activities = (props as any).activities || [];
  const stats = (props as any).stats || {
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0
  };
  
  // Get current section for breadcrumb
  const currentSection = settingsNavItems.find(item => 
    isActivePath(currentPath, item.href, item.exact) || 
    (item.children && isAnyChildActive(currentPath, item.children))
  );

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      } else if (e.key === '/' && !showSearchModal) {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchModal]);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {/* Search Modal */}
        <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

        {/* Header with Settings Icon and Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2"
              onClick={() => setShowSearchModal(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search settings...</span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>

            {/* Mobile Search Button */}
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              onClick={() => setShowSearchModal(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                showMobileNav && "rotate-180"
              )} />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Desktop Navigation - Horizontal Tabs */}
        <nav className="hidden lg:flex items-center gap-1 flex-wrap">
          {settingsNavItems.map((item) => {
            const isActive = isActivePath(currentPath, item.href, item.exact);
            const isChildActive = item.children ? isAnyChildActive(currentPath, item.children) : false;
            const hasChildren = item.children && item.children.length > 0;
            const Icon = item.icon;

            if (hasChildren) {
              return (
                <DropdownMenu
                  key={item.href}
                  item={item}
                  currentPath={currentPath}
                  isActive={isActive}
                  isChildActive={isChildActive}
                />
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* Help Link */}
          <Link
            href="/help/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground whitespace-nowrap ml-auto"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Link>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {showMobileNav && (
          <MobileNavigation 
            currentPath={currentPath}
            onLinkClick={() => setShowMobileNav(false)}
          />
        )}

        {/* Breadcrumb for mobile */}
        <div className="lg:hidden flex items-center gap-2 text-sm mb-4">
          <span className="text-muted-foreground">Settings</span>
          {currentSection && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">{currentSection.title}</span>
            </>
          )}
        </div>

        {/* Main Content - NOW USING REAL DATA FROM SERVER */}
        <main className="mt-6">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-6">
              {currentPath.includes('/residentsettings/activities') ? (
                <ActivityLog activities={activities} stats={stats} />
              ) : (
                children
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              <span>Changes are saved automatically</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs">Secure connection</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="h-3 w-3 mr-1" />
                Quick search (⌘K)
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}